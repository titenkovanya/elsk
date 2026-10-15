import {places,imageFor,sides} from './tour.mjs?v=20261015-sequence';

export const walkSteps = [
  {id:'start',place:'start',title:'Начнём с сердца',caption:'Старт / финиш',meters:0,progress:0,text:'Красное сердце с линией пульса — начало круга и главный ориентир. Впереди примерно 1 050 метров в вашем ритме.'},
  {id:'right',place:'right',title:'Вдоль рябиновой аллеи',caption:'Правая сторона',meters:200,progress:24,text:'От старта идём вверх. Рябины, свободная дорожка и места для короткой остановки сопровождают первые 100–300 метров.'},
  {id:'top',place:'top',title:'Ближе к лесу',caption:'Верхняя сторона',meters:450,progress:48,text:'Круг поворачивает вдоль деревьев. На отметках 400–500 метров предусмотрены скамейки и короткие сообщения о здоровье.'},
  {id:'entrance',place:'entrance',title:'Небольшое ответвление',caption:'Вход в лесную зону',meters:525,progress:50,text:'В верхнем левом углу можно ненадолго сойти с круга. Отдельная дорожка ведёт на полянку среди деревьев.'},
  {id:'forest',place:'forest',title:'Пауза среди деревьев',caption:'Беседка и качели',meters:525,progress:50,text:'Беседка, стол и скамья-качели — место для спокойного отдыха. Затем возвращаемся по тому же подходу на основной круг.'},
  {id:'left',place:'left',title:'Добавим движения',caption:'Спортивная площадка',meters:700,progress:73,text:'Продолжаем по левой стороне, к отметкам 600–800 метров. Тренажёры находятся в отдельном кармане рядом с дорожкой.'},
  {id:'bottom',place:'bottom',title:'Передохнём у берёз',caption:'Площадка отдыха',meters:950,progress:92,text:'На нижней стороне запланированы навес, шахматный столик и скамейки. До конца круга остаётся совсем немного.'},
  {id:'finish',place:'start',title:'Круг завершён',caption:'Снова у сердца',meters:1050,progress:100,text:'Мы вернулись к старту. Можно пройти ещё один круг, посмотреть отдельные места или узнать больше о пользе регулярной ходьбы.'}
];

export function mapPoint(place) {return ({start:[565,887],right:[637,260],top:[360,42],entrance:[68,99],forest:[165,117],left:[62,537],bottom:[450,865]})[place]||null;}

export function photoPair(place,{hero=false,lazy=false,compareId=''}={}) {
  return `<div ${compareId?`id="${compareId}"`:''} class="photo-pair ${hero?'hero-photo-pair':''} ${compareId?'is-comparing':''}" ${compareId?'data-comparing="true"':''} role="${compareId?'group':'img'}" aria-label="${places[place].title} — дневная и вечерняя визуализации проекта">${['day','night'].map(mode=>`<img class="photo-${mode}" src="${imageFor(place,mode)}" alt="" aria-hidden="true" ${lazy?'loading="lazy"':'fetchpriority="high"'} decoding="async">`).join('')}${compareId?`<input class="photo-compare-slider" type="range" min="0" max="100" value="50" data-compare-range="${compareId}" aria-label="Граница между днём и вечером — ${places[place].short}" aria-valuetext="День 50%, вечер 50%"><span class="compare-label compare-day" aria-hidden="true">День</span><span class="compare-label compare-night" aria-hidden="true">Вечер</span><span class="compare-divider" aria-hidden="true"><i>↔</i></span>`:''}</div>`;
}

export function heroPulse() {
  const ecg='M0 62 L42 62 L56 62 L68 46 L78 78 L90 18 L101 96 L114 62 L150 62 L173 62 L188 62 L201 52 L213 70 L228 62 L260 62 L280 62 L300 62';
  const route='M247 98 L266 91 L273 75 L273 24 L258 12 L230 11 L158 10 L74 10 L41 13 L28 28 L27 57 L27 81 L40 92 L91 97 L160 100 L219 103 L247 98';
  return `<div class="hero-pulse" aria-hidden="true"><svg viewBox="0 0 300 120"><path class="hero-ecg-morph" d="${ecg}"><animate attributeName="d" begin="1.5s" dur="1.3s" values="${ecg};${route}" fill="freeze"/></path><path class="hero-ecg-static" d="${route}"/></svg><span>У каждого маршрута есть свой пульс</span></div>`;
}

export function routeModes(view,go) {
  return `<div class="route-modes" role="group" aria-label="Как смотреть маршрут">${go('map','Свободный выбор',view==='walk'?'':'selected').replace('data-go=',`aria-pressed="${view!=='walk'}" data-go=`)}${go('walk','Прогулка с прокруткой',view==='walk'?'selected':'').replace('data-go=',`aria-pressed="${view==='walk'}" data-go=`)}</div>`;
}

export function chooseWalkIndex(tops,anchor) {
  let current=0;
  for(let i=0;i<tops.length;i++){if(tops[i]<=anchor)current=i;else break;}
  return current;
}
