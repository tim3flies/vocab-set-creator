/* Bokogo Vocab Sets · shared storage (IndexedDB on this device). Used by index.html (creator) and worksheets.html (print).
   One set = {id,name,icon,lang,mt,words:[{id,w,ipa,m,e,img}],sen,dlg,sto,ipa:{},created,updated}
   sen: "English | meaning" per line ([word] = blank for R6) · dlg: "Question | Answer" per line · sto: R7 story blocks · ipa: extra word→IPA for sentence words */
(function(){
const DB='bokogo-vocab',ST='sets',CUR='bokogo.vset.cur';
let dbp=null;
function db(){if(dbp)return dbp;dbp=new Promise((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(ST))d.createObjectStore(ST,{keyPath:'id'})};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});return dbp}
function tx(mode,fn){return db().then(d=>new Promise((ok,no)=>{const t=d.transaction(ST,mode),s=t.objectStore(ST);let out;const r=fn(s);if(r)r.onsuccess=()=>{out=r.result};t.oncomplete=()=>ok(out);t.onerror=()=>no(t.error);t.onabort=()=>no(t.error)}))}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
window.VS={
 uid,
 all:()=>tx('readonly',s=>s.getAll()).then(a=>(a||[]).sort((x,y)=>(y.updated||0)-(x.updated||0))),
 get:id=>tx('readonly',s=>s.get(id)),
 put:set=>{set.updated=Date.now();if(!set.created)set.created=set.updated;return tx('readwrite',s=>s.put(set)).then(()=>set)},
 del:id=>tx('readwrite',s=>s.delete(id)),
 cur:{get(){try{return localStorage.getItem(CUR)}catch(e){return null}},set(id){try{localStorage.setItem(CUR,id)}catch(e){}}},
 blank:(name)=>({id:uid(),name:name||'New set',icon:'📚',lang:'en',mt:'th',words:[],sen:'',dlg:'',sto:'',ipa:{}}),
 lines:t=>String(t||'').split('\n').map(l=>l.trim()).filter(Boolean),
 FORMAT:'bokogo-vocab-set'
};
})();
