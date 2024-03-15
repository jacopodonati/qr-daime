const express = require('express');
const router = express.Router();
const i18n = require('i18n');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: i18n.__('homepage_title') + ' - ' + i18n.__('app_name')
  });
});

module.exports = router;
