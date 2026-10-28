(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  // ---------------------------------------------------------------- Proposaly widget
  var token = window.PROPOSALY_BOT_ID;
  var widgetLoaded = false;
  if (token) {
    var w = document.createElement('script');
    w.src = window.PROPOSALY_WIDGET_SRC;
    w.setAttribute('data-bot-id', token);
    w.async = true; w.defer = true;
    w.onload = function () { widgetLoaded = true; status('st-bot', 'ok', 'Proposaly widget: loaded (' + token.slice(0, 6) + '…)'); };
    w.onerror = function () { status('st-bot', 'warn', 'Proposaly widget: failed to load (check the CDN URL)'); };
    document.body.appendChild(w);
  }

  // "Chat with us" buttons: click the widget's launcher inside its shadow root (no public open() API).
  function openChat() {
    var hosts = document.querySelectorAll('[id^="proposaly-bot-root-popup"]');
    for (var i = 0; i < hosts.length; i++) {
      var root = hosts[i].shadowRoot;
      var launcher = root && (root.querySelector('button.bubble') || root.querySelector('.bubble-tooltip'));
      if (launcher) { launcher.click(); return true; }
    }
    return false;
  }
  document.querySelectorAll('[data-open-chat]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!openChat()) {
        btn.blur();
        alert(widgetLoaded ? 'The chat is already open — find it in the bottom-right corner.'
                           : 'The chat assistant is still loading. Please try again in a moment.');
      }
    });
  });

  // ---------------------------------------------------------------- Developer panel
  var dev = $('dev');
  function status(id, cls, text) {
    var dot = $(id), label = $(id + '-text');
    if (dot) dot.className = 'dot ' + (cls || '');
    if (label) label.textContent = text;
  }
  function log(line) {
    var el = $('log');
    el.textContent += (el.textContent ? '\n' : '') + new Date().toLocaleTimeString() + '  ' + line;
    el.scrollTop = el.scrollHeight;
  }
  function setDev(open) { dev.hidden = !open; }
  $('dev-toggle').addEventListener('click', function () { setDev(dev.hidden); });
  $('dev-close').addEventListener('click', function () { setDev(false); });
  if (/[?&]debug=1\b/.test(location.search)) setDev(true);

  var gaId = window.GA_MEASUREMENT_ID;
  var gaOk = /^G-[A-Z0-9]+$/.test(gaId) && gaId !== 'G-XXXXXXXXXX';
  status('st-ga', gaOk ? 'ok' : 'warn', gaOk ? 'Google Analytics: ' + gaId : 'Google Analytics: set GA_MEASUREMENT_ID in index.html');
  status('st-bot', '', token ? 'Proposaly widget: loading…' : 'Proposaly widget: set PROPOSALY_BOT_ID in index.html');
  function cookieCheck() {
    var m = /(?:^|; )_ga=([^;]+)/.exec(document.cookie);
    if (m) { status('st-cookie', 'ok', 'GA client id: ' + m[1].split('.').slice(-2).join('.')); return true; }
    status('st-cookie', gaOk ? 'warn' : '', gaOk ? 'GA client id: waiting for the _ga cookie…' : 'GA client id: GA not configured');
    return false;
  }
  if (!cookieCheck()) { var t = setInterval(function () { if (cookieCheck()) clearInterval(t); }, 1000); }

  // Host-page conversion events — both deliveries the widget makes.
  ['proposaly_conversation', 'proposaly_lead'].forEach(function (name) {
    window.addEventListener(name, function (e) { log('CustomEvent ' + name + ' ' + JSON.stringify(e.detail)); });
  });
  var dl = window.dataLayer = window.dataLayer || [];
  var push = dl.push.bind(dl);
  dl.push = function (item) {
    try { if (item && /^proposaly_/.test(item.event || '')) log('dataLayer   ' + item.event); } catch (e) { /* ignore */ }
    return push.apply(null, arguments);
  };

  // Optional client-side forwarding to GA4 (GTM-less sites). Keep OFF while testing Connect GA4,
  // otherwise GA4 counts each event twice (server-side + client-side).
  // window.addEventListener('proposaly_lead', function (e) { gtag('event', 'proposaly_lead', e.detail); });
})();
