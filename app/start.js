"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.json());

//register routes
require("./routes")(app);

// 404 global handler, if the url provided by the user does not match any one in the route file
app.use(function (req, res, next) {
    console.log("resource not found", req.url);
    next(new Error("resource not found"));
});

// global handler
app.use(function (error, req, res, next) {
    console.log(error);
    console.log(error.stack);
    res.json({
        error: error.message
    });
    next = null; //suppress jshint error
});

app.listen("3000", function () {
    console.log("express server started");
});
