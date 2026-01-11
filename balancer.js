/* balancer.js — Algebraic balancer using rational arithmetic
   Strategy:
   - Parse equation into species (reactants / products)
   - Build element rows (+ optional charge row)
   - Solve for nullspace vector using rational Gaussian elimination
   - Scale to smallest integer positive coefficients
   - Returns { success, coefficients[], equationString, steps[] }
*/

(function(ns){
  'use strict';

  // Small Fraction implementation for safe rational arithmetic
  class Fraction {
    constructor(n=0,d=1){
      if (d===0) throw new Error('Zero denominator');
      // keep sign on numerator
      if (d < 0) { n = -n; d = -d; }
      const g = gcd(Math.trunc(n), Math.trunc(d));
      this.n = Math.trunc(n/g);
      this.d = Math.trunc(d/g);
    }
    valueOf(){ return this.n / this.d; }
    toString(){ return `${this.n}/${this.d}`; }
    add(b){ b = toFrac(b); return new Fraction(this.n*b.d + b.n*this.d, this.d*b.d); }
    sub(b){ b = toFrac(b); return new Fraction(this.n*b.d - b.n*this.d, this.d*b.d); }
    mul(b){ b = toFrac(b); return new Fraction(this.n*b.n, this.d*b.d); }
    div(b){ b = toFrac(b); if (b.n===0) throw new Error('Divide by zero'); return new Fraction(this.n*b.d, this.d*b.n); }
    neg(){ return new Fraction(-this.n, this.d); }
    isZero(){ return this.n === 0; }
  }

  function gcd(a,b){
    a = Math.abs(a); b = Math.abs(b);
    if (!a) return b; if (!b) return a;
    while (b){ const t=a%b; a=b; b=t; }
    return a;
  }

  function lcm(a,b){ return Math.abs(a*b)/gcd(a,b); }

  function toFrac(x){
    if (x instanceof Fraction) return x;
    if (typeof x === 'number') {
      // convert float to rational approximant? assume integer for our use
      return new Fraction(x,1);
    }
    if (typeof x === 'string') {
      const parts = x.split('/');
      if (parts.length === 2) return new Fraction(parseInt(parts[0],10), parseInt(parts[1],10));
      return new Fraction(parseFloat(x),1);
    }
    return new Fraction(x.n, x.d);
  }

  // Utility: multiply array of Fractions by scalar Fraction
  function scaleVector(vec, factor) {
    return vec.map(v => toFrac(v).mul(factor));
  }

  // Build matrix rows: one per element, optionally charge row
  function buildMatrix(speciesList, includeCharge) {
    // speciesList: array of { raw: 'Fe2O3', parsed: {atoms, charge}, side: 1|-1 }
    const elements = new Set();
    speciesList.forEach(sp => {
      Object.keys(sp.parsed.atoms).forEach(el => elements.add(el));
    });
    const elems = Array.from(elements).sort();
    const rows = elems.map(el => {
      return speciesList.map(sp => {
        const c = sp.parsed.atoms[el]||0;
        // reactants positive, products negative in the equation A * coeffs = 0
        return new Fraction(sp.side * c, 1);
      });
    });
    if (includeCharge) {
      const chargeRow = speciesList.map(sp => new Fraction(sp.side * (sp.parsed.charge||0), 1));
      rows.push(chargeRow);
    }
    return { matrix: rows, elements: elems };
  }

  // Gaussian elimination to reduced row echelon form with rational Fractions
  function rref(matrix) {
    const m = matrix.length;
    const n = matrix[0].length;
    const A = matrix.map(r => r.map(c => toFrac(c)));
    let row = 0;
    const pivotCols = [];
    for (let col=0; col<n && row < m; col++) {
      // find pivot row
      let sel = row;
      while (sel < m && A[sel][col].isZero()) sel++;
      if (sel === m) continue;
      // swap
      [A[row], A[sel]] = [A[sel], A[row]];
      // normalize pivot to 1
      const piv = A[row][col];
      for (let j=col;j<n;j++) A[row][j] = A[row][j].div(piv);
      // eliminate other rows
      for (let i=0;i<m;i++){
        if (i===row) continue;
        const factor = A[i][col];
        if (factor.isZero()) continue;
        for (let j=col;j<n;j++){
          A[i][j] = A[i][j].sub(factor.mul(A[row][j]));
        }
      }
      pivotCols.push(col);
      row++;
    }
    return { A, pivotCols };
  }

  // Solve homogeneous system A x = 0 for nontrivial integer vector
  function solveHomogeneous(matrix) {
    // matrix: rows x cols (Fractions)
    // We'll compute RREF and then assign free vars = 1, produce one basis vector
    const m = matrix.length;
    const n = matrix[0].length;
    if (n === 0) return null;
    const { A, pivotCols } = rref(matrix);
    const pivSet = new Set(pivotCols);
    const freeCols = [];
    for (let c=0;c<n;c++) if (!pivSet.has(c)) freeCols.push(c);
    if (freeCols.length === 0) {
      // only trivial solution
      return null;
    }
    // build solution vector with free variable = lcm of denominators to ensure integers later
    // create one solution by setting first free var = 1, others 0
    const freeAssign = Array(n).fill(new Fraction(0,1));
    freeAssign[freeCols[0]] = new Fraction(1,1);
    // back-substitute for pivot columns
    const x = Array(n).fill(new Fraction(0,1));
    for (let i=0;i<n;i++) x[i] = new Fraction(0,1);
    // pivot rows correspond to pivotCols in order of rref
    for (let r = 0; r < A.length; r++){
      // find pivot col in this row if any
      let pivotCol = -1;
      for (let c=0;c<n;c++){
        if (!A[r][c].isZero()) { pivotCol = c; break; }
      }
      if (pivotCol === -1) continue;
      // x_pivot = - sum_{free} A[r][free]*x_free - sum_{other pivots>pivot} A[r][j]*x_j
      let sum = new Fraction(0,1);
      for (let c = pivotCol+1; c<n; c++){
        if (!A[r][c].isZero()) {
          // if c is free, use freeAssign; if it's pivot but later, it should currently be 0
          sum = sum.add(A[r][c].mul(x[c]));
        }
      }
      // RHS is -sum (since Ax=0)
      x[pivotCol] = sum.neg();
      // add free assignments
      for (const fc of freeCols){
        if (fc > pivotCol){
          // included already in A[r][fc]*x[fc] above
        } else if (fc < pivotCol) {
          // must consider A[r][fc]*x[fc]
          x[pivotCol] = x[pivotCol].add(A[r][fc].mul(freeAssign[fc]));
        } else if (fc === pivotCol) {
          // if pivot is also free? shouldn't happen
        }
      }
    }
    // add free assignments directly
    for (const fc of freeCols) x[fc] = freeAssign[fc];

    // Scale to smallest integer vector
    // find LCM of denominators
    let denomLcm = 1;
    for (let i=0;i<n;i++) denomLcm = lcm(denomLcm, x[i].d);
    const intVec = x.map(v => (v.n * (denomLcm / v.d)));
    // make all integers
    // make them positive by multiplying by -1 if necessary
    // find gcd of all ints
    let g = 0;
    for (let v of intVec) g = gcd(g, Math.trunc(Math.abs(v)));
    if (g === 0) g = 1;
    const final = intVec.map(v => Math.trunc(v / g));
    // ensure all positive (multiply by -1 if all negative)
    const allNonPos = final.every(v => v <= 0);
    const allNeg = final.every(v => v < 0);
    const anyNeg = final.some(v => v < 0);
    let scaled = final;
    if (allNonPos) scaled = final.map(v => -v);
    if (anyNeg && !allNeg) {
      // try flip sign if majority negative
      const negatives = final.filter(v => v < 0).length;
      const positives = final.filter(v => v > 0).length;
      if (negatives > positives) scaled = final.map(v => -v);
      else {
        // there are mixed signs; try to make them positive by multiplying by -1 if possible
        // In chemical balancing, coefficients must be positive — if mixed signs, invert sign to make most positive
        scaled = final;
      }
    }
    // final validation: all must be non-zero and integers
    return scaled.map(v => Math.trunc(v));
  }

  // parse equation string into species
  function splitEquation(equation) {
    const arrowMatch = equation.match(/(->|→|=)/);
    if (!arrowMatch) throw new Error('No arrow (-> or →) found in equation.');
    const arrowIdx = arrowMatch.index;
    // better split by arrow tokens
    const parts = equation.split(/->|→|=/);
    if (parts.length !== 2) throw new Error('Equation must have left and right side.');
    const left = parts[0].split('+').map(s => s.trim()).filter(Boolean);
    const right = parts[1].split('+').map(s => s.trim()).filter(Boolean);
    const species = [];
    left.forEach(s => species.push({ raw: s, parsed: ns.parseSpecies(s), side: 1 }));
    right.forEach(s => species.push({ raw: s, parsed: ns.parseSpecies(s), side: -1 }));
    return species;
  }

  // Public function
  ns.balanceEquation = function(equationStr) {
    try {
      if (!equationStr || !equationStr.trim()) return { success:false, error:'Bitte Gleichung eingeben.' };
      const species = splitEquation(equationStr);
      // includeCharge boolean: only if any species has nonzero charge
      const includeCharge = species.some(s => (s.parsed && s.parsed.charge) && s.parsed.charge !== 0);
      const { matrix, elements } = buildMatrix(species, includeCharge);
      if (matrix.length === 0) return { success:false, error:'Keine Atome erkannt.' };
      const solution = solveHomogeneous(matrix);
      if (!solution) return { success:false, error:'Keine nicht-triviale Lösung gefunden.' };
      // map coefficients to species
      const coeffs = solution;
      if (coeffs.length !== species.length) {
        return { success:false, error:'Interner Fehler: Koeffizienten-Länge stimmt nicht.' };
      }
      // Format balanced equation
      const left = [], right = [];
      for (let i=0;i<species.length;i++){
        const coef = coeffs[i];
        const part = (coef === 1 ? '' : String(coef) + ' ') + species[i].raw;
        if (species[i].side === 1) left.push(part);
        else right.push(part);
      }
      const eqStr = left.join(' + ') + ' → ' + right.join(' + ');
      return { success:true, coefficients: coeffs, equation: eqStr, species };
    } catch (e) {
      return { success:false, error: String(e && e.message ? e.message : e) };
    }
  };

})(window.ChemApp = window.ChemApp || {});
