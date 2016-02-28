var TelegramBot = require('node-telegram-bot-api');
var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;
var feed = require("feed-read");

var menu = require("./json/menu.json");
var cont = require("./json/contacts.json");

var token = process.env.bottoken;
var mongourl = "mongodb://127.0.0.1:27017/vexbot";
var options = {
  webHook: {
    port: 8080
    //key: __dirname+'/key.pem',
    //cert: __dirname+'/crt.pem'
  }
};
////
require("./credits.js");
require("./deposits.js");
require("./test.js");
var news_json;
var yt_json;
require("./rssfeed.js").rss(cont.rss.youtube_channel,function (json,err) {
  yt_json = json;
});
require("./rssfeed.js").rss(cont.rss.news_feed ,function (json,err) {
  news_json = json;
});
///
var twittermsg = "";
var Twitter = require('twitter');
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});
client.get('statuses/user_timeline', { screen_name : "vostbank", count : 10 }, function(error, tweets, response){
  if(error) throw error;
  twittermsg = tweets;
  //console.log(response);  // Raw response object.
});
///

function randomInt (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}
var bot = new TelegramBot(token, options);
bot.setWebHook(process.env.webhookurl+"/"+token);

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});

bot.on('message', function (msg) {
  var chatId = msg.chat.id;
  var commands = require("./json/commands.json");
  if ( typeof msg.reply_to_message == "undefined") {
    if (typeof msg.text !== "undefined") {
      switch (msg.text) {
        case commands.start:
          vb_start(msg);
          break;
        case commands.menu:
          vb_menu(msg);
          break;
        case commands.atm:
          vb_near(msg,"atm");
          break;
        case commands.office:
          vb_near(msg,"office");
          break;
        case commands.contact:
          vb_contacts(msg);
          break;
        case commands.sms:
          vb_sms(msg);
          break;
        case commands.news:
            vb_random_news(msg);
            break;
        case commands.youtube:
          vb_youtube(msg);
          break;
        case commands.twitter:
          vb_twitter(msg);
          break;
        case commands.curs:
            //TODO курсы ЦБ http://cbr.ru/
          vb_curs2(msg);
          break;
        case commands.products:
          vb_products(msg);
          break;
        case commands.cr_card:
          vb_credit_cards(msg);
          break;
        case commands.deposit:
          vb_deposits(msg);
          break;
        case commands.bonus:
          vb_bonus(msg);
          break;
        default:
          bot.sendMessage(chatId, "Для открытия стартового меню наберите /start");
      }
    }
  }
    // photo can be: a file path, a stream or a Telegram file_id
    //var photo = 'cat.jpg';

    //bot.sendPhoto(chatId, photo, {caption: 'Lovely kittens'});
});

function vb_start(msg){
    var resp = "Привет, меня зовут тестовый *Восточный БОТ* :) буду рад помочь!";
    bot.sendMessage(msg.from.id,resp,menu.main);
}

function vb_menu(msg){
    var resp = "Пожалуйста, выберите пункт меню";
    bot.sendMessage(msg.from.id,resp,menu.main);
}

function vb_contacts(msg){
    var resp = "";
    for (var i in cont.telephones ){
        resp += cont.telephones[i].title + " " + cont.telephones[i].numb + "\n";
    };
    resp += "\n";
    for (var i in cont.main_url ){
        resp += "• [" + cont.main_url[i].title + "](" + cont.main_url[i].link + ")\n";
    };
    resp += "\n*Мы в социальных сетях*\n"
    for (var i in cont.social_url ){
        resp += "• [" + cont.social_url[i].title + "](" + cont.social_url[i].link + ")\n";
    };
    bot.sendMessage(msg.from.id,resp,menu.main);
}

function vb_products(msg){
    var fromId = msg.from.id;
    var resp = "Что вас интересует?";
    bot.sendMessage(fromId,resp,menu.products);
}

function vb_credit_cards(msg) {
    findProducts("credits",function(resp) {
        bot.sendMessage(msg.from.id, resp, menu.products)
    });
}

function vb_deposits(msg) {
    findProducts("deposit",function(resp) {
        bot.sendMessage(msg.from.id, resp, menu.products)
    });
}

function vb_deposits2(msg) {
    findProducts("deposit",function(resp) {
        bot.sendMessage(msg.from.id, resp, menu.products)
    });
}

function vb_bonus(msg){
  var bonuses = require("./json/bonus.json");
  var resp = "";
  for (var atr in bonuses){
        resp += "["+bonuses[atr].title+"]("+bonuses[atr].link+")\n"+bonuses[atr].desc+"\n";
    };
  bot.sendMessage(msg.from.id,resp,menu.none);
}

function vb_sms(msg){
    var sms_codes = require("./json/sms_codes.json");
    var resp = "";
    sms_codes.info;
    for (var i in sms_codes.title ){
        resp += sms_codes.title[i] + "\n";
    };
    resp += "\n";
    for (var i in sms_codes.codes ){
        resp += "• " + sms_codes.codes[i].title + "\n  " + sms_codes.codes[i].text + "\n";
    };
    bot.sendMessage(msg.from.id,resp,menu.none);
}

function vb_near(msg, p_type) {
    var fromId = msg.from.id;
    bot.sendMessage(msg.from.id, 'Пожалуйста, отправьте свое местоположение', menu.reply)
        .then(function (sended) {
            var chatId = sended.chat.id;
            var messageId = sended.message_id;
            bot.onReplyToMessage(chatId, messageId, function (message) {
                var tmp_loc;
                if (typeof message.location == "undefined") {
                    tmp_loc = [30.35515, 59.91884];
                };
                findNear(tmp_loc, p_type, function (err, loc) {
                    if (err){
                        console.log(err);
                    }
                    else {
                        switch (p_type) {
                            case "atm" :
                                var txt = "";
                                txt = "Расположение ближайшего банкомата: *" + loc.desc;
                                txt += "*, находится в " + loc.distance + " метрах";
                                bot.sendMessage(fromId, txt, menu.main);
                                bot.sendLocation(fromId, loc.coordX, loc.coordY, menu.main);
                                break;
                            case "office":
                                parse_office_desc(loc.desc, function(txt) {
                                    txt = "*Ближайшее отделение находится в " + loc.distance + " метрах*\n" +
                                        "*Режим работы:*" + txt;
                                    bot.sendMessage(fromId, txt, menu.main);
                                    bot.sendLocation(fromId, loc.coordX, loc.coordY, menu.main);
                                });
                                break;
                        };
                     };
                });
            });
        });
    // TODO расширить список банкоматов на 2 или 3
};

var parse_office_desc = function (desc, callback) {
    var str_arr = desc.split(",");
    var ret = "";
    for (i in str_arr) {
        ret += str_arr[i].replace("Касса:","\n*Касса*\n").replace("Перерыв:","\n*Перерыв*\n").replace("Отделение:","\n")+"\n";
    }
    callback(ret);
}

function vb_random_news(msg) {
    switch (randomInt(0,9)) {
        case 0:
        case 1:
        case 2:
            vb_twitter(msg);
            break;
        case 3:
        case 4:
        case 5:
            vb_youtube(msg);
            break;
        case 6:
        case 7:
        case 8:
        default:
            vb_news(msg);
    };
};

function vb_twitter(msg){
  var resp = "twitter";
  resp = twittermsg[randomInt(0,10)].text;
  bot.sendMessage(msg.from.id,resp,menu.main);
}

function vb_news(msg){
  var resp = "новости";
  var i = randomInt(0,news_json.length-1);
  resp = news_json[i].title+"\n"+news_json[i].link;
  bot.sendMessage(msg.from.id,resp,menu.main);
}

function vb_youtube(msg){
    var resp = "youtube";
    var i = randomInt(0,yt_json.length-1);
    resp = yt_json[i].title+"\n"+yt_json[i].link;
    bot.sendMessage(msg.from.id,resp,menu.main);
}

var findProducts = function(p_collection, callback) {
    var resp = "";
    MongoClient.connect(mongourl, function(err, db) {
        if (err) {
            console.log(err)
        }
        else {
            var cursor = db.collection(p_collection).find().toArray(function (err, result) {
                if (err) {
                    console.log(err);
                }
                else {
                    if (result.length) {
                        for (var atr in result) {
                            resp += "/"+p_collection + atr + " [" + result[atr].title.trim() + "]("+cont.bank_khb + result[atr].link.trim() + ")\n";
                        }
                    }
                    else {
                        resp = "По вашему запросу ничего не найдено :-(";
                    }
                }
                db.close();
                callback(resp);
            });
        };
    });
};

var findNear = function(coord, p_type, callback) {
    var resp;
    if (typeof coord == "undefined") {
        callback("Не переданы координаты", resp);
    }
    else {
        MongoClient.connect(mongourl, function (err, db) {
            if (err) {
                console.log(err);
            }
            else {
                db.collection(p_type).aggregate([
                    {
                        "$geoNear": {
                            "near": {
                                "type": "Point",
                                "coordinates": coord
                            },
                            "distanceField": "distance",
                            "maxDistance": 5000,
                            "spherical": true,
                            "query": {"loc.type": "Point"}
                        }
                    },
                    {
                        "$sort": {"distance": 1} // Sort the nearest first
                    }
                ], function (err, result) {
                    if (err) {
                        console.log(err);
                        db.close();
                        callback(err, resp);
                    }
                    else {
                        if (result.length) {
                            resp = {"desc": result[0].desc,
                                    "distance": result[0].distance.toFixed(0),
                                    "coordX": result[0].loc.coordinates[1],
                                    "coordY": result[0].loc.coordinates[0]};
                        }
                        else {
                            resp = {"desc": "К сожалению, поблизости ничего не найдено"};
                        }
                        console.log(resp);
                        db.close();
                        callback("",resp);
                    };
                });
            }
        });
   }
};

//var findNearOffice = function(db,coord,fromId, callback) {
//  if(typeof coord !== "undefined") {
//    db.collection('office').aggregate(,
//      function (err, result) {
//        if (err) {
//          console.log(err);
//        } else if (result.length) {
//          //console.log(result[0].loc.coordinates);
//          var resp = "Ближайший офис к вам работает:\n " + result[0].desc;
//          resp += "\nНаходится в: " + result[0].distance.toFixed(0) + " метрах";
//          bot.sendMessage(fromId, resp, menu.main);
//          bot.sendLocation(fromId, result[0].loc.coordinates[1], result[0].loc.coordinates[0], menu.main);
//        } else {
//          console.log('No document(s) found with defined "find" criteria!');
//        }
//        //Close connection
//        db.close();
//      });
//  }
//};

function vb_curs2(msg) {
    var fromId = msg.from.id;
    var curr = require("./json/currency.json");
    bot.sendMessage(msg.from.id, 'Пожалуйста, введите наименование вашего населенного пункта', menu.reply)
        .then(function (sended) {
            var chatId = sended.chat.id;
            var messageId = sended.message_id;
            bot.onReplyToMessage(chatId, messageId, function (message) {
                if (typeof message.text !== "undefined") {
                    findCity(message.text.trim().toLowerCase(), function (err, url) {
                        if (err) {
                            bot.sendMessage(fromId, err, menu.main)
                        }
                        else {
                            console.log(url);
                            require("./parse_curs.js").get_curs(url, function (err, curs_json) {
                                if (err) {
                                    bot.sendMessage(fromId, err, menu.main)
                                }
                                else {
                                    //console.log("JSON : " + curs_json);
                                    var curs_office = "*Курс валют для отделений " + curs_json.title + "*\n";
                                    for (var i in curs_json.rates) {
                                        curs_office += curr[curs_json.rates[i].name].symbol + " " + curs_json.rates[i].name + "\n" +
                                            " • покупка   " + curs_json.rates[i].buy + "\n" +
                                            " • продажа   " + curs_json.rates[i].sell + "\n";
                                    }
                                    bot.sendMessage(fromId, curs_office, menu.main)
                                }
                            })
                        }
                        ;
                    });
                }
                 else {
                    console.log('No document(s) found with defined "find" criteria!');
                }
            });
        });
};

var findCity = function(cityName, callback) {
    console.log(cityName);
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
                        var url, err;
                        if (result.length) {
                            for (var atr in result) {
                                url = cont.bank_url + result[atr].synonym;
                                console.log("url="+url);
                                callback("", url);
                            };
                        }
                        else {
                            callback("К сожалению, я не знаю такого города", "");
                        }
                    };
                    db.close();
                })
        }
    });
};

//TODO найти решения для таблицы
function vb_table(msg){
    var fromId = msg.from.id;
    var resp = "Проверка\n" +
        "```раз два три четыре ```\n"+
        "```пять шесть семь```"+
        "`djçlkç`";
    bot.sendMessage(fromId,resp,menu.main);
};
