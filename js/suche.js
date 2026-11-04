/* Seitensuche – läuft komplett im Browser, keine Daten werden übertragen. Index: /suche.json (von build.py erzeugt). */
(function () {
  var forms = document.querySelectorAll('[data-suche]');
  if (!forms.length) return;
  var SYN = { akku: ['speicher'], batterie: ['speicher'], panel: ['modul'], paneel: ['modul'], solarpanel: ['modul'],
    vermieter: ['mieter'], genehmigung: ['erlaubnis', 'zustimmung'], kosten: ['preis', 'euro'], stromzaehler: ['zaehler'] };
  var MAP = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
  function norm(s) { return (s || '').toLowerCase().replace(/[äöüß]/g, function (c) { return MAP[c]; }).normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  // Normalisieren mit Positions-Abbildung, damit Treffer im Originaltext markiert werden können
  function normMap(s) { var out = '', idx = []; for (var i = 0; i < s.length; i++) { var n = norm(s[i]); for (var j = 0; j < n.length; j++) { out += n[j]; idx.push(i); } } return { n: out, idx: idx }; }
  var IDX = null, loading = null;
  function load() {
    if (IDX) return Promise.resolve(IDX);
    if (!loading) loading = fetch('/suche.json?v=' + (window.SUCHE_V || '')).then(function (r) { return r.json(); }).then(function (d) {
      IDX = d.map(function (e) { e._t = norm(e.t); e._d = norm(e.d); e._h = norm(e.h); e._b = norm(e.b); return e; }); return IDX; });
    return loading;
  }
  function terms(q) {
    return norm(q).split(/[^a-z0-9]+/).filter(function (w) { return w.length > 1; }).map(function (w) { return [w].concat(SYN[w] || []); });
  }
  function score(e, ts) {
    var s = 0;
    for (var i = 0; i < ts.length; i++) {
      var best = 0;
      for (var k = 0; k < ts[i].length; k++) {
        var w = ts[i][k], v = 0;
        if (e._t.indexOf(w) > -1) v += 10;
        if (e._h.indexOf(w) > -1) v += 5;
        if (e._d.indexOf(w) > -1) v += 3;
        if (e._b.indexOf(w) > -1) v += 1;
        if (k > 0) v = v * 0.6;
        if (v > best) best = v;
      }
      if (!best) return 0;
      s += best;
    }
    return s + (e.p || 0);
  }
  function markInto(el, text, ts) {
    var m = normMap(text), ranges = [];
    ts.forEach(function (g) { g.forEach(function (w) { var p = m.n.indexOf(w); while (p > -1) { ranges.push([m.idx[p], m.idx[p + w.length - 1] + 1]); p = m.n.indexOf(w, p + w.length); } }); });
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var pos = 0;
    ranges.forEach(function (r) { if (r[0] < pos) return; el.appendChild(document.createTextNode(text.slice(pos, r[0]))); var mk = document.createElement('mark'); mk.textContent = text.slice(r[0], r[1]); el.appendChild(mk); pos = r[1]; });
    el.appendChild(document.createTextNode(text.slice(pos)));
  }
  function snippet(e, ts) {
    if (ts.some(function (g) { return g.some(function (w) { return e._d.indexOf(w) > -1 || e._t.indexOf(w) > -1; }); }) && e.d) return e.d;
    var m = normMap(e.b), at = -1;
    ts.some(function (g) { return g.some(function (w) { var p = m.n.indexOf(w); if (p > -1) { at = m.idx[p]; return true; } return false; }); });
    if (at < 0) return e.d || '';
    var a = Math.max(0, e.b.lastIndexOf(' ', Math.max(0, at - 80)));
    var z = e.b.indexOf(' ', Math.min(e.b.length, at + 140)); if (z < 0) z = e.b.length;
    return (a > 0 ? '… ' : '') + e.b.slice(a, z).trim() + (z < e.b.length ? ' …' : '');
  }
  function render(box, q, list) {
    box.innerHTML = '';
    if (!q.trim()) { box.hidden = true; return; }
    box.hidden = false;
    var ts = terms(q);
    var res = ts.length ? list.map(function (e) { return [score(e, ts), e]; }).filter(function (x) { return x[0] > 0; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, 20) : [];
    var info = document.createElement('p'); info.className = 'sr-info small muted';
    info.textContent = res.length ? res.length + (res.length === 1 ? ' Treffer' : ' Treffer') + ' für „' + q.trim() + '“' : 'Keine Treffer für „' + q.trim() + '“. Versuch ein anderes Wort – oder schau in die Übersicht aller Ratgeber.';
    box.appendChild(info);
    res.forEach(function (x) {
      var e = x[1], a = document.createElement('a'); a.className = 'sr'; a.href = e.u;
      var k = document.createElement('span'); k.className = 'sr-k'; k.textContent = e.k; a.appendChild(k);
      var t = document.createElement('strong'); markInto(t, e.t, ts); a.appendChild(t);
      var p = document.createElement('p'); markInto(p, snippet(e, ts), ts); a.appendChild(p);
      box.appendChild(a);
    });
    if (!res.length) { var l = document.createElement('a'); l.className = 'btn btn-ghost btn-sm'; l.href = '/ratgeber/'; l.textContent = 'Alle Ratgeber ansehen'; box.appendChild(l); }
  }
  forms.forEach(function (f) {
    var input = f.querySelector('input[type=search]'), box = document.getElementById(f.getAttribute('data-suche'));
    var live = f.hasAttribute('data-live'), timer;
    function run() { load().then(function (list) { render(box, input.value, list); if (live && history.replaceState) { var u = new URL(location.href); if (input.value.trim()) u.searchParams.set('q', input.value.trim()); else u.searchParams.delete('q'); history.replaceState(null, '', u); } }).catch(function () { box.hidden = false; box.textContent = 'Die Suche konnte nicht geladen werden. Bitte lade die Seite neu.'; }); }
    input.addEventListener('focus', load, { once: true });
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 120); });
    f.addEventListener('submit', function (ev) { if (box) { ev.preventDefault(); clearTimeout(timer); run(); } });
    if (live) { var q = new URL(location.href).searchParams.get('q'); if (q) { input.value = q; run(); } input.focus(); }
  });
})();
