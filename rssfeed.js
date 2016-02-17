var feed = require("feed-read");

module.exports = {
    rss: function (url, callback) {
        feed(url, function(err, articles) {
            if (err) throw err;
            if (typeof callback == "function") {
                callback(articles, err)
            }
        });
    }
};