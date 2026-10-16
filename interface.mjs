import {mountMenuPreview} from './brand-motion.mjs?v=20261016-restored';
import {motionReduced} from './accessibility.mjs?v=20261016-restored';
import {mountRouteReveal} from './route-reveal.mjs?v=20261016-restored';

// Visual feedback stays separate from route, camera and comparison state.
export function mountInterface({menu,trigger,main,root=globalThis.document}={}){
  const menuPreview=mountMenuPreview({root,menu});
  const cleanups=[],ripples=new Set(),photoAnimations=new Set();let menuAnimation=null,pageAnimation=null,photoObserver=null,revealedPhotos=new WeakSet(),epoch=0,destroyed=false;
  const veil=root.getElementById?.('scene-transition');
  const routeReveal=mountRouteReveal({root});let routeSeen=false;
  const on=(target,type,fn,options)=>{target?.addEventListener(type,fn,options);cleanups.push(()=>target?.removeEventListener(type,fn,options));};
  const stopMenu=()=>{epoch++;menuAnimation?.cancel();menuAnimation=null;};
  const expanded=value=>trigger?.setAttribute('aria-expanded',String(value));
  function closeNow(){stopMenu();if(menu){menu.dataset.menuState='closed';if(menu.open)menu.close();}expanded(false);}
  function openMenu(){if(!menu||destroyed)return;stopMenu();if(!menu.open)menu.showModal();menu.dataset.menuState='open';expanded(true);
    if(!motionReduced()&&menu.animate){menuAnimation=menu.animate([{opacity:1,clipPath:'inset(0 0 100% 0)'},{opacity:1,clipPath:'inset(0)'}],{duration:780,easing:'cubic-bezier(.16,1,.3,1)'});menuAnimation.finished.catch(()=>{});}
  }
  function closeMenu({immediate=false}={}){if(!menu?.open)return;if(immediate||motionReduced()||!menu.animate){closeNow();return;}if(menu.dataset.menuState==='closing')return;
    stopMenu();const ticket=epoch;menu.dataset.menuState='closing';menuAnimation=menu.animate([{opacity:1,clipPath:'inset(0)'},{opacity:1,clipPath:'inset(0 0 100% 0)'}],{duration:360,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
    menuAnimation.finished.then(()=>{if(!destroyed&&ticket===epoch)closeNow();}).catch(()=>{});
  }
  function clearRipples(){for(const item of ripples){item.animation.cancel();item.node.remove();}ripples.clear();}
  function press(event){if(destroyed||motionReduced()||event.button>0)return;
    const button=event.target?.closest?.('.primary-button,.menu-button,.icon-button,.route-modes>button,.mode-switch>button,.global-theme,.accessibility-open,.pace-options>button,.checkpoint-buttons>button');
    if(!button||button.disabled||!button.animate)return;const bounds=button.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
    for(const item of ripples)if(item.button===button){item.animation.cancel();item.node.remove();ripples.delete(item);}
    const node=root.createElement('span'),size=Math.max(bounds.width,bounds.height)*2;node.className='ui-ripple';node.setAttribute('aria-hidden','true');
    node.style.width=node.style.height=`${size}px`;node.style.left=`${event.clientX-bounds.left-size/2}px`;node.style.top=`${event.clientY-bounds.top-size/2}px`;button.classList.add('ui-press-surface');button.appendChild(node);
    const animation=node.animate([{transform:'scale(0)',opacity:.2},{transform:'scale(1)',opacity:0}],{duration:650,easing:'cubic-bezier(.2,.7,.3,1)'}),item={node,animation,button};ripples.add(item);
    const remove=()=>{node.remove();ripples.delete(item);};animation.finished.then(remove,remove);
  }
  function stopPage(){routeReveal.stop();const animation=pageAnimation;pageAnimation=null;animation?.cancel();if(veil)veil.hidden=true;}
  function stopPhotos(){photoObserver?.disconnect();photoObserver=null;for(const animation of photoAnimations)animation.cancel();photoAnimations.clear();}
  function revealPhotos(){stopPhotos();if(motionReduced()||!globalThis.IntersectionObserver||!main?.querySelectorAll)return;
    photoObserver=new globalThis.IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting||revealedPhotos.has(entry.target))continue;revealedPhotos.add(entry.target);photoObserver?.unobserve(entry.target);if(!entry.target.animate)continue;
      const radius=entry.target.closest?.('.home')?'0px':'18px',animation=entry.target.animate([{opacity:.35,clipPath:`inset(0 0 16% 0 round ${radius})`},{opacity:1,clipPath:`inset(0 0 0 0 round ${radius})`}],{duration:1400,easing:'cubic-bezier(.16,1,.3,1)'});photoAnimations.add(animation);const clear=()=>photoAnimations.delete(animation);animation.finished.then(clear,clear);
    }},{threshold:.14});
    for(const photo of main.querySelectorAll('.home-scene-photo,.home-health-photo,.nordic-photo,.route-photo'))if(!revealedPhotos.has(photo))photoObserver.observe(photo);
  }
  function refresh({view,animate=true}={}){for(const button of menu?.querySelectorAll('[data-go]')||[]){if(button.dataset.go===view)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');}
    stopPage();revealedPhotos=new WeakSet();revealPhotos();if(motionReduced())return;if(view==='walk'&&!routeSeen&&routeReveal.play()){routeSeen=true;return;}if(!animate)return;
    if(veil?.animate){veil.hidden=false;const animation=veil.animate([{clipPath:'inset(0 0 0 0 round 0)',opacity:1},{clipPath:'inset(0 0 100% 0 round 0 0 70px 70px)',opacity:1}],{duration:view==='map'?760:1050,easing:'cubic-bezier(.76,0,.24,1)'});pageAnimation=animation;const clear=()=>{if(pageAnimation===animation){pageAnimation=null;veil.hidden=true;}};animation.finished.then(clear,clear);}
    else if(main?.animate){pageAnimation=main.animate([{opacity:.35},{opacity:1}],{duration:700,easing:'ease-out'});pageAnimation.finished.catch(()=>{});}
  }
  function motionChange(){if(!motionReduced()){revealPhotos();return;}stopPage();stopPhotos();clearRipples();if(menu?.dataset.menuState==='closing')closeNow();else stopMenu();}
  on(menu,'cancel',event=>{event.preventDefault();closeMenu();});
  on(menu,'click',event=>{if(event.target===menu)closeMenu();});
  on(menu,'close',()=>{stopMenu();menu.dataset.menuState='closed';expanded(false);});
  on(root,'click',event=>{if(event.target?.closest?.('[data-play-route-scene]')){stopPage();routeSeen=routeReveal.play()||routeSeen;}});
  on(root,'pointerdown',press,{passive:true});on(root,'green-pulse-accessibility',motionChange);on(root,'visibilitychange',()=>{if(root.visibilityState==='hidden'){stopPage();stopPhotos();clearRipples();if(menu?.dataset.menuState==='closing')closeNow();}else revealPhotos();});
  expanded(false);
  return {openMenu,closeMenu,refresh,destroy(){destroyed=true;menuPreview.destroy();closeNow();stopPage();routeReveal.destroy();stopPhotos();clearRipples();cleanups.forEach(fn=>fn());}};
}
