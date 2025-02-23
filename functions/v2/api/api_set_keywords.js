const app = require("../../index.js");
const db = require("../common/db_helper.js");
const common = require("../common/common.js");
const utils = require("../common/utils.js");
const logger = require("../common/logger.js");
const error = require("../common/error.js");
const mail = require("../common/mail.js");

// メール送信テスト
const setKeywords = app.regionFunctions.https.onRequest(async (request, response) => {
    response = common.setAccessControl(response);
    if (!common.isAllowMethod(request, "POST")) {
      return response.send(JSON.stringify(common.createResponseBody(false, error.ERRMSG_METHOD_TYPE_ERROR)));
    }
    let userId = await common.getAuthenticatedUserId(request);
    if (userId == null) {
      return response.status(401).send(JSON.stringify(common.createResponseBody(false, error.ERRMSG_AUTHENTICATE_ERROR)));
    }
    try {
      const data = request.body['Data'];
      logger.log(data);
      const keywords = JSON.parse(data).keywords;
      for (const keyword of keywords) {
        logger.log(keyword.keyword);
        const id = await db.checkKeyword(keyword.uid, keyword.keyword, keyword.search_type);
        logger.log(id);
        await db.setKeyword(id, keyword.uid, keyword.keyword, keyword.search_type);
      }
      const resBody = common.createResponseBody(common.R_SUCCESS);
      return response.send(JSON.stringify(resBody));
    } catch (err) {
      logger.log(error.ERRMSG_UNKNOWN_ERROR, utils.Err2JSON(err));
      return response.send(JSON.stringify(common.createResponseBody(common.R_FAILURE, error.ERRMSG_UNKNOWN_ERROR)));
    }
});
module.exports = setKeywords;