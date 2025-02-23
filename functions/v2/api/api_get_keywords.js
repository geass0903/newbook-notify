const app = require("../../index.js");
const db = require("../common/db_helper.js");
const common = require("../common/common.js");
const utils = require("../common/utils.js");
const logger = require("../common/logger.js");
const error = require("../common/error.js");

// キーワード一覧の取得
const getKeywords = app.regionFunctions.https.onRequest(async (request, response) => {
    response = common.setAccessControl(response);
    if (!common.isAllowMethod(request, "GET")) {
        return response.send(JSON.stringify(common.createResponseBody(false, error.ERRMSG_METHOD_TYPE_ERROR)));
    }
    const userId = await common.getAuthenticatedUserId(request);
    if (userId == null) {
        return response.status(401).send(JSON.stringify(common.createResponseBody(false, error.ERRMSG_AUTHENTICATE_ERROR)));
    }
    try {
        const keywords = await db.getKeywords(userId);
        const resBody = common.createResponseBody(common.R_SUCCESS);
        resBody["keywords"] = keywords;
        return response.send(JSON.stringify(resBody));
    } catch (err) {
        logger.log(error.ERRMSG_API_GET_KEYWORDS_ERROR, utils.Err2JSON(err));
        return response.send(JSON.stringify(common.createResponseBody(common.R_FAILURE, error.ERRMSG_API_GET_KEYWORDS_ERROR)));
    }
});
module.exports = getKeywords;
