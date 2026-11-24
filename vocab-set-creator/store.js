/* Bokogo Vocab Sets · shared storage (IndexedDB on this device). Used by index.html (creator) and worksheets.html (print).
   One set = {id,name,icon,lang,mt,words:[{id,w,ipa,m,e,img}],sen,dlg,sto,ipa:{},created,updated}
   sen: "English | meaning" per line ([word] = blank for R6) · dlg: "Question | Answer" per line · sto: R7 story blocks · ipa: extra word→IPA for sentence words */
(function(){
const DB='bokogo-vocab',ST='sets',CUR='bokogo.vset.cur';
let dbp=null;
function db(){if(dbp)return dbp;dbp=new Promise((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(ST))d.createObjectStore(ST,{keyPath:'id'})};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});return dbp}
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
 async signin(name,pass){const j=await this.req('login',{name,pass});this.st={tok:j.tok,name:j.name,since:0,done:{},dels:[]};this.sv();this.emit({state:'on'});await this.sync();return j},
 async register(name,pass,invite){const j=await this.req('register',{name,pass,invite});this.st={tok:j.tok,name:j.name,since:0,done:{},dels:[]};this.sv();this.emit({state:'on'});await this.sync();return j},
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

window.VS={
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
