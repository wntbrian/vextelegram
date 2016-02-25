var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;
var mongourl = "mongodb://127.0.0.1:27017/vexbot";


var findNearAtm = function(db,coord, callback) {
    db.collection('atm').find(
        {
            loc:
            { $near :
            {
                $geometry: { type: "Point",  coordinates: coord },
                $minDistance: 0,
                $maxDistance: 5000
            }
            }
        }
    ).toArray(function (err, result) {
        if (err) {
            console.log(err);
        } else if (result.length) {
            console.log(result[0].loc.coordinates);
            console.log(result[0].desc);
        } else {
            console.log('No document(s) found with defined "find" criteria!');
        }
        //Close connection
        db.close();
    });
};
var coord = [30.355158, 59.918843];

MongoClient.connect(mongourl, function(err, db) {
    findNearAtm(db, coord, function() {
    db.close();
  });
});