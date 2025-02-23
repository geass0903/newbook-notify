const app = require("../../index.js");
const db = require("../common/db_helper.js");
const common = require("../common/common.js");
const utils = require("../common/utils.js");
const logger = require("../common/logger.js");
const error = require("../common/error.js");

// キーワード登録
const setKeyword = app.regionFunctions.https.onRequest(async (request, response) => {
    response = common.setAccessControl(response);
    if (!common.isAllowMethod(request, "POST")) {
        return response.send(JSON.stringify(common.createResponseBody(false, error.ERRMSG_METHOD_TYPE_ERROR)));
    }
    let userId = await common.getAuthenticatedUserId(request);
    if (userId == null) {
        return response.status(401).send(JSON.stringify(common.createResponseBody(false, error.ERRMSG_AUTHENTICATE_ERROR)));
    }
    try {
        const post = request.body;
        let id = post.id;
        const keyword = post.keyword;
        const searchType = post.search_type;
        id = await db.setKeyword(id, userId, keyword, searchType);
        let resBody = common.createResponseBody(common.R_SUCCESS);
        resBody["keyword"] = {
            "id": id,
            "keyword": keyword,
            "search_type": searchType,
        };
        return response.send(JSON.stringify(resBody));     
    } catch (err) {
        logger.log(error.ERRMSG_API_SET_KEYWORD_ERROR, utils.Err2JSON(err));
        return response.send(JSON.stringify(common.createResponseBody(common.R_FAILURE, error.ERRMSG_API_SET_KEYWORD_ERROR)));
    }
});
module.exports = setKeyword;
