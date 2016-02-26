var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;

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
                    var nStr = tmp.children[0].next.children[0].next.next.next.next.next.next.next.children[id].children.length;
                    var tStr = "";
                    for (iStr=0; iStr<nStr; iStr++){
                        if (tmp.children[0].next.children[0].next.next.next.next.next.next.next.children[id].children[iStr].type=="text") {
                            tStr +=tmp.children[0].next.children[0].next.next.next.next.next.next.next.children[id].children[iStr].data
                        }
                    }
                    desc += tStr;
//                    if (desc=="") {
//                        desc = tmp.children[0].next.children[0].next.next.next.next.next.next.next.children[id].children[0].data;
//                    } else {
//                        desc += "\\n" + tmp.children[0].next.children[0].next.next.next.next.next.next.next.children[id].children[0].data;
//                        }
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
        var json_splitted = str.split("\n                ");
        var json = "";
        for(var id in json_splitted)
        {
            json += json_splitted[id];
        }
        var deposit = JSON.parse(json);
        for (var id2 in deposit) {
            updateDB(deposit[id2]);
        };
});
    //return creditcards;
function updateDB(data) {
    MongoClient.connect('mongodb://127.0.0.1:27017/vexbot', function (err, db) {
        if (err) throw err;
        //console.log("Connected to Database");
        //simple json record
        var collection = db.collection('deposit');
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