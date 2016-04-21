"use strict";
var MongoClient = require("mongodb").MongoClient;
var connectUrl = "mongodb://localhost:27017/click";
var _ = require("lodash");


function getDB() {
    return MongoClient.connect(connectUrl);
}

function getCollection(db, documentName) {
    return db.collection(documentName);
}

module.exports = function (app) {

    app.post("/links", function (req, res, next) {

        //encode this attr to allow space (space=>%20)
        var title = req.body.title && encodeURIComponent(req.body.title);
        var link = req.body.link;
        if (_.isEmpty(title) || _.isEmpty(link)) {
            next(new Error("Link or title is empty"));
            return;
        }

        getDB()
            .then(function (db) {
                var collection = getCollection(db, "links");
                return collection.insertOne(
                    {
                        link: link,
                        title: title,
                        clicks: 0
                    }
                );
            })
            .then(function (result) {
                //{"ok":1,"n":1} means the document was inserted
                res.json(result);
            })
            .catch(function (err) {
                next(err);
            });
    });

    app.get("/links", function (req, res, next) {
        getDB()
            .then(function (db) {
                var collection = getCollection(db, "links");
                return collection.find({});
            })
            .then(function (documents) {
                return documents.toArray();
            })
            .then(function (documentsArray) {
                res.json(documentsArray);
            })
            .catch(function (err) {
                next(err);
            });
    });

    app.get("/click/:title", function (req, res, next) {
        var url = null;
        var collection = null;
        var title = req.params.title && encodeURIComponent(req.params.title);
        getDB()
            .then(function (db) {
                collection = getCollection(db, "links");
                return collection.findOne({title: title});
            })
            .then(function (doc) {
                if (_.isNil(doc)) {
                    next(new Error("doc with title " + req.params.title + " is not found"));
                }
                url = doc.link;
                return collection.updateOne({title: title},
                    {
                        $inc: {
                            clicks: 1
                        }
                    }
                );
            })
            .then(function (commandResult) { //jshint ignore:line
                res.redirect(url);
            });
    });

    app.delete("/links", function (req, res, next) {
        getDB()
            .then(function (db) {
                var collection = getCollection(db, "links");
                return collection.remove({});
            })
            .then(function (result) {
                //{"ok":1,"n":100} means the document was deleted,n refers to the count of the deleted document
                res.json(result);
            })
            .catch(function (err) {
                next(err);
            });
    });


};
