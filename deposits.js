//var MongoClient = require('mongodb').MongoClient
//  , format = require('util').format;

var request = require("request");
var cheerio = require("cheerio");

request({
        uri: "http://www.vostbank.ru/khabarovsk/private/deposits"
    }, function (error, response, body) {
        var $ = cheerio.load(body);
        var str = "";
        var i = 0;
        $(".rbr").each(function () {

            var tmp = this;
            var title = tmp.children[0].next.children[3].next.next.children[1].children[0].data;
            var link = tmp.children[0].next.children[0].next.children[1].attribs.href;
            var cnt = 0;
            var childType;
            cnt = tmp.children[0].next.children[0].next.next.next.next.next.next.next.children.length;
            var desc = "";
            for (var id=0; id<cnt; id++) {
               childType = tmp.children[0].next.children[0].next.next.next.next.next.next.next.children[id].type;

                if (childType=="tag") {
                    if (desc=="") {
                        desc = tmp.children[0].next.children[0].next.next.next.next.next.next.next.children[id].children[0].data;
                    } else {
                        desc += "\\n" + tmp.children[0].next.children[0].next.next.next.next.next.next.next.children[id].children[0].data;
                        }
                };
            };
            if (str == "") {
                str = '[ { "title" : "' + title + '",' + '"link" : "' + link + '",' + '"desc" : "' + desc + '" }';
                i++;
            } else {
                str += ', { "title" : "' + title + '",' + '"link" : "' + link + '",' + '"desc" : "' + desc + '" }';
                i++;
            }
        });
        str += ' ]';
        var creditcards = JSON.parse(str);
    //    for (var card in creditcards) {
      //      updateDB(creditcards[card]);
        //};
});
    //return creditcards;
function updateDB(data) {
    MongoClient.connect('mongodb://127.0.0.1:27017/vexbot', function (err, db) {
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