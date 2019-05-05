var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser');
var Cloudant = require('@cloudant/cloudant');

const username = "ba52417a-4252-4ddb-ae0a-b036f6dbd38d-bluemix";
const password = "691f57c40a74294348a78c9ac06ae40d376df804ee473c0650ffb10fa0edb5a4";
const url = "https://ba52417a-4252-4ddb-ae0a-b036f6dbd38d-bluemix:691f57c40a74294348a78c9ac06ae40d376df804ee473c0650ffb10fa0edb5a4@ba52417a-4252-4ddb-ae0a-b036f6dbd38d-bluemix.cloudantnosqldb.appdomain.cloud";
const cloudant = Cloudant({account:username, password:password, url: url});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

// Remove any existing database called "alice".
cloudant.db.destroy('users', function(err) {

  // Create a new "alice" database.
  cloudant.db.create('users', function() {

    // Specify the database we are going to use (alice)...
    var users = cloudant.db.use('users')

    // ...and insert a document in it.

  });
});

app.put('/user', function(req, res){
      var users = cloudant.db.use('users');
      users.insert(req.body, req.body.user, function(err, body, header) {
        if (err) {
          res.sendStatus(400);
          console.error('[user.insert] ', err.message);
        }else {
          res.send(body);
        }
        console.log('You have inserted user ' + req.body.name);
        console.log(body);
      });
    });

app.get('/user/:id', function(req, res){
  var users = cloudant.db.use('users');
  users.get(req.params.id, function(err, body, header) {
    if (err) {
      res.sendStatus(400);
      console.error('[user.get] ', err.message);
    }else {
      res.send(body);
    }
    console.log('You have read user ' + req.body.name);
  });
});
let port = process.env.PORT || 3100;
app.listen(port, function() {
    console.log("Listening to port: " + port);
});
