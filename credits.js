var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;

var request = require("request");
var cheerio = require("cheerio");

request({
        uri: "http://www.vostbank.ru/khabarovsk/private/cards/credit"
    }, function (error, response, body) {
        var $ = cheerio.load(body);
        var str = "";
        var i = 0;
        $(".views-field-title").each(function () {

            var link = this;
            var desc = link.next.next.children[1].children[1].children[1].children[0].data;
            desc += "\\n" + link.next.next.children[1].children[1].children[3].children[0].data;
            desc += "\\n" + link.next.next.children[1].children[1].children[5].children[0].data;
            var text = link.children[1].children[0].data;
            var href = link.next.next.next.next.children[1].children[1].attribs.href;

            if (str == "") {
                str = '[ { "title" : "' + text + '",' + '"link" : "' + href + '",' + '"desc" : "' + desc + '" }';
                i++;
            } else {
                str += ', { "title" : "' + text + '",' + '"link" : "' + href + '",' + '"desc" : "' + desc + '" }';
                i++;
            }
        });
        str += ' ]';
        var creditcards = JSON.parse(str);
        for (var card in creditcards) {
            updateDB(creditcards[card]);
        };
});
    //return creditcards;
function updateDB(data) {
    MongoClient.connect('mongodb://127.0.0.1:27017/credits', function (err, db) {
        if (err) throw err;
        //console.log("Connected to Database");
        //simple json record
        var collection = db.collection('credits');
        collection.updateOne({"title": data.title}, {
            $set: {
                "link": data.link,
                "desc": data.desc
            }
        }, {"upsert": true}, function (err) {
            if (err) throw err;
            db.close();
        });
    });
};