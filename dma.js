/* Digital Media Academy: small script shared by every page (footer year, offline helper, install button) */
(function () {
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // Offline helper
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }

  // "Install app" link (only on the cover page, and only when the browser offers it)
  var installBtn = document.getElementById('installBtn');
  if (installBtn) {
    var evt = null;
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault(); evt = e; installBtn.hidden = false;
    });
    installBtn.addEventListener('click', function () {
      if (!evt) return;
      evt.prompt();
      evt.userChoice.then(function () { evt = null; installBtn.hidden = true; });
    });
    window.addEventListener('appinstalled', function () { installBtn.hidden = true; });
  }
})();
