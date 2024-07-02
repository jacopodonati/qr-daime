const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'homepage_title'
  });
});

module.exports = router;
