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
var vost_news="http://www.vostbank.ru/news/feed/";
//var vost_youtube_bryansk="http://www.youtube.com/feeds/videos.xml?channel_id=UCXmCnhbOs5JaDmIKkldTBWA";
var vost_youtube="https://www.youtube.com/feeds/videos.xml?channel_id=UCkz_SV9S0wqLjS5vjE-kIyA";
////
var menu = require("./json/menu.json");
var credit = require("./credits.js");
var news_json;
var yt_json;
require("./rssfeed.js").rss(vost_youtube,function (json,err) {
  yt_json = json;
});
require("./rssfeed.js").rss(vost_news,function (json,err) {
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
bot.onText(/\/start/, function (msg, match) {
  msg.replayed = true;
  var fromId = msg.from.id;
  var resp = "Привет, я *бот* конкурса ВЭБ";
  bot.sendMessage(fromId,resp,menu.main);
});

bot.onText(/\Меню/, function (msg, match) {
    msg.replayed = true;
    var fromId = msg.from.id;
    var resp = "Слушаю и подчиняюсь";
    bot.sendMessage(fromId,resp,menu.main);
});

bot.onText(/\Курсы валют/, function (msg, match) {
  msg.replayed = true;
  var curs = require("./json/currency.json");
  var fromId = msg.from.id;
  var resp = "Курс валют на "+curs.update+"\n";
    resp += "      покупка	продажа		ЦБ";
    for (var atr in curs.bank_currency){
    resp += "\n";
   resp += atr+"	  "+curs.bank_currency[atr].buy+"		"+curs.bank_currency[atr].sell+"    	"+curs.bank_currency[atr].cb;
  }
  bot.sendMessage(fromId,resp,menu.main);
});

bot.onText(/\Подарки и бонусы/, function (msg, match) {
  msg.replayed = true;
  var fromId = msg.from.id;
  var resp = "Узнайте о наших акциях";
  bot.sendMessage(fromId,resp,menu.bonus);
});

bot.onText(/\Проценты в подарок/, function (msg, match) {
  msg.replayed = true;
  var fromId = msg.from.id;
  var resp = "В благодарность за выбор и оказанное доверие " +
      "Восточный экспресс банк дарит своим лучшим клиентам повышенную ставку по вкладу до +0,5% \n" +
      "[Узнать подробности](http://www.vostbank.ru/moscow/action/percent-gift)";
  bot.sendMessage(fromId,resp,menu.none);
});
bot.onText(/\Бонус за покупки/, function (msg, match) {
    msg.replayed = true;
    var fromId = msg.from.id;
    var resp = "Программа поощрения держалелей банковских карт \"*Visa Platinum - VIP Сберегательный*\" \n" +
        "[Условия бонусной программы](http://www.vostbank.ru/sites/default/files/doc/vip/cards/Cash_Back_prilozgenie_vkl.pdf) \n" +
        "[Правила бонусной программы](http://www.vostbank.ru/sites/default/files/doc/vip/cards/Cash_Back_pravila.pdf)";
    bot.sendMessage(fromId,resp,menu.none);
});
bot.onText(/\Кредитные каникулы/, function (msg, match) {
    msg.replayed = true;
    var fromId = msg.from.id;
    var resp = "В жизни каждого человека бывают моменты, когда сложно своевременно внести вовремя платеж по кредиту." +
        " В какой бы сложной ситуации вы бы не оказались, с опцией «*Кредитные каникулы*» Вы будете уверены " +
        "в завтрашнем дне, ведь банк может предоставить отсрочку по внесению выплат в погашение основного долга по кредиту. \n" +
        "[Узнать подробности](http://www.vostbank.ru/page/kreditnye-kanikuly) \n" +
        "☎ 8-800-100-7-100";
    bot.sendMessage(fromId,resp,menu.none);
});
bot.onText(/\Рекомендация/, function (msg, match) {
    msg.replayed = true;
    var fromId = msg.from.id;
    var resp = "Теперь вы можете рекомендовать наш банк своим друзьям, родственникам, знакомым и получать подарки от банка. " +
        "Подарок для вас за рекомендацию - 1000 бонусов на счет." +
        "Подарок для друга - 500 бонусов за оформленный кредит или кредитную карту в нашем банке по вашей рекомендации. \n" +
        "[Узнать подробности](http://www.vostbank.ru/moscow/private/podarki-i-bonusy/privodite-druzei-i-poluchaite-podarki)";
    bot.sendMessage(fromId,resp,menu.none);
});

bot.onText(/\Контакты/, function (msg, match) {
  msg.replayed = true;
  var fromId = msg.from.id;
  var resp =
      "☎ 8-800-100-7-100 \n"+
      "[Официальный сайт](vostbank.ru) \n" +
      "[Интернет-банк](online.vostbank.ru) \n"+
      "◆ [Вконтакте](http://vk.com/vostbankru) \n" +
      "◆ [Одноклассники](http://ok.ru/vostbank) \n" +
      "◆ [Facebook](http://www.facebook.com/vostbank) \n" +
      "◆ [Instagram](http://www.instagram.com/vostbank.ru) \n" +
      "◆ [Twitter](http://twitter.com/vostbank)";
  bot.sendMessage(fromId,resp,menu.main);
});

bot.onText(/\Twitter/, function (msg, match) {
  vb_twitter(msg);
});
//Новости
bot.onText(/\Новости/, function (msg, match) {
  vb_news(msg);
});
bot.onText(/\таблица/, function (msg, match) {
    vb_table(msg);
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
  resp = twittermsg[randomInt(0,10)].text;
  bot.sendMessage(fromId,resp,menu.main);
}
function vb_news(msg){
  var fromId = msg.from.id;
  var resp = "новости";
  var i = randomInt(0,10);
  resp = news_json[i].title+"\n"+news_json[i].link;
  bot.sendMessage(fromId,resp,menu.main);
}
//TODO найти решения для таблицы
function vb_table(msg){
    var fromId = msg.from.id;
    var resp = "Проверка\n" +
        "'''раз два три четыре \n'''"+
       "'''пять шесть семь\n'''"+
"'''djçlkç'''";
    bot.sendMessage(fromId,resp,menu.main);
}
