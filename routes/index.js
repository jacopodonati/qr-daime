const express = require('express');
const router = express.Router();
const i18n = require('i18n');

router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'homepage_title'
  });
});

module.exports = router;
