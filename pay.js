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

function start() {
  openModal();
  if (!payReady) { show('lessons'); return; }            // payments not switched on yet
  show('check');
  userReady.then(function () { return api('/status'); }).then(function (d) {
    if (d && d.paid) show('lessons'); else show('pay');
  }).catch(function () { fail('We could not check your payment. Please check your connection and try again.', ''); });
}

function confirmPayment(ref) {
  lastRef = ref; show('check');
  api('/verify', { method: 'POST', body: JSON.stringify({ reference: ref }) }).then(function (d) {
    if (d && d.paid) show('lessons');
    else fail('We could not confirm your payment yet. If money left your account, tap "Check again" in a minute, or message support with your reference: ' + ref, ref);
  }).catch(function () { fail('We could not reach the payment checker. If money left your account, tap "Check again", or message support with your reference: ' + ref, ref); });
}

function loadPaystack() {
  return new Promise(function (resolve, reject) {
    if (window.PaystackPop) return resolve();
    var s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.onload = resolve; s.onerror = function () { reject(new Error('paystack')); };
    document.head.appendChild(s);
  });
}

function pay() {
  var btn = document.getElementById('payBtn');
  btn.disabled = true;
  Promise.all([userReady, loadPaystack()]).then(function (r) {
    var u = r[0];
    if (!u) throw new Error('login');
    var ref = 'DMA_' + u.uid.slice(0, 6) + '_' + Date.now();
    var handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: u.email,
      amount: PRICE_KOBO,
      currency: 'NGN',
      ref: ref,
      metadata: { uid: u.uid, name: u.displayName || '', course: 'video-editing' },
      callback: function (response) { confirmPayment(response.reference); },
      onClose: function () { btn.disabled = false; }
    });
    handler.openIframe();
  }).catch(function () {
    btn.disabled = false;
    document.getElementById('payMsg').textContent = 'We could not open the payment window. Please check your connection and try again.';
  });
}

if (payReady) {
  document.querySelectorAll('[data-open-lessons]').forEach(function (b) { b.textContent = 'Start learning · ' + price; });
  document.querySelectorAll('.price-now').forEach(function (e) { e.textContent = price; });
}
document.querySelectorAll('[data-open-lessons]').forEach(function (b) { b.addEventListener('click', start); });
document.getElementById('payBtn').addEventListener('click', pay);
document.getElementById('errRetry').addEventListener('click', function () { if (lastRef) confirmPayment(lastRef); });
document.getElementById('closeLessons').addEventListener('click', closeModal);
modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
