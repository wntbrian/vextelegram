var rss_reader = require("./rssfeed.js");
var vost_news="http://www.vostbank.ru/news/feed/";
var vost_youtube="http://www.youtube.com/feeds/videos.xml?channel_id=UCXmCnhbOs5JaDmIKkldTBWA";
var news_json = rss_reader.rss(vost_news);
//var yt_json = rss_reader.rss(vost_youtube);
require("./rssfeed.js").rss(vost_youtube,function (json,err) {
    console.log(json);
});
require("./rssfeed.js").rss(vost_news,function (json,err) {
    console.log(json);
});


