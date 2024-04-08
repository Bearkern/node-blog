const express = require('express');
const router = express.Router();
const firebaseAdminDb = require('../connections/firebase-admin');

const categoriesRef = firebaseAdminDb.ref('/categories');

router.get('/archives', (req, res, next) => {
  res.render('dashboard/archives', { title: 'Express' });
});
router.get('/article', (req, res, next) => {
  res.render('dashboard/article', { title: 'Express' });
});
router.get('/categories', (req, res, next) => {
  res.render('dashboard/categories', { title: 'Express' });
});

router.post('/categories/create', (req, res) => {
  const data = req.body;
  const categoryRef = categoriesRef.push();
  const key = categoryRef.key;
  data.id = key;

  categoryRef.set(data).then(() => {
    res.redirect('/dashboard/categories');
  })
})

module.exports = router;