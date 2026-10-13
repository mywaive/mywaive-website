// Runs before first paint (blocking, same-origin for the CSP). Marks JS as available so
// scroll-reveal content can start hidden; if the reveal module never loads, show everything.
(function (d) {
  d.documentElement.classList.add('js');
  setTimeout(function () {
    if (!window.__revealReady) d.documentElement.classList.remove('js');
  }, 3000);
})(document);
