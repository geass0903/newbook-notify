
const app = require("../../index.js");
const config = require("../../config/config.js");
const db = require("../common/db_helper.js");
const common = require("../common/common.js");
const utils = require("../common/utils.js");
const logger = require("../common/logger.js");
const error = require("../common/error.js");

const { SendEmailCommand }  = require("@aws-sdk/client-ses");



// メール表示用HTMLテーブル作成
const createTable = (foundBooks) => {
  // ソート
  foundBooks.sort(function(a,b){
    if (a.sales_date < b.sales_date) return -1;
    if (a.sales_date > b.sales_date) return 1;
    return 0;
  });

  let rows = "";
  foundBooks.forEach((book) => {
    const row = `
    <tr>
      <td><img src=${book.image_url}></td>
      <td>${book.title}<br>${book.author}</td>
      <td>${book.publisher}<br>${book.sales_date}</td>
    </tr>
    `;
    rows += row;
  });

  const table = `
  <table border="1">
    <tr>
      <th>書影</th>
      <th>タイトル<br>著者</th>
      <th>出版社<br>発売日</th>
    </tr>
    ${rows}
    </table>
  `;
  return table;
}


// AWS SES メッセージ生成
exports.createSendEmailCommand = async function(toAddress, foundBooks) {
  const subject = "新刊通知】新刊が見つかりました。";
  const table = createTable(foundBooks);
  const template = `
  <!DOCTYPE html>
  <html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
  </head>
  <body>
    ${table}
  </body>
  </html>
  `;

  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: [
        /* more items */
      ],
      ToAddresses: [
        toAddress,
        /* more To-email addresses */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: template,
        },
        Text: {
          Charset: "UTF-8",
          Data: template,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: config.SENDER_ADDRESS,
    ReplyToAddresses: [
      /* more items */
    ],
  });
};

