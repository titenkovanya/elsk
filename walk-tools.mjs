import {motionReduced} from './accessibility.mjs?v=20261015-sequence';
import qrcode from './vendor/qrcode.mjs';

export const ROUTE_LENGTH=1050;
export const paceOptions={
  calm:{title:'Спокойная прогулка',subtitle:'Без спешки, с паузами',intro:'Основной круг с заходом к беседке и передышкой среди деревьев. Останавливайтесь, когда хочется.'},
  brisk:{title:'Быстрый круг',subtitle:'Чуть бодрее, в своём темпе',intro:'Основной круг без захода к беседке и экранной передышки. Сохраняйте удобный для себя темп.'},
  nordic:{title:'Скандинавская ходьба',subtitle:'С палками по общей дорожке',intro:'Тот же круг с подсказками для прогулки с палками. Технику и настройку оборудования поможет освоить инструктор.'}
};
export const normalizePace=value=>Object.hasOwn(paceOptions,value)?value:'calm';
export const emotions={start:'Место встречи и начало вашей истории',right:'Аллея для прогулки в своём ритме',top:'Ближе к тишине леса',entrance:'Небольшой шаг в сторону спокойствия',forest:'Место, где можно никуда не спешить',left:'Пространство для движения и короткой разминки',bottom:'Точка отдыха и неспешного общения',finish:'Возвращение к сердцу маршрута'};
const checkpoints=[
  [100,'Плечи свободны','Можно расслабить плечи и прислушаться к своему ритму.'],
  [200,'Найдите свой ритм','Продолжайте в удобном темпе: здесь важнее регулярность, чем скорость.'],
  [300,'Движение в вашем темпе','Оцените, комфортно ли вам идти. Вы можете изменить темп или сделать паузу.'],
  [400,'Посмотрите вокруг','Лесная сторона приглашает ненадолго отвлечься от повседневных дел.'],
  [500,'Близко к середине','Половина круга — примерно 525 метров. Впереди место для спокойной передышки.'],
  [600,'Продолжаем прогулку','Возвращайтесь к движению в удобном ритме. Можно пройти только часть круга.'],
  [700,'Движение без спешки','Рядом спортивная площадка. Остановиться у неё или продолжить прогулку — ваш выбор.'],
  [800,'Можно снизить темп','Если хочется передохнуть, впереди есть места для остановки.'],
  [900,'Площадка отдыха рядом','Навес, шахматы и скамейки дополняют прогулку возможностью пообщаться.'],
  [1000,'Финиш уже близко','Остаётся около 50 метров до сердца. Завершайте прогулку в комфортном темпе.']
];
const customTips={
  brisk:{500:['Продолжаем основной круг','Близко к середине. Следующий участок — спортивная площадка; заход в лес оставлен для отдельного просмотра.'],200:['Ровный, удобный темп','При более бодрой ходьбе сохраняйте возможность разговаривать.'],300:['Можно идти чуть бодрее','Если вам комфортно, выберите более энергичный темп. Ускоряться не обязательно.'],600:['Вернитесь к своему ритму','После паузы продолжайте с удобной для вас скоростью.'],800:['Спокойнее к финишу','Можно постепенно перейти к более спокойному шагу.']},
  nordic:{500:['Половина круга рядом','Продолжайте по общей дорожке и оставляйте место для движения палками.'],100:['Палки готовы к прогулке?','Проверьте, удобно ли держать рукоятки. Настройку палок лучше обсудить с инструктором.'],200:['Одна дорожка для всех','Оставляйте достаточно места для движения палками и для других пешеходов.'],300:['Поймайте согласованный ритм','Пусть движения рук и ног остаются удобными. Технику отталкивания полезно освоить с инструктором.'],700:['Свободный проход','У тренажёров сохраните место для других участников прогулки.'],1000:['Круг с палками завершён','Последние метры — в своём ритме. Можно остановиться у фотозоны.']}
};
export function checkpointFor(distance,pace='calm') {
  const index=Math.min(9,Math.floor(Number(distance)/100)-1);
  if(index<0||!Number.isFinite(index))return {distance:0,title:'Начинаем в своём ритме',text:paceOptions[normalizePace(pace)].intro};
  const [meters,title,text]=checkpoints[index],custom=customTips[normalizePace(pace)]?.[meters];
  return {distance:meters,title:custom?.[0]||title,text:custom?.[1]||text};
}
export function distanceAt(tops,meters,anchor) {
  if(!tops.length||tops.length!==meters.length)return 0;
  if(anchor<=tops[0])return 0;
  for(let i=0;i<tops.length-1;i++){
    if(anchor<tops[i+1]){
      const span=tops[i+1]-tops[i],part=span>0?(anchor-tops[i])/span:0;
      return Math.round(Math.max(0,Math.min(ROUTE_LENGTH,meters[i]+(meters[i+1]-meters[i])*part)));
    }
  }
  return ROUTE_LENGTH;
}
const programOptions={
 calm:{speed:[2.5,3.5],steps:['start','right','top','entrance','forest','left','bottom','finish'],short:'Спокойный ритм',route:'Круг + лесная полянка',details:['Заходим к беседке и качелям.','В середине — экран для спокойной передышки.','Подсказки напоминают о паузах и удобном ритме.'],equipment:'Удобная обувь и вода.'},
 brisk:{speed:[4,5.5],steps:['start','right','top','left','bottom','finish'],short:'Быстрый круг',route:'Основной круг',details:['Проходим круг без лесного ответвления.','Кнопка «Дальше» ведёт сразу к следующему основному участку.','Подсказки помогают сохранять ровный темп и спокойнее завершить круг.'],equipment:'Специальное оборудование не требуется.'},
 nordic:{speed:[3,4.5],steps:['start','right','top','left','bottom','finish'],short:'С палками',route:'Основной круг с палками',details:['Общий круг без обязательного захода в лес.','На старте проверяем оборудование.','На дистанции появляются подсказки о палках, ритме и свободном проходе.'],equipment:'Нужны палки для скандинавской ходьбы. Настройку и технику лучше освоить с инструктором.'}
};
export function walkingProgram(pace='calm'){return programOptions[normalizePace(pace)];}
export function walkingTime(distance=ROUTE_LENGTH,pace='calm'){const [slow,fast]=walkingProgram(pace).speed,meters=Math.max(0,Number(distance)||0);return {min:Math.ceil(meters*60/(1000*fast)),max:Math.ceil(meters*60/(1000*slow))};}
export function walkingTimeLabel(distance=ROUTE_LENGTH,pace='calm'){const time=walkingTime(distance,pace);return time.min===time.max?`${time.min} мин`:`${time.min}–${time.max} мин`;}
export function pacePlanMarkup(pace='calm'){pace=normalizePace(pace);const plan=walkingProgram(pace);return `<div class="pace-plan-heading"><div><p class="eyebrow">Ваш план прогулки</p><h3>${paceOptions[pace].title}</h3><p>${plan.route} · ${plan.steps.length} экранов маршрута</p></div><div class="pace-plan-time"><span>Ориентир по времени</span><strong>≈ ${walkingTimeLabel(ROUTE_LENGTH,pace)}</strong><small>ходьбы по основному кругу</small></div></div><ul>${plan.details.map(line=>`<li>${line}</li>`).join('')}</ul><p class="pace-equipment">${plan.equipment}</p><div class="pace-plan-bottom"><button class="primary-button" data-walk-target="start">Начать выбранную прогулку ↓</button><p>Расчёт при условной скорости ${plan.speed.join('–').replaceAll('.',',')} км/ч. Паузы и длина лесного ответвления в расчёт не включены. Это ориентир, а не рекомендуемая скорость.</p></div>`;}
export function preferencesMarkup(pace='calm') {pace=normalizePace(pace);return `<section class="walk-preferences" aria-labelledby="pace-title"><div><p class="eyebrow">Одна дорожка · ваш выбор</p><h2 id="pace-title">Как хотите пройти?</h2></div><div class="pace-options" role="group" aria-label="Формат прогулки">${Object.entries(paceOptions).map(([id,p])=>`<button data-walk-pace="${id}" aria-pressed="${id===pace}"><span class="pace-symbol" aria-hidden="true">${id==='calm'?'◌':id==='brisk'?'↗':'╱╱'}</span><strong>${p.title}</strong><small>${p.subtitle}</small></button>`).join('')}</div><p id="pace-description">${paceOptions[pace].intro}</p><div class="pace-plan" id="pace-plan" aria-live="polite" aria-atomic="true">${pacePlanMarkup(pace)}</div></section>`;}
export function progressMarkup() {return `<div class="walk-progress" aria-label="Прогресс виртуальной прогулки"><div class="walk-progress-labels"><span>Старт</span><output id="walk-distance">0 / 1 050 м</output><span>Финиш</span></div><div class="walk-progress-track" id="walk-progress-bar" role="progressbar" aria-label="Условное прохождение схемы" aria-valuemin="0" aria-valuemax="1050" aria-valuenow="0"><i id="walk-progress-fill"></i><span id="walk-progress-dot"></span></div><small>Прогресс просмотра схемы · длина круга приблизительная</small></div>`;}
export function checkpointsMarkup() {return `<section class="walk-checkpoints" aria-label="Остановки каждые 100 метров"><div class="checkpoint-current"><span id="checkpoint-meter">Старт</span><h3 id="checkpoint-title">Начинаем в своём ритме</h3><p id="checkpoint-text">${paceOptions.calm.intro}</p></div><details class="checkpoint-log"><summary>Остановки на круге <span id="checkpoint-count">0 / 10</span></summary><div class="checkpoint-buttons">${checkpoints.map(([meters])=>`<button data-checkpoint="${meters}" disabled aria-pressed="false">${meters} м</button>`).join('')}</div><p class="checkpoint-empty" id="checkpoint-empty">Карточки открываются по мере прокрутки маршрута.</p></details></section>`;}
export function comparisonTools(id) {return `<div class="photo-compare-tools"><p class="photo-compare-hint">← День <span>Потяните границу на фото</span> Вечер →</p><button data-compare-toggle="${id}" aria-pressed="true" aria-controls="${id}">Сравнение включено ↔</button><div class="photo-static-switch mode-switch" role="group" aria-label="Вид фотографии"><button data-mode-button="day" aria-pressed="true">День</button><button data-mode-button="night" aria-pressed="false">Вечер</button></div><span class="photo-static-note">Переключение без анимаций</span></div>`;}
export function setComparison(id,enabled) {
  const pair=document.getElementById(id);if(!pair)return;
  pair.classList.toggle('is-comparing',enabled);pair.dataset.comparing=String(enabled);
  const input=pair.querySelector?.('[data-compare-range]');if(input)input.hidden=!enabled;
  const toggle=document.querySelector(`[data-compare-toggle="${id}"]`);if(toggle){toggle.setAttribute('aria-pressed',String(enabled));toggle.textContent=enabled?'Сравнение включено ↔':'Сравнить день / вечер ↔';}
}
export function syncComparisonMotion(mode='day'){
  const reduced=motionReduced();document.documentElement.dataset.photoMotion=reduced?'static':'compare';
  for(const pair of document.querySelectorAll('[data-comparing]')){const enabled=!reduced&&pair.dataset.comparing==='true';pair.classList.toggle('is-comparing',enabled);const range=pair.querySelector('[data-compare-range]');if(range){range.hidden=!enabled;range.disabled=!enabled;}}
  for(const button of document.querySelectorAll('.photo-static-switch [data-mode-button]'))button.setAttribute('aria-pressed',String(button.dataset.modeButton===mode));
}
export function updateComparison(input) {const value=Math.max(0,Math.min(100,Number(input.value)||0));document.getElementById(input.dataset.compareRange)?.style.setProperty('--compare-position',`${value}%`);input.setAttribute('aria-valuetext',`День ${value}%, вечер ${100-value}%`);}
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function routeShareUrl(origin) {const url=new URL(origin);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error('Нужен обычный адрес сайта.');url.hash='walk';url.search='';return url.href;}
export function routeCardSvg(url) {
  const qr=qrcode(0,'M');qr.addData(url,'Byte');qr.make();const code=qr.createSvgTag({cellSize:4,margin:24,scalable:true});
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><rect width="1200" height="720" fill="#173c2f"/><rect x="24" y="24" width="1152" height="672" rx="18" fill="none" stroke="#d5bf8d" stroke-opacity=".4"/><text x="78" y="105" fill="#d8bf8a" font-family="Arial,sans-serif" font-size="17" letter-spacing="4">ЕЛЬСК · ГОМЕЛЬСКАЯ ОБЛАСТЬ</text><text x="74" y="210" fill="#f5efdf" font-family="Georgia,serif" font-size="78">Зелёный пульс</text><text x="78" y="262" fill="#c7d2bb" font-family="Arial,sans-serif" font-size="23">Прогулка рядом с Ельской ЦРБ</text><text x="74" y="390" fill="#e0c797" font-family="Georgia,serif" font-size="88">≈ 1 050 м</text><text x="80" y="435" fill="#c7d2bb" font-family="Arial,sans-serif" font-size="19">Один круг · движение · спокойный отдых</text><path d="M78 525H220L243 494L264 555L290 460L321 580L348 525H700" fill="none" stroke="#d8bf8a" stroke-width="2"/><text x="80" y="635" fill="#c7d2bb" font-family="Arial,sans-serif" font-size="17">Каждый шаг важен. Начните свою прогулку.</text><g transform="translate(845 120) scale(${270/(qr.getModuleCount()*4+48)})">${code.replace(/^.*?<svg[^>]*>/s,'').replace(/<\/svg>\s*$/,'').replace(/width="100%" height="100%"/,`width="${qr.getModuleCount()*4+48}" height="${qr.getModuleCount()*4+48}"`)}</g><text x="980" y="445" text-anchor="middle" fill="#f5efdf" font-family="Georgia,serif" font-size="28">Открыть маршрут</text><text x="980" y="482" text-anchor="middle" fill="#c7d2bb" font-family="Arial,sans-serif" font-size="16">Наведите камеру на QR-код</text><text x="980" y="635" text-anchor="middle" fill="#a8b99b" font-family="Arial,sans-serif" font-size="12">Визуализация концепции проекта</text><title>${escape('Зелёный пульс · Ельск · 1 050 м')}</title></svg>`;
}
export function finishShareMarkup() {return `<section class="route-share-card" aria-labelledby="route-share-title"><div><p class="eyebrow">Приглашение на прогулку</p><h3 id="route-share-title">Зелёный пульс<span>Ельск · ≈ 1 050 м</span></h3><p>Поделитесь маршрутом с близкими, жителями или партнёрами проекта.</p><div class="route-share-actions"><button class="primary-button" id="route-share">Поделиться маршрутом ↗</button><button class="text-button" id="route-card-download">Скачать карточку ↓</button></div><p id="route-share-status" role="status"></p><input id="route-share-link" aria-label="Ссылка на маршрут для копирования" readonly hidden></div><div class="share-card-art" aria-hidden="true"><svg viewBox="0 0 300 110"><path d="M0 55H70L91 27L108 80L132 9L158 99L179 55H300"/></svg><strong>1 050 <small>м</small></strong><span>Ваш следующий круг</span></div></section>`;}
export async function shareRoute(url,nav=navigator) {
  if(typeof nav.share==='function'){
    try{await nav.share({title:'Зелёный пульс · Ельск',text:'Прогулочный маршрут «Зелёный пульс» · Ельск · ≈ 1 050 м.',url});return 'shared';}
    catch(error){if(error?.name==='AbortError')return 'cancelled';}
  }
  if(nav.clipboard?.writeText){try{await nav.clipboard.writeText(url);return 'copied';}catch{}}
  return 'manual';
}
