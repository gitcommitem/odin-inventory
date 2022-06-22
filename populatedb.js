#! /usr/bin/env node

//Modified populatedb.js from MDN express tutorial

var async = require('async');
var Category = require('./models/category');

var dbURL = require('./.config');

var mongoose = require('mongoose');
var mongoDB = dbURL;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function categoryCreate (name, cb) {
  var category = new Category({ name: name });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    cb(null, category);
  });
}

function createCategories (cb) {
  async.series(
    [
      function (callback) {
        categoryCreate('Books', callback);
      },
      function (callback) {
        categoryCreate('Electronics ', callback);
      },
      function (callback) {
        categoryCreate('Office Supplies', callback);
      },
      function (callback) {
        categoryCreate('Beauty', callback);
      },
      function (callback) {
        categoryCreate('Health', callback);
      }
    ],
    // optional callback
    cb
  );
}

async.series(
  [createCategories],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err);
    } else {
      console.log('ok!');
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
