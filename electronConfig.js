/* electronConfig.js — build electron configuration using Aufbau + exceptions
   Produces: { long, nobleGas, shells } strings
*/
(function(ns){
  'use strict';

  const Aufbau = [
    {orb:'1s', cap:2},
    {orb:'2s', cap:2},
    {orb:'2p', cap:6},
    {orb:'3s', cap:2},
    {orb:'3p', cap:6},
    {orb:'4s', cap:2},
    {orb:'3d', cap:10},
    {orb:'4p', cap:6},
    {orb:'5s', cap:2},
    {orb:'4d', cap:10},
    {orb:'5p', cap:6},
    {orb:'6s', cap:2},
    {orb:'4f', cap:14},
    {orb:'5d', cap:10},
    {orb:'6p', cap:6},
    {orb:'7s', cap:2},
    {orb:'5f', cap:14},
    {orb:'6d', cap:10},
    {orb:'7p', cap:6}
  ];

  const exceptions = {
    // common exceptions (Cu, Cr, etc.)
    24: '[Ar] 4s1 3d5', // Cr
    29: '[Ar] 4s1 3d10', // Cu
    47: '[Kr] 5s1 4d10', // Ag
    79: '[Xe] 6s1 4f14 5d10' // Au (simplified)
  };

  function buildConfig(Z) {
    if (!Number.isInteger(Z) || Z < 1 || Z > 118) return null;
    if (exceptions[Z]) return { long: exceptions[Z] };
    let left = Z;
    let longParts = [];
    for (const orb of Aufbau) {
      if (left <= 0) break;
      const use = Math.min(left, orb.cap);
      longParts.push(`${orb.orb}${use}`);
      left -= use;
    }
    return { long: longParts.join(' ') };
  }

  // Noble gas shorthand: find nearest completed shell (approx)
  function nobleGasShorthand(longStr) {
    // mapping some noble gases
    const noble = {
      2: '[He]',
      10: '[Ne]',
      18: '[Ar]',
      36: '[Kr]',
      54: '[Xe]',
      86: '[Rn]'
    };
    // calculate electrons to match noble totals by accumulating subshells
    return null; // for MVP we return null and prefer long form
  }

  ns.calcElectronConfig = function(symbol) {
    const el = ns.ELEMENTS && ns.ELEMENTS[symbol];
    if (!el) return { error:'Element nicht gefunden (extend ELEMENTS in data.js).' };
    const Z = el.Z;
    const preset = exceptions[Z];
    if (preset) return { long: preset, note: 'Ausnahme (Cu/Cr/...).' };
    const cfg = buildConfig(Z);
    return { long: cfg.long };
  };

})(window.ChemApp = window.ChemApp || {});
