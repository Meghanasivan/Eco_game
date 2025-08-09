/* js/search.js */
(function(){
  const data = {
    'plastic bottle': { category:'Recycle', tip:'Rinse, remove cap if required by local rules. Recycle or reuse as a planter.' },
    'glass jar': { category:'Reuse', tip:'Reuse as storage jars, or recycle at glass-specific streams.' },
    'old clothes': { category:'Reuse', tip:'Donate or repurpose into rags/quilts. If unusable, textile recycling.' },
    'banana peel': { category:'Reduce/Compost', tip:'Compost organic waste; banana peels are excellent for compost.' },
    'cigarette butt': { category:'Reduce', tip:'Cigarette filters are not biodegradable—use waste bins and reduce smoking litter.' },
    'electronics': { category:'Recycle', tip:'E-waste must be collected at authorized e-waste centers.' },
    'plastic bag': { category:'Reduce', tip:'Avoid single-use plastic bags; use cloth totes.' },
    'paper': { category:'Recycle', tip:'Keep paper dry and clean for recycling.' },
    'battery': { category:'Recycle', tip:'Dispose at battery collection points to avoid heavy metal contamination.' }
  };

  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const resultCard = document.getElementById('resultCard');
  const resultTitle = document.getElementById('resultTitle');
  const resultCategory = document.getElementById('resultCategory');
  const resultTip = document.getElementById('resultTip');
  const learnBtn = document.getElementById('learnBtn');

  function classify(query){
    query = (query || '').trim().toLowerCase();
    if(!query) return null;
    if(data[query]) return Object.assign({ item: query }, data[query]);
    for(const k of Object.keys(data)){
      if(query.includes(k) || k.includes(query)) return Object.assign({ item: k }, data[k]);
    }
    if(query.includes('plastic')) return { item: query, category:'Reduce/Recycle', tip:'Avoid single-use plastic; check local recycling rules.' };
    if(query.includes('banana') || query.includes('peel') || query.includes('organic') ) return { item: query, category:'Compost', tip:'Compost organic waste.' };
    return null;
  }

  searchBtn.addEventListener('click', ()=>{
    const q = searchInput.value;
    const res = classify(q);
    if(!res){
      resultCard.hidden = false;
      resultTitle.innerText = 'Not found';
      resultCategory.innerText = '';
      resultTip.innerText = 'Try a different query or check spelling.';
      learnBtn.style.display = 'none';
    } else {
      resultCard.hidden = false;
      resultTitle.innerText = res.item;
      resultCategory.innerText = `Category: ${res.category}`;
      resultTip.innerText = res.tip;
      learnBtn.style.display = 'inline-block';
      let searches = JSON.parse(localStorage.getItem('eco_searches') || '[]');
      searches.unshift({q:res.item, at: new Date().toISOString(), category: res.category});
      searches = searches.slice(0,50);
      localStorage.setItem('eco_searches', JSON.stringify(searches));
    }
  });

  learnBtn.addEventListener('click', ()=>{
    ECO.addPoints(5, 0, 'learn');
    showTemp('+5 points for learning!');
  });

  function showTemp(text, ms=1500){
    const el = document.createElement('div');
    el.style.position='fixed'; el.style.left='50%'; el.style.transform='translateX(-50%)';
    el.style.bottom='18px'; el.style.background='rgba(12,92,27,0.95)'; el.style.color='white';
    el.style.padding='10px 14px'; el.style.borderRadius='999px'; el.style.zIndex=9999; el.innerText=text;
    document.body.appendChild(el);
    setTimeout(()=> el.remove(), ms);
  }

  searchInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') searchBtn.click();
  });

})();
