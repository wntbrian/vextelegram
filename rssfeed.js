var feed = require("feed-read");


module.exports.rss = function () {
    var news = "";
    feed("http://www.vostbank.ru/news/feed/", function(err, articles) {
        if (err) throw err;
        // Each article has the following properties:
        //
        //   * "title"     - The article title (String).
        //   * "author"    - The author's name (String).
        //   * "link"      - The original article link (String).
        //   * "content"   - The HTML content of the article (String).
        //   * "published" - The date that the article was published (Date).
        //   * "feed"      - {name, source, link}
        //
        news = articles;
    });
    return news;
};