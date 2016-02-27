//require("./parse_curs.js").get_curs("https://www.vostbank.ru/khabarovsk/" ,function (json) {
//    console.log("begin");
//    var news_json = json;
//    console.log(news_json);
//    console.log("end.");
//});
//var request = require("request");
//request({
//    uri: "https://www.vostbank.ru/cities.json"
//}, function (error, response, body) {
//    console.log("test");
//}
//)

var cities = require("./json/cities.json");
for (var i in cities ){
    console.log(cities[i].name);
    var reg = cities[i].regions;
    for (j in reg){
        console.log(reg[j].name);
        var city = reg[j].cities;
        for (k in city){
            console.log(city[k].name);
            console.log(city[k].synonym);
        }
    }
    console.log("end "+i);
    console.log("end "+i);
    //url = "http://www.vostbank.ru/" + cities[i].url;
};