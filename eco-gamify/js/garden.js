/* js/garden.js */
(function(){
  const TREE_STAGES = [
    {name:'Seedling', min:0, cls:'stage-1'},
    {name:'Young Tree', min:100, cls:'stage-2'},
    {name:'Mature Tree', min:300, cls:'stage-3'}
  ];
  const treeLeaves = document.getElementById('treeLeaves');
  const treeLevel = document.getElementById('treeLevel');
  const growBurst = document.getElementById('growBurst');
  const sproutBtn = document.getElementById('sproutBtn');

  function updateTree(){
    const s = ECO.getScore();
    let stage = TREE_STAGES[0];
    for(let i=TREE_STAGES.length-1;i>=0;i--){
      if(s >= TREE_STAGES[i].min){ stage = TREE_STAGES[i]; break; }
    }
    treeLeaves.className = 'leaves ' + stage.cls;
    treeLevel.innerText = stage.name;
  }
  function triggerGrow(){
    growBurst.style.opacity='1'; growBurst.style.transform='scale(1)';
    setTimeout(()=>{ growBurst.style.opacity='0'; growBurst.style.transform='scale(.6)'; }, 700);
  }

  sproutBtn.addEventListener('click', ()=>{
    const res = ECO.addPoints(50, 2, 'plant');
    triggerGrow();
    updateTree();
    alert(`Sprout added: +${res.awarded} pts`);
  });

  window.addEventListener('eco:stateChanged', updateTree);
  document.addEventListener('DOMContentLoaded', updateTree);
})();
