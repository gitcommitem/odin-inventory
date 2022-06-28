var async = require('async');

var Category = require('../models/category');
var Item = require('../models/item');

exports.index = function (req, res) {
  async.parallel(
    {
      item_count: function (callback) {
        Item.estimatedDocumentCount({}, callback);
      },
      item_list: function (callback) {
        Item.find({}, callback).populate('category');
      },
      category_list: function (callback) {
        Category.find({}, callback);
      }
    },
    function (err, results) {
      if (err) {
        return next(err);
      }

      if (results.item_list === null) {
        var err = new Error('No items found');
        err.status = 404;
        return next(err);
      }
      res.render('inventory', {
        categories: results.category_list,
        items: results.item_list,
        current_category: 'All',
        number_of_items: results.item_count
      });
    }
  );
};

exports.newitem = function (req, res) {
  async.parallel(
    {
      category_list: function (callback) {
        Category.find({}, callback);
      }
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render('newitem', {
        categories: results.category_list
      });
    }
  );
};

exports.newcategory = function (req, res) {
  async.parallel(
    {
      category_list: function (callback) {
        Category.find({}, callback);
      }
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render('newcategory', {
        categories: results.category_list
      });
    }
  );
};
