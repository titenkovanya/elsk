import {motionReduced} from './accessibility.mjs?v=20261016-restored';

const pulse=[[40,400],[180,400],[265,400],[320,320],[365,515],[410,235],[470,575],[520,400],[565,400],[625,400],[665,350],[705,460],[745,400],[805,400],[865,400],[920,400],[960,400]];
// The same clockwise outline as the main scheme, fitted to this scene's viewBox.
const route=[[565,887],[625,887],[638,799],[637,540],[637,300],[637,96],[562,42],[360,40],[135,36],[65,109],[63,350],[62,600],[62,737],[83,824],[131,847],[360,866],[565,887]].map(([x,y])=>[241+x*.74,58+y*.74]);
const clamp=value=>Math.max(0,Math.min(1,Number(value)||0));
const ease=value=>value<.5?4*value**3:1-(-2*value+2)**3/2;
export function routeRevealFrame(value){const t=clamp(value),fold=ease(clamp((t-.2)/.8)),amplitude=1-ease(clamp(t/.35)),points=pulse.map(([x,y],i)=>[x+(route[i][0]-x)*fold,400+(y-400)*amplitude+(route[i][1]-400)*fold]),format=p=>p.map(n=>n.toFixed(2)).join(' ');let d=`M${format(points[0])}`;
  for(let i=0;i<points.length-1;i++){const p=points[i],next=points[i+1],before=points[i-1]||points.at(-2),after=points[i+2]||points[1],a=p.map((n,j)=>n+(next[j]-before[j])*t/6),b=next.map((n,j)=>n-(after[j]-p[j])*t/6);d+=`C${format(a)} ${format(b)} ${format(next)}`;}
  return {d:d+(t===1?'Z':''),tip:points.at(-1),points};
}
export const ROUTE_REVEAL_DURATION=3600;
export function mountRouteReveal({root=globalThis.document,raf=globalThis.requestAnimationFrame,caf=globalThis.cancelAnimationFrame,now=()=>globalThis.performance.now()}={}){
  const dialog=root?.getElementById?.('walk-reveal'),path=root?.getElementById?.('walk-reveal-path'),glint=root?.getElementById?.('walk-reveal-glint'),dot=root?.getElementById?.('walk-reveal-dot'),caption=root?.getElementById?.('walk-reveal-caption'),skip=root?.getElementById?.('walk-reveal-skip');let frame=0,active=false,disposed=false,start=0;
  const cleanups=[],on=(target,type,fn)=>{target?.addEventListener(type,fn);cleanups.push(()=>target?.removeEventListener(type,fn));};
  function cancel(){active=false;if(frame)caf(frame);frame=0;}
  function stop(){cancel();if(dialog?.open)dialog.close();}
  function paint(elapsed){const progress=ease(clamp((elapsed-850)/1500)),shape=routeRevealFrame(progress);path.setAttribute('d',shape.d);path.style.strokeDashoffset=String(1000*(1-clamp(elapsed/700)));glint?.setAttribute('d',shape.d);if(glint)glint.style.strokeDashoffset=String(1100-elapsed*.65);dot?.setAttribute('cx',String(shape.tip[0]));dot?.setAttribute('cy',String(shape.tip[1]));
    const stage=elapsed>=2900?'depart':elapsed>=2350?'route':elapsed>=850?'morph':'pulse';if(dialog.dataset.stage!==stage){dialog.dataset.stage=stage;if(caption)caption.textContent=stage==='pulse'?'Каждая прогулка начинается с одного импульса.':stage==='morph'?'Ваш пульс становится маршрутом.':'≈ 1 050 м · аллея · беседка и качели · движение · отдых';}
  }
  function tick(time){frame=0;if(!active||disposed)return;const elapsed=Math.max(0,time-start);if(elapsed>=ROUTE_REVEAL_DURATION){stop();return;}paint(elapsed);frame=raf(tick);}
  function play(){stop();if(disposed||!dialog?.showModal||!path||!raf||motionReduced())return false;start=now();dialog.dataset.stage='';paint(0);dialog.showModal();active=true;frame=raf(tick);return true;}
  on(skip,'click',stop);on(dialog,'cancel',event=>{event.preventDefault();stop();});on(dialog,'close',()=>{if(!dialog.open)cancel();});on(root,'green-pulse-accessibility',()=>{if(motionReduced())stop();});on(root,'visibilitychange',()=>{if(root.visibilityState==='hidden')stop();});
  return {play,stop,destroy(){disposed=true;stop();cleanups.forEach(fn=>fn());}};
}
