(function () {
  // spezifischer Ertrag kWh/kWp (Mitte Deutschland, unverschattet)
  var SPEC = {
    s: { 30: 1000, 90: 700, 0: 870 },
    so: { 30: 950, 90: 650, 0: 870 },
    ow: { 30: 800, 90: 500, 0: 870 },
    osw: { 30: 820, 90: 560, 0: 870 },
    n: { 30: 550, 90: 250, 0: 850 }
  };
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n, d) { return n.toLocaleString("de-DE", { maximumFractionDigits: d || 0, minimumFractionDigits: d || 0 }); };

  function calc() {
    var wp = +$("wp").value, dir = $("dir").value, tilt = +$("tilt").value;
    var shade = +$("shade").value, region = +$("region").value, load = +$("load").value;
    var price = (+$("price").value || 0) / 100, cost = +$("cost").value || 0, bat = +$("bat").value;

    var spec = SPEC[dir][tilt];
    // Begrenzungsverlust durch 800-W-Wechselrichter (Überbelegung); Ost-West verteilt Spitzen
    var r = wp / 800, clip = 0;
    if (r > 1.15) clip = Math.min(0.3, 0.13 * (r - 1.15) * (dir === "osw" || dir === "ow" || tilt === 90 ? 0.5 : 1));
    var yieldKwh = wp / 1000 * spec * region * shade * (1 - clip);

    // Eigenverbrauchsquote ohne Speicher: sinkt mit Anlagengröße
    var quote = load * Math.pow(Math.min(1, 700 / Math.max(yieldKwh, 1)), 0.45);
    quote = Math.min(0.85, Math.max(0.2, quote));
    var self = yieldKwh * quote;
    var surplus = yieldKwh - self;
    var shifted = 0;
    if (bat > 0) {
      var cycles = 150 + 100 * Math.min(1, surplus / 600);
      shifted = Math.min(surplus * 0.85, bat * cycles * 0.9);
      self += shifted;
    }
    var save = self * price;
    var payback = save > 0 ? cost / save : Infinity;

    $("r-save").textContent = fmt(save) + " €";
    $("r-yield").textContent = fmt(yieldKwh) + " kWh";
    $("r-self").textContent = fmt(self) + " kWh";
    $("r-quote").textContent = fmt(self / yieldKwh * 100) + " %";
    $("r-payback").textContent = isFinite(payback) ? fmt(payback, 1) + " Jahre" : "–";
    $("r-20").textContent = fmt(save * 20 - cost) + " €";
    $("r-co2").textContent = "ca. " + fmt(yieldKwh * 0.36) + " kg";

    var hint = "";
    if (wp > 960) hint = "Über 960 Wp brauchst du eine Einspeisesteckdose (z. B. Wieland), installiert von einer Elektrofachkraft. ";
    if (dir === "n" && tilt === 90) hint += "Ein senkrechter Nordbalkon bringt sehr wenig – prüf Alternativen wie Garten oder Flachdach. ";
    if (bat > 0 && shifted < bat * 120) hint += "Dein Speicher wird selten voll – ein kleinerer Speicher oder keiner könnte wirtschaftlicher sein. ";
    if (payback <= 4) hint += "Sehr gute Werte: Dein Balkonkraftwerk rechnet sich schnell.";
    $("r-hint").textContent = hint;
  }
  var form = $("calc");
  if (!form) return;
  form.addEventListener("input", calc);
  form.addEventListener("change", calc);
  calc();
})();
