var express = require('express');
var router = express.Router();

var inventory_controller = require('../controllers/inventory_controller');

/* GET home page. */
router.get('/', inventory_controller.index);
router.get('/category/:id', inventory_controller.category);

router.get('/new-item', inventory_controller.newitem_get);
router.get('/new-category', inventory_controller.category_new_get);
router.get('/update-item/:id', inventory_controller.item_update_get);
router.get('/update-category/:id', inventory_controller.category_update_get);

router.post('/new-item', inventory_controller.newitem_post);
router.post('/delete-item', inventory_controller.item_delete_post);
router.post('/update-item/:id', inventory_controller.item_update_post);

router.post('/new-category', inventory_controller.category_new_post);
router.post('/delete-category', inventory_controller.category_delete_post);
router.post('/update-category/:id', inventory_controller.category_update_post);

router.post('/search', inventory_controller.search_post);

module.exports = router;
