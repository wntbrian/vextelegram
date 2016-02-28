var cont = require("./json/contacts.json");
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
var mongourl = "mongodb://127.0.0.1:27017/vexbot";

module.exports = {
    findProducts: function (p_collection, callback) {
        var resp = "";
        MongoClient.connect(mongourl, function (err, db) {
            if (err) {
                console.log(err)
            }
            else {
                var cursor = db.collection(p_collection).find().toArray(function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        resp = result;
                    }
                    db.close();
                    callback(resp);
                });
            }
            ;
        });
    }
,
    // возвращает один наседенный пункт
    findCity: function(cityName, callback) {
        MongoClient.connect(mongourl, function(err, db) {
            if (err) {
                console.log(err);
            }
            else {
                var cursor = db.collection('cities').find({name: cityName}).toArray(function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        if (result.length) {
                                callback("", result[0]);
                        }
                        else {
                            callback("К сожалению, я не знаю такого города", "");
                        }
                    };
                    db.close();
                })
            }
        });
    }
,
    SaveUserPlace: function (data) {
        MongoClient.connect(mongourl, function (err, db) {
            if (err) throw err;
            //console.log("Connected to Database");
            //simple json record

            var collection = db.collection('users');
            collection.updateOne({"userid": data.userid}, {
                $set: {
                    "place": data.place
                }
            }, {"upsert": true}, function (err) {
                if (err) throw err;
                db.close();
            });
        });
    }
,
    GetUserPlace: function(userid, callback) {
        MongoClient.connect(mongourl, function(err, db) {
            if (err) {
                console.log(err);
            }
            else {
                var cursor = db.collection('users').find({userid: userid}).toArray(function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        if (result.length) {
                                callback("", result[0].place);
                        }
                        else {
                            callback("NO_DATA_FOUND", "");
                        }
                    };
                    db.close();
                })
            }
        });
    }
,
    GetUserUrl: function(userID, callback) {
        require("./modules.js").GetUserPlace(userID, function(err, placesynonym) {
            if (err) {
                callback("");
            }
            else {
                callback(cont.bank_url + placesynonym);
            }
        })
    }
// END EXPORTMODULE
};

