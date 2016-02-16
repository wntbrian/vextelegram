var TelegramBot = require('node-telegram-bot-api');
var feed = require("feed-read");
var token = process.env.bottoken;
// Setup polling way

var options = {
  webHook: {
    port: 8080
    //key: __dirname+'/key.pem',
    //cert: __dirname+'/crt.pem'
  }
};


////
var rss_news = "";
feed("http://www.vostbank.ru/news/feed/", function(err, articles) {
  if (err) throw err;
  // Each article has the following properties:
  //
  //   * "title"     - The article title (String).
  //   * "author"    - The author's name (String).
  //   * "link"      - The original article link (String).
  //   * "content"   - The HTML content of the article (String).
  //   * "published" - The date that the article was published (Date).
  //   * "feed"      - {name, source, link}
  //
  rss_news = articles;
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
bot.onText(/\/start/, function (msg, match) {
  msg.replayed = true;
  var fromId = msg.from.id;
  var resp = "Привет, я *бот* \n конкурса вэб.";
  var opt = {
    parse_mode : "Markdown",
    reply_markup : {
      keyboard :
      [
        ["Курс","ЦБ"],
        ["Акции"],
        ["Контакты","Twitter"]
      ],
      "one_time_keyboard": true,
      "resize_keyboard" : true
    }
  };
  bot.sendMessage(fromId,resp,opt);
});
bot.onText(/\Курс/, function (msg, match) {
  msg.replayed = true;
  var curs = require("./json/currency.json");
  var fromId = msg.from.id;
  var resp = "Курс валют на "+curs.update;
  for (var atr in curs.bank_currency){
    resp += "\n";
    resp += atr+": Покупка: "+curs.bank_currency[atr].buy+" Продажа: "+curs.bank_currency[atr].sell;
  }
  var opt = {
    parse_mode : "Markdown",
    reply_markup : {
      keyboard :
        [
          ["Доллар","Евро","Юань"],
          ["Курс ЦБ"]
        ],
      "one_time_keyboard": true,
      "resize_keyboard" : true
    }
  };
  bot.sendMessage(fromId,resp,opt);
});
bot.onText(/\ЦБ/, function (msg, match) {
  msg.replayed = true;
  var curs = require("./json/currency.json");
  var fromId = msg.from.id;
  var resp = "Курс валют центробанка "+curs.update;
  for (var atr in curs.cbank_currency){
    resp += "\n";
    resp += atr+": "+curs.cbank_currency[atr].val;
  }
  var opt = {
    parse_mode : "Markdown",
    reply_markup : {
      keyboard :
        [
          ["Курс банка"]
        ],
      "one_time_keyboard": true,
      "resize_keyboard" : true

    }
  };
  bot.sendMessage(fromId,resp,opt);
});
bot.onText(/\Акции/, function (msg, match) {
  msg.replayed = true;
  var fromId = msg.from.id;
  var resp = "здесь будут акции банка";
  var opt = {
    parse_mode : "Markdown",
    reply_markup : {
      keyboard :
        [
          ["Акция 1","Акция 2","Акция 3"],
          ["Оформить заявку"]
        ],
      "one_time_keyboard" : true,
      "resize_keyboard" : true
    }
  };
  bot.sendMessage(fromId,resp,opt);
});
bot.onText(/\Бонусы/, function (msg, match) {
  msg.replayed = true;
  var fromId = msg.from.id;
  var resp = "здесь будут бунусы";
  var opt = {
    parse_mode : "Markdown",
    reply_markup : {
      keyboard :
        [
          ["бонус 1","бонус 2","бонус 3"],
          ["Оформить заявку"]
        ],
      "one_time_keyboard" : true,
      "resize_keyboard" : true
    }
  };
  bot.sendMessage(fromId,resp,opt);
});
bot.onText(/\Контакты/, function (msg, match) {
  msg.replayed = true;
  var fromId = msg.from.id;
  var resp = "Адрес \n  набережная Садовническая, 9, пом. 18-21, часть пом.12	\n Отделение:\n    пн-пт: 9 :00-20:00,\n    сб: 10:00-17:00,\n    вс: выходной\n   Касса:\n    пн-пт: 9 :00-20:00,\n    сб: 10:00-17:00,\n    вс: выходной";
  var opt = {
    parse_mode : "Markdown",
    reply_markup : {
      keyboard :
        [
          ["Главный офис","Банкоматы","Зоны 24"],
          ["Акции"]
        ],
      "one_time_keyboard": true,
      "resize_keyboard" : true
    }
  };
  bot.sendMessage(fromId,resp,opt);
});

bot.onText(/\Twitter/, function (msg, match) {
  vb_twitter(msg);
});
//Новости
bot.onText(/\Новости/, function (msg, match) {
  vb_news(msg);
});
//новости
bot.onText(/\новости/, function (msg, match) {
    vb_news(msg);
});

// Any kind of message
bot.on('message', function (msg) {
  if (!msg.replayed) {
    var chatId = msg.chat.id;
    var txt = msg.text;
    // photo can be: a file path, a stream or a Telegram file_id
    //var photo = 'cat.jpg';
    bot.sendMessage(chatId, "Для открытия стартового меню наберите /start");
    //bot.sendPhoto(chatId, photo, {caption: 'Lovely kittens'});
  }
});
function vb_twitter(msg){
  var fromId = msg.from.id;
  var resp = "twitter";
  var opt = {
    reply_markup : {
      keyboard :
          [
            ["Главный офис","Банкоматы","Зоны 24"],
            ["Акции"]
          ],
      "one_time_keyboard": true,
      "resize_keyboard" : true
    }
  };
  resp = twittermsg[randomInt(0,10)].text;
  bot.sendMessage(fromId,resp,opt);
}
function vb_news(msg){
  var fromId = msg.from.id;
  var resp = "новости";
  var opt = {
    reply_markup : {
      keyboard :
          [
            ["Главный офис","Банкоматы","Зоны 24"],
            ["Акции"]
          ],
      "one_time_keyboard": true,
      "resize_keyboard" : true
    }
  };
  var i = randomInt(0,10);
  resp = rss_news[i].title+"\n"+rss_news[i].link;
  bot.sendMessage(fromId,resp,opt);
}
