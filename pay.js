// Digital Media Academy: "Start learning" window. Asks the payment checker whether the student has paid,
// shows the Pay button if not, and opens the lessons once payment is confirmed.
import { onUser, getIdToken } from './auth.js';
import { PAYSTACK_PUBLIC_KEY, WORKER_URL, PRICE_KOBO } from './pay-config.js';

var modal = document.getElementById('lessonModal');
var views = { check: 'viewCheck', pay: 'viewPay', lessons: 'viewLessons', error: 'viewError' };
var payReady = /^https:\/\//.test(WORKER_URL) && /^pk_/.test(PAYSTACK_PUBLIC_KEY);
var price = '₦' + (PRICE_KOBO / 100).toLocaleString('en-NG');
var user = null, lastRef = '';
var userReady = new Promise(function (resolve) {
  onUser(function (u) { user = u; resolve(u); }).catch(function () { resolve(null); });
});

function show(name) {
  Object.keys(views).forEach(function (k) { document.getElementById(views[k]).hidden = (k !== name); });
  document.getElementById('lessonTitle').textContent = name === 'lessons' ? 'Choose a lesson' : name === 'pay' ? 'Start learning' : 'Video Editing';
}
function openModal() { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal() { modal.classList.remove('open'); document.body.style.overflow = ''; }
function fail(msg, ref) {
  document.getElementById('errText').textContent = msg;
  var wa = document.getElementById('errWa');
  wa.href = 'https://wa.me/2347042591011?text=' + encodeURIComponent('Hello Digital Media Academy Support, I paid for Video Editing but my lessons did not open. My payment reference is ' + (ref || 'unknown') + '.');
  document.getElementById('errRetry').hidden = !ref;
  show('error');
}
function api(path, opts) {
  return getIdToken().then(function (token) {
    if (!token) throw new Error('login');
    opts = opts || {};
    opts.headers = Object.assign({ 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, opts.headers || {});
    return fetch(WORKER_URL.replace(/\/$/, '') + path, opts).then(function (r) { return r.json().catch(function () { return {}; }); });
  });
    }
