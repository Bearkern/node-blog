const express = require('express');
const router = express.Router();
const firebaseAdminDb = require('../connections/firebase-admin');
const striptags = require('striptags');
const moment = require('moment');

const categoriesRef = firebaseAdminDb.ref('categories');
const articlesRef = firebaseAdminDb.ref('articles');

/* GET home page. */
router.get('/', (req, res, next) => {
  const status = 'public';
  let categories = {};

  categoriesRef.once('value').then((snapshot) => {
    categories = snapshot.val();
    return articlesRef.orderByChild('update_time').once('value');
  }).then((snapshot) => {
    const articles = [];
    snapshot.forEach((snapshotChild) => {
      if(status === snapshotChild.val().status) {
        articles.push(snapshotChild.val());
      }
    });
    articles.reverse();
    res.render('index', { categories, articles, striptags, moment });
  });
});

router.get('/post/:id', (req, res, next) => {
  const id = req.params.id;
  let categories = {};
  categoriesRef.once('value').then((snapshot) => {
    categories = snapshot.val();

    return articlesRef.child(id).once('value');
  }).then((snapshot) => {
    const article = snapshot.val();

    res.render('post', { categories, article, striptags, moment });
  });
});

router.get('/dashboard/signup', (req, res, next) => {
  res.render('dashboard/signup', { title: 'Express' });
});

module.exports = router;
