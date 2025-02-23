const app = require("../../index.js");
const db = require("../common/db_helper.js");
const common = require("../common/common.js");
const utils = require("../common/utils.js");
const logger = require("../common/logger.js");
const error = require("../common/error.js");

// キーワードの削除
const deleteKeyword = app.regionFunctions.https.onRequest(async (request, response) => {
    response = common.setAccessControl(response);
    if (!common.isAllowMethod(request, "POST")) {
        return response.send(JSON.stringify(common.createResponseBody(false, error.ERRMSG_METHOD_TYPE_ERROR)));
    }
    const userId = await common.getAuthenticatedUserId(request);
    if (userId == null) {
        return response.status(401).send(JSON.stringify(common.createResponseBody(false, error.ERRMSG_AUTHENTICATE_ERROR)));
    }
    try {
        const post = request.body;
        const id = post.id;
        await db.deleteKeyword(id);
        return response.send(JSON.stringify(common.createResponseBody(common.R_SUCCESS)));
    } catch (err) {
        logger.log(error.ERRMSG_API_DELETE_KEYWORD_ERROR, utils.Err2JSON(err));
        return response.send(JSON.stringify(common.createResponseBody(common.R_FAILURE, error.ERRMSG_API_DELETE_KEYWORD_ERROR)));
    }
});
module.exports = deleteKeyword;
