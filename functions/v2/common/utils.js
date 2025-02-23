// ユーティリティ
class Utils {
    // エラーオブジェクトをJSON形式に変換
    Err2JSON(error) {
        const json = {};
        Object.getOwnPropertyNames(error).forEach((name) => {
            json[name] = error[name];
        });
        return json;
    }
}
const utils = new Utils();

module.exports = utils;
