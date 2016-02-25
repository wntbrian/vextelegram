var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;
var mongourl = "mongodb://127.0.0.1:27017/credits";


var findCreditCard = function(db, callback) {
  var cursor = db.collection('credits').find( ).toArray(function (err, result) {
    if (err) {
      console.log(err);
    } else if (result.length) {
      console.log('Found:', result);
    } else {
      console.log('No document(s) found with defined "find" criteria!');
    }
    //Close connection
    db.close();
  });
};
MongoClient.connect(mongourl, function(err, db) {
  findCreditCard(db, function() {
    db.close();
  });
});