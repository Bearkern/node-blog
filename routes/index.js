const express = require('express');
const router = express.Router();
const firebaseAdminDb = require('../connections/firebase-admin');
const striptags = require('striptags');
const moment = require('moment');
const paginateData = require('../modules/paginateData');

const categoriesRef = firebaseAdminDb.ref('categories');
const articlesRef = firebaseAdminDb.ref('articles');

/* GET home page. */
router.get('/', (req, res, next) => {
  let currentPage = Number.parseInt(req.query.page) || 1;
  const status = 'public';
  let categories = {};

  categoriesRef.once('value').then((snapshot) => {
    categories = snapshot.val();
    return articlesRef.orderByChild('update_time').once('value');
  }).then((snapshot) => {
    const articles = [];

    snapshot.forEach((snapshotChild) => {
      if (status === snapshotChild.val().status) {
        articles.push(snapshotChild.val());
      }
    });

    articles.reverse();

    const data = paginateData(articles, currentPage);

    res.render('index', {
      categories,
      articles: data.data,
      page: data.page,
      striptags,
      moment
    });
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

    if(!article) {
      return res.render('error', {
        errorMessage: '找不到該文章',
      });
    }

    res.render('post', { categories, article, striptags, moment });
  });
});

router.get('/dashboard/signup', (req, res, next) => {
  res.render('dashboard/signup', { title: 'Express' });
});

module.exports = router;
