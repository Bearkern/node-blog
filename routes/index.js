const express = require('express');
const router = express.Router();
const firebaseAdminDb = require('../connections/firebase-admin');
const striptags = require('striptags');
const moment = require('moment');

const categoriesRef = firebaseAdminDb.ref('categories');
const articlesRef = firebaseAdminDb.ref('articles');

/* GET home page. */
router.get('/', (req, res, next) => {
  let currentPage = req.query.page || 1;
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

    const totalItems = articles.length;
    const perpage = 3;
    const totalPages = Math.ceil(totalItems / perpage);

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    const minItem = (currentPage * perpage) - perpage + 1;
    const maxItem = (currentPage * perpage);

    console.log('總筆數:', totalItems, '每頁幾筆:', perpage, '總頁數:', totalPages, '每頁起始筆數:', minItem, '每頁結束筆數:', maxItem);

    const data = [];
    articles.forEach((item, index) => {
      const itemNum = index + 1;
      if (itemNum >= minItem && itemNum <= maxItem) {
        data.push(item);
      }
    });

    const page = {
      totalPages,
      currentPage,
      hasPre: currentPage > 1,
      hasNext: currentPage < totalPages,
    };

    res.render('index', { categories, articles: data, page, striptags, moment });
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
