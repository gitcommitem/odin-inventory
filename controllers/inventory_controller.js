var async = require('async');

var Category = require('../models/category');
var Item = require('../models/item');

const { body, validationResult } = require('express-validator');

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

exports.newitem_get = function (req, res) {
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

exports.newcategory_get = function (req, res) {
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

exports.newcategory_post = [
  // Validate and sanitize the name field.
  body('name', 'Category name required')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    var category = new Category({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('newcategory', {
        errors: errors.array()
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Category with same name already exists.
      Category.findOne({ name: req.body.name }).exec(function (
        err,
        found_category
      ) {
        if (err) {
          return next(err);
        }

        if (found_category) {
          alert('This category already exists.');
        } else {
          category.save(function (err) {
            if (err) {
              return next(err);
            }
            // Category saved. Redirect.
            res.redirect('/inventory/');
          });
        }
      });
    }
  }
];
