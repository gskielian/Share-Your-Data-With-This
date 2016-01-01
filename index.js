var http = require('http');
var express = require('express');
var path = require('path');

var app = express();

//sets the port number
app.set('port', process.env.PORT || 3000); 

//we'll have static files in ./public folder
app.use(express.static(path.join(__dirname, 'public'))); 

//this is what we see when we dial in to 127.0.0.1:3000
app.get('/', function (req, res) {
  res.send('<html><body><h1>Hello World</h1></body></html>');
});

//creates the server instance, and prints status message to console
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
