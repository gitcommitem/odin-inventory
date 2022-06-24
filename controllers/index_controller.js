var async = require('async');

var Category = require('../models/category');
var Item = require('../models/item');

exports.index = function (req, res) {
  async.parallel(
    {
      item_count: function (callback) {
        Item.estimatedDocumentCount({}, callback);
      },
      low_stock_count: function (callback) {
        Item.countDocuments({ stock: { $lt: 10 } }, callback);
      },
      out_of_stock_count: function (callback) {
        Item.countDocuments({ stock: 0 }, callback);
      },
      category_count: function (callback) {
        Category.estimatedDocumentCount({}, callback);
      }
    },
    function (err, results) {
      res.render('index', { error: err, data: results });
    }
  );
};
