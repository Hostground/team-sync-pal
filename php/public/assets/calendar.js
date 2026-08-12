/* Agenda-weergave voor /overzicht — dag / week / maand / jaar */
(function () {
  var root = document.querySelector('[data-calendar]');
  if (!root) return;

  var EVENTS = (window.CALENDAR_EVENTS || []).map(function (e) {
    return {
      id: e.id,
      title: e.title,
      start: new Date(e.start.replace(' ', 'T')),
      end: new Date((e.end || e.start).replace(' ', 'T')),
      status: e.status,
      type: e.type || '',
      color: e.color || '',
      assignee: e.assignee || '',
      location: e.location || '',
      customer: e.customer || ''
    };
  });

  var STATUS = {
    pending: 'In afwachting', confirmed: 'Bevestigd', declined: 'Geweigerd',
    auto_declined: 'Auto-geweigerd', cancelled: 'Geannuleerd'
  };
  var DAYS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
  var MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  var HOUR = 44;

  var view = localStorage.getItem('cal.view') || (window.innerWidth < 640 ? 'day' : 'week');
  var anchor = new Date();
  anchor.setHours(0, 0, 0, 0);

  var titleEl = root.querySelector('[data-cal-title]');
  var bodyEl = root.querySelector('[data-cal-body]');

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function key(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function hm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function startOfWeek(d) { var x = new Date(d); var w = (x.getDay() + 6) % 7; x.setDate(x.getDate() - w); x.setHours(0, 0, 0, 0); return x; }
  function isToday(d) { return key(d) === key(new Date()); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  function eventsOnDay(d) {
    var s = new Date(d); s.setHours(0, 0, 0, 0);
    var e = new Date(d); e.setHours(23, 59, 59, 999);
    return EVENTS.filter(function (ev) { return ev.start <= e && ev.end >= s; })
      .sort(function (a, b) { return a.start - b.start; });
  }

  function layout(list, day) {
    var ds = new Date(day); ds.setHours(0, 0, 0, 0);
    var de = new Date(day); de.setHours(23, 59, 59, 999);
    var items = list.map(function (ev) {
      var s = Math.max(ev.start.getTime(), ds.getTime());
      var e = Math.min(Math.max(ev.end.getTime(), s + 1800000), de.getTime());
      return { ev: ev, top: (s - ds.getTime()) / 60000, h: Math.max((e - s) / 60000, 30) };
    }).sort(function (a, b) { return a.top - b.top || b.h - a.h; });

    var out = [], cluster = [], clusterEnd = -1;
    function flush() {
      if (!cluster.length) return;
      var cols = [];
      cluster.forEach(function (it) {
        var c = -1;
        for (var i = 0; i < cols.length; i++) { if (cols[i] <= it.top) { c = i; break; } }
        if (c === -1) { c = cols.length; cols.push(0); }
        cols[c] = it.top + it.h;
        it.col = c;
      });
      cluster.forEach(function (it) { it.cols = cols.length; out.push(it); });
      cluster = []; clusterEnd = -1;
    }
    items.forEach(function (it) {
      if (cluster.length && it.top >= clusterEnd) flush();
      cluster.push(it);
      clusterEnd = Math.max(clusterEnd, it.top + it.h);
    });
    flush();
    return out;
  }

  function blockHtml(it) {
    var w = 100 / it.cols;
    var style = 'top:' + (it.top / 60 * HOUR) + 'px;height:' + (it.h / 60 * HOUR) + 'px;left:' + (it.col * w) + '%;width:calc(' + w + '% - 3px)';
    var bar = it.ev.color ? 'background:' + esc(it.ev.color) : '';
    return '<a class="cal-ev status-' + esc(it.ev.status) + '" style="' + style + '" href="/planning/' + esc(it.ev.id) + '">' +
      '<span class="cal-ev-bar" style="' + bar + '"></span>' +
      '<span class="cal-ev-body"><strong>' + esc(it.ev.title) + '</strong>' +
      '<em>' + hm(it.ev.start) + '–' + hm(it.ev.end) + (it.ev.assignee ? ' · ' + esc(it.ev.assignee) : '') + '</em></span></a>';
  }

  function timeGrid(days) {
    var h = '<div class="cal-timegrid" style="--hour:' + HOUR + 'px">';
    h += '<div class="cal-head"><div class="cal-gutter"></div>';
    days.forEach(function (d) {
      h += '<div class="cal-dayhead' + (isToday(d) ? ' today' : '') + '" data-goto-day="' + key(d) + '">' +
        DAYS[(d.getDay() + 6) % 7] + ' <b>' + d.getDate() + '</b></div>';
    });
    h += '</div><div class="cal-scroll"><div class="cal-body">';
    h += '<div class="cal-gutter">';
    for (var i = 0; i < 24; i++) h += '<div class="cal-hour"><span>' + pad(i) + ':00</span></div>';
    h += '</div>';
    days.forEach(function (d) {
      h += '<div class="cal-daycol' + (isToday(d) ? ' today' : '') + '">';
      for (var i = 0; i < 24; i++) h += '<div class="cal-hour"></div>';
      layout(eventsOnDay(d), d).forEach(function (it) { h += blockHtml(it); });
      h += '</div>';
    });
    h += '</div></div></div>';
    return h;
  }

  function monthGrid() {
    var first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    var start = startOfWeek(first);
    var h = '<div class="cal-month"><div class="cal-month-head">';
    DAYS.forEach(function (d) { h += '<div>' + d + '</div>'; });
    h += '</div><div class="cal-month-grid">';
    for (var i = 0; i < 42; i++) {
      var d = addDays(start, i);
      var evs = eventsOnDay(d);
      h += '<div class="cal-cell' + (d.getMonth() !== anchor.getMonth() ? ' out' : '') + (isToday(d) ? ' today' : '') + '" data-goto-day="' + key(d) + '">';
      h += '<span class="cal-daynum">' + d.getDate() + '</span>';
      evs.slice(0, 3).forEach(function (ev) {
        h += '<span class="cal-chip status-' + esc(ev.status) + '"><i style="' + (ev.color ? 'background:' + esc(ev.color) : '') + '"></i>' +
          hm(ev.start) + ' ' + esc(ev.title) + '</span>';
      });
      if (evs.length > 3) h += '<span class="cal-more">+' + (evs.length - 3) + ' meer</span>';
      h += '</div>';
    }
    return h + '</div></div>';
  }

  function yearGrid() {
    var counts = {};
    EVENTS.forEach(function (ev) { var k = key(ev.start); counts[k] = (counts[k] || 0) + 1; });
    var h = '<div class="cal-year">';
    for (var m = 0; m < 12; m++) {
      var first = new Date(anchor.getFullYear(), m, 1);
      var start = startOfWeek(first);
      h += '<div class="cal-mini"><h4 data-goto-month="' + m + '">' + MONTHS[m] + '</h4><div class="cal-mini-grid">';
      DAYS.forEach(function (d) { h += '<span class="cal-mini-dow">' + d[0] + '</span>'; });
      for (var i = 0; i < 42; i++) {
        var d = addDays(start, i);
        if (d.getMonth() !== m) { h += '<span class="cal-mini-day out"></span>'; continue; }
        var c = counts[key(d)] || 0;
        var lvl = c === 0 ? 0 : c === 1 ? 1 : c <= 3 ? 2 : 3;
        h += '<span class="cal-mini-day lvl' + lvl + (isToday(d) ? ' today' : '') + '" data-goto-day="' + key(d) + '" title="' + c + ' activiteit(en)">' + d.getDate() + '</span>';
      }
      h += '</div></div>';
    }
    return h + '</div>';
  }

  function title() {
    if (view === 'day') return DAYS[(anchor.getDay() + 6) % 7] + ' ' + anchor.getDate() + ' ' + MONTHS[anchor.getMonth()] + ' ' + anchor.getFullYear();
    if (view === 'week') {
      var s = startOfWeek(anchor), e = addDays(s, 6);
      return s.getDate() + ' ' + MONTHS[s.getMonth()].slice(0, 3) + ' – ' + e.getDate() + ' ' + MONTHS[e.getMonth()].slice(0, 3) + ' ' + e.getFullYear();
    }
    if (view === 'month') return MONTHS[anchor.getMonth()] + ' ' + anchor.getFullYear();
    return String(anchor.getFullYear());
  }

  function render() {
    titleEl.textContent = title();
    root.querySelectorAll('[data-cal-view]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-cal-view') === view);
    });
    if (view === 'day') bodyEl.innerHTML = timeGrid([anchor]);
    else if (view === 'week') {
      var s = startOfWeek(anchor), days = [];
      for (var i = 0; i < 7; i++) days.push(addDays(s, i));
      bodyEl.innerHTML = timeGrid(days);
    } else if (view === 'month') bodyEl.innerHTML = monthGrid();
    else bodyEl.innerHTML = yearGrid();

    var sc = bodyEl.querySelector('.cal-scroll');
    if (sc) sc.scrollTop = 7 * HOUR;
  }

  function shift(dir) {
    if (view === 'day') anchor = addDays(anchor, dir);
    else if (view === 'week') anchor = addDays(anchor, 7 * dir);
    else if (view === 'month') anchor = new Date(anchor.getFullYear(), anchor.getMonth() + dir, 1);
    else anchor = new Date(anchor.getFullYear() + dir, anchor.getMonth(), 1);
    render();
  }

  root.addEventListener('click', function (e) {
    var v = e.target.closest('[data-cal-view]');
    if (v) { view = v.getAttribute('data-cal-view'); localStorage.setItem('cal.view', view); render(); return; }
    if (e.target.closest('[data-cal-prev]')) return shift(-1);
    if (e.target.closest('[data-cal-next]')) return shift(1);
    if (e.target.closest('[data-cal-today]')) { anchor = new Date(); anchor.setHours(0, 0, 0, 0); return render(); }
    var mo = e.target.closest('[data-goto-month]');
    if (mo) { anchor = new Date(anchor.getFullYear(), +mo.getAttribute('data-goto-month'), 1); view = 'month'; return render(); }
    var day = e.target.closest('[data-goto-day]');
    if (day && !e.target.closest('.cal-ev')) {
      var p = day.getAttribute('data-goto-day').split('-');
      anchor = new Date(+p[0], +p[1] - 1, +p[2]);
      view = 'day'; localStorage.setItem('cal.view', view); return render();
    }
  });

  /* swipe op mobiel */
  var x0 = null, y0 = null;
  bodyEl.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  bodyEl.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) shift(dx < 0 ? 1 : -1);
    x0 = y0 = null;
  });

  /* tabs kalender / lijst */
  document.querySelectorAll('[data-ov-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = btn.getAttribute('data-ov-tab');
      document.querySelectorAll('[data-ov-tab]').forEach(function (b) { b.classList.toggle('active', b === btn); });
      document.querySelectorAll('[data-ov-pane]').forEach(function (p) {
        p.hidden = p.getAttribute('data-ov-pane') !== t;
      });
      localStorage.setItem('ov.tab', t);
      if (t === 'calendar') render();
    });
  });
  var saved = localStorage.getItem('ov.tab');
  if (saved === 'list') { var b = document.querySelector('[data-ov-tab="list"]'); if (b) b.click(); }

  render();
})();
