

var request = require('request');
var url = 'http://query.yahooapis.com/v1/public/yql?q=select+*+from+yahoo.finance.xchange+where+pair+=+%22USDRUB,EURRUB%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
request(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var fbResponse = JSON.parse(body);
    console.log("Got a response: ", fbResponse);
  } else {
    console.log("Got an error: ", error, ", status code: ", response.statusCode);
  }
});