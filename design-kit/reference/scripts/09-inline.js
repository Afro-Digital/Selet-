(function () {
  var root = document.documentElement;
  var DEFAULT_TO_SYSTEM = false;
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  function stored() {
    try { return localStorage.getItem('settle-theme'); } catch (e) { return null; }
  }
  function apply() {
    var s = stored();
    root.classList.toggle('dark', s ? s === 'dark' : DEFAULT_TO_SYSTEM && mq.matches);
  }
  apply();
  mq.addEventListener('change', function () { if (stored()) apply(); });
  window.__settleApplyTheme = apply;
})();