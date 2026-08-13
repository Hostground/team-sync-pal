/* Infoscherm slideshow: crossfade, Ken Burns achtergronden, klok en polling. */
(function () {
  var root = document.getElementById('screen');
  if (!root) return;

  var data = window.DISPLAY_DATA;
  var index = 0;
  var slideTimer = null;
  var photoTimers = [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function tz() { return (data && data.timezone) || 'Europe/Brussels'; }

  function fmtTime(iso) {
    try {
      return new Date(iso.replace(' ', 'T')).toLocaleTimeString('nl-BE', {
        hour: '2-digit', minute: '2-digit', timeZone: tz()
      });
    } catch (e) { return ''; }
  }

  function planningHtml(slide) {
    var items = (data.today || []);
    var rows = items.map(function (a) {
      return '<div class="planning-row">' +
        '<div class="time">' + esc(fmtTime(a.start)) + ' – ' + esc(fmtTime(a.end)) + '</div>' +
        '<div class="title">' + esc(a.title) + '</div>' +
        '<div class="meta">' + esc([a.person, a.location].filter(Boolean).join(' · ')) + '</div>' +
        '</div>';
    }).join('');
    return '<div class="planning">' +
      '<h2>' + esc(slide.title || 'Planning vandaag') + '</h2>' +
      (rows || '<div class="planning-empty">Geen activiteiten gepland vandaag.</div>') +
      '</div>';
  }

  function render() {
    var theme = data.theme || {};
    root.style.backgroundColor = theme.bg || '#0b1220';
    root.style.color = theme.text || '#ffffff';
    root.style.fontSize = (theme.textScale || 1) + 'rem';
    var overlay = typeof theme.overlay === 'number' ? theme.overlay : 0.35;

    photoTimers.forEach(clearInterval);
    photoTimers = [];

    var slides = data.slides || [];
    var html = slides.map(function (s, i) {
      var imgs = (s.images || []).map(function (src, k) {
        return '<img src="' + esc(src) + '" alt="" class="' + (k === 0 ? 'is-active' : '') + '">';
      }).join('');
      var backdrop = imgs
        ? '<div class="backdrop" data-slide="' + i + '">' + imgs + '</div>' +
          '<div class="overlay" style="background:rgba(0,0,0,' + overlay + ')"></div>'
        : '';
      var content = s.kind === 'planning_today'
        ? planningHtml(s)
        : '<div class="slide-content">' +
            (s.title ? '<h2 class="slide-title">' + esc(s.title) + '</h2>' : '') +
            (s.body ? '<p class="slide-body">' + esc(s.body) + '</p>' : '') +
          '</div>';
      return '<div class="slide" data-i="' + i + '">' + backdrop + content + '</div>';
    }).join('');

    if (!slides.length) {
      html = '<div class="slide is-active"><div class="slide-content"><p class="slide-body">Nog geen slides ingesteld</p></div></div>';
    }

    if (data.show_clock) {
      html += '<div class="clock ' + esc(data.clock_position || 'top-right') + '">' +
        '<div class="time" id="clock-time"></div><div class="date" id="clock-date"></div></div>';
    }
    if (slides.length > 1) {
      html += '<div class="dots">' + slides.map(function () { return '<span></span>'; }).join('') + '</div>';
    }

    root.innerHTML = html;

    // Meerdere foto's per slide: langzaam rouleren met crossfade.
    root.querySelectorAll('.backdrop').forEach(function (bd) {
      var imgs = bd.querySelectorAll('img');
      if (imgs.length < 2) return;
      var k = 0;
      photoTimers.push(setInterval(function () {
        imgs[k].classList.remove('is-active');
        k = (k + 1) % imgs.length;
        imgs[k].classList.add('is-active');
      }, 9000));
    });

    if (index >= slides.length) index = 0;
    activate();
    tickClock();
  }

  function activate() {
    var slides = root.querySelectorAll('.slide');
    if (!slides.length) return;
    slides.forEach(function (el, i) { el.classList.toggle('is-active', i === index); });
    root.querySelectorAll('.dots span').forEach(function (el, i) {
      el.classList.toggle('is-active', i === index);
    });
    clearTimeout(slideTimer);
    var s = (data.slides || [])[index];
    var ms = Math.max(3, (s && s.seconds) || 10) * 1000;
    if ((data.slides || []).length > 1) {
      slideTimer = setTimeout(function () {
        index = (index + 1) % data.slides.length;
        activate();
      }, ms);
    }
  }

  function tickClock() {
    var t = document.getElementById('clock-time');
    var d = document.getElementById('clock-date');
    if (!t || !d) return;
    var now = new Date();
    t.textContent = now.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit', timeZone: tz() });
    d.textContent = now.toLocaleDateString('nl-BE', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz()
    });
  }

  function refresh() {
    fetch('/display/' + encodeURIComponent(window.DISPLAY_CODE) + '/data', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (fresh) {
        if (!fresh) return;
        if (JSON.stringify(fresh) === JSON.stringify(data)) return;
        data = fresh;
        render();
      })
      .catch(function () {});
  }

  render();
  setInterval(tickClock, 1000);
  setInterval(refresh, 60000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) refresh();
  });
})();
