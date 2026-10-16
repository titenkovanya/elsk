import {imageFor} from './tour.mjs?v=20261016-restored';
import {motionReduced} from './accessibility.mjs?v=20261016-restored';
import {objectPosition} from './hero-scene.mjs?v=20261016-restored';

// Independent controls for the two retained visual scenes.
export const visualEffects={livingPhotos:true};
let sequence=0;
export function forestLivingMarkup(){if(!visualEffects.livingPhotos)return '';const id=`forest-live-${++sequence}`;return `${['day','night'].map(mode=>`<div class="forest-live-layer forest-live-${mode}" aria-hidden="true"><svg class="forest-live-art" viewBox="0 0 1672 809"><defs><filter id="${id}-${mode}-soft"><feGaussianBlur stdDeviation="3"/></filter><mask id="${id}-${mode}-patch" maskUnits="userSpaceOnUse" x="0" y="0" width="1672" height="809"><rect width="1672" height="809" fill="black"/><path d="M1215 258H1415L1390 356L1406 451H1182L1202 362Z" fill="white" filter="url(#${id}-${mode}-soft)"/></mask><mask id="${id}-${mode}-leaves"><ellipse cx="255" cy="275" rx="120" ry="225" fill="white" filter="url(#${id}-${mode}-soft)"/></mask><radialGradient id="${id}-${mode}-glow"><stop stop-color="#ffdc92" stop-opacity=".15"/><stop offset="1" stop-color="#ffdc92" stop-opacity="0"/></radialGradient><filter id="${id}-${mode}-dapple"><feGaussianBlur stdDeviation="18"/></filter></defs><image data-scene-src="${imageFor('forest',mode)}" width="1672" height="809"/><image data-scene-src="assets/forest-plate-${mode}.webp" width="1672" height="809" mask="url(#${id}-${mode}-patch)"/><g class="live-swing"><g class="live-swing-align live-swing-align-${mode}"><image data-scene-src="assets/forest-swing-${mode}.webp" width="1672" height="809"/></g></g></svg></div>`).join('')}`;}

export function imagePlacement(width,height,sourceWidth,sourceHeight,fit='cover',x=.5,y=.5){if(!(width>0&&height>0&&sourceWidth>0&&sourceHeight>0))return null;const scale=(fit==='contain'?Math.min:Math.max)(width/sourceWidth,height/sourceHeight),w=sourceWidth*scale,h=sourceHeight*scale;return {left:(width-w)*x,top:(height-h)*y,width:w,height:h};}

export function preloadSceneAssets(urls,{ImageClass=globalThis.Image}={}){
 let stopped=false;const images=[],settlers=[];
 const ready=Promise.all(urls.map(url=>new Promise(resolve=>{const im=new ImageClass();images.push(im);let done=false;const finish=ok=>{if(done)return;done=true;im.onload=null;im.onerror=null;resolve(ok);};settlers.push(()=>finish(false));im.onload=()=>finish(true);im.onerror=()=>finish(false);im.src=url;if(im.complete)finish(Boolean(im.naturalWidth));}))).then(results=>!stopped&&results.every(Boolean));
 return {ready,destroy(){stopped=true;settlers.forEach(settle=>settle());images.length=0;}};
}

export function mountLivingScenes({root=globalThis.document,ImageClass=globalThis.Image}={}){
 const pairs=[...(root.querySelectorAll?.('[data-live-forest]')||[])],cleanups=[],loads=new Set();let disposed=false;
 const on=(target,name,fn,options)=>{target?.addEventListener(name,fn,options);cleanups.push(()=>target?.removeEventListener(name,fn,options));};
 const records=[];
 if(visualEffects.livingPhotos)for(const pair of pairs)records.push({root:pair,kind:'forest',ready:false,loading:false,visible:false,urls:[imageFor('forest','day'),imageFor('forest','night'),'assets/forest-plate-day.webp','assets/forest-plate-night.webp','assets/forest-swing-day.webp','assets/forest-swing-night.webp']});
 function measure(record){const photo=record.root.querySelector('.photo-day');if(!photo)return;const box=record.root.getBoundingClientRect(),style=globalThis.getComputedStyle?.(photo),[x,y]=objectPosition(style?.objectPosition||'50% 50%'),placement=imagePlacement(box.width,box.height,1672,809,style?.objectFit||'contain',x,y);if(placement)for(const art of record.root.querySelectorAll('.forest-live-art'))for(const [key,value] of Object.entries(placement))art.style[key]=`${value}px`;}

 function paint(record){const active=record.visible&&!root.hidden&&root.visibilityState!=='hidden'&&!motionReduced();record.root.dataset.livingActive=String(active);record.root.dataset['liveReady']=String(record.ready&&active);if(active&&!record.ready&&!record.loading&&!record.failed){record.loading=true;const loader=preloadSceneAssets(record.urls,{ImageClass});loads.add(loader);loader.ready.then(ok=>{loads.delete(loader);if(disposed)return;record.loading=false;record.ready=ok;if(!ok)record.failed=true;if(ok)for(const image of record.root.querySelectorAll('[data-scene-src]'))image.setAttribute('href',image.dataset.sceneSrc);measure(record);record.root.dataset['liveReady']=String(ok&&record.visible&&!root.hidden&&root.visibilityState!=='hidden'&&!motionReduced());});}}
 for(const record of records)for(const image of record.root.querySelectorAll('[data-scene-src]'))on(image,'error',()=>{record.failed=true;record.ready=false;record.root.dataset['liveReady']='false';});
 let observer=null;if(globalThis.IntersectionObserver){observer=new IntersectionObserver(entries=>{for(const entry of entries){const record=records.find(item=>item.root===entry.target);if(record){record.visible=entry.isIntersecting;paint(record);}}},{rootMargin:'100px',threshold:.01});for(const record of records)observer.observe(record.root);cleanups.push(()=>observer.disconnect());}else for(const record of records){record.visible=true;paint(record);}
 if(globalThis.ResizeObserver){const observer=new ResizeObserver(()=>records.forEach(measure));for(const record of records)observer.observe(record.root);cleanups.push(()=>observer.disconnect());}
 const refresh=()=>{for(const record of records){measure(record);paint(record);}};on(window,'resize',refresh);on(root,'visibilitychange',refresh);on(root,'green-pulse-accessibility',refresh);records.forEach(measure);
 return {destroy(){disposed=true;for(const loader of loads)loader.destroy();loads.clear();cleanups.forEach(fn=>fn());for(const record of records){record.root.dataset.livingActive='false';record.root.dataset.liveReady='false';}}};
}
