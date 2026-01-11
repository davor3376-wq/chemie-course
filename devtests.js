/* devtests.js — simple deterministic unit tests for core features */
(function(ns){
  'use strict';
  ns.runDevTests = function() {
    const results = [];
    try {
      // Test parser: Fe2(SO4)3 -> Fe:2 S:3 O:12
      const p1 = ns.parseSpecies('Fe2(SO4)3');
      const ok1 = p1.atoms.Fe === 2 && p1.atoms.S === 3 && p1.atoms.O === 12;
      results.push({ name:'Parser parentheses', ok: ok1, got: p1.atoms });

      // Test parse charge: Cu2+
      const p2 = ns.parseSpecies('Cu2+');
      results.push({ name:'Parser charge Cu2+', ok: p2.charge === 2, got: p2.charge });

      // Balancer Zn + Cu2+ -> Zn2+ + Cu
      const b1 = ns.balanceEquation('Zn + Cu2+ -> Zn2+ + Cu');
      results.push({ name:'Balancer Zn/Cu', ok: b1.success && b1.coefficients && b1.coefficients.length===4, got: b1 });

      // Balancer Fe + O2 -> Fe2O3 expect 4,3,2
      const b2 = ns.balanceEquation('Fe + O2 -> Fe2O3');
      const ok2 = b2.success && b2.equation && b2.equation.includes('4 Fe') && b2.equation.includes('3 O2') && b2.equation.includes('2 Fe2O3');
      results.push({ name:'Balancer Fe/O2', ok: ok2, got: b2.equation });

      // electron config Fe
      const e1 = ns.calcElectronConfig('Fe');
      results.push({ name:'Electron config Fe', ok: !!e1.long, got: e1 });

      return { ok: results.every(r=>r.ok), results };
    } catch (e) {
      return { ok:false, error: String(e) };
    }
  };
})(window.ChemApp = window.ChemApp || {});
