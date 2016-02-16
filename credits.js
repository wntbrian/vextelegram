var request = require("request");
var cheerio = require("cheerio");

request({
    uri: "http://www.vostbank.ru/khabarovsk/private/cards/credit",
}, function(error, response, body) {
    var $ = cheerio.load(body);
    var str = "";
    var i = 0;
    $(".views-field-title").each(function() {

        var link = this;
        // var desc = link.children[7].children[1].children[1].children[1].children[0].data;
        var desc = link.next.next.children[1].children[1].children[1].children[0].data;
        desc += "\\n"+link.next.next.children[1].children[1].children[3].children[0].data;
        desc += "\\n"+link.next.next.children[1].children[1].children[5].children[0].data;
        var text = link.children[1].children[0].data;
        var href = link.next.next.next.next.children[1].children[1].attribs.href;
        // var href = link.children[9].children[1].children[1].attribs.href;

        if (str == "") {
            str = "{ \""+i+"\" : { \"title\" : \""+ text + "\","+ "\"link\" : \""+ href + "\","+ "\"desc\" : \""+ desc + "\" }";
            i++;
        }else
        {
            str += ", \""+i+"\" : { \"title\" : \""+ text + "\","+ "\"link\" : \""+ href + "\","+ "\"desc\" : \""+ desc + "\" }";
            i++;
        }


    });
    str += " }";
    var creditcards = JSON.stringify(str);
});