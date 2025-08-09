/* js/home.js */
(function(){
  const ACTIONS = [
    { title:'🚶 Walk Instead of Drive', points:10, co2:0.25, type:'transport' },
    { title:'♻️ Recycle Waste', points:20, co2:0.05, type:'waste' },
    { title:'💧 Save Water', points:15, co2:0.02, type:'energy' },
    { title:'🌞 Use Solar (small)', points:25, co2:1.2, type:'energy' },
    { title:'🚫 Skip Single-Use Plastic', points:12, co2:0.04, type:'waste' },
    { title:'🌱 Plant a Seed', points:50, co2:5, type:'plant' }
  ];

  const TREE_STAGES = [
    {name:'Seedling', min:0, cls:'stage-1'},
    {name:'Young Tree', min:100, cls:'stage-2'},
    {name:'Mature Tree', min:300, cls:'stage-3'}
  ];

  const scoreDisplay = document.getElementById('scoreDisplay');
  const co2Display = document.getElementById('co2Display');
  const quickActions = document.getElementById('quickActions');
  const treeLeaves = document.getElementById('treeLeaves');
  const treeLevel = document.getElementById('treeLevel');
  const growBurst = document.getElementById('growBurst');
  const dailyTitle = document.getElementById('dailyTitle');
  const dailyDesc = document.getElementById('dailyDesc');
  const completeDailyBtn = document.getElementById('completeDailyBtn');
  const skipDailyBtn = document.getElementById('skipDailyBtn');
  const streakEl = document.getElementById('streak');
  const playerNameInput = document.getElementById('playerName');
  const saveNameBtn = document.getElementById('saveNameBtn');
  const leaderboardList = document.getElementById('leaderboardList');
  const joinTeamBtn = document.getElementById('joinTeamBtn');
  const teamNameInput = document.getElementById('teamName');
  const currentTeamEl = document.getElementById('currentTeam');
  const resetBtn = document.getElementById('resetBtn');
  const recommendationEl = document.getElementById('recommendation');

  function updateScoreUI(detail){
    scoreDisplay.innerText = String(ECO.getScore());
    co2Display.innerText = `CO₂ saved: ${Number(ECO.getCO2()).toFixed(2)} kg`;
    streakEl.innerText = String(ECO.getStreak());
  }
  function triggerGrow(){
    growBurst.style.opacity='1'; growBurst.style.transform='scale(1)';
    setTimeout(()=>{ growBurst.style.opacity='0'; growBurst.style.transform='scale(.6)'; }, 700);
  }
  function updateTree(){
    const s = ECO.getScore();
    let stage = TREE_STAGES[0];
    for(let i=TREE_STAGES.length-1;i>=0;i--){
      if(s >= TREE_STAGES[i].min){ stage = TREE_STAGES[i]; break; }
    }
    treeLeaves.className = 'leaves ' + stage.cls;
    treeLevel.innerText = stage.name;
  }

  function renderActions(){
    quickActions.innerHTML = '';
    ACTIONS.forEach(a => {
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.innerText = `${a.title} (+${a.points})`;
      btn.addEventListener('click', ()=>{
        const res = ECO.addPoints(a.points, a.co2, a.type);
        showTempMessage(`+${res.awarded} pts • saved ${a.co2} kg CO₂`);
      });
      quickActions.appendChild(btn);
    });
  }

  function showTempMessage(text, ms=2000){
    const el = document.createElement('div');
    el.style.position='fixed'; el.style.left='50%'; el.style.transform='translateX(-50%)';
    el.style.bottom='18px'; el.style.background='rgba(12,92,27,0.95)'; el.style.color='white';
    el.style.padding='10px 14px'; el.style.borderRadius='999px'; el.style.zIndex=9999; el.innerText=text;
    document.body.appendChild(el);
    setTimeout(()=> el.remove(), ms);
  }

  function pickDaily(){
    const today = new Date().toISOString().slice(0,10);
    let daily = JSON.parse(localStorage.getItem('eco_daily') || 'null');
    if(!daily || daily.date !== today){
      const rec = ECO.recommendAction();
      daily = Object.assign({}, rec, { date: today, claimed: false });
      localStorage.setItem('eco_daily', JSON.stringify(daily));
    }
    return daily;
  }
  function showDaily(){
    const daily = pickDaily();
    dailyTitle.innerText = daily.title;
    dailyDesc.innerText = daily.desc ? daily.desc : `Reward: +${daily.points} pts`;
    completeDailyBtn.innerText = daily.claimed ? 'Claimed' : `Complete (+${daily.points})`;
    completeDailyBtn.disabled = !!daily.claimed;
  }

  function showRecommendation(){
    const rec = ECO.recommendAction();
    recommendationEl.innerHTML = `<strong>${rec.title}</strong><div class="muted small">${rec.desc || ''}</div>
      <div style="margin-top:.6rem"><button class="action-btn" id="applyRec">Do it (+${rec.points})</button></div>`;
    document.getElementById('applyRec').addEventListener('click', ()=>{
      const res = ECO.addPoints(rec.points, rec.co2 || 0, rec.type);
      showTempMessage(`+${res.awarded} pts • ${rec.title}`);
    });
  }

  saveNameBtn.addEventListener('click', ()=>{
    const name = playerNameInput.value.trim();
    if(!name){ alert('Please enter name'); return; }
    ECO.setPlayerName(name);
    showTempMessage(`Welcome ${name}`);
    ECO.renderLeaderboardUI(leaderboardList);
    updateScoreUI();
  });
  joinTeamBtn.addEventListener('click', ()=>{
    const t = teamNameInput.value.trim();
    if(!t){ alert('Enter team name'); return; }
    ECO.joinTeam(t);
    currentTeamEl.innerText = t;
    showTempMessage(`Joined team: ${t}`);
    ECO.renderLeaderboardUI(leaderboardList);
  });
  resetBtn.addEventListener('click', ()=>{
    if(confirm('Reset local progress?')) ECO.resetAllLocal();
  });

  completeDailyBtn.addEventListener('click', ()=>{
    const daily = pickDaily();
    if(daily.claimed) return;
    const res = ECO.addPoints(daily.points, daily.co2 || 0, daily.type || 'learn');
    daily.claimed = true;
    localStorage.setItem('eco_daily', JSON.stringify(daily));
    showTempMessage(`Daily complete! +${res.awarded}pts`);
    showDaily(); updateScoreUI(); ECO.renderLeaderboardUI(leaderboardList); triggerGrow(); updateTree();
  });

  skipDailyBtn.addEventListener('click', ()=>{
    const daily = pickDaily();
    daily.claimed = true; daily.skipped = true;
    localStorage.setItem('eco_daily', JSON.stringify(daily));
    showTempMessage('Daily skipped.');
    showDaily();
  });

  window.addEventListener('eco:stateChanged', (e)=>{ updateScoreUI(e.detail); ECO.renderLeaderboardUI(leaderboardList); updateTree(); });

  document.addEventListener('DOMContentLoaded', ()=>{
    const p = ECO.getPlayer();
    if(p) playerNameInput.value = p;
    updateScoreUI();
    renderActions();
    showDaily();
    ECO.renderLeaderboardUI(leaderboardList);
    currentTeamEl.innerText = localStorage.getItem('eco_team') || '—';
    updateTree();
    showRecommendation();
  });

})();
