/* stoichiometry.js — molecular mass, mol<->g, limiting reagent basic functions */
(function(ns){
  'use strict';
  const E = ns.ELEMENTS || {};

  function molarMassFromFormula(formula) {
    const parsed = ns.parseSpecies(formula);
    let mass = 0;
    for (const el in parsed.atoms) {
      const a = parsed.atoms[el];
      const info = E[el];
      if (!info) throw new Error('Element ' + el + ' nicht in DB: erweitere data.js');
      mass += a * info.Ar;
    }
    return mass;
  }

  ns.stoich = {
    molarMassFromFormula,
    gramsToMol: function(grams, formula){ return grams / molarMassFromFormula(formula); },
    molToGrams: function(mols, formula){ return mols * molarMassFromFormula(formula); },
    limitingReagent: function(reactants) {
      // reactants: [{formula, mass (g)} ...]
      const avals = reactants.map(r => ({r, mol: r.mass / molarMassFromFormula(r.formula)}));
      // simplistic: return smallest mols
      let min = Infinity, minIdx = -1;
      for (let i=0;i<avals.length;i++){
        if (avals[i].mol < min) { min = avals[i].mol; minIdx = i; }
      }
      return { index: minIdx, reagent: reactants[minIdx], mols: min };
    }
  };
})(window.ChemApp = window.ChemApp || {});
