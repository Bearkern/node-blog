const express = require('express');
const router = express.Router();
const firebaseClientApp = require('../connections/firebase-client');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const auth = getAuth(firebaseClientApp);

router.get('/signup', (req, res) => {
  const message = req.flash('error');
  res.render('dashboard/signup', {
    message,
    hasErrors: message.length > 0,
  });
});

router.get('/signin', (req, res) => {
  const message = req.flash('error');
  res.render('dashboard/signin', {
    message,
    hasErrors: message.length > 0,
  });
});

router.get('/signout', (req, res) => {
  req.session.uid = '';
  res.redirect('/auth/signin');
});

router.post('/signup', (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.flash('error', '請輸入一致的密碼');
    res.redirect('/auth/signup');
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      res.redirect('/auth/signin');
    }).catch((error) => {
      console.dir(error);
      req.flash('error', error.message);
      res.redirect('/auth/signup');
    });
});

router.post('/signin', (req, res) => {
  const { email, password } = req.body;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      req.session.uid = userCredential.user.uid;
      req.session.mail = email;
      res.redirect('/dashboard');
    }).catch((error) => {
      console.dir(error);
      req.flash('error', error.message);
      req.redirect('/auth/signin');
    });
});

module.exports = router;