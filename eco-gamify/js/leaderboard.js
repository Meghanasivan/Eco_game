/* js/leaderboard.js */
(function(){
  const list = document.getElementById('leaderboardList');
  const refreshBtn = document.getElementById('refreshBtn');
  const clearBtn = document.getElementById('clearBtn');

  function render(){
    ECO.renderLeaderboardUI(list);
  }

  refreshBtn.addEventListener('click', render);
  clearBtn.addEventListener('click', ()=>{
    if(!confirm('Clear leaderboard (local only)?')) return;
    localStorage.removeItem('eco_leaderboard');
    render();
  });

  window.addEventListener('eco:stateChanged', render);
  document.addEventListener('DOMContentLoaded', render);
})();
