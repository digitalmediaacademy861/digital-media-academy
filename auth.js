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
