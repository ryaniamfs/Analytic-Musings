(function () {
  var KEY = 'am-color';
  var root = document.documentElement;

  function preferred() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function apply(mode) {
    root.setAttribute('data-color', mode);
    try { localStorage.setItem(KEY, mode); } catch (e) {}
  }

  if (!root.getAttribute('data-color')) {
    apply(preferred());
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('color-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-color') === 'dark' ? 'light' : 'dark';
      apply(next);
    });
  });
})();
