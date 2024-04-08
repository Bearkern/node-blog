const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/post', (req, res, next) => {
  res.render('post', { title: 'Express' });
});

router.get('/dashboard/signup', (req, res, next) => {
  res.render('dashboard/signup', { title: 'Express' });
});

module.exports = router;
