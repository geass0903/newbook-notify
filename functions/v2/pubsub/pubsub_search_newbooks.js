const app = require("../../index.js");
const config = require("../../config/config.js");
const db = require("../common/db_helper.js");
const utils = require("../common/utils.js");
const logger = require("../common/logger.js");
const error = require("../common/error.js");
const pubsub = require("../pubsub/pubsub.js");
const mail = require("../common/mail.js");
const {onMessagePublished} = require("firebase-functions/v2/pubsub");

// 検索タイプ
const TYPE_KEYWORD = "1";
const TYPE_TITILE = "2";
const TYPE_AUTHOR = "3";

const searchNewBooks = onMessagePublished(pubsub.TOPIC_NAME_SEARCH_NEWBOOKS, async (event) => {
    logger.log("searchNewBooks");
    const message = event.data.message;
    if (!message.data) {
        return 0;
    }

    try {
        const data = Buffer.from(message.data, "base64").toString();
        const props = JSON.parse(data);
        const keywords = props.keywords;

        if (keywords.length > 0) {
            const keyword = keywords.pop();
            // 検索
            try {
                const newbooks = await searchRakutenBooks(keyword.keyword);
                const matchbooks = [];
                newbooks.forEach((newbook) => {
                    const matched = isMatch(newbook, keyword.keyword, keyword.search_type);
                    if (matched) {
                        matchbooks.push(newbook);
                    }
                });
                // DB登録
                await db.saveNewBooks(matchbooks, keyword.uid);
            } catch (err) {
                logger.log(error.ERRMSG_RAKUTENBOOKSAPI_ERROR, utils.Err2JSON(err));
            }
        }

        if (keywords.length > 0) {
            // 次の検索処理
            logger.log("next SearchNewBooks");
            await pubsub.publishSearchNewBooks(keywords);
        } else {
            // 新刊フラグのクリア(作成日から1日経過)
            const newBookDate = new Date();
            newBookDate.setDate(newBookDate.getDate() - 1);
            await db.updateNewFlag(newBookDate);
            // 古いデータの削除(データ更新が1ヶ月以上なし)
            const oldBookDate = new Date();
            oldBookDate.setMonth(oldBookDate.getMonth() - 1);
            await db.deleteOldBooks(oldBookDate);

            // 新刊の通知
            const users = await db.getUsers();
            for (const user of users) {
                const foundBooks = await db.getFoundNewBooks(user.uid);
                if (foundBooks.length > 0) {
                    const sendEmailCommand = await mail.createSendEmailCommand(user.email, foundBooks);
                    await app.sesClient.send(sendEmailCommand);
                }
            }
            logger.log("complete SearchNewBooks");
        }
    } catch (err) {
        logger.log(error.ERRMSG_PUBSUB_SEARCH_NEWBOOKS_ERROR, utils.Err2JSON(err));
    }
    return 0;
});
module.exports = searchNewBooks;


// 新刊検索
async function searchRakutenBooks(searchWord) {
    let page = 1;
    let nextPage = false;
    const newBooks = [];
    // 新刊判定の基準日
    const basisDate = new Date();
    do {
        const responseJson = await callRakutenBooksAPI(searchWord, page);
        const pageCount = responseJson["pageCount"];
        if (pageCount > page) {
            nextPage = true;
        } else {
            nextPage = false;
        }
        const items = responseJson["Items"];
        items.forEach((item) => {
            const book = {
                "isbn": item["isbn"],
                "title": item["title"],
                "author": item["author"],
                "publisher": item["publisherName"],
                "sales_date": item["salesDate"],
                "image_url": item["largeImageUrl"],
            };
            // 新刊なら追加
            if (isNew(book, basisDate)) {
                newBooks.push(book);
            } else {
                // 新刊判定以外の本があった場合は次ページ以降を検索しない
                nextPage = false;
            }
        });
        page++;
    } while (nextPage);
    // 正常終了
    return newBooks;
}

// 楽天ブックスAPI呼び出し
async function callRakutenBooksAPI(searchWord, page) {
    const _msleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await _msleep(1500); // 呼び出し前に1.5秒待機(短時間での大量呼び出し回避)
    const url = config.RAKUTENBOOKS_API_URL +
    "&keyword=" + encodeURIComponent(searchWord) +
    "&page=" + page;
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

// 新刊判定
function isNew(book, basisDate) {
    const salesDate = book["sales_date"];
    let formattedDate = "";
    let date = new Date();
    try {
        let regexp = new RegExp(/([0-9]+)年([0-9]+)月([0-9]+)日.*$/ui);
        if (regexp.test(salesDate)) {
            formattedDate = salesDate.replace(regexp, "$1-$2-$3");
            date = new Date(formattedDate);
            return date.getTime() >= basisDate.getTime();
        }
        regexp = new RegExp(/([0-9]+)年([0-9]+)月.*$/ui);
        if (regexp.test(salesDate)) {
            formattedDate = salesDate.replace(regexp, "$1-$2-01");
            date = new Date(formattedDate);
            const lastDate = new Date(date.getFullYear(), date.getMonth()+1, 0);
            return lastDate.getTime() >= basisDate.getTime();
        }
        regexp = new RegExp(/([0-9]+)年.*$/ui);
        if (regexp.test(salesDate)) {
            formattedDate = salesDate.replace(regexp, "$1-12-31");
            date = new Date(formattedDate);
            return date.getTime() >= basisDate.getTime();
        }
    } catch (err) {
        logger.log("isNew", utils.Err2JSON(err));
    }
    return false;
}
  
// 一致判定
function isMatch(book, searchWord, searchType) {
    let match = false;
    switch (searchType) {
    case TYPE_KEYWORD:
        match = true;
        break;
    case TYPE_TITILE: {
        const title = book.title.replace(/\s+/g, "");
        match = title.indexOf(searchWord.replace(/\s+/g, "")) != -1;
        break;
    }
    case TYPE_AUTHOR: {
        const author = book.author.replace(/\s+/g, "");
        match = author.indexOf(searchWord.replace(/\s+/g, "")) != -1;
        break;
    }
    default:
    }
    return match;
}