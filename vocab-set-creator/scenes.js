/* Bokogo built-in story scenes (Picture Story R7): 10 drawn pictures, 400×260, shared by the Stories editor and the worksheets.
   window.SCENES[id] = {e: emoji, l: label, alt: what is in the picture, svg} */
(function(){
// a child: head centre (x,y); o = {s: skin, h: hair, t: top, p: trousers/legs, g: girl (pigtails), sm: smile, arm: 'up'|'out'|''}
const kid=(x,y,o={})=>{const s=o.s||'#F8D9BF',h=o.h||'#5B3A1E',t=o.t||'#60A5FA',p=o.p||'#1E3A8A';
 return `<g><circle cx="${x}" cy="${y}" r="15" fill="${s}"/><path d="M${x-15} ${y-2}c0-14 7-19 15-19s16 6 16 19c-5-5-9-7-16-7s-10 2-15 7z" fill="${h}"/>${o.g?`<path d="M${x-15} ${y-4}l-6 20M${x+15} ${y-4}l6 20" stroke="${h}" stroke-width="5" stroke-linecap="round"/>`:''}
<circle cx="${x-5}" cy="${y+1}" r="2" fill="#222"/><circle cx="${x+5}" cy="${y+1}" r="2" fill="#222"/><path d="M${x-5} ${y+7}q5 4 10 0" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round"/>
<rect x="${x-14}" y="${y+14}" width="28" height="36" rx="9" fill="${t}"/>${o.g?`<path d="M${x-16} ${y+40}h32l-4 10h-24z" fill="${t}"/>`:''}<rect x="${x-11}" y="${y+50}" width="9" height="22" fill="${p}"/><rect x="${x+2}" y="${y+50}" width="9" height="22" fill="${p}"/>
${o.arm==='up'?`<path d="M${x+13} ${y+20}l12-18" stroke="${s}" stroke-width="7" stroke-linecap="round"/>`:o.arm==='out'?`<path d="M${x+13} ${y+24}l18 4" stroke="${s}" stroke-width="7" stroke-linecap="round"/>`:''}</g>`};
const adult=(x,y,o={})=>{const s=o.s||'#E9B98F',h=o.h||'#3B2A1A',t=o.t||'#0D9488',p=o.p||'#374151';
 return `<g><circle cx="${x}" cy="${y}" r="17" fill="${s}"/><path d="M${x-17} ${y-2}c0-16 8-22 17-22s18 7 18 22c-6-6-10-8-18-8s-11 2-17 8z" fill="${h}"/>${o.g?`<path d="M${x-17} ${y-4}q-4 18 2 26M${x+17} ${y-4}q4 18-2 26" stroke="${h}" stroke-width="6" fill="none" stroke-linecap="round"/>`:''}
<circle cx="${x-6}" cy="${y+1}" r="2.2" fill="#222"/><circle cx="${x+6}" cy="${y+1}" r="2.2" fill="#222"/><path d="M${x-5} ${y+8}q5 4 10 0" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round"/>
<rect x="${x-17}" y="${y+16}" width="34" height="48" rx="10" fill="${t}"/><rect x="${x-13}" y="${y+64}" width="11" height="30" fill="${p}"/><rect x="${x+2}" y="${y+64}" width="11" height="30" fill="${p}"/></g>`};
const svg=(alt,body)=>`<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${alt}">${body}</svg>`;
const S={};
S.kitchen={e:'🍳',l:'Kitchen',alt:'A mom cooking dinner, two children at the table, dad at the office',svg:svg('A mom cooking dinner, two children at the table, dad at the office',`
<rect width="400" height="260" fill="#FDF1DC"/><rect y="196" width="400" height="64" fill="#E7C9A0"/><path d="M0 196h400" stroke="#C9A27A" stroke-width="3"/>
<rect x="24" y="34" width="92" height="74" rx="6" fill="#BFE3F5" stroke="#fff" stroke-width="6"/><path d="M70 34v74M24 71h92" stroke="#fff" stroke-width="4"/><circle cx="96" cy="52" r="9" fill="#FFD66B"/>
<circle cx="168" cy="40" r="17" fill="#fff" stroke="#8B5A2B" stroke-width="4"/><path d="M168 40v-10M168 40l8 5" stroke="#333" stroke-width="3" stroke-linecap="round"/>
<rect x="30" y="140" width="110" height="56" rx="4" fill="#9CA3AF"/><circle cx="58" cy="168" r="11" fill="#4B5563"/><circle cx="110" cy="168" r="11" fill="#4B5563"/><rect x="48" y="120" width="46" height="20" rx="4" fill="#EF4444"/><path d="M60 112q4-8 0-14M74 112q4-8 0-14" stroke="#CBD5E1" stroke-width="3" fill="none" stroke-linecap="round"/>
${adult(150,112,{g:1,t:'#10B981',h:'#5B3A1E'})}<path d="M132 140l-26-14" stroke="#E9B98F" stroke-width="7" stroke-linecap="round"/>
<rect x="232" y="164" width="140" height="10" rx="3" fill="#8B5A2B"/><rect x="242" y="174" width="8" height="32" fill="#8B5A2B"/><rect x="354" y="174" width="8" height="32" fill="#8B5A2B"/>
${kid(268,126,{g:1,t:'#FACC15',p:'#FACC15'})}${kid(332,126,{t:'#60A5FA'})}<ellipse cx="300" cy="162" rx="16" ry="5" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>
<g><rect x="262" y="24" width="120" height="74" rx="14" fill="#fff" stroke="#CBD5E1" stroke-width="3"/><circle cx="252" cy="104" r="5" fill="#fff" stroke="#CBD5E1" stroke-width="2"/><svg x="264" y="26" width="116" height="70">${adult(32,26,{t:'#1E3A8A'})}<rect x="58" y="30" width="44" height="30" rx="3" fill="#374151"/><rect x="62" y="34" width="36" height="22" fill="#93C5FD"/><rect x="52" y="60" width="60" height="6" fill="#8B5A2B"/></svg></g>`)};
S.park={e:'🌳',l:'Park',alt:'A boy with an ice cream and a dog running after a red ball in the park',svg:svg('A boy with an ice cream and a dog running after a red ball in the park',`
<rect width="400" height="260" fill="#CDEFFF"/><circle cx="340" cy="48" r="26" fill="#FFD66B"/><path d="M40 60q14-14 30 0q14-10 26 2q-28 6-56-2z" fill="#fff"/>
<rect y="168" width="400" height="92" fill="#8BD48F"/><path d="M0 168q100-24 200 0t200 0v8H0z" fill="#6CC070"/>
<rect x="48" y="100" width="14" height="76" fill="#8B5A2B"/><circle cx="55" cy="86" r="38" fill="#3FA34D"/><circle cx="30" cy="104" r="22" fill="#3FA34D"/><circle cx="82" cy="102" r="24" fill="#3FA34D"/>
${kid(150,122,{t:'#10B981',arm:'up'})}<path d="M168 104l8 18 8-18z" fill="#E8B26A"/><circle cx="176" cy="98" r="9" fill="#F9A8D4"/>
<g><ellipse cx="268" cy="196" rx="30" ry="14" fill="#C68B5E"/><circle cx="296" cy="182" r="13" fill="#C68B5E"/><path d="M302 172l10-8 0 14z" fill="#8B5A2B"/><circle cx="300" cy="180" r="2" fill="#222"/>
<path d="M240 192q-14-10-10-22" stroke="#C68B5E" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M250 206l-8 14M262 208l-2 14M278 208l6 13M288 204l12 10" stroke="#C68B5E" stroke-width="6" stroke-linecap="round"/></g>
<circle cx="350" cy="214" r="12" fill="#E5534B"/><path d="M341 207q9 7 18 0" stroke="#fff" stroke-width="2" fill="none"/><path d="M318 198h10M318 206h14" stroke="#4B5563" stroke-width="2.5" stroke-linecap="round"/>`)};
S.rain={e:'🌧️',l:'Rain',alt:'Ben and Mia at a bus stop in the rain, Mia has a yellow umbrella',svg:svg('Ben and Mia at a bus stop in the rain, Mia has a yellow umbrella',`
<rect width="400" height="260" fill="#B8C4D6"/><path d="M30 40q18-18 40 0q18-14 34 2q20-12 36 4q-60 10-110-6z" fill="#8896AB"/><path d="M230 30q18-18 40 0q18-14 34 2q20-12 36 4q-60 10-110-6z" fill="#8896AB"/>
<g stroke="#E2E8F0" stroke-width="2" stroke-linecap="round">${Array.from({length:42},(_,i)=>`<path d="M${(i*37)%400} ${(i*53)%190+20}l-5 12"/>`).join('')}</g>
<rect y="200" width="400" height="60" fill="#6B7280"/><path d="M0 200h400" stroke="#9CA3AF" stroke-width="4"/>
<rect x="40" y="70" width="8" height="130" fill="#374151"/><rect x="200" y="70" width="8" height="130" fill="#374151"/><rect x="30" y="62" width="188" height="14" rx="3" fill="#0D9488"/>
<rect x="250" y="80" width="6" height="120" fill="#374151"/><rect x="236" y="62" width="34" height="26" rx="4" fill="#fff" stroke="#0D9488" stroke-width="3"/><text x="253" y="81" font-family="Arial" font-weight="700" font-size="14" text-anchor="middle" fill="#0D9488">BUS</text>
<rect x="60" y="168" width="130" height="8" rx="2" fill="#8B5A2B"/>
${kid(96,128,{h:'#222'})}<path d="M120 96q36-36 72 0z" fill="#FACC15"/><path d="M156 96v40" stroke="#374151" stroke-width="3"/>${kid(156,128,{g:1,s:'#E9B98F',t:'#F472B6',p:'#374151'})}
<g><rect x="290" y="150" width="104" height="44" rx="10" fill="#F59E0B"/><rect x="300" y="158" width="20" height="16" rx="3" fill="#BFE3F5"/><rect x="326" y="158" width="20" height="16" rx="3" fill="#BFE3F5"/><rect x="352" y="158" width="20" height="16" rx="3" fill="#BFE3F5"/><circle cx="312" cy="196" r="9" fill="#222"/><circle cx="372" cy="196" r="9" fill="#222"/></g>`)};
S.classroom={e:'🏫',l:'Classroom',alt:'A teacher points at the board with ABC and 123, two children sit at their desks with books',svg:svg('A teacher points at the board with ABC and 123, two children sit at their desks with books',`
<rect width="400" height="260" fill="#FEF3C7"/><rect y="200" width="400" height="60" fill="#D6B48A"/>
<rect x="30" y="28" width="210" height="112" rx="6" fill="#14532D" stroke="#8B5A2B" stroke-width="8"/><text x="60" y="78" font-family="Arial" font-weight="700" font-size="30" fill="#fff">ABC</text><text x="150" y="118" font-family="Arial" font-weight="700" font-size="26" fill="#FDE68A">1 2 3</text>
<rect x="272" y="30" width="54" height="54" rx="27" fill="#fff" stroke="#374151" stroke-width="4"/><path d="M299 57v-16M299 57l11 6" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
<rect x="342" y="26" width="40" height="60" fill="#93C5FD" stroke="#fff" stroke-width="4"/><path d="M362 26v60" stroke="#fff" stroke-width="3"/>
${adult(268,118,{g:1,t:'#7C3AED',h:'#222'})}<path d="M252 140l-22-26" stroke="#E9B98F" stroke-width="7" stroke-linecap="round"/>
${kid(110,170,{t:'#EF4444'})}${kid(200,170,{g:1,t:'#22C55E',h:'#B45309'})}
<rect x="80" y="200" width="60" height="10" rx="2" fill="#8B5A2B"/><rect x="170" y="200" width="60" height="10" rx="2" fill="#8B5A2B"/><rect x="92" y="190" width="24" height="12" fill="#3B82F6"/><rect x="186" y="190" width="24" height="12" fill="#F59E0B"/>
<rect x="320" y="150" width="60" height="50" rx="4" fill="#8B5A2B"/><circle cx="336" cy="140" r="10" fill="#EF4444"/><rect x="352" y="128" width="20" height="22" rx="3" fill="#FDE68A"/>`)};
S.market={e:'🛒',l:'Market',alt:'A girl buys fruit from a man at a market stall with apples, bananas and oranges',svg:svg('A girl buys fruit from a man at a market stall with apples, bananas and oranges',`
<rect width="400" height="260" fill="#E0F2FE"/><rect y="206" width="400" height="54" fill="#D1D5DB"/>
<path d="M150 40h230l-14 40H164z" fill="#EF4444"/><path d="M178 40l-6 40M210 40v40M242 40l6 40M274 40l10 40M306 40l14 40M338 40l18 40" stroke="#fff" stroke-width="10"/>
<rect x="166" y="80" width="6" height="126" fill="#8B5A2B"/><rect x="360" y="80" width="6" height="126" fill="#8B5A2B"/>
${adult(268,108,{t:'#2563EB',h:'#222'})}<rect x="160" y="150" width="214" height="56" rx="4" fill="#B45309"/>
<g>${[0,1,2,3].map(i=>`<circle cx="${184+i*16}" cy="146" r="9" fill="#DC2626"/>`).join('')}${[0,1,2].map(i=>`<path d="M${252+i*14} 150q6-18 14-16q-4 12-14 16z" fill="#FACC15" stroke="#CA8A04" stroke-width="1.5"/>`).join('')}${[0,1,2].map(i=>`<circle cx="${312+i*17}" cy="146" r="9" fill="#F97316"/>`).join('')}</g>
<text x="210" y="186" font-family="Arial" font-weight="700" font-size="14" fill="#fff">FRUIT</text>
${kid(80,140,{g:1,t:'#EC4899',h:'#5B3A1E',arm:'out'})}<path d="M44 176h24l-4 28H48z" fill="#FDE68A" stroke="#CA8A04" stroke-width="2"/><path d="M48 176q8-14 16 0" stroke="#CA8A04" stroke-width="2" fill="none"/>
<circle cx="40" cy="40" r="20" fill="#FFD66B"/>`)};
S.beach={e:'🏖️',l:'Beach',alt:'Two children build a sandcastle on the beach, a boat on the sea and the sun in the sky',svg:svg('Two children build a sandcastle on the beach, a boat on the sea and the sun in the sky',`
<rect width="400" height="260" fill="#BAE6FD"/><circle cx="330" cy="50" r="28" fill="#FDE047"/><rect y="110" width="400" height="70" fill="#38BDF8"/><path d="M0 120q20-6 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0" stroke="#E0F2FE" stroke-width="3" fill="none"/>
<path d="M0 170q200-30 400 0v90H0z" fill="#FDE68A"/>
<g><path d="M60 110h70l-12 14H72z" fill="#B45309"/><path d="M94 110V66l30 36z" fill="#fff"/><path d="M94 66v44" stroke="#374151" stroke-width="3"/></g>
<g><rect x="186" y="196" width="60" height="30" fill="#EAB308"/><rect x="196" y="176" width="40" height="22" fill="#EAB308"/><path d="M186 196v-8h8v8M206 176v-8h8v8M222 176v-8h8v8M238 196v-8h8v8" fill="#EAB308"/><rect x="210" y="208" width="12" height="18" rx="6" fill="#A16207"/><path d="M216 176v-20" stroke="#374151" stroke-width="2"/><path d="M216 156l14 5-14 5z" fill="#EF4444"/></g>
${kid(150,150,{t:'#F97316',p:'#F97316',s:'#E9B98F',h:'#222',arm:'out'})}${kid(286,150,{g:1,t:'#A855F7',p:'#A855F7'})}
<path d="M310 212l12-8h16v16h-16z" fill="#EF4444"/><path d="M332 196l4 8" stroke="#374151" stroke-width="3"/>
<circle cx="70" cy="226" r="10" fill="#F472B6"/><path d="M62 226h16M70 218v16" stroke="#fff" stroke-width="2"/>`)};
S.farm={e:'🐄',l:'Farm',alt:'A farmer and a boy on a farm with a red barn, a cow, a pig and a chicken',svg:svg('A farmer and a boy on a farm with a red barn, a cow, a pig and a chicken',`
<rect width="400" height="260" fill="#CDEFFF"/><circle cx="60" cy="44" r="22" fill="#FFD66B"/><rect y="150" width="400" height="110" fill="#86EFAC"/>
<g><path d="M250 70l60-36 60 36v80H250z" fill="#DC2626"/><path d="M250 70l60-36 60 36" stroke="#fff" stroke-width="6" fill="none"/><rect x="290" y="104" width="40" height="46" fill="#fff"/><path d="M290 104l40 46M330 104l-40 46" stroke="#DC2626" stroke-width="4"/></g>
<path d="M0 176h240M0 196h240" stroke="#B45309" stroke-width="5"/><path d="M20 168v40M80 168v40M140 168v40M200 168v40" stroke="#B45309" stroke-width="6"/>
<g><ellipse cx="80" cy="222" rx="40" ry="20" fill="#fff"/><circle cx="62" cy="216" r="8" fill="#222"/><circle cx="98" cy="226" r="9" fill="#222"/><rect x="118" y="200" width="26" height="24" rx="10" fill="#fff"/><ellipse cx="136" cy="222" rx="10" ry="7" fill="#F9A8D4"/><circle cx="126" cy="208" r="2.5" fill="#222"/><path d="M50 238v14M70 240v14M92 240v14M110 238v14" stroke="#fff" stroke-width="7"/></g>
<g><ellipse cx="200" cy="230" rx="24" ry="16" fill="#F9A8D4"/><circle cx="222" cy="224" r="10" fill="#F9A8D4"/><ellipse cx="230" cy="226" rx="4" ry="3" fill="#EC4899"/><circle cx="222" cy="220" r="2" fill="#222"/></g>
<g><ellipse cx="358" cy="226" rx="14" ry="11" fill="#fff"/><circle cx="370" cy="214" r="7" fill="#fff"/><path d="M376 214l6 2-6 3z" fill="#F59E0B"/><path d="M368 207l2-6 3 6z" fill="#EF4444"/></g>
${adult(190,96,{t:'#2563EB',h:'#92400E'})}<path d="M168 82h44l-6-12h-32z" fill="#FDE68A"/>${kid(236,124,{t:'#22C55E'})}`)};
S.zoo={e:'🦁',l:'Zoo',alt:'A family at the zoo looks at a lion, a giraffe and an elephant',svg:svg('A family at the zoo looks at a lion, a giraffe and an elephant',`
<rect width="400" height="260" fill="#DCFCE7"/><rect y="176" width="400" height="84" fill="#A3E635"/><path d="M0 176h400" stroke="#65A30D" stroke-width="3"/>
<g><rect x="282" y="20" width="14" height="96" fill="#F59E0B"/><ellipse cx="300" cy="20" rx="20" ry="11" fill="#F59E0B"/><rect x="262" y="104" width="54" height="40" rx="14" fill="#F59E0B"/><path d="M270 144v32M306 144v32" stroke="#F59E0B" stroke-width="8"/><circle cx="270" cy="118" r="5" fill="#B45309"/><circle cx="296" cy="128" r="6" fill="#B45309"/><circle cx="290" cy="60" r="4" fill="#B45309"/><circle cx="306" cy="18" r="2.4" fill="#222"/></g>
<g><circle cx="80" cy="132" r="30" fill="#D97706"/><circle cx="80" cy="134" r="18" fill="#FBBF24"/><circle cx="74" cy="130" r="2.4" fill="#222"/><circle cx="86" cy="130" r="2.4" fill="#222"/><path d="M76 140q4 4 8 0" stroke="#222" stroke-width="2" fill="none"/><rect x="96" y="140" width="54" height="30" rx="14" fill="#FBBF24"/><path d="M104 170v8M140 170v8" stroke="#FBBF24" stroke-width="8"/><path d="M150 150q14-4 12 12" stroke="#FBBF24" stroke-width="4" fill="none"/></g>
<g><ellipse cx="364" cy="146" rx="34" ry="26" fill="#9CA3AF"/><circle cx="336" cy="134" r="18" fill="#9CA3AF"/><path d="M322 140q-10 20 0 34" stroke="#9CA3AF" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="332" cy="128" r="2.4" fill="#222"/><path d="M346 166v12M378 166v12" stroke="#9CA3AF" stroke-width="10"/></g>
<path d="M0 182h400" stroke="#78350F" stroke-width="4"/>${[...Array(14)].map((_,i)=>`<path d="M${14+i*29} 176v30" stroke="#78350F" stroke-width="4"/>`).join('')}
${adult(160,150,{t:'#0EA5E9'})}${adult(230,150,{g:1,t:'#F43F5E',h:'#222'})}${kid(196,174,{t:'#FACC15',p:'#1E3A8A',arm:'up'})}`)};
S.bedroom={e:'🛏️',l:'Bedroom',alt:'A boy reads a book on his bed at night, a cat sleeps and the moon is in the window',svg:svg('A boy reads a book on his bed at night, a cat sleeps and the moon is in the window',`
<rect width="400" height="260" fill="#E0E7FF"/><rect y="210" width="400" height="50" fill="#C4B5FD"/>
<rect x="34" y="30" width="100" height="86" rx="6" fill="#1E3A8A" stroke="#fff" stroke-width="6"/><circle cx="96" cy="62" r="16" fill="#FDE68A"/><circle cx="104" cy="56" r="14" fill="#1E3A8A"/><circle cx="56" cy="50" r="2" fill="#fff"/><circle cx="70" cy="90" r="2" fill="#fff"/><circle cx="116" cy="96" r="2" fill="#fff"/>
<rect x="160" y="150" width="200" height="40" rx="6" fill="#60A5FA"/><rect x="160" y="120" width="20" height="90" rx="4" fill="#8B5A2B"/><rect x="340" y="140" width="20" height="70" rx="4" fill="#8B5A2B"/><rect x="184" y="132" width="44" height="22" rx="10" fill="#fff"/>
${kid(218,114,{t:'#F97316'})}<rect x="226" y="140" width="30" height="22" rx="2" fill="#22C55E"/><path d="M241 140v22" stroke="#fff" stroke-width="2"/><rect x="228" y="150" width="128" height="34" rx="10" fill="#93C5FD"/>
<g><ellipse cx="300" cy="226" rx="26" ry="12" fill="#F59E0B"/><circle cx="276" cy="220" r="11" fill="#F59E0B"/><path d="M268 212l2-8 6 6M280 210l4-7 3 8" fill="#F59E0B"/><path d="M272 222q3 2 6 0" stroke="#222" stroke-width="1.6" fill="none"/><text x="320" y="210" font-family="Arial" font-weight="700" font-size="14" fill="#6366F1">z z</text></g>
<rect x="40" y="150" width="70" height="60" rx="4" fill="#A78BFA"/><rect x="62" y="122" width="10" height="28" fill="#374151"/><path d="M50 122h34l-8-18H58z" fill="#FDE68A"/><rect x="40" y="176" width="70" height="4" fill="#7C3AED"/>`)};
S.birthday={e:'🎂',l:'Birthday',alt:'Children at a birthday party with a cake, candles, balloons and presents',svg:svg('Children at a birthday party with a cake, candles, balloons and presents',`
<rect width="400" height="260" fill="#FCE7F3"/><rect y="206" width="400" height="54" fill="#FBCFE8"/>
<path d="M0 20l40 22 40-22 40 22 40-22 40 22 40-22 40 22 40-22 40 22 40-22" stroke="#EC4899" stroke-width="3" fill="none"/>${[0,1,2,3,4,5,6,7,8,9].map(i=>`<path d="M${20+i*40} 30l-8 16h16z" fill="${['#F59E0B','#3B82F6','#22C55E','#EF4444'][i%4]}"/>`).join('')}
<g>${[[40,70,'#EF4444'],[70,58,'#3B82F6'],[100,74,'#FACC15']].map(([x,y,c])=>`<ellipse cx="${x}" cy="${y}" rx="15" ry="19" fill="${c}"/><path d="M${x} ${y+19}q-6 30 4 60" stroke="#6B7280" stroke-width="1.5" fill="none"/>`).join('')}</g>
<rect x="150" y="166" width="120" height="10" rx="3" fill="#8B5A2B"/><rect x="160" y="176" width="8" height="34" fill="#8B5A2B"/><rect x="252" y="176" width="8" height="34" fill="#8B5A2B"/>
<g><rect x="174" y="126" width="72" height="40" rx="6" fill="#F9A8D4"/><path d="M174 138q9 8 18 0t18 0t18 0t18 0" stroke="#fff" stroke-width="4" fill="none"/>${[0,1,2,3,4].map(i=>`<rect x="${184+i*13}" y="108" width="5" height="18" fill="#60A5FA"/><path d="M${186.5+i*13} 98q-4 6 0 10q4-4 0-10z" fill="#F59E0B"/>`).join('')}</g>
${kid(120,150,{g:1,t:'#A855F7',h:'#222'})}<path d="M108 136l12-30 12 30z" fill="#22C55E"/>${kid(300,150,{t:'#0EA5E9',arm:'up'})}<path d="M288 136l12-30 12 30z" fill="#F59E0B"/>
<g><rect x="330" y="200" width="34" height="28" fill="#22C55E"/><path d="M347 200v28M330 212h34" stroke="#FACC15" stroke-width="5"/><rect x="40" y="196" width="40" height="32" fill="#3B82F6"/><path d="M60 196v32M40 210h40" stroke="#F472B6" stroke-width="5"/></g>`)};
window.SCENES=S;window.SCENE_IDS=Object.keys(S);
})();
