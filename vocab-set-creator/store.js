/* Bokogo Vocab Sets · shared storage (IndexedDB on this device). Used by index.html (creator) and worksheets.html (print).
   One set = {id,name,icon,lang,mt,words:[{id,w,ipa,m,e,img}],sen,dlg,sto,stories,ipa:{},created,updated}
   stories = [{id,title,pic:{img|scn,orig},text,qs:[{q,ok:[],full}],tr:{<lang>:{title,text,qs:[],by:'ai'|'me',ok}}}] · sto = the same stories as R7 text (kept for worksheets)
   sen: "English | meaning" per line ([word] = blank for R6) · dlg: "Question | Answer" per line · sto: R7 story blocks · ipa: extra word→IPA for sentence words */
/* Page error reporter: shows a small red bar and sends the error to english.learn8.co (logs/client.log) so it can be fixed. */
(function(){const H=location.hostname,API=/(^|\.)learn8\.co$/.test(H)?'/api/':'https://english.learn8.co/api/';let n=0;
 function rep(m,src,line,col,stack){if(n++>5)return;const msg=String(m||'Error').slice(0,300);
  try{const b=document.createElement('div');b.setAttribute('role','alert');b.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;background:#b42318;color:#fff;font:600 13px/1.4 system-ui,sans-serif;padding:10px 12px;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.25)';
   b.textContent='⚠️ Something broke on this page: '+msg+(line?' ('+String(src||'').split('/').pop()+':'+line+')':'')+'. It was reported automatically.';b.onclick=()=>b.remove();(document.body||document.documentElement).appendChild(b)}catch(e){}
  try{fetch(API+'?a=log',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({p:location.pathname+location.search,m:msg,s:String(src||''),l:line||0,c:col||0,st:String(stack||'').slice(0,1500),ua:navigator.userAgent})}).catch(()=>{})}catch(e){}}
 window.__report=rep;
 addEventListener('error',e=>{if(e&&e.message&&!/ResizeObserver loop/.test(e.message))rep(e.message,e.filename,e.lineno,e.colno,e.error&&e.error.stack)});
 addEventListener('unhandledrejection',e=>{const r=e&&e.reason;rep('Promise: '+(r&&r.message||r),'',0,0,r&&r.stack)});
})();
(function(){
const DB='bokogo-vocab',ST='sets',CUR='bokogo.vset.cur';
let dbp=null;
/* Safari sometimes never answers the first indexedDB.open: ask again every 2.5 s (3 tries), then give up so the page still starts */
function db(){if(dbp)return dbp;dbp=new Promise((ok,no)=>{let done=0,tries=0,err=null;
 const go=()=>{tries++;let r;try{r=indexedDB.open(DB,1)}catch(e){err=e;return}r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(ST))d.createObjectStore(ST,{keyPath:'id'})};
  r.onsuccess=()=>{if(done){try{r.result.close()}catch(e){}return}done=1;ok(r.result)};r.onerror=()=>{err=r.error}};
 go();const t=setInterval(()=>{if(done){clearInterval(t);return}if(tries>=3){clearInterval(t);done=1;window.__report&&window.__report('IndexedDB did not open: '+(err&&err.message||'no answer'));no(err||new Error('IndexedDB did not open'));return}
  window.__report&&tries===1&&window.__report('IndexedDB slow to open, trying again');go()},2500)});
 dbp.catch(()=>{dbp=null});return dbp}
function tx(mode,fn){return db().then(d=>new Promise((ok,no)=>{const t=d.transaction(ST,mode),s=t.objectStore(ST);let out;const r=fn(s);if(r)r.onsuccess=()=>{out=r.result};t.oncomplete=()=>ok(out);t.onerror=()=>no(t.error);t.onabort=()=>no(t.error)}))}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const allL=()=>tx('readonly',s=>s.getAll()).then(a=>(a||[]).sort((x,y)=>(y.updated||0)-(x.updated||0)));
const getL=id=>tx('readonly',s=>s.get(id));
const putL=set=>tx('readwrite',s=>s.put(set));
const delL=id=>tx('readwrite',s=>s.delete(id));

/* ☁️ Cloud sync with english.learn8.co (optional; works offline without it).
   Last change wins, by `updated`. Pictures are turned into files on the server, so a set holds picture URLs after sync. */
const CK='bokogo.cloud',H=location.hostname;
const API=window.BOKOGO_API||(/(^|\.)learn8\.co$/.test(H)||H==='localhost'||H==='127.0.0.1'?'/api/':'https://english.learn8.co/api/');
const ld=()=>{try{return JSON.parse(localStorage.getItem(CK)||'{}')}catch(e){return{}}};
const C={st:ld(),state:'off',busy:null,t:null,again:false,firstP:null,
 sv(){try{localStorage.setItem(CK,JSON.stringify(this.st))}catch(e){}},
 on(){return!!this.st.tok},
 emit(d){this.state=d.state||this.state;try{window.dispatchEvent(new CustomEvent('vs-cloud',{detail:Object.assign({state:this.state,name:this.st.name||''},d)}))}catch(e){}},
 async req(a,body,q){const o={method:body?'POST':'GET',headers:{}};if(this.st.tok)o.headers.Authorization='Bearer '+this.st.tok;
  if(body){o.headers['Content-Type']='application/json';o.body=JSON.stringify(body)}
  const r=await fetch(API+'?a='+a+(q||''),o);let j={};try{j=await r.json()}catch(e){}
  if(r.status===401&&this.st.tok&&a!=='login'){this.st={};this.sv();this.emit({state:'off',signedOut:true})}
  if(!r.ok)throw new Error(j.error||('Server error '+r.status));return j},
 async signin(name,pass){const j=await this.req('login',{name,pass});this.st={tok:j.tok,name:j.name,mother:j.mother||'th',learning:j.learning||'en',since:0,done:{},dels:[]};this.sv();this.emit({state:'on'});await this.sync();return j},
 async register(name,pass,invite,mother,learning){const j=await this.req('register',{name,pass,invite,mother,learning});this.st={tok:j.tok,name:j.name,mother:j.mother||mother||'th',learning:j.learning||learning||'en',since:0,done:{},dels:[]};this.sv();this.emit({state:'on'});await this.sync();return j},
 async prefs(p){const j=await this.req('prefs',p);this.st.mother=j.mother;this.st.learning=j.learning;this.sv();this.emit({prefs:j});return j},
 pics(q,mine,kind){return this.req('pics',null,'&q='+encodeURIComponent(q||'')+(mine?'&mine=1':'')+(kind?'&kind='+kind:''))},
 pic(img,name,kind){return this.req('pic',{img,name:name||{},kind:kind||'scene'})},
 all(q){return this.req('all',null,'&q='+encodeURIComponent(q||''))},
 shared(u,id){return this.req('get',null,'&u='+(+u)+'&id='+encodeURIComponent(id))},
 async signout(){try{await this.req('logout',{})}catch(e){}this.st={};this.sv();this.emit({state:'off'})},
 first(){if(!this.on())return Promise.resolve();if(!this.firstP)this.firstP=Promise.race([this.sync().catch(()=>{}),new Promise(r=>setTimeout(r,4000))]);return this.firstP},
 soon(){if(!this.on())return;clearTimeout(this.t);this.t=setTimeout(()=>this.sync().catch(()=>{}),1500)},
 gone(id){if(!this.on())return;const st=this.st;st.dels=(st.dels||[]).filter(d=>d.id!==id);st.dels.push({id,updated:Date.now()});if(st.done)delete st.done[id];this.sv();this.soon()},
 sync(){if(!this.on())return Promise.resolve();if(this.busy){this.again=true;return this.busy}
  this.busy=this._sync().then(r=>{this.emit({state:'on',synced:Date.now()});return r},e=>{this.emit({state:navigator.onLine===false?'offline':'err',error:e.message});throw e})
   .finally(()=>{this.busy=null;if(this.again){this.again=false;this.soon()}});return this.busy},
 async _sync(){const st=this.st;st.done=st.done||{};st.dels=st.dels||[];this.emit({state:'busy'});const changed=[];
  // 1) send deletes made while offline
  for(const d of st.dels.slice()){await this.req('del',d);st.dels=st.dels.filter(x=>x!==d);this.sv()}
  // 2) pull what other devices changed
  const j=await this.req('list',null,'&since='+(st.since||0));
  for(const s of j.sets||[]){if(!s||!s.id)continue;const l=await getL(s.id);if(!l||(s.updated||0)>(l.updated||0)){await putL(s);changed.push(s.id)}st.done[s.id]=s.updated||0}
  for(const g of j.gone||[]){const l=await getL(g.id);if(l&&(l.updated||0)<=g.updated){await delL(g.id);changed.push(g.id)}delete st.done[g.id]}
  st.since=j.now||st.since;this.sv();
  // 3) push what changed here
  for(const l of await allL()){if((st.done[l.id]||0)>=(l.updated||0))continue;
   const r=await this.req('put',{set:l});const cur=await getL(l.id);
   if(r.newer){if(r.deleted||!r.set){if(cur&&cur.updated===l.updated)await delL(l.id)}else if(cur&&cur.updated===l.updated)await putL(r.set);changed.push(l.id);st.done[l.id]=r.set?r.set.updated:0}
   else{if(cur&&cur.updated===l.updated)await putL(r.set);st.done[l.id]=l.updated;this.emit({pushed:r.set})}
   this.sv()}
  if(changed.length)this.emit({changed})}
};
{addEventListener('focus',()=>C.sync().catch(()=>{}));addEventListener('online',()=>C.sync().catch(()=>{}));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)C.sync().catch(()=>{})});setInterval(()=>{if(!document.hidden)C.sync().catch(()=>{})},60000)}

/* 💬 Talk wrong answers (Nana 24 Nov): "Question | Answer | wrong | wrong". Wrongs typed (or made by AI) come first;
   then near-misses about the SAME answer so the job/topic name gives nothing away: a grammar slip, then a reply of the wrong type. Other lines' answers come last. */
const NOT_V=new Set(['is','was','has','does','this','his','its','bus','yes','us','gas','glass','class','grass','dress','address','boss','kiss','miss','always','sometimes','plus','news','christmas','lens','tennis','bonus','virus','campus','status','famous','various','previous','less','unless','across','perhaps','please','clothes','glasses','scissors','trousers','jeans','shorts','pants','thanks','as','plus']);
function slip(a){const t=String(a||'');const sub=(re,f)=>{const m=t.match(re);return m?t.slice(0,m.index)+f(m)+t.slice(m.index+m[0].length):''};
 return sub(/\b(I|You|We|They) (like|have|want|live|go|work|eat|play|need|see|love|can see)\b/,m=>m[1]+' '+(m[2]==='have'?'has':m[2]==='go'?'goes':m[2]+'s'))||
  sub(/\bdoesn['’]t\b/i,m=>"don't")||sub(/\bdon['’]t\b/i,()=>"doesn't")||
  sub(/\b(is)\b/,()=>'are')||sub(/\b(are)\b/,()=>'is')||sub(/\b(am)\b/,()=>'is')||sub(/\b(was)\b/,()=>'were')||sub(/\b(were)\b/,()=>'was')||
  sub(/\b(has)\b/,()=>'have')||sub(/\b(does)\b/,()=>'do')||
  (()=>{const w=t.split(' ');for(let i=1;i<Math.min(w.length,5);i++){const x=w[i].replace(/[^a-z]/gi,''),lx=x.toLowerCase();if(/^(a|an|the|my|your|his|her|our|their|this|that|some|many|two|three)$/i.test(w[i-1])||x!==lx||lx.length<4||NOT_V.has(lx)||!/s$/.test(lx)||/ss$|us$|is$/.test(lx))continue;
   const b=/ies$/.test(lx)?lx.slice(0,-3)+'y':/(ch|sh|x|o)es$/.test(lx)?lx.slice(0,-2):lx.slice(0,-1);w[i]=w[i].replace(x,b);return w.join(' ')}return ''})()||
  sub(/\b(can|will|must|should) (\w+)\b/,m=>m[1]+' '+m[2]+(/s$/.test(m[2])?'':'s'))||sub(/\ban (?=[bcdfghjklmnpqrstvwxyz])/i,()=>'a ')||sub(/\ba (?=[aeiou])/i,()=>'an ')}
function flip(a){const m=String(a||'').match(/^(Yes|No), (I|you|he|she|it|we|they) (\w+)(n['’]t)?\.?$/i);if(!m)return'';const v=m[3].toLowerCase(),neg={am:"I'm not",can:"can't",will:"won't",do:"don't",does:"doesn't",did:"didn't",is:"isn't",are:"aren't",was:"wasn't",were:"weren't",have:"haven't",has:"hasn't"};
 if(/^yes$/i.test(m[1]))return v==='am'?"No, I'm not.":neg[v]?`No, ${m[2]} ${neg[v]}.`:'';return `Yes, ${m[2]} ${v.replace(/n['’]?t$/,'')==='ca'?'can':v.replace(/n['’]?t$/,'')}.`}
const TYPE={where:['At seven o’clock.','Yes, they do.','Because it is fun.'],when:['In the kitchen.','Yes, I do.','A red one.'],who:['In the morning.','Yes, she is.','At the shop.'],what:['Yes, he does.','At nine o’clock.','In the park.'],which:['Yes, it is.','On Monday.','At school.'],why:['At home.','Yes, I can.','Two, please.'],how:['Yes, I do.','In the box.','On Sunday.'],howmany:['Yes, please.','In the box.','Very well.'],howmuch:['Yes, it is.','At the market.','Blue and green.'],whose:['In the morning.','Yes, it is.','At the bus stop.'],yn:['At the market.','In the evening.','Three, please.'],'':['Yes, I do.','At home.','In the morning.']};
function qType(q){const w=String(q||'').toLowerCase().replace(/[^a-z ]/g,'').split(' ').filter(Boolean);if(!w.length)return'';if(w[0]==='how'&&(w[1]==='many'||w[1]==='much'))return 'how'+w[1];
 if(TYPE[w[0]])return w[0];if(/^(do|does|did|is|are|am|was|were|can|could|will|would|have|has|should|may)$/.test(w[0]))return 'yn';return ''}
/* Nana 25 Nov: wrong choices must be 100% grammatical, same structure, wrong only in meaning →
   swap a set word in the answer for another set word (a/an fixed), then Yes/No flip, then other answers to the same kind of question */
function swapWord(q,A,vocab,pool,k){const esc=v=>v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),has=(t,v)=>new RegExp('\\b'+esc(v)+'\\b','i').test(t);
 const V=(vocab||[]).map(v=>String(v||'').trim()).filter(v=>v.length>1).sort((x,y)=>y.length-x.length);
 const hits=V.filter(v=>has(A,v)&&!has(q,v)&&!V.some(o=>o!==v&&o.length>v.length&&has(A,o)&&has(o,v)));if(hits.length!==1)return ''; // one place/thing/action word only (not lists)
 const hit=hits[0],P=V.filter(v=>v.toLowerCase()!==hit.toLowerCase()&&!has(A,v)&&(pool||[]).some(t=>has(t,v)));if(!P.length)return '';
 const rep=P[(k*7+A.length)%P.length];return A.replace(new RegExp('(\\b(a|an)\\s+)?\\b'+esc(hit)+'\\b','i'),(m,art,a1)=>{const orig=m.replace(/^(a|an)\s+/i,'');const w=/^[A-Z]/.test(orig)?rep[0].toUpperCase()+rep.slice(1):rep.toLowerCase();
  if(!art)return w;const an=/^[aeiou]/i.test(w)&&!/^(uni|use|one|eu)/i.test(w);return (a1[0]===a1[0].toUpperCase()?(an?'An':'A'):(an?'an':'a'))+' '+w})}
function dlgWrongs(q,a,given,others,i,vocab){const A=String(a||'').trim(),low=x=>String(x||'').trim().toLowerCase(),out=[];const add=x=>{x=String(x||'').trim();if(x&&low(x)!==low(A)&&!out.some(y=>low(y)===low(x)))out.push(x)};
 const pool=(others||[]).map(o=>typeof o==='object'?o.a:o);(given||[]).forEach(add);add(swapWord(q,A,vocab,pool,(i||0)));add(swapWord(q,A,vocab,pool,(i||0)+3));add(flip(A));
 const qt=qType(q),same=(others||[]).filter(o=>typeof o==='object'?qType(o.q)===qt:false).map(o=>o.a);same.forEach(add);(others||[]).map(o=>typeof o==='object'?o.a:o).forEach(add);return out}
const dlgParse=l=>{const p=String(l||'').split('|').map(x=>x.trim());return {q:p[0]||'',a:p[1]||'',wr:p.slice(2).filter(Boolean)}};
window.VS={
 dlgWrongs,dlgParse,
 uid,
 all:()=>C.first().then(()=>allL()),
 get:id=>C.first().then(()=>getL(id)),
 put:set=>{set.updated=Date.now();if(!set.created)set.created=set.updated;return putL(set).then(()=>{C.soon();return set})},
 del:id=>delL(id).then(()=>C.gone(id)),
 cur:{get(){try{return localStorage.getItem(CUR)}catch(e){return null}},set(id){try{localStorage.setItem(CUR,id)}catch(e){}}},
 blank:(name)=>({id:uid(),name:name||'New set',icon:'📚',lang:'en',mt:'th',words:[],sen:'',dlg:'',sto:'',ipa:{}}),
 lines:t=>String(t||'').split('\n').map(l=>l.trim()).filter(Boolean),
 FORMAT:'bokogo-vocab-set',
 cloud:C,API
};
})();
