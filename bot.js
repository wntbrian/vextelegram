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
//test
require("./credits.js");
//require("./deposits.js");
require("./test.js");
var news_json;
var yt_json;
require("./rssfeed.js").rss(cont.rss.youtube_channel, function (json, err) {
    yt_json = json;
});
require("./rssfeed.js").rss(cont.rss.news_feed, function (json, err) {
    news_json = json;
});
///
// TODO курс цб, не работает экспорт функции
//var curs_cb;
//require("./modules.js").curs_cb(function (cb) {
//    curs_cb = cb;
//});
///

var g_dep_arr;
var g_card_arr;
require("./modules.js").findProducts("deposit", function (json) {
    g_dep_arr = json;
});
require("./modules.js").findProducts("credits", function (json) {
    g_card_arr = json;
});

var twittermsg = "";
var Twitter = require('twitter');
var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});
client.get('statuses/user_timeline', {screen_name: "vostbank", count: 10}, function (error, tweets, response) {
    if (error) throw error;
    twittermsg = tweets;
    //console.log(response);  // Raw response object.
});
///

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
var bot = new TelegramBot(token, options);
bot.setWebHook(process.env.webhookurl + "/" + token);

// Matches /echo [whatever]
//bot.onText(/\/echo (.+)/, function (msg, match) {
//    var fromId = msg.from.id;
//    var resp = match[1];
//    bot.sendMessage(fromId, resp);
//});

bot.on('message', function (msg) {
    var chatId = msg.chat.id;
    logusers(msg);
    var commands = require("./json/commands.json");
    if (typeof msg.reply_to_message == "undefined") {
        if (typeof msg.text !== "undefined") {
            switch (msg.text) {
                case commands.start:
                    vb_start(msg);
                    break;
                case commands.help:
                    vb_help(msg);
                    break;
                case commands.setplace:
                    vb_saveuserplace(msg);
                    break;
                case commands.menu:
                    vb_menu(msg);
                    break;
                case commands.atm:
                    vb_near(msg, "atm");
                    break;
                case commands.office:
                    vb_near(msg, "office");
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
                    vb_curs3(msg);
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
                case commands.city:
                    vb_showcity(msg);
                    break;
                default:
                    bot.sendMessage(chatId, "Для открытия стартового меню наберите /start");
            }
        }
        if (typeof msg.location !== "undefined"){
            InsertUserCitybyLoc(msg,msg.from.id,false,function(chatId,txt,menu){
                bot.sendMessage(chatId,txt,menu);
            });
        }

    }
    // photo can be: a file path, a stream or a Telegram file_id
    //var photo = 'cat.jpg';

    //bot.sendPhoto(chatId, photo, {caption: 'Lovely kittens'});
});

function vb_start(msg) {
    var resp = "*Вас приветствует тестовый БОТ банка «Восточный»*\n" +
        "Я помогу Вам получить актуальную информацию о наших продуктах и услугах," +
        " а также расскажу о самых свежих новостях 😊";
    bot.sendMessage(msg.from.id, resp, menu.main);
};

function vb_help(msg) {
    var help_list = require("./json/help.json");
    var resp = "*Список доступных команд*:\n\n";
    for (i in help_list) {
        resp += help_list[i].name + " - " + help_list[i].desc+"\n";
    }
    bot.sendMessage(msg.from.id, resp, menu.main);
};

function vb_saveuserplace(msg) {
    bot.sendMessage(msg.from.id, 'Введите наименование населенного пункта или отправьте свои координаты', menu.reply).then(function (sended) {
        var chatId = sended.chat.id;
        var messageId = sended.message_id;
        bot.onReplyToMessage(chatId, messageId, function (message) {
            if (typeof message.location !== "undefined") {
                InsertUserCitybyLoc(message,chatId,true,function(chatId,err,menu){
                    bot.sendMessage(chatId,err,menu);
                });
            }else {
                if (typeof message.text !== "undefined") {
                    require("./modules.js").findCity(message.text.trim().toLowerCase(), function (err, place) {
                        if (err) {
                            bot.sendMessage(chatId, err, menu.main)
                        }
                        else {
                            require("./modules.js").SaveUserPlace({"userid": msg.from.id, "place": place.synonym});
                            bot.sendMessage(chatId, "Установлен нас.пункт: " + message.text.trim(), menu.main);
                        }
                    })
                }else
                {
                    bot.sendMessage(chatId, "Вы отправили не верные координаты или ошиблись в названии населенного пункта. Наберите команду /setplace и попробуй еще раз.", menu.main);
                }
            }
        })
    })
};

function vb_menu(msg) {
    var resp = "Пожалуйста, выберите пункт меню";
    bot.sendMessage(msg.from.id, resp, menu.main);
}

function vb_contacts(msg) {
    var resp = "";
    for (var i in cont.telephones) {
        resp += cont.telephones[i].title + " " + cont.telephones[i].numb + "\n";
    }
    ;
    resp += "\n";
    for (var i in cont.main_url) {
        resp += "• [" + cont.main_url[i].title + "](" + cont.main_url[i].link + ")\n";
    }
    ;
    resp += "\n*«Восточный» в социальных сетях*\n"
    for (var i in cont.social_url) {
        resp += "• [" + cont.social_url[i].title + "](" + cont.social_url[i].link + ")\n";
    }
    ;
    bot.sendMessage(msg.from.id, resp, menu.main);
}

function vb_products(msg) {
    var fromId = msg.from.id;
    var resp = "Что вас интересует?";
    bot.sendMessage(fromId, resp, menu.products);
}

function vb_credit_cards(msg) {
    var resp = "";
    if (g_card_arr.length) {
        for (var atr in g_card_arr) {
            resp += "[" + g_card_arr[atr].title.trim() + "](" + cont.bank_khb + g_card_arr[atr].link.trim() + ")\n";
        }
        bot.sendMessage(msg.from.id, resp, menu.products)
    }
    else {
        bot.sendMessage(msg.from.id, "По вашему запросу ничего не найдено :-(", menu.products)
    }
};

function vb_deposits(msg) {
    var resp = "";
    if (g_dep_arr.length) {
        for (var atr in g_dep_arr) {
            resp += "[Вклад " + g_dep_arr[atr].title.trim() + "](" + cont.bank_khb + g_dep_arr[atr].link.trim() + ")\n";
        }
        bot.sendMessage(msg.from.id, resp, menu.products)
    }
    else {
        bot.sendMessage(msg.from.id, "По вашему запросу ничего не найдено :-(", menu.products)
    }
}

//TODO выбор продукта
function vb_deposits2(msg) {
    var resp = "";
    if (g_dep_arr.length) {
        for (var atr in g_dep_arr) {
            resp += atr + " - Вклад *" + g_dep_arr[atr].title.trim() + "*\n";
        }
        bot.sendMessage(msg.from.id, resp, menu.products);
        bot.sendMessage(msg.from.id, 'Для получения подробной информации выберите интересующий продукт', menu.reply).then(
            function (sended) {
                var chatId = sended.chat.id;
                var messageId = sended.message_id;
                bot.onReplyToMessage(chatId, messageId, function (message) {
                    if (typeof message.text !== "undefined") {
                        for (var atr in g_dep_arr) {
                            if (message.text == atr) {
                                //var txt = "*Информация по вкладу [" + g_dep_arr[atr].title.trim() + "](" + cont.bank_khb + g_dep_arr[atr].link + ")*\n";
                                var txt = "*Информация по вкладу " + g_dep_arr[atr].title.trim() + "*\n";
                                txt += g_dep_arr[atr].desc;
                                txt += "\n" + cont.bank_khb + g_dep_arr[atr].link;
                                bot.sendMessage(msg.from.id, txt, menu.products)
                            }
                        }
                    }
                })
            }
        )
    }
    else {
        bot.sendMessage(msg.from.id, "По вашему запросу ничего не найдено :-(", menu.products)
    }
};

function vb_bonus(msg) {
    var bonuses = require("./json/bonus.json");
    var resp = "";
    for (var atr in bonuses) {
        resp += "[" + bonuses[atr].title + "](" + bonuses[atr].link + ")\n" + bonuses[atr].desc + "\n";
    }
    ;
    bot.sendMessage(msg.from.id, resp, menu.none);
}

function vb_sms(msg) {
    var sms_codes = require("./json/sms_codes.json");
    var resp = "";
    sms_codes.info;
    for (var i in sms_codes.title) {
        resp += sms_codes.title[i] + "\n";
    }
    ;
    resp += "\n";
    for (var i in sms_codes.codes) {
        resp += "• " + sms_codes.codes[i].title + "\n  " + sms_codes.codes[i].text + "\n";
    }
    ;
    bot.sendMessage(msg.from.id, resp, menu.none);
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
                    bot.sendMessage(fromId, 'Ой! Я не получил координаты, попробуйте пожалуйства еще раз.', menu.main);
                }
                else {
                    tmp_loc = message.location
                    findNear(tmp_loc, p_type, function (err, loc) {
                        if (err) {
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
                                    parse_office_desc(loc.desc, function (txt) {
                                        txt = "*Ближайшее отделение находится в " + loc.distance + " метрах*\n" +
                                            "*Режим работы:*" + txt;
                                        bot.sendMessage(fromId, txt, menu.main);
                                        bot.sendLocation(fromId, loc.coordX, loc.coordY, menu.main);
                                    });
                                    break;
                            }
                            ;
                        }
                        ;
                    });
                }
            });
        });
    // TODO расширить список банкоматов на 2 или 3
};

var parse_office_desc = function (desc, callback) {
    var str_arr = desc.split(",");
    var ret = "";
    for (i in str_arr) {
        ret += str_arr[i].replace("Касса:", "\n*Касса*\n").replace("Перерыв:", "\n*Перерыв*\n").replace("Отделение:", "\n") + "\n";
    }
    callback(ret);
}

function vb_random_news(msg) {
    switch (randomInt(0, 9)) {
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
    }
    ;
};

function vb_twitter(msg) {
    var resp = "twitter";
    resp = twittermsg[randomInt(0, 10)].text;
    bot.sendMessage(msg.from.id, resp, menu.main);
}

function vb_news(msg) {
    var resp = "новости";
    var i = randomInt(0, news_json.length - 1);
    resp = news_json[i].title + "\n" + news_json[i].link;
    bot.sendMessage(msg.from.id, resp, menu.main);
}

function vb_youtube(msg) {
    var resp = "youtube";
    var i = randomInt(0, yt_json.length - 1);
    resp = yt_json[i].title + "\n" + yt_json[i].link;
    bot.sendMessage(msg.from.id, resp, menu.main);
}

var findNear = function (coord, p_type, callback) {
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
                            resp = {
                                "desc": result[0].desc,
                                "distance": result[0].distance.toFixed(0),
                                "coordX": result[0].loc.coordinates[1],
                                "coordY": result[0].loc.coordinates[0]
                            };
                        }
                        else {
                            resp = {"desc": "К сожалению, поблизости ничего не найдено"};
                        }
                        db.close();
                        callback("", resp);
                    }
                    ;
                });
            }
        });
    }
};

function vb_curs3(msg) {
    var fromId = msg.from.id;
    var curr = require("./json/currency.json");
    require("./modules.js").GetUserUrl(msg.from.id, function (url) {
        if (url != "") {
            require("./parse_curs.js").get_curs(url, function (err, curs_json) {
                if (err) {
                    bot.sendMessage(fromId, err, menu.main)
                }
                else {
                    var curs_office = "*Курс валют для отделений " + curs_json.title + "*\n";
                    for (var i in curs_json.rates) {
                        curs_office += curr[curs_json.rates[i].name].symbol + " " + curs_json.rates[i].name + "\n" +
                            " • покупка   " + curs_json.rates[i].buy + "\n" +
                            " • продажа   " + curs_json.rates[i].sell + "\n";
                    }
                    bot.sendMessage(fromId, curs_office, menu.main);
                }
            })
        }
        else {
            bot.sendMessage(msg.from.id, 'Пожалуйста, отправьте ваши координаты.', menu.reply)
                .then(
                function (sended) {
                    var chatId = sended.chat.id;
                    var messageId = sended.message_id;
                    bot.onReplyToMessage(chatId, messageId, function (message) {
                          if (typeof message.location !== "undefined"){
                              InsertUserCitybyLoc(message, chatId, true, function (chatId, txt, menu2){
                                  require("./modules.js").GetUserUrl(msg.from.id, function (url) {
                                      if (url != "") {
                                          require("./parse_curs.js").get_curs(url, function (err, curs_json) {
                                              if (err) {
                                                  bot.sendMessage(chatId, err, menu.main)
                                              }
                                              else {
                                                  var curs_office = "*Курс валют для отделений " + curs_json.title + "*\n";
                                                  for (var i in curs_json.rates) {
                                                      curs_office += curr[curs_json.rates[i].name].symbol + " " + curs_json.rates[i].name + "\n" +
                                                      " • покупка   " + curs_json.rates[i].buy + "\n" +
                                                      " • продажа   " + curs_json.rates[i].sell + "\n";
                                                  }
                                                  bot.sendMessage(chatId, curs_office, menu.main);
                                              }
                                          })
                                      }
                                      else
                                      {
                                          bot.sendMessage(chatId, txt, menu.main);
                                      }
                                  });
                              });
                          }else{
                              bot.sendMessage(chatId, 'Вы отправили неверные координаты, попробуй еще раз.', menu.main);
                          }


                            //if (typeof message.location !== "undefined") {
                            //    require("./modules.js").findCityYandex(message.location, function (type, place) {
                            //        require("./modules.js").findCity(place,function(a,synonym){
                            //            require("./modules.js").SaveUserPlace({
                            //                "userid": message.from.id,
                            //                "place": synonym.synonym
                            //            });
                            //        });
                            //        //bot.sendMessage(chatId,'Вы находитесь в населенном пунке: '+place,menu.main)
                            //        }
                            //    );
                            //}
                        }
                    )
                }
            )
            //bot.sendMessage(fromId, "Пожалуйста, задайте свой населенный пункт с помощью команды /setplace и затем повторите запрос", menu.main)
        }
    })
};

//TODO найти решения для таблицы
function vb_table(msg) {
    var fromId = msg.from.id;
    var resp = "Проверка\n" +
        "```раз два три четыре ```\n" +
        "```пять шесть семь```" +
        "`djçlkç`";
    bot.sendMessage(fromId, resp, menu.main);
};
function logusers(msg){
    MongoClient.connect('mongodb://127.0.0.1:27017/vexbot', function (err, db) {
        if (err) {
            console.log(err)
        };
        //console.log("Connected to Database");
        //simple json record
        var collection = db.collection('visitors');
        collection.updateOne({"userid": msg.chat.id}, {
            $set: {
                "first_name": msg.chat.first_name,
                "last_name": msg.chat.last_name
            },
            $addToSet: { msg: [ msg ] }
        }, {"upsert": true}, function (err) {
            if (err) throw err;
            db.close();
        });
    });
}
function vb_showcity(msg){
    bot.sendMessage(msg.from.id, 'В каком я городе? Отправь location', menu.reply).then(
      function (sended) {
          var chatId = sended.chat.id;
          var messageId = sended.message_id;
          bot.onReplyToMessage(chatId, messageId, function (message) {
                  if (typeof message.location !== "undefined") {
                      require("./modules.js").findCityYandex(message.location, function (type, place) {
                              bot.sendMessage(chatId,'Вы находитесь в населенном пунке: '+place,menu.main)
                          }
                      );
                  }
              }
          )
      }
    )
}
var InsertUserCitybyLoc = function (message,chatId,q, callback){
    require("./modules.js").findCityYandex(message.location, function (type, city) {
            if (type == 'locality') {
                require("./modules.js").findCity(city.toLowerCase(), function (err, place) {
                    if (err) {
                        //callback(chatId,err,menu.main);
                        bot.sendMessage(chatId, err, menu.main)
                    }
                    else {
                        var txt ='';
                        if (q){
                            txt = "Установлен нас.пункт: ";
                        }else{
                            txt = "Ваш нас.пункт: ";
                        }

                        require("./modules.js").SaveUserPlace({
                            "userid": message.from.id,
                            "place": place.synonym
                        });
                        callback(chatId, txt + city, menu.main);
                    }
                })
            }
            else
            {
                callback(chatId, "Вы отправили неверные координаты или ошиблись в названии населенного пункта. Наберите команду /setplace и попробуй еще раз.", menu.main);
            }
        }
    );
    //callback();
}