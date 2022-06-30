var express = require('express');
var router = express.Router();

var inventory_controller = require('../controllers/inventory_controller');

/* GET home page. */
router.get('/', inventory_controller.index);

router.get('/new-item', inventory_controller.newitem_get);
router.get('/new-category', inventory_controller.newcategory_get);

router.post('/new-item', inventory_controller.newitem_post);
router.post('/delete-item', inventory_controller.item_delete_post);
router.post('/new-category', inventory_controller.newcategory_post);

module.exports = router;
