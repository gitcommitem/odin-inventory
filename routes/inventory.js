var express = require('express');
var router = express.Router();

const categories = ['category 1', 'category 2'];
const items = [
  {
    productname: 'item name',
    id: '12345',
    category: 'category 1',
    price: '$5.00',
    stock: 99,
    imgsrc: '/',
    imgalt: 'no image'
  },
  {
    productname: 'item name',
    id: '12345',
    category: 'category 1',
    price: '$5.00',
    stock: 99,
    imgsrc: '/',
    imgalt: 'no image'
  },
  {
    productname: 'item name',
    id: '12345',
    category: 'category 1',
    price: '$5.00',
    stock: 99,
    imgsrc: '/',
    imgalt: 'no image'
  }
];

const itemsLength = items.length;

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('inventory', {
    currentCategory: 'All',
    categories: categories,
    items: items,
    number_of_items: itemsLength
  });
});

module.exports = router;
