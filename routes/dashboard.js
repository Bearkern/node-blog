const express = require('express');
const router = express.Router();
const firebaseAdminDb = require('../connections/firebase-admin');
const striptags = require('striptags');
const moment = require('moment');
const paginateData = require('../modules/paginateData');

const categoriesRef = firebaseAdminDb.ref('/categories');
const articlesRef = firebaseAdminDb.ref('/articles');

router.get('/', (req, res) => {
  const messages = req.flash('error');

  res.render('dashboard/index', {
    currentPath: '/',
    hasErrors: messages.length > 0,
  });
});

router.get('/archives', (req, res, next) => {
  const currentPage = Number.parseInt(req.query.page) || 1;
  const status = req.query.status || 'public';
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

    const data = paginateData(articles, currentPage);

    res.render('dashboard/archives', {
      categories,
      articles: data.data,
      page: data.page,
      striptags,
      moment,
      currentPath: '/dashboard/archives/',
    });
  });
});

router.get('/article/create', (req, res, next) => {
  categoriesRef.once('value').then((snapshot) => {
    const categories = snapshot.val();
    const article = {};
    res.render('dashboard/article', { categories, article });
  });
});

router.get('/article/:id', (req, res) => {
  const id = req.params.id;
  let categories = {};
  categoriesRef.once('value').then((snapshot) => {
    categories = snapshot.val();

    return articlesRef.child(id).once('value');
  }).then((snapshot) => {
    const article = snapshot.val();

    res.render('dashboard/article', { categories, article });
  });
});

router.get('/categories', (req, res, next) => {
  categoriesRef.once('value').then((snapshot) => {
    const categories = snapshot.val();
    const info = req.flash('info');
    const hasInfo = info.length > 0;
    res.render('dashboard/categories', { categories, info, hasInfo });
  })
});

router.post('/article/create', (req, res) => {
  const data = req.body;
  const articleRef = articlesRef.push();
  const key = articleRef.key;
  const updateTime = Math.floor(Date.now() / 1000);

  data.id = key;
  data.update_time = updateTime;

  articleRef.set(data).then(() => {
    res.redirect(`/dashboard/article/${key}`);
  });
});

router.post('/article/update/:id', (req, res) => {
  const data = req.body;
  const id = req.params.id;

  articlesRef.child(id).update(data).then(() => {
    res.redirect(`/dashboard/article/${id}`);
  });
})

router.post('/article/delete/:id', (req, res) => {
  const id = req.params.id;
  articlesRef.once('value').then((snapshot) => {
    const article = snapshot.val()[id].title;
    articlesRef.child(id).remove();
    res.send(`${article}文章已刪除`);
    res.end();
  });
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