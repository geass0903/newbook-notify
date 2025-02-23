const {PubSub} = require("@google-cloud/pubsub");
const pubsub = new PubSub();
const logger = require("../common/logger.js");

const TOPIC_NAME_START_SEARCH_NEWBOOKS = "startSearchNewBooks";
const TOPIC_NAME_SEARCH_NEWBOOKS = "searchNewBooks";

// トピック名
exports.TOPIC_NAME_START_SEARCH_NEWBOOKS = TOPIC_NAME_START_SEARCH_NEWBOOKS;
exports.TOPIC_NAME_SEARCH_NEWBOOKS = TOPIC_NAME_SEARCH_NEWBOOKS;


// 新刊検索のトピックにパブリッシュ
exports.publishSearchNewBooks = async function(keywords) {
    const topic = pubsub.topic(TOPIC_NAME_SEARCH_NEWBOOKS);
    const message = {
        "keywords": keywords,
    };
    const msgBuf = Buffer.from(JSON.stringify(message), "utf-8");
    const messageId = await topic.publishMessage({"data": msgBuf});
    logger.log(messageId);
}


// プッシュ通知のトピックにパブリッシュ
exports.publishPushNotification = async function(payload) {
    const topic = pubsub.topic(TOPIC_NAME_PUSH_NOTIFICATION);
    const message = {
        "payload": payload,
    };
    const msgBuf = Buffer.from(JSON.stringify(message), "utf-8");
    const messageId = await topic.publishMessage({"data": msgBuf});
    logger.log(messageId);
}
