/* data.js — Minimal element DB ready to be expanded.
   Production note: Replace with compressed JSON in /data for full DB (1-118).
*/
window.ChemApp = window.ChemApp || {};
ChemApp.ELEMENTS = {
  H:  { Z:1,  symbol:'H',  name_de:'Wasserstoff', Ar:1.0079, EN:2.20 },
  O:  { Z:8,  symbol:'O',  name_de:'Sauerstoff', Ar:15.999, EN:3.44 },
  Na: { Z:11, symbol:'Na', name_de:'Natrium', Ar:22.989, EN:0.93 },
  Cl: { Z:17, symbol:'Cl', name_de:'Chlor', Ar:35.45, EN:3.16 },
  Fe: { Z:26, symbol:'Fe', name_de:'Eisen', Ar:55.845, EN:1.83 },
  Cu: { Z:29, symbol:'Cu', name_de:'Kupfer', Ar:63.546, EN:1.90 },
  Zn: { Z:30, symbol:'Zn', name_de:'Zink', Ar:65.38, EN:1.65 },
  C:  { Z:6,  symbol:'C',  name_de:'Kohlenstoff', Ar:12.011, EN:2.55 }
};
/* Production tip:
   Save a full JSON file elements.json (1..118) and lazy-load it in stoichiometry/atomic functions.
*/
