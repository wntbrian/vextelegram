var cont = require("./json/contacts.json");
var request = require('request');
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
                            callback("В вашем населенном пункте нет отделения восточного банка, попробоуйте указать ближайший к вам крупный насленный пункт, с использованием команды /setplace", "");
                        }
                    }
                    db.close();
                })
            }
        });
    },
    findCityYandex: function(location, callback) {
        var url = 'https://geocode-maps.yandex.ru/1.x/?geocode='+location.longitude+','+location.latitude+'&format=json';
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var flag = false;
                var fbResponse = JSON.parse(body);
                for(var id in fbResponse.response.GeoObjectCollection.featureMember)
                {
                    if (fbResponse.response.GeoObjectCollection.featureMember[id].GeoObject.metaDataProperty.GeocoderMetaData.kind == "locality")
                    {
                        callback(fbResponse.response.GeoObjectCollection.featureMember[id].GeoObject.metaDataProperty.GeocoderMetaData.kind, fbResponse.response.GeoObjectCollection.featureMember[id].GeoObject.name);
                        flag = true;
                    }
                }
                if (!flag){
                    callback("К сожалению, я не знаю такого города", "");
                }
            } else {
                callback("К сожалению, я не знаю такого города", "");
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
    },
    curs_cb: function(callback) {
                var req = require('request');
                var cb;
                var url = 'http://query.yahooapis.com/v1/public/yql?q=select+*+from+yahoo.finance.xchange+where+pair+=+%22USDRUB,EURRUB%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
                request({url: url, json: true}, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        cb = JSON.parse(body);
                    } else {
                        cb = "";
                    }
                });
                callback(cb["query"]["results"]["rate"]);
    }
// END EXPORTMODULE
};

