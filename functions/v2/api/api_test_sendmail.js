const app = require("../../index.js");
const db = require("../common/db_helper.js");
const common = require("../common/common.js");
const utils = require("../common/utils.js");
const logger = require("../common/logger.js");
const error = require("../common/error.js");
const mail = require("../common/mail.js");

// メール送信テスト
const testSendMail = app.regionFunctions.https.onRequest(async (request, response) => {
    response = common.setAccessControl(response);
    if (!common.isAllowMethod(request, "GET")) {
      return response.send(JSON.stringify(common.createResponseBody(false, error.ERRMSG_METHOD_TYPE_ERROR)));
    }
    try {
      const users = await db.getUsers();
      for (const user of users) {
        const foundBooks = await db.getFoundNewBooks(user.uid);
        if (foundBooks.length > 0) {
          const sendEmailCommand = await mail.createSendEmailCommand(user.email, foundBooks);
          await app.sesClient.send(sendEmailCommand);
        }
      }
      const resBody = common.createResponseBody(common.R_SUCCESS);
      return response.send(JSON.stringify(resBody));
    } catch (err) {
      logger.log(error.ERRMSG_TEST_SEND_MAIL, utils.Err2JSON(err));
      return response.send(JSON.stringify(common.createResponseBody(common.R_FAILURE, error.ERRMSG_TEST_SEND_MAIL)));
    }
});
module.exports = testSendMail;