var http = require('http');
var express = require('express');
var body_parser = require('body-parser');
var exp_hbs = require('express-handlebars');
var path = require('path');

MongoClient = require('mongodb').MongoClient;
Server = require('mongodb').Server;
CollectionDriver = require('./collectionDriver').CollectionDriver;

var app = express();

//directory for static html files
var public_dir = './public/';

//sets the port number
app.set('port', process.env.PORT || 3000);


///////////////
var mongoHost = 'localHost'; //A
var mongoPort = 27017; 
var collectionDriver;

var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //B
mongoClient.open(function(err, mongoClient) { //C
  if (!mongoClient) {
    console.error("Error! Exiting... Must start MongoDB first");
    process.exit(1); //D
  }
  var db = mongoClient.db("MyDatabase");  //E
  collectionDriver = new CollectionDriver(db); //F
});

app.set('views', path.join(__dirname,'views'));
app.engine('handlebars',
           exp_hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//impt that this goes beore app.use and after app.set
app.use(body_parser.urlencoded({
    extended: true
}));
app.use(body_parser.json());


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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/:collection', function(req, res) { //A
  var params = req.params; //B
  // collectionDriver.findAll(req.params.collection, function(error, objs) { //C
  collectionDriver.findRecent(req.params.collection, function(error, objs) { //C
    if (error) { res.send(400, error); } //D
    else { 
      if (req.accepts('html')) { //E
        res.render('data',{objects: objs, collection: req.params.collection}); //F
      } else {
        res.set('Content-Type','application/json'); //G
        res.status(200).send(objs); //H
      }
    }
  });
});

app.get('/:collection/getall', function(req, res) { //A
  var params = req.params; //B
   collectionDriver.findAll(req.params.collection, function(error, objs) { //C
  //collectionDriver.findRecent(req.params.collection, function(error, objs) { //C
    if (error) { res.send(400, error); } //D
    else { 
      if (req.accepts('html')) { //E
        res.render('data',{objects: objs, collection: req.params.collection}); //F
      } else {
        res.set('Content-Type','application/json'); //G
        res.status(200).send(objs); //H
      }
    }
  });
});

app.get('/:collection/:entity', function(req, res) { //I
  var params = req.params;
  var entity = params.entity;
  var collection = params.collection;
  if (entity) {
    collectionDriver.get(collection, entity, function(error, objs) { //J
      if (error) { res.status(400).send(error); }
      else { res.status(200).send(objs); } //K
    });
  } else {
    res.status(400).send({error: 'bad url', url: req.url});
  }
});

app.post('/:collection', function(req, res) { //A
    var object = req.body;
    var collection = req.params.collection;
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.status(400).send(err); } 
          else { res.status(201).send(docs); } //B
     });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//page not found
app.use(function (req,res) {
      res.render('404', {url:req.url});
});

//creates the server instance, and prints status message to console
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
