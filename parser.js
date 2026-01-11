/* parser.js — robust formula parser
 - supports parentheses with multipliers: Fe2(SO4)3
 - supports simple charge notation: Cu2+, SO4^2-
 - returns {atoms: {El:count}, charge: integer}
*/
(function(ns){
  'use strict';

  function parseCharge(token) {
    // token examples: "2+", "+", "2-", "^2+", "^+"
    const m = String(token||'').match(/\\^?([+-]?\\d*)([+-])/);
    if (!m) {
      // fallback check for trailing + or -
      const trailing = String(token||'').match(/([+-])$/);
      if (trailing) return trailing[1] === '+' ? 1 : -1;
      return 0;
    }
    const num = m[1] === '' ? 1 : parseInt(m[1], 10);
    return m[2] === '+' ? num : -num;
  }

  function tokenize(formula) {
    // Split into species tokens for balancing input is handled elsewhere.
    // Here we implement formula parser for single species.
    let i = 0;
    const s = String(formula || '');
    function peek() { return s[i]; }
    function next() { return s[i++]; }

    function parseNumber() {
      let num = '';
      while (/[0-9]/.test(peek())) num += next();
      return num ? parseInt(num,10) : 1;
    }

    function parseSymbol() {
      let sym = '';
      if (/[A-Z]/.test(peek())) {
        sym += next();
        if (/[a-z]/.test(peek())) sym += next();
        return sym;
      }
      return null;
    }

    function parseGroup() {
      const elCounts = {};
      while (i < s.length) {
        const ch = peek();
        if (ch === '(') {
          next(); // consume '('
          const inner = parseGroup();
          // expect ')'
          if (peek() === ')') next(); // consume ')'
          const mul = parseNumber();
          for (const k in inner) {
            elCounts[k] = (elCounts[k] || 0) + inner[k] * mul;
          }
        } else if (ch === ')') {
          break;
        } else if (/[A-Z]/.test(ch)) {
          const sym = parseSymbol();
          const num = parseNumber();
          elCounts[sym] = (elCounts[sym] || 0) + num;
        } else if (ch === '^') {
          // charge marker; stop parsing atoms
          break;
        } else if (ch === '+' || ch === '-') {
          // trailing charge; stop
          break;
        } else {
          // unexpected char, skip (robustness)
          next();
        }
      }
      return elCounts;
    }

    // parse atoms
    const atoms = parseGroup();
    // parse optional charge at end
    const rest = s.slice(i);
    let charge = 0;
    if (rest.length) {
      // accept formats: 2+, ^2+, +, - etc.
      const m = rest.match(/\\^?([0-9]*)([+-])/);
      if (m) {
        const magnitude = m[1] === '' ? 1 : parseInt(m[1],10);
        charge = m[2] === '+' ? magnitude : -magnitude;
      }
    }
    return { atoms, charge };
  }

  ns.parseSpecies = function(specStr) {
    try {
      return tokenize(specStr.trim());
    } catch (e) {
      return { atoms: {}, charge: 0 };
    }
  };

})(window.ChemApp = window.ChemApp || {});
