const crcT=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc=u=>{let c=-1;for(let i=0;i<u.length;i++)c=crcT[(c^u[i])&255]^(c>>>8);return(c^-1)>>>0};
function zip(fs){const e=new TextEncoder(),parts=[],cd=[];let off=0;
fs.forEach(f=>{const n=e.encode(f.name),c=crc(f.data),L=f.data.length,h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint32(14,c,true);h.setUint32(18,L,true);h.setUint32(22,L,true);h.setUint16(26,n.length,true);parts.push(h.buffer,n,f.data);
const d=new DataView(new ArrayBuffer(46));d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x0800,true);d.setUint32(16,c,true);d.setUint32(20,L,true);d.setUint32(24,L,true);d.setUint16(28,n.length,true);d.setUint32(42,off,true);cd.push(d.buffer,n);off+=30+n.length+L});
const cs=cd.reduce((a,b)=>a+b.byteLength,0),en=new DataView(new ArrayBuffer(22));en.setUint32(0,0x06054b50,true);en.setUint16(8,fs.length,true);en.setUint16(10,fs.length,true);en.setUint32(12,cs,true);en.setUint32(16,off,true);return new Blob([...parts,...cd,en.buffer],{type:'application/zip'})}
const sgBgOf=(d,W,H)=>{const r=[[],[],[]];for(let x=0;x<W;x+=5)for(const y of [2,H-3])for(let c=0;c<3;c++)r[c].push(d[(y*W+x)*4+c]);for(let y=0;y<H;y+=5)for(const x of [2,W-3])for(let c=0;c<3;c++)r[c].push(d[(y*W+x)*4+c]);return r.map(a=>{a.sort((p,q)=>p-q);return a[a.length>>1]})};
const sgDist=(d,i,b)=>Math.max(Math.abs(d[i]-b[0]),Math.abs(d[i+1]-b[1]),Math.abs(d[i+2]-b[2]));
function sgDil(m,W,H,rx,ry){let t=new Uint8Array(W*H),o=new Uint8Array(W*H);
for(let y=0;y<H;y++){let last=-1e9;const row=y*W;for(let x=0;x<W;x++){if(m[row+x])last=x;if(x-last<=rx)t[row+x]=1}last=1e9;for(let x=W-1;x>=0;x--){if(m[row+x])last=x;if(last-x<=rx)t[row+x]=1}}
for(let x=0;x<W;x++){let last=-1e9;for(let y=0;y<H;y++){if(t[y*W+x])last=y;if(y-last<=ry)o[y*W+x]=1}last=1e9;for(let y=H-1;y>=0;y--){if(t[y*W+x])last=y;if(last-y<=ry)o[y*W+x]=1}}return o}
function sgCC(m,W,H){const lab=new Int32Array(W*H),comps=[],st=[];let n=0;
for(let s=0;s<W*H;s++){if(!m[s]||lab[s])continue;n++;let a=0,x0=W,y0=H,x1=0,y1=0,sx=0,sy=0;st.push(s);lab[s]=n;
while(st.length){const p=st.pop(),x=p%W,y=(p-x)/W;a++;sx+=x;sy+=y;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
for(let dy=-1;dy<=1;dy++){const yy=y+dy;if(yy<0||yy>=H)continue;for(let dx=-1;dx<=1;dx++){const xx=x+dx;if(xx<0||xx>=W)continue;const q=yy*W+xx;if(m[q]&&!lab[q]){lab[q]=n;st.push(q)}}}}
comps.push({id:n,a,x0,y0,x1,y1,cx:sx/a,cy:sy/a})}return{lab,comps}}
/* where the grid lines fall: try n = 2..max cells, score = how little ink the cut lines touch */
function sgCuts(proj,len,n){const lo=proj.findIndex(v=>v>0),hi=len-1-[...proj].reverse().findIndex(v=>v>0),L=(hi-lo+1)/n,w=Math.max(3,Math.round(L*.12)),cuts=[lo];let cost=0;
for(let k=1;k<n;k++){const c=Math.round(lo+k*L);let bx=c,bv=1e9;for(let x=Math.max(lo,c-w);x<=Math.min(hi,c+w);x++){const v=proj[x]+Math.abs(x-c)*.02;if(v<bv){bv=v;bx=x}}cuts.push(bx);cost+=proj[bx]}cuts.push(hi+1);return{cuts,cost:n>1?cost/(n-1):0}}
function sgGuess(proj,len,max){const nzv=[...proj].filter(v=>v>0),mean=nzv.reduce((p,q)=>p+q,0)/(nzv.length||1);let best=null;
for(let n=2;n<=max;n++){const r=sgCuts(proj,len,n);r.n=n;r.rel=r.cost/mean;if(r.rel<=.1)best=r}
if(!best){best=sgCuts(proj,len,1);best.n=1}return best}
/* main: returns {cols,rows,cells:[{col,row,box,icon:{w,h,data}|null,label:{w,h,data}|null}]} */
function sgSplit(d,W,H,o){o=o||{};const bg=sgBgOf(d,W,H),thr=o.thr||18,N=W*H,fg=new Uint8Array(N),dark=new Uint8Array(N);
for(let i=0,p=0;p<N;i+=4,p++){if(sgDist(d,i,bg)>thr)fg[p]=1;const r=d[i],g=d[i+1],b=d[i+2];if(.3*r+.59*g+.11*b<90&&Math.max(r,g,b)-Math.min(r,g,b)<32)dark[p]=1}
const rp=new Float32Array(H),cp=new Float32Array(W);for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(fg[y*W+x]){rp[y]++;cp[x]++}
const nz=a=>a.map(v=>v>2?v:0);let rows=o.rows,cols=o.cols,rc,cc;const tot=N*.05;
if(!rows){rc=sgGuess(nz(rp),H,12);rows=rc.n}else rc=sgCuts(nz(rp),H,rows);
if(!cols){cc=sgGuess(nz(cp),W,10);cols=cc.n}else cc=sgCuts(nz(cp),W,cols);
const rcut=sgCuts(nz(rp),H,rows).cuts,ccut=sgCuts(nz(cp),W,cols).cuts;
const cellAt=(x,y)=>{let c=0,r=0;for(let k=1;k<cols;k++)if(x>=ccut[k])c=k;for(let k=1;k<rows;k++)if(y>=rcut[k])r=k;return[c,r]};
/* 1. text: dark neutral ink, merged into word blobs, in the lower part of each row */
const tm=sgDil(dark,W,H,Math.round(W*.011),Math.round(H*.003)),tcc=sgCC(tm,W,H),text=new Uint8Array(N),tb=[];
for(const c of tcc.comps){const bw=c.x1-c.x0+1,bh=c.y1-c.y0+1;if(bh<H*.011||bw<W*.02)continue;const[cx,cy]=cellAt(c.cx,c.cy),top=rcut[cy],h=rcut[cy+1]-top;if(c.cy<top+h*.55)continue;
 let n=0;for(let y=c.y0;y<=c.y1;y++)for(let x=c.x0;x<=c.x1;x++)if(tcc.lab[y*W+x]==c.id&&dark[y*W+x])n++;if(n<bw*bh*.1||n>bw*bh*.4||bh>H*.075)continue;tb.push({...c,cx0:cx,cy0:cy})}
const tmask=new Uint8Array(N);for(const c of tb)for(let y=c.y0;y<=c.y1;y++)for(let x=c.x0;x<=c.x1;x++)if(tcc.lab[y*W+x]==c.id)tmask[y*W+x]=1;
const kill=sgDil(tmask,W,H,5,5);const fgi=new Uint8Array(N);for(let p=0;p<N;p++)fgi[p]=fg[p]&&!kill[p]?1:0;
/* 2. icon parts: merge nearby ink, drop specks, hand each blob to the grid cell holding its centre */
const im=sgDil(fgi,W,H,Math.round(W*.006),Math.round(W*.006)),icc=sgCC(im,W,H),minA=N*.00012,cells=[];
for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)cells.push({col:c,row:r,box:[ccut[c],rcut[r],ccut[c+1],rcut[r+1]],ids:[],texts:[]});
for(const c of icc.comps){if(c.a<minA)continue;const[cx,cy]=cellAt(c.cx,c.cy);cells[cy*cols+cx].ids.push(c)}
for(const c of tb)cells[c.cy0*cols+c.cx0].texts.push(c);
const pad=4;
for(const cell of cells){cell.icon=null;cell.label=null;
 if(cell.texts.length){let x0=W,y0=H,x1=0,y1=0;for(const c of cell.texts){x0=Math.min(x0,c.x0);y0=Math.min(y0,c.y0);x1=Math.max(x1,c.x1);y1=Math.max(y1,c.y1)}x0=Math.max(0,x0-6);y0=Math.max(0,y0-6);x1=Math.min(W-1,x1+6);y1=Math.min(H-1,y1+6);
  const w=x1-x0+1,h=y1-y0+1,out=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const s=((y+y0)*W+x+x0)*4,t=(y*w+x)*4;out[t]=d[s];out[t+1]=d[s+1];out[t+2]=d[s+2];out[t+3]=255}cell.label={w,h,data:out}}
 if(!cell.ids.length)continue;
 const keep=new Set();let big=0;for(const c of cell.ids)big=Math.max(big,c.a);const use=cell.ids.filter(c=>c.a>=big*.004);use.forEach(c=>keep.add(c.id));
 let x0=W,y0=H,x1=0,y1=0;for(const c of use){x0=Math.min(x0,c.x0);y0=Math.min(y0,c.y0);x1=Math.max(x1,c.x1);y1=Math.max(y1,c.y1)}
 x0=Math.max(0,x0-pad-8);y0=Math.max(0,y0-pad-8);x1=Math.min(W-1,x1+pad+8);y1=Math.min(H-1,y1+pad+8);const w=x1-x0+1,h=y1-y0+1;
 /* ink of this icon only (outline + colour), then flood the outside from the edge so white *inside* stays */
 const own=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=(y+y0)*W+x+x0;if(fgi[p]&&keep.has(icc.lab[p]))own[y*w+x]=1;else if(fgi[p]){/* ink of a neighbour that touches */}}
 /* ink close to an owned blob (the blob mask was dilated, so use its label region) */
 const reg=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(keep.has(icc.lab[(y+y0)*W+x+x0]))reg[y*w+x]=1;
 const ink=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=(y+y0)*W+x+x0;if(reg[y*w+x]&&fg[p]&&!kill[p])ink[y*w+x]=1}
 const bar=sgDil(ink,w,h,2,2),outside=new Uint8Array(w*h),st=[];
 const push=q=>{if(!bar[q]&&!outside[q]){outside[q]=1;st.push(q)}};
 for(let x=0;x<w;x++){push(x);push((h-1)*w+x)}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1)}
 while(st.length){const p=st.pop(),x=p%w,y=(p-x)/w;if(x>0)push(p-1);if(x<w-1)push(p+1);if(y>0)push(p-w);if(y<h-1)push(p+w)}
 const near=sgDil(outside,w,h,3,3),out=new Uint8ClampedArray(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const q=y*w+x,s=((y+y0)*W+x+x0)*4,t=q*4;if(outside[q]||(kill[(y+y0)*W+x+x0]&&!ink[q]&&near[q]))continue;
  let a=1;const ds=sgDist(d,s,bg);if(near[q]){a=Math.max(0,Math.min(1,(ds-8)/26))}
  if(a<=0)continue;for(let c=0;c<3;c++){let v=a<1?bg[c]+(d[s+c]-bg[c])/a:d[s+c];out[t+c]=v<0?0:v>255?255:v}out[t+3]=Math.round(a*255)}
 /* tight crop of what is left */
 let a0=w,b0=h,a1=-1,b1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(out[(y*w+x)*4+3]>10){if(x<a0)a0=x;if(x>a1)a1=x;if(y<b0)b0=y;if(y>b1)b1=y}
 if(a1<0)continue;a0=Math.max(0,a0-2);b0=Math.max(0,b0-2);a1=Math.min(w-1,a1+2);b1=Math.min(h-1,b1+2);const cw=a1-a0+1,ch=b1-b0+1,cd=new Uint8ClampedArray(cw*ch*4);
 for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const s=((y+b0)*w+x+a0)*4,t=(y*cw+x)*4;cd[t]=out[s];cd[t+1]=out[s+1];cd[t+2]=out[s+2];cd[t+3]=out[s+3]}
 cell.icon={w:cw,h:ch,data:cd}}
return{cols,rows,cells:cells.filter(c=>c.icon)}}
const $=id=>document.getElementById(id);
const esc=t=>String(t??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
let tT;function toast(m){const t=$('toast');if(!t)return;t.textContent=m;t.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('on'),2400)}
function dl(b,n){const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
const bnorm=s=>String(s||'').toLowerCase().normalize('NFC').replace(/['’`]/g,'').replace(/[_\-.]+/g,' ').replace(/\s+/g,' ').trim();
const sgSlug=s=>bnorm(s).replace(/[^\p{L}\p{N} ]/gu,'').trim().replace(/ +/g,'_')||'item';
const sgCv=(o,mx)=>{const c=document.createElement('canvas');c.width=o.w;c.height=o.h;c.getContext('2d').putImageData(new ImageData(o.data,o.w,o.h),0,0);if(!mx||Math.max(o.w,o.h)<=mx)return c;const q=mx/Math.max(o.w,o.h),k=document.createElement('canvas');k.width=Math.round(o.w*q);k.height=Math.round(o.h*q);k.getContext('2d').drawImage(c,0,0,k.width,k.height);return k};
const S={items:[]};          /* preview: no word list yet */
/* read the caption under each picture with free in-browser OCR (Tesseract.js, English) and put it in the name box */
const TJ='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/',TOPT={workerPath:TJ+'worker.min.js',corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1',langPath:'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int'};
function tessLoad(){return window.Tesseract?Promise.resolve(window.Tesseract):new Promise((ok,no)=>{const s=document.createElement('script');s.src=TJ+'tesseract.min.js';s.onload=()=>window.Tesseract?ok(window.Tesseract):no(new Error('load'));s.onerror=()=>no(new Error('Could not load the text reader (needs internet the first time)'));document.head.appendChild(s)})}
const ocrClean=s=>String(s||'').replace(/[|_~`]/g,' ').replace(/\s+/g,' ').replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N})]+$/gu,'').trim();
async function sgOCR(auto){if(!SG||SG.ai=='busy'||!SG.cells.length)return;const mine=SG;if(!mine.cells.some(c=>c.label)){mine.ai='none';sgRender();return}
 mine.ai='busy';mine.err='';mine.prog=0;sgRender();let w=null;
 try{const T=await tessLoad();if(SG!==mine)return;w=await T.createWorker('eng',1,TOPT);await w.setParameters({tessedit_pageseg_mode:'7'});
  let got=0;for(let k=0;k<mine.cells.length;k++){const c=mine.cells[k];if(!c.label)continue;
   const im=await loadImg(c.label),P=16,sc=Math.max(.5,Math.min(3,64/im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*sc)+P*2;cv.height=Math.round(im.height*sc)+P*2;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height);g.imageSmoothingQuality='high';g.drawImage(im,P,P,im.width*sc,im.height*sc);
   let r=await w.recognize(cv);if(SG!==mine)return;let txt=ocrClean(r.data.text);if(!txt||r.data.confidence<40){await w.setParameters({tessedit_pageseg_mode:'6'});const r2=await w.recognize(cv);await w.setParameters({tessedit_pageseg_mode:'7'});if(SG!==mine)return;const ln=String(r2.data.text||'').split('\n').map(ocrClean).filter(s=>/\p{L}{2,}/u.test(s));if(ln.length&&(!txt||r2.data.confidence>r.data.confidence))txt=ln[ln.length-1]}if(txt&&!(c.src=='me')){c.name=txt;c.src='ocr';got++}
   mine.prog=k+1;const b=$('ocrp');if(b)b.textContent=`${k+1}/${mine.cells.length}`;const inp=document.querySelector(`.sgc input[data-k="${k}"]`);if(inp&&c.src=='ocr')inp.value=c.name}
  if(!got)throw new Error('Could not read the captions');mine.ai='done';if(!auto)toast('Words read: '+got+' words')}
 catch(e){if(SG!==mine)return;mine.ai='fail';mine.err=e.message||String(e)}
 finally{try{w&&await w.terminate()}catch(_){}}
 if(SG===mine){SG.kept=true;sgRender()}}
let SG=null;
async function loadImg(src){return await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src})}
async function sgImage(im,name){const q=Math.min(1,2400/Math.max(im.naturalWidth,im.naturalHeight)),W=Math.round(im.naturalWidth*q),H=Math.round(im.naturalHeight*q),c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);g.drawImage(im,0,0,W,H);
 SG={data:g.getImageData(0,0,W,H).data,W,H,name,cols:0,rows:0,cells:[],add:true,rep:false};document.body.classList.add('sgopen');await sgRun()}
async function sgFile(f){if(!f)return;if(!f.type.startsWith('image/')){toast('This file is not a picture');return}toast('Cutting…');
 try{const src=await new Promise((ok,no)=>{const r=new FileReader();r.onerror=no;r.onload=()=>ok(r.result);r.readAsDataURL(f)});await sgImage(await loadImg(src),f.name)}catch(e){toast('Could not open the picture');console.error(e)}}
async function sgRun(){await new Promise(r=>setTimeout(r,30));const o={};if(SG.cols)o.cols=SG.cols;if(SG.rows)o.rows=SG.rows;SG.mode='auto';
 const R=sgSplit(SG.data,SG.W,SG.H,o);SG.gc=R.cols;SG.gr=R.rows;const old=SG.cells.map(c=>c.name);
 SG.cells=R.cells.map((c,k)=>({icon:sgCv(c.icon,512),label:c.label?sgCv(c.label,1000).toDataURL('image/png'):'',name:old[k]!=null?old[k]:''}));
 SG.ai='';if(!SG.cells.length)toast('No pictures found. Set the columns/rows yourself, or use a template guide');sgRender();sgOCR(true)}
const sgFileName=(c,k)=>String(k+1).padStart(2,'0')+'_'+sgSlug(c.name||('item'+(k+1)))+'.png';
function sgRender(){
 const M=sgMatch(),on=SG.cells.map(c=>c.on!==false),nm=M.filter((x,k)=>on[k]&&x.st=='mt').length,nn=M.filter((x,k)=>on[k]&&x.st=='nw'&&SG.cells[k].name.trim()).length;
 $('qd').innerHTML=`<div class="bdlg" style="max-width:780px"><button class="sgx" onclick="sgClose()" aria-label="close">✕</button><h3>🧩 Cut picture sheet — ${SG.cells.length} pictures</h3>
<div class="sgr">Columns <input type="number" min="1" max="12" id="sgc" value="${SG.cols||SG.gc||''}"> Rows <input type="number" min="1" max="12" id="sgr" value="${SG.rows||SG.gr||''}"> <button class="btn" onclick="sgRe()">Cut again</button></div>
${sgBanner()}<p class="note">Checkered = transparent (background removed) · under each picture: the caption that was cut off (used to read the word) · the box = the word / file name</p>
<div class="sgr sel"><b>Ticked <span id="sgcnt">${SG.cells.filter(c=>c.on!==false).length}</span>/${SG.cells.length}</b> <button class="btn" onclick="sgAll(true)">☑ All</button><button class="btn" onclick="sgAll(false)">☐ None</button></div>
<div class="bgrid">${SG.cells.map((c,k)=>`<div class="sgc ${M[k].st}${c.on===false?' off':''}"><label class="tk"><input type="checkbox" ${c.on===false?'':'checked'} onchange="sgTick(${k},this.checked,this)"> <span class="sgn">${k+1}</span></label><div class="sgb"><img src="${c.icon.toDataURL('image/png')}" alt=""></div>${c.label?`<img class="lb" src="${c.label}" alt="">`:''}<input value="${esc(c.name)}" placeholder="word" data-k="${k}" onchange="SG.cells[${k}].name=this.value;SG.cells[${k}].src='me';SG.kept=true;sgRender()"></div>`).join('')}</div>
<p class="note"><span class="dot mt"></span> In this set <b>${nm}</b> · <span class="dot nw"></span> New words <b>${nn}</b></p>
<label class="opt"><input type="checkbox" ${SG.add!==false?'checked':''} onchange="SG.add=this.checked"> Add as a new word if it is not in the set</label>
<label class="opt"><input type="checkbox" ${SG.rep?'checked':''} onchange="SG.rep=this.checked"> Replace pictures of words that already have one</label>
<div class="seg" style="flex-wrap:wrap"><button class="btn p" onclick="sgApply()">✅ Add ticked pictures</button><button class="btn" onclick="sgZip()">⬇ ZIP (transparent PNG)</button><button class="btn" onclick="sgClose()">Cancel</button></div></div>`;$('qd').hidden=false;if(!SG.kept)$('qd').scrollTop=0;SG.kept=false}
function sgClose(){$('qd').hidden=true;SG=null;document.body.classList.remove('sgopen')}
const sgKey=s=>bnorm(s);
function sgMatch(){const ws=(window.CUT&&CUT.words?CUT.words():[]).map(sgKey),seen=new Set();return SG.cells.map(c=>{const k=sgKey(c.name);if(!k)return{st:'nw'};const i=ws.indexOf(k);if(i<0)return{st:seen.has(k)?'dup':'nw',k};const st=seen.has(k)?'dup':'mt';seen.add(k);return{st,i,k}})}
function sgPng(cv,max){const q=Math.min(1,max/Math.max(cv.width,cv.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(cv.width*q));c.height=Math.max(1,Math.round(cv.height*q));const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(cv,0,0,c.width,c.height);return c.toDataURL('image/png')}
async function sgApply(){if(!SG)return;const M=sgMatch(),list=[];SG.cells.forEach((c,k)=>{if(c.on===false||M[k].st=='dup')return;const name=c.name.trim();if(!name&&M[k].st!='mt')return;list.push({name,img:sgPng(c.icon,384),exists:M[k].st=='mt'})});
 if(!list.length){toast('No picture ticked, or the words are empty');return}
 const r=window.CUT&&CUT.apply?await CUT.apply(list,{add:SG.add!==false,rep:!!SG.rep}):null;sgClose();if(r)toast(`🖼️ Pictures added: ${r.n}${r.a?` · ＋ New words ${r.a}`:''}${r.sk?` · skipped ${r.sk} (already have one)`:''}`)}
function sgBanner(){const a=SG.ai,b=`<button class="btn" onclick="SG.cells.forEach(c=>{if(c.src=='ocr')c.src=''});sgOCR()">🔤 Read words again</button>`;
 return a=='busy'?`<div class="sgw ok">⏳ Reading the words under the pictures… <b id="ocrp">${SG.prog||0}/${SG.cells.length}</b></div>`:a=='done'?`<div class="sgw ok">✓ Words read from the captions and put in the boxes (you can edit them) ${b}</div>`:a=='fail'?`<div class="sgw">⚠ Could not read the words: ${esc(SG.err)} — type the words yourself ${b}</div>`:a=='none'?`<div class="sgw">No captions found. Type the words in the boxes</div>`:''}
function sgTick(k,v,el){SG.cells[k].on=v;SG.kept=true;const y=$('qd').scrollTop;sgRender();$('qd').scrollTop=y}
function sgAll(v){SG.cells.forEach(c=>c.on=v);const y=$('qd').scrollTop;SG.kept=true;sgRender();$('qd').scrollTop=y}
function sgRe(){SG.cols=+$('sgc').value||0;SG.rows=+$('sgr').value||0;toast('Cutting again…');sgRun()}
async function sgZip(){const fs=[];if(!SG.cells.some(c=>c.on!==false)){toast('No picture ticked');return}for(let k=0;k<SG.cells.length;k++){const c=SG.cells[k];if(c.on===false)continue;const b=await new Promise(r=>c.icon.toBlob(r,'image/png'));fs.push({name:sgFileName(c,k),data:new Uint8Array(await b.arrayBuffer())})}
 dl(zip(fs),(sgSlug(SG.name.replace(/\.[^.]+$/,''))||'icons')+'-icons.zip');toast('Downloaded '+fs.length+' PNG files')}
/* ===== v35: TEMPLATE guides - a saved grid layout (cols x rows, caption zone) laid over the uploaded sheet: cut each picture cell, make it transparent, read the caption zone ===== */
function sgLines(d,W,H){const bg=sgBgOf(d,W,H),N=W*H,lk=new Uint8Array(N);
 for(let p=0,i=0;p<N;p++,i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(sgDist(d,i,bg)>30&&Math.max(r,g,b)-Math.min(r,g,b)<45)lk[p]=1}
 const scan=vert=>{const A=vert?W:H,B=vert?H:W,idx=(a,b)=>vert?b*W+a:a*W+b,minL=Math.round(B*.35),gap=Math.max(3,Math.round(B*.006)),res=[];
  for(let a=0;a<A;a++){let s=-1,last=-1,bs=-1,be=-1;
   for(let b=0;b<=B;b++){const hit=b<B&&(lk[idx(a,b)]||(a>0&&lk[idx(a-1,b)])||(a<A-1&&lk[idx(a+1,b)]));
    if(hit){if(s<0)s=b;last=b}else if(s>=0&&(b>=B||b-last>gap)){if(last-s>be-bs){bs=s;be=last}s=-1}}
   if(be-bs+1>=minL){let th=0,n=0;for(let b=bs;b<=be;b+=2){n++;const a1=a-5,a2=a+5;if(!((a1>=0&&lk[idx(a1,b)])||(a2<A&&lk[idx(a2,b)])))th++}
    if(th>=n*.6)res.push({p:a,s:bs,e:be})}}
  const out=[];for(const r of res){const l=out[out.length-1];if(l&&r.p-l.last<=2){l.last=r.p;l.s=Math.min(l.s,r.s);l.e=Math.max(l.e,r.e);l.sum+=r.p;l.n++}else out.push({first:r.p,last:r.p,s:r.s,e:r.e,sum:r.p,n:1})}
  return out.filter(l=>l.last-l.first+1<=12).map(l=>({p:l.sum/l.n,s:l.s,e:l.e}))};
 return{v:scan(true),h:scan(false),bg}}
/* locate the caption's text band by its dark rows (bottom-most band for "below", top-most for "above") so the picture is never clipped by a fixed fraction */
function sgFindWord(d,W,H,bx,pos,bg){const ix0=Math.round(bx[0]+(bx[2]-bx[0])*.06),ix1=Math.round(bx[2]-(bx[2]-bx[0])*.06),ch=bx[3]-bx[1],below=pos!='above',ys=below?Math.round(bx[3]-6):Math.round(bx[1]+6),lim=below?Math.round(bx[3]-ch*.55):Math.round(bx[1]+ch*.55),st=below?-1:1,gapMin=Math.max(3,Math.round(ch*.012));
 let band=null,gap=0;const cw=ix1-ix0+1;
 for(let y=ys;below?y>=lim:y<=lim;y+=st){if(y<0||y>=H)break;let n=0;for(let x=ix0;x<=ix1;x++){const i=(y*W+x)*4;if(sgDist(d,i,bg)>70&&.3*d[i]+.59*d[i+1]+.11*d[i+2]<130)n++}
  const dense=n>=Math.max(2,cw*.012);
  if(dense){if(!band)band={a:y,b:y};else band.b=y;gap=0}else if(band){gap++;if(gap>gapMin)break}}
 if(!band)return null;const y0=Math.min(band.a,band.b),y1=Math.max(band.a,band.b),bh=y1-y0+1;if(bh<ch*.025||bh>ch*.26)return null;return{y0,y1}}
/* where the cells are: from the detected grid lines (preferred) or from the template's margins; boundaries snap to real lines */
function sgTplGeo(Sx,t){const W=Sx.W,H=Sx.H,L=Sx.lines||(Sx.lines=sgLines(Sx.data,W,H));let x0,y0,x1,y1,fl=false;
 if(t.useLines!==false&&L.v.length>=2&&L.h.length>=2){x0=L.v[0].p;x1=L.v[L.v.length-1].p;y0=L.h[0].p;y1=L.h[L.h.length-1].p;fl=true}
 else{x0=t.m.l*W;y0=t.m.t*H;x1=W-t.m.r*W;y1=H-t.m.b*H}
 const snap=(v,arr,tol)=>{let b=v,bd=tol+1;for(const l of arr){const q=Math.abs(l.p-v);if(q<bd){bd=q;b=l.p}}return bd<=tol?b:v};
 const pw=(x1-x0)/t.cols,ph=(y1-y0)/t.rows,vs=[],hs=[];
 const cxm=t.rx&&t.rx.length==t.cols+1,cym=t.ry&&t.ry.length==t.rows+1;
 for(let i=0;i<=t.cols;i++){const e=x0+pw*i;vs.push(cxm?x0+(x1-x0)*t.rx[i]:fl?snap(e,L.v,pw*.06):e)}
 for(let i=0;i<=t.rows;i++){const e=y0+ph*i;hs.push(cym?y0+(y1-y0)*t.ry[i]:fl?snap(e,L.h,ph*.06):e)}
 const cells=[];
 for(let r=0;r<t.rows;r++)for(let c=0;c<t.cols;c++){const cx0=vs[c],cx1=vs[c+1],cy0=hs[r],cy1=hs[r+1],h=cy1-cy0;const mw=t.rwf&&t.rwf[r]!=null,wf=mw?t.rwf[r]:t.wordFrac;let sp=t.wordPos=='above'?cy0+h*wf:cy1-h*wf;
  if(fl&&!mw){const near=L.h.filter(l=>l.p>cy0+h*.1&&l.p<cy1-h*.1&&Math.abs(l.p-sp)<=h*.06);if(near.length)sp=near.reduce((a,b)=>Math.abs(b.p-sp)<Math.abs(a.p-sp)?b:a).p}
  if(t.autoWord!==false&&!mw&&wf>0){const wb=sgFindWord(Sx.data,W,H,[cx0,cy0,cx1,cy1],t.wordPos,L.bg);if(wb){const g=Math.max(4,Math.round(h*.015));sp=t.wordPos=='above'?wb.y1+g:wb.y0-g}}
  cells.push({r,c,box:[cx0,cy0,cx1,cy1],icon:t.wordPos=='above'?[cx0,sp,cx1,cy1]:[cx0,cy0,cx1,sp],word:t.wordPos=='above'?[cx0,cy0,cx1,sp]:[cx0,sp,cx1,cy1]})}
 return{x0,y0,x1,y1,vs,hs,cells,fromLines:fl,lines:L}}
/* one picture cell -> transparent picture with a thin white border */
function sgCellCut(d,W,H,rc,bg0,bpx,opt){opt=opt||{};const ex=opt.ex||0,ins=4,nx0=Math.max(0,Math.round(rc[0])+ins),ny0=Math.max(0,Math.round(rc[1])+ins),nx1=Math.min(W-1,Math.round(rc[2])-ins),ny1=Math.min(H-1,Math.round(rc[3])-ins);if(nx1-nx0<24||ny1-ny0<24)return null;
 /* working window = the guide cell grown by 'ex' so a picture may stick out past the guide lines (caption side stays closed) */
 const ew=Math.round((nx1-nx0)*ex),eh=Math.round((ny1-ny0)*ex),X0=Math.max(0,nx0-ew),X1=Math.min(W-1,nx1+ew),Y0=Math.max(0,ny0-(opt.wpos=='above'&&opt.hasWord?0:eh)),Y1=Math.min(H-1,ny1+(opt.wpos!='above'&&opt.hasWord?0:eh)),w=X1-X0+1,h=Y1-Y0+1,lx0=nx0-X0,ly0=ny0-Y0,lx1=nx1-X0,ly1=ny1-Y0,nw=lx1-lx0+1,nh=ly1-ly0+1;
 const N=w*h,R=Math.sqrt(N),at=(x,y)=>((y+Y0)*W+x+X0)*4;
 /* local background = median colour of the zone's border ring */
 const ring=[[],[],[]];for(let x=0;x<w;x+=3)for(const y of [0,h-1])for(let c=0;c<3;c++)ring[c].push(d[at(x,y)+c]);for(let y=0;y<h;y+=3)for(const x of [0,w-1])for(let c=0;c<3;c++)ring[c].push(d[at(x,y)+c]);
 const bgl=ring.map(a=>{a.sort((p,q)=>p-q);return a[a.length>>1]}),bg=ex==0&&Math.max(Math.abs(bgl[0]-bg0[0]),Math.abs(bgl[1]-bg0[1]),Math.abs(bgl[2]-bg0[2]))>6?bgl:bg0;
 const fg=new Uint8Array(N);for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(sgDist(d,at(x,y),bg)>18)fg[y*w+x]=1;
 if(opt.lines){for(const l of opt.lines.v){const px=Math.round(l.p)-X0;if(px<-4||px>w+3)continue;for(let y=Math.max(0,Math.round(l.s)-Y0);y<=Math.min(h-1,Math.round(l.e)-Y0);y++)for(let x=Math.max(0,px-3);x<=Math.min(w-1,px+3);x++)fg[y*w+x]=0}
  for(const l of opt.lines.h){const py=Math.round(l.p)-Y0;if(py<-4||py>h+3)continue;for(let x=Math.max(0,Math.round(l.s)-X0);x<=Math.min(w-1,Math.round(l.e)-X0);x++)for(let y=Math.max(0,py-3);y<=Math.min(h-1,py+3);y++)fg[y*w+x]=0}}
 const icc=sgCC(fg,w,h),cs=icc.comps.filter(c=>c.a>=8).sort((a,b)=>b.a-a.a);if(!cs.length)return null;
 /* the picture of this cell = the piece with the most pixels inside the nominal guide cell (it may extend past it) */
 const ia=new Map();for(let y=ly0;y<=ly1;y++)for(let x=lx0;x<=lx1;x++){const id=icc.lab[y*w+x];if(id)ia.set(id,(ia.get(id)||0)+1)}
 const mx8=nw*.08,my8=nh*.08,elig=c=>c.cx>=lx0-mx8&&c.cx<=lx1+mx8&&c.cy>=ly0-my8&&c.cy<=ly1+(opt.wpos!='above'&&opt.hasWord?0:my8)&&(opt.wpos!='above'||!opt.hasWord||c.cy>=ly0);
 let main=null,mia=0;for(const c of cs){const v=ia.get(c.id)||0;if(v>mia&&elig(c)){mia=v;main=c}}if(!main||mia<nw*nh*.008)return null;
 const big=main.a,use=[main];let a0=main.x0,b0=main.y0,a1=main.x1,b1=main.y1;
 for(const c of cs)if(c!==main&&elig(c)&&c.a>=big*.03){use.push(c);a0=Math.min(a0,c.x0);b0=Math.min(b0,c.y0);a1=Math.max(a1,c.x1);b1=Math.max(b1,c.y1)}
 /* small bits (sparks, light rays) only if they sit right next to the picture - far-away bits are caption/stray text */
 for(let pass=0;pass<2;pass++)for(const c of cs){if(use.includes(c)||!elig(c)||c.a<Math.max(6,big*.0004))continue;const gx=Math.max(0,Math.max(c.x0,a0)-Math.min(c.x1,a1)),gy=Math.max(0,Math.max(c.y0,b0)-Math.min(c.y1,b1));if(Math.hypot(gx,gy)<=Math.max(8,R*.03)){use.push(c);a0=Math.min(a0,c.x0);b0=Math.min(b0,c.y0);a1=Math.max(a1,c.x1);b1=Math.max(b1,c.y1)}}
 /* stray captions/labels sitting at the very top or bottom of the zone, split from the picture by a clear gap */
 {const iv=use.map(c=>[c.y0,c.y1]).sort((p,q)=>p[0]-q[0]),gm=Math.max(6,R*.02),bands=[];for(const v of iv){const l=bands[bands.length-1];if(l&&v[0]-l.y1<=gm)l.y1=Math.max(l.y1,v[1]);else bands.push({y0:v[0],y1:v[1]})}
  if(bands.length>1){for(const b of bands){b.cs=use.filter(c=>c.y0>=b.y0&&c.y1<=b.y1);b.mass=b.cs.reduce((s,c)=>s+c.a,0);b.x0=Math.min(...b.cs.map(c=>c.x0));b.x1=Math.max(...b.cs.map(c=>c.x1))}
   const mx=Math.max(...bands.map(b=>b.mass));for(const b of bands){const bh=b.y1-b.y0+1,bw=b.x1-b.x0+1;if(b.mass<mx&&b.mass<mx*.3&&bh<=R*.19&&bw>=bh*1.4&&(b.y0<ly0+nh*.15||b.y1>ly1-nh*.15))for(const c of b.cs){const k=use.indexOf(c);if(k>=0)use.splice(k,1)}}}}
 /* a line of letters (>=3 specks on one baseline) near the top/bottom edge, even when it nearly touches the picture */
 {const cand=use.filter(c=>c!==main&&(c.y1-c.y0+1)<=R*.12&&(c.x1-c.x0+1)<=(c.y1-c.y0+1)*1.8&&(c.y0<ly0+nh*.22||c.y1>ly1-nh*.22));
  let best=null;for(const c of cand){const ln=cand.filter(o=>Math.abs(o.y1-c.y1)<=3);if(ln.length>=2&&(!best||ln.length>best.length))best=ln}
  if(best){const m=best.reduce((s,c)=>s+c.a,0),bx0=Math.min(...best.map(c=>c.x0)),bx1=Math.max(...best.map(c=>c.x1)),by0=Math.min(...best.map(c=>c.y0)),by1=Math.max(...best.map(c=>c.y1));
   if(m<big*.4&&bx1-bx0>=(by1-by0)*1.0){const hh=by1-by0+1;for(let k=use.length-1;k>=0;k--){const c=use[k];if(c===main)continue;if(c.cx>=bx0-hh*.8&&c.cx<=bx1+hh*.8&&c.cy>=by0-5&&c.cy<=by1+hh*.5)use.splice(k,1)}}}}
 /* a lone wide speck entirely above/below the picture at the zone edge = a stray word */
 for(let k=use.length-1;k>=0;k--){const c=use[k];if(c===main)continue;const cw=c.x1-c.x0+1,chh=c.y1-c.y0+1;if(c.a<big*.1&&cw>=chh*1.2&&chh<=R*.14&&((c.y1<main.y0+4&&c.y0<ly0+nh*.22)||(c.y0>main.y1-4&&c.y1>ly1-nh*.22)))use.splice(k,1)}
 const keep=new Set(use.map(u=>u.id)),km=new Uint8Array(N);for(let p=0;p<N;p++)if(keep.has(icc.lab[p]))km[p]=1;
 const rr=Math.max(4,Math.round(R*.012)),reg=sgDil(km,w,h,rr,rr),bar=sgDil(km,w,h,2,2),outside=new Uint8Array(N),st=[],push=q=>{if(!bar[q]&&!outside[q]){outside[q]=1;st.push(q)}};
 for(let x=0;x<w;x++){push(x);push((h-1)*w+x)}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1)}
 while(st.length){const p=st.pop(),x=p%w,y=(p-x)/w;if(x>0)push(p-1);if(x<w-1)push(p+1);if(y>0)push(p-w);if(y<h-1)push(p+w)}
 const near=sgDil(outside,w,h,3,3),o=new Uint8ClampedArray(N*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const q=y*w+x,s=at(x,y),t=q*4;if(outside[q])continue;if(!reg[q]&&!km[q]&&near[q])continue;let a=1;const ds=sgDist(d,s,bg);if(near[q])a=Math.max(0,Math.min(1,(ds-8)/26));if(a<=0)continue;for(let k=0;k<3;k++){const v=a<1?bg[k]+(d[s+k]-bg[k])/a:d[s+k];o[t+k]=v<0?0:v>255?255:v}o[t+3]=Math.round(a*255)}
 let x0=w,y0=h,x1=-1,y1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(o[(y*w+x)*4+3]>10){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
 if(x1<0)return null;x0=Math.max(0,x0-1);y0=Math.max(0,y0-1);x1=Math.min(w-1,x1+1);y1=Math.min(h-1,y1+1);
 const b=Math.max(0,bpx|0),cw=x1-x0+1,ch=y1-y0+1,pw=cw+2*b,ph=ch+2*b,out=new Uint8ClampedArray(pw*ph*4),m=new Uint8Array(pw*ph);
 for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const s=((y+y0)*w+x+x0)*4,t=((y+b)*pw+x+b)*4;out[t]=o[s];out[t+1]=o[s+1];out[t+2]=o[s+2];out[t+3]=o[s+3];if(o[s+3]>10)m[(y+b)*pw+x+b]=1}
 if(b>0){const dm=sgDil(m,pw,ph,b,b);for(let p=0;p<pw*ph;p++)if(dm[p]){const t=p*4,a=out[t+3];if(a<255){out[t]=(out[t]*a+255*(255-a))/255;out[t+1]=(out[t+1]*a+255*(255-a))/255;out[t+2]=(out[t+2]*a+255*(255-a))/255;out[t+3]=255}}}
 return{w:pw,h:ph,data:out}}
/* caption zone -> tight crop around the text (for OCR) */
function sgWordCrop(d,W,H,rc,bg){const ins=5,X0=Math.max(0,Math.round(rc[0])+ins),Y0=Math.max(0,Math.round(rc[1])+ins),X1=Math.min(W-1,Math.round(rc[2])-ins),Y1=Math.min(H-1,Math.round(rc[3])-ins),w=X1-X0+1,h=Y1-Y0+1;if(w<10||h<8)return null;
 let a0=w,b0=h,a1=-1,b1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=((y+Y0)*W+x+X0)*4;if(sgDist(d,i,bg)>70&&.3*d[i]+.59*d[i+1]+.11*d[i+2]<130){if(x<a0)a0=x;if(x>a1)a1=x;if(y<b0)b0=y;if(y>b1)b1=y}}
 if(a1>=0){/* keep only the biggest text row-band (drops the bottom of the picture above the caption) */
  const pr=new Int32Array(h);for(let y=b0;y<=b1;y++)for(let x=0;x<w;x++){const i=((y+Y0)*W+x+X0)*4;if(sgDist(d,i,bg)>70&&.3*d[i]+.59*d[i+1]+.11*d[i+2]<130)pr[y]++}
  const bd=[];let cur=null,gp=0;for(let y=b0;y<=b1;y++){if(pr[y]>0){if(!cur){cur={y0:y,y1:y,m:0};bd.push(cur)}cur.y1=y;cur.m+=pr[y];gp=0}else if(cur&&++gp>Math.max(2,h*.08))cur=null}
  if(bd.length>1){const bb=bd.reduce((p,q)=>q.m>p.m?q:p);b0=bb.y0;b1=bb.y1;a0=w;a1=-1;for(let y=b0;y<=b1;y++)for(let x=0;x<w;x++){const i=((y+Y0)*W+x+X0)*4;if(sgDist(d,i,bg)>70&&.3*d[i]+.59*d[i+1]+.11*d[i+2]<130){if(x<a0)a0=x;if(x>a1)a1=x}}}}
 if(a1<0||a1-a0<4||b1-b0<4){a0=0;b0=0;a1=w-1;b1=h-1}
 const P=6;a0=Math.max(0,a0-P);b0=Math.max(0,b0-P);a1=Math.min(w-1,a1+P);b1=Math.min(h-1,b1+P);const cw=a1-a0+1,ch=b1-b0+1,o=new Uint8ClampedArray(cw*ch*4);
 for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const s=((y+b0+Y0)*W+x+a0+X0)*4,t=(y*cw+x)*4;o[t]=d[s];o[t+1]=d[s+1];o[t+2]=d[s+2];o[t+3]=255}
 return{w:cw,h:ch,data:o}}
function sgTplCut(Sx,t){const G=sgTplGeo(Sx,t),bg=G.lines.bg,res=[];for(const c of G.cells){const hw=c.word[3]-c.word[1]>10,ic=sgCellCut(Sx.data,Sx.W,Sx.H,c.icon,bg,t.border==null?3:t.border,{ex:t.overflow===false?0:(t.ex==null?.3:t.ex),wpos:t.wordPos,hasWord:hw,lines:G.lines});if(!ic)continue;res.push({row:c.r,col:c.c,icon:ic,label:sgWordCrop(Sx.data,Sx.W,Sx.H,c.word,bg)})}return{cols:t.cols,rows:t.rows,cells:res,geo:G}}

/* ---- v35 UI: saved templates, auto-match on upload, guide editor ---- */
const TPL_BUILTIN=[{name:'Grid 4×4 · word below',cols:4,rows:4,wordPos:'below',wordFrac:.24,border:3,m:{l:.029,t:.055,r:.029,b:.042},gridAspect:.78,pageAspect:.7465,builtin:true}];
const tplUser=()=>{try{return JSON.parse(localStorage.getItem('sgTpls')||'[]')}catch(e){return[]}};
const tplAll=()=>tplUser().concat(TPL_BUILTIN);
function sgTplMatch(){const L=SG.lines||(SG.lines=sgLines(SG.data,SG.W,SG.H));
 for(const t of tplAll()){
  if(t.useLines!==false&&L.v.length>=2&&L.h.length>=2){const x0=L.v[0].p,y0=L.h[0].p,gw=L.v[L.v.length-1].p-x0,gh=L.h[L.h.length-1].p-y0;if(!gh||Math.abs(gw/gh/t.gridAspect-1)>.08)continue;
   const pw=gw/t.cols,ph=gh/t.rows;let mv=0,mh=0;for(let i=0;i<=t.cols;i++){const e=x0+pw*i;if(L.v.some(l=>Math.abs(l.p-e)<=pw*.06))mv++}for(let i=0;i<=t.rows;i++){const e=y0+ph*i;if(L.h.some(l=>Math.abs(l.p-e)<=ph*.06))mh++}
   if(mv>=t.cols+1&&mh>=Math.ceil((t.rows+1)*.8))return JSON.parse(JSON.stringify(t))}
  else if(t.useLines===false&&Math.abs(SG.W/SG.H/t.pageAspect-1)<.03)return JSON.parse(JSON.stringify(t))}
 return null}
async function sgTplRun(){await new Promise(r=>setTimeout(r,30));const t=SG.tpl;let R;
 try{R=sgTplCut(SG,t)}catch(e){console.error(e);R=null}
 if(!R||!R.cells.length){toast('No pictures found in the template cells. Auto cut is used instead (or adjust the guide)');SG.tpl=null;SG.noTpl=true;return _sgRun35()}
 SG.gc=R.cols;SG.gr=R.rows;SG.mode='tpl';SG.cols=0;SG.rows=0;
 SG.cells=R.cells.map((c,k)=>({n:c.row*R.cols+c.col,icon:sgCv(c.icon,512),label:c.label?sgCv(c.label,1000).toDataURL('image/png'):'',name:S.items[k]?S.items[k].o:'',src:'order'}));
 SG.ai='';sgRender();if(R.cells.every(c=>!c.label)){toast('No word zone. Type the words in the boxes');return}if(SG.cells.length)sgOCR(true)}
const _sgRun35=sgRun;
/* no saved template fits, but the sheet has drawn grid lines -> cut along those lines (a frame of lines would otherwise be read as one huge picture) */
function sgTplFromLines(){const L=SG.lines||(SG.lines=sgLines(SG.data,SG.W,SG.H));if(L.v.length<2||L.h.length<2)return null;
 const gw=L.v[L.v.length-1].p-L.v[0].p,gh=L.h[L.h.length-1].p-L.h[0].p;if(gw<SG.W*.4||gh<SG.H*.3)return null;
 const sp=a=>{const d=[];for(let i=1;i<a.length;i++)d.push(a[i].p-a[i-1].p);return d},dv=sp(L.v),dh=sp(L.h),mv=Math.max(...dv),mh=Math.max(...dh);
 const cols=Math.max(1,Math.min(12,Math.round(gw/mv))),rows=Math.max(1,Math.min(12,Math.round(gh/mh)));
 return{name:'Grid lines found',cols,rows,wordPos:'below',wordFrac:.24,border:3,useLines:true,m:{l:L.v[0].p/SG.W,t:L.h[0].p/SG.H,r:1-L.v[L.v.length-1].p/SG.W,b:1-L.h[L.h.length-1].p/SG.H}}}
sgRun=async function(){if(SG&&SG.tpl===undefined){SG.tpl=null;if(!SG.noTpl){try{SG.tpl=sgTplMatch()}catch(e){console.error(e)}if(!SG.tpl){try{SG.tpl=sgTplFromLines()}catch(e){console.error(e)}}}}if(SG.tpl)return sgTplRun();return _sgRun35()};
const _sgRe35=sgRe;
sgRe=function(){if(SG.tpl){SG.tpl.cols=+$('sgc').value||SG.tpl.cols;SG.tpl.rows=+$('sgr').value||SG.tpl.rows;toast('Cutting again with the template…');SG.ai='';sgRun()}else _sgRe35()};
function sgNoTpl(){SG.tpl=null;SG.noTpl=true;SG.ai='';toast('Auto cutting…');sgRun()}
const _sgRender35=sgRender;
sgRender=function(){_sgRender35();try{const h=$('qd').querySelector('.bdlg h3');if(!h)return;
 h.insertAdjacentHTML('afterend',SG.tpl?`<div class="sgw ok">📐 Cut with template <b>${esc(SG.tpl.name||'guide')}</b> (${SG.tpl.cols}×${SG.tpl.rows}) · transparent + white edge ${SG.tpl.border==null?3:SG.tpl.border}px <button class="btn" onclick="sgGuide()">📐 Adjust guide</button> <button class="btn" onclick="sgNoTpl()">Auto cut</button></div>`:`<div class="sgr"><button class="btn" onclick="sgGuide()">📐 Template guide</button></div>`)}catch(e){}};
document.head.insertAdjacentHTML('beforeend','<style>#tpcv{touch-action:none;border:1px solid #cfd6df;border-radius:8px;background:#fff;display:block;margin:6px 0}.sgr input[type=range]{width:110px}.tpm{display:grid;grid-template-columns:repeat(4,auto);gap:4px 10px;font-size:12px}</style>');
function sgGuide(){const t=SG.tpl||(()=>{const c=JSON.parse(JSON.stringify(tplAll()[0]));c.name='';return c})();SG.tpl=t;if(t.autoWord===undefined)t.autoWord=true;if(t.useLines===undefined)t.useLines=true;
 const L=SG.lines||(SG.lines=sgLines(SG.data,SG.W,SG.H)),found=L.v.length>=2&&L.h.length>=2,pc=v=>Math.round((v||0)*100);
 if(!SG.cv){const c=document.createElement('canvas');c.width=SG.W;c.height=SG.H;c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(SG.data),SG.W,SG.H),0,0);SG.cv=c}
 const us=tplUser();
 $('qd').innerHTML=`<div class="bdlg" style="max-width:780px"><h3>📐 Template guide</h3>
<p style="font-size:12px;opacity:.75;margin:2px 0">blue frame = grid · <span style="color:#16a34a">green dashes = picture zone (cut out)</span> · <span style="color:#d97706">orange = word zone (read)</span> · purple = grid lines found</p>
<div class="sgr">Template <select id="tpsel" onchange="sgGuideLoad(this.value)"><option value="">— saved templates —</option>${tplAll().map((x,i)=>`<option value="${i}">${esc(x.name)}${x.builtin?' (built-in)':''}</option>`).join('')}</select>${us.length?' <button class="btn" onclick="sgGuideDel()" title="Delete the chosen template">🗑</button>':''}</div>
<div class="sgr"><b>Drag the lines</b> <small>Blue edge = grid · middle lines = columns/rows · orange line = picture/word split (drag one row to move that row)</small></div><div class="sgr"><label><input type="checkbox" id="tpk"> Move the picture/word line in every row</label> Zoom <input type="range" id="tpz" min="100" max="300" value="100" oninput="sgGuideDraw()"> <b id="tpzv">100%</b> <button class="btn" onclick="sgGuideReset()">↺ Reset to auto</button></div><div id="tpbox" style="overflow:auto;max-height:62vh;border-radius:8px"><canvas id="tpcv"></canvas></div>
<div class="sgr">Columns <input type="number" id="tpc" min="1" max="12" value="${t.cols}" oninput="sgGuideChg()"> Rows <input type="number" id="tpr" min="1" max="12" value="${t.rows}" oninput="sgGuideChg()"> Word <select id="tpw" onchange="sgGuideChg()"><option value="below"${t.wordPos!='above'?' selected':''}>below</option><option value="above"${t.wordPos=='above'?' selected':''}>above</option></select> Word zone <input type="range" id="tpf" min="0" max="45" value="${pc(t.wordFrac)}" oninput="sgGuideChg('f')"> <b id="tpfv">${pc(t.wordFrac)}%</b></div>
<div class="sgr"><label><input type="checkbox" id="tpo" ${t.overflow!==false?'checked':''} onchange="sgGuideChg()"> Let pictures go past the guide (cut along the real edge)</label> Overflow <input type="range" id="tpx" min="5" max="60" value="${Math.round((t.ex==null?.3:t.ex)*100)}" oninput="sgGuideChg()"> <b id="tpxv"></b>%</div>
<div class="sgr"><small>No words under the pictures? Set "Word zone" to 0: the whole cell is the picture and no words are read (type them later)</small></div>
<div class="sgr"><label><input type="checkbox" id="tpa" ${t.autoWord!==false?'checked':''} onchange="sgGuideChg()"> Find the caption band automatically</label></div>
<div class="sgr"><label><input type="checkbox" id="tpl" ${t.useLines!==false&&found?'checked':''} ${found?'':'disabled'} onchange="sgGuideChg()"> Use the grid lines found</label> <small>${found?'✓ Grid lines found: '+L.v.length+'×'+L.h.length+' lines':'No grid lines found. Using the margins below'}</small></div>
<div class="tpm"><span>Left <b id="tpv1"></b></span><input type="range" id="tpm1" min="0" max="30" step=".5" value="${(t.m.l*100).toFixed(1)}" oninput="sgGuideChg()"><span>Top <b id="tpv2"></b></span><input type="range" id="tpm2" min="0" max="40" step=".5" value="${(t.m.t*100).toFixed(1)}" oninput="sgGuideChg()"><span>Right <b id="tpv3"></b></span><input type="range" id="tpm3" min="0" max="30" step=".5" value="${(t.m.r*100).toFixed(1)}" oninput="sgGuideChg()"><span>Bottom <b id="tpv4"></b></span><input type="range" id="tpm4" min="0" max="40" step=".5" value="${(t.m.b*100).toFixed(1)}" oninput="sgGuideChg()"></div>
<div class="sgr">White edge <input type="range" id="tpb" min="0" max="12" value="${t.border==null?3:t.border}" oninput="sgGuideChg()"> <b id="tpbv"></b> px <small>(keeps the edge of the picture)</small></div>
<div class="sgr">Template name <input id="tpn" value="${esc(t.name||'')}" placeholder="e.g. School things 4×4" style="width:200px"> <button class="btn" onclick="sgGuideSave()">💾 Save template</button></div>
<div class="seg" style="flex-wrap:wrap"><button class="btn p" onclick="sgGuideGo()">✂ Cut with guide</button><button class="btn" onclick="sgGuideBack()">← Back</button></div></div>`;$('qd').hidden=false;sgGuideChg()}
function sgGuideRead(why){const t=SG.tpl,g=id=>$(id);const oc=t.cols,or=t.rows;t.cols=Math.max(1,Math.min(12,+g('tpc').value||1));t.rows=Math.max(1,Math.min(12,+g('tpr').value||1));t.wordPos=g('tpw').value;t.wordFrac=+g('tpf').value/100;t.autoWord=g('tpa').checked;t.overflow=g('tpo').checked;t.ex=+g('tpx').value/100;g('tpxv').textContent=g('tpx').value;t.useLines=g('tpl').checked;t.m={l:+g('tpm1').value/100,t:+g('tpm2').value/100,r:+g('tpm3').value/100,b:+g('tpm4').value/100};t.border=+g('tpb').value;t.name=g('tpn').value;if(t.cols!=oc||t.rows!=or){t.rx=t.ry=t.rwf=null}if(why=='f')t.rwf=null;
 g('tpfv').textContent=Math.round(t.wordFrac*100)+'%';g('tpbv').textContent=t.border;[1,2,3,4].forEach(i=>g('tpv'+i).textContent=(+g('tpm'+i).value).toFixed(1)+'%')}
function sgGuideChg(why){if(!SG||!SG.tpl||!$('tpcv'))return;sgGuideRead(why);sgGuideDraw()}
function sgGuideHandles(G,t){const h=[];h.push({k:'L',o:'v',p:G.x0,s:G.y0,e:G.y1},{k:'R',o:'v',p:G.x1,s:G.y0,e:G.y1},{k:'T',o:'h',p:G.y0,s:G.x0,e:G.x1},{k:'B',o:'h',p:G.y1,s:G.x0,e:G.x1});
 for(let i=1;i<t.cols;i++)h.push({k:'c',i,o:'v',p:G.vs[i],s:G.y0,e:G.y1});for(let i=1;i<t.rows;i++)h.push({k:'r',i,o:'h',p:G.hs[i],s:G.x0,e:G.x1});
 for(const c of G.cells)h.push({k:'w',r:c.r,o:'h',p:t.wordPos=='above'?c.icon[1]:c.icon[3],s:c.box[0],e:c.box[2]});return h}
function sgGuideDraw(){const t=SG.tpl,cv=$('tpcv'),W=SG.W,H=SG.H,z=+($('tpz')?$('tpz').value:100)/100;if($('tpzv'))$('tpzv').textContent=Math.round(z*100)+'%';const bw=($('tpbox')&&$('tpbox').clientWidth)||740,q=Math.min(1,(bw-2)/W)*z,w=Math.round(W*q),h=Math.round(H*q);cv.width=w;cv.height=h;cv.style.width=w+'px';cv.style.height=h+'px';SG.gq=q;const g=cv.getContext('2d');g.drawImage(SG.cv,0,0,w,h);const G=sgTplGeo(SG,t);SG.gG=G;
 if(G.fromLines){g.strokeStyle='rgba(192,38,211,.55)';g.lineWidth=1;for(const l of G.lines.v){g.beginPath();g.moveTo(l.p*q,l.s*q);g.lineTo(l.p*q,l.e*q);g.stroke()}for(const l of G.lines.h){g.beginPath();g.moveTo(l.s*q,l.p*q);g.lineTo(l.e*q,l.p*q);g.stroke()}}
 for(const c of G.cells){const z0=c.word;g.fillStyle='rgba(245,158,11,.28)';g.fillRect(z0[0]*q,z0[1]*q,(z0[2]-z0[0])*q,(z0[3]-z0[1])*q);const i=c.icon;g.strokeStyle='#16a34a';g.lineWidth=1.5;g.setLineDash([5,3]);g.strokeRect(i[0]*q,i[1]*q,(i[2]-i[0])*q,(i[3]-i[1])*q);g.setLineDash([])}
 const col={L:'#2563eb',R:'#2563eb',T:'#2563eb',B:'#2563eb',c:'#0891b2',r:'#0891b2',w:'#ea580c'};
 for(const hd of sgGuideHandles(G,t)){g.strokeStyle=col[hd.k];g.lineWidth=hd.k=='w'?2:2.5;g.beginPath();if(hd.o=='v'){g.moveTo(hd.p*q,hd.s*q);g.lineTo(hd.p*q,hd.e*q)}else{g.moveTo(hd.s*q,hd.p*q);g.lineTo(hd.e*q,hd.p*q)}g.stroke();
  const mx=hd.o=='v'?hd.p*q:(hd.s+hd.e)/2*q,my=hd.o=='v'?(hd.s+hd.e)/2*q:hd.p*q;g.fillStyle='#fff';g.beginPath();g.arc(mx,my,6,0,7);g.fill();g.stroke()}
 if(!cv._ev){cv._ev=1;cv.addEventListener('pointerdown',sgGDown);cv.addEventListener('pointermove',sgGMove);cv.addEventListener('pointerup',sgGUp);cv.addEventListener('pointercancel',sgGUp)}}
function sgGPos(e){const r=$('tpcv').getBoundingClientRect(),q=SG.gq;return{x:(e.clientX-r.left)*($('tpcv').width/r.width)/q,y:(e.clientY-r.top)*($('tpcv').height/r.height)/q}}
function sgGHit(x,y){const t=SG.tpl,q=SG.gq,tol=9/q;let best=null,bd=1e9;for(const h of sgGuideHandles(SG.gG,t)){const along=h.o=='v'?y:x,across=h.o=='v'?x:y;if(along<h.s-tol||along>h.e+tol)continue;let d=Math.abs(across-h.p);if(h.k=='w')d-=.5;if(d<=tol&&d<bd){bd=d;best=h}}return best}
function sgGFreeze(){const t=SG.tpl,G=SG.gG,W=SG.W,H=SG.H;t.useLines=false;t.m={l:G.x0/W,t:G.y0/H,r:1-G.x1/W,b:1-G.y1/H};t.rx=G.vs.map(v=>(v-G.x0)/(G.x1-G.x0));t.ry=G.hs.map(v=>(v-G.y0)/(G.y1-G.y0));
 t.rwf=[];for(let r=0;r<t.rows;r++){const c=G.cells.find(k=>k.r==r),h=c.box[3]-c.box[1];t.rwf.push(t.wordPos=='above'?(c.icon[1]-c.box[1])/h:(c.box[3]-c.icon[3])/h)}t.autoWord=false;sgGuideSync()}
function sgGuideSync(){const t=SG.tpl,g=id=>$(id);if(!g('tpl'))return;g('tpl').checked=!!t.useLines;g('tpa').checked=t.autoWord!==false;[['tpm1','l'],['tpm2','t'],['tpm3','r'],['tpm4','b']].forEach(([id,k])=>{g(id).value=(t.m[k]*100).toFixed(1);});g('tpf').value=Math.round((t.rwf&&t.rwf.length?t.rwf.reduce((a,b)=>a+b,0)/t.rwf.length:t.wordFrac)*100);[1,2,3,4].forEach(i=>g('tpv'+i).textContent=(+g('tpm'+i).value).toFixed(1)+'%');g('tpfv').textContent=g('tpf').value+'%'}
function sgGDown(e){if(!SG||!SG.gG)return;const p=sgGPos(e),h=sgGHit(p.x,p.y);if(!h)return;e.preventDefault();$('tpcv').setPointerCapture(e.pointerId);sgGFreeze();SG.gd=h;sgGuideDraw();SG.gd=sgGHit(p.x,p.y)||h}
function sgGMove(e){if(!SG||!SG.gG)return;const p=sgGPos(e);if(!SG.gd){const h=sgGHit(p.x,p.y);$('tpcv').style.cursor=h?(h.o=='v'?'ew-resize':'ns-resize'):'default';return}
 const t=SG.tpl,h=SG.gd,G=SG.gG,W=SG.W,H=SG.H,mn=.02;
 if(h.k=='L')t.m.l=Math.max(0,Math.min(1-t.m.r-.1,p.x/W));else if(h.k=='R')t.m.r=Math.max(0,Math.min(1-t.m.l-.1,1-p.x/W));else if(h.k=='T')t.m.t=Math.max(0,Math.min(1-t.m.b-.1,p.y/H));else if(h.k=='B')t.m.b=Math.max(0,Math.min(1-t.m.t-.1,1-p.y/H));
 else if(h.k=='c'){const v=(p.x-G.x0)/(G.x1-G.x0);t.rx[h.i]=Math.max(t.rx[h.i-1]+mn,Math.min(t.rx[h.i+1]-mn,v))}
 else if(h.k=='r'){const v=(p.y-G.y0)/(G.y1-G.y0);t.ry[h.i]=Math.max(t.ry[h.i-1]+mn,Math.min(t.ry[h.i+1]-mn,v))}
 else if(h.k=='w'){const rh=G.hs[h.r+1]-G.hs[h.r];let f=t.wordPos=='above'?(p.y-G.hs[h.r])/rh:(G.hs[h.r+1]-p.y)/rh;f=Math.max(.04,Math.min(.7,f));if($('tpk').checked)t.rwf=t.rwf.map(()=>f);else t.rwf[h.r]=f}
 sgGuideSync();sgGuideDraw()}
function sgGUp(e){if(SG)SG.gd=null;try{$('tpcv').releasePointerCapture(e.pointerId)}catch(_){}}
function sgGuideReset(){const t=SG.tpl;t.rx=t.ry=t.rwf=null;t.autoWord=true;t.useLines=!!(SG.lines&&SG.lines.v.length>=2&&SG.lines.h.length>=2);sgGuide()}
function sgGuideLoad(i){if(i==='')return;const t=JSON.parse(JSON.stringify(tplAll()[+i]));if(!t.builtin)t.name=t.name;SG.tpl=t;sgGuide()}
function sgGuideSave(){sgGuideRead();const t=SG.tpl,G=sgTplGeo(SG,t),W=SG.W,H=SG.H,l=tplUser();let nm=(t.name||'').trim()||('Template '+(l.length+1));const o=JSON.parse(JSON.stringify(t));o.name=nm;delete o.builtin;o.m={l:G.x0/W,t:G.y0/H,r:1-G.x1/W,b:1-G.y1/H};o.gridAspect=(G.x1-G.x0)/(G.y1-G.y0);o.pageAspect=W/H;{const Lf=SG.lines;if(Lf&&Lf.v.length>=2&&Lf.h.length>=2){const ok=Math.abs(Lf.v[0].p-G.x0)<W*.012&&Math.abs(Lf.v[Lf.v.length-1].p-G.x1)<W*.012&&Math.abs(Lf.h[0].p-G.y0)<H*.012&&Math.abs(Lf.h[Lf.h.length-1].p-G.y1)<H*.012;o.useLines=ok}}
 const k=l.findIndex(x=>x.name===nm);if(k>=0)l[k]=o;else l.unshift(o);try{localStorage.setItem('sgTpls',JSON.stringify(l));SG.tpl.name=nm;$('tpn').value=nm;toast('Template "'+nm+'" saved. Matching sheets will be cut with this guide automatically')}catch(e){toast('Could not save the template (browser storage blocked)')}}
function sgGuideDel(){const i=$('tpsel').value;if(i===''){toast('Choose a template to delete first');return}const a=tplAll()[+i];if(a.builtin){toast('The built-in template cannot be deleted');return}const l=tplUser().filter(x=>x.name!==a.name);try{localStorage.setItem('sgTpls',JSON.stringify(l))}catch(e){}toast('Deleted');sgGuide()}
function sgGuideGo(){sgGuideRead();SG.noTpl=false;SG.ai='';toast('Cutting with the guide…');sgRun()}
function sgGuideBack(){if(SG.cells&&SG.cells.length)sgRender();else{SG.tpl=null;SG.noTpl=true;sgRun()}}
/* ---- Vocab Set Creator hook-up: overlay, styles, file picker, window.CUT ---- */
document.head.insertAdjacentHTML('beforeend',`<style>
#qd{--card:var(--paper,#fff);--mut:var(--muted,#6b7280);--pri:var(--p6,#0d9488);position:fixed;inset:0;background:rgba(15,23,42,.5);display:flex;align-items:flex-start;justify-content:center;padding:max(10px,env(safe-area-inset-top)) 10px 10px;overflow:auto;z-index:80;-webkit-overflow-scrolling:touch}
#qd[hidden]{display:none}body.sgopen{overflow:hidden}
#qd .bdlg{position:relative;background:var(--card);color:var(--ink,#111827);border-radius:18px;padding:16px 14px;max-width:560px;width:100%;font-size:14px}
#qd .bdlg h3{margin:0 36px 8px 0;font-size:18px}#qd .sgx{position:absolute;right:10px;top:10px;width:40px;height:40px;border-radius:12px;border:1px solid var(--line);background:var(--card);font-size:16px;cursor:pointer}
#qd .btn{border:1px solid var(--line);background:var(--card);color:inherit;border-radius:12px;padding:8px 12px;font:inherit;font-weight:700;cursor:pointer;min-height:44px}
#qd .btn.p{background:var(--pri);color:#fff;border-color:var(--pri)}
#qd .seg{display:flex;gap:8px;margin-top:10px}#qd .note{font-size:12px;color:var(--mut);margin:6px 0}
#qd .sgr{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}#qd .sgr input[type=number]{width:58px;min-height:40px;font:inherit;border:1px solid var(--line);border-radius:8px;padding:4px 6px}
#qd .sgr label,#qd label.opt{display:inline-flex;gap:6px;align-items:center}#qd label.opt{display:flex;margin:4px 0}#qd input[type=checkbox]{width:20px;height:20px;accent-color:var(--pri)}
#qd .sgr select,#qd #tpn{min-height:40px;font:inherit;border:1px solid var(--line);border-radius:8px;padding:4px 6px;background:var(--card)}
#qd .sgw{background:#fff7ed;color:#7c2d12;border:1px solid #fdba74;border-radius:10px;padding:8px 10px;font-size:13px;margin:6px 0;display:flex;flex-wrap:wrap;gap:6px;align-items:center}#qd .sgw.ok{background:#ecfdf5;color:#065f46;border-color:#6ee7b7}
#qd .bgrid{display:grid;gap:8px;margin:10px 0;grid-template-columns:repeat(auto-fill,minmax(100px,1fr))}
#qd .sgb{background:linear-gradient(45deg,#e9edf2 25%,transparent 25%,transparent 75%,#e9edf2 75%),linear-gradient(45deg,#e9edf2 25%,#fff 25%,#fff 75%,#e9edf2 75%);background-size:14px 14px;background-position:0 0,7px 7px;border-radius:8px}
#qd .sgc{border:1px solid var(--line);border-radius:10px;padding:4px;text-align:center;font-size:11px}#qd .sgc .sgb img{width:100%;aspect-ratio:1;object-fit:contain;display:block}
#qd .sgc .lb{display:block;height:20px;width:auto;object-fit:contain;max-width:100%;margin:3px auto 0;background:#fff;border-radius:4px}
#qd .sgc input:not([type]){width:100%;font:inherit;font-size:13px;padding:5px;margin-top:3px;border:2px solid var(--line);border-radius:8px;background:var(--card)}
#qd .sgc.mt input:not([type]){border-color:#22c55e}#qd .sgc.nw input:not([type]){border-color:#f59e0b}#qd .sgc.dup input:not([type]){border-color:#e11d48}
#qd .dot{display:inline-block;width:10px;height:10px;border-radius:3px;vertical-align:-1px}#qd .dot.mt{background:#22c55e}#qd .dot.nw{background:#f59e0b}
#qd .sgn{display:inline-block;background:#e8f0fe;color:#1e3a8a;border-radius:6px;padding:0 5px;font-weight:700}
#qd .sgc .tk{display:flex;align-items:center;justify-content:center;gap:6px;margin:0 0 2px;cursor:pointer}#qd .sgc .tk input{width:22px;height:22px}
#qd .sgc.off{opacity:.38}#qd .sgc.off .sgb{filter:grayscale(1)}#qd .sel .btn{min-height:40px;padding:6px 10px}
#qd #tpcv{touch-action:none;border:1px solid #cfd6df;border-radius:8px;background:#fff;display:block;margin:6px 0}#qd .sgr input[type=range]{width:110px}
#qd .tpm{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;font-size:12px;align-items:center}
@media(min-width:744px){#qd .bgrid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}#qd .tpm{grid-template-columns:repeat(4,auto)}#qd{padding:24px}}
</style>`);
(function(){const d=document.createElement('div');d.id='qd';d.hidden=true;document.body.appendChild(d);
 d.addEventListener('click',e=>{if(e.target===d)sgClose()});
 const f=document.createElement('input');f.type='file';f.accept='image/*';f.hidden=true;f.id='sgf';document.body.appendChild(f);f.onchange=()=>{sgFile(f.files[0]);f.value=''};
 window.CUT=Object.assign(window.CUT||{},{pick(){f.click()},file:sgFile});})();
