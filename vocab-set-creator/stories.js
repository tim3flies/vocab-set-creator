/* Bokogo Vocab Sets · 📖 Stories tab (used by R7 Picture Story, game + worksheet).
   Each story = one picture + 1–3 sentences + questions, plus translations that AI can fill: tr = {<lang>: {title,text,qs:[...],by:'ai'|'me',ok}}.
   Pictures go to the central library on english.learn8.co when the set is saved (store.js → api.php ?a=put / ?a=pic).
   The stories are also written as R7 text into set.sto, so worksheets and older pages keep working.
   Needs window.VSE (from index.html): SET, save, sheet, closeSheet, toast, esc, hiWords, LG, LANGS, hasKey, gemJSON, freeTr, speak, settingsSheet, renderTabs, renderSide, renderPane. */
(()=>{
const E=()=>window.VSE;
const SCN=window.SCENES?Object.fromEntries(Object.entries(window.SCENES).map(([k,v])=>[k,[v.e,v.l]])):{park:['🌳','Park'],kitchen:['🍳','Kitchen'],rain:['🌧️','Rain']};
const QRE=/^Q\s*\d*\s*[:.]/i;
let STI=-1,LIBT='all',LIBQ='',BULK=[];

/* ---------- R7 text ⇄ stories ---------- */
function parseSto(txt){return String(txt||'').split(/\n\s*\n/).filter(b=>b.trim()).map(b=>{const ls=b.split('\n').map(l=>l.trim()).filter(Boolean);let scn='',text=[],qs=[];
 ls.forEach(l=>{const m=l.match(/^\[pic:(\w+)\]$/i);if(m){scn=m[1].toLowerCase();return}
  if(QRE.test(l)){const [q,a,full]=l.replace(/^Q\s*\d*\s*[:.]\s*/i,'').split('|').map(x=>(x||'').trim());qs.push({q,ok:(a||'').split('/').map(x=>x.trim()).filter(Boolean),full:full||''});return}
  text.push(l)});
 return {id:VS.uid(),title:'',pic:SCN[scn]?{scn}:{},text:text.join(' '),qs,tr:{}}})}
function toSto(list){return (list||[]).map(s=>{const p=s.pic||{};const L=[`[pic:${p.img?'photo':(SCN[p.scn]?p.scn:'park')}]`];if((s.text||'').trim())L.push(s.text.trim().replace(/\s*\n\s*/g,' '));
 (s.qs||[]).filter(q=>(q.q||'').trim()).forEach(q=>L.push(`Q: ${q.q.trim()} | ${(q.ok||[]).join(' / ')} | ${(q.full||'').trim()}`));return L.join('\n')}).join('\n\n')}
/* called when a set is opened: make cards from old text, or pick up text edited on the worksheet page */
function prep(set){if(!Array.isArray(set.stories)){set.stories=parseSto(set.sto);set._stoGen=toSto(set.stories);set.sto=set._stoGen;return}
 if(set.sto!==set._stoGen&&String(set.sto||'').trim()&&set.sto!==toSto(set.stories)){const old=set.stories,nw=parseSto(set.sto);nw.forEach((s,i)=>{const o=old[i];if(o){s.id=o.id;s.title=o.title;if(o.pic&&o.pic.img)s.pic=o.pic;s.tr=o.tr||{}}});set.stories=nw}
 set._stoGen=toSto(set.stories);set.sto=set._stoGen}
function sync(){const S=E().SET;S._stoGen=toSto(S.stories);S.sto=S._stoGen;E().save()}
const cur=()=>E().SET.stories[STI];

/* ---------- pictures ---------- */
function load(src){return new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>no(new Error('Could not read that picture'));im.src=src})}
/* crop the middle to the R7 frame (400 × 260 shape), at most 1200 px wide, JPG */
async function cropPic(file){const src=typeof file==='string'?file:await E().fileToData(file);const im=await load(src);const R=400/260;let w=im.width,h=im.height,x=0,y=0;
 if(w/h>R){const nw=h*R;x=(w-nw)/2;w=nw}else{const nh=w/R;y=(h-nh)/2;h=nh}
 const W=Math.min(1200,Math.round(w)),H=Math.round(W/R),c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);g.drawImage(im,x,y,w,h,0,0,W,H);return c.toDataURL('image/jpeg',.85)}
const esc=t=>E().esc(t);
function picHTML(p,cls){p=p||{};if(p.img)return`<img class="${cls||''}" src="${esc(p.img)}" alt="">`;const s=SCN[p.scn],sv=window.SCENES&&window.SCENES[p.scn];if(sv)return`<span class="${cls||''} scn sv" aria-hidden="true">${sv.svg}</span>`;return`<span class="${cls||''} scn" aria-hidden="true">${s?s[0]:'🖼️'}</span>`}

/* ---------- list ---------- */
function used(s){const ws=E().SET.words.map(w=>w.w.toLowerCase()).filter(Boolean);const t=(s.text+' '+(s.qs||[]).map(q=>q.q).join(' ')).toLowerCase();return ws.filter(w=>new RegExp('\\b'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(s|es)?\\b').test(t))}
function trBadge(s){const S=E().SET,ls=Object.keys(s.tr||{}).filter(l=>l!==S.lang&&(s.tr[l].text||'').trim());if(!ls.length)return'';return ls.map(l=>`<span class="badge ${s.tr[l].ok?'ok':''}" title="${s.tr[l].ok?'checked':'AI, not checked'}">🌐 ${esc(E().LG(l)[2])}${s.tr[l].ok?' ✓':' ✨'}</span>`).join('')}
function tools(){return`<button class="chip pri2" data-a="st-new">＋ New story</button><label class="chip">📷 Add pictures<input type="file" accept="image/*" multiple hidden data-stbulk></label><button class="chip ai" data-a="st-ai">✨ Make stories from words</button><button class="chip" data-a="st-trall">🌐 Translate all</button>`}
function render(P){const S=E().SET;prep(S);const L=S.stories;
 P.innerHTML=`<p class="hint" style="margin:2px 2px 10px">1 picture + 1–3 sentences + questions. Used by <b>📖 R7 Picture Story</b> (game and worksheet). Words of this set light up green.</p>
 <div class="stl">${L.map((s,i)=>{const u=used(s),need=!(s.text||'').trim();return`<button class="stc ${need?'need':''}" data-a="st-open" data-i="${i}">${picHTML(s.pic,'th')}<span class="bd"><b>${i+1} · ${esc(s.title||(s.text||'').split(/[.!?]/)[0]||'Story')}</b>
  ${need?'<span class="nd">✏️ Needs sentences</span>':`<span class="tx">${E().hiWords(s.text)}</span>`}
  <span class="bg"><span class="badge ${s.qs.length?'':'warn'}">❓ ${s.qs.length}</span>${u.length?`<span class="badge ok">${esc(u.slice(0,3).join(' · '))}${u.length>3?' +'+(u.length-3):''}</span>`:''}${trBadge(s)}</span></span></button>`}).join('')}
  <button class="stc add" data-a="st-new"><span class="e">＋</span><b>New story</b></button>
  <label class="stc add drop"><span class="e">📷</span><b>Add pictures</b><span class="hint">Each picture becomes a story. You can also drop pictures here.</span><input type="file" accept="image/*" multiple hidden data-stbulk></label></div>`}

/* ---------- editor ---------- */
function langsOf(s){const S=E().SET;const set=new Set([S.mt,...Object.keys(s.tr||{})]);set.delete(S.lang);return [...set].filter(Boolean)}
function edHTML(){const S=E().SET,s=cur(),LG=E().LG,n=S.stories.length;if(!s)return'';const u=new Set(used(s));
 return`<div class="se">
 <div class="se-l"><div class="se-pic">${picHTML(s.pic,'big')}</div>
  <div class="se-pb"><label class="ib">📁 <span class="lb">Upload</span><input type="file" accept="image/*" hidden data-stup></label><button class="ib" data-a="st-lib">🖼️ <span class="lb">Library</span></button><button class="ib" data-a="st-paste">📋 <span class="lb">Paste</span></button></div>
  <div class="se-sc"><span class="hint">or a drawn scene:</span>${Object.entries(SCN).map(([k,v])=>`<button class="chip ${!s.pic.img&&s.pic.scn===k?'on':''}" data-a="st-scn" data-v="${k}">${v[0]} ${v[1]}</button>`).join('')}</div>
  <p class="hint" style="margin:0">Pictures are cut to the R7 frame (400 × 260) and saved to the shared picture library when you save.</p></div>
 <div class="se-r">
  <div class="fld"><label>🏷️ Title (only for you)</label><input data-sk="title" value="${esc(s.title)}" placeholder="e.g. At the park"></div>
  <div class="fld"><label>📖 Story · 1–3 sentences in ${esc(LG(S.lang)[2])}</label><textarea data-sk="text" lang="${S.lang}" rows="3" placeholder="Tom is at the park with his dog.">${esc(s.text)}</textarea>
   <div class="se-pv" id="sePv">${E().hiWords(s.text)||'<span class="hint">Words of this set will light up here.</span>'}</div>
   <div class="se-ws"><span class="hint">Tap a word to add it:</span>${S.words.slice(0,40).map(w=>`<button class="chip ${u.has(w.w.toLowerCase())?'on':''}" data-a="st-ins" data-w="${esc(w.w)}">${w.e&&!w.img?`<span class="emo">${esc(w.e)}</span>`:''}${esc(w.w)}</button>`).join('')}</div></div>
 </div></div>
 <div class="se-qh"><b>❓ Questions · ${s.qs.length}</b><button class="ib" data-a="st-aiq">✨ <span class="lb">Suggest</span></button><button class="ib" data-a="st-q+">＋ <span class="lb">Question</span></button></div>
 <div class="se-qs">${s.qs.map((q,i)=>`<div class="se-q" data-qi="${i}"><div class="se-q1"><b>${i+1}.</b><input data-sq="q" value="${esc(q.q)}" placeholder="Where is Tom?" aria-label="Question ${i+1}"><button class="mini" data-a="st-q-" aria-label="Delete question ${i+1}">🗑</button></div>
  <div class="two"><label class="fx2"><span>✅</span><input data-sq="ok" value="${esc((q.ok||[]).join(' / '))}" placeholder="at the park / park" aria-label="Accepted answers"></label><label class="fx2"><span>⭐</span><input data-sq="full" value="${esc(q.full)}" placeholder="Tom is at the park." aria-label="Full sentence answer"></label></div></div>`).join('')||'<p class="hint" style="margin:0">No questions yet. Add 1–5: who / what / where / yes-no.</p>'}</div>
 <div class="se-qh"><b>🌐 Translations</b><select data-a2="st-addl" aria-label="Add a language"><option value="">＋ Language</option>${E().LANGS.filter(l=>l[0]!==S.lang&&!langsOf(s).includes(l[0])).map(l=>`<option value="${l[0]}">${l[2]}</option>`).join('')}</select></div>
 <p class="hint" style="margin:-6px 0 0">Learners see their own language only when they tap 🌐. ✨ fills a language; a teacher's text is never overwritten.</p>
 ${langsOf(s).map(l=>{const t=(s.tr||{})[l]||{},has=(t.text||'').trim();return`<div class="se-tr ${t.ok?'ok':''}" data-tl="${l}"><div class="se-q1"><b>${esc(LG(l)[2])}</b>${has?`<span class="badge ${t.ok?'ok':'warn'}">${t.ok?'✓ checked':'✨ AI · not checked'}</span>`:''}<span style="flex:1"></span><button class="ib" data-a="st-tr">✨ <span class="lb">${has?'Again':'Translate'}</span></button>${has&&!t.ok?'<button class="ib" data-a="st-trok">✓ <span class="lb">Looks right</span></button>':''}</div>
  <input data-st="title" lang="${l}" value="${esc(t.title||'')}" placeholder="Title" aria-label="Title in ${esc(LG(l)[2])}">
  <textarea data-st="text" lang="${l}" rows="2" placeholder="Story in ${esc(LG(l)[2])}" aria-label="Story in ${esc(LG(l)[2])}">${esc(t.text||'')}</textarea>
  ${s.qs.map((q,i)=>`<input data-st="q" data-qi="${i}" lang="${l}" value="${esc((t.qs||[])[i]||'')}" placeholder="${i+1}. ${esc(q.q)}" aria-label="Question ${i+1} in ${esc(LG(l)[2])}">`).join('')}</div>`}).join('')}
 <div class="rowb se-ft"><button class="ib" data-a="st-up" ${STI?'':'disabled'} aria-label="Move up">⬆️</button><button class="ib" data-a="st-dn" ${STI<n-1?'':'disabled'} aria-label="Move down">⬇️</button><a class="ib" href="worksheets.html?set=${S.id}&t=R7">▶ <span class="lb">R7</span></a><button class="ib" data-a="st-dup">⧉ <span class="lb">Copy</span></button><button class="ib" data-a="st-del" style="color:var(--red)">🗑 <span class="lb">Delete</span></button></div>`}
function open(i){STI=i;const s=cur();if(!s)return;E().sheet(`📖 Story ${i+1} of ${E().SET.stories.length}`,edHTML());document.getElementById('sheet').classList.add('wide')}
function reopen(){const b=document.getElementById('shB'),y=b?b.scrollTop:0;open(STI);if(b)b.scrollTop=y}
function refresh(){const v=E();v.renderTabs();v.renderSide();if(v.TAB()==='t')v.renderPane()}
function setPic(p){const s=cur();if(!s)return;s.pic=p;sync();refresh();reopen()}
function blank(){return {id:VS.uid(),title:'',pic:{scn:'park'},text:'',qs:[],tr:{}}}

/* ---------- AI ---------- */
const wl=()=>E().SET.words.map(w=>w.w).join(', ');
async function aiStories(btn){const v=E();if(!v.hasKey()){v.settingsSheet();v.toast('Add a Gemini key first');return}if(!v.SET.words.length){v.toast('Add some words first');return}
 const old=btn.innerHTML;btn.disabled=true;btn.innerHTML='⏳ Making…';const ln=v.LG(v.SET.lang)[2];
 try{const out=await v.gemJSON(`${v.prompt?v.prompt('sto'):`Write 3 very short picture stories for young ${ln} learners using some of these words: ${wl()}.\nEach story: a short title, the closest scene (one of: ${Object.keys(SCN).map(k=>`"${k}"`).join(", ")}), 2–3 simple sentences, and 3 questions (who/what/where/yes-no) with short accepted answers and a full-sentence model answer.`}\nThe scene must be one of: ${Object.keys(SCN).join(', ')}.\nReturn JSON: [{"title":"","scene":"park","text":"","qs":[{"q":"","ok":["",""],"full":""}]}]`);
  const L=(Array.isArray(out)?out:out.stories||[]).map(o=>({id:VS.uid(),title:String(o.title||''),pic:{scn:SCN[o.scene]?o.scene:'park'},text:String(o.text||''),qs:(o.qs||[]).map(q=>({q:String(q.q||''),ok:(q.ok||[]).map(String),full:String(q.full||'')})),tr:{}}));
  v.SET.stories.push(...L);sync();refresh();v.toast(`✨ ${L.length} stories added`)}catch(e){v.toast('⚠️ '+esc(e.message),5000)}finally{btn.disabled=false;btn.innerHTML=old}}
async function aiQs(btn){const v=E(),s=cur();if(!v.hasKey()){v.settingsSheet();v.toast('Add a Gemini key first');return}if(!(s.text||'').trim()){v.toast('Write the story first');return}
 btn.disabled=true;try{const out=await v.gemJSON(`Story for young ${v.LG(v.SET.lang)[2]} learners: "${s.text}".\nWrite 3 easy questions about it (who/what/where/yes-no) that the story answers. For each give short accepted answers and a full-sentence model answer.\nReturn JSON: [{"q":"","ok":["",""],"full":""}]`);
  const qs=(Array.isArray(out)?out:out.qs||[]).map(q=>({q:String(q.q||''),ok:(q.ok||[]).map(String),full:String(q.full||'')}));s.qs.push(...qs);sync();refresh();reopen();v.toast(`✨ ${qs.length} questions added`)}catch(e){v.toast('⚠️ '+esc(e.message),5000)}btn.disabled=false}
/* fill one language of one story; never overwrite a teacher's text unless force */
async function trOne(s,l,force){const v=E(),src=v.SET.lang;s.tr=s.tr||{};const t=s.tr[l]||{};if(!force&&t.by==='me'&&(t.text||'').trim())return false;if(!(s.text||'').trim())return false;
 let r;if(v.hasKey()){const out=await v.gemJSON(`Translate this short ${v.LG(src)[2]} children's story and its questions into ${v.LG(l)[2]}. Simple, natural words for children.\nTitle: ${s.title||''}\nStory: ${s.text}\nQuestions:\n${s.qs.map((q,i)=>(i+1)+'. '+q.q).join('\n')}\nReturn JSON: {"title":"","text":"","qs":["",""]}`);r={title:String(out.title||''),text:String(out.text||''),qs:(out.qs||[]).map(String)}}
 else{const tl=src==='fil'?'tl':src,to=l==='fil'?'tl':l;r={title:s.title?await v.freeTr(s.title,tl,to):'',text:await v.freeTr(s.text,tl,to),qs:[]};for(const q of s.qs)r.qs.push(q.q?await v.freeTr(q.q,tl,to):'');if(!r.text)throw new Error('The free translator is busy. Try again, or add a Gemini key.')}
 s.tr[l]={...r,by:'ai',ok:false};return true}
async function trAll(btn){const v=E(),S=v.SET;const L=S.stories.filter(s=>(s.text||'').trim());if(!L.length){v.toast('Write a story first');return}
 const old=btn.innerHTML;btn.disabled=true;let n=0;try{for(const s of L){for(const l of langsOf(s)){btn.innerHTML=`⏳ ${n+1}…`;if(await trOne(s,l,false))n++}}sync();refresh();v.toast(n?`🌐 ${n} translations added (✨ not checked yet)`:'🌐 Everything is translated already')}catch(e){sync();refresh();v.toast('⚠️ '+esc(e.message),5000)}finally{btn.disabled=false;btn.innerHTML=old}}

/* ---------- library ---------- */
async function lib(){const v=E();if(!VS.cloud.on()){v.toast('☁️ Sign in to use the shared picture library');return}
 v.sheet('🖼️ Picture library',`<div class="fld"><input id="libq" type="search" value="${esc(LIBQ)}" placeholder="Search in any language: market, ตลาด…" aria-label="Search pictures"></div>
 <div class="cl-tabs"><button class="ib ${LIBT==='all'?'on':''}" data-a="st-libt" data-v="all">🌐 All</button><button class="ib ${LIBT==='mine'?'on':''}" data-a="st-libt" data-v="mine">👤 Mine</button><button class="ib ${LIBT==='scene'?'on':''}" data-a="st-libt" data-v="scene">📖 Scenes</button></div>
 <div class="libg" id="libg"><p class="hint">⏳ Loading…</p></div><div class="rowb"><button class="ib" data-a="st-back">‹ Back to the story</button></div>`);
 libLoad()}
let libT=null;
async function libLoad(){const g=document.getElementById('libg');if(!g)return;try{const j=await VS.cloud.pics(LIBQ,LIBT==='mine',LIBT==='scene'?'scene':'');const S=E().SET;
 g.innerHTML=(LIBT==='scene'&&window.SCENES?Object.entries(window.SCENES).filter(([k,v])=>!LIBQ||(k+' '+v.l+' '+v.alt).toLowerCase().includes(LIBQ.toLowerCase())).map(([k,v])=>`<button class="libp" data-a="st-scn" data-v="${k}"><span class="scn sv" style="aspect-ratio:400/260">${v.svg}</span><span><b>${v.e} ${esc(v.l)}</b><small>✏️ drawn scene</small></span></button>`).join(''):'')+(j.pics||[]).map(p=>{const nm=p.name||{};const a=nm[S.lang]||nm.en||Object.values(nm)[0]||'',b=nm[S.mt]&&nm[S.mt]!==a?nm[S.mt]:'';return`<button class="libp" data-a="st-libpick" data-url="${esc(p.url)}"><img src="${esc(p.url)}" alt="${esc(a)}" loading="lazy"><span><b>${esc(a||'—')}</b>${b?' · '+esc(b):''}<small>${p.mine?'👤 you':'👩‍🏫 '+esc(p.by||'')}</small></span></button>`}).join('')||'<p class="hint">No pictures found.</p>'}
 catch(e){g.innerHTML=`<p class="hint">⚠️ ${esc(e.message)}</p>`}}

/* ---------- add many pictures ---------- */
async function bulk(files){const v=E();files=[...files].filter(f=>/^image\//.test(f.type)).slice(0,10);if(!files.length)return;v.toast('⏳ Preparing pictures…');
 BULK=[];for(const f of files){try{BULK.push({img:await cropPic(f),cap:''})}catch(e){}}
 v.sheet(`📷 ${BULK.length} new picture${BULK.length>1?'s':''}`,`<p class="hint" style="margin:0">Write one short line about each picture (any language is OK). You can write the full story later.</p>
 ${BULK.map((b,i)=>`<div class="blk"><img src="${b.img}" alt=""><input data-bulk="${i}" placeholder="What happens here?" aria-label="Line about picture ${i+1}"></div>`).join('')}
 <label class="blk2"><input type="checkbox" id="bulkai" ${v.hasKey()?'checked':'disabled'}> <span>✨ Write 2 sentences + 3 questions for each, using this set's words${v.hasKey()?'':' (needs a Gemini key in ⚙️ Settings)'}</span></label>
 <div class="rowb"><button class="ib pri" data-a="st-bulkgo">＋ Make ${BULK.length} stor${BULK.length>1?'ies':'y'}</button></div>`)}
async function bulkGo(btn){const v=E(),S=v.SET,ai=document.getElementById('bulkai')?.checked;btn.disabled=true;btn.textContent='⏳ Making…';
 document.querySelectorAll('[data-bulk]').forEach(x=>{BULK[+x.dataset.bulk].cap=x.value.trim()});
 for(const b of BULK){const s={id:VS.uid(),title:b.cap,pic:{img:b.img},text:'',qs:[],tr:{}};
  if(ai&&b.cap){try{const o=await v.gemJSON(`A picture shows: "${b.cap}". Write a very short story for young ${v.LG(S.lang)[2]} learners about this picture: 2 simple sentences, using some of these words if they fit: ${wl()}. Then 3 easy questions (who/what/where/yes-no) with short accepted answers and a full-sentence model answer. Also a short ${v.LG(S.lang)[2]} title.\nReturn JSON: {"title":"","text":"","qs":[{"q":"","ok":["",""],"full":""}]}`);
   s.title=String(o.title||b.cap);s.text=String(o.text||'');s.qs=(o.qs||[]).map(q=>({q:String(q.q||''),ok:(q.ok||[]).map(String),full:String(q.full||'')}))}catch(e){v.toast('⚠️ '+esc(e.message),4000)}}
  S.stories.push(s)}
 BULK=[];sync();v.closeSheet();refresh();v.toast('📖 Stories added. Tap one to edit it.')}

/* ---------- events (called from index.html) ---------- */
async function click(a,b){const v=E(),S=v.SET;if(!S)return;
 switch(a){
  case 'st-new':S.stories.push(blank());sync();refresh();open(S.stories.length-1);break;
  case 'st-open':open(+b.dataset.i);break;
  case 'st-ai':aiStories(b);break;
  case 'st-trall':trAll(b);break;
  case 'st-scn':setPic({scn:b.dataset.v});break;
  case 'st-paste':try{const it=await navigator.clipboard.read();for(const c of it){const ty=c.types.find(x=>x.startsWith('image/'));if(ty){setPic({img:await cropPic(await c.getType(ty))});return}}v.toast('No picture in the clipboard')}catch(e){v.toast('Copy a picture first, then press 📋 (or use Upload)')}break;
  case 'st-lib':lib();break;
  case 'st-libt':LIBT=b.dataset.v;lib();break;
  case 'st-libpick':setPic({img:b.dataset.url});break;
  case 'st-back':reopen();break;
  case 'st-ins':{const ta=document.querySelector('#shB [data-sk="text"]');if(!ta)break;const w=b.dataset.w,p=ta.selectionStart??ta.value.length,pre=ta.value.slice(0,p),sp=pre&&!/\s$/.test(pre)?' ':'';ta.value=pre+sp+w+ta.value.slice(p);ta.focus();const np=(pre+sp+w).length;ta.setSelectionRange(np,np);ta.dispatchEvent(new Event('input',{bubbles:true}));break}
  case 'st-q+':cur().qs.push({q:'',ok:[],full:''});sync();reopen();setTimeout(()=>{const x=[...document.querySelectorAll('#shB [data-sq="q"]')].pop();if(x)x.focus()},60);break;
  case 'st-q-':{const i=+b.closest('[data-qi]').dataset.qi,s=cur();s.qs.splice(i,1);Object.values(s.tr||{}).forEach(t=>t.qs&&t.qs.splice(i,1));sync();refresh();reopen();break}
  case 'st-aiq':aiQs(b);break;
  case 'st-tr':{const l=b.closest('[data-tl]').dataset.tl,s=cur();const old=b.innerHTML;b.disabled=true;b.innerHTML='⏳';try{await trOne(s,l,true);sync();refresh();reopen()}catch(e){v.toast('⚠️ '+esc(e.message),5000);b.disabled=false;b.innerHTML=old}break}
  case 'st-trok':{const l=b.closest('[data-tl]').dataset.tl,t=cur().tr[l];if(t){t.ok=true}sync();refresh();reopen();break}
  case 'st-up':case 'st-dn':{const j=STI+(a==='st-up'?-1:1);if(j<0||j>=S.stories.length)break;const L=S.stories;[L[STI],L[j]]=[L[j],L[STI]];STI=j;sync();refresh();reopen();break}
  case 'st-dup':{const c=JSON.parse(JSON.stringify(cur()));c.id=VS.uid();c.title=(c.title||'Story')+' (copy)';S.stories.splice(STI+1,0,c);sync();refresh();open(STI+1);v.toast('⧉ Copied');break}
  case 'st-del':{const s=cur();if(!confirm(`Delete story ${STI+1}${s.title?' "'+s.title+'"':''}?`))break;S.stories.splice(STI,1);sync();v.closeSheet();refresh();v.toast('🗑 Story deleted');break}
  case 'st-bulkgo':bulkGo(b);break;
 }}
function input(t){const S=E().SET;if(!S)return false;
 if(t.id==='libq'){LIBQ=t.value;clearTimeout(libT);libT=setTimeout(libLoad,300);return true}
 const s=cur();if(!s)return false;
 if(t.dataset.sk){s[t.dataset.sk]=t.value;if(t.dataset.sk==='text'){const pv=document.getElementById('sePv');if(pv)pv.innerHTML=E().hiWords(t.value);const u=new Set(used(s));document.querySelectorAll('#shB [data-a="st-ins"]').forEach(c=>c.classList.toggle('on',u.has(c.dataset.w.toLowerCase())))}sync();clearTimeout(window._stT);window._stT=setTimeout(refresh,400);return true}
 if(t.dataset.sq){const q=s.qs[+t.closest('[data-qi]').dataset.qi];if(!q)return true;q[t.dataset.sq]=t.dataset.sq==='ok'?t.value.split('/').map(x=>x.trim()).filter(Boolean):t.value;sync();clearTimeout(window._stT);window._stT=setTimeout(refresh,400);return true}
 if(t.dataset.st){const l=t.closest('[data-tl]').dataset.tl;s.tr=s.tr||{};const tr=s.tr[l]=s.tr[l]||{title:'',text:'',qs:[]};if(t.dataset.st==='q'){tr.qs=tr.qs||[];tr.qs[+t.dataset.qi]=t.value}else tr[t.dataset.st]=t.value;tr.by='me';tr.ok=true;sync();clearTimeout(window._stT);window._stT=setTimeout(refresh,400);return true}
 return false}
async function change(t){const S=E().SET;if(!S)return false;
 if(t.matches('[data-stbulk]')){const f=t.files;await bulk(f);t.value='';return true}
 if(t.matches('[data-stup]')){const f=t.files[0];t.value='';if(f){try{setPic({img:await cropPic(f)})}catch(e){E().toast('⚠️ '+esc(e.message))}}return true}
 if(t.dataset.a2==='st-addl'&&t.value){const s=cur();s.tr=s.tr||{};s.tr[t.value]=s.tr[t.value]||{title:'',text:'',qs:[],by:'ai',ok:false};sync();reopen();return true}
 return false}
async function drop(files,target){if(E().TAB()!=='t')return false;const f=[...files].filter(x=>/^image\//.test(x.type));if(!f.length)return false;
 const pic=target&&target.closest&&target.closest('.se-pic');if(pic&&STI>=0){setPic({img:await cropPic(f[0])});return true}await bulk(f);return true}
async function paste(e){const sh=document.getElementById('sheet');if(STI<0||!sh.classList.contains('on')||!document.querySelector('#shB .se'))return false;const f=[...(e.clipboardData?.files||[])].find(f=>/^image\//.test(f.type));if(!f)return false;e.preventDefault();setPic({img:await cropPic(f)});return true}
/* after the server turns a new picture into a library file, use its URL here too (so it is not uploaded again) */
addEventListener('vs-cloud',e=>{const d=e.detail||{},v=E();if(!d.pushed||!v||!v.SET||v.SET.id!==d.pushed.id)return;const m=new Map((d.pushed.stories||[]).map(s=>[s.id,s.pic&&s.pic.img]));
 for(const s of v.SET.stories||[]){const u=m.get(s.id);if(u&&/^data:/.test((s.pic||{}).img||'')&&/^https?:/.test(u))s.pic.img=u}});
document.addEventListener('vs-sheet-close',()=>{STI=-1;document.getElementById('sheet')?.classList.remove('wide')});

window.STO={parseSto,toSto,prep,tools,render,click,input,change,drop,paste,open,count:s=>Array.isArray(s.stories)?s.stories.length:parseSto(s.sto).length};
})();
