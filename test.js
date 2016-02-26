var bonuses = require("./json/bonus.json");
var resp = "";
for (var atr in bonuses){
    resp += "["+bonuses[atr].title+"]("+bonuses[atr].link+"\n"+bonuses[atr].desc;
};
