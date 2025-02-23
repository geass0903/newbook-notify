const app = require("../../index.js");
const common = require("../common/common.js")
const logger = require("../common/logger.js");
const error = require("../common/error.js");

// テーブル名
const TABLE_NAME_M_USERS = "m_users";
const TABLE_NAME_M_KEYWORDS = "m_keywords";
const TABLE_NAME_M_PUSHTOKENS = "m_push_tokens";
const TABLE_NAME_T_NEWBOOKS = "t_newbooks";

// DBから新刊(指定ユーザ)の取得
exports.getNewBooks = async function(userId) {
    const newBooks = [];
    const tNewBooks = app.db.collection(TABLE_NAME_T_NEWBOOKS);
    logger.log("新刊一覧取得", userId);
    const querySnapshot = await tNewBooks.where("uid", "==", userId).get();
    querySnapshot.forEach((doc) => {
        const newbook = {
            "id": doc.id,
            "isbn": doc.data().isbn,
            "title": doc.data().title,
            "author": doc.data().author,
            "publisher": doc.data().publisher,
            "sales_date": doc.data().sales_date,
            "image_url": doc.data().image_url,
            "isnew": doc.data().isnew,
        };
        newBooks.push(newbook);
    });
    return newBooks;
}

exports.getFoundNewBooks = async function(userId) {
    const foundBooks = [];
    const tNewBooks = app.db.collection(TABLE_NAME_T_NEWBOOKS);
    logger.log("New一覧取得", userId);
    querySnapshot = await tNewBooks.where("uid", "==", userId).where("isnew", "==", true).get();
    await querySnapshot.forEach((doc) => {
        const newbook = {
            "id": doc.id,
            "isbn": doc.data().isbn,
            "title": doc.data().title,
            "author": doc.data().author,
            "publisher": doc.data().publisher,
            "sales_date": doc.data().sales_date,
            "image_url": doc.data().image_url,
            "isnew": doc.data().isnew,
        };
        foundBooks.push(newbook);
    });
    return foundBooks;
}

// DBからキーワード(指定ユーザ)の取得
exports.getKeywords = async function(userId) {
    const keywords = [];
    const mKeywords = app.db.collection(TABLE_NAME_M_KEYWORDS);
    logger.log("キーワード一覧取得", userId);
    const querySnapshot = await mKeywords.where("uid", "==", userId).get();
    querySnapshot.forEach((doc) => {
        const keyword = {
            "id": doc.id,
            "uid": doc.data().uid,
            "keyword": doc.data().keyword,
            "search_type": doc.data().search_type,
        };
        keywords.push(keyword);
    });
    return keywords;
}

// DBからキーワード(全て)の取得
exports.getAllKeywords = async function() {
    const keywords = [];
    const mKeywords = app.db.collection(TABLE_NAME_M_KEYWORDS);
    const querySnapshot = await mKeywords.get();
    querySnapshot.forEach((doc) => {
        const keyword = {
            "id": doc.id,
            "uid": doc.data().uid,
            "keyword": doc.data().keyword,
            "search_type": doc.data().search_type,
        };
        keywords.push(keyword);
    });
    return keywords;
}     

exports.checkKeyword = async function(userId, keyword, search_type) {
    const mKeywords = app.db.collection(TABLE_NAME_M_KEYWORDS);
    const querySnapshot = await mKeywords.where("uid", "==", userId).where("keyword", "==", keyword).where("search_type", "==", search_type).get();
    if (querySnapshot.size > 0) {
        const document = querySnapshot.docs[0];
        return document.id;
    }
    return null;
}

// 指定IDのキーワード更新
exports.setKeyword = async function(id, userId, keyword, searchType) {
    const mKeywords = app.db.collection(TABLE_NAME_M_KEYWORDS);
    if (id) {
        // 既存キーワード更新
        const itemRef = mKeywords.doc(id);
        const document = await itemRef.get();
        if (document.exists) {
            const updateKeyword = {
                "uid": userId,
                "keyword": keyword,
                "search_type": searchType,
            };
            logger.log("キーワード更新", JSON.stringify(updateKeyword));
            await itemRef.update(updateKeyword)
        } else {
            logger.log(error.ERRMSG_GET_KEYWORD_ERROR, id);
            throw new Error(error.ERRMSG_GET_KEYWORD_ERROR);
        }
    } else {
        // 新規キーワード登録
        const insertKeyword = {
            "uid": userId,
            "keyword": keyword,
            "search_type": searchType,
        };
        logger.log("キーワード登録", JSON.stringify(insertKeyword));
        const insert = await mKeywords.add(insertKeyword);
        id = insert.id;
    }
    return id;
}

// DBから指定IDのキーワードの削除
exports.deleteKeyword = async function(id) {
    if (id) {
        const mKeywords = app.db.collection(TABLE_NAME_M_KEYWORDS);        
        // キーワード削除
        const itemRef = mKeywords.doc(id);
        const document = await itemRef.get();
        if (document.exists) {
            logger.log("キーワード削除", id);
            await itemRef.delete();
        } else {
            logger.log(error.ERRMSG_GET_KEYWORD_ERROR, id);
            throw new Error(error.ERRMSG_GET_KEYWORD_ERROR);
        }
    } else {
        // 削除するキーワードのIDが指定されていない
        logger.log(error.ERRMSG_PARAM_ERROR);
        throw new Error(error.ERRMSG_PARAM_ERROR);
    }
    return true;
}

// 新刊の保存
exports.saveNewBooks = async function(newbooks, uid) {
    const tNewBooks = app.db.collection(TABLE_NAME_T_NEWBOOKS);
    for (const newbook of newbooks) {
        try {
            const querySnapshot = await tNewBooks.where("uid", "==", uid).where("isbn", "==", newbook.isbn).limit(1).get();
            if (querySnapshot.size > 0) {
                // データが既に存在する場合は更新
                const document = querySnapshot.docs[0];
                const itemRef = tNewBooks.doc(document.id);
                const update = {
                    "uid": uid,
                    "isbn": newbook.isbn,
                    "title": newbook.title,
                    "author": newbook.author,
                    "publisher": newbook.publisher,
                    "sales_date": newbook.sales_date,
                    "image_url": newbook.image_url,
                    "isnew": true,
                    "updated_at": new Date(),
                };
                await itemRef.update(update);
            } else {
                // 追加登録
                const add = {
                    "uid": uid,
                    "isbn": newbook.isbn,
                    "title": newbook.title,
                    "author": newbook.author,
                    "publisher": newbook.publisher,
                    "sales_date": newbook.sales_date,
                    "image_url": newbook.image_url,
                    "isnew": true,
                    "created_at": new Date(),
                    "updated_at": new Date(),
                };
                await tNewBooks.add(add);
            }
        } catch (err) {
            logger.log("saveNewBooks", utils.Err2JSON(err));
            throw new Error(error.ERRMSG_SAVE_NEW_BOOKS_ERROR);
        }
    }
    return true;
}

// ユーザ一覧の取得
exports.getUsers = async function() {
    const users = [];
    const mUsers = app.db.collection(TABLE_NAME_M_USERS);  
    const querySnapshot = await mUsers.get();
    querySnapshot.forEach((doc) => {
        const user = {
            "id": doc.id,
            "uid": doc.data().uid,
            "email": doc.data().email,
        }
        users.push(user);
    });
    return users;
}


// 新刊フラグの更新
exports.updateNewFlag = async function(newbookDate) {
    await app.db.runTransaction(async (trx) => {
        const tNewBooks = app.db.collection(TABLE_NAME_T_NEWBOOKS);
        const querySnapshot = await tNewBooks.where("created_at", "<", newbookDate).get();
        querySnapshot.forEach((doc) => {
            const itemRef = tNewBooks.doc(doc.id);
            trx.update(itemRef, {"isnew": false});
        });
    });
}

// 古い本の削除
exports.deleteOldBooks = async function(oldBookDate) {
    await app.db.runTransaction(async (trx) => {
        const tNewBooks = app.db.collection(TABLE_NAME_T_NEWBOOKS);
        const querySnapshot = await tNewBooks.where("updated_at", "<", oldBookDate).get();
        querySnapshot.forEach((doc) => {
            const itemRef = tNewBooks.doc(doc.id);
            trx.delete(itemRef);
        });
    });
}



// トークンの登録
exports.setPushToken = async function(userId, pushToken) {
    if (pushToken) {
        const mPushToken = app.db.collection(TABLE_NAME_M_PUSHTOKENS);
        let querySnapshot = await mPushToken.where("uid", "==", userId).where("push_token", "==", pushToken).get();
        if (querySnapshot.size > 0) {
            // 登録済
            logger.log(error.ERRMSG_PUSH_TOKEN_ALREADY_EXISTS, pushToken);
            return true;
        } else {
            // ユーザが登録しているプッシュトークンを取得
            querySnapshot = await mPushToken.where("uid", "==", userId).get();
            if (querySnapshot.size >= 2) {
                // 2件以上登録されている場合は古いデータを上書き(最新2件のみ保持)
                querySnapshot = await mPushToken.where("uid", "==", userId).orderBy("created_at", "asc").limit(1).get();
                const document = querySnapshot.docs[0];
                const itemRef = mPushToken.doc(document.id);
                const newPushToken = {
                  "uid": userId,
                  "push_token": pushToken,
                  "created_at": new Date(),
                };
                logger.log("トークン更新", newPushToken);
                await itemRef.update(newPushToken);
            } else {
                // 追加登録
                const newPushToken = {
                    "uid": userId,
                    "push_token": pushToken,
                    "created_at": new Date(),
                };
                logger.log("トークン登録", newPushToken);
                await mPushToken.add(newPushToken);
            }
        }
    } else {
        // 登録するプッシュトークンが指定されていない
        logger.log(error.ERRMSG_PARAM_ERROR);
        throw new Error(error.ERRMSG_PARAM_ERROR);
    }
}







