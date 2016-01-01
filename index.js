var http = require('http');
var express = require('express');
var exp_hbs = require('express-handlebars');
var path = require('path');

var app = express();

//directory for static html files
var public_dir = './public/';

//sets the port number
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname,'views'));
app.engine('handlebars',
           exp_hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//we'll have static files in ./public folder
app.use(express.static(path.join(__dirname, 'public'))); 


//Examples of how to serve dynamic and static views

//rendered homepage
app.get('/', function (req, res) {
  res.render('index');
});

//custom rendered view
app.get('/about', function (req, res) {
  res.render('about');
});

//dynamic content example
app.get('/opened-at-timestamp', function (req, res) {
  var time = Date.now();
  res.render('opened-at-timestamp', {
              timestamp: time,
              username: 'Bob'
  });
});

//serving static html files
app.get('/static-example', function (req, res) {
  res.sendFile(public_dir + 'static-example.html');
});


//page not found
app.use(function (req,res) {
      res.render('404', {url:req.url});
});

//creates the server instance, and prints status message to console
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
