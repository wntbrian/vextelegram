
// курс валют ЦБ
//var request = require('request');
//var url = 'http://query.yahooapis.com/v1/public/yql?q=select+*+from+yahoo.finance.xchange+where+pair+=+%22USDRUB,EURRUB%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
//request(url, function (error, response, body) {
//  if (!error && response.statusCode == 200) {
//    var fbResponse = JSON.parse(body);
//    console.log("Got a response: ", fbResponse);
//  } else {
//    console.log("Got an error: ", error, ", status code: ", response.statusCode);
//  }
//});
//var request = require('request');
//var url = 'https://geocode-maps.yandex.ru/1.x/?geocode=37.6290920000000000,55.7464659999999980&format=json';
//request(url, function (error, response, body) {
//  if (!error && response.statusCode == 200) {
//    var fbResponse = JSON.parse(body);
//    for(var id in fbResponse.response.GeoObjectCollection.featureMember)
//    {
//      if (fbResponse.response.GeoObjectCollection.featureMember[id].GeoObject.metaDataProperty.GeocoderMetaData.kind == "locality")
//      {
//        console.log(fbResponse.response.GeoObjectCollection.featureMember[id].GeoObject.name);
//      }
//    }
//  } else {
//    console.log("Got an error: ", error, ", status code: ", response.statusCode);
//  }
//});