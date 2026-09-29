const state={data:null,tab:'diagnose',problem:null,step:0,answers:[]};
const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=v=>String(v??'').trim();
const allText=o=>Object.values(o||{}).filter(v=>v!==null&&v!==undefined).join(' ').toLowerCase();
const tokens=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').split(/\s+/).filter(w=>w.length>2);

function scoreProblem(p,q){
  const qs=tokens(q); if(!qs.length)return 0;
  const fields=[p.problem,p.description,p.search,p.domain,p.causes,p.visual,p.confused_with];
  const hay=tokens(fields.join(' ')); const set=new Set(hay); let score=0;
  const exact=clean(q).toLowerCase();
  if(clean(p.problem).toLowerCase()===exact)score+=30;
  if(clean(p.problem).toLowerCase().includes(exact))score+=12;
  for(const w of qs){if(set.has(w))score+=5; else if(hay.some(t=>t.includes(w)||w.includes(t)))score+=2;}
  if(p.id.startsWith('SRC-'))score-=5;
  return score;
}
function searchProblems(q){
  return state.data.Problems.map(p=>({...p,__score:scoreProblem(p,q)})).filter(p=>p.__score>0).sort((a,b)=>b.__score-a.__score||a.problem.localeCompare(b.problem)).slice(0,5);
}
function splitQuestions(s){
  const raw=clean(s); if(!raw)return [];
  let parts=raw.split(/\?\s*|;\s*/).map(x=>x.trim()).filter(Boolean);
  return parts.map(x=>/\?$/.test(x)?x:`Can you check ${x.replace(/^check\s+/i,'').replace(/^inspect\s+/i,'inspect ')}?`).slice(0,5);
}
function startConversation(p){
  state.problem=p; state.step=0; state.answers=[]; renderConversation(true); askNext();
}
function addBubble(role,html,extra=''){
  const chat=$('#conversation'); const el=document.createElement('div'); el.className=`bubble ${role} ${extra}`; el.innerHTML=html; chat.appendChild(el); chat.scrollTop=chat.scrollHeight;
}
function renderConversation(clear=false){
  if(clear)$('#conversation').innerHTML='';
  $('#conversationWrap').classList.remove('hidden');
}
function askNext(){
  const p=state.problem; const qs=splitQuestions(p.questions);
  if(state.step>=Math.min(3,qs.length)){showDiagnosis();return;}
  const q=qs[state.step];
  addBubble('assistant',`<div class="assistant-name">PowderSolve</div><p>${esc(state.step===0?`Let’s narrow down ${p.problem.toLowerCase()}. ${q}`:q)}</p><div class="answer-row"><button data-answer="Yes">Yes</button><button data-answer="No">No</button><button data-answer="Not sure">Not sure</button><button data-answer="Skip">Skip</button></div>`);
  $$('.answer-row button').slice(-4).forEach(b=>b.addEventListener('click',()=>{
    state.answers.push({question:q,answer:b.dataset.answer});
    addBubble('user',`<p>${esc(b.dataset.answer)}</p>`);
    state.step++; askNext();
  }));
}
function showDiagnosis(){
  const p=state.problem; const matchedRules=state.data.Diagnostic_Rules.filter(r=>(r['Applies to problem IDs']||[]).includes(p.id) || clean(p.problem).toLowerCase().includes(clean(r.Trigger).toLowerCase())); const answerSummary=state.answers.map(a=>`${a.answer}: ${a.question}`).join(' · ');
  addBubble('assistant',`<div class="assistant-name">PowderSolve</div><p>${esc(state.data.Conversation.result_intro)}</p><div class="result-title"><span class="mini-check">✓</span><div><b>${esc(p.problem)}</b><small>${esc(p.description||'')}</small></div></div>
    ${p.causes?`<div class="chat-section"><h4>What could be causing it</h4><p>${esc(p.causes)}</p></div>`:''}
    ${p.tests?`<div class="chat-section"><h4>What I would verify</h4><p>${esc(p.tests)}</p></div>`:''}
    ${p.solution?`<div class="chat-solution"><h4>What to do next</h4><p>${esc(p.solution)}</p></div>`:''}
    ${p.safety?`<div class="chat-section warning"><h4>Safety / restriction</h4><p>${esc(p.safety)}</p></div>`:''}
    ${matchedRules.length?`<div class="chat-section rule-box"><h4>Rule-based check</h4>${matchedRules.map(r=>`<p>If <b>${esc(r['If / observation'])}</b>: ${esc(r['Possible cause'])} → ${esc(r['Next question / measurement'])} <span class="muted">(${esc(r.Status||'Draft')} rule)</span></p>`).join('')}</div>`:''}${(p.evidence||p.review)?`<div class="chat-meta">Evidence: ${esc(p.evidence||'—')} · Review: ${esc(p.review||'—')}</div>`:''}
    <p class="chat-note">${esc(state.data.Conversation.source_note)}</p>
    <div class="answer-row final-actions"><button id="againBtn">Ask me another question</button><button id="newProblemBtn">Start a new problem</button></div>`);
  if(answerSummary) addBubble('user',`<p class="answer-summary"><b>What I told you:</b> ${esc(answerSummary)}</p>`,'summary-bubble');
  $('#againBtn').addEventListener('click',()=>{state.step=Math.max(0,state.step-1);askNext();});
  $('#newProblemBtn').addEventListener('click',()=>{state.problem=null;state.step=0;state.answers=[];$('#conversationWrap').classList.add('hidden');$('#diagSearch').focus();$('#diagSearch').value='';$('#searchHint').textContent='';});
}
function liveSearch(){
  const q=$('#diagSearch').value.trim(); const matches=searchProblems(q); const hint=$('#searchHint');
  if(!q){hint.innerHTML='Try describing the problem exactly as you see it — for example <button class="inline-chip" data-q="small holes in coating">small holes</button>, <button class="inline-chip" data-q="coating peeling">peeling</button>, <button class="inline-chip" data-q="rough finish orange peel">rough finish</button>.'; $$('.inline-chip').forEach(b=>b.onclick=()=>{$('#diagSearch').value=b.dataset.q;liveSearch();}); return;}
  hint.innerHTML=matches.length?`I found ${matches.length} possible match${matches.length>1?'es':''}. <span>Choose the one that sounds closest:</span>`:`I’m not confident yet. Try a simpler description such as “craters”, “peeling”, “pinholes”, “powder not sticking” or “yellowing”.`;
  $('#matchList').innerHTML=matches.map((p,i)=>`<button class="match-card" data-id="${esc(p.id)}"><span class="match-number">${i+1}</span><span><b>${esc(p.problem)}</b><small>${esc(p.description||p.domain)}</small></span><span class="match-arrow">→</span></button>`).join('');
  $$('.match-card').forEach(b=>b.onclick=()=>{const p=state.data.Problems.find(x=>x.id===b.dataset.id);if(p)startConversation(p);});
}
function renderAllProblems(){
  const q=($('#allProblemSearch')?.value||'').trim().toLowerCase(); const rows=state.data.Problems.filter(p=>!q||allText(p).includes(q));
  $('#allProblemCount').textContent=`${rows.length} problems`;
  $('#allProblems').innerHTML=rows.map(p=>`<article class="library-row"><div><b>${esc(p.problem)}</b><span>${esc(p.domain)} · ${esc(p.description)}</span></div><button class="small-btn" data-problem="${esc(p.id)}">Diagnose</button></article>`).join('')||'<p class="muted">No problems found.</p>';
  $$('#allProblems .small-btn').forEach(b=>b.onclick=()=>{const p=state.data.Problems.find(x=>x.id===b.dataset.problem);switchTab('diagnose');$('#diagSearch').value=p.problem;liveSearch();startConversation(p);});
}
function renderVisual(){
  const q=($('#visualSearch')?.value||'').trim().toLowerCase(); const rows=state.data.Visual_Guide.filter(r=>!q||allText(r).includes(q));
  $('#visualResults').innerHTML=rows.map(visualCard).join('')||'<div class="muted">No visual references found.</div>';
}
function visualIllustration(type){
 const common='<svg viewBox="0 0 320 150" role="img" aria-label="Illustrative defect diagram"><rect x="8" y="8" width="304" height="134" rx="12" fill="#eef2f6"/><rect x="20" y="20" width="280" height="110" rx="8" fill="#9aa6b2"/>';let marks='';
 if(type==='orange-peel'){for(let i=0;i<22;i++){const x=35+(i*47)%245,y=35+(i*29)%75;marks+=`<circle cx="${x}" cy="${y}" r="${5+i%4}" fill="#cbd5df" opacity=".75"/>`;}}
 else if(type==='craters'){for(let i=0;i<8;i++){const x=45+(i*31)%225,y=40+(i*19)%65;marks+=`<circle cx="${x}" cy="${y}" r="${8+i%4}" fill="#667788"/><circle cx="${x}" cy="${y}" r="${4+i%3}" fill="#dce3e9"/>`;}}
 else if(type==='pinholes'){for(let i=0;i<35;i++){const x=28+(i*37)%260,y=28+(i*17)%90;marks+=`<circle cx="${x}" cy="${y}" r="${i%3+1}" fill="#283747"/>`;}}
 else if(type==='blisters'){for(let i=0;i<5;i++){const x=55+i*48,y=65+(i%2)*15;marks+=`<ellipse cx="${x}" cy="${y}" rx="${16+i%4}" ry="${10+i%3}" fill="#d8e0e7" stroke="#65788a" stroke-width="2"/>`;}}
 else if(type==='roughness'){for(let i=0;i<38;i++){const x=25+(i*19)%270,y=30+(i*23)%85;marks+=`<path d="M${x} ${y} l5 -4 l5 5" stroke="#d9e2ea" fill="none" stroke-width="2"/>`;}}
 else if(type==='back-ionisation'){marks='<path d="M160 75 l-70 -35 m70 35 l70 -35 m-70 35 l-75 40 m75 -40 l75 40" stroke="#f6c453" stroke-width="5"/><circle cx="160" cy="75" r="12" fill="#f59e0b"/>';}
 else if(type==='edge-coverage'){marks='<rect x="20" y="20" width="280" height="110" fill="#d6dee6"/><path d="M20 20 H300 V130 H20 Z" fill="none" stroke="#d97706" stroke-width="10"/><path d="M35 35 H285 V115 H35 Z" fill="#91a4b7"/>';}
 else if(type==='colour-mismatch'){marks='<rect x="28" y="35" width="125" height="80" fill="#64748b"/><rect x="167" y="35" width="125" height="80" fill="#8b9aab"/><text x="90" y="126" font-size="10" fill="#334155">STANDARD</text><text x="225" y="126" font-size="10" fill="#334155">SAMPLE</text>';}
 else if(type==='gloss-variation'){marks='<rect x="25" y="25" width="270" height="100" fill="#7c8fa3"/><path d="M45 35 L115 115 H145 L75 35 Z" fill="#f8fafc" opacity=".8"/><path d="M180 35 L250 115 H280 L210 35 Z" fill="#f8fafc" opacity=".25"/>';}
 else if(type==='delamination'){marks='<path d="M25 100 Q80 60 130 95 T230 80 T295 95 L295 120 H25 Z" fill="#dbe3ea"/><path d="M25 100 Q80 60 130 95 T230 80 T295 95" fill="none" stroke="#c2410c" stroke-width="5"/>';}
 return common+marks+'</svg>';
}
function visualCard(r){return `<article class="visual-card"><div class="visual-art">${visualIllustration(r['Visual type'])}</div><div class="visual-card-body"><div class="record-top"><div><h3>${esc(r.Defect)}</h3><p>${esc(r.Aliases||'')}</p></div><span class="pill">${esc(r.Status||'Review')}</span></div><p>${esc(r['Visual description']||'')}</p><details><summary>What to look for</summary><p>${esc(r['Look for']||'')}</p></details><details><summary>Possible confusion</summary><p>${esc(r['Common confusions']||'')}</p></details><details><summary>First diagnostic checks</summary><p>${esc(r['First checks']||'')}</p></details><details><summary>Important limitation</summary><p>${esc(r['Do not conclude']||'')}</p></details></div></article>`;}
function renderSources(){const q=($('#sourceSearch')?.value||'').trim().toLowerCase();const rows=state.data.Sources.filter(r=>!q||allText(r).includes(q));$('#sourceResults').innerHTML=rows.map(r=>`<article class="record"><div class="record-top"><div><h3>${esc(r['Source / material']||r['Source Name']||r['Source ID']||'Source')}</h3><p>${esc(r['Source ID']||r['Source_ID']||'')}</p></div><span class="pill">Reference</span></div>${Object.entries(r).filter(([k])=>!['Source ID','Source_ID','Source / material','Source Name'].includes(k)).map(([k,v])=>`<details><summary>${esc(k)}</summary><p>${esc(v)}</p></details>`).join('')}</article>`).join('')||'<div class="muted">No sources found.</div>';}
function sourceName(id){const s=(state.data.Sources||[]).find(x=>x['Source ID']===id);return s?s['Source / material']:id;}
function sourceOwner(id){const n=sourceName(id)||'';return /IFS/i.test(n)?'IFS':/PPG/i.test(n)?'PPG':'the published source';}
function cureCurveGraph(r,large=false){
 const temps=r['Temperatures °F']||[]; const times=r['Cure time min']||[];
 const w=large?820:420,h=large?360:220,left=58,right=22,top=24,bottom=48,pw=w-left-right,ph=h-top-bottom;
 if(!temps.length||temps.length!==times.length)return '<div class="empty-state">No published curve points available.</div>';
 const xmin=Math.min(...temps),xmax=Math.max(...temps),ymin=0,ymax=Math.max(...times)+4;
 const x=t=>left+(t-xmin)/(xmax-xmin)*pw, y=v=>top+ph-(v-ymin)/(ymax-ymin)*ph;
 const pts=temps.map((t,i)=>`${x(t).toFixed(1)},${y(times[i]).toFixed(1)}`).join(' ');
 const ticks=temps.map(t=>`<line x1="${x(t)}" y1="${top+ph}" x2="${x(t)}" y2="${top+ph+5}" stroke="#9fb0c0"/><text x="${x(t)}" y="${h-27}" text-anchor="middle" font-size="${large?12:9}" fill="#52677a">${t}°F</text>`).join('');
 const yt=[0,Math.round(ymax/3),Math.round(2*ymax/3),Math.round(ymax)].map(v=>`<line x1="${left}" y1="${y(v)}" x2="${left+pw}" y2="${y(v)}" stroke="#e3e9ef"/><text x="${left-8}" y="${y(v)+4}" text-anchor="end" font-size="${large?12:9}" fill="#52677a">${v}</text>`).join('');
 const dots=temps.map((t,i)=>`<circle cx="${x(t)}" cy="${y(times[i])}" r="${large?4:3}" fill="#1f7a8c"/>`).join('');
 return `<div class="cure-graph"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(r['Profile name'])} manufacturer published cure curve"><line x1="${left}" y1="${top}" x2="${left}" y2="${top+ph}" stroke="#9fb0c0"/><line x1="${left}" y1="${top+ph}" x2="${left+pw}" y2="${top+ph}" stroke="#9fb0c0"/>${yt}${ticks}<polyline points="${pts}" fill="none" stroke="#1f7a8c" stroke-width="${large?3:2.5}"/>${dots}<text x="${w/2}" y="${h-7}" text-anchor="middle" font-size="${large?13:10}" fill="#52677a">Peak metal temperature (°F)</text><text transform="translate(15 ${h/2}) rotate(-90)" text-anchor="middle" font-size="${large?13:10}" fill="#52677a">Minimum cure time (min)</text></svg></div>`;
}
function productWindowGraph(r,large=false){
 const pts=r['PMT / time points']||[]; const w=large?820:420,h=large?330:210,left=58,right=22,top=24,bottom=48,pw=w-left-right,ph=h-top-bottom;
 if(!pts.length)return '';
 const temps=pts.map(p=>p[0]), mins=pts.map(p=>p[1]), maxs=pts.map(p=>p[2]);
 const xmin=Math.min(...temps)-5,xmax=Math.max(...temps)+5,ymax=Math.max(...maxs)+5;
 const x=t=>left+(t-xmin)/(xmax-xmin)*pw,y=v=>top+ph-(v/ymax)*ph;
 const low=temps.map((t,i)=>`${x(t)},${y(mins[i])}`).join(' '), high=temps.map((t,i)=>`${x(t)},${y(maxs[i])}`).join(' ');
 const ticks=temps.map(t=>`<text x="${x(t)}" y="${h-27}" text-anchor="middle" font-size="${large?12:9}" fill="#52677a">${t}°C</text>`).join('');
 const dots=temps.map((t,i)=>`<circle cx="${x(t)}" cy="${y(mins[i])}" r="${large?4:3}" fill="#1f7a8c"/><circle cx="${x(t)}" cy="${y(maxs[i])}" r="${large?4:3}" fill="#c77b19"/>`).join('');
 return `<div class="cure-graph"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(r.Product)} product-specific cure window"><line x1="${left}" y1="${top}" x2="${left}" y2="${top+ph}" stroke="#9fb0c0"/><line x1="${left}" y1="${top+ph}" x2="${left+pw}" y2="${top+ph}" stroke="#9fb0c0"/><polyline points="${low}" fill="none" stroke="#1f7a8c" stroke-width="${large?3:2.5}"/><polyline points="${high}" fill="none" stroke="#c77b19" stroke-width="${large?3:2.5}" stroke-dasharray="6 4"/>${dots}${ticks}<text x="${w/2}" y="${h-7}" text-anchor="middle" font-size="${large?13:10}" fill="#52677a">Peak metal temperature (°C)</text><text transform="translate(15 ${h/2}) rotate(-90)" text-anchor="middle" font-size="${large?13:10}" fill="#52677a">Cure time (min)</text><text x="${left+8}" y="${top+14}" font-size="${large?12:9}" fill="#1f7a8c">minimum</text><text x="${left+82}" y="${top+14}" font-size="${large?12:9}" fill="#c77b19">maximum</text></svg></div>`;
}
function openCureProfile(r){
 $('#cureModalTitle').textContent=r['Profile name'];
 const temps=r['Temperatures °F']||[], times=r['Cure time min']||[];
 const table=temps.map((t,i)=>`<tr><td>${t}°F</td><td>${((t-32)*5/9).toFixed(0)}°C</td><td>${times[i]} min</td></tr>`).join('');
 $('#cureModalContent').innerHTML=`<div class="cure-source-badge">${esc(r['Status'])} · ${esc(sourceName(r['Source']))}</div>${cureCurveGraph(r,true)}<div class="cure-profile-facts"><div><b>Published series</b><span>${esc(r.Series)}</span></div><div><b>Curve meaning</b><span>Minimum PMT for stated time</span></div><div><b>Data points</b><span>${temps.length}</span></div><div><b>Authority</b><span>Manufacturer source</span></div></div><table class="cure-data-table"><thead><tr><th>PMT</th><th>PMT</th><th>Minimum time</th></tr></thead><tbody>${table}</tbody></table><div class="notice cure-warning"><b>Important:</b> This is a manufacturer-published reference curve from ${esc(sourceOwner(r['Source']))}. It is not a universal recipe. The powder manufacturer's product-specific TDS/cure curve for the actual powder takes precedence. Verify the slowest-heating location with a calibrated profiler.</div><p class="muted">${esc(r.Notes)}</p>`;
 $('#cureModal').classList.remove('hidden');
}
function renderCure(){
 const q=($('#cureSearch')?.value||'').trim().toLowerCase();
 const profiles=state.data.Cure_Profiles.filter(r=>r['Profile ID']&&(!q||allText(r).includes(q)));
 const schedules=state.data.Cure_Schedules.filter(r=>!q||allText(r).includes(q));
 const products=state.data.Cure_Product_Windows.filter(r=>!q||allText(r).includes(q));
 $('#cureCount').textContent=`${profiles.length} curves · ${schedules.length} schedules · ${products.length} product windows`;
 const curveCards=profiles.map(r=>`<article class="profile cure-profile"><div class="cure-card-graph">${cureCurveGraph(r)}</div><div class="cure-card-body"><div class="record-top"><div><b>${esc(r['Profile name'])}</b><span class="muted">${esc(r.Series)}</span></div><button class="small-btn cure-open" data-profile="${esc(r['Profile ID'])}">View profile</button></div><p class="muted">Source: ${esc(sourceName(r.Source))} · ${esc(r.Status)}</p></div></article>`).join('');
 const scheduleBlock=`<section class="cure-subsection"><div class="section-head"><div><p class="eyebrow">MANUFACTURER REFERENCE</p><h3>IFS typical minimum-metal-temperature schedules</h3></div></div><div class="schedule-grid">${schedules.map(r=>`<article class="schedule-card"><b>${esc(r.System)}</b><strong>${esc(r['Minimum metal temperature °F'])}°F · ${esc(r['Minimum dwell min'])} min</strong><span>${esc(r.Status)} · ${esc(sourceOwner(r.Source))}</span></article>`).join('')}</div></section>`;
 const productBlock=`<section class="cure-subsection"><div class="section-head"><div><p class="eyebrow">PRODUCT-SPECIFIC EXAMPLES</p><h3>Published PPG cure windows</h3></div></div><div class="product-window-grid">${products.map(r=>`<article class="profile cure-profile"><div class="cure-card-graph">${productWindowGraph(r)}</div><div class="cure-card-body"><b>${esc(r.Product)}</b><span class="muted">${esc(r.Chemistry)} · ${esc(r['Cure curve ID'])}</span><p class="muted">${esc(r.Status)} · ${esc(sourceName(r['Source ID']))}</p><details><summary>Published points</summary><p>${r['PMT / time points'].map(p=>`${p[0]}°C: ${p[1]}–${p[2]} min`).join(' · ')}</p></details></div></article>`).join('')}</div></section>`;
 $('#cureCards').innerHTML=curveCards||'<div class="empty-state">No manufacturer curves match that search.</div>';
 $$('#cureCards .cure-open').forEach(b=>b.onclick=()=>{const r=state.data.Cure_Profiles.find(x=>x['Profile ID']===b.dataset.profile);if(r)openCureProfile(r);});
 $('#cureMatrix').innerHTML=scheduleBlock+productBlock+`<section class="cure-subsection"><div class="section-head"><div><p class="eyebrow">DIAGNOSTIC CONTEXT</p><h3>Cure troubleshooting</h3></div></div>${state.data.Cure_Diagnostic_Matrix.map(r=>`<article class="record"><h3>${esc(r.Scenario)}</h3><p><b>What can happen:</b> ${esc(r['What can happen'])}</p><p><b>What to measure:</b> ${esc(r['What to measure'])}</p><p><b>Diagnostic direction:</b> ${esc(r['Typical diagnostic direction'])}</p><p class="muted"><b>Do not assume:</b> ${esc(r['Do not assume'])}</p></article>`).join('')}</section>`;
}
function switchTab(tab){state.tab=tab;$$('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));$$('.tab-panel').forEach(p=>p.classList.toggle('active',p.id==='tab-'+tab));if(tab==='knowledge')renderAllProblems();}
async function boot(){
 state.data=await fetch('data.json').then(r=>r.json());
 $('#recordCount').textContent=state.data.Problems.length; const fc=$('#footerCounts'); if(fc){const d=state.data;fc.textContent=`${d.Problems.length} problems · ${d.Cure_Profiles.length} cure curves · ${d.Cure_Schedules.length} schedules · ${d.Cure_Product_Windows.length} product windows`;} $('#allProblemCount').textContent=`${state.data.Problems.length} problems`;
 $('#diagSearch').addEventListener('input',liveSearch); $('#allProblemSearch').addEventListener('input',renderAllProblems); $('#visualSearch').addEventListener('input',renderVisual); $('#sourceSearch').addEventListener('input',renderSources); $('#cureSearch').addEventListener('input',renderCure);
 $('#resetDiag').addEventListener('click',()=>{$('#diagSearch').value='';$('#matchList').innerHTML='';$('#searchHint').innerHTML='';$('#conversationWrap').classList.add('hidden');state.problem=null;liveSearch();$('#diagSearch').focus();});
 $$('.tabs button').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
 $('#safetyBtn').addEventListener('click',()=>$('#safetyModal').classList.remove('hidden')); $('#closeCure').addEventListener('click',()=>$('#cureModal').classList.add('hidden')); $('#cureModal').addEventListener('click',e=>{if(e.target.id==='cureModal')$('#cureModal').classList.add('hidden');});$('#closeSafety').addEventListener('click',()=>$('#safetyModal').classList.add('hidden'));$('#ackSafety').addEventListener('click',()=>$('#safetyModal').classList.add('hidden'));
 renderAllProblems(); renderVisual(); renderSources(); renderCure(); liveSearch();
 if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
}
boot();
