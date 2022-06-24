var express = require('express');
var router = express.Router();

var inventory_controller = require('../controllers/inventory_controller');

/* GET home page. */
router.get('/', inventory_controller.index);

module.exports = router;
