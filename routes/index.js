var express = require('express');
var router = express.Router();

const metrics = [
  {
    label: 'Number of Items',
    count: 10
  },
  {
    label: 'Low Stock Items',
    count: 3
  },
  {
    label: 'Out of Stock Items',
    count: 2
  },
  {
    label: 'Number of Categories',
    count: 5
  }
];

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    metrics: metrics
  });
});

module.exports = router;
