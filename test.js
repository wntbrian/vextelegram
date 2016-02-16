console.log("begin");
var Youtube = require("youtube-api");
var oauth = Youtube.authenticate(
    {
        type: "oauth"
        , client_id: "184966178488-k52pnba0ul65f4kse72frn3jr013oebo.apps.googleusercontent.com"
        , client_secret: "0-tsWJU-H-T5KYhFwAsCpuI6"
        , redirect_url: "http://localhost"
    }
);

oauth.getToken("test", function(err, tokens) {
    //if (err) {return console.log(err); }
    oauth.setCredentials(tokens);
    Youtube.channels.list(
        {"part":"snippet", "maxResults": 5},
        function (err, data) {console.log(err, data);
        } );
   });

console.log("end")