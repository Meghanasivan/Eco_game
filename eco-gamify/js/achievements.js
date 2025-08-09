/* js/achievements.js */
(function(){
  const ACHIEVEMENTS = [
    {key:'first_action', title:'First Action', condition: s => s >= 10},
    {key:'eco_100', title:'100 Points', condition: s => s >= 100},
    {key:'eco_500', title:'500 Points', condition: s => s >= 500},
    {key:'co2_10', title:'CO₂ Saver 10 kg', conditionCO2: c => c >= 10}
  ];
  const container = document.getElementById('badgesContainer');
  const refreshBtn = document.getElementById('refreshBtn');

  function render(){
    container.innerHTML = '';
    const unlocked = JSON.parse(localStorage.getItem('eco_badges') || '[]');
    ACHIEVEMENTS.forEach(ach=>{
      const score = ECO.getScore();
      const co2 = ECO.getCO2();
      const unlockedNow = unlocked.includes(ach.key) || (ach.condition && ach.condition(score)) || (ach.conditionCO2 && ach.conditionCO2(co2));
      const span = document.createElement('div');
      span.className = 'badge';
      span.innerText = unlockedNow ? `🏅 ${ach.title}` : `🔒 ${ach.title}`;
      container.appendChild(span);
    });
  }

  refreshBtn.addEventListener('click', render);
  window.addEventListener('eco:stateChanged', render);
  document.addEventListener('DOMContentLoaded', render);
})();
