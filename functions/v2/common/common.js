const app = require("../../index.js");
const logger = require("../common/logger.js");
const error = require("../common/error.js");
const utils = require("../common/utils.js");
const config = require("../../config/config.js");

// レスポンス返却用
exports.R_FAILURE = "failed";
exports.R_SUCCESS = "success";

// Access-Controlの設定
exports.setAccessControl = function(response) {
  response.set("Access-Control-Allow-Origin", "https://newbook-notify.web.app");
  response.set("Access-Control-Allow-Origin", "https://newbook-notify.firebaseapp.com");
  response.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST"); // DELETEだけは拒否
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.set("Access-Control-Allow-Credentials", "true");
  return response;
}

// レスポンスボディの作成
exports.createResponseBody = function(issuccess, msg = null) {
  const body = {
      "result": issuccess,
      "msg": msg
  };
  return body;
}

// メソッドの確認
exports.isAllowMethod = function(request, method) {
    if (request.method == method) {
        return true;
    } else {
        data = {
            "allow": method,
            "request": request.method 
        }
        logger.log(error.ERRMSG_METHOD_TYPE_ERROR, data);
        return false;
    }
}

// リクエストの認証確認
exports.getAuthenticatedUserId = async function(request) {
  try {
    if (!request.headers.authorization) {
      logger.log(error.ERRMSG_NO_AUTHENTICATE_HEADER);
      return null;
    }
    const match = request.headers.authorization == config.AUTH_KEY;
    if (!match) {
      logger.log(error.ERRMSG_NO_AUTHENTICATE_HEADER);
      return null;
    }
    return "EYfyNDRcNthFUsX4THZQc2eK1zj2";

    //const match = request.headers.authorization.match(/^Bearer (.*)$/);
    //const idToken = match[1];
    //const decodedToken = await app.admin.auth().verifyIdToken(idToken);
    //let userId = decodedToken.uid;
    //return userId;
  } catch (error) {
    logger.log(error.ERRMSG_AUTHENTICATE_ERROR, utils.Err2JSON(error));
    return null;
  }
}
