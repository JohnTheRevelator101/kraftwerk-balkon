(function () {
  var $ = function (id) { return document.getElementById(id); };
  var f = $('frist');
  if (f && !f.value) { var d = new Date(); d.setDate(d.getDate() + 21); f.value = d.toISOString().slice(0, 10); }
  var MONT = { aussen: 'außen am Balkongeländer', innen: 'innen am Balkongeländer', boden: 'aufgestellt auf dem Balkonboden', offen: 'am Balkongeländer (innen oder außen – gern nach Ihren Vorgaben)' };
  function de(dstr) { if (!dstr) return '…'; var p = dstr.split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  function v(id, fb) { var x = ($(id).value || '').trim(); return x || fb; }
  function text() {
    var weg = $('rolle').value === 'weg';
    var n = +$('mod').value, wp = +$('wp').value || 0;
    var mods = n === 1 ? 'einem Modul' : (['', '', 'zwei', 'drei', 'vier'][n] + ' Modulen');
    var anschluss = wp > 960
      ? 'Der Anschluss erfolgt über eine Energiesteckvorrichtung (Einspeisesteckdose), die von einer Elektrofachkraft installiert wird.'
      : 'Der Anschluss erfolgt über eine vorhandene, fest installierte Steckdose.';
    var bohr = $('bohr').value === 'nein' ? 'Bohrungen in Fassade oder Brüstung sind nicht vorgesehen.' : 'Die genaue Befestigung stimme ich gern vorab mit Ihnen ab.';
    var L = [];
    L.push(v('name', '[Dein Name]'));
    L.push(v('adr', '[Deine Anschrift, Lage der Wohnung]'));
    L.push('');
    L.push('An: ' + v('an', '[Vermieter / Hausverwaltung]'));
    L.push('');
    L.push(weg ? 'Antrag auf Gestattung eines Steckersolargeräts (Balkonkraftwerk) gemäß § 20 WEG' : 'Bitte um Zustimmung zur Anbringung eines Steckersolargeräts (Balkonkraftwerk) gemäß § 554 BGB');
    L.push('');
    L.push('Sehr geehrte Damen und Herren,');
    L.push('');
    L.push('ich möchte an meinem Balkon ein Steckersolargerät („Balkonkraftwerk“) mit ' + mods + ' (zusammen ' + (wp ? wp.toLocaleString('de-DE') : '…') + ' Wp) und einem Wechselrichter mit höchstens 800 W anbringen. Die Module werden mit einer sturmsicheren Halterung ' + MONT[$('mont').value] + ' befestigt. ' + bohr + ' ' + anschluss);
    var ext = [];
    if ($('norm').checked) ext.push('Das Gerät entspricht laut Hersteller der Produktnorm DIN VDE V 0126-95.');
    if ($('hpv').checked) ext.push('Eine Privathaftpflichtversicherung, die das Gerät abdeckt, ist vorhanden.');
    ext.push('Nach der Inbetriebnahme melde ich die Anlage im Marktstammdatenregister an.');
    if ($('anl').checked) ext.push('Das Datenblatt sowie ein Foto bzw. eine Skizze des geplanten Montageorts habe ich beigefügt.');
    L.push('');
    L.push(ext.join(' '));
    L.push('');
    L.push(weg
      ? 'Ich beantrage hiermit die Gestattung dieser baulichen Veränderung gemäß § 20 WEG und bitte darum, den Antrag zur Beschlussfassung vorzulegen. Über eine Rückmeldung bis zum ' + de($('frist').value) + ' freue ich mich. Für Rückfragen und Vorgaben zur Ausführung stehe ich gern zur Verfügung.'
      : 'Ich bitte um Ihre Zustimmung gemäß § 554 BGB bis zum ' + de($('frist').value) + '. Für Rückfragen und Vorgaben zur Ausführung stehe ich gern zur Verfügung.');
    L.push('');
    L.push('Mit freundlichen Grüßen');
    L.push(v('name', '[Dein Name]'));
    return L.join('\n');
  }
  function render() { $('letter').textContent = text(); }
  document.getElementById('vl').addEventListener('input', render);
  document.getElementById('vl').addEventListener('change', render);
  $('copy').addEventListener('click', function () {
    var t = text();
    var done = function () { $('copied').textContent = 'Kopiert – jetzt in deine E-Mail einfügen.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(done, function () { fallback(t); done(); }); } else { fallback(t); done(); }
  });
  function fallback(t) { var a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) {} a.remove(); }
  $('print').addEventListener('click', function () { window.print(); });
  render();
})();
