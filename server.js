// server.js

const express = require("express");
const server = express();

const body_parser = require("body-parser");


server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    // authorized headers for preflight requests
    // https://developer.mozilla.org/en-US/docs/Glossary/preflight_request
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();

    server.options('*', (req, res) => {
        // allowed XHR methods  
        res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
        res.send();
    });
});
// parse JSON (application/json content-type)
server.use(body_parser.json());

const port = 4000;

// << db setup >>
const db = require("./db");
const dbName = "reservas";
const collectionName = "historicos";

db.initialize(dbName, collectionName, function (dbCollection) { // successCallback
   // get all items
   dbCollection.find().toArray(function (err, result) {
      if (err) throw err;
      console.log(result);

      // << return response to client >>
   });

   // << db CRUD routes >>
   server.post("/historicos", (request, response) => {
      const item = request.body;
      dbCollection.insertOne(item, (error, result) => { // callback of insertOne
         if (error) throw error;
         // return updated list
         dbCollection.find().toArray((_error, _result) => { // callback of find
            if (_error) throw _error;
            response.json(_result);
         });
      });
   });

   server.get("/historicos/:id", (request, response) => {
      const itemId = request.params.id;

      dbCollection.findOne({ id: itemId }, (error, result) => {
         if (error) throw error;
         // return item
         response.json(result);
      });
   });

   server.get("/historicos", (request, response) => {
      // return updated list
      dbCollection.find().toArray((error, result) => {
         if (error) throw error;
         response.json(result);
      });
   });

   server.put("/historicos/:id", (request, response) => {
      const itemId = request.params.id;
      const item = request.body;
      console.log("Editing item: ", itemId, " to be ", item);

      dbCollection.updateOne({ id: itemId }, { $set: item }, (error, result) => {
         if (error) throw error;
         // send back entire updated list, to make sure frontend data is up-to-date
         dbCollection.find().toArray(function (_error, _result) {
            if (_error) throw _error;
            response.json(_result);
         });
      });
   });

   server.delete("/historicos/:id", (request, response) => {
      const itemId = request.params.id;
      console.log("Delete item with id: ", itemId);

      dbCollection.deleteOne({ id: itemId }, function (error, result) {
         if (error) throw error;
         // send back entire updated list after successful request
         dbCollection.find().toArray(function (_error, _result) {
            if (_error) throw _error;
            response.json(_result);
         });
      });
   });

}, function (err) { // failureCallback
   throw (err);
});

server.listen(port, () => {
   console.log(`Server listening at ${port}`);
});