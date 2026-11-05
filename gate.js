// Digital Media Academy: members-only check.
// Loaded on every page that only logged-in students may see. Until we know the visitor is logged in,
// the page stays hidden. A visitor who is not logged in is sent to the Login page, and comes back
// to the page they asked for after logging in.
import { configured, onUser } from './auth.js';

const html = document.documentElement;
const page = location.pathname.split('/').pop() || 'index.html';
let settled = false;
let msgBox = null;

function toLogin() {
  location.replace('login.html?next=' + encodeURIComponent(page));
}

function reveal() {
  if (msgBox) { msgBox.remove(); msgBox = null; }
  html.classList.remove('gate-trouble');
  html.classList.remove('gate-wait');
  document.body.classList.add('is-in');
}

// The login service could not be reached (slow or blocked connection): say so, instead of a blank page
function trouble() {
  if (msgBox || settled) return;
  html.classList.add('gate-trouble');
  msgBox = document.createElement('div');
  msgBox.className = 'gate-msg';
  msgBox.setAttribute('role', 'alert');
  msgBox.innerHTML =
    '<div class="gate-card"><h2>We could not check your login</h2>' +
    '<p>Please check your internet connection and try again.</p>' +
    '<button type="button" class="btn btn-primary wide" id="gateReload">Try again</button>' +
    '<a class="btn btn-ghost wide" href="login.html">Go to Login</a></div>';
  document.body.appendChild(msgBox);
  document.getElementById('gateReload').addEventListener('click', () => location.reload());
}

if (!configured) {
  toLogin();
} else {
  const timer = setTimeout(trouble, 12000);
  onUser((user) => {
    settled = true; clearTimeout(timer);
    if (user) reveal(); else toLogin();
  }).catch(() => { clearTimeout(timer); trouble(); });
}
