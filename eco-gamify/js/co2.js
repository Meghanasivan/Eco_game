/* js/co2.js */
(function(){
  const co2TotalEl = document.getElementById('co2Total');
  const co2EquivEl = document.getElementById('co2Equiv');
  const estimateBtn = document.getElementById('estimateBtn');

  function render(){
    const c = ECO.getCO2();
    co2TotalEl.innerText = `${Number(c).toFixed(2)} kg`;
    co2EquivEl.innerText = '';
  }

  estimateBtn.addEventListener('click', ()=>{
    const c = ECO.getCO2();
    // simple relatable equivalents
    const phoneCharges = 0.008; // kg per charge (illustrative)
    const treeYear = 21.77; // kg CO2 per tree per year (illustrative)
    const phones = Math.max(1, Math.round(c / phoneCharges));
    const trees = (c / treeYear).toFixed(2);
    co2EquivEl.innerText = `Equivalent to ~${phones} phone charges or ${trees} years of CO₂ absorption by a tree (illustrative).`;
  });

  window.addEventListener('eco:stateChanged', render);
  document.addEventListener('DOMContentLoaded', render);
})();
