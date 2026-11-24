/* Worksheets ← Vocab Sets: loads the chosen set (?set=ID, else the last one opened) before the worksheet page starts. */
(function(){
const q=new URLSearchParams(location.search);
const esc=t=>String(t??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const art=w=>/^[aeiou]/i.test(w)?'an':'a';
if(!q.get('dev'))document.body.classList.add('live');

function useSet(v){
 window.VSET=v;
 window.VTOPIC=(v.icon||'📚')+' '+v.name;
 // W rows = [word, picture (emoji or <img>), IPA] — same shape as the worksheet demo data
 window.VSET_W=v.words.filter(w=>w.w&&w.w.trim()).map(w=>[w.w.trim(),w.img?`<img src="${w.img}" alt="">`:(w.e||'🖼️'),w.ipa||'']);
 const sen=VS.lines(v.sen),dlg=VS.lines(v.dlg),mtTh=v.mt==='th';
 // No sentences / dialogues yet → simple ones made from the words, so every quiz type still prints this topic
 window.VSET_SEN=sen.length?sen.join('\n'):v.words.slice(0,12).map(w=>`This is ${art(w.w)} [${w.w}]. | ${w.m?(mtTh?'นี่คือ'+w.m:w.m):''}`).join('\n');
 window.VSET_DLG=dlg.length?dlg.join('\n'):v.words.slice(0,10).map(w=>`What is this? | It is ${art(w.w)} ${w.w}.`).join('\n');
 window.VSET_AUTO={sen:!sen.length,dlg:!dlg.length,sto:!(v.sto&&v.sto.trim())};
}

window.wsPick=async function(){
 const all=await VS.all().catch(()=>[]);const cur=window.VSET&&window.VSET.id;const t=window.__WS?window.__WS.S.t:(q.get('t')||'');
 const el=document.createElement('div');el.className='vsp';
 el.innerHTML=`<div class="box" role="dialog" aria-modal="true"><div class="hd2"><b>📚 Choose a vocab set</b><button class="x" data-x>✕</button></div><div class="ls">${all.map(v=>`<a href="?set=${encodeURIComponent(v.id)}${t?'&t='+t:''}" class="${v.id===cur?'on':''}" data-id="${v.id}"><span class="e">${esc(v.icon||'📚')}</span><span><b>${esc(v.name)}</b><small>🖼️ ${v.words.length} · 📝 ${VS.lines(v.sen).length} · 💬 ${VS.lines(v.dlg).length}</small></span></a>`).join('')||'<p style="color:var(--muted);margin:4px">No vocab sets yet.</p>'}<a href="index.html?new=1"><span class="e">＋</span><span><b>Make a new set</b><small>Vocab Set Creator</small></span></a>${cur?`<a href="index.html?set=${encodeURIComponent(cur)}"><span class="e">✏️</span><span><b>Edit this set</b><small>${esc(window.VSET.name)}</small></span></a>`:''}</div></div>`;
 el.addEventListener('click',e=>{if(e.target===el||e.target.closest('[data-x]'))el.remove();const a=e.target.closest('a[data-id]');if(a)VS.cur.set(a.dataset.id)});
 document.body.appendChild(el)};

// keep edits made in the worksheet's Sentences / Dialogues / Stories boxes in the set
let svT=null;
function watchEdits(){if(!window.VSET||!window.__WS)return;const S=window.__WS.S,V=window.VSET;
 const snap={sen:S.sen,dlg:S.dlg,sto:S.sto};
 document.addEventListener('input',()=>{clearTimeout(svT);svT=setTimeout(()=>{let ch=false;
  if(S.sen!==snap.sen){snap.sen=S.sen;V.sen=S.sen;ch=true}
  if(S.dlg!==snap.dlg){snap.dlg=S.dlg;V.dlg=S.dlg;ch=true}
  if(S.sto!==snap.sto){snap.sto=S.sto;V.sto=S.sto;ch=true}
  if(ch)VS.put(V).catch(()=>{})},600)},true)}

(async()=>{
 let v=null;
 try{const id=q.get('set')||VS.cur.get();if(id)v=await VS.get(id);if(!v&&!q.get('set')){const all=await VS.all();v=all[0]||null}}catch(e){}
 if(v&&v.words&&v.words.filter(w=>w.w).length>=2){useSet(v);VS.cur.set(v.id)}else v=null;
 try{window.__wsBoot()}catch(e){window.__report&&window.__report('Worksheet start: '+e.message,'worksheets.html',0,0,e.stack);throw e}
 const b=document.getElementById('tpb');
 if(v){b.textContent=`${v.icon||'📚'} ${v.name} · ${window.VSET_W.length} ▾`;watchEdits();
  const A=window.VSET_AUTO,miss=[A.sen&&'sentences',A.dlg&&'dialogues',A.sto&&'stories'].filter(Boolean);
  if(miss.length)setTimeout(()=>window.__WS.toast(`ℹ️ This set has no ${miss.join(' / ')} yet: simple ones are used (add them in the creator)`),600)}
 else{b.textContent='🍎 Fruits (sample) ▾';setTimeout(()=>window.__WS&&window.__WS.toast('🍎 Sample words · tap the topic button to choose your vocab set'),600)}
})();
})();
