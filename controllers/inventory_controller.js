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

exports.category = function (req, res) {
  async.parallel(
    {
      item_count: function (callback) {
        Item.countDocuments({ category: req.params.id }, callback);
      },
      item_list: function (callback) {
        Item.find({ category: req.params.id }, callback).populate('category');
      },
      category_list: function (callback) {
        Category.find({}, callback);
      },
      current_category: function (callback) {
        Category.find({ _id: req.params.id }, callback);
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
        category_view: true,
        categories: results.category_list,
        items: results.item_list,
        current_category: results.current_category,
        number_of_items: results.item_count
      });
    }
  );
};

exports.search_post = [
  //Validate and sanitize search item
  body('search', 'Search for product name')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  function (req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Search field is empty, redirect to inventory page / do not search
      res.redirect('/inventory/');
    }

    async.parallel(
      {
        item_count: function (callback) {
          Item.countDocuments(
            { productname: { $regex: req.body.search, $options: 'i' } },
            callback
          );
        },
        item_list: function (callback) {
          Item.find(
            { productname: { $regex: req.body.search, $options: 'i' } },
            callback
          ).populate('category');
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
          current_category: `search results for "${req.body.search}"`,
          number_of_items: results.item_count
        });
      }
    );
  }
];

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

exports.category_new_get = function (req, res) {
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
      res.render('categoryform', {
        categories: results.category_list
      });
    }
  );
};

exports.category_new_post = [
  // Validate and sanitize the name field.
  body('name', 'Category name required')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    var category = new Category({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('categoryform', {
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
          res.redirect(`/inventory/category/${found_category.id}`);
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

exports.category_update_get = function (req, res) {
  async.parallel(
    {
      category_list: function (callback) {
        Category.find({}, callback);
      },
      category: function (callback) {
        Category.findById(req.params.id, callback);
      }
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render('categoryform', {
        categories: results.category_list,
        update: true,
        category: results.category
      });
    }
  );
};

exports.category_update_post = [
  // Validate and sanitize the name field.
  body('name', 'Category name required')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Update category
    var category = new Category({ name: req.body.name, _id: req.params.id });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('categoryform', {
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
          res.redirect(`/inventory/category/${found_category.id}`);
        } else {
          // Data from form is valid. Save item.
          Category.findByIdAndUpdate(req.params.id, category, {}, function (
            err
          ) {
            if (err) {
              return next(err);
            }
            //successful - redirect.
            res.redirect('/inventory/');
          });
        }
      });
    }
  }
];

exports.category_delete_post = function (req, res, next) {
  Category.findByIdAndDelete(req.body.id, function deleteItem (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/inventory/');
  });
};
