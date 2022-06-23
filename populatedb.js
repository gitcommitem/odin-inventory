#! /usr/bin/env node

//Modified populatedb.js from MDN express tutorial

var async = require('async');
var Category = require('./models/category');
var Item = require('./models/item');

var dbURL = require('./.config');

var mongoose = require('mongoose');
var mongoDB = dbURL;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Categories are pushed into the array in the following format:
//{
// name: 'Books',
// _id: new ObjectId("62b3df174cb38a89265a3085"),
// __v: 0
//}
var categories = [];

function categoryCreate (name, cb) {
  var category = new Category({ name: name });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category);
    console.log(categories);
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

function randomCategory () {
  return Math.floor(Math.random() * 4);
}

function randomStock () {
  return Math.floor(Math.random() * (99 - 0 + 1));
}

function randomPrice () {
  return Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
}

function itemName (start, offset) {
  return 'Item' + ' ' + (start + offset);
}

function itemCreate (name, category, price, stock, imgsrc, imgalt, cb) {
  var item = new Item({
    productname: name,
    category: category,
    price: price,
    stock: stock,
    imgsrc: imgsrc,
    imgalt: imgalt
  });

  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Item: ' + item);
    cb(null, item);
  });
}

function createItems (cb) {
  //Must be parallel so that it can use category array after the array has all the necessary data pushed into it
  async.parallel(
    [
      function (callback) {
        var index = randomCategory();
        itemCreate(
          itemName(0, 1),
          [categories[index]],
          randomPrice(),
          randomStock(),
          '',
          'No image',
          callback
        );
      },
      function (callback) {
        var index = randomCategory();
        itemCreate(
          itemName(0, 2),
          [categories[index]],
          randomPrice(),
          randomStock(),
          '',
          'No image',
          callback
        );
      },
      function (callback) {
        var index = randomCategory();
        itemCreate(
          itemName(0, 3),
          [categories[index]],
          randomPrice(),
          randomStock(),
          '',
          'No image',
          callback
        );
      },
      function (callback) {
        var index = randomCategory();
        itemCreate(
          itemName(0, 4),
          [categories[index]],
          randomPrice(),
          randomStock(),
          '',
          'No image',
          callback
        );
      },
      function (callback) {
        var index = randomCategory();
        itemCreate(
          itemName(0, 5),
          [categories[index]],
          randomPrice(),
          randomStock(),
          '',
          'No image',
          callback
        );
      },
      function (callback) {
        var index = randomCategory();
        itemCreate(
          itemName(0, 6),
          [categories[index]],
          randomPrice(),
          randomStock(),
          '',
          'No image',
          callback
        );
      },
      function (callback) {
        var index = randomCategory();
        itemCreate(
          itemName(0, 7),
          [categories[index]],
          randomPrice(),
          randomStock(),
          '',
          'No image',
          callback
        );
      },
      function (callback) {
        var index = randomCategory();
        itemCreate(
          itemName(0, 8),
          [categories[index]],
          randomPrice(),
          randomStock(),
          '',
          'No image',
          callback
        );
      },
      function (callback) {
        var index = randomCategory();
        itemCreate(
          itemName(0, 9),
          [categories[index]],
          randomPrice(),
          randomStock(),
          '',
          'No image',
          callback
        );
      },
      function (callback) {
        var index = randomCategory();
        itemCreate(
          itemName(0, 10),
          [categories[index]],
          randomPrice(),
          randomStock(),
          '',
          'No image',
          callback
        );
      }
    ],
    // optional callback
    cb
  );
}

async.series(
  [createCategories, createItems],
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
