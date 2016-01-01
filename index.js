var http = require('http');
var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');

var app = express();

var public_dir = './public/';
//sets the port number
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname,'views'));
app.engine('handlebars',
           exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//we'll have static files in ./public folder
app.use(express.static(path.join(__dirname, 'public'))); 




//this is what we see when we dial in to 127.0.0.1:3000
app.get('/', function (req, res) {
  res.render('index');
});
app.get('/about', function (req, res) {
  res.render('about');
});

app.get('/static-example', function (req, res) {
  res.sendFile(public_dir + 'static-example.html');
});

//creates the server instance, and prints status message to console
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
