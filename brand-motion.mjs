import {motionReduced} from './accessibility.mjs?v=20261016-restored';

export const menuPreviews={
 walk:{image:'assets/forest-night.webp',title:'В вашем\nритме.',label:'01 / Пройти маршрут'},
 map:{image:'assets/hero-cinema-day.webp',title:'Место для\nвашего шага.',label:'02 / Исследовать схему'},
 stories:{image:'assets/forest-day.webp?v=20261015',title:'Моменты,\nкоторые рядом.',label:'03 / Истории прогулок'},
 health:{image:'assets/top-day.webp',title:'Забота\nв движении.',label:'04 / Ходьба и здоровье'}
};

// Only hover/focus updates the preview. A touch or keyboard activation still navigates once.
export function mountMenuPreview({root=globalThis.document,menu,ImageClass=globalThis.Image}={}){
 const photo=menu?.querySelector?.('[data-menu-preview-image]'),title=menu?.querySelector?.('[data-menu-preview-title]'),label=menu?.querySelector?.('[data-menu-preview-label]');
 if(!photo||!title||!label)return {destroy(){}};
 const cleanups=[],animations=new Set();let ticket=0,pending=null,disposed=false,current='walk';
 const on=(el,event,fn)=>{el?.addEventListener(event,fn);cleanups.push(()=>el?.removeEventListener(event,fn));};
 function stopAnimations(){for(const animation of animations)animation.cancel();animations.clear();}
 function stopLoad(){ticket++;if(pending){pending.onload=null;pending.onerror=null;pending=null;}}
 function arrive(el,frames,options){if(motionReduced()||root.visibilityState==='hidden'||!el.animate)return;const animation=el.animate(frames,options);animations.add(animation);animation.finished.then(()=>animations.delete(animation),()=>animations.delete(animation));}
 function select(key){const data=menuPreviews[key];if(disposed||!data)return;if(key===current){stopLoad();return;}stopLoad();const version=ticket,im=new ImageClass();pending=im;
  im.onload=()=>{if(disposed||version!==ticket)return;pending=null;im.onload=null;im.onerror=null;stopAnimations();photo.src=data.image;title.textContent=data.title;label.textContent=data.label;current=key;
   arrive(photo,[{opacity:.5,transform:'scale(1.045)'},{opacity:1,transform:'scale(1)'}],{duration:950,easing:'cubic-bezier(.19,1,.22,1)'});
   arrive(title,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,easing:'cubic-bezier(.19,1,.22,1)'});
  };im.onerror=()=>{if(version===ticket)pending=null;im.onload=null;im.onerror=null;};im.src=data.image;
 }
 for(const button of menu.querySelectorAll('.full-menu>[data-go]')){on(button,'pointerenter',event=>{if(event.pointerType!=='touch')select(button.dataset.go);});on(button,'focus',()=>select(button.dataset.go));}
 on(menu,'close',()=>{stopLoad();stopAnimations();});on(root,'green-pulse-accessibility',()=>{if(motionReduced())stopAnimations();});on(root,'visibilitychange',()=>{if(root.visibilityState==='hidden'){stopLoad();stopAnimations();}});
 return {destroy(){disposed=true;stopLoad();stopAnimations();cleanups.forEach(fn=>fn());}};
}
