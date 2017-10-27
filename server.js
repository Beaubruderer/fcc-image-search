// server.js
// where your node app starts

// init project
var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var SaveSearch = require('./save-search.js');
var request = require('request');

var app = express();

var baseUrl = 'https://hanging-wanderer.glitch.me/';

// mongodb name: fcc-image-search-abstraction-layer

var mongoUrl = 'mongodb://main-user:Password1@ds121015.mlab.com:21015/fcc-image-search-abstraction-layer';
mongoose.connect(mongoUrl);


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// main image search API

// params:
// key, cx, q, searchType


var imageApiUrlBase = 'https://www.googleapis.com/customsearch/v1?',
    cx='014482878177962345412:rrvrsiytute',
    keyParam='AIzaSyCgbXNmjhNqWG1GovevuvYKt_98aKe0FHY';


app.get("/api/querytest", function(req, res){
  
  
  if (req.query.offset && !isNaN(req.query.offset)) {
      
    res.send('offset query by: ' + req.query.offset); 
      
      } else {
        
        res.send('no valid offset query and/or number provided');
        
      }
    

  
  
  
})

app.get("/api/imagesearch/:search_term", function (req, res) {
  
    
  
   console.log('query string');
    console.log(req.query);
  
  
  var offset = 0;
  
  if (req.query.offset && !isNaN(req.query.offset)) {
      
    offset = req.query.offset;
      
      }
  
  
  
  var timestamp = new Date().toISOString(),
      searchTerm = req.params.search_term;
  
  var imageApiUrl = imageApiUrlBase + '&cx=' + cx + '&key=' + keyParam + '&q=' + searchTerm + '&searchType=image';
  
  if (offset > 0) {
    
    imageApiUrl += '&start=' + offset;
    
  }
  
 request(imageApiUrl, (err, imgRes, body) => {
   
   if (err) {
     console.log('API call FAILED');
     console.log(err);
   } else {
     
     var items = JSON.parse(body).items;
     
     var responsePayload = [];
     
     for (var i in items){
       var item = items[i];
       
       var payloadItem = {
          url: item.link,
         snippet: item.snippet,
         thumbnail: item.image.thumbnailLink,
         context: item.image.contextLink
         
       };
       
       responsePayload.push(payloadItem);
       
     }
     
     
     res.send(responsePayload);
     // res.send(items);

   }
  
 });
  
  
  var recentQueryData = new SaveSearch({
        'term': searchTerm,
        'when': timestamp
    
  });
  
  recentQueryData.save((err, result) => {
    
    if (err) {
        console.log(err);
    } else {
      
      console.log(result);
      mongoose.connection.close();
      
    };
    
  });
  
   // res.send(recentQueryData);
  
});


// LATEST searches API


app.get("/api/latest/imagesearch/", function (req, res) {
  
  console.log('GET request to latest searches...');
  SaveSearch.find().sort('-when').limit(10).exec((err, results) => {
    
     if (err) {
        res.send('ERROR: ' + err);
    } else {
    
          res.send(results);
    }
    
  });
  
  // res.send('latest searches API url');
  
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
