var express = require('express');
var router = express.Router();

var inventory_controller = require('../controllers/inventory_controller');

/* GET home page. */
router.get('/', inventory_controller.index);

router.get('/new-item', inventory_controller.newitem);
router.get('/new-category', inventory_controller.newcategory);

module.exports = router;
