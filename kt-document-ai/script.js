'use strict';

// 1. CONFIGURATION — set false only when your team's Agent API is running.
const DEMO_MODE = true;
const API_BASE = ''; // Example: http://127.0.0.1:8000 (configure CORS on that server).
const API_TIMEOUT_MS = 120000;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

// 2. ICONS — inline SVG keeps the interface usable without a CDN dependency.
const ICONS = {
  plus:'<path d="M12 5v14M5 12h14"/>',
  history:'<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7m2-5v6l4 2"/>',
  sparkles:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM3 2v4M1 4h4"/>',
  database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  'chevron-right':'<path d="m9 5 7 7-7 7"/>',
  'chevron-down':'<path d="m5 9 7 7 7-7"/>',
  settings:'<path d="m9 3-1 3-3 1-2 4 2 2 1 4 4 2 3-1 3 1 4-2 1-4 2-2-2-4-3-1-1-3H9Z"/><circle cx="12" cy="12" r="3"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  'badge-check':'<path d="m12 2 3 2 4 1 1 4 2 3-2 3-1 4-4 1-3 2-3-2-4-1-1-4-2-3 2-3 1-4 4-1 3-2Z"/><path d="m8 12 3 3 5-6"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  monitor:'<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8m-4-5v5"/>',
  'panel-right':'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
  files:'<path d="M8 3h8l4 4v13H8V3Zm8 0v5h4M4 7v16h12"/>',
  file:'<path d="M5 3h9l5 5v13H5V3Zm9 0v6h5M8 13h8m-8 4h6"/>',
  'file-up':'<path d="M5 3h9l5 5v13H5V3Zm9 0v6h5m-7 9v-7m-3 3 3-3 3 3"/>',
  'arrow-up-right':'<path d="m6 18 12-12M6 6h12v12"/>',
  'arrow-up':'<path d="M12 20V4m-6 6 6-6 6 6"/>',
  'arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  play:'<path d="m8 4 12 8-12 8V4Z"/>',
  'shield-check':'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6"/>',
  network:'<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5H5v5m7-5h7v5"/>',
  x:'<path d="m6 6 12 12M6 18 18 6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  circle:'<circle cx="12" cy="12" r="5"/>',
  'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  compare:'<path d="M7 3v18M17 3v18M3 7l4-4 4 4m2 10 4 4 4-4"/>',
  copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  link:'<path d="m9 15 6-6m-5-3 2-2a5 5 0 0 1 7 7l-2 2m-3 5-2 2a5 5 0 0 1-7-7l2-2"/>',
  download:'<path d="M12 3v13m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  stop:'<rect x="6" y="6" width="12" height="12" rx="1"/>',
  message:'<path d="M3 4h18v13H8l-5 4V4Z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.file}</svg>`;
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });

// 3. EVIDENCE — these particular passages were checked against the supplied DOCX files.
// Other demo findings below are explicitly synthetic. None are produced from user uploads.
const source = (revision, point, text, kind = 'synthetic', highlight = '') => ({
  document:`Положение №${revision}`, filename:`Положение_о_внутреннем_аудите_редакция_${revision}_обезличено.docx`,
  section:point.split('.')[0], point, text, kind, highlight
});
const EVIDENCE = {
  structure8:source(8,'3.4','3.4. БВА состоит из следующих структурных подразделений:\nа. Департамент непрерывного мониторинга системы внутреннего контроля (ДНМ).\nб. Департамент контроля качества аудита и методологии (ДККМ).','verified','Департамент непрерывного мониторинга'),
  structure9:source(9,'3.4','3.4. БВА состоит из следующих структурных подразделений:\nа. Департамент ИТ-аудита и анализа данных (ДИТААД).\nб. Департамент операционного аудита (ДОА).\nв. Департамент непрерывного мониторинга системы внутреннего контроля (ДНМ).\nг. Департамент контроля качества аудита и методологии (ДККМ).','verified','Департамент ИТ-аудита и анализа данных (ДИТААД)'),
  director8:source(8,'3.5','3.5. Главному аудитору подчиняются работники БВА в соответствии со штатным расписанием:\nа. Директор направления внутреннего аудита.\nб. Директор ДНМ.\nв. Директор ДККМ.','verified','Директор направления внутреннего аудита'),
  director9:source(9,'3.5','3.5. Главному аудитору подчиняются работники БВА в соответствии со штатным расписанием:\nа. Директор ДИТААД.\nб. Директор ДОА.\nв. Директор ДНМ.\nг. Директор ДККМ.','verified','Директор ДИТААД'),
  it9:source(9,'5.3.2','5.3.2. организуют по решению Главного аудитора руководство курируемых плановых и внеплановых проверок:\nа. аудит ИТ систем, Информационная безопасность, аудит персональных данных, ИТ-инциденты, непрерывность бизнеса, дата аналитика, применения языков программирования, создание дашбордов, автоматизация процессов ВА (ДИТААД);\nб. аудит процессов развития, операционных и поддерживающих процессов Общества (ДОА).','verified','аудит ИТ систем'),
  reporting8:source(8,'ДЕМО-2.1','Демо: подразделение подготавливает отчет о выполнении корректирующих мероприятий.'),
  archive8:source(8,'ДЕМО-2.2','Демо: подразделение обеспечивает хранение рабочих материалов аудиторских проверок.'),
  training8:source(8,'ДЕМО-2.3','Демо: подразделение организует ежегодное обучение координаторов внутреннего контроля.'),
  riskA9:source(9,'ДЕМО-4.1','Демо: подразделение внутреннего аудита обновляет корпоративный реестр рисков.'),
  riskB9:source(9,'ДЕМО-4.2','Демо: подразделение управления рисками поддерживает в актуальном состоянии корпоративный реестр рисков.'),
  reportA9:source(9,'ДЕМО-4.3','Демо: отдел аудита готовит сводную квартальную отчетность о контрольных мероприятиях.'),
  reportB9:source(9,'ДЕМО-4.4','Демо: отдел контроля готовит сводную квартальную отчетность о контрольных мероприятиях.')
};
function syntheticPair(n, before, after) { return [source(8,`ДЕМО-${n}`,`Демо: ${before}`),source(9,`ДЕМО-${n}`,`Демо: ${after}`)]; }
const DEMO_CHANGES = [
  {id:'A1',type:'added',title:'ДИТААД — ИТ-аудит және деректерді талдау',description:'9-редакцияның 3.4-тармағындағы бөлімшелер тізіміне ДИТААД қосылған. 8-редакцияның осы тізімінде ол жоқ.',sources:[EVIDENCE.structure8,EVIDENCE.structure9],impact:'high'},
  {id:'A2',type:'added',title:'ДОА — операциялық аудит департаменті',description:'ДОА 9-редакцияның құрылымдық бөлімшелер тізімінде көрсетілген. Оның аудит бағыты 5.3.2-тармақта нақтыланған.',sources:[EVIDENCE.structure9,EVIDENCE.it9],impact:'high'},
  {id:'A3',type:'added',title:'Тесттік: бақылау панельдерін дайындау',description:'Жасанды сценарийде жаңа аналитикалық панельдерді әзірлеу функциясы қосылды.',sources:[source(9,'ДЕМО-3.1','Демо: подразделение разрабатывает аналитические панели для контроля результатов аудита.')],impact:'medium'},
  {id:'A4',type:'added',title:'Тесттік: деректер сапасын тексеру',description:'Жасанды сценарийде деректер сапасын жүйелі тексеру міндеті қосылды.',sources:[source(9,'ДЕМО-3.2','Демо: подразделение проводит регулярную проверку качества данных.')],impact:'medium'},
  {id:'A5',type:'added',title:'Тесттік: цифрлық аудит әдістемесі',description:'Жасанды сценарийде цифрлық аудит бойынша әдістемелік қолдау қосылды.',sources:[source(9,'ДЕМО-3.3','Демо: подразделение разрабатывает методическую поддержку цифрового аудита.')],impact:'low'},
  {id:'R1',type:'removed',title:'Тесттік: түзету шараларының орындалу есебі',description:'Шартты кейінгі жинақта осы міндетке сәйкестік табылмады. Басқа бөлімшеге ауысқанын тексеру керек.',sources:[EVIDENCE.reporting8],impact:'medium'},
  {id:'R2',type:'removed',title:'Тесттік: аудит материалдарын мұрағаттау',description:'Жасанды сценарийде мұрағаттау функциясы кейінгі редакцияда көрсетілмеген.',sources:[EVIDENCE.archive8],impact:'medium'},
  {id:'R3',type:'removed',title:'Тесттік: бақылау координаторларын оқыту',description:'Шартты кейінгі нұсқада оқытуға жауапты бөлімше анықталмаған.',sources:[EVIDENCE.training8],impact:'low'},
  {id:'M1',type:'modified',title:'Директор бағытының өзгеруі',description:'Бас аудиторға бағынысты тұлғалар тізімінде «Директор направления внутреннего аудита» орнына ДИТААД пен ДОА директорлары көрсетілген. Ресми рөл бөлінуін бұйрықпен тексеру қажет.',sources:[EVIDENCE.director8,EVIDENCE.director9],impact:'high'},
  {id:'M2',type:'modified',title:'Аудит бағыттары нақтыланған',description:'9-редакцияның 5.3.2-тармағы ИТ-аудитті ДИТААД-қа, ал операциялық процестер аудитін ДОА-ға жатқызады. Бұл функция жоғалды дегенді білдірмейді.',sources:[EVIDENCE.it9],impact:'medium'},
  {id:'M3',type:'modified',title:'Тесттік: есеп беру жиілігі',description:'Жасанды сценарийде есеп беру жиілігі жылдықтан тоқсандыққа өзгерді.',sources:syntheticPair('5.1','Отчет представляется ежегодно.','Отчет представляется ежеквартально.'),impact:'low'},
  {id:'M4',type:'modified',title:'Тесттік: келісу тәртібі',description:'Жасанды сценарийде жоспарды келісетін жауапты рөл өзгерді.',sources:syntheticPair('5.2','План согласует руководитель направления.','План согласует директор департамента.'),impact:'low'},
  {id:'D1',type:'duplicate',title:'Тесттік: тәуекелдер тізілімін жаңарту',description:'Екі шартты бөлімшеге бір тізілімді жаңарту міндеті берілген. 87% — демонстрациялық ұқсастық бағасы.',sources:[EVIDENCE.riskA9,EVIDENCE.riskB9],similarity:87,impact:'medium'},
  {id:'D2',type:'duplicate',title:'Тесттік: бақылау нәтижелері бойынша есеп',description:'Шартты аудит және бақылау бөлімшелері бірдей жиынтық есеп дайындайды. Жауапкершілікті нақтылау қажет.',sources:[EVIDENCE.reportA9,EVIDENCE.reportB9],similarity:91,impact:'medium'}
];
const DEMO_RESULT = {
  answer:'№8 және №9 редакцияларын салыстырудың демо сценарийінде 14 маңызды өзгеріс көрсетілген.',
  sources:[EVIDENCE.structure9], changes:DEMO_CHANGES, functions_detected:47, confidence:96,
  summary:'Нақты үзінділерде ДИТААД пен ДОА бөлімшелер тізіміне қосылған және басшылық тізімі өзгерген. Қалған тесттік тұжырымдар интерфейсті көрсетуге арналған. Қорытындыны жауапты қызметкер тексеруі тиіс.'
};
const TYPE_LABELS = {added:'Жаңа функция',removed:'Жоғалу қаупі',modified:'Өзгерген функция',duplicate:'Ықтимал қайталану'};
const TOOLS = [
  {name:'Document Parser',icon:'file',step:1}, {name:'Semantic Search',icon:'search',step:4},
  {name:'Function Comparator',icon:'compare',step:5}, {name:'Duplicate Detector',icon:'copy',step:7}, {name:'Source Verifier',icon:'shield-check',step:8}
];
const PROCESS_STEPS = ['№8 құжаты оқылды','№9 құжаты оқылды','47 функция анықталды','Құрылымдар сәйкестендірілді','Семантикалық салыстыру жүргізілуде','Жоғалған функциялар тексерілді','Жаңа функциялар анықталды','Қайталанулар ізделді','Source evidence тексерілді'];
const COMMANDS = [
  {command:'/compare',label:'Құжаттарды салыстыру'}, {command:'/missing',label:'Жоғалған функцияларды табу'},
  {command:'/added',label:'Жаңа функцияларды табу'}, {command:'/duplicates',label:'Қайталанатын функцияларды табу'},
  {command:'/changes',label:'Өзгерістерді көрсету'}, {command:'/sources',label:'Дереккөздерді көрсету'}, {command:'/report',label:'Толық есеп дайындау'}
];
const FOLLOWUPS = ['Жоғалған функцияларды көрсет','Қайталанатын функцияларды тап','ДИТААД туралы толық түсіндір','№8 және №9 құрылымын салыстыр','Толық есеп жаса'];

// 4. SESSION STATE — memory only; raw files are never written to localStorage.
let sequence = 0;
const uid = prefix => `${prefix}-${++sequence}`;
const sessions = [];
let activeSessionId;
let activeTask = null;
let pendingFiles = {old:null,new:null};
let commandIndex = 0;
let toastTimer;
const settings = {motion:!matchMedia('(prefers-reduced-motion: reduce)').matches, context:innerWidth>1050};
const currentSession = () => sessions.find(session=>session.id===activeSessionId);
const citations = new Map();
function newSession(title='Жаңа талдау',seed=null) { const item={id:uid('session'),title,seed,files:[],messages:[],serverId:null,result:null,connected:false,completedTools:0,status:'READY'};sessions.unshift(item);return item; }
function addMessage(session,message) { const item={id:uid('message'),...message};session.messages.push(item);if(session.id===activeSessionId)renderSession(true);return item; }
function toast(message) { $('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4500); }
function formatBytes(bytes) { return bytes>=1048576?`${(bytes/1048576).toFixed(1)} MB`:`${Math.max(1,Math.round(bytes/1024))} KB`; }
function formatText(text) { return escapeHTML(text).split('\n').map(line=>line.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')).join('<br>'); }
function fileCard(file) { return `<div class="message-attachment">${icon('file')}<div><strong>${escapeHTML(file.name)}</strong><small>${file.demo?'ДЕМО ҚҰЖАТ':`${escapeHTML(file.name.split('.').pop().toUpperCase())} · ${formatBytes(file.size)}`}</small></div></div>`; }
function typeCounts(result) { return Object.fromEntries(Object.keys(TYPE_LABELS).map(type=>[type,result.changes.filter(change=>change.type===type).length])); }
function demoTag() { return DEMO_MODE?'<span class="demo-message-label">DEMO SIMULATION</span>':''; }

// 5. CHAT RENDERING — all document/backend strings are escaped before insertion.
function citationMarkup(sources=[]) {
  return `<div class="citation-row">${sources.map(item=>{const key=uid('citation');citations.set(key,item);return `<button class="citation" data-citation="${key}">${icon('link')}${escapeHTML(item.document)} · §${escapeHTML(item.point)}${icon('arrow-up-right')}</button>`;}).join('')}</div>`;
}
function followupMarkup(questions=FOLLOWUPS) { return `<div class="followups"><span>КЕЛЕСІ СҰРАҚТАР</span><div class="followup-chips">${questions.map(question=>`<button class="followup-chip" data-question="${escapeHTML(question)}">${escapeHTML(question)}${icon('arrow-up-right')}</button>`).join('')}</div></div>`; }
function metricsMarkup(result) { const counts=typeCounts(result);return `<div class="result-metrics">${Object.entries(TYPE_LABELS).map(([type,label])=>`<div class="result-metric ${type}"><strong>${counts[type]}</strong><span>${label}</span></div>`).join('')}</div>`; }
function transformationMarkup() { return `<div class="transformation"><div class="role-node"><span class="mono">BEFORE / №8</span>Директор направления внутреннего аудита</div><div class="transform-arrow">${icon('arrow-right')}</div><div class="role-node after"><span class="mono">AFTER / №9</span><strong>Директор ДИТААД</strong><strong>Директор ДОА</strong></div></div>`; }
function changesMarkup(changes) { return changes.map(change=>`<article class="answer-item"><span class="item-type">${escapeHTML(change.type.toUpperCase())}${change.similarity!=null?` · SIMILARITY ${change.similarity}% (DEMO)`:''}</span><h3>${escapeHTML(change.title)}</h3><p>${escapeHTML(change.description)}</p>${citationMarkup(change.sources)}</article>`).join(''); }
function processMarkup(message) {
  const finished=message.status==='done';
  const stages=DEMO_MODE?PROCESS_STEPS:['Құжаттар агент серверіне берілді','Агенттің жауабы күтілуде','Жауап пен дереккөздер қабылданды'];
  const step=message.step || 0;
  const toolCalls=DEMO_MODE?[
    {name:'Document Parser',text:'2 document editions connected',icon:'file',at:1},
    {name:'Function Extractor',text:'47 functions · demo example',icon:'network',at:2},
    {name:'Semantic Comparator',text:'Comparing organizational functions',icon:'compare',at:4},
    {name:'Source Verifier',text:'Preparing evidence references',icon:'shield-check',at:8}
  ]:[];
  return `${demoTag()}<div class="message-text"><strong>${finished?'Талдау кезеңдері аяқталды.':message.status==='cancelled'?'Күту тоқтатылды.':message.status==='error'?'Агент талдауды аяқтай алмады.':'Құжаттарды зерттеп жатырмын...'}</strong></div><details class="process-details" data-process="${message.id}" ${finished?'':'open'}><summary>${icon('chevron-down')}Агенттің жұмыс кезеңдері<span class="process-badge">${DEMO_MODE?'SIMULATION':'SERVER STATUS'}</span></summary><ol class="process-list">${stages.map((stage,index)=>`<li class="${finished||index<step?'complete':index===step?'running':''}">${icon(finished||index<step?'check':index===step?'circle':'circle')}${escapeHTML(stage)}</li>`).join('')}</ol><div class="tool-call-grid" style="padding:0 13px 13px;margin:0">${toolCalls.filter(tool=>tool.at<=step||finished).map(tool=>`<div class="tool-call">${icon(tool.icon)}<div><strong>${tool.name}</strong><small>${tool.text}</small></div><span class="call-state">${finished||step>tool.at?icon('check'):icon('circle')}</span></div>`).join('')}</div></details>${!finished&&message.status==='working'?'<div class="typing-indicator" aria-label="Жауап дайындалуда"><i></i><i></i><i></i></div>':''}`;
}
function messageMarkup(message) {
  let content='';
  if(message.role==='user') content=`<div class="message-text">${formatText(message.text)}</div>${message.files?`<div class="message-attachments">${message.files.map(fileCard).join('')}</div>`:''}`;
  else if(message.kind==='receipt') content=`<div class="message-text"><strong>Құжаттар қабылданды.</strong><div class="message-attachments">${message.files.map(fileCard).join('')}</div><p style="margin-top:16px">Екі редакцияны салыстыруды бастайын ба?</p></div><button class="agent-action" data-action="compare">${icon('sparkles')}Салыстыруды бастау${icon('arrow-right')}</button>${DEMO_MODE?'<p class="message-footnote">DEMO · Көрсетілетін нәтиже таңдалған файлдардан алынбайды.</p>':''}`;
  else if(message.kind==='process') content=processMarkup(message);
  else if(message.kind==='analysis') {
    const result=message.result;
    content=`${demoTag()}<div class="message-text"><strong>Талдау аяқталды.</strong><p>${formatText(result.answer)}</p><h3>${result.changes.length} маңызды өзгеріс${DEMO_MODE?' · демо':''}</h3></div>${metricsMarkup(result)}${DEMO_MODE?`<div class="important-insight"><span class="insight-kicker">ЕҢ МАҢЫЗДЫ ӨЗГЕРІС</span><div class="message-text">№9 редакциясының бөлімшелер тізіміне <strong>ДИТААД</strong> және <strong>ДОА</strong> қосылған. Растайтын тармақ — <strong>3.4</strong>.</div>${citationMarkup([EVIDENCE.structure8,EVIDENCE.structure9])}</div>`:`<div class="message-text">${formatText(result.summary)}</div>${citationMarkup(result.sources)}`}<p class="message-footnote">${DEMO_MODE?'14 өзгеріс, 47 функция және 96% — демонстрациялық көрсеткіштер. Қолмен тексерілген үзінділер дәлел панелінде бөлек белгіленген.':'Қорытынды ұсынымдық сипатта. Әр тұжырымды бастапқы құжатпен тексеріңіз.'}</p>${followupMarkup()}<div class="message-actions"><button data-action="report">${icon('download')}Толық есеп</button></div>`;
  } else if(message.kind==='error') content=`<div class="agent-error">${icon('info')} ${escapeHTML(message.text)}</div>`;
  else if(message.kind==='report') content=`<div class="message-text"><strong>Аналитикалық қорытынды дайын.</strong><p>Барлық өзгерістер, түсіндірмелер және дәлел үзінділері бір есепке жиналды.</p></div><button class="agent-action" data-action="report">${icon('file')}Толық есепті ашу${icon('arrow-up-right')}</button>${followupMarkup(['Дереккөздерді көрсет','Директордың функциялары қалай өзгерді?'])}`;
  else {
    content=`${message.demo?demoTag():''}<div class="message-text">${formatText(message.text || '')}${message.transformation?transformationMarkup():''}</div>${message.changes?changesMarkup(message.changes):''}${citationMarkup(message.sources || [])}${message.compareAction?`<button class="agent-action" data-action="compare">${icon('sparkles')}Салыстыруды бастау</button>`:''}${message.followups===false?'':followupMarkup(message.questions || FOLLOWUPS)}`;
  }
  return `<article class="message ${message.role}" data-message="${message.id}"><div class="message-avatar">${message.role==='user'?'HA':icon('sparkles')}</div><div class="message-content"><div class="message-label">${message.role==='user'?'Сіз':'Document AI'}${message.role==='assistant'?'<span>INTELLIGENCE AGENT</span>':''}</div>${content}</div></article>`;
}
function renderSidebar() {
  $('#session-list').innerHTML=sessions.map(session=>`<button class="session-button ${session.id===activeSessionId?'active':''}" data-session="${session.id}" ${session.id===activeSessionId?'aria-current="page"':''}>${icon('message')}<span title="${escapeHTML(session.title)}">${escapeHTML(session.title)}</span>${session.seed?'<small>ҮЛГІ</small>':''}</button>`).join('');
}
function renderContext() {
  const session=currentSession();
  $('#knowledge-count').textContent=`${session.files.length} documents connected`;
  $('#document-counter').textContent=String(session.files.length).padStart(2,'0');
  $('#active-documents').innerHTML=session.files.length?session.files.map((file,index)=>`<div class="active-document"><span class="document-mini-icon">${icon('file')}</span><div><strong title="${escapeHTML(file.name)}">${escapeHTML(file.name)}</strong><small>${index?'AFTER / 02':'BEFORE / 01'} · ${file.demo?'ДЕМО':formatBytes(file.size)}</small></div>${icon('check')}</div>`).join(''):`<div class="context-empty">${icon('files')}<p>Агентке құжаттарды қосыңыз.<br>Дәлелдер осында байланысады.</p></div>`;
  $('#context-status').textContent=session.status;
  $('#functions-metric').textContent=session.result?.functions_detected ?? '—';
  $('#changes-metric').textContent=session.result?session.result.changes.length:'—';
  const confidence=session.result?.confidence;
  $('#confidence-metric').textContent=confidence==null?'—':`${confidence}%`;
  $('#confidence-fill').style.width=`${confidence??0}%`;
  $('#confidence-kind').textContent=session.result&&DEMO_MODE?'DEMO':'';
  $('#agent-tools').innerHTML=TOOLS.map((tool,index)=>`<div class="agent-tool ${index<session.completedTools?'complete':session.status==='ANALYZING'&&index===session.completedTools?'running':''}">${icon(tool.icon)}<span>${tool.name}</span><span class="tool-state">${index<session.completedTools?icon('check'):session.status==='ANALYZING'&&index===session.completedTools?icon('circle'):'—'}</span></div>`).join('');
  $('#tools-count').textContent=`${session.completedTools} / 5`;
  $('#context-attach').disabled=!!activeTask;
  $('#header-status').textContent=session.status==='ANALYZING'?'Құжаттарды зерттеп жатырмын':session.status==='THINKING'?'Жауап дайындап жатырмын':session.status==='CONNECTING'?'Құжаттар қабылдануда':session.connected?'Құжаттар контекстіне сүйеніп жауап беремін':'Құжаттарыңызды зерттеуге дайын';
}
function renderSession(scroll=false) {
  const session=currentSession();
  const previous=$('#conversation').scrollTop;
  const openStates=new Map(Array.from(document.querySelectorAll('[data-process]')).map(el=>[el.dataset.process,el.open]));
  citations.clear();
  $('#welcome-screen').hidden=session.messages.length>0;
  $('#messages').innerHTML=session.messages.map(messageMarkup).join('');
  document.querySelectorAll('[data-process]').forEach(el=>{if(openStates.has(el.dataset.process))el.open=openStates.get(el.dataset.process);});
  $('#composer-attached').hidden=!session.files.length;
  $('#composer-attached').innerHTML=session.files.map(file=>`<span class="attachment-chip">${icon('file')}<span title="${escapeHTML(file.name)}">${escapeHTML(file.name)}</span></span>`).join('');
  $('#workspace').classList.toggle('is-busy',!!activeTask);
  renderSidebar();renderContext();updateSendButton();
  if(scroll)requestAnimationFrame(()=>{$('#conversation').scrollTop=$('#conversation').scrollHeight;});
  else $('#conversation').scrollTop=previous;
}
function updateSendButton() {
  const busy=!!activeTask;
  $('#send-button').disabled=!busy&&!$('#chat-input').value.trim();
  $('#send-button').classList.toggle('busy',busy);
  $('#send-button').innerHTML=icon(busy?'stop':'arrow-up');
  $('#send-button').setAttribute('aria-label',busy?'Жауапты күтуді тоқтату':'Хабарлама жіберу');
  $('#attach-button').disabled=busy;
  document.querySelectorAll('[data-action="compare"],[data-question]').forEach(el=>el.disabled=busy);
}

// 6. AGENT API — real mode never substitutes simulated answers after an error.
function requireText(value,label) { if(typeof value!=='string'||!value.trim())throw new Error(`${label}: сервер жауабының форматы жарамсыз.`);return value.trim(); }
function normalizeSources(items) {
  if(!Array.isArray(items))throw new Error('Сервер дереккөздер тізімін қайтармады.');
  return items.map(item=>({document:requireText(item?.document,'Құжат'),section:String(item.section??String(item.point??'').split('.')[0]),point:requireText(item?.point,'Тармақ'),text:requireText(item?.text,'Үзінді'),kind:'api',highlight:typeof item.highlight==='string'?item.highlight:''}));
}
function normalizeAnswer(data) {
  const answer=requireText(data?.answer,'Agent answer');
  const sources=normalizeSources(data.sources || []);
  if(!sources.length&&data.insufficient_evidence!==true)throw new Error('Агент жауабында растайтын дереккөз жоқ. Backend маңызды тұжырымдарға sources беруі тиіс.');
  return {answer,sources};
}
function normalizeResult(data) {
  const base=normalizeAnswer(data);
  if(!Array.isArray(data.changes))throw new Error('Агент changes тізімін қайтармады.');
  const changes=data.changes.map((change,index)=>{
    if(!change||!Object.hasOwn(TYPE_LABELS,change.type))throw new Error(`Өзгеріс ${index+1}: белгісіз категория.`);
    const sources=normalizeSources(change.sources);
    if(!sources.length||(change.type==='duplicate'&&sources.length<2))throw new Error(`Өзгеріс ${index+1}: жеткілікті дереккөз берілмеген.`);
    return {id:`api-${index}`,type:change.type,title:requireText(change.title,'Атау'),description:requireText(change.description,'Түсіндірме'),sources,impact:['high','medium','low'].includes(change.impact)?change.impact:null};
  });
  return {...base,changes,summary:typeof data.summary==='string'?data.summary:base.answer,functions_detected:Number.isInteger(data.functions_detected)&&data.functions_detected>=0?data.functions_detected:null,confidence:typeof data.confidence==='number'&&data.confidence>=0&&data.confidence<=100?data.confidence:null};
}
async function apiRequest(path,body,signal) {
  let response;
  try {response=await fetch(`${API_BASE.replace(/\/$/,'')}${path}`,{method:'POST',signal,headers:body instanceof FormData?{Accept:'application/json'}:{Accept:'application/json','Content-Type':'application/json'},body:body instanceof FormData?body:JSON.stringify(body)});}
  catch(error){if(signal.aborted)throw error;throw new Error('Агент серверіне қосылу мүмкін болмады. Backend мекенжайын және желіні тексеріңіз.');}
  if(!response.ok){if([404,405,501].includes(response.status))throw new Error('AI Backend әлі қосылмаған. /api/documents, /api/compare және /api/chat endpoint-терін іске қосыңыз.');throw new Error(`Агент сервері сұрауды аяқтай алмады (HTTP ${response.status}).`);}
  try{return await response.json();}catch{throw new Error('Сервер жарамсыз JSON қайтарды.');}
}
function wait(ms,signal) {return new Promise((resolve,reject)=>{if(signal.aborted){reject(signal.reason);return;}const abort=()=>{clearTimeout(timer);reject(signal.reason);};const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},ms);signal.addEventListener('abort',abort,{once:true});});}
async function runTask(session,status,work) {
  if(activeTask)return;
  const controller=new AbortController();
  const task={controller,session,timedOut:false};activeTask=task;session.status=status;renderSession(true);
  const timer=setTimeout(()=>{task.timedOut=true;controller.abort();},API_TIMEOUT_MS);
  try{await work(controller.signal);}
  catch(error){
    session.messages.filter(msg=>msg.kind==='process'&&msg.status==='working').forEach(msg=>msg.status=controller.signal.aborted?'cancelled':'error');
    const text=controller.signal.aborted?(task.timedOut?'Күту уақыты аяқталды. Сервердегі тапсырма жалғасуы мүмкін.':DEMO_MODE?'Демо әрекет тоқтатылды.':'Күту тоқтатылды. Сервердегі тапсырма жалғасуы мүмкін.'):error.message;
    addMessage(session,{role:'assistant',kind:'error',text});
  }finally{clearTimeout(timer);if(activeTask===task){activeTask=null;session.status='READY';renderSession(activeSessionId===session.id);}}
}
function cancelTask() {activeTask?.controller.abort();}

// 7. DOCUMENT CONNECTION AND COMPARISON.
function openUpload() {
  if(activeTask){toast('Құжаттарды өзгерту үшін ағымдағы әрекетті тоқтатыңыз.');return;}
  pendingFiles={old:null,new:null};renderPendingFiles();$('#upload-error').hidden=true;$('#upload-dialog').showModal();
}
function chooseFile(side,file) {
  if(!file)return;
  let error='';
  if(!/\.(pdf|docx|xlsx)$/i.test(file.name))error='PDF, DOCX немесе XLSX файлын таңдаңыз.';
  else if(file.size===0)error='Бос файлды тіркеу мүмкін емес.';
  else if(file.size>MAX_FILE_BYTES)error='Әр файлдың көлемі 20 МБ-тан аспауы тиіс.';
  $('#upload-error').textContent=error;$('#upload-error').hidden=!error;
  if(error)return;
  pendingFiles[side]=file;renderPendingFiles();
}
function renderPendingFiles() {
  ['old','new'].forEach(side=>{
    const file=pendingFiles[side];const slot=$(`.upload-slot[data-side="${side}"]`);
    slot.querySelector('.drop-zone').hidden=!!file;
    $(`#selected-${side}`).hidden=!file;
    $(`#selected-${side}`).innerHTML=file?`${icon('file')}<div><strong>${escapeHTML(file.name)}</strong><small>${formatBytes(file.size)} · DOCUMENT READY</small></div><button class="icon-button" data-remove-pending="${side}" aria-label="Файлды алып тастау">${icon('x')}</button>`:'';
  });
  $('#connect-documents').disabled=!(pendingFiles.old&&pendingFiles.new);
}
async function connectDocuments(files) {
  let session=currentSession();
  // A new document pair gets its own conversation so old evidence cannot be mixed in.
  if(session.connected||session.files.length){session=newSession();activeSessionId=session.id;}
  session.title=files.every(file=>file.demo)?'№8 ↔ №9 аудит ережелері':`${files[0].name.replace(/\.[^.]+$/,'')} ↔ ${files[1].name.replace(/\.[^.]+$/,'')}`;
  session.files=files;
  addMessage(session,{role:'user',text:'Осы екі құжатты салыстыруға дайында.',files});
  await runTask(session,'CONNECTING',async signal=>{
    if(DEMO_MODE)await wait(400,signal);
    else {
      const form=new FormData();form.append('old_document',files[0]);form.append('new_document',files[1]);
      const result=await apiRequest('/api/documents',form,signal);
      session.serverId=requireText(result.session_id,'Session ID');
    }
    session.connected=true;session.completedTools=DEMO_MODE?1:0;
    if(!DEMO_MODE)$('#sidebar-mode').textContent='AGENT API CONNECTED';
    addMessage(session,{role:'assistant',kind:'receipt',files});
  });
}
async function compareDocuments() {
  const session=currentSession();
  if(activeTask)return;
  if(!session.connected){addMessage(session,{role:'assistant',text:'Алдымен екі құжатты тіркеңіз. Төмендегі + батырмасы арқылы бастапқы және жаңартылған редакцияны қосуға болады.',followups:false});return;}
  addMessage(session,{role:'user',text:'Екі редакцияны салыстыруды баста.'});
  await runTask(session,'ANALYZING',async signal=>{
    const process=addMessage(session,{role:'assistant',kind:'process',status:'working',step:0});
    let result;
    if(DEMO_MODE){
      for(let step=0;step<PROCESS_STEPS.length;step++){
        process.step=step;session.completedTools=TOOLS.filter(tool=>tool.step<step).length;
        if(session.id===activeSessionId)renderSession(true);
        await wait(settings.motion?340:100,signal);
      }
      result=DEMO_RESULT;
    }else{process.step=1;renderSession(true);result=normalizeResult(await apiRequest('/api/compare',{session_id:session.serverId},signal));}
    process.status='done';process.step=PROCESS_STEPS.length;
    session.result=result;session.completedTools=DEMO_MODE?5:session.completedTools;
    addMessage(session,{role:'assistant',kind:'analysis',result});
  });
}

// 8. FOLLOW-UP CONVERSATION. Demo uses a transparent rule-based scenario, not an LLM.
function demoAnswer(question) {
  const q=question.toLocaleLowerCase('kk');
  if(q.includes('/report')||/толық есеп|есеп жаса|отч[её]т|report/.test(q))return {kind:'report'};
  if(q.includes('/sources')||/дереккөз|источник|source|дәлел/.test(q))return {text:'Негізгі өзгерістерді растайтын тармақтар төменде. 3.4 — бөлімшелер тізімі, 3.5 — бас аудиторға бағынысты басшылар, 5.3.2 — аудит бағыттары. Citation батырмасын басып, түпнұсқа үзіндіні ашыңыз.',sources:[EVIDENCE.structure8,EVIDENCE.structure9,EVIDENCE.director8,EVIDENCE.director9,EVIDENCE.it9]};
  if(/директор|лауазым|рөл|director/.test(q))return {text:'**Басшылық тізімінде маңызды өзгеріс бар.**\n8-редакциядағы «Директор направления внутреннего аудита» орнына 9-редакция тізімінде ДИТААД пен ДОА директорлары көрсетілген.\n\nБұл міндеттердің бағыттар бойынша бөлінуін көрсетеді. Бір рөлдің ресми түрде екіге бөлінгенін штаттық кестемен немесе бұйрықпен тексеру қажет.',transformation:true,sources:[EVIDENCE.director8,EVIDENCE.director9],questions:['ДИТААД туралы толық түсіндір','№8 және №9 құрылымын салыстыр','Толық есеп жаса']};
  if(/құрылым|жаңа бөлім|бөлімш|структур|департаменттер/.test(q))return {text:'**№9 редакциясының тізіміне екі бөлімше қосылған.**\n\n**1. ДИТААД** — Департамент ИТ-аудита и анализа данных.\nИТ-аудит және деректерді талдау бағыты 5.3.2-тармақта нақтыланған.\n\n**2. ДОА** — Департамент операционного аудита.\nОперациялық және қолдау процестерінің аудиті осы бағытқа жатқызылған.\n\nДНМ мен ДККМ екі редакцияда да сақталған. Дереккөздегі бөлім нөмірі — **3.4**; нақты құрылған күнін анықтау үшін қосымша бұйрық керек.',sources:[EVIDENCE.structure8,EVIDENCE.structure9,EVIDENCE.it9]};
  if(/дитаад|it-аудит|ит-аудит/.test(q))return {text:'**ДИТААД — ИТ-аудит және деректерді талдау департаменті.**\nОл 9-редакцияның 3.4-тармағында жеке бөлімше ретінде көрсетілген. 5.3.2-тармақта оның бағытына ИТ жүйелері, ақпараттық қауіпсіздік, дербес деректер, ИТ-инциденттер, бизнес үздіксіздігі, деректер аналитикасы және аудит процестерін автоматтандыру жатқызылған.\n\n8-редакцияның 3.4 тізімінде ДИТААД аталмайды. Бұл басқа құжаттарда мұндай функциялар болмағанын білдірмейді.',sources:[EVIDENCE.structure9,EVIDENCE.it9,EVIDENCE.structure8],questions:['Директордың функциялары қалай өзгерді?','Қайталанатын функцияларды тап','Толық есеп жаса']};
  const category=q.includes('/missing')||/жоғал|жойыл|missing|removed|утрачен/.test(q)?'removed':q.includes('/duplicates')||/қайтал|дублир|duplicat/.test(q)?'duplicate':q.includes('/added')||/жаңа|қосыл|added|добав/.test(q)?'added':q.includes('/changes')||/өзгер|измен|changes/.test(q)?'modified':null;
  if(category){const changes=DEMO_CHANGES.filter(item=>item.type===category);return {text:`**${changes.length} ${category==='removed'?'жоғалу қаупі':category==='duplicate'?'ықтимал қайталану':category==='added'?'қосылған функция / бөлімше':'өзгерген міндет'} көрсетілген.**\n${category==='removed'||category==='duplicate'?'Бұл категориядағы нәтижелер — интерфейсті көрсетуге арналған жасанды мысалдар. Нақты 8 және 9-редакцияларға қатысты қорытынды емес.':'Құжаттан тексерілген үзінділер мен тесттік сценарийлер дәлел панелінде бөлек белгіленген.'}`,changes,sources:[],questions:FOLLOWUPS.filter(item=>!(category==='removed'&&item.startsWith('Жоғалған')))};}
  return {text:'Демо режимде осы сұраққа арналған дәлелді жауап дайындалмаған. Мен өзімнен тұжырым қоспаймын.\n\nҚазір жаңа бөлімшелер, ДИТААД, директор рөлінің өзгерісі, жоғалған немесе қайталанатын функциялар туралы үлгі сұрақтарды қарай аламыз. Нақты еркін сұхбат үшін /api/chat арқылы AI Backend қосылады.',sources:[],questions:['№9 редакциясында қандай жаңа бөлімдер пайда болды?','Директордың функциялары қалай өзгерді?','Жоғалған функцияларды көрсет']};
}
async function sendMessage(text) {
  const question=text.trim();if(!question)return;
  if(activeTask){toast('Агент жауабын күтіңіз немесе күтуді тоқтатыңыз.');return;}
  const session=currentSession();
  if(/^\/compare\b/i.test(question)||/салыстыруды баста|салыстыруды іске қос/i.test(question)){await compareDocuments();return;}
  addMessage(session,{role:'user',text:question});
  if(!session.connected){addMessage(session,{role:'assistant',text:'Сұраққа құжаттарға сүйеніп жауап беру үшін екі редакцияны тіркеңіз. Төмендегі **+** батырмасы арқылы файлдарды қосыңыз немесе бастапқы экрандағы демо мысалды ашыңыз.',followups:false});return;}
  if(DEMO_MODE&&!session.result){addMessage(session,{role:'assistant',text:'Екі құжат қосылды. Алдымен редакцияларды салыстырып, жұмыс контекстін дайындайық.',compareAction:true,followups:false});return;}
  await runTask(session,'THINKING',async signal=>{
    if(DEMO_MODE){await wait(settings.motion?480:80,signal);const answer=demoAnswer(question);addMessage(session,{role:'assistant',demo:true,...answer});}
    else{const data=normalizeAnswer(await apiRequest('/api/chat',{session_id:session.serverId,message:question},signal));addMessage(session,{role:'assistant',text:data.answer,sources:data.sources});}
  });
}

// 9. EVIDENCE AND REPORTS.
function openEvidence(key) {
  const item=citations.get(key);if(!item)return;
  const verified=item.kind==='verified';const synthetic=item.kind==='synthetic';
  let quote=escapeHTML(item.text);
  if(item.highlight&&item.text.includes(item.highlight))quote=quote.replace(escapeHTML(item.highlight),`<mark>${escapeHTML(item.highlight)}</mark>`);
  $('#evidence-content').innerHTML=`<span class="evidence-type ${synthetic?'synthetic':''}">${verified?'ҚҰЖАТТАН ҚОЛМЕН ТЕКСЕРІЛГЕН':synthetic?'ЖАСАНДЫ ДЕМО ҮЗІНДІ':'AGENT SOURCE'}</span><div class="evidence-document">${icon('file')}<div><span class="mono">DOCUMENT</span><strong>${escapeHTML(item.document)}</strong></div></div><div class="evidence-locators"><div><span>SECTION</span><strong>${escapeHTML(item.section)}</strong></div><div><span>POINT</span><strong>${escapeHTML(item.point)}</strong></div></div><span class="evidence-quote-label">ORIGINAL TEXT${synthetic?' / DEMO':''}</span><blockquote class="evidence-quote">${quote}</blockquote><p class="evidence-explanation">${verified?'Бұл үзінді пайдаланушы берген 8 немесе 9-редакция DOCX құжатынан тексерілген. Ол автоматты AI талдауының нәтижесі емес.':synthetic?'Бұл мәтін демонстрация үшін құрастырылған. Нақты құжаттан алынған дәйексөз емес.':'Үзінді Agent Backend жауабынан алынды. Frontend оны түпнұсқамен автоматты түрде тексермейді.'}</p>${item.filename?`<p class="evidence-explanation" style="margin-top:15px;overflow-wrap:anywhere">${escapeHTML(item.filename)}</p>`:''}`;
  $('#evidence-dialog').showModal();
}
function openReport() {
  const result=currentSession().result;if(!result){toast('Есеп үшін алдымен салыстыруды іске қосыңыз.');return;}
  $('#report-content').innerHTML=`${demoTag()}<p class="report-intro">${escapeHTML(result.answer)}</p>${metricsMarkup(result)}${result.changes.map(change=>`<section class="report-section"><span class="report-type">${escapeHTML(change.type.toUpperCase())}</span><h3>${escapeHTML(change.title)}</h3><p>${escapeHTML(change.description)}</p>${citationMarkup(change.sources)}</section>`).join('')}<p class="report-warning">${escapeHTML(reportNote())}</p>`;
  $('#report-dialog').showModal();
}
function reportNote() {return DEMO_MODE?'DEMO: нәтижелер алдын ала дайындалған. Тесттік дереккөздер жасанды; verified деп белгіленген үзінділер қолмен тексерілген. Жүктелген файлдар өңделмеген.':'Агент қорытындысы ұсынымдық сипатта. Дереккөздер мен тұжырымдарды жауапты қызметкер тексеруі тиіс.';}
function download(content,type,name) {const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function exportJSON() {const session=currentSession();if(!session.result)return;download(JSON.stringify({session_id:session.serverId||session.id,is_demo:DEMO_MODE,documents:session.files.map(file=>({name:file.name})),...session.result,note:reportNote()},null,2),'application/json;charset=utf-8','kt-document-ai-report.json');toast('JSON есеп жүктелді.');}
function exportCSV() {const result=currentSession().result;if(!result)return;const cell=value=>{let text=String(value??'');if(/^[=+@\-\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};const rows=[['Mode','Type','Title','Description','Sources','Note'],...result.changes.map(item=>[DEMO_MODE?'DEMO':'AGENT',item.type,item.title,item.description,item.sources.map(s=>`${s.document} §${s.point}: ${s.text}`).join('\n'),reportNote()])];download('\ufeff'+rows.map(row=>row.map(cell).join(',')).join('\r\n'),'text/csv;charset=utf-8','kt-document-ai-report.csv');toast('CSV есеп жүктелді.');}
function exportPDF() {
  const result=currentSession().result;if(!result)return;
  const printWindow=window.open('','_blank');if(!printWindow){toast('PDF үшін браузерде жаңа терезелерді ашуға рұқсат беріңіз.');return;}
  const html=`<!doctype html><html lang="kk"><head><meta charset="utf-8"><title>KT Document AI — ${DEMO_MODE?'Demo ':''}Report</title><style>body{font:13px Arial,sans-serif;color:#17324a;max-width:900px;margin:35px auto;padding:0 25px;line-height:1.7}h1{font-size:25px}h2{font-size:16px}article{border-top:1px solid #cbd6dd;padding:18px 0;break-inside:avoid}.type{font-size:10px;color:#537487;letter-spacing:1px}blockquote{background:#f1f5f7;border-left:3px solid #729eac;margin:12px 0;padding:12px 15px;white-space:pre-line;font-size:11px}small{color:#687f91}button{padding:12px 18px;border:0;background:#23698b;color:#fff;border-radius:6px;cursor:pointer;margin:12px 0}.note{background:#f1f4f5;padding:15px;font-size:11px}@media print{button{display:none}body{margin:0;padding:0}h1{font-size:23px}}</style></head><body><h1>KT Document AI · Аналитикалық қорытынды</h1><p class="note">${escapeHTML(reportNote())}</p><p>${escapeHTML(result.answer)}</p><p>${result.changes.length} өзгеріс · ${result.functions_detected??'—'} функция · Confidence: ${result.confidence==null?'көрсетілмеген':result.confidence+'%'}${DEMO_MODE?' (демо)':''}</p><button onclick="window.print()">PDF ретінде сақтау / Басып шығару</button>${result.changes.map(change=>`<article><span class="type">${escapeHTML(change.type.toUpperCase())}</span><h2>${escapeHTML(change.title)}</h2><p>${escapeHTML(change.description)}</p>${change.sources.map(item=>`<small>${escapeHTML(item.document)} · §${escapeHTML(item.point)} · ${item.kind==='synthetic'?'Жасанды демо':item.kind==='verified'?'Қолмен тексерілген':'Agent source'}</small><blockquote>${escapeHTML(item.text)}</blockquote>`).join('')}</article>`).join('')}</body></html>`;
  printWindow.document.write(html);printWindow.document.close();printWindow.focus();
  toast('Есеп ашылды. «PDF ретінде сақтау» батырмасын басыңыз.');
}

// 10. WORKSPACE CONTROLS.
function demoFiles() {return [{name:'Положение №8.docx',size:240000,demo:true},{name:'Положение №9.docx',size:268000,demo:true}];}
async function startDemo() {if(!DEMO_MODE){toast('Демо режимі өшірулі. Нақты құжаттарды тіркеңіз.');return;}if(activeTask)return;await connectDocuments(demoFiles());}
function switchSession(id) {
  const target=sessions.find(item=>item.id===id);if(!target)return;
  cancelTask();activeSessionId=id;$('#chat-input').value='';$('#chat-input').style.height='auto';$('#command-menu').hidden=true;
  $('#workspace').classList.remove('sidebar-open');
  if(target.seed&&!target.messages.length){
    target.files=demoFiles();target.connected=true;target.result=DEMO_RESULT;target.completedTools=5;
    target.messages.push({id:uid('message'),role:'user',text:target.seed==='structure'?'№8 және №9 құрылымын салыстыр':target.seed==='it'?'ДИТААД туралы толық түсіндір':'Екі редакцияны салыстыр.',files:target.files});
    target.messages.push(target.seed==='overview'?{id:uid('message'),role:'assistant',kind:'analysis',result:DEMO_RESULT}:{id:uid('message'),role:'assistant',demo:true,...demoAnswer(target.seed==='it'?'ДИТААД':'құрылым')});
  }
  renderSession(true);
}
function createFreshSession() {cancelTask();const session=newSession();activeSessionId=session.id;$('#chat-input').value='';$('#chat-input').style.height='auto';$('#command-menu').hidden=true;$('#workspace').classList.remove('sidebar-open');renderSession();$('#conversation').scrollTop=0;}
function setContext(visible) {settings.context=visible;$('#workspace').classList.toggle('context-hidden',!visible);$('#workspace').classList.toggle('context-open',visible&&innerWidth<=1050);$('#context-toggle').setAttribute('aria-pressed',String(visible));$('#context-setting').checked=visible;}
function setMotion(enabled) {settings.motion=enabled;document.body.classList.toggle('no-motion',!enabled);$('#motion-setting').checked=enabled;}
function visibleCommands() {const value=$('#chat-input').value.toLowerCase().trim();return COMMANDS.filter(item=>item.command.startsWith(value.split(' ')[0]));}
function updateCommands() {const value=$('#chat-input').value;const list=visibleCommands();const visible=value.startsWith('/')&&!value.includes(' ')&&list.length>0;$('#command-menu').hidden=!visible;if(!visible)return;commandIndex=Math.min(commandIndex,list.length-1);$('#command-menu').innerHTML=list.map((item,index)=>`<button class="command-option ${index===commandIndex?'selected':''}" data-command="${item.command}"><strong>${item.command}</strong><span>${item.label}</span></button>`).join('');}
function chooseCommand(command) {$('#chat-input').value=command+' ';$('#command-menu').hidden=true;$('#chat-input').focus();updateSendButton();}
function submitComposer() {if(activeTask){cancelTask();return;}const value=$('#chat-input').value;$('#chat-input').value='';$('#chat-input').style.height='auto';$('#command-menu').hidden=true;updateSendButton();sendMessage(value);}

document.addEventListener('click',event=>{
  const citation=event.target.closest('[data-citation]');if(citation){openEvidence(citation.dataset.citation);return;}
  const question=event.target.closest('[data-question]');if(question){sendMessage(question.dataset.question);return;}
  const session=event.target.closest('[data-session]');if(session){switchSession(session.dataset.session);return;}
  const action=event.target.closest('[data-action]');if(action){if(action.dataset.action==='compare')compareDocuments();if(action.dataset.action==='report')openReport();return;}
  const command=event.target.closest('[data-command]');if(command){chooseCommand(command.dataset.command);return;}
  const remove=event.target.closest('[data-remove-pending]');if(remove){pendingFiles[remove.dataset.removePending]=null;renderPendingFiles();return;}
  const close=event.target.closest('.close-dialog');if(close){close.closest('dialog').close();return;}
  if($('#workspace').classList.contains('sidebar-open')&&!event.target.closest('#sidebar,#mobile-menu'))$('#workspace').classList.remove('sidebar-open');
});
['#attach-button','#welcome-attach','#context-attach'].forEach(selector=>$(selector).addEventListener('click',openUpload));
$('#welcome-demo').addEventListener('click',startDemo);
$('#new-session').addEventListener('click',createFreshSession);
$('#brand-home').addEventListener('click',event=>{event.preventDefault();createFreshSession();});
$('#knowledge-button').addEventListener('click',()=>{setContext(true);if(!currentSession().files.length)openUpload();});
$('#connect-documents').addEventListener('click',()=>{if(!pendingFiles.old||!pendingFiles.new)return;const files=[pendingFiles.old,pendingFiles.new];$('#upload-dialog').close();connectDocuments(files);});
['old','new'].forEach(side=>{
  $(`#upload-${side}`).addEventListener('change',event=>{chooseFile(side,event.target.files[0]);event.target.value='';});
  const zone=$(`.upload-slot[data-side="${side}"] .drop-zone`);
  zone.addEventListener('dragover',event=>{event.preventDefault();zone.classList.add('drag-over');});
  zone.addEventListener('dragleave',()=>zone.classList.remove('drag-over'));
  zone.addEventListener('drop',event=>{event.preventDefault();zone.classList.remove('drag-over');if(event.dataTransfer.files.length!==1){$('#upload-error').textContent='Әр редакцияға бір файлдан таңдаңыз.';$('#upload-error').hidden=false;return;}chooseFile(side,event.dataTransfer.files[0]);});
});
document.addEventListener('dragover',event=>{if(event.dataTransfer?.types.includes('Files'))event.preventDefault();});
document.addEventListener('drop',event=>{if(event.dataTransfer?.types.includes('Files'))event.preventDefault();});
$('#send-button').addEventListener('click',submitComposer);
$('#chat-input').addEventListener('input',()=>{const field=$('#chat-input');field.style.height='auto';field.style.height=Math.min(field.scrollHeight,150)+'px';commandIndex=0;updateCommands();updateSendButton();});
$('#chat-input').addEventListener('keydown',event=>{
  if(event.isComposing)return;
  if(!$('#command-menu').hidden){if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();commandIndex=(commandIndex+(event.key==='ArrowDown'?1:-1)+visibleCommands().length)%visibleCommands().length;updateCommands();return;}if(event.key==='Tab'){event.preventDefault();chooseCommand(visibleCommands()[commandIndex].command);return;}if(event.key==='Escape'){event.preventDefault();$('#command-menu').hidden=true;return;}}
  if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();if(!$('#command-menu').hidden)chooseCommand(visibleCommands()[commandIndex].command);submitComposer();}
});
$('#command-button').addEventListener('click',()=>{$('#chat-input').value='/';$('#chat-input').focus();commandIndex=0;updateCommands();updateSendButton();});
$('#settings-button').addEventListener('click',()=>$('#settings-dialog').showModal());
$('#motion-setting').addEventListener('change',event=>setMotion(event.target.checked));
$('#context-setting').addEventListener('change',event=>setContext(event.target.checked));
$('#context-toggle').addEventListener('click',()=>setContext(!settings.context));
$('#context-close').addEventListener('click',()=>setContext(false));
$('#mobile-menu').addEventListener('click',()=>$('#workspace').classList.toggle('sidebar-open'));
$('#presentation-button').addEventListener('click',()=>{const enabled=document.body.classList.toggle('presentation');$('#presentation-button').setAttribute('aria-pressed',String(enabled));toast(enabled?'Презентация режимі қосылды. Шығу үшін монитор белгішесін басыңыз.':'Қалыпты көрініс қосылды.');});
$('#export-json').addEventListener('click',exportJSON);$('#export-csv').addEventListener('click',exportCSV);$('#export-pdf').addEventListener('click',exportPDF);
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();}));
document.addEventListener('keydown',event=>{if(event.key==='Escape')$('#workspace').classList.remove('sidebar-open');});
window.addEventListener('resize',()=>{if(settings.context)setContext(true);});

// 11. STARTUP.
if(DEMO_MODE){newSession('IT функцияларын талдау','it');newSession('Ішкі аудит құрылымы','structure');newSession('№8 ↔ №9 аудит ережелері','overview');}
activeSessionId=newSession().id;
if(!DEMO_MODE){
  $('#sidebar-mode').textContent='AGENT API / NOT CONNECTED';
  $('#demo-notice').textContent='Жауаптарды бастапқы құжаттармен тексеріңіз. AI қателесуі мүмкін.';
  $('#privacy-status').textContent='Файлдар Agent Backend-ке жіберіледі';
  $('#upload-mode-copy').textContent='Файлдар бапталған Agent серверіне жіберіледі';
  $('#settings-mode').textContent='LIVE API MODE';
  $('#settings-description').textContent='Құжаттар мен сұрақтар /api/documents, /api/compare және /api/chat арқылы Agent Backend-ке жіберіледі.';
  $('#welcome-demo').hidden=true;
}
setMotion(settings.motion);setContext(settings.context);renderSession();
