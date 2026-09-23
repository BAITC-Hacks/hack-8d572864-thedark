export const functionStatuses = ['lost', 'duplicate', 'conflict', 'retained', 'changed', 'transferred', 'added', 'uncertain'];
const departmentStatuses = ['retained', 'reorganized', 'created', 'removed', 'uncertain'];

function requiredText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label}: бос емес мәтін қажет.`);
  return value.trim();
}
function normalizeSources(items, label) {
  if (!Array.isArray(items) || !items.length) throw new Error(`${label}: кемінде бір дереккөз қажет.`);
  return items.map(item => {
    if (!item || !['before', 'after'].includes(item.side)) throw new Error(`${label}: дереккөздің side мәні before немесе after болуы тиіс.`);
    return {
      document: requiredText(item.document, `${label} құжаты`),
      point: requiredText(item.point, `${label} тармағы`),
      text: requiredText(item.text, `${label} үзіндісі`),
      side: item.side
    };
  });
}

export function normalizeAnalysis(input) {
  if (!input || typeof input !== 'object') throw new Error('Талдау нәтижесінің форматы жарамсыз.');
  if (!Array.isArray(input.functions) || !Array.isArray(input.departments)) throw new Error('Нәтижеде functions және departments тізімдері болуы тиіс.');
  if (typeof input.isDemo !== 'boolean') throw new Error('Нәтиженің isDemo мәні true немесе false болуы тиіс.');
  const ids = new Set();
  const functions = input.functions.map((item, index) => {
    const label = `Функция ${index + 1}`;
    if (!item || !functionStatuses.includes(item.status)) throw new Error(`${label}: белгісіз өзгеріс түрі.`);
    const id = requiredText(item.id, `${label} идентификаторы`);
    if (id.startsWith('department:')) throw new Error(`${label}: department: префиксі қызметтік навигацияға арналған.`);
    if (ids.has(id)) throw new Error(`${id}: функция идентификаторы қайталанған.`);
    ids.add(id);
    const sources = normalizeSources(item.sources, label);
    if (['duplicate', 'conflict'].includes(item.status) && sources.length < 2) throw new Error(`${label}: қайталану мен қақтығыс үшін кемінде екі дереккөз қажет.`);
    return { id, status:item.status, name:requiredText(item.name,label), department:requiredText(item.department,`${label} бөлімшесі`), detail:requiredText(item.detail,`${label} түсіндірмесі`), recommendation:requiredText(item.recommendation,`${label} ұсынымы`), sources };
  });
  const departments = input.departments.map((item,index) => {
    const label = `Бөлімше ${index + 1}`;
    if (!item || !departmentStatuses.includes(item.status)) throw new Error(`${label}: белгісіз өзгеріс түрі.`);
    const before = typeof item.before === 'string' ? item.before.trim() : '';
    const after = typeof item.after === 'string' ? item.after.trim() : '';
    if (!before && !after) throw new Error(`${label}: бастапқы немесе кейінгі атауы қажет.`);
    return {before, after, status:item.status, sources:normalizeSources(item.sources,label)};
  });
  return {title:typeof input.title === 'string' && input.title.trim() ? input.title.trim() : 'Ұйымдық өзгерістерді талдау', isDemo:input.isDemo, functions, departments};
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener('abort',abort); resolve(); }, ms);
    signal.addEventListener('abort', abort, {once:true});
  });
}
export async function requestAnalysis(files, config, signal, onProgress) {
  const base = config.apiBaseUrl.replace(/\/$/, '');
  async function request(url, options = {}) {
    let response;
    try { response = await fetch(url, {...options, signal, headers:{Accept:'application/json',...options.headers}}); }
    catch (error) { if (signal.aborted) throw error; throw new Error('Агент серверіне қосылу мүмкін болмады. Қосылым мен Backend мекенжайын тексеріңіз.'); }
    if (!response.ok) {
      if (response.status === 404 || response.status === 405) throw new Error('Талдау API-ы әлі қосылмаған. Команда Backend-ті қосқаннан кейін құжаттарды талдауға болады. Қазір демоны немесе дайын нәтижені ашыңыз.');
      throw new Error(`Агент сервері сұрауды орындай алмады (HTTP ${response.status}). Қайта көріңіз.`);
    }
    try { return await response.json(); } catch { throw new Error('Агент серверінен жарамсыз жауап келді.'); }
  }
  const body = new FormData();
  files.before.forEach(file => body.append('before[]',file));
  files.after.forEach(file => body.append('after[]',file));
  onProgress('uploading');
  const created = await request(`${base}/analyses`,{method:'POST',body});
  const id = requiredText(created.id,'Талдау идентификаторы');
  let status = created.status;
  while (true) {
    if (!['queued','processing','completed','failed'].includes(status)) throw new Error('Сервер белгісіз талдау күйін қайтарды.');
    if (status === 'failed') throw new Error('Агент құжаттарды талдай алмады. Құжаттарды тексеріп, қайта көріңіз.');
    if (status === 'completed') break;
    onProgress(status);
    await delay(config.pollIntervalMs,signal);
    const progress = await request(`${base}/analyses/${encodeURIComponent(id)}`);
    status = progress.status;
  }
  onProgress('results');
  return normalizeAnalysis(await request(`${base}/analyses/${encodeURIComponent(id)}/results`));
}
