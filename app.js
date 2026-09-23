import { referenceExample } from './data/reference-example.js';
import { config } from './config.js';
import { normalizeAnalysis, requestAnalysis } from './analysis-api.js';

const icons = {
  building:'<path d="M4 21V5l8-3 8 3v16M2 21h20M9 21v-4h6v4M8 7h1m6 0h1M8 11h1m6 0h1"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
  folder:'<path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11H3V7Z"/>',
  chart:'<path d="M5 3h10l4 4v14H5V3Zm10 0v5h4M8 17v-3m4 3v-6m4 6v-3"/>',
  sparkles:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM4 2v4M2 4h4m14 14v4m-2-2h4"/>',
  'arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  'arrow-up-right':'<path d="M6 18 18 6M6 6h12v12"/>',
  home:'<path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3V10Z"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.3 9a2.8 2.8 0 0 1 5.4 1c0 2-2.7 2-2.7 4m0 3h.01"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/>',
  shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6"/>',
  'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  alert:'<path d="m12 3 10 18H2L12 3Zm0 6v5m0 3h.01"/>',
  copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  shuffle:'<path d="M3 5h3c5 0 7 14 12 14h3m-4-4 4 4-4 4M3 19h3c2 0 4-3 5-6m2-2c2-4 3-6 5-6h3m-4-4 4 4-4 4"/>',
  download:'<path d="M12 3v13m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  link:'<path d="m9 15 6-6m-5-3 2-2a5 5 0 0 1 7 7l-2 2m-3 5-2 2a5 5 0 0 1-7-7l2-2"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  x:'<path d="m6 6 12 12M6 18 18 6"/>',
  file:'<path d="M5 3h9l5 5v13H5V3Zm9 0v6h5M8 13h8m-8 4h6"/>',
  check:'<path d="m5 12 4 4L19 6"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.file}</svg>`;
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });

// These fixtures are invented for interface testing. They are not extracted from the supplied documents.
const source = (side, point, text) => ({ document: `Демо · Ішкі аудит туралы ереже (${side === 'before' ? '8' : '9'}-редакция)`, side, point, text });
const demoResults = [
  { id:'F-01', name:'Түзету шараларының орындалуын бақылау', department:'Ішкі аудит бөлімі', status:'lost', detail:'Кейінгі жинақта осы міндетке сәйкес функция табылмады.', recommendation:'Функцияның басқа бөлімшеге берілгенін тексеріп, жауапты тұлғаны белгілеу.', sources:[source('before','2.4','Ішкі аудит бөлімі тексеру қорытындысы бойынша түзету шараларының орындалуын бақылайды.')] },
  { id:'F-02', name:'Тәуекелдер тізілімін жаңарту', department:'Ішкі аудит / Тәуекелдерді басқару', status:'duplicate', detail:'Бірдей тізілімді жаңарту екі бөлімшеге қатар бекітілген.', recommendation:'Тізілімді жүргізуге жауапты бөлімшені және екінші бөлімшенің қатысу тәртібін нақтылау.', sources:[source('after','3.2','Ішкі аудит бөлімі корпоративтік тәуекелдер тізілімін жаңартады.'),source('after','4.1','Тәуекелдерді басқару бөлімі корпоративтік тәуекелдер тізілімін жаңартады.')] },
  { id:'F-03', name:'Ішкі бақылау рәсімдерін бағалау', department:'Ішкі аудит бөлімі', status:'conflict', detail:'Бір бөлімше рәсімді іске асырады және оның тиімділігін өзі бағалайды.', recommendation:'Бақылау рәсімін орындау мен тәуелсіз бағалауды әртүрлі жауапты тараптарға бөлу.', sources:[source('after','3.5','Ішкі аудит бөлімі операциялық бақылау рәсімдерін іске асырады.'),source('after','3.6','Ішкі аудит бөлімі өзі іске асыратын бақылау рәсімдерінің тиімділігін тәуелсіз бағалайды.')] },
  { id:'F-04', name:'Жылдық аудит жоспарын әзірлеу', department:'Ішкі аудит бөлімі', status:'retained', detail:'Функция мен жауапты бөлімше екі нұсқада да сақталған.', recommendation:'Қосымша әрекет қажет емес.', sources:[source('before','2.1','Ішкі аудит бөлімі жылдық аудит жоспарын әзірлейді.'),source('after','3.1','Жылдық аудит жоспарын әзірлеуге ішкі аудит бөлімі жауапты.')] },
  { id:'F-05', name:'Аудит материалдарын мұрағаттау', department:'Ішкі аудит бөлімі', status:'lost', detail:'Материалдарды сақтау міндеті кейінгі нұсқада көрсетілмеген.', recommendation:'Мұрағаттау функциясының жауаптысын және сақтау тәртібін нақтылау.', sources:[source('before','2.8','Ішкі аудит бөлімі аяқталған тексерулердің жұмыс құжаттарын мұрағаттауды қамтамасыз етеді.')] },
  { id:'F-06', name:'Аудит нәтижелерін ұсыну', department:'Ішкі аудит бөлімі', status:'retained', detail:'Есепті ұсыну міндеті жаңа редакцияда сақталған.', recommendation:'Қосымша әрекет қажет емес.', sources:[source('before','2.3','Ішкі аудит бөлімі аудит нәтижелері туралы есепті аудит комитетіне ұсынады.'),source('after','3.3','Аудит комитетіне аудит нәтижелері жөнінде есепті ішкі аудит бөлімі ұсынады.')] },
  { id:'F-07', name:'Тәуекелдерді сәйкестендіру', department:'Тәуекелдерді басқару бөлімі', status:'retained', detail:'Атауы нақтыланған, функцияның мағынасы өзгермеген.', recommendation:'Қосымша әрекет қажет емес.', sources:[source('before','4.2','Тәуекелдерді басқару бөлімі ұйым қызметіндегі тәуекелдерді анықтайды.'),source('after','4.2','Тәуекелдерді басқару бөлімі ұйымның қызметіне әсер ететін тәуекелдерді сәйкестендіреді.')] },
  { id:'F-08', name:'Аудит сапасын бағалау', department:'Ішкі аудит бөлімі', status:'retained', detail:'Аудит сапасын бағалау міндеті екі редакцияда да бар.', recommendation:'Қосымша әрекет қажет емес.', sources:[source('before','2.6','Ішкі аудит бөлімі аудит қызметінің сапасын бағалау бағдарламасын жүргізеді.'),source('after','3.7','Ішкі аудит бөлімі аудит қызметінің сапасын бағалау бағдарламасын іске асырады.')] }
];
const statusLabels = { lost:'Жоғалу қаупі', duplicate:'Қайталану', conflict:'Қақтығыс', retained:'Сақталды', changed:'Өзгерген', transferred:'Берілген', added:'Қосылған', uncertain:'Нақтылау қажет' };
const statusIcons = { lost:'alert', duplicate:'copy', conflict:'shuffle', retained:'check-circle', changed:'shuffle', transferred:'arrow-right', added:'plus', uncertain:'help' };
const departmentLabels = {retained:'Сақталған',reorganized:'Қайта ұйымдастырылған',created:'Құрылған',removed:'Алып тасталған',uncertain:'Нақтылау қажет'};
const state = { files:{before:[],after:[]}, results:[], departments:[], filter:'all', query:'', demo:false, hasAnalysis:false, origin:'', title:'', busy:false };
let activeController;
const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const badge = status => `<span class="badge badge-${status}">${icon(statusIcons[status])}${statusLabels[status]}</span>`;
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 5000); }
function inlineMessage(message) { $('#upload-message').textContent = message; $('#upload-message').hidden = !message; }
function clearAnalysis() { state.results = []; state.departments = []; state.hasAnalysis = false; state.title = ''; state.origin = ''; }
function analysisNote() {
  if (state.demo) return 'ДЕМО: құжат атаулары, тармақтар, үзінділер және тұжырымдар — жасанды тест деректері.';
  return `${state.origin === 'import' ? 'Файлдан ашылған нәтиже. Үзінділер бастапқы құжатпен автоматты түрде тексерілген жоқ.' : 'Агент серверінен алынған нәтиже.'} Қорытынды ұсынымдық сипатта. Әр маңызды тұжырымды жауапты қызметкер тексеруі тиіс.`;
}
function counts() { return Object.fromEntries(['all',...Object.keys(statusLabels)].map(status => [status,status === 'all' ? state.results.length : state.results.filter(row => row.status === status).length])); }
function acceptAnalysis(data, origin) { state.results = data.functions; state.departments = data.departments; state.demo = data.isDemo; state.title = data.title; state.origin = origin; state.hasAnalysis = true; resetFilter(); renderFiles(); renderResults(); }
function setBusy(busy) {
  state.busy = busy;
  $('#agent-progress').hidden = !busy;
  ['#analyze-button','#files-before','#files-after','#result-file','#load-demo','#empty-demo'].forEach(selector => { $(selector).disabled = busy; });
  document.querySelectorAll('.file-remove').forEach(button => { button.disabled = busy; });
  $('#step-analysis').classList.toggle('current',busy);
  $('#step-documents').classList.toggle('current',!busy && !state.hasAnalysis);
}
function setProgress(stage) {
  const descriptions = {
    uploading:['Құжаттар жіберілуде','Агент серверінен жауап күтеміз.'],
    queued:['Талдау кезекте','Сервер құжаттарды қабылдады. Агенттің жұмысты бастауын күтеміз.'],
    processing:['Агент құжаттарды талдап жатыр','Сервер өңдеу жүріп жатқанын хабарлады.'],
    results:['Нәтиже алынуда','Тұжырымдар мен дереккөздердің форматын тексереміз.']
  };
  $('#progress-title').textContent = descriptions[stage][0];
  $('#progress-description').textContent = descriptions[stage][1];
}
function formatSize(size) { return size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} МБ` : `${Math.max(1, Math.round(size / 1024))} КБ`; }
function fileMarkup(file, side, index) { return `<li class="file-item"><span class="file-type-icon">${icon('file')}</span><div class="file-details"><span class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span><span class="file-meta">${file.demo ? 'Демо файл · жасанды мысал' : `${formatSize(file.size)} · тек браузерде`}</span></div><span class="file-check">${icon('check-circle')}</span><button class="file-remove" data-remove="${side}:${index}" aria-label="${escapeHtml(file.name)} файлын алып тастау">${icon('x')}</button></li>`; }
function renderFiles() {
  ['before','after'].forEach(side => { $(`#list-${side}`).innerHTML = state.files[side].map((file,index) => fileMarkup(file,side,index)).join(''); });
  $('#analyze-button').innerHTML = `${icon('sparkles')}${state.demo && state.files.before.every(f=>f.demo) && state.files.after.every(f=>f.demo) ? 'Демо талдауды көрсету' : 'Агентті іске қосу'}${icon('arrow-right')}`;
  renderDocuments();
}
function renderDocuments() {
  $('#documents-content').innerHTML = ['before','after'].map(side => `<section class="document-group"><h3>${side === 'before' ? 'Дейін' : 'Кейін'} <span class="demo-tag">${state.files[side].length} файл</span></h3>${state.files[side].length ? `<ul class="file-list">${state.files[side].map((file,index) => fileMarkup(file,side,index)).join('')}</ul>` : '<p class="documents-empty">Бұл жинаққа файл қосылмаған</p>'}</section>`).join('');
}
function renderResults() {
  $('#results-section').hidden = !state.hasAnalysis;
  $('#no-analysis').hidden = state.hasAnalysis || state.busy;
  const totals = counts();
  document.querySelectorAll('.stat-card').forEach(card => { card.querySelector('.stat-number').firstChild.nodeValue = totals[card.dataset.filter]; });
  document.querySelectorAll('.filter').forEach(button => { button.querySelector('span').textContent = totals[button.dataset.filter]; });
  $('.stat-card[data-filter="all"] .stat-bottom').innerHTML = `${icon('building')}${state.departments.length} бөлімше сәйкестігі`;
  $('#result-mode').textContent = state.demo ? 'ДЕМО' : state.origin === 'import' ? 'ФАЙЛДАН' : 'АГЕНТ';
  $('#result-title').textContent = state.title;
  $('#result-ready').innerHTML = `${icon('check-circle')}${state.demo ? 'Жасанды мысал' : 'Нәтиже дайын'}`;
  $('#result-disclaimer').innerHTML = `${icon('info')}${escapeHtml(analysisNote())}`;
  $('#insight-summary').textContent = `${totals.lost + totals.duplicate + totals.conflict} ықтимал тәуекел. Тұжырымдарды дереккөздерімен тексеріңіз.`;
  $('#step-evidence').classList.toggle('current',state.hasAnalysis);
  $('#step-documents').classList.toggle('current',!state.hasAnalysis && !state.busy);
  const rows = state.results.filter(row => (state.filter === 'all' || row.status === state.filter) && `${row.name} ${row.department} ${row.detail}`.toLocaleLowerCase('kk').includes(state.query.toLocaleLowerCase('kk')));
  $('#results-body').innerHTML = rows.map(row => `<tr><td class="number-cell">${String(state.results.indexOf(row)+1).padStart(2,'0')}</td><td><div class="function-name">${escapeHtml(row.name)}</div><div class="function-department">${escapeHtml(row.department)}</div></td><td>${badge(row.status)}</td><td class="result-text">${escapeHtml(row.detail)}</td><td><button class="source-button" data-source="${escapeHtml(row.id)}" aria-label="${escapeHtml(row.name)}: дереккөздерді ашу">${icon('file')}${row.sources.length} дереккөз${icon('arrow-up-right')}</button></td></tr>`).join('');
  $('#empty-state').hidden = rows.length > 0;
  $('#row-count').textContent = `${state.results.length} нәтижеден ${rows.length} көрсетілді`;
  document.querySelectorAll('.filter').forEach(button => { const active = button.dataset.filter === state.filter; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); });
  renderReport();
}
function setFilter(filter) { state.filter = filter; renderResults(); }
function resetFilter() { state.filter = 'all'; state.query = ''; $('#search-input').value = ''; }
function loadDemo(notify = true) {
  if (Object.values(state.files).flat().some(file => !file.demo)) {
    toast('Алдымен «Жаңа талдау» арқылы ағымдағы файлдар тізімін тазалаңыз.');
    return;
  }
  state.demo = true;
  state.files = {before:[{name:'Ішкі аудит · 8-редакция (демо).docx',demo:true}],after:[{name:'Ішкі аудит · 9-редакция (демо).docx',demo:true}]};
  state.results = demoResults; state.hasAnalysis = true; state.origin = 'demo'; state.title = 'Ішкі аудит · жасанды бақылау мысалы';
  state.departments = [
    {before:'Ішкі аудит бөлімі',after:'Ішкі аудит бөлімі',status:'retained',sources:demoResults[3].sources},
    {before:'Тәуекелдерді басқару бөлімі',after:'Тәуекелдерді басқару бөлімі',status:'retained',sources:demoResults[6].sources}
  ];
  resetFilter(); inlineMessage(''); renderFiles(); renderResults();
  if (notify) { navigate('analysis'); toast('Демо мысал ашылды. Барлық тұжырымдар — жасанды тест деректері.'); }
}
function addFiles(side, files) {
  if (state.busy) { toast('Файлдарды өзгерту үшін алдымен күтуді тоқтатыңыз.'); return; }
  const supported = /\.(docx?|pdf|xlsx?)$/i;
  const incoming = Array.from(files);
  const errors = [];
  const accepted = [];
  incoming.forEach(file => {
    if (!supported.test(file.name)) errors.push(`${file.name}: Word, PDF немесе Excel файлын таңдаңыз.`);
    else if (file.size === 0) errors.push(`${file.name}: файл бос.`);
    else if (file.size > 20 * 1024 * 1024) errors.push(`${file.name}: көлемі 20 МБ-тан артық.`);
    else accepted.push(file);
  });
  if (accepted.length) {
    if (state.demo) state.files = {before:[],after:[]};
    state.demo = false; clearAnalysis();
    accepted.forEach(file => { if (!state.files[side].some(existing => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified)) state.files[side].push(file); });
    resetFilter(); renderFiles(); renderResults();
    toast(`${accepted.length} файл таңдалды. Файлдар серверге жіберілген жоқ.`);
  }
  inlineMessage(errors.join(' '));
}
const views = {
  example:{title:'Нақты өзгеріс. Нақты тармақ<span>.</span>',description:'Берілген 8 және 9-редакциялардан қолмен тексерілген үш мысал.',breadcrumb:'Нақты құжат мысалы'},
  analysis:{title:'Құжаттарды агентпен салыстыру<span>.</span>',description:'Өзгерістерді анықтау, функцияларды салыстыру және дереккөздері бар қорытынды алу.',breadcrumb:'Өзгерістерді талдау'},
  documents:{title:'Барлық құжат бір жерде<span>.</span>',description:'Бастапқы және жаңартылған құжаттар жинағын басқарыңыз.',breadcrumb:'Құжаттар'},
  report:{title:'Дәлелге сүйенген қорытынды<span>.</span>',description:'Анықталған өзгерістер, ықтимал тәуекелдер және келесі қадамдар.',breadcrumb:'Аналитикалық қорытынды'}
};
function showView(view) {
  if (!views[view]) view = 'analysis';
  document.querySelectorAll('.view').forEach(el => { el.hidden = el.id !== `view-${view}`; });
  document.querySelectorAll('[data-view]').forEach(el => { el.classList.toggle('active',el.dataset.view === view); if (el.dataset.view === view) el.setAttribute('aria-current','page'); else el.removeAttribute('aria-current'); });
  $('#page-title').innerHTML = views[view].title;
  $('#page-description').textContent = views[view].description;
  $('#breadcrumb-current').textContent = views[view].breadcrumb;
}
function navigate(view) { location.hash = view; showView(view); window.scrollTo({top:0,behavior:'instant'}); }
function openSource(id) {
  const row = id.startsWith('department:') ? (()=>{const item=state.departments[Number(id.slice(11))]; return item ? {name:`${item.before || '—'} → ${item.after || '—'}`,status:'changed',detail:departmentLabels[item.status],recommendation:'Бөлімшенің мәртебесін бастапқы құжаттармен тексеріңіз.',sources:item.sources} : null;})() : state.results.find(item => item.id === id);
  if (!row) return;
  $('#source-title').textContent = row.name;
  $('#source-content').innerHTML = `${badge(row.status)}<p class="source-summary">${escapeHtml(row.detail)}</p>${row.sources.map(item => `<article class="source-block"><h3>${item.side === 'before' ? 'Дейін' : 'Кейін'} · ${escapeHtml(item.point)}-тармақ</h3><p>${escapeHtml(item.document)}</p><blockquote>${escapeHtml(item.text)}</blockquote></article>`).join('')}${row.status === 'lost' ? '<article class="source-block"><h3>Сәйкестік туралы</h3><p class="no-match">Сәйкестіктің табылмауы функцияның жойылғанын толық дәлелдемейді. Оның басқа құжатқа немесе бөлімшеге ауысқанын тексеру керек.</p></article>' : ''}<p class="source-summary"><strong>Ұсыным:</strong> ${escapeHtml(row.recommendation)}</p>`;
  $('#source-dialog .dialog-footer>span').textContent = analysisNote();
  $('#source-dialog').showModal();
}
function reportBody(interactive = true) {
  const totals = counts();
  const quotes = sources => sources.map(item => `<div class="source-block"><h3>${escapeHtml(item.document)} · ${escapeHtml(item.point)}-тармақ</h3><blockquote>${escapeHtml(item.text)}</blockquote></div>`).join('');
  const breakdown = Object.keys(statusLabels).filter(key=>totals[key]).map(key=>`${statusLabels[key]}: ${totals[key]}`).join(' · ');
  return `<div class="report-top"><div><span class="demo-tag">${state.demo ? 'ДЕМО ҚОРЫТЫНДЫ' : 'АНАЛИТИКАЛЫҚ ҚОРЫТЫНДЫ'}</span><h2 class="report-title">${escapeHtml(state.title)}</h2><p>${state.origin === 'import' ? 'Нәтиже файлдан ашылды' : state.demo ? 'Жасанды бақылау мысалы' : 'Агент серверінің нәтижесі'}</p></div>${interactive ? `<button class="button button-primary" data-export>${icon('download')}HTML жүктеу</button>` : ''}</div>
  <p class="report-summary"><strong>${totals.all} функция</strong> және <strong>${state.departments.length} бөлімше сәйкестігі</strong> берілді.<br>${escapeHtml(breakdown || 'Функциялар тізімі бос.')}</p>
  <h3>Бөлімшелердің сәйкестігі</h3><div class="structure-overview">${state.departments.map((item,index)=>`<div class="structure-item">${escapeHtml(item.before || '—')} → ${escapeHtml(item.after || '—')}<span>${departmentLabels[item.status]}</span>${interactive ? `<button class="source-button" data-source="department:${index}">${icon('file')}Дереккөздер</button>` : quotes(item.sources)}</div>`).join('') || '<p>Бөлімшелер сәйкестігі берілмеген.</p>'}</div>
  ${state.results.map(row=>`<section class="report-section">${badge(row.status)}<h3>${escapeHtml(row.name)}</h3><p>${escapeHtml(row.detail)}</p><p class="report-action"><strong>Ұсыным:</strong> ${escapeHtml(row.recommendation)}</p>${interactive ? `<button class="source-button" data-source="${escapeHtml(row.id)}">${icon('file')}Растайтын үзінділерді ашу${icon('arrow-up-right')}</button>` : quotes(row.sources)}</section>`).join('')}
  <p class="report-warning">${escapeHtml(analysisNote())}</p>`;
}
function renderReport() { $('#report-content').innerHTML = state.hasAnalysis ? reportBody() : `<div class="report-empty"><span class="large-icon">${icon('chart')}</span><h2>Қорытынды әзірге жоқ</h2><p>Агент талдауын іске қосыңыз, дайын нәтижені немесе демоны ашыңыз.</p><button class="button button-primary" id="report-go-analysis">Талдауға өту${icon('arrow-right')}</button></div>`; }
function exportReport() {
  if (!state.hasAnalysis) { toast('Жүктеу үшін алдымен талдау нәтижесін ашыңыз.'); return; }
  const report = `<!doctype html><html lang="kk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Qurylym — ${escapeHtml(state.title)}</title><style>body{font-family:Arial,sans-serif;max-width:900px;padding:36px;margin:auto;color:#264b3d;line-height:1.8}h2{font-size:25px}h3{font-size:17px}.demo-tag,.badge{font-size:12px;background:#edf5ef;padding:5px 9px;border-radius:5px}.badge svg{width:14px;height:14px;margin-right:6px;vertical-align:middle}.report-section{border-bottom:1px solid #dfe8e2;padding:25px 0;break-inside:avoid}.report-warning{padding:18px;background:#fcf4e4}.structure-item{padding:12px;border:1px solid #e5ece6;margin:10px 0}.structure-item span{display:block}.source-block{background:#f6f9f6;padding:12px 18px;margin-top:14px}.source-block h3{font-size:12px}blockquote{margin:8px 0;font-size:13px}.report-action{color:#427356}@media print{body{padding:0}.source-block{break-inside:avoid}}</style></head><body>${reportBody(false)}</body></html>`;
  const blob = new Blob([report],{type:'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = state.demo ? 'qurylym-demo-report.html' : 'qurylym-report.html'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url),30000);
  toast('Қорытынды HTML форматында жүктелді.');
}

function renderReferenceExample() {
  const labels = {added:'Тізімге қосылған',retained:'Сақталған'};
  $('#reference-content').innerHTML = `
    <div class="reference-intro"><span class="reference-seal">${icon('check-circle')}ҚОЛМЕН ТЕКСЕРІЛГЕН</span><p>Бұл беттегі үзінділер берілген құжаттардан алынды. Олар автоматты AI талдауы емес. Функциялар кестесіндегі жасанды демодан бөлек көрсетілген.</p></div>
    <section class="reference-hero panel"><div><div class="eyebrow">ІШКІ АУДИТТІҢ ҚҰРЫЛЫМЫ</div><h2>8-редакциядан 9-редакцияға</h2><p>3.4-тармақтағы бөлімшелер тізімін салыстыру</p></div><div class="edition-change"><span>08<small>2 бөлімше</small></span>${icon('arrow-right')}<span>09<small>4 бөлімше</small></span></div></section>
    <div class="reference-departments">${referenceExample.departments.map(dept=>`<article class="panel reference-department"><span class="badge ${dept.status === 'added' ? 'badge-added' : 'badge-retained'}">${icon(dept.status === 'added' ? 'plus' : 'check')}${labels[dept.status]}</span><h3>${escapeHtml(dept.name)}</h3><p lang="ru">${escapeHtml(dept.fullName)}</p></article>`).join('')}</div>
    ${referenceExample.findings.map((finding,index)=>`<section class="panel reference-finding"><div class="reference-finding-heading"><span class="reference-number">0${index+1}</span><div><h2>${escapeHtml(finding.title)}</h2><p>${escapeHtml(finding.description)}</p></div></div><div class="reference-sources">${finding.sources.map(item=>`<article class="source-block"><h3>${item.side==='before'?'Дейін · 8-редакция':'Кейін · 9-редакция'} <span>${escapeHtml(item.point)}-тармақ</span></h3><p class="reference-filename" title="${escapeHtml(item.document)}">${escapeHtml(item.document)}</p><blockquote lang="ru">${escapeHtml(item.text)}</blockquote></article>`).join('')}</div><p class="reference-note">${icon('info')}${escapeHtml(finding.qualification)}</p></section>`).join('')}
    <div class="reference-outro"><p>Құжат атауы мен тармақ нөмірі әр үзіндіде сақталған. […] белгісі аралық мәтіннің қысқартылғанын білдіреді.</p><button class="button button-primary" id="reference-to-demo">Интерфейс демосына өту${icon('arrow-right')}</button></div>`;
}

['before','after'].forEach(side => {
  $(`#files-${side}`).addEventListener('change', event => { addFiles(side,event.target.files); event.target.value = ''; });
  const zone = $(`.drop-zone[data-side="${side}"]`);
  let dragDepth = 0;
  zone.addEventListener('dragenter', event => { event.preventDefault(); dragDepth++; zone.classList.add('drag-over'); });
  zone.addEventListener('dragover', event => event.preventDefault());
  zone.addEventListener('dragleave', () => { if (--dragDepth <= 0) zone.classList.remove('drag-over'); });
  zone.addEventListener('drop', event => { event.preventDefault(); dragDepth = 0; zone.classList.remove('drag-over'); addFiles(side,event.dataTransfer.files); });
});
document.addEventListener('dragover', event => { if (event.dataTransfer?.types.includes('Files')) event.preventDefault(); });
document.addEventListener('drop', event => { if (event.dataTransfer?.types.includes('Files')) event.preventDefault(); });
document.addEventListener('click', event => {
  const remove = event.target.closest('[data-remove]');
  if (remove) { if(state.busy)return; const [side,index] = remove.dataset.remove.split(':'); state.files[side].splice(Number(index),1); clearAnalysis(); renderFiles(); renderResults(); inlineMessage(''); return; }
  const filter = event.target.closest('[data-filter]');
  if (filter) { setFilter(filter.dataset.filter); return; }
  const sourceButton = event.target.closest('[data-source]');
  if (sourceButton) { openSource(sourceButton.dataset.source); return; }
  if (event.target.closest('[data-export]')) exportReport();
  if (event.target.closest('#report-go-analysis')) navigate('analysis');
  if (event.target.closest('#reference-to-demo')) navigate('analysis');
  const close = event.target.closest('.close-dialog');
  if (close) close.closest('dialog').close();
});
$('#search-input').addEventListener('input', event => { state.query = event.target.value.trim(); renderResults(); });
$('#clear-search').addEventListener('click', () => { resetFilter(); renderResults(); });
$('#load-demo').addEventListener('click', () => loadDemo());
$('#empty-demo').addEventListener('click', () => loadDemo());
$('#new-analysis').addEventListener('click', () => { activeController?.abort(); activeController = null; state.files = {before:[],after:[]}; clearAnalysis(); state.demo = false; setBusy(false); resetFilter(); inlineMessage(''); renderFiles(); renderResults(); navigate('analysis'); toast('Жаңа талдау дайын. Екі нұсқаның құжаттарын қосыңыз.'); });
$('#analyze-button').addEventListener('click', async () => {
  if (!state.files.before.length || !state.files.after.length) { inlineMessage('Салыстыру үшін «Дейін» және «Кейін» жинақтарының әрқайсысына кемінде бір файл қосыңыз.'); return; }
  if (Object.values(state.files).flat().every(file=>file.demo)) { loadDemo(false); $('#results-section').scrollIntoView({behavior:'smooth',block:'start'}); return; }
  const controller = new AbortController(); activeController = controller;
  let timedOut = false;
  const timer = setTimeout(()=>{timedOut=true;controller.abort();},config.timeoutMs);
  clearAnalysis(); inlineMessage(''); setBusy(true); setProgress('uploading'); renderResults();
  try {
    const data = await requestAnalysis(state.files,config,controller.signal,setProgress);
    if (activeController !== controller) return;
    acceptAnalysis(data,'api'); toast('Агент нәтижесі дайын. Дереккөздерді тексеріңіз.');
  } catch(error) {
    if (activeController !== controller) return;
    inlineMessage(controller.signal.aborted ? (timedOut ? 'Күту уақыты аяқталды. Сервердегі тапсырма жалғасуы мүмкін. Қайта жібермес бұрын күйін командамен тексеріңіз.' : 'Күту тоқтатылды. Сервердегі тапсырма жалғасуы мүмкін.') : error.message);
  } finally {
    clearTimeout(timer);
    if (activeController === controller) { activeController = null; setBusy(false); renderResults(); }
  }
});
$('#stop-waiting').addEventListener('click',()=>activeController?.abort());
$('#result-file').addEventListener('change',async event=>{
  const file = event.target.files[0]; event.target.value=''; if(!file)return;
  try {
    if(file.size>10*1024*1024)throw new Error('Нәтиже файлы 10 МБ-тан аспауы тиіс.');
    const data=normalizeAnalysis(JSON.parse(await file.text()));
    if(state.busy)throw new Error('Алдымен агент нәтижесін күтуді тоқтатыңыз.');
    state.files={before:[],after:[]}; acceptAnalysis(data,'import'); inlineMessage(''); toast('Дайын нәтиже ашылды. Дереккөздерді түпнұсқамен тексеріңіз.');
  }catch(error){inlineMessage(error instanceof SyntaxError ? 'JSON файлының пішімі жарамсыз.' : error.message);}
});
$('#export-button').addEventListener('click',exportReport);
$('#open-report').addEventListener('click',() => navigate('report'));
$('#add-documents').addEventListener('click',() => navigate('analysis'));
['#help-button','#guide-button'].forEach(id => $(id).addEventListener('click',() => $('#guide-dialog').showModal()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }));
window.addEventListener('hashchange',() => showView(location.hash.slice(1)));
renderFiles();
renderResults();
renderReferenceExample();
showView(location.hash.slice(1));
