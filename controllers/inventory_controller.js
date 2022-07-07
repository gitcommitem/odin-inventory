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

exports.newitem_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === 'undefined') req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
  },

  // Validate and sanitize fields.
  body('productname', 'Product name must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('category.*', 'Category must not be empty.').escape(),
  body('price', 'Price must not be empty.')
    .trim()
    .isNumeric()
    .escape(),
  body('stock', 'Stock must not be empty')
    .trim()
    .isNumeric()
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create an Item object with escaped and trimmed data.
    var item = new Item({
      productname: req.body.productname,
      category: req.body.category,
      price: req.body.price,
      stock: req.body.stock
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      const stringError = new Error(JSON.stringify(errors.array()));

      // Get categories for form to show on re-rendered form.
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
            categories: results.category_list,
            errors: stringError
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Save item.
      item.save(function (err) {
        if (err) {
          return next(err);
        }
        //successful - redirect.
        res.redirect('/inventory/');
      });
    }
  }
];

exports.item_update_get = function (req, res) {
  async.parallel(
    {
      category_list: function (callback) {
        Category.find({}, callback);
      },
      item: function (callback) {
        Item.findById(req.params.id, callback).populate('category');
      }
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render('newitem', {
        categories: results.category_list,
        update: true,
        item: results.item
      });
    }
  );
};

exports.item_update_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === 'undefined') req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
  },

  // Validate and sanitize fields.
  body('productname', 'Product name must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('category.*', 'Category must not be empty.').escape(),
  body('price', 'Price must not be empty.')
    .trim()
    .isNumeric()
    .escape(),
  body('stock', 'Stock must not be empty')
    .trim()
    .isNumeric()
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create an Item object with escaped and trimmed data.
    var item = new Item({
      productname: req.body.productname,
      category: req.body.category,
      price: req.body.price,
      stock: req.body.stock,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      const stringError = new Error(JSON.stringify(errors.array()));

      // Get categories for form to show on re-rendered form.
      async.parallel(
        {
          category_list: function (callback) {
            Category.find({}, callback);
          },
          item: function (callback) {
            Item.findById(req.params.id, callback).populate('category');
          }
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          res.render('newitem', {
            categories: results.category_list,
            errors: stringError,
            update: true,
            item: results.item
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Save item.
      Item.findByIdAndUpdate(req.params.id, item, {}, function (err) {
        if (err) {
          return next(err);
        }
        //successful - redirect.
        res.redirect('/inventory/');
      });
    }
  }
];

exports.item_delete_post = function (req, res, next) {
  Item.findByIdAndDelete(req.body.id, function deleteItem (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/inventory/');
  });
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
