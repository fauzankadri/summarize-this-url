/*jshint esversion: 6 */
const path = require('path');
const express = require('express');
const request = require('request');
const mongoose = require('mongoose');

var bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(express.static('static'));

mongoose.connect(
    "mongodb://fauzan:fauzan@ds053218.mlab.com:53218/summaryurl"
);

function findOne(name, url, callback) {
    mongoose.connection.db.collection(name, function (err, collection) {
        collection.findOne(url, callback);
    });
}

function update(name, url, mods, opts = {}, callback) {
    mongoose.connection.db.collection(name, function (err, collection) {
        collection.update(url, mods, opts, callback);
    });
}

function ignoreFavicon(req, res, next) {
    if (req.originalUrl === '/favicon.ico') {
        res.status(204).json({ nope: true });
    } else {
        next();
    }
}

app.use(ignoreFavicon);

app.use(function (req, res, next) {
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.post('/', function (req, res, next) {
    res.json(req.body);
});

// add methods

app.get('/api/summarize/url/:sentences/:url/', function (req, res, next) {
    console.log("APP");
    req.params.url = decodeURIComponent(req.params.url);
    console.log(req.params.url)
    findOne('urls', {
        _id: { url: req.params.url, sentences: req.params.sentences }
    }, function (err, smry) {
        if (err) return res.status(500).json({ message: "Server Error" });
        if (smry) {
            return res.json({
                content: smry.content,
                title: smry.title,
                reduced: smry.reduced
            });
        }
        reqUrl = 'http://api.smmry.com/&SM_API_KEY=5BF8AB72DC&SM_LENGTH=' + req.params.sentences + '&SM_URL=' + req.params.url;
        //reqUrl = 'http://api.smmry.com/&SM_API_KEY=5BF8AB72DC&SM_LENGTH=7&SM_URL=https://en.wikipedia.org/wiki/Human%E2%80%93computer_interaction'
        console.log(reqUrl);
        request(reqUrl, function (error, response, body) {
            if (error) return res.status(500).send('Server Error');
            //body = JSON.stringify(body);
            console.log("body: ", body);
            if (body[0] == "<") {
                return res.json({ message: 'Bad error' });
            }
            body = JSON.parse(body);
            if (body.sm_api_content != undefined && body.sm_api_content_reduced != undefined) {
                update(
                    "urls",
                    { _id: { url: req.params.url, sentences: req.params.sentences } },
                    {
                        _id: { url: req.params.url, sentences: req.params.sentences },
                        content: body.sm_api_content,
                        title: body.sm_api_title,
                        reduced: body.sm_api_content_reduced
                    },
                    { upsert: true },
                    function (err) {
                        if (err) return res.status(500).json({ message: "Server Error" });
                        return res.json({
                            content: body.sm_api_content,
                            title: body.sm_api_title,
                            reduced: body.sm_api_content_reduced
                        });
                    }
                )
            }
            else {
                return res.json({ message: "Invalid Url" });
            }
        })

    })
});

app.get('/favicon.ico', function (req, res) {
    console.log("favicon")
    res.status(204);
});


app.use(function (req, res, next) {
    console.log("HTTP Response", res.statusCode);
});

const http = require('http');
const PORT = process.env.PORT || 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});