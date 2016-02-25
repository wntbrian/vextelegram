// Atm export to mongo
var fs = require('fs'),
  xml2js = require('xml2js');

var parser = new xml2js.Parser();
fs.readFile('atm.xml', function(err, data) {
  parser.parseString(data, function (err, result) {
    console.dir(result);
    console.log('Done');
    var ob = result["ymaps:ymaps"]["ymaps:GeoObjectCollection"]["0"]["gml:featureMember"];
    for (var id in ob) {
      var pos = ob[id]["ymaps:GeoObject"][0]["gml:Point"][0]["gml:pos"][0];
      var coord = pos.split(" ");
      var desc = ob[id]["ymaps:GeoObject"][0]["gml:description"][0];
      updateDB(coord,desc)
    }
  });
});
var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;

function updateDB(coord, desc) {
  MongoClient.connect('mongodb://127.0.0.1:27017/vexbot', function (err, db) {
    if (err) throw err;
    //console.log("Connected to Database");
    //simple json record
    var collection = db.collection('atm');
    collection.updateOne({"desc": desc}, {
      $set: {
        "coord": coord
      }
    }, {"upsert": true}, function (err) {
      if (err) throw err;
      db.close();
    });
  });
};