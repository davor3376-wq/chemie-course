/* main.js — UI glue: wire controls to engines and localStorage
   Production-ready: input sanitisation, error handling, aria-live updates
*/
(function(ns){
  'use strict';
  function safeText(s){ return String(s==null?'':s); }

  document.addEventListener('DOMContentLoaded', () => {
    const eqInput = document.getElementById('eqInput');
    const eqOutput = document.getElementById('eqOutput');
    const balanceBtn = document.getElementById('balanceBtn');
    const balanceClear = document.getElementById('balanceClear');
    const exportEq = document.getElementById('exportEq');

    const elInput = document.getElementById('elInput');
    const elOutput = document.getElementById('elOutput');
    const elBtn = document.getElementById('elBtn');
    const elClear = document.getElementById('elClear');

    const formulaInput = document.getElementById('formulaInput');
    const massInput = document.getElementById('massInput');
    const molCalc = document.getElementById('molCalc');
    const stoichOutput = document.getElementById('stoichOutput');

    const runTests = document.getElementById('runTests');
    const testOutput = document.getElementById('testOutput');

    // restore last
    try {
      const lastEq = ns.Storage.get('chem:last:eq');
      if (lastEq) eqInput.value = lastEq;
      const lastEl = ns.Storage.get('chem:last:el');
      if (lastEl) elInput.value = lastEl;
    } catch(e){ /* ignore */ }

    balanceBtn.addEventListener('click', () => {
      const eq = safeText(eqInput.value).trim();
      ns.Storage.set('chem:last:eq', eq);
      const res = ns.balanceEquation(eq);
      if (!res.success) {
        eqOutput.textContent = 'Fehler: ' + (res.error || 'Unbekannter Fehler');
        eqOutput.setAttribute('aria-live','assertive');
        return;
      }
      eqOutput.textContent = res.equation;
    });
    balanceClear.addEventListener('click', () => { eqInput.value=''; eqOutput.textContent=''; ns.Storage.remove('chem:last:eq'); });

    exportEq.addEventListener('click', () => {
      const eq = safeText(eqInput.value).trim();
      const res = ns.balanceEquation(eq);
      const blob = new Blob([JSON.stringify(res, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'balanced_equation.json'; a.click();
      URL.revokeObjectURL(url);
    });

    elBtn.addEventListener('click', () => {
      const sym = safeText(elInput.value).trim();
      ns.Storage.set('chem:last:el', sym);
      const res = ns.calcElectronConfig(sym);
      if (res && res.error) elOutput.textContent = 'Fehler: ' + res.error;
      else elOutput.textContent = res.long || JSON.stringify(res);
    });
    elClear.addEventListener('click', () => { elInput.value=''; elOutput.textContent=''; ns.Storage.remove('chem:last:el'); });

    molCalc.addEventListener('click', () => {
      const formula = safeText(formulaInput.value).trim();
      const mass = parseFloat(massInput.value);
      if (!formula) { stoichOutput.textContent = 'Bitte Formel eingeben.'; return; }
      try {
        const mm = ns.stoich.molarMassFromFormula(formula);
        let text = `Molar masse ${formula}: ${mm.toFixed(4)} g/mol\\n`;
        if (!isNaN(mass)) {
          const mols = mass / mm;
          text += `${mass} g → ${mols} mol`;
        } else {
          text += `Gib eine Masse in g ein um mol zu berechnen.`;
        }
        stoichOutput.textContent = text;
      } catch (e) {
        stoichOutput.textContent = 'Fehler: ' + e.message;
      }
    });

    runTests.addEventListener('click', () => {
      try {
        const out = ns.runDevTests();
        testOutput.textContent = JSON.stringify(out, null, 2);
      } catch (e) {
        testOutput.textContent = 'Tests failed: ' + e.message;
      }
    });
  });

})(window.ChemApp = window.ChemApp || {});
