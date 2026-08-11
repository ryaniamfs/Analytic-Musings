(function () {
  if (document.body.getAttribute('data-layout') !== 'modern') return;

  var toc = document.getElementById('toc');
  var main = document.querySelector('.content-main');
  if (!toc || !main) return;

  var headings = Array.prototype.slice.call(
    main.querySelectorAll('h2, h3')
  ).filter(function (el) {
    return !el.classList.contains('post-title') &&
           !el.classList.contains('page-title') &&
           el.closest('.related') === null;
  });

  if (headings.length < 2) {
    toc.hidden = true;
    document.querySelector('.content--with-toc') &&
      document.querySelector('.content--with-toc').classList.remove('content--with-toc');
    return;
  }

  function slugify(text) {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  headings.forEach(function (h, i) {
    if (!h.id) {
      var base = slugify(h.textContent) || ('section-' + i);
      var id = base;
      var n = 2;
      while (document.getElementById(id)) {
        id = base + '-' + n;
        n += 1;
      }
      h.id = id;
    }
  });

  var list = document.createElement('nav');
  list.className = 'toc-nav';
  var title = document.createElement('div');
  title.className = 'toc-title';
  title.textContent = 'On this page';
  list.appendChild(title);

  var ul = document.createElement('ul');
  ul.className = 'toc-list';
  var currentH2Li = null;

  headings.forEach(function (h) {
    var li = document.createElement('li');
    li.className = 'toc-item toc-item--' + h.tagName.toLowerCase();
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.dataset.target = h.id;
    li.appendChild(a);

    if (h.tagName === 'H2') {
      ul.appendChild(li);
      currentH2Li = li;
      var sub = document.createElement('ul');
      sub.className = 'toc-sublist';
      li.appendChild(sub);
    } else if (currentH2Li) {
      currentH2Li.querySelector('.toc-sublist').appendChild(li);
    } else {
      ul.appendChild(li);
    }
  });

  list.appendChild(ul);
  toc.appendChild(list);
  toc.hidden = false;

  var links = toc.querySelectorAll('a[data-target]');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id;
      links.forEach(function (link) {
        link.classList.toggle('active', link.dataset.target === id);
      });
    });
  }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });

  headings.forEach(function (h) { observer.observe(h); });
})();
