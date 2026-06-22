// Bilingual toggle (English / Chinese) for academic homepage
(function () {
  'use strict';

  var SUPPORTED_LANGS = ['en', 'zh'];
  var DEFAULT_LANG = 'en';
  var STORAGE_KEY = 'site-lang';

  function getStoredLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGS.indexOf(stored) !== -1) {
        return stored;
      }
    } catch (e) {}
    return DEFAULT_LANG;
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  var translations = {};
  var currentLang = getStoredLang();

  // Load translations from the embedded JSON (injected by Jekyll)
  try {
    var dataEl = document.getElementById('i18n-data');
    if (dataEl) {
      translations = JSON.parse(dataEl.textContent);
    }
  } catch (e) {
    console.warn('Failed to parse i18n translations:', e);
  }

  function translateKey(key) {
    if (!translations[currentLang]) return key;
    // Support dot-separated keys like "navbar.Home"
    var parts = key.split('.');
    var result = translations[currentLang];
    for (var i = 0; i < parts.length; i++) {
      if (result && typeof result === 'object') {
        result = result[parts[i]];
      } else {
        return key;
      }
    }
    return (result !== undefined && result !== null) ? result : key;
  }

  function translateElement(el) {
    var key = el.getAttribute('data-i18n');
    if (key) {
      var translated = translateKey(key);
      if (translated !== key) {
        el.textContent = translated;
      }
    }
    // Also translate placeholder attributes
    var placeholderKey = el.getAttribute('data-i18n-placeholder');
    if (placeholderKey) {
      var placeholderTranslated = translateKey(placeholderKey);
      if (placeholderTranslated !== placeholderKey) {
        el.setAttribute('placeholder', placeholderTranslated);
      }
    }
    var titleKey = el.getAttribute('data-i18n-title');
    if (titleKey) {
      var titleTranslated = translateKey(titleKey);
      if (titleTranslated !== titleKey) {
        el.setAttribute('title', titleTranslated);
      }
    }
  }

  function translatePage() {
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      translateElement(elements[i]);
    }
    // Update HTML lang attribute (use setAttribute for CSS selector html[lang="zh"])
    document.documentElement.setAttribute('lang', currentLang);
  }

  function switchLang(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) return;
    if (lang === currentLang) return;

    currentLang = lang;
    setStoredLang(lang);
    translatePage();

    // Update toggle button states
    var btnZh = document.getElementById('lang-toggle-zh');
    var btnEn = document.getElementById('lang-toggle-en');
    if (btnZh && btnEn) {
      if (lang === 'zh') {
        btnZh.classList.add('lang-active');
        btnEn.classList.remove('lang-active');
      } else {
        btnEn.classList.add('lang-active');
        btnZh.classList.remove('lang-active');
      }
    }

    // Dispatch event so other components can react
    try {
      document.dispatchEvent(new CustomEvent('langChange', { detail: { lang: lang } }));
    } catch (e) {}
  }

  // Initialize on DOM ready
function init() {
    // Set initial lang attribute for CSS
    document.documentElement.setAttribute('lang', currentLang);
    // Show current language on buttons
    translatePage();
    var btnZh = document.getElementById('lang-toggle-zh');
    var btnEn = document.getElementById('lang-toggle-en');
    if (currentLang === 'zh') {
      if (btnZh) btnZh.classList.add('lang-active');
      if (btnEn) btnEn.classList.remove('lang-active');
    } else {
      if (btnEn) btnEn.classList.add('lang-active');
      if (btnZh) btnZh.classList.remove('lang-active');
    }

    // Attach click handlers
    if (btnZh) {
      btnZh.addEventListener('click', function (e) {
        e.preventDefault();
        switchLang('zh');
      });
    }
    if (btnEn) {
      btnEn.addEventListener('click', function (e) {
        e.preventDefault();
        switchLang('en');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose switch function globally
  window.switchSiteLang = switchLang;
})();