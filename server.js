var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser');
var Cloudant = require('@cloudant/cloudant');

const username = "ba52417a-4252-4ddb-ae0a-b036f6dbd38d-bluemix";
const password = "691f57c40a74294348a78c9ac06ae40d376df804ee473c0650ffb10fa0edb5a4";
const url = "https://ba52417a-4252-4ddb-ae0a-b036f6dbd38d-bluemix:691f57c40a74294348a78c9ac06ae40d376df804ee473c0650ffb10fa0edb5a4@ba52417a-4252-4ddb-ae0a-b036f6dbd38d-bluemix.cloudantnosqldb.appdomain.cloud";
const cloudant = Cloudant({account: username, password: password, url: url});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json());

app.use(function (req, res, next) {
    if (!req.secure || process.env.BLUEMIX_REGION === undefined) {
        next();
    } else {
        res.redirect('https://' + req.headers.host + req.url);
    }
});

app.put('/user', function (req, res) {
    var users = cloudant.db.use('users');
    console.log('JSON-user ' + JSON.stringify(req.body));
    users.insert(req.body, req.body.user, function (err, body, header) {
        if (err) {
            res.sendStatus(400);
            console.error('[user.insert] ', err.message);
        } else {
            console.log('You have inserted user ' + body.id);
            console.log(body);
            res.send(body);
        }
    });
});

app.get('/user/:id', function (req, res) {
    var users = cloudant.db.use('users');
    users.get(req.params.id, function (err, body, header) {
        if (err) {
            res.sendStatus(400);
            console.error('[user.get] ', JSON.stringify(err));
        } else {
            console.log('You have read user ' + JSON.stringify(body));
            res.send(body);
        }
    });
});

app.post('/connect', function (req, res) {
    var users = cloudant.db.use('connected_users');
    console.log('Connect: JSON-user ' + JSON.stringify(req.body));
    users.head(req.body.name).then(headers => {
        console.log('connect fulfilled: ' + JSON.stringify(headers));
        req.body._rev = JSON.parse(headers.etag);
        req.body._id = req.body.name;
        users.insert(req.body, req.body.name).then((body) => {
            console.log('You have connected user ' + body.id);
            console.log(body);
            res.send(body);
        }).catch(err => {
            res.sendStatus(400);
            console.error('[user.connect] ', JSON.stringify(err));
        });
    }).catch(err => {
        console.log('connect rejected: ' + JSON.stringify(err));
        users.insert(req.body, req.body.name, function (err, body, header) {
            if (err) {
                res.sendStatus(400);
                console.error('[user.connect] ', JSON.stringify(err));
            } else {
                console.log('You have connected user ' + body.id);
                console.log(body);
                res.send(body);
            }
        });
    })

});

app.get('/connectedUsers', function (req, res) {
    var users = cloudant.db.use('connected_users');
    console.log('JSON-user ' + JSON.stringify(req.body));
    users.list({include_docs: true}, function (err, body, header) {
        if (err) {
            res.sendStatus(400);
            console.error('[connected users.get] ', JSON.stringify(err));
        } else {
            console.log('You have read connected users ' + JSON.stringify(body));
            let arr = [];
            body.rows.forEach(elem => arr.push(elem.doc));
            res.send(arr);
        }
    });
});

app.delete('/disconnect', function (req, res) {
    var users = cloudant.db.use('connected_users');
    console.log('JSON-user ' + JSON.stringify(req.body));
    users.head(req.body.id).then(headers => {
        console.log(headers.etag);
        users.destroy(req.body.id, JSON.parse(headers.etag), function (err, body, header) {
            if (err) {
                res.sendStatus(400);
                console.error('[user.disconnect] ', JSON.stringify(err));
            } else {
                console.log('You have read user ' + JSON.stringify(body));
                res.send(body);
            }
        });
    });

});

let port = process.env.PORT || 3100;
app.listen(port, function () {
    console.log("Listening to port: " + port);
});
