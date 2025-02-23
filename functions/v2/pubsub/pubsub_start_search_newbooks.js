const app = require("../../index.js");
const db = require("../common/db_helper.js");
const utils = require("../common/utils.js");
const logger = require("../common/logger.js");
const error = require("../common/error.js");
const pubsub = require("../pubsub/pubsub.js");
const {onMessagePublished} = require("firebase-functions/v2/pubsub");

// 新刊検索のバッチスタート


const startSearchNewBooks = onMessagePublished(pubsub.TOPIC_NAME_START_SEARCH_NEWBOOKS, async (event) => {
    logger.log("startSearchNewBooks");
    logger.log(JSON.stringify(event));

    const message = event.data.message;
    if (!message.data) {
        return 0;
    }
    try {
        const data = Buffer.from(message.data, "base64").toString();
        const props = JSON.parse(data);
        const startFlag = props.startFlag;
        if (startFlag) {
            const keywords = await db.getAllKeywords();
            await pubsub.publishSearchNewBooks(keywords);
        }
    } catch (err) {
        logger.log(error.ERRMSG_PUBSUB_START_SEARCH_NEWBOOKS_ERROR, utils.Err2JSON(err));
    }
    return 0;
});
module.exports = startSearchNewBooks;
