// utils.storage.js — small safe wrapper around localStorage (production-ready)
/* eslint-disable no-console */
(function (ns) {
  'use strict';
  ns.Storage = {
    get(key, fallback = null) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch (e) {
        console.warn('Storage.get failed', e);
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn('Storage.set failed', e);
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        return false;
      }
    },
    clearAll() {
      try {
        localStorage.clear();
        return true;
      } catch (e) {
        return false;
      }
    }
  };
})(window.ChemApp = window.ChemApp || {});
