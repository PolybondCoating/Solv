const state={data:null,tab:'diagnose',problem:null,path:null,node:null,history:[]};
const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=v=>String(v??'').trim();
const allText=o=>Object.values(o||{}).filter(v=>v!==null&&v!==undefined).join(' ').toLowerCase();
const tokens=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').split(/\s+/).filter(w=>w.length>2);

const STOP=new Set(['coating','coated','coat','the','and','not','are','getting','with','part','parts','there','this','that','has','have','very','some','keeps','doesn','does','dont','isn','its','my','our','after','when']);
const qTokens=q=>tokens(q).filter(w=>!STOP.has(w));
// Weighted match: the problem title and search aliases count most, causes least.
function scoreProblem(p,q){
  const qs=qTokens(q); if(!qs.length)return 0;
  const own=new Set(tokens(`${p.problem} ${p.description}`)); const aliases=tokens(p.search).filter(t=>!own.has(t)).join(' ');
  const fields=[[p.problem,6],[aliases,5],[p.description,4],[p.visual,3],[p.confused_with,3],[p.domain,1],[p.causes,1]].map(([t,w])=>[tokens(t),w]);
  let score=0;
  const exact=clean(q).toLowerCase();
  if(clean(p.problem).toLowerCase()===exact)score+=30;
  for(const w of qs){
    let best=0;
    for(const [toks,wt] of fields){
      if(toks.includes(w))best=Math.max(best,wt);
      else if(w.length>=4&&toks.some(t=>t.length>=4&&(t.startsWith(w)||w.startsWith(t))))best=Math.max(best,wt/2);
    }
    const stem=w.slice(0,Math.max(4,w.length-3));
    if(best&&fields[0][0].some(t=>t.startsWith(stem)))best+=1; // bonus when the title itself matches
    score+=best;
  }
  // A pathway's plain-language title (e.g. "Peeling or poor adhesion") boosts its main record.
  const pw=(state.data?.Diagnostic_Pathways||[]).find(w=>(w['Entry problems']||[])[0]===p.id);
  if(pw&&score){const tt=tokens(pw.Title);score+=3*qs.filter(w=>tt.some(t=>t.startsWith(w.slice(0,Math.max(4,w.length-3))))).length;}
  return score;
}
function searchProblems(q){
  return state.data.Problems.map(p=>({...p,__score:scoreProblem(p,q)})).filter(p=>p.__score>0).sort((a,b)=>b.__score-a.__score||a.problem.localeCompare(b.problem)).slice(0,5);
}
function splitQuestions(s){
  const raw=clean(s); if(!raw)return [];
  let parts=raw.split(/\?\s*|;\s*/).map(x=>x.trim()).filter(Boolean);
  return parts.map(x=>/\?$/.test(x)?x:`${x.charAt(0).toUpperCase()+x.slice(1)} — have you done this yet?`).slice(0,5);
}
// Problems without an authored pathway get a simple linear pathway built from their own checks.
function linearPathway(p){
  const qs=splitQuestions(p.questions).slice(0,state.data.Conversation.max_questions||3); const nodes={};
  qs.forEach((q,i)=>{const next=i+1<qs.length?`q${i+1}`:null;nodes[`q${i}`]={question:q,options:['Yes','No','Not sure','Skip'].map(label=>({label,next}))};});
  return {'Pathway ID':null,Opening:`Let’s narrow down ${p.problem.toLowerCase()}.`,Start:qs.length?'q0':null,Nodes:nodes,linear:true};
}
function pathwayFor(p){return (state.data.Diagnostic_Pathways||[]).find(w=>(w['Entry problems']||[]).includes(p.id))||linearPathway(p);}
const problemById=id=>state.data.Problems.find(x=>x.id===id);
function startConversation(p){
  state.problem=p; state.path=pathwayFor(p); state.node=state.path.Start; state.history=[]; renderConversation();
}
function addBubble(role,html,extra=''){
  const chat=$('#conversation'); const el=document.createElement('div'); el.className=`bubble ${role} ${extra}`; el.innerHTML=html; chat.appendChild(el); return el;
}
function renderConversation(){
  const chat=$('#conversation'); chat.innerHTML=''; $('#conversationWrap').classList.remove('hidden');
  const w=state.path;
  addBubble('assistant',`<div class="assistant-name">PowderSolve</div><p>${esc(w.Opening)}</p>`);
  state.history.forEach(h=>{addBubble('assistant',`<p>${esc(h.question)}</p>`,'past');addBubble('user',`<p>${esc(h.option.label)}</p>`);});
  const node=state.node&&w.Nodes[state.node];
  $('#convoStep').textContent=node?`Question ${state.history.length+1}`:'Result';
  if(node){
    const el=addBubble('assistant',`<p>${esc(node.question)}</p><div class="answer-row">${node.options.map((o,i)=>`<button data-opt="${i}">${esc(o.label)}</button>`).join('')}</div>${state.history.length?'<button class="text-btn back-btn">← Change my last answer</button>':''}`);
    el.querySelectorAll('[data-opt]').forEach(b=>b.addEventListener('click',()=>{const o=node.options[+b.dataset.opt];state.history.push({node:state.node,question:node.question,option:o});state.node=o.next;renderConversation();}));
    el.querySelector('.back-btn')?.addEventListener('click',goBack);
  } else showDiagnosis();
  const target=!node?chat.querySelector('.bubble.result'):state.history.length?chat.lastElementChild:$('#conversationWrap');
  target?.scrollIntoView({block:node&&state.history.length?'nearest':'start',behavior:'smooth'});
}
function goBack(){const h=state.history.pop();if(h){state.node=h.node;renderConversation();}}
function recordSections(p,compact=false){
  const sec=(cls,title,body)=>body?`<div class="${cls}"><h4>${title}</h4><p>${esc(body)}</p></div>`:'';
  return sec('chat-section','What could be causing it',p.causes)
    +sec('chat-section','What to verify',p.questions)
    +sec('chat-solution','What to do',p.solution)
    +sec('chat-section confirm','How to confirm',p.tests)
    +sec('chat-section warning','Safety / restriction',p.safety);
}
function showDiagnosis(){
  const p=state.problem, w=state.path;
  const focus=[...new Set(state.history.flatMap(h=>h.option.focus||[]))].filter(id=>id!==p.id).map(problemById).filter(Boolean);
  const notes=state.history.map(h=>h.option.note).filter(Boolean);
  const ids=new Set([p.id,...focus.map(f=>f.id)]);
  const rules=state.data.Diagnostic_Rules.filter(r=>(r['Applies to problem IDs']||[]).some(i=>ids.has(i))||clean(p.problem).toLowerCase().includes(clean(r.Trigger).toLowerCase()));
  const el=addBubble('assistant',`<div class="assistant-name">PowderSolve</div><p>${esc(state.data.Conversation.result_intro)}</p>
    ${notes.length?`<div class="chat-section pointers"><h4>What your answers point to</h4><ul>${notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></div>`:''}
    <div class="result-title"><span class="mini-check">✓</span><div><b>${esc(p.problem)}</b><small>${esc(p.description||'')}</small></div></div>
    ${recordSections(p)}
    ${focus.length?`<div class="related"><h4>Also check — based on your answers</h4>${focus.map(f=>`<details class="related-item"><summary><b>${esc(f.problem)}</b><small>${esc(f.description||'')}</small></summary>${recordSections(f)}<div class="chat-meta">Evidence: ${esc(f.evidence||'—')} · Review: ${esc(f.review||'—')}</div></details>`).join('')}</div>`:''}
    ${rules.length?`<div class="chat-section rule-box"><h4>Rule-based check</h4>${rules.map(r=>`<p>If <b>${esc(r['If / observation'])}</b>: ${esc(r['Possible cause'])} → ${esc(r['Next question / measurement'])} <span class="muted">(${esc(r.Status||'Draft')} rule)</span></p>`).join('')}</div>`:''}
    <div class="chat-meta">Evidence: ${esc(p.evidence||'—')} · Review: ${esc(p.review||'—')}${w['Pathway ID']?` · Question pathway: ${esc(w.Status||'Draft')}`:''}</div>
    <p class="chat-note">${esc(state.data.Conversation.source_note)}</p>
    <div class="answer-row final-actions">${state.history.length?'<button class="back-btn">← Change my last answer</button>':''}<button class="new-btn">Start a new problem</button></div>`,'result');
  el.querySelector('.back-btn')?.addEventListener('click',goBack);
  el.querySelector('.new-btn').addEventListener('click',()=>{state.problem=null;state.history=[];$('#conversationWrap').classList.add('hidden');$('#diagSearch').value='';$('#matchList').innerHTML='';liveSearch();$('#diagSearch').focus();});
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
// ---- Heat-up time by metal thickness (calibrated estimate) ----
const num=v=>{const n=parseFloat(String(v).replace(',','.'));return Number.isFinite(n)?n:null;};
const fToC=f=>Math.round((f-32)*5/9);
const fmtMin=s=>{const m=s/60;return m<10?m.toFixed(1):Math.round(m).toString();};
function huMaterials(){return state.data.Heat_Up_Model?.Materials||[];}
function huMat(id){return huMaterials().find(m=>m.id===id)||huMaterials()[0];}
// Heated depth: a part open on both faces heats through half its thickness from each side.
const huDepth=(mm,sides)=>mm/1000*(sides===2?0.5:1);
function huTargets(){
  const opts=[{v:'custom',label:'My product TDS (enter below)',group:''}];
  state.data.Cure_Profiles.forEach(r=>(r['Temperatures °F']||[]).forEach((f,i)=>opts.push({v:`cp|${r['Profile ID']}|${i}`,group:`IFS · ${r['Profile name']}`,label:`${fToC(f)}°C (${f}°F) · ${r['Cure time min'][i]} min`,pmt:fToC(f),dwell:r['Cure time min'][i]})));
  state.data.Cure_Product_Windows.forEach(r=>(r['PMT / time points']||[]).forEach((p,i)=>opts.push({v:`pw|${r['Product ID']}|${i}`,group:`PPG · ${r.Product}`,label:`${p[0]}°C · ${p[1]}–${p[2]} min`,pmt:p[0],dwell:p[1]})));
  return opts;
}
function initHeatUp(){
  if(!state.data.Heat_Up_Model)return $('#heatupCard')?.remove();
  const matOpts=huMaterials().map(m=>`<option value="${esc(m.id)}">${esc(m.name)}</option>`).join('');
  $('#huMat').innerHTML=matOpts; $('#huRefMat').innerHTML=matOpts;
  const groups={}; huTargets().forEach(o=>(groups[o.group]??=[]).push(o));
  $('#huTarget').innerHTML=Object.entries(groups).map(([g,os])=>{const h=os.map(o=>`<option value="${esc(o.v)}">${esc(o.label)}</option>`).join('');return g?`<optgroup label="${esc(g)}">${h}</optgroup>`:h;}).join('');
  const hm=state.data.Heat_Up_Model;
  $('#huMethod').innerHTML=`<p>${esc(hm.Method)}</p><p>${esc(hm['Why calibration'])}</p><h4>Assumptions</h4><ul>${hm.Assumptions.map(a=>`<li>${esc(a)}</li>`).join('')}</ul><h4>Material values</h4><table class="cure-data-table"><thead><tr><th>Metal</th><th>Density (kg/m³)</th><th>Specific heat (J/kg·K)</th><th>Note</th></tr></thead><tbody>${huMaterials().map(m=>`<tr><td>${esc(m.name)}</td><td>${m.density}</td><td>${m.specific_heat}</td><td>${esc(m.note||'')} <span class="muted">${m.sources.map(s=>esc(sourceName(s))).join('; ')}</span></td></tr>`).join('')}</tbody></table><p class="muted"><b>Do not:</b> ${esc(hm['Do not'])}</p>`;
  $$('#heatupCard input,#heatupCard select').forEach(el=>el.addEventListener('input',renderHeatUp));
  renderHeatUp();
}
function renderHeatUp(){
  const out=$('#huOut'); if(!out)return;
  const mat=huMat($('#huMat').value), sides=+$('#huSides').value;
  const thk=[...new Set(String($('#huThk').value).split(/[\s,;]+/).map(num).filter(n=>n&&n>0&&n<=200))].sort((a,b)=>a-b).slice(0,12);
  const air=num($('#huAir').value), start=num($('#huStart').value);
  const tsel=$('#huTarget').value; $('#huCustom').classList.toggle('hidden',tsel!=='custom');
  const tgt=tsel==='custom'?{pmt:num($('#huPmt').value),dwell:num($('#huDwell').value),label:'your TDS'}:huTargets().find(o=>o.v===tsel);
  const refMat=huMat($('#huRefMat').value), refSides=+$('#huRefSides').value, refThk=num($('#huRefThk').value), refT=num($('#huRefT').value), refMin=num($('#huRefMin').value);
  const cap=m=>m.density*m.specific_heat;
  const msgs=[];
  if(!thk.length){out.innerHTML='<div class="empty-state">Enter one or more thicknesses in mm.</div>';return;}
  // Reference for relative times: the measured part if given, otherwise the thinnest listed part.
  const ref=refThk?{load:cap(refMat)*huDepth(refThk,refSides),label:`${refThk} mm ${refMat.name.toLowerCase()}`}:{load:cap(mat)*huDepth(thk[0],sides),label:`${thk[0]} mm`};
  // Calibration: derive this oven's heat-transfer rate from one real reading.
  let h=null;
  const calibInputs=[refThk,refT,refMin].some(v=>v!==null);
  if(calibInputs){
    if([air,start,refThk,refT,refMin].some(v=>v===null))msgs.push('To use your profiler reading, also fill in oven air temperature, start temperature, thickness, reached °C and minutes.');
    else if(!(refT>start&&refT<air))msgs.push('The reading must be above the start temperature and below the oven air temperature.');
    else if(refMin<=0)msgs.push('Minutes must be above zero.');
    else h=cap(refMat)*huDepth(refThk,refSides)/(refMin*60)*Math.log((air-start)/(air-refT));
  }
  let tgtOk=tgt&&tgt.pmt!==null&&tgt.pmt!==undefined;
  if(tgtOk&&air!==null&&tgt.pmt>=air){msgs.push(`Oven air (${air}°C) must be above the target PMT (${tgt.pmt}°C) — the part can never reach it.`);tgtOk=false;}
  if(tgtOk&&start!==null&&tgt.pmt<=start)tgtOk=false;
  const canTime=h&&tgtOk&&air!==null&&start!==null;
  const rows=thk.map(t=>{
    const load=cap(mat)*huDepth(t,sides), rel=load/ref.load;
    const tau=h?load/h:null;
    const reach=canTime?tau*Math.log((air-start)/(air-tgt.pmt)):null;
    return {t,rel,tau,reach};
  });
  const dwell=tgtOk&&tgt.dwell!=null?tgt.dwell:null;
  const table=`<table class="cure-data-table hu-table"><thead><tr><th>Thickness</th><th>Relative heat-up <span class="muted">(vs ${esc(ref.label)})</span></th><th>Reaches ${tgtOk?`${tgt.pmt}°C`:'PMT'}</th><th>+ time at PMT</th><th>Earliest out of oven</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r.t} mm</b></td><td>${r.rel.toFixed(r.rel<10?2:1)}×</td><td>${r.reach!==null?`<b>${fmtMin(r.reach)} min</b>`:'—'}</td><td>${dwell!==null?`${dwell} min`:'—'}</td><td>${r.reach!==null&&dwell!==null?`<b>≈ ${fmtMin(r.reach+dwell*60)} min</b>`:'—'}</td></tr>`).join('')}</tbody></table>`;
  let hint='';
  if(!canTime){
    const need=[];
    if(air===null)need.push('oven air temperature'); if(!tgtOk)need.push('a cure target'); if(!h)need.push('one profiler reading from your oven (step 3)');
    hint=`<p class="hu-hint">Showing relative times only. To get minutes, add ${need.join(', ')}.</p>`;
  }
  let chart=canTime?'':huRelChart(rows,ref.label), insight='';
  if(canTime){
    const pick=rows.length>6?[0,1,2,Math.floor(rows.length/2),rows.length-2,rows.length-1].map(i=>rows[i]):rows;
    const tMax=Math.max(...rows.map(r=>r.reach+(dwell||0)*60))*1.15;
    chart=huChart(pick,air,start,tgt.pmt,tMax);
    const thin=rows[0], thick=rows[rows.length-1];
    if(rows.length>1)insight=`<div class="notice warning"><b>Mixed loads:</b> ${thick.t} mm reaches ${tgt.pmt}°C about <b>${fmtMin(thick.reach-thin.reach)} min</b> after ${thin.t} mm. If they run together, the thin section spends that extra time at or above PMT — check the TDS upper limit, and profile both the thinnest and the heaviest location.</div>`;
  }
  out.innerHTML=`${msgs.map(m=>`<div class="notice warning">${esc(m)}</div>`).join('')}${table}${hint}${chart}${insight}<div class="notice cure-warning"><b>Estimate only.</b> ${canTime?`Calibrated from your reading of ${refThk} mm ${esc(refMat.name.toLowerCase())} reaching ${refT}°C after ${refMin} min. Valid only for the same oven, settings, line speed and loading.`:'Relative times assume the same oven and loading for every thickness.'} ${tgtOk&&tsel!=='custom'?`The cure target is ${esc(tgt.group||'')} reference data — your product TDS takes precedence.`:''} Confirm with a profiler on the slowest-heating location before setting a production cycle.</div>`;
}
// Before calibration: bar chart of relative heat-up time. Physics only, no oven assumptions.
function huRelChart(rows,refLabel){
  const w=820,rowH=30,left=70,right=90,top=16,h=top+rows.length*rowH+34,pw=w-left-right;
  const max=Math.max(...rows.map(r=>r.rel));
  const bars=rows.map((r,i)=>{const y=top+i*rowH,bw=Math.max(2,r.rel/max*pw);return `<text x="${left-10}" y="${y+19}" text-anchor="end" font-size="13" font-weight="700" fill="#102a43">${r.t} mm</text><rect x="${left}" y="${y+5}" width="${bw}" height="20" rx="4" fill="#1f7a8c" opacity="${0.45+0.55*r.rel/max}"/><text x="${left+bw+8}" y="${y+19}" font-size="13" fill="#334e68">${r.rel.toFixed(r.rel<10?2:1)}×</text>`;}).join('');
  return `<div class="cure-graph"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Relative heat-up time by thickness">${bars}<text x="${left}" y="${h-10}" font-size="12" fill="#52677a">Relative time to reach PMT (1× = ${esc(refLabel)}) — longer bar = slower to heat</text></svg><div class="hu-legend"><span class="muted">Add oven air temperature, a cure target and one profiler reading to see this as minutes and temperature curves.</span></div></div>`;
}
function huChart(rows,air,start,pmt,tMax){
  const w=820,h=320,left=58,right=24,top=20,bottom=46,pw=w-left-right,ph=h-top-bottom;
  const yMin=Math.floor(start/10)*10, yMax=Math.ceil(air/10)*10;
  const x=s=>left+s/tMax*pw, y=T=>top+ph-(T-yMin)/(yMax-yMin)*ph;
  const colors=['#1f7a8c','#2f9e77','#6b4eff','#c77b19','#b42318','#334e68'];
  const lines=rows.map((r,k)=>{const pts=[];for(let i=0;i<=160;i++){const s=tMax*i/160;pts.push(`${x(s).toFixed(1)},${y(air-(air-start)*Math.exp(-s/r.tau)).toFixed(1)}`);}return `<polyline points="${pts.join(' ')}" fill="none" stroke="${colors[k%6]}" stroke-width="2.5"/><circle cx="${x(r.reach)}" cy="${y(pmt)}" r="4" fill="${colors[k%6]}"/>`;}).join('');
  const minTicks=[];const step=tMax/60>40?10:tMax/60>15?5:2;for(let m=0;m*60<=tMax;m+=step)minTicks.push(m);
  const xt=minTicks.map(m=>`<text x="${x(m*60)}" y="${h-26}" text-anchor="middle" font-size="11" fill="#52677a">${m}</text>`).join('');
  const yt=[yMin,Math.round((yMin+yMax)/2),yMax].map(v=>`<line x1="${left}" y1="${y(v)}" x2="${left+pw}" y2="${y(v)}" stroke="#e3e9ef"/><text x="${left-8}" y="${y(v)+4}" text-anchor="end" font-size="11" fill="#52677a">${v}</text>`).join('');
  return `<div class="cure-graph"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Estimated part metal temperature over time by thickness">${yt}<line x1="${left}" y1="${y(pmt)}" x2="${left+pw}" y2="${y(pmt)}" stroke="#b42318" stroke-dasharray="6 4"/><text x="${left+pw-4}" y="${y(pmt)+14}" text-anchor="end" font-size="11" fill="#b42318">target PMT ${pmt}°C</text><line x1="${left}" y1="${y(air)}" x2="${left+pw}" y2="${y(air)}" stroke="#9fb0c0" stroke-dasharray="2 4"/><text x="${left+pw-4}" y="${y(air)-6}" text-anchor="end" font-size="11" fill="#52677a">oven air ${air}°C</text>${lines}${xt}<text x="${w/2}" y="${h-6}" text-anchor="middle" font-size="12" fill="#52677a">Minutes in oven (estimate)</text><text transform="translate(15 ${h/2}) rotate(-90)" text-anchor="middle" font-size="12" fill="#52677a">Part metal temp (°C)</text></svg><div class="hu-legend">${rows.map((r,k)=>`<span><i style="background:${colors[k%6]}"></i>${r.t} mm · ${fmtMin(r.reach)} min</span>`).join('')}<span class="muted">● = reaches target PMT</span></div></div>`;
}
function switchTab(tab){state.tab=tab;$$('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));$$('.tab-panel').forEach(p=>p.classList.toggle('active',p.id==='tab-'+tab));if(tab==='knowledge')renderAllProblems();}
async function boot(){
 state.data=await fetch('data.json').then(r=>r.json());
 $('#recordCount').textContent=state.data.Problems.length; const fc=$('#footerCounts'); if(fc){const d=state.data;fc.textContent=`${d.Problems.length} problems · ${d.Cure_Profiles.length} cure curves · ${d.Cure_Schedules.length} schedules · ${d.Cure_Product_Windows.length} product windows`;} $('#allProblemCount').textContent=`${state.data.Problems.length} problems`;
 $('#diagSearch').addEventListener('input',liveSearch); $('#allProblemSearch').addEventListener('input',renderAllProblems); $('#visualSearch').addEventListener('input',renderVisual); $('#sourceSearch').addEventListener('input',renderSources); $('#cureSearch').addEventListener('input',renderCure);
 $('#resetDiag').addEventListener('click',()=>{$('#diagSearch').value='';$('#matchList').innerHTML='';$('#searchHint').innerHTML='';$('#conversationWrap').classList.add('hidden');state.problem=null;liveSearch();$('#diagSearch').focus();});
 $$('.tabs button').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
 $('#safetyBtn').addEventListener('click',()=>$('#safetyModal').classList.remove('hidden')); $('#closeCure').addEventListener('click',()=>$('#cureModal').classList.add('hidden')); $('#cureModal').addEventListener('click',e=>{if(e.target.id==='cureModal')$('#cureModal').classList.add('hidden');});$('#closeSafety').addEventListener('click',()=>$('#safetyModal').classList.add('hidden'));$('#ackSafety').addEventListener('click',()=>$('#safetyModal').classList.add('hidden'));
 renderAllProblems(); renderVisual(); renderSources(); renderCure(); initHeatUp(); liveSearch();
 if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
}
boot();
