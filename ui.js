/* Shared accessibility and daylight presentation. No persistent application state. */
(function () {
  'use strict';
  var translate = function (key) { return key; };
  var dialogs = [], focusBefore = new WeakMap();
  var focusable = 'button:not([disabled]),a[href],input:not([disabled]),select,textarea,summary,[tabindex="0"]';

  function visibleControls(root) {
    return Array.from(root.querySelectorAll(focusable)).filter(function (el) {
      return !el.closest('[inert],[hidden]') && getComputedStyle(el).visibility !== 'hidden' &&
        !el.closest('.settings-section:not(.active)') && !el.closest('details:not([open]) :not(summary)');
    });
  }
  function syncDialogState() {
    dialogs.forEach(function (entry,index) { entry.host.inert = index < dialogs.length - 1; });
    document.querySelectorAll('#desktopMain,.brand-lockup,.top-bar,#freeLayoutViewport').forEach(function (el) {
      el.inert = dialogs.length > 0;
    });
  }
  function watchDialog(host, dialog) {
    if (!host || !dialog) return;
    var opened = false;
    host.inert = true;
    function sync() {
      var next = host.classList.contains('open');
      if (next === opened) return;
      opened = next;
      host.inert = !next;
      if (next) {
        focusBefore.set(host, document.activeElement);
        dialogs.push({ host:host, dialog:dialog });
        syncDialogState();
        (visibleControls(dialog)[0] || dialog).focus();
      } else {
        dialogs = dialogs.filter(function (entry) { return entry.host !== host; });
        syncDialogState();
        var prior = focusBefore.get(host);
        if (prior && prior.isConnected && !prior.closest('[inert]')) prior.focus();
        else if (dialogs.length) { var current=dialogs[dialogs.length-1].dialog; (visibleControls(current)[0]||current).focus(); }
        else { var search=document.getElementById('searchInput'); if(search)search.focus(); }
      }
    }
    new MutationObserver(sync).observe(host, { attributes:true, attributeFilter:['class'] });
    sync();
  }
  function syncLabels() {
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', translate(el.dataset.i18nAria));
    });
    document.querySelectorAll('.toggle-switch').forEach(function (el) {
      var label = el.parentElement.querySelector('label');
      if (label) { label.id = el.id + 'Label'; el.setAttribute('aria-labelledby', label.id); }
      el.setAttribute('role', 'switch');
      el.setAttribute('aria-checked', String(el.classList.contains('on')));
    });
    document.querySelectorAll('.settings-group').forEach(function (group) {
      var label = group.querySelector('.settings-label');
      group.querySelectorAll('input').forEach(function (input) {
        if (label && !input.hasAttribute('aria-label')) {
          label.id = input.id + 'Label'; input.setAttribute('aria-labelledby', label.id);
        }
      });
    });
    document.querySelectorAll('.radio-option').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    });
    document.querySelectorAll('.settings-tab').forEach(function (tab) {
      var selected = tab.classList.contains('active');
      tab.id = 'tab-' + tab.dataset.tab;
      tab.setAttribute('role', 'tab'); tab.setAttribute('aria-selected', String(selected));
      tab.setAttribute('aria-controls', 'sec-' + tab.dataset.tab); tab.tabIndex = selected ? 0 : -1;
      var section = document.getElementById('sec-' + tab.dataset.tab);
      if (section) { section.setAttribute('role', 'tabpanel'); section.setAttribute('aria-labelledby', tab.id); }
    });
  }
  function updateDaylight(now) {
    var hour = now.getHours() + now.getMinutes() / 60;
    var key = hour < 5 || hour >= 20 ? 'timeNight' : hour < 11 ? 'timeMorning' : hour < 17 ? 'timeDay' : 'timeEvening';
    var caption = document.getElementById('daylightCaption');
    if (caption) caption.textContent = translate(key);

  }
  function showStorageError() {
    var notice = document.getElementById('storageNotice');
    if (notice) { notice.hidden = false; notice.setAttribute('data-i18n','storageFailed'); notice.textContent = translate('storageFailed'); }
  }
  function clearStorageError() {
    var notice = document.getElementById('storageNotice');
    if (notice) notice.hidden = true;
  }
  function applyAccent(value) {
    var hex = /^#[0-9a-f]{6}$/i.test(value) ? value : '#607566';
    // Adapt only the stock daylight color. User-selected colors remain unchanged in storage and presentation.
    if (/^#(?:40664d|607566)$/i.test(hex)) hex = document.documentElement.getAttribute('data-theme') === 'dark' ? '#a4b3a1' : '#607566';
    var rgb = [1,3,5].map(function (i) { var c = parseInt(hex.slice(i,i+2),16)/255; return c <= .04045 ? c/12.92 : Math.pow((c+.055)/1.055,2.4); });
    var luminance = .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
    document.documentElement.style.setProperty('--action', hex);
    document.documentElement.style.setProperty('--accent', hex);
    document.documentElement.style.setProperty('--action-ink', luminance > .179 ? '#000000' : '#ffffff');
  }
  function init(t) {
    translate = t;
    watchDialog(document.getElementById('settingsPanel'), document.getElementById('settingsPanel'));
    ['linkModalOverlay','donateModalOverlay','qrZoomOverlay'].forEach(function (id) {
      var host = document.getElementById(id);
      if (host && id === 'qrZoomOverlay') { host.setAttribute('role','dialog'); host.setAttribute('aria-modal','true'); host.tabIndex = -1; host.setAttribute('aria-label',translate('donateTitle')); }
      watchDialog(host, host && (host.querySelector('[role="dialog"]') || host));
    });
    document.addEventListener('keydown', function (e) {
      var entry = dialogs[dialogs.length - 1];
      if (!entry) return;
      if (e.key === 'Escape') {
        e.preventDefault(); e.stopImmediatePropagation(); entry.host.classList.remove('open');
        if (entry.host.id === 'settingsPanel') document.getElementById('settingsOverlay').classList.remove('open');
      } else if (e.key === 'Tab') {
        var controls = visibleControls(entry.dialog);
        var first = controls[0] || entry.dialog, last = controls[controls.length - 1] || entry.dialog;
        if (!controls.length || !entry.dialog.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }, true);
    var tabs = document.querySelector('.settings-tabs');
    if (tabs) {
      tabs.addEventListener('click', function () { syncLabels(); });
      tabs.addEventListener('keydown', function (e) {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
        var buttons = Array.from(tabs.querySelectorAll('.settings-tab'));
        var index = buttons.indexOf(document.activeElement);
        if (index < 0) return;
        index = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
        e.preventDefault(); buttons[index].click(); buttons[index].focus();
      });
    }
    var engine = document.getElementById('searchEngineBtn');
    if (engine) {
      engine.setAttribute('role','button'); engine.tabIndex = 0;
      engine.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); engine.click(); }
        if (e.key === 'ArrowDown') { e.preventDefault(); if (!engine.classList.contains('open')) engine.click(); var first = document.querySelector('.engine-option'); if (first) first.focus(); }
      });
      new MutationObserver(function () { engine.setAttribute('aria-expanded',String(engine.classList.contains('open'))); }).observe(engine,{attributes:true,attributeFilter:['class']});
    }
    document.addEventListener('vera:localechange', function () { syncLabels(); updateDaylight(new Date()); });
    syncLabels(); updateDaylight(new Date());
  }
  window.VeraUI = { init:init, syncLabels:syncLabels, updateDaylight:updateDaylight, applyAccent:applyAccent, showStorageError:showStorageError, clearStorageError:clearStorageError };
})();
