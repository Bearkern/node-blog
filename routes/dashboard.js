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
  categoriesRef.once('value').then((snapshot) => {
    const categories = snapshot.val();
    const info = req.flash('info');
    const hasInfo = info.length > 0;
    res.render('dashboard/categories', { categories, info, hasInfo });
  })
});

router.post('/categories/create', (req, res) => {
  const data = req.body;
  const categoryRef = categoriesRef.push();
  const key = categoryRef.key;
  data.id = key;

  categoriesRef.orderByChild('path').equalTo(data.path).once('value').then((snapshot) => {
    if (snapshot.val() !== null) {
      req.flash('info', `已有「${data.path}」路徑`);
      res.redirect('/dashboard/categories');
    } else {
      categoryRef.set(data).then(() => {
        res.redirect('/dashboard/categories');
      });
    }
  });
});

router.post('/categories/delete/:id', (req, res) => {
  const id = req.params.id;
  categoriesRef.once('value').then((snapshot) => {
    const category = snapshot.val()[id].name;
    categoriesRef.child(id).remove();
    req.flash('info', `「${category}」欄位已刪除`);
    res.redirect('/dashboard/categories');
  });
});

module.exports = router;