
const RAKUTENBOOKS_API_URL = "https://app.rakuten.co.jp/services/api/BooksTotal/Search/20170404?" +
"applicationId=XXXX" + // ApplicationID
"&format=json" + // 検索結果をJSONフォーマットで受け取る
"&formatVersion=2" + // フォーマットバージョン 2
"&booksGenreId=001" + // ジャンル 001
"&hits=30" + // 検索件数30件
"&sort=-releaseDate" + // 発売日が新しい順にソート
"&filed=0" + // 検索範囲 広い
"&outOfStockFlag=1" // 在庫なしも表示
;

exports.RAKUTENBOOKS_API_URL = RAKUTENBOOKS_API_URL;

exports.SENDER_ADDRESS = "test@example.cp.jp";

exports.AUTH_KEY = "AUTH_KEY";