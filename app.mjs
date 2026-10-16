import {mountInterface} from './interface.mjs?v=20261016-route-reveal';
import {communityMarkup,communityPage,mountCommunity} from './community-stories.mjs?v=20261016-route-reveal';
import {mountWalkFinale} from './walk-finale.mjs?v=20261016-route-reveal';
import {pulseBridge} from './route-cards.mjs?v=20261016-route-reveal';
import {heroMarkup,mountHero,HERO_EXIT_MS} from './hero.mjs?v=20261016-route-reveal';
import {presentationPage,mountPresentation} from './presentation.mjs?v=20261016-route-reveal';
import {places,sides,objects,stops,messages,healthFacts,whoUrl,normalizeView,imageFor,createTour} from './tour.mjs?v=20261016-route-reveal';
import {specialTitles,wherePage,nordicPage,expertPage,feedbackPage,qrPage,buildShareUrl,buildQrSvg,posterSvg} from './pages.mjs?v=20261016-route-reveal';
import {photoPair,heroPulse,routeModes,mapPoint} from './experience.mjs?v=20261016-route-reveal';
import {walkPage,mountExperience} from './journey.mjs?v=20261016-route-reveal';
import {normalizePace,emotions,comparisonTools,setComparison,updateComparison,syncComparisonMotion,routeShareUrl,routeCardSvg,shareRoute} from './walk-tools.mjs?v=20261016-route-reveal';
import {accessibilityDialog,readAccessibility,applyAccessibility,saveAccessibility,motionReduced} from './accessibility.mjs?v=20261016-route-reveal';
import {mountWeather} from './weather.mjs?v=20261016-route-reveal';
import {preparationMarkup,nearbyMarkup,projectPage,projectCardSvg} from './project-page.mjs?v=20261016-route-reveal';
import {siteConfig} from './site-config.mjs?v=20261016-route-reveal';

let accessibility=readAccessibility(globalThis.localStorage),weatherController=null,presentationController=null,heroController=null,finaleController=null,communityController=null;
const accessHost=document.getElementById('accessibility-host');if(accessHost)accessHost.innerHTML=accessibilityDialog();
applyAccessibility(accessibility);
const main=document.getElementById('main');
const about=document.getElementById('about-dialog');
const menu=document.getElementById('nav-dialog');
const interfaceController=mountInterface({menu,trigger:document.getElementById('menu-open'),main});
const initial=location.hash?normalizeView(location.hash.slice(1)):'home';
const tour=createTour(initial);
let zoom=1,siteTheme='forest';
try{siteTheme=['dark','graphite'].includes(localStorage.getItem('green-pulse-theme'))?'graphite':'forest';}catch{}
let experience=null,walkPlace='start',walkResume='start',walkPace='calm',departureTimer=null;
let qrTarget='map',qrBase='',latestQr=null,feedbackDraft={},feedbackSending=false,feedbackId=crypto.randomUUID();
try{tour.setMode(localStorage.getItem('green-pulse-light')||'day');}catch{}
try{walkPace=normalizePace(localStorage.getItem('green-pulse-pace'));}catch{}
history.replaceState({greenPulse:true,cursor:0},'',`#${initial}`);

const icons={
  arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back:'<path d="M20 12H5m6-6-6 6 6 6"/>',
  top:'<path d="M12 20V5m-6 6 6-6 6 6"/>',
  bottom:'<path d="M12 4v15m-6-6 6 6 6-6"/>',
  left:'<path d="M20 12H5m6-6-6 6 6 6"/>',
  right:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon:'<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/>',
  location:'<path d="M18 10c0 5-6 10-6 10S6 15 6 10a6 6 0 1 1 12 0Z"/><circle cx="12" cy="10" r="2"/>',
  expand:'<path d="M9 4H4v5m11-5h5v5M4 15v5h5m6 0h5v-5"/>',
  map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/>',
  click:'<path d="m8 4 11 9-6 1-3 6-2-16Z"/><path d="M5 3 3 1M4 8H1m10-7V0"/>',
  loop:'<path d="M20 9a8 8 0 0 0-14-3L3 9m0-5v5h5m-4 6a8 8 0 0 0 14 3l3-3m0 5v-5h-5"/>'
  ,heart:'<path d="M12 20C3 14 1 8 5 5c3-2 6-1 7 2 2-3 5-4 7-2 4 3 2 9-7 15Z"/>'
  ,tree:'<path d="m12 2 6 8h-3l5 7H4l5-7H6l6-8Zm0 15v5"/>'
};
const svg=(name)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.arrow}</svg>`;
const go=(view,label,classes='')=>`<button class="${classes}" data-go="${view}">${label}</button>`;
function lightSwitch(mode){return `<div class="mode-switch" role="group" aria-label="Атмосфера маршрута">${['day','night'].map(m=>`<button data-mode-button="${m}" aria-pressed="${mode===m}" aria-label="Посмотреть маршрут ${m==='day'?'днём':'вечером'}">${svg(m==='day'?'sun':'moon')}${m==='day'?'День':'Вечер'}</button>`).join('')}</div>`;}

function home(){return `<section class="home" aria-labelledby="home-title">
  ${heroMarkup({go,svg,stories:communityMarkup()})}
  <div class="premium-stats"><div><strong>≈ 1 050 <small>м</small></strong><span>один круг в своём ритме</span></div><div><strong>4 <small>зоны</small></strong><span>движение, лес и отдых</span></div><div><strong>2 <small>формата</small></strong><span>обычная ходьба и с палками</span></div></div>
  <section class="home-discover" id="home-discover" aria-labelledby="discover-title"><header class="home-section-heading"><div><p class="eyebrow">01 / Почувствуйте место</p><h2 id="discover-title">У каждого места<br><em>свой ритм.</em></h2></div><div><p>Тихая полянка, аллея и пространство для движения. Выберите то, что ближе вам.</p>${go('map',`Вся схема ${svg('arrow')}`,'text-button')}</div></header>
  <div class="home-scenes">${[['forest','Беседка и качели','Побыть в тишине'],['right','Рябиновая аллея','Поймать свой ритм'],['left','Спортивная площадка','Добавить движения']].map(([id,label,emotion],i)=>go(id,`<div class="home-scene-photo">${photoPair(id,{lazy:true})}</div><span><small>0${i+1} / ${label}</small><strong>${emotion}</strong>${svg('arrow')}</span>`,'home-scene')).join('')}</div><p class="home-concept-note">Виды показывают предполагаемый облик парка. Это концепция проекта.</p></section>
  <section class="home-route-guide" aria-labelledby="home-guide-title"><div><p class="eyebrow">02 / Исследуйте маршрут</p><h2 id="home-guide-title">Пройдите круг.<br><em>Прямо на экране.</em></h2><p>Листайте фотографии, выбирайте точки на схеме и сравнивайте дневной и вечерний вид.</p>${go('walk',`Начать прогулку ${svg('arrow')}`,'primary-button')}</div><ol><li><span>01</span><div><h3>Выберите свой темп</h3><p>Спокойная прогулка, быстрый круг или ходьба с палками.</p></div></li><li><span>02</span><div><h3>Загляните в каждое место</h3><p>Схема подскажет, где вы сейчас. К любой точке можно вернуться.</p></div></li><li><span>03</span><div><h3>Сохраните впечатление</h3><p>Добавьте фото в истории или создайте личную карточку прогулки.</p></div></li></ol></section>
  <section class="home-health-story" aria-labelledby="home-health-title"><div class="home-health-photo">${photoPair('top',{lazy:true})}<span>Меньше суеты.<br>Больше времени для себя.</span></div><div class="home-health-copy"><p class="eyebrow">03 / Движение со смыслом</p><h2 id="home-health-title">Хорошая привычка.<br><em>Шаг за шагом.</em></h2><p>Узнайте, как регулярная ходьба помогает заботиться о здоровье, с чего начать и чем отличается прогулка с палками.</p><div>${go('health',`Ходьба и здоровье ${svg('arrow')}`,'text-button')}${go('nordic','Ходьба с палками ↗','text-button')}${go('expert','Слово специалиста ↗','text-button')}</div></div></section>
  <section class="home-practical" aria-label="Подготовьтесь к прогулке"><div class="home-practical-title"><p class="eyebrow">04 / Перед выходом</p><h2>Всё нужное.<br><em>Рядом.</em></h2></div>${preparationMarkup()}${nearbyMarkup(go)}<div class="home-arrival"><div><span class="eyebrow">Главный ориентир — Ельская ЦРБ</span><p>Ельск, ул. 50 лет СССР, 30</p></div>${go('where',`Как добраться ${svg('arrow')}`,'primary-button')}</div></section>
  <section class="home-bottom-cta"><div><p class="eyebrow">Зелёный пульс · Ельск</p><h2>Ваш следующий<br><em>шаг — к себе.</em></h2>${go('walk',`Начать прогулку ${svg('arrow')}`,'primary-button')}</div><aside><p>Возьмите маршрут с собой</p><span>Сохраните QR-код или поделитесь<br>идеей с теми, кто любит гулять.</span>${go('qr','Открыть QR-код ↗','text-button')}${go('feedback','Предложить идею ↗','text-button')}</aside></section>
</section>`;}

function mapMarkup(view){const side=places[view]?.side;return `<aside class="map-card" aria-label="Интерактивная схема маршрута">
  <div class="map-topline"><strong>Ваша схема маршрута</strong><div class="map-tools" role="group" aria-label="Масштаб схемы"><button data-zoom="out" aria-label="Уменьшить схему" ${zoom<=1?'disabled':''}>−</button><button data-zoom="in" aria-label="Увеличить схему" ${zoom>=2?'disabled':''}>+</button><button data-zoom="reset" aria-label="Сбросить масштаб">↺</button></div></div>
  <div class="map-viewport" id="map-viewport"><div class="map-canvas" style="width:${zoom*100}%">
    <img src="assets/map.webp" width="725" height="960" alt="Вид сверху: замкнутая дорожка вокруг лесного участка, старт внизу справа, спортплощадка слева, отдых внизу и лесная полянка сверху слева">
    <div class="map-evening-shade" aria-hidden="true"></div><svg class="map-routes" viewBox="0 0 725 960" aria-hidden="true"><path d="M565 887Q642 904 638 799L637 96Q635 45 562 42L135 36Q67 35 65 109L62 737Q58 824 131 847Z"/>
      <path class="route-progress" pathLength="100" d="M565 887Q642 904 638 799L637 96Q635 45 562 42L135 36Q67 35 65 109L62 737Q58 824 131 847Z"/>
      <path class="section ${side==='right'?'active':''}" d="M565 887Q642 904 638 799L637 96"/>
      <path class="section ${side==='top'?'active':''}" d="M637 96Q635 45 562 42L135 36Q67 35 65 109"/>
      <path class="section ${side==='left'?'active':''}" d="M65 109L62 737Q58 805 83 824"/>
      <path class="section ${side==='bottom'?'active':''}" d="M83 824Q96 842 131 847L565 887"/>
      <path class="forest-branch" d="M68 99Q96 100 126 130Q160 164 207 112" style="stroke-width:3;stroke-dasharray:5 6"/>
      <g class="map-lamps">${[[600,855],[639,700],[638,530],[637,355],[636,178],[562,43],[400,40],[235,38],[80,65],[64,230],[63,420],[62,620],[95,820],[265,860],[435,877],[126,130],[190,126]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</g>
      ${mapPoint(view)?`<circle class="current-map-dot" cx="${mapPoint(view)[0]}" cy="${mapPoint(view)[1]}" r="8"/>`:''}
    </svg>
    ${sides.map(s=>`<button class="side-chip ${s} ${view===s?'active':''}" data-go="${s}" aria-label="Перейти: ${places[s].title}" ${view===s?'aria-current="location"':''}><strong>${places[s].mapTitle}</strong><small>${s==='top'?'Скамейки и таблички':places[s].short}</small></button>`).join('')}
    ${objects.map(id=>{const p=places[id];return `<button class="named-pin ${id==='start'?'start':''} ${view===id?'active':''}" style="left:${p.x}%;top:${p.y}%" data-go="${id}" aria-label="${p.title}. Перейти к объекту" ${view===id?'aria-current="location"':''}>${svg(p.icon)}<span>${id==='start'?'Старт / финиш':'Беседка и качели'}</span></button>`;}).join('')}
    <span class="location-marker" ${sides.includes(view)?'':'hidden'} style="left:${{right:87,top:50,left:8,bottom:64}[view]||0}%;top:${{right:27,top:10,left:56,bottom:90}[view]||0}%">Вы здесь</span>
  </div></div>
  <p class="map-caption"><span><i></i>Основной круг · ≈ 1 050 м</span>Нажмите на название участка. Схема условная; расположение и расстояния уточняются на местности.</p>
</aside>`;}

function overview(){return `<section class="panel overview entering" id="detail-panel" tabindex="-1" aria-labelledby="overview-title">
  <p class="eyebrow">Виртуальная прогулка</p><h2 id="overview-title">Куда отправимся?</h2><p>Выберите сторону круга или интересующий объект прямо на схеме. В каждой точке вас ждут описание и два вида территории.</p>
  <h3 class="section-label">Выберите направление</h3><div class="direction-grid">${sides.map(s=>go(s,`${svg(s)}<span><strong>${places[s].title}</strong><small>${places[s].label}</small></span>`,'direction-button')).join('')}</div>
  <h3 class="section-label">Другие точки</h3><div class="object-list">${objects.map(id=>go(id,`<span class="object-number">${svg(places[id].icon)}</span><span>${places[id].short}</span>${svg('arrow')}`,'object-row')).join('')}</div>
  <div class="overview-health"><p class="eyebrow">Движение и профилактика</p><p>Узнайте, почему регулярная ходьба важна для здоровья и какую задачу решает проект.</p>${go('health',`Ходьба и здоровье ${svg('arrow')}`,'text-button')}</div>
  <div class="overview-tip">${svg('loop')}<span>Можно идти по кругу или свободно переходить между точками. Кнопка «Назад» вернёт к предыдущему месту.</span></div>${go('where','Рядом с маршрутом ↗','text-button map-nearby-link')}
</section>`;}

function scene(view){const p=places[view],{mode}=tour.snapshot();const shape=['right','bottom'].includes(p.image)?'portrait':['top','left'].includes(p.image)?'wide':'';
return `<section class="panel entering" id="detail-panel" tabindex="-1" aria-labelledby="scene-title">
  <div class="scene-frame ${shape}">${photoPair(view,{compareId:'scene-comparison'})}
  <div class="scene-tools"><button class="scene-back" data-back>${svg('back')}Назад</button>${lightSwitch(mode)}</div>
  <span class="scene-tag"><i></i><span id="scene-tag-text">${mode==='day'?'Дневной':'Вечерний'} вид · концепция проекта</span></span><button class="fullscreen" id="photo-open" aria-label="Открыть изображение полностью">${svg('expand')}</button></div>
  ${comparisonTools('scene-comparison')}<div class="scene-content"><div class="scene-heading"><div><h2 id="scene-title">${p.title}</h2><p class="place-emotion">${emotions[view]}</p><p class="scene-location">${svg('location')}${p.location}</p></div></div>
  <p class="scene-intro">${p.intro}</p><ul class="scene-details">${p.details.map(d=>`<li>${d}</li>`).join('')}</ul>
  <div class="scene-health"><h3>Почему это важно</h3><p>${p.health}</p>${p.tipIndexes?`<details class="route-tips"><summary>Сообщения на этом участке <span>+</span></summary><div class="message-list">${p.tipIndexes.map(i=>`<div class="message-row"><strong>${(i+1)*100} м</strong><div><span>${healthFacts[i]}</span><small>В буклете: «${messages[i]}»</small></div></div>`).join('')}</div><p class="source-note">Сведения о здоровье — из презентации проекта; короткие надписи — из буклета. Привязка отметок условная.</p></details>`:''}${go('health',`Подробнее о ходьбе и здоровье ${svg('arrow')}`,'text-button')}</div>
  <div class="nearby"><p class="nearby-title">Другие точки маршрута</p><div class="nearby-links">${p.links.map(id=>go(id,places[id].short)).join('')}</div></div>
  <div class="scene-actions">${go('map',`${svg('map')}К схеме`,'text-button')}${go(p.next,`${p.nextText} ${svg('arrow')}`,'primary-button')}</div></div>
  <div class="scene-share"><button data-go="qr" data-qr-target="${view}">QR этой точки ↗</button><button data-go="feedback">Предложить улучшение →</button></div>
</section>`;}

function workspace(view){const visited=tour.snapshot().visited.filter(id=>stops.includes(id)).length;return `<section class="workspace" aria-labelledby="tour-title">
  <div class="workspace-heading"><div><p class="eyebrow">Зелёный пульс · интерактивный маршрут</p><h1 id="tour-title">Ваша прогулка по проекту</h1><p>Выбирайте точки на схеме и исследуйте территорию</p></div><div class="explored"><div class="progress-ring" style="--progress:${visited/stops.length*100}"></div><div><strong>${visited} из ${stops.length} точек</strong><span>вы посмотрели</span></div></div></div>
  <div class="workspace-modes">${routeModes(view,go)}${lightSwitch(tour.snapshot().mode)}</div>
  <div class="tour-layout ${view!=='map'?'viewing-scene':''}">${mapMarkup(view)}${view==='map'?overview():scene(view)}</div>
</section>`;}

function health(){return `<article class="health-page" aria-labelledby="health-title">
  <div class="back-row">${go('map',`${svg('back')}Вернуться к маршруту`,'text-button')}</div>
  <div class="health-intro health-intro-compact"><div><p class="eyebrow">Движение и профилактика</p><h1 id="health-title">Регулярная ходьба.<br><em>Забота о себе.</em></h1><p class="health-lead">Доступная прогулка рядом с Ельской ЦРБ помогает сделать движение частью повседневной жизни.</p></div><div class="health-pulse-mark" aria-hidden="true"><svg viewBox="0 0 300 100"><path d="M0 50H70L88 28L104 75L126 5L151 94L171 50H300"/></svg></div></div>
  <section class="health-visual" aria-labelledby="benefits-title"><p class="eyebrow">Почему это важно</p><h2 id="benefits-title">Три причины выйти на прогулку</h2><p class="benefits-hint">Листайте или нажмите на число, чтобы узнать больше.</p><div class="benefit-grid">${[['Сердце<br>и сосуды','Регулярная физическая активность способствует профилактике сердечно-сосудистых заболеваний.'],['Профилактика<br>диабета','Физическая активность помогает снизить риск развития диабета 2-го типа.'],['Здоровье<br>в долгой перспективе','Активный образ жизни связан со снижением риска преждевременной смерти.']].map(([title,text],i)=>`<details class="benefit-card"><summary><span class="benefit-number">0${i+1}</span><h3>${title}</h3><span class="benefit-plus" aria-hidden="true">+</span></summary><div class="benefit-copy"><p>${text}</p></div></details>`).join('')}</div></section>
  <section class="health-section" aria-labelledby="signs-title"><p class="eyebrow">Информация на круге</p><h2 id="signs-title">Каждые 100 метров —<br><em>повод продолжить.</em></h2><p class="section-intro">Короткие сообщения о движении и здоровье сопровождают весь круг.</p><details class="health-archive"><summary>Все 10 отметок и надписи из буклета <span>+</span></summary><div class="health-signs">${healthFacts.map((fact,i)=>{const side=i<3?'right':i<5?'top':i<8?'left':'bottom';return `<details><summary><strong>${(i+1)*100} м</strong><span>${fact}</span><i>+</i></summary><div class="health-sign-content"><p>Надпись из буклета: <strong>«${messages[i]}»</strong></p>${go(side,`Посмотреть участок ${svg('arrow')}`,'text-button')}</div></details>`;}).join('')}</div></details></section>
  <section class="health-section health-community-compact" aria-labelledby="community-title"><p class="eyebrow">Доступность и привычка</p><h2 id="community-title">Для жителей<br>разных поколений</h2><p>Обычная и скандинавская ходьба, места для пауз и совместных прогулок. Каждый выбирает свой ритм с учётом самочувствия и возможностей.</p><details class="health-archive"><summary>Планы проекта на первый год <span>+</span></summary><div class="project-goals"><div><strong>≥ 1 000</strong><span>пользователей</span></div><div><strong>≥ 3</strong><span>мероприятия по ходьбе и профилактике</span></div><div><strong>≥ 5</strong><span>публикаций</span></div><p>Это плановые показатели после открытия, а не достигнутые результаты.</p></div></details></section>
  <div class="health-sources"><p>Основание: предоставленная презентация проекта, брошюра, буклет и <a href="${whoUrl}" target="_blank" rel="noopener noreferrer">ВОЗ — «Физическая активность» ↗</a>. Привязка дистанционных отметок условная.</p><p>Маршрут поддерживает регулярную активность и не заменяет медицинскую помощь. Эффект зависит от состояния здоровья и регулярности движения.</p></div>
  <div class="health-final">${go('map',`Исследовать маршрут ${svg('arrow')}`,'primary-button')}<p>Один круг · ≈ 1 050 м · обычная и скандинавская ходьба</p></div>
</article>`;}

function render({focus=false}={}){if(departureTimer){clearTimeout(departureTimer);departureTimer=null;main.classList.remove('is-departing');}experience?.destroy();weatherController?.destroy();presentationController?.destroy();heroController?.destroy();finaleController?.destroy();finaleController=null;communityController?.destroy();communityController=null;const openPhoto=document.getElementById('photo-dialog');if(openPhoto?.open)openPhoto.close();const {view,mode}=tour.snapshot();document.body.dataset.mode=mode;document.body.dataset.view=view;const extra={stories:communityPage,presentation:presentationPage,project:projectPage,where:wherePage,nordic:nordicPage,expert:expertPage,feedback:feedbackPage,qr:qrPage};main.innerHTML=view==='home'?home():view==='walk'?walkPage({mapMarkup,go,svg,lightSwitch,mode,pace:walkPace}):view==='health'?health():extra[view]?extra[view]({go,svg,target:qrTarget,feedbackAvailable:siteConfig.feedbackAvailable,mapMarkup}):workspace(view);document.title=`${view==='home'?'Зелёный пульс':view==='walk'?'Прогулка':view==='map'?'Схема маршрута':view==='health'?'Ходьба и здоровье':specialTitles[view]||places[view].title} — прогулочный маршрут в Ельске`;
  if(focus){if(!places[view]){window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});}else{const detail=document.getElementById('detail-panel');detail.focus({preventScroll:true});if(matchMedia('(max-width:760px)').matches)detail.scrollIntoView({block:'start',behavior:'instant'});}}
  document.getElementById('announcement').textContent=view==='home'?'Главная страница':view==='walk'?'Прогулка. Листайте вниз для перехода между остановками.':view==='map'?'Открыта схема маршрута':view==='health'?'Ходьба и здоровье':specialTitles[view]||`Вы перешли: ${places[view].title}`;
  if(view==='qr'){const input=document.getElementById('qr-base');input.value=qrBase;updateQr();}
  if(view==='feedback'){const form=document.getElementById('feedback-form');for(const [key,value] of Object.entries(feedbackDraft)){const field=form?.elements?.namedItem(key);if(field)field.value=value;}}
  if(places[view])for(const mode of ['day','night']){const im=new Image();im.src=imageFor(view,mode);}
  interfaceController.refresh({view:places[view]?'map':view,animate:focus});
  heroController=mountHero();
  syncGlobalTheme();
  syncComparisonMotion(mode);
  weatherController=mountWeather();
  presentationController=mountPresentation({url:routeShareUrl(location.href||location.origin)});
  experience=mountExperience({view,pace:walkPace,onOpenPlace:place=>navigate(place),onPaceChange:pace=>{walkPace=pace;finaleController?.setPace(pace);try{localStorage.setItem('green-pulse-pace',pace);}catch{}},onWalkPlace:(place,step)=>{walkPlace=place;walkResume=step;tour.markVisited(place);}});
  communityController=mountCommunity({apiBase:siteConfig.storiesApiBase||'',origin:location.origin});
  finaleController=view==='walk'?mountWalkFinale({url:location.href||location.origin,pace:walkPace}):null;
  if(view==='walk'&&walkResume!=='start')experience.jump(walkResume,{instant:true});
}
function navigate(view){heroController?.cancelDeparture?.();if(departureTimer){clearTimeout(departureTimer);departureTimer=null;main.classList.remove('is-departing');}if(about.open)about.close();if(menu?.open)interfaceController.closeMenu({immediate:true});const before=tour.snapshot(),contextPlace=before.view==='walk'?walkPlace:before.view;if(view==='walk'&&before.view==='home')walkResume='start';if(view==='feedback'&&!feedbackDraft.message&&places[contextPlace])feedbackDraft.section=contextPlace==='entrance'?'forest':contextPlace;const after=tour.go(view);if(before.view===after.view)return;history.pushState({greenPulse:true,cursor:after.cursor},'',`#${after.view}`);render({focus:true});}
function setMode(mode){tour.setMode(mode);try{localStorage.setItem('green-pulse-light',tour.snapshot().mode);}catch{}
  const {view}=tour.snapshot();document.body.dataset.mode=tour.snapshot().mode;
  for(const im of document.querySelectorAll('#full-image')){im.src=imageFor(view,mode);im.alt=`${places[view]?.title||'Маршрут'} — ${mode==='night'?'вечерняя':'дневная'} визуализация проекта`;}
  for(const b of document.querySelectorAll('[data-mode-button]'))b.setAttribute('aria-pressed',String(b.dataset.modeButton===mode));
  const heroButton=document.querySelector('.hero-light');if(view==='home'&&heroButton){heroButton.dataset.modeButton=mode==='day'?'night':'day';heroButton.setAttribute('aria-label',`Посмотреть маршрут ${mode==='day'?'вечером':'днём'}`);heroButton.innerHTML=`${svg(mode==='day'?'moon':'sun')} Посмотреть маршрут ${mode==='day'?'вечером':'днём'}`;}
  const label=document.getElementById('scene-tag-text');if(label)label.textContent=`${mode==='day'?'Дневной':'Вечерний'} вид · концепция проекта`;
  document.getElementById('announcement').textContent=`Включён ${mode==='night'?'вечерний':'дневной'} вид`;
  syncComparisonMotion(tour.snapshot().mode);
}
function syncGlobalTheme(){const graphite=siteTheme==='graphite';document.body.dataset.theme='dark';document.body.dataset.palette=siteTheme;const button=document.getElementById('global-light');if(button){button.setAttribute('aria-pressed',String(graphite));button.setAttribute('aria-label',graphite?'Включить лесную тему':'Включить графитовую тему');button.setAttribute('title',graphite?'Переключить на лесную тему':'Переключить на графитовую тему');}const label=document.getElementById('global-light-label');if(label)label.textContent=graphite?'Тема: Графит':'Тема: Лес';document.querySelector('meta[name="theme-color"]')?.setAttribute('content',graphite?'#11171b':'#0b1813');}
function toggleTheme(){siteTheme=siteTheme==='forest'?'graphite':'forest';try{localStorage.setItem('green-pulse-theme',siteTheme);}catch{}syncGlobalTheme();document.getElementById('announcement').textContent=siteTheme==='graphite'?'Графитовая тема включена':'Лесная тема включена';}

async function handleRouteShare(){const button=document.getElementById('route-share'),status=document.getElementById('route-share-status'),input=document.getElementById('route-share-link'),url=routeShareUrl(location.href||location.origin);button.disabled=true;try{const result=await shareRoute(url);input.hidden=result!=='manual';if(result==='shared')status.textContent='Готово — маршрут передан в меню «Поделиться».';else if(result==='copied')status.textContent='Ссылка на маршрут скопирована.';else if(result==='cancelled')status.textContent='Вы можете поделиться маршрутом позже.';else{input.value=url;input.focus();input.select();status.textContent='Скопируйте ссылку из поля ниже.';}}finally{button.disabled=false;}}
function downloadRouteCard(){const blob=new Blob([routeCardSvg(routeShareUrl(location.href||location.origin))],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='zeleny-puls-elsk.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function updateAccessibility(value){accessibility=applyAccessibility(value);saveAccessibility(accessibility,globalThis.localStorage);syncComparisonMotion(tour.snapshot().mode);if(motionReduced()&&departureTimer){clearTimeout(departureTimer);departureTimer=null;main.classList.remove('is-departing');}document.dispatchEvent(new Event('green-pulse-accessibility'));document.getElementById('announcement').textContent='Настройки отображения сохранены.';}
function projectUrl(){const url=new URL(routeShareUrl(location.href||location.origin));url.hash='project';return url.href;}
function downloadProjectCard(){const blob=new Blob([projectCardSvg(projectUrl())],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='zeleny-puls-project.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function showProjectCard(){let dialog=document.getElementById('project-card-dialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='project-card-dialog';dialog.className='project-card-dialog';dialog.setAttribute('aria-label','Карточка проекта');document.body.append(dialog);}dialog.innerHTML=`<div class="project-card-actions"><button class="text-button" id="project-card-close">← Закрыть</button><button class="primary-button" id="project-card-print">Распечатать / сохранить PDF</button><button class="text-button" id="project-card-download">Скачать SVG ↓</button></div><div class="project-card-art">${projectCardSvg(projectUrl())}</div>`;dialog.showModal();}
function fullPhoto(){const {view,mode}=tour.snapshot();if(!places[view])return;
  let dialog=document.getElementById('photo-dialog');if(dialog)dialog.remove();dialog=document.createElement('dialog');dialog.id='photo-dialog';dialog.className='photo-dialog';dialog.setAttribute('aria-label',`Визуализация: ${places[view].title}`);dialog.innerHTML=`<button class="dialog-close icon-button" id="photo-close" aria-label="Закрыть изображение">×</button><img id="full-image" src="${imageFor(view,mode)}" alt="${places[view].title} — визуализация проекта"><div class="photo-caption"><span>${places[view].title}<small>Предполагаемый облик территории</small></span>${lightSwitch(mode)}</div>`;document.body.append(dialog);dialog.showModal();dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});dialog.addEventListener('close',()=>document.getElementById('photo-open')?.focus());
}
document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;
  if(b.id==='accessibility-open')document.getElementById('accessibility-dialog').showModal();
  else if(b.id==='accessibility-close')document.getElementById('accessibility-dialog').close();
  else if(b.id==='accessibility-reset')updateAccessibility({});
  else if(b.id==='project-card-download')downloadProjectCard();
  else if(b.id==='project-print'||b.id==='project-print-bottom')showProjectCard();
  else if(b.id==='project-card-close')document.getElementById('project-card-dialog').close();
  else if(b.id==='project-card-print')window.print();
  else if(b.dataset.walkPace)experience?.setPace(b.dataset.walkPace);
  else if(b.dataset.checkpoint)experience?.checkpoint(b.dataset.checkpoint);
  else if(b.dataset.compareToggle){const pair=document.getElementById(b.dataset.compareToggle);setComparison(b.dataset.compareToggle,pair?.dataset.comparing!=='true');syncComparisonMotion(tour.snapshot().mode);}
  else if(b.hasAttribute('data-global-light'))toggleTheme();
  else if(b.id==='route-share')handleRouteShare();
  else if(b.id==='route-card-download')downloadRouteCard();
  else if(b.dataset.walkTarget)experience?.jump(b.dataset.walkTarget);
  else if(b.hasAttribute('data-walk-next'))experience?.jump('next');
  else if(b.hasAttribute('data-walk-finale'))document.getElementById('walk-memory')?.scrollIntoView({block:'start',behavior:motionReduced()?'instant':'smooth'});
  else if(b.dataset.go){if(b.dataset.go==='qr')qrTarget=b.dataset.qrTarget||tour.snapshot().view;if(b.dataset.go==='walk'&&tour.snapshot().view==='home'&&!menu?.open&&!motionReduced()){if(departureTimer)return;main.classList.add('is-departing');heroController?.depart?.();departureTimer=setTimeout(()=>navigate('walk'),HERO_EXIT_MS);return;}navigate(b.dataset.go);}
  else if(b.hasAttribute('data-back')){if(tour.snapshot().canBack)history.back();else navigate('map');}
  else if(b.dataset.modeButton)setMode(b.dataset.modeButton);
  else if(b.dataset.zoom){zoom=b.dataset.zoom==='reset'?1:Math.max(1,Math.min(2,zoom+(b.dataset.zoom==='in'?.25:-.25)));const canvas=document.querySelector('.map-canvas');if(canvas)canvas.style.width=`${zoom*100}%`;document.querySelector('[data-zoom="out"]').disabled=zoom<=1;document.querySelector('[data-zoom="in"]').disabled=zoom>=2;}
  else if(b.id==='about-open'||b.hasAttribute('data-about-open'))navigate('project');
  else if(b.id==='about-close')about.close();
  else if(b.id==='photo-open')fullPhoto();
  else if(b.id==='photo-close')document.getElementById('photo-dialog').close();
  else if(b.id==='menu-open')interfaceController.openMenu();
  else if(b.id==='menu-close')interfaceController.closeMenu();
  else if(b.id==='qr-download'&&latestQr)downloadPoster();
  else if(b.id==='qr-print'&&latestQr)window.print();
});
function updateQr(){const select=document.getElementById('qr-target'),base=document.getElementById('qr-base');if(!select||!base)return;qrTarget=select.value||'map';qrBase=base.value||'';const error=document.getElementById('qr-error');try{const url=buildShareUrl(qrBase,qrTarget,location.href||location.origin);const svgCode=buildQrSvg(url);const title=qrTarget==='map'?'Начать маршрут':qrTarget==='health'?'Ходьба и здоровье':places[qrTarget]?.mapTitle||places[qrTarget]?.short||specialTitles[qrTarget];document.getElementById('qr-image').innerHTML=svgCode;const art=document.getElementById('qr-poster-art');if(art)art.innerHTML=posterSvg(svgCode,title);document.getElementById('qr-check').href=url;document.getElementById('qr-poster-title').textContent=title;error.textContent='';latestQr={url,svg:svgCode,title,target:qrTarget};document.getElementById('qr-download').disabled=false;document.getElementById('qr-print').disabled=false;}catch(e){error.textContent=e.message;latestQr=null;document.getElementById('qr-image').innerHTML='';const art=document.getElementById('qr-poster-art');if(art)art.innerHTML='';document.getElementById('qr-check').removeAttribute('href');document.getElementById('qr-download').disabled=true;document.getElementById('qr-print').disabled=true;}}
function downloadPoster(){const blob=new Blob([posterSvg(latestQr.svg,latestQr.title)],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`zeleny-puls-${latestQr.target}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.addEventListener('input',event=>{if(event.target.dataset?.compareRange)updateComparison(event.target);if(['qr-base','qr-target'].includes(event.target.id))updateQr();if(event.target.form?.id==='feedback-form'){feedbackDraft=Object.fromEntries(new FormData(event.target.form));}});
document.addEventListener('change',event=>{if(event.target.dataset?.accessibility){accessibility[event.target.dataset.accessibility]=event.target.checked;updateAccessibility(accessibility);}if(['qr-base','qr-target'].includes(event.target.id))updateQr();if(event.target.form?.id==='feedback-form'){feedbackDraft=Object.fromEntries(new FormData(event.target.form));}});
document.addEventListener('submit',async event=>{if(event.target.id!=='feedback-form')return;event.preventDefault();if(feedbackSending)return;const form=event.target;if(form.reportValidity&&!form.reportValidity())return;feedbackDraft=Object.fromEntries(new FormData(form));const button=document.getElementById('feedback-submit'),status=document.getElementById('feedback-status');feedbackSending=true;button.disabled=true;status.dataset.state='pending';status.textContent='Сохраняем сообщение…';try{const response=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({...feedbackDraft,id:feedbackId})});const data=await response.json();if(!response.ok||data.ok!==true)throw new Error(data.error||'Не удалось сохранить сообщение. Попробуйте ещё раз.');feedbackDraft={};feedbackId=crypto.randomUUID();form.reset();status.dataset.state='success';status.textContent='Сообщение сохранено. Спасибо, что помогаете проекту!';}catch(e){status.dataset.state='error';status.textContent=e.message||'Сейчас сообщение не удалось отправить. Ваш текст остаётся в форме.';}finally{feedbackSending=false;button.disabled=false;}});
about.addEventListener('click',event=>{if(event.target===about)about.close();});
window.addEventListener('popstate',event=>{const view=location.hash?normalizeView(location.hash.slice(1)):'home';tour.restore(event.state?.greenPulse?event.state.cursor:undefined,view);render({focus:true});});
window.addEventListener('hashchange',()=>{const view=location.hash?normalizeView(location.hash.slice(1)):'home';if(view!==tour.snapshot().view){tour.restore(undefined,view);render({focus:true});}});
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');systemMotion.addEventListener?.('change',()=>{syncComparisonMotion(tour.snapshot().mode);document.dispatchEvent(new Event('green-pulse-accessibility'));});
render();
