var TelegramBot = require('node-telegram-bot-api');
var token = process.env.bottoken;

var options = {
  webHook: {
    port: 8080
    //key: __dirname+'/key.pem',
    //cert: __dirname+'/crt.pem'
  }
};
var bot = new TelegramBot(token, options);
bot.setWebHook(process.env.webhookurl+"/"+token);
var opts = {
  reply_markup: JSON.stringify(
    {
      force_reply: true
    }
  )};
bot.on('message', function (msg) {
  if ( typeof msg.reply_to_message == "undefined") {
    bot.sendMessage(msg.from.id, 'How old are you?', opts)
      .then(function (sended) {
        var chatId = sended.chat.id;
        var messageId = sended.message_id;
        bot.onReplyToMessage(chatId, messageId, function (message) {
          console.log('User is %s years old', message.text);
          bot.sendMessage(msg.from.id, "You say: "+message.text);
        });
      });
  }
  else{
    //if (msg.reply_to_message.text == "How old are you?"){
    //  bot.sendMessage(msg.from.id, "You say: "+msg.text);
    //}
  }



});