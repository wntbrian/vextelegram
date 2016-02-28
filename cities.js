var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;

var cities = require("./json/cities.json");
for (var i in cities ){
    var reg = cities[i].regions;
    for (j in reg){
        var city = reg[j].cities;
        for (k in city){
            updateDB(city[k]);
        }
    }
};
function updateDB(data) {
    MongoClient.connect('mongodb://127.0.0.1:27017/vexbot', function (err, db) {
        if (err) throw err;
        //console.log("Connected to Database");
        //simple json record
        var collection = db.collection('cities');
        collection.updateOne({"name": data.name.toLowerCase()}, {
            $set: {
                "synonym": data.synonym
            }
        }, {"upsert": true}, function (err) {
            if (err) throw err;
            db.close();
        });
    });
};