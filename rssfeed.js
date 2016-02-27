var feed = require("feed-read");

module.exports = {
    rss: function (url, callback) {
        feed(url, function(err, articles) {
            // TODO разобраться throw err;  Error: Body is not RSS or ATOM
            if (err) {
                throw err;
            }
            if (typeof callback == "function") {
                callback(articles, err)
            }
        });
    }
};