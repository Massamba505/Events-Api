var express = require('express');
var router = express.Router();
const { authenticate } = require('../middlewares/protect.middleware');

/* GET home page. */
router.get('/me',authenticate, function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
