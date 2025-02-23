const admin = require("firebase-admin");
const functions = require("firebase-functions/v2");

const serviceAccount = require("./config/serviceAccountKey.json");

const DATABASE_URL = "https://newbook-nortify.firebaseio.com";
const FUNCTIONS_REGION = "asia-northeast1";

const { SESClient }  = require("@aws-sdk/client-ses");
const { fromIni } = require("@aws-sdk/credential-providers");
const SES_REGION = "ap-northeast-1";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: DATABASE_URL,
});

functions.setGlobalOptions({region:FUNCTIONS_REGION});

exports.regionFunctions = functions;
exports.db = admin.firestore();
exports.admin = admin;

// AWS SESクライアント
exports.sesClient = new SESClient({
    region: SES_REGION,
    credentials: fromIni({
        filepath: "config/credentials"
    })
});


const getNewBooks = require("./v2/api/api_get_newbooks.js");
const getKeywords = require("./v2/api/api_get_keywords.js");
const setKeyword = require("./v2/api/api_set_keyword.js");
const deleteKeyword = require("./v2/api/api_delete_keyword.js");
const testSendMail = require("./v2/api/api_test_sendmail.js");
const setKeywords = require("./v2/api/api_set_keywords.js");


const startSearchNewBooks = require("./v2/pubsub/pubsub_start_search_newbooks.js");
const searchNewBooks = require("./v2/pubsub/pubsub_search_newbooks.js");

module.exports = {
    getNewBooks,
    getKeywords,
    setKeyword,
    setKeywords,    
    deleteKeyword,
    startSearchNewBooks,
    searchNewBooks,
};
