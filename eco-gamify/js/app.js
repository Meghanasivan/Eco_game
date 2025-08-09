/* js/app.js
   Shared state & utilities (ECO global)
*/
(function(global){
  const STORAGE_KEYS = {
    player: 'eco_player',
    score: 'eco_score',
    co2: 'eco_co2',
    leaderboard: 'eco_leaderboard',
    badges: 'eco_badges',
    team: 'eco_team',
    steps: 'eco_steps',
    streak: 'eco_streak',
    persona: 'eco_persona',
    lastActionAt: 'eco_lastActionAt',
    unlocked: 'eco_unlocked',
    totalCommunity: 'eco_community'
  };

  function save(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  function load(key, fallback=null){
    const raw = localStorage.getItem(key);
    if(raw === null) return fallback;
    try{ return JSON.parse(raw); } catch(e){ return fallback; }
  }

  // State
  let player = load(STORAGE_KEYS.player, '');
  let score = Number(load(STORAGE_KEYS.score, 0)) || 0;
  let co2 = Number(load(STORAGE_KEYS.co2, 0)) || 0;
  let leaderboard = load(STORAGE_KEYS.leaderboard, []);
  let team = load(STORAGE_KEYS.team, null);
  let badges = load(STORAGE_KEYS.badges, []);
  let streak = Number(load(STORAGE_KEYS.streak, 0)) || 0;
  let persona = load(STORAGE_KEYS.persona, null);
  let unlocked = load(STORAGE_KEYS.unlocked, []);

  function saveAll(){
    save(STORAGE_KEYS.score, score);
    save(STORAGE_KEYS.co2, co2);
    save(STORAGE_KEYS.leaderboard, leaderboard);
    save(STORAGE_KEYS.badges, badges);
    save(STORAGE_KEYS.streak, streak);
    save(STORAGE_KEYS.persona, persona);
    save(STORAGE_KEYS.unlocked, unlocked);
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

  function getPlayer(){ return player; }
  function getScore(){ return Number(score); }
  function getCO2(){ return Number(co2); }
  function getStreak(){ return Number(streak); }
  function getPersona(){ return persona; }
  function getUnlocked(){ return unlocked.slice(); }
  function getBadges(){ return (badges || []).slice(); }
  function getLocalSteps(){ return Number(load(STORAGE_KEYS.steps, 0)) || 0; }
  function setLocalSteps(n){ save(STORAGE_KEYS.steps, Number(n)||0); }

  function setPlayerName(name){
    player = String(name || '').trim();
    save(STORAGE_KEYS.player, player);
    if(player){
      let existing = leaderboard.find(p => p.name === player);
      if(!existing) {
        leaderboard.push({ name: player, score: score, co2: co2, team: team || null });
        save(STORAGE_KEYS.leaderboard, leaderboard);
      }
    }
    saveAll();
    return player;
  }

  function joinTeam(teamName){
    team = String(teamName || '').trim() || null;
    save(STORAGE_KEYS.team, team);
    if(player){
      let existing = leaderboard.find(p => p.name === player);
      if(existing) existing.team = team;
      save(STORAGE_KEYS.leaderboard, leaderboard);
    }
    saveAll();
    return team;
  }

  function recordActionMeta(type){
    const tally = load('eco_action_tally', {});
    tally[type] = (tally[type] || 0) + 1;
    save('eco_action_tally', tally);
  }

  function addPoints(points, co2Kg, metaType){
    try {
      const last = load(STORAGE_KEYS.lastActionAt, null);
      const today = new Date().toISOString().slice(0,10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
      if(last === today) {
        // same day
      } else if(last === yesterday) {
        streak = Number(streak) + 1;
        save(STORAGE_KEYS.streak, streak);
      } else {
        streak = 1;
        save(STORAGE_KEYS.streak, streak);
      }
      save(STORAGE_KEYS.lastActionAt, today);
    } catch(e){ /* ignore */ }

    const multiplier = Math.min(1 + Math.floor(streak/5) * 0.2, 2.0);
    const awarded = Math.round(Number(points || 0) * multiplier);

    score = Number(Number(score) + awarded);
    co2 = Number(Number(co2) + Number(co2Kg || 0));
    save(STORAGE_KEYS.score, score);
    save(STORAGE_KEYS.co2, co2);

    if(player){
      let existing = leaderboard.find(p => p.name === player);
      if(existing){
        existing.score = score;
        existing.co2 = co2;
      } else {
        leaderboard.push({ name: player, score: score, co2: co2, team: team || null });
      }
      leaderboard.sort((a,b) => b.score - a.score);
      leaderboard = leaderboard.slice(0,50);
      save(STORAGE_KEYS.leaderboard, leaderboard);
    }

    if(score >= 100 && !badges.includes('eco_100')) { badges.push('eco_100'); save(STORAGE_KEYS.badges, badges); }
    if(score >= 500 && !badges.includes('eco_500')) { badges.push('eco_500'); save(STORAGE_KEYS.badges, badges); }
    if(metaType === 'plant' && !unlocked.includes('plant_orchid')) {
      unlocked.push('plant_orchid'); save(STORAGE_KEYS.unlocked, unlocked);
    }

    if(metaType) recordActionMeta(metaType);

    let comm = Number(load(STORAGE_KEYS.totalCommunity, 0)) || 0;
    comm += awarded;
    save(STORAGE_KEYS.totalCommunity, comm);

    saveAll();

    window.dispatchEvent(new CustomEvent('eco:stateChanged', { detail: { score, co2, awarded, multiplier } }));
    return { score, co2, awarded, multiplier };
  }

  function resetAllLocal(){
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('eco_action_tally');
    window.location.reload();
  }

  function renderLeaderboardUI(listElement){
    if(!listElement) return;
    leaderboard = load(STORAGE_KEYS.leaderboard, []);
    leaderboard.sort((a,b)=> b.score - a.score);
    listElement.innerHTML = '';
    if(leaderboard.length === 0){
      listElement.innerHTML = '<li class="muted">No players yet — be the first!</li>';
      return;
    }
    leaderboard.forEach((p, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${i+1}. ${escapeHtml(p.name)}</strong> — ${p.score} pts <div class="small muted">CO₂: ${Number(p.co2||0).toFixed(2)} kg${p.team? ' • ' + escapeHtml(p.team):''}</div>`;
      listElement.appendChild(li);
    });
  }

  function setPersona(p){
    persona = p ? { id: p.id, name: p.name, preferences: p.preferences || {} } : null;
    save(STORAGE_KEYS.persona, persona);
    saveAll();
    return persona;
  }

  function recommendAction(){
    const stats = load('eco_action_tally', {});
    const transport = stats.transport || 0;
    const waste = stats.waste || 0;
    const energy = stats.energy || 0;
    const plant = stats.plant || 0;
    if(transport < 2) return { title: 'Walk for a short trip', desc: 'Try walking or bike for short trips today. +15 pts', points:15, co2:0.2, type:'transport' };
    if(waste < 2) return { title: 'Avoid single-use plastic', desc: 'Carry a tote and avoid plastic bags. +12 pts', points:12, co2:0.05, type:'waste' };
    if(energy < 2) return { title: 'Dry clothes outside', desc: 'Air-dry a load of laundry. +35 pts', points:35, co2:1.0, type:'energy' };
    if(plant < 1) return { title: 'Plant a seed', desc: 'Plant a seed or small pot plant. +50 pts', points:50, co2:5, type:'plant' };
    const pool = [
      { title:'Use reusable bottle', points:30, co2:0.5, type:'waste'},
      { title:'Bike or public transport', points:40, co2:2.0, type:'transport'}
    ];
    return pool[Math.floor(Math.random()*pool.length)];
  }

  function buildShareText(){
    const p = player || 'A user';
    const s = score;
    const c = Number(co2).toFixed(2);
    return `${p} saved ${c} kg CO₂ and earned ${s} points on Eco Gamify! Join me in small actions that have big impact 🌍`;
  }
  function shareProgress(){
    const text = buildShareText();
    if(navigator.share){
      navigator.share({ title:'Eco Gamify progress', text }).catch(()=>{});
    } else {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url,'_blank');
    }
  }

  const STORE_ITEMS = [
    { id: 'skin_bluebird', name: 'Bluebird Theme', cost: 100 },
    { id: 'skin_autumn', name: 'Autumn Theme', cost: 250 },
    { id: 'plant_orchid', name: 'Orchid Plant', cost: 150 },
    { id: 'plant_oak', name: 'Oak Tree', cost: 400 }
  ];

  function buyItem(itemId){
    const item = STORE_ITEMS.find(i=>i.id===itemId);
    if(!item) return { ok:false, msg:'Item not found' };
    if(score < item.cost) return { ok:false, msg:'Not enough points' };
    score -= item.cost;
    save(STORAGE_KEYS.score, score);
    unlocked.push(itemId);
    save(STORAGE_KEYS.unlocked, unlocked);
    window.dispatchEvent(new CustomEvent('eco:stateChanged', { detail: { score, co2 } }));
    saveAll();
    return { ok:true, item };
  }

  global.ECO = {
    addPoints, getScore, getCO2, setPlayerName, getPlayer, joinTeam, renderLeaderboardUI, resetAllLocal,
    getLocalSteps, setLocalSteps, getStreak, getPersona, setPersona, recommendAction, shareProgress,
    getBadges, getUnlocked, buyItem
  };

  window.addEventListener('storage', (e) => {
    if(Object.values(STORAGE_KEYS).includes(e.key)){
      const newScore = Number(load(STORAGE_KEYS.score, 0)) || 0;
      const newCO2 = Number(load(STORAGE_KEYS.co2, 0)) || 0;
      window.dispatchEvent(new CustomEvent('eco:stateChanged', { detail: { score: newScore, co2: newCO2 } }));
    }
  });

})(window);
