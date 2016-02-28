var request = require("request");
var cheerio = require("cheerio");

module.exports = {
    get_curs: function (url, callback) {
        var f = function (url, curs) {
            request(
                {
                    uri: url
                },
                function (error, response, body) {
                    if (error) {
                        console.log("error: " + error)
                    }
                    else {
                        var $ = cheerio.load(body);
                        var cur_json = "";
                        var title = "";
                        $(".block-orient_currency").each(function () {
                                var tmp = this;
                                title = '"title" : "'+tmp.children[1].children[0].next.children[0].next.next.next.children[0].children[0].data + '"';
                                var cur_arr = tmp.children[1].children[0].next.children[0].next.next.next.children[2].next.children[0].children[0].children[1];
                                for (var i = 0; i < cur_arr.children.length; i++) {
                                    var cur = cur_arr.children[i];
                                    cur_json += '{ "name" : "' + cur.children[0].children[0].data +
                                        '",' + '"buy" : "' + cur.children[1].children[0].data +
                                        '",' + '"sell" : "' + cur.children[2].children[0].data + '" },';
                                }
                            }
                        );
                        if (cur_json) {
                            cur_json = "{" + title + ',"rates": [' + cur_json.substr(0, cur_json.length - 1) + "]}";
                            //console.log(cur_json);
                            callback("", JSON.parse(cur_json));
                        }
                        else {
                            callback("Для этого населенного пункта курсы не заданы", "");
                        }
                    }
                }
            )
        }
        var c;
        f(url, c);
    }
};
