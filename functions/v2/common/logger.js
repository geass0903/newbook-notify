// ログ
class Logger {
    log(msg, data) {
        try {
            let date = new Date();
            let dateStr = date.toLocaleString("ja-JP");
            let logText = dateStr + ":" + msg;
            if (data !== undefined) {
                if (typeof(data) == "string") {
                    logText = logText + "," + data;
                } else {
                    logText = logText + "," + JSON.stringify(data);
                }
            }
            console.log(logText);
        } catch(error) {
            const json = {};
            Object.getOwnPropertyNames(error).forEach((name) => {
                json[name] = error[name];
            });
            console.log(JSON.stringify(json))
        }
    }
}
const logger = new Logger();

module.exports = logger;
