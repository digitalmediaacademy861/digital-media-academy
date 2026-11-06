// Digital Media Academy: sign-in helper used by login.html and account.html.
// The Firebase library is loaded only when it is needed, so a blocked or slow connection to it
// shows a friendly message instead of breaking the page.

import { firebaseConfig } from './firebase-config.js';

const VERSION = '10.14.1';
const APP_URL = 'https://www.gstatic.com/firebasejs/' + VERSION + '/firebase-app.js';
const AUTH_URL = 'https://www.gstatic.com/firebasejs/' + VERSION + '/firebase-auth.js';

// True once the owner has pasted real settings into firebase-config.js
export const configured = !!(firebaseConfig && typeof firebaseConfig.apiKey === 'string' &&
  firebaseConfig.apiKey.length > 12 && !/^(PASTE|YOUR)/i.test(firebaseConfig.apiKey));

var ready = null;
function load() {
  if (!ready) {
    ready = Promise.all([import(APP_URL), import(AUTH_URL)]).then(function (mods) {
      var app = mods[0].initializeApp(firebaseConfig);
      return { mod: mods[1], auth: mods[1].getAuth(app) };
    });
    ready.catch(function () { ready = null; });   // allow a retry after a network failure
  }
  return ready;
}

// Calls cb(user) now and every time the person signs in or out. user is null when signed out.
export function onUser(cb) {
  return load().then(function (f) { return f.mod.onAuthStateChanged(f.auth, cb); });
}

export function signUp(name, email, password) {
  return load().then(function (f) {
    return f.mod.createUserWithEmailAndPassword(f.auth, email, password).then(function (cred) {
      var user = cred.user;
      return f.mod.updateProfile(user, { displayName: name })
        .catch(function () {})
        .then(function () { return f.mod.sendEmailVerification(user).catch(function () {}); })
        .then(function () { return user; });
    });
  });
}

export function logIn(email, password) {
  return load().then(function (f) {
    return f.mod.signInWithEmailAndPassword(f.auth, email, password).then(function (c) { return c.user; });
  });
}

export function googleLogin() {
  return load().then(function (f) {
    return f.mod.signInWithPopup(f.auth, new f.mod.GoogleAuthProvider()).then(function (c) { return c.user; });
  });
}

export function resetPassword(email) {
  return load().then(function (f) { return f.mod.sendPasswordResetEmail(f.auth, email); });
}

export function resendVerification() {
  return load().then(function (f) {
    if (!f.auth.currentUser) throw { code: 'auth/no-user' };
    return f.mod.sendEmailVerification(f.auth.currentUser);
  });
}

// A fresh sign-in token for the logged-in student (used to prove who is paying). null when signed out.
export function getIdToken() {
  return load().then(function (f) { return f.auth.currentUser ? f.auth.currentUser.getIdToken() : null; });
}

export function logOut() {
  return load().then(function (f) { return f.mod.signOut(f.auth); });
}

// Turns Firebase's technical error codes into plain sentences
export function friendlyError(e) {
  var code = (e && e.code) || '';
  var map = {
    'auth/email-already-in-use': 'There is already an account with this email. Try logging in instead.',
    'auth/invalid-email': 'That email address does not look right. Please check it.',
    'auth/weak-password': 'Please choose a stronger password with at least 8 characters.',
    'auth/missing-password': 'Please enter your password.',
    'auth/invalid-credential': 'The email or password is not correct.',
    'auth/wrong-password': 'The email or password is not correct.',
    'auth/user-not-found': 'The email or password is not correct.',
    'auth/user-disabled': 'This account has been switched off. Please contact support.',
    'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
    'auth/network-request-failed': 'No connection. Please check your internet and try again.',
    'auth/popup-closed-by-user': 'The Google window was closed before finishing. Please try again.',
    'auth/cancelled-popup-request': 'The Google window was closed before finishing. Please try again.',
    'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups for this site and try again.',
    'auth/operation-not-allowed': 'This sign-in method is not switched on yet. Please contact support.',
    'auth/unauthorized-domain': 'This website address is not approved for sign-in yet. Please contact support.',
    'auth/no-user': 'Please log in first.'
  };
  if (map[code]) return map[code];
  if (!code) return 'We could not reach the sign-in service. Please check your connection and try again.';
  return 'Something went wrong. Please try again, or message support on WhatsApp.';
}
