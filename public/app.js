import {business,reviewTags,storeStatus} from './business.js';

const paths={
 'pin':'<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 'arrow-up-right':'<path d="M6 18 18 6M6 6h12v12"/>',
 'arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 'arrow-left':'<path d="M20 12H4m6-6-6 6 6 6"/>',
 'directions':'<path d="m12 2 10 10-10 10L2 12Z"/><path d="M8 15v-5h8m-3-3 3 3-3 3"/>',
 'phone':'<path d="m7 3 3 5-3 3c1.5 3 3 4.5 6 6l3-3 5 3c-1 5-4 5-7 4C7 18 4 15 2 8 1 5 2 3 7 3Z"/>',
 'star':'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
 'instagram':'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none"/>',
 'facebook':'<path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h2V2.5c-.7-.1-1.7-.3-3-.3-3 0-5 1.8-5 5V9H7v4h3v8"/>',
 'contact':'<rect x="4" y="3" width="17" height="18" rx="2"/><path d="M2 7h4m-4 5h4m-4 5h4m4 0c0-4 7-4 7 0"/><circle cx="13.5" cy="9" r="2.5"/>',
 'share':'<path d="M12 16V3m-4 4 4-4 4 4M7 11H4v10h16V11h-3"/>',
 'image':'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m21 16-6-6L3 21"/>',
 'sparkles':'<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4ZM20 2v4m-2-2h4"/>',
 'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 'check':'<path d="m5 12 4 4L19 6"/><circle cx="12" cy="12" r="10"/>',
 'card':'<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20m-15 5h3"/>',
 'access':'<circle cx="12" cy="3" r="1"/><path d="m5 7 7 2 7-2m-7 2v5m-4 7 4-7 4 7"/>',
 'parking':'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M10 17V7h3a3 3 0 0 1 0 6h-3"/>',
 'wine':'<path d="M8 3h8l1 6a5 5 0 0 1-10 0Zm4 11v7m-4 0h8M7 8h10"/>',
 'bottle':'<path d="M10 2h4v5l3 4v11H7V11l3-4Zm0 2h4M7 14h10"/>',
 'beer':'<path d="M5 7h12v14H5Zm12 2h4v8h-4M5 7C1 3 9 1 10 4c3-4 9 0 7 3M9 11v6m4-6v6"/>',
 'can':'<rect x="6" y="3" width="12" height="18" rx="3"/><path d="M7 7h10M7 17h10m-7-13h4"/>',
 'copy':'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
 'download':'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
 'close':'<path d="m6 6 12 12M18 6 6 18"/>',
};
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.check}</svg>`;
function icons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});}
const $=selector=>document.querySelector(selector);
let config={...business,cardUrl:`${location.origin}/schaumburg-liquors`};
let photoIndex=0,busy=false,lastInput=null,toastTimer,previousFocus;
const selectedTags=new Set();
function event(name){window.dispatchEvent(new CustomEvent('card:action',{detail:{name,business:business.name}}));}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),4500);}
async function copy(text){try {await navigator.clipboard.writeText(text);return true;}catch {const input=document.createElement('textarea');input.value=text;input.style.position='fixed';input.style.opacity='0';const parent=document.querySelector('dialog[open]')||document.body;const focus=document.activeElement;parent.append(input);input.select();let result=false;try{result=document.execCommand('copy');}catch{}input.remove();focus?.focus();return result;}}
function bindLinks(){document.querySelectorAll('[data-link]').forEach(el=>{const key=el.dataset.link;el.href=key==='phone'?`tel:${config.phone}`:config[key];if(key!=='phone'){el.target='_blank';el.rel='noopener noreferrer';}el.onclick=()=>event(`${key}_click`);});}
function updateStatus(){const open=storeStatus(new Date(),config);$('#open-status').textContent=`${open?'Open now':'Closed now'} · Central time`;$('#open-status').classList.toggle('open',open);}
function startCoverCarousel(){
  const cover=$('.cover'),track=$('.cover-track');
  if(config.gallery.length<2)return;
  for(const [number] of [...config.gallery.slice(1),config.gallery[0]]){
    const image=document.createElement('img');
    image.src=`/assets/store-${number}.webp`;image.alt='';image.width=1024;image.height=768;image.decoding='async';
    track.append(image);
  }
  const frames=[];
  config.gallery.forEach((_,index)=>{
    frames.push({transform:`translateX(-${index*100}%)`,offset:index/config.gallery.length});
    frames.push({transform:`translateX(-${index*100}%)`,offset:(index+.85)/config.gallery.length,easing:'ease-in-out'});
  });
  frames.push({transform:`translateX(-${config.gallery.length*100}%)`,offset:1});
  const animation=track.animate(frames,{duration:config.gallery.length*4500,iterations:Infinity,easing:'linear'});
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const updatePlayback=()=>{
    if(reducedMotion.matches){animation.pause();animation.currentTime=0;}
    else if(document.hidden || cover.matches(':hover') || document.querySelector('dialog[open]'))animation.pause();
    else animation.play();
  };
  reducedMotion.addEventListener('change',updatePlayback);
  document.addEventListener('visibilitychange',updatePlayback);
  cover.addEventListener('pointerenter',updatePlayback);cover.addEventListener('pointerleave',updatePlayback);
  new MutationObserver(updatePlayback).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  updatePlayback();
}
function openDialog(id){previousFocus=document.activeElement;$(id).showModal();event(id==='#review-dialog'?'ai_review_started':'gallery_open');}
function closeDialog(dialog){dialog.close();previousFocus?.focus();}
function google(){if(!config.googleReviewUrl){$('#google-status').textContent='The direct Google review link is being set up. You can write and copy your review here, or find the store on Google Maps.';toast('The direct Google review link is being set up.');return;}event('google_review_click');window.open(config.googleReviewUrl,'_blank','noopener,noreferrer');}
function showPhoto(index){photoIndex=(index+config.gallery.length)%config.gallery.length;const [number,alt]=config.gallery[photoIndex];$('#lightbox-image').src=`/assets/store-${number}.webp`;$('#lightbox-image').alt=alt;$('#lightbox-caption').textContent=alt;$('#photo-counter').textContent=`${photoIndex+1} / ${config.gallery.length}`;}
function saveContact(){const esc=s=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');const lines=['BEGIN:VCARD','VERSION:3.0',`FN:${esc(config.name)}`,`ORG:${esc(config.name)}`,`TEL;TYPE=WORK,VOICE:${config.phone}`,`ADR;TYPE=WORK:;;${esc(config.addressParts.streetAddress)};${esc(config.addressParts.addressLocality)};${esc(config.addressParts.addressRegion)};${esc(config.addressParts.postalCode)};${esc(config.addressParts.addressCountry)}`,`URL:${config.cardUrl}`];if(config.email)lines.push(`EMAIL:${esc(config.email)}`);lines.push('END:VCARD');const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/vcard;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Schaumburg-Liquors.vcf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);event('save_contact_click');toast('Contact card downloaded. Open it to save.');}
async function share(){event('share_click');if(navigator.share){try{await navigator.share({title:config.name,text:config.tagline,url:config.cardUrl});return;}catch(error){if(error.name==='AbortError')return;}}toast(await copy(config.cardUrl)?'Link copied':'Unable to copy. You can share the address from your browser.');}
function resetReview(){if(busy)return;$('#review-form').hidden=false;$('#suggestions').hidden=true;$('#review-editor').hidden=true;$('#review-error').hidden=true;$('#review-form').reset();selectedTags.clear();document.querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-pressed','false'));$('#note-count').textContent='0 / 500';$('#final-review').value='';lastInput=null;$('#review-form input').focus();}
function editor(text=''){$('#review-form').hidden=true;$('#suggestions').hidden=true;$('#review-error').hidden=true;$('#review-editor').hidden=false;$('#final-review').value=text;$('#handoff-status').textContent='';$('#final-review').focus();}
async function generate(input){if(busy)return;busy=true;lastInput=input;$('#review-error').hidden=true;$('#review-form').hidden=true;$('#suggestions').hidden=true;$('#review-editor').hidden=true;$('#review-loading').hidden=false;$('#generate-button').disabled=true;event('ai_review_generated_requested');try{const response=await fetch('/api/review-assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal:AbortSignal.timeout(25000)});const result=await response.json();if(!response.ok)throw new Error(result.error||'Suggestions are unavailable.');if(!Array.isArray(result.suggestions)||result.suggestions.length!==5||result.suggestions.some(s=>typeof s!=='string'))throw new Error('Suggestions are unavailable.');$('#suggestion-list').replaceChildren();result.suggestions.forEach((text,index)=>{const card=document.createElement('article');card.className='suggestion-card';const title=document.createElement('h4');title.textContent=`Option ${index+1} — ${['Natural','Short','Friendly','Detailed','Casual'][index]}`;const p=document.createElement('p');p.textContent=text;const select=document.createElement('button');select.className='text-button';select.textContent='Choose & edit →';select.onclick=()=>editor(text);card.append(title,p,select);$('#suggestion-list').append(card);});$('#suggestions').hidden=false;$('#suggestions button').focus();event('ai_review_generated');}catch(error){$('#review-form').hidden=false;$('#review-error').hidden=false;$('#review-error').textContent=error.name==='TimeoutError'?'This is taking longer than expected. Try again, write your own review below, or open Google Reviews.':`${error.message} Try again, or write your own review below.`;$('#generate-button').innerHTML=`${icon('sparkles')} Try again`;}finally{busy=false;$('#generate-button').disabled=false;$('#review-loading').hidden=true;}}

function init(){
  icons();bindLinks();updateStatus();setInterval(updateStatus,60000);startCoverCarousel();
  $('#tagline').textContent=config.tagline;$('#short-address').textContent=config.address.replace(', IL 60194',', IL');$('#full-address').textContent=config.address;$('#footer-address').textContent=config.address;$('#phone-display').textContent=config.phoneDisplay;$('#copyright').textContent=`© ${new Date().getFullYear()} ${config.name}.`;
  $('#highlights').innerHTML=config.highlights.map((text,i)=>`<div class="highlight">${icon(['card','card','access','parking'][i])}<span>${text}</span></div>`).join('');
  $('#categories').innerHTML=config.categories.map((text,i)=>`<span class="category">${icon(['bottle','wine','beer','can'][i])}${text}</span>`).join('');
  $('#hours').innerHTML=config.hoursRows.map(([day,hours])=>`<div class="hours-row"><span>${day}</span><span>${hours}</span></div>`).join('');
  [1,2,3].forEach((index,i)=>{const [number,alt]=config.gallery[index];const button=document.createElement('button');button.setAttribute('aria-label',`View photo: ${alt}`);button.innerHTML=`<img src="/assets/store-${number}-small.webp" srcset="/assets/store-${number}-small.webp 480w, /assets/store-${number}.webp 1200w" sizes="(max-width:600px) 50vw, 330px" width="480" height="360" loading="lazy" alt="${alt}">${i===2?'<span class="gallery-overlay">+8 more photos</span>':''}`;button.onclick=()=>{showPhoto(index);openDialog('#gallery-dialog');};$('#gallery-grid').append(button);});
  $('#ratings').innerHTML=['Poor','Fair','Good','Great','Excellent'].map((label,i)=>`<label class="rating"><input type="radio" name="rating" value="${i+1}" required aria-label="${i+1} — ${label}"><span><b aria-hidden="true">${'★'.repeat(i+1)}</b>${label}</span></label>`).join('');
  reviewTags.forEach(tag=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=tag;b.setAttribute('aria-pressed','false');b.onclick=()=>{selectedTags.has(tag)?selectedTags.delete(tag):selectedTags.add(tag);b.setAttribute('aria-pressed',String(selectedTags.has(tag)));};$('#review-tags').append(b);});
  $('#customer-note').addEventListener('input',e=>$('#note-count').textContent=`${e.target.value.length} / 500`);
  $('#review-form').addEventListener('submit',e=>{e.preventDefault();generate({rating:Number(new FormData(e.target).get('rating')),tags:[...selectedTags],note:$('#customer-note').value});});
  document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('[data-close]').onclick=()=>closeDialog(dialog);dialog.addEventListener('cancel',()=>{setTimeout(()=>previousFocus?.focus(),0);});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(dialog);}});dialog.addEventListener('keydown',e=>{if(dialog.id==='gallery-dialog' && ['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();showPhoto(photoIndex+(e.key==='ArrowRight'?1:-1));}});});
  document.addEventListener('click',async e=>{const target=e.target.closest('[data-action]');if(!target)return;switch(target.dataset.action){
    case 'share':await share();break;
    case 'copy-link':toast(await copy(config.cardUrl)?'Link copied':'Couldn’t copy the link. Use your browser’s address bar.');break;
    case 'address':toast(await copy(config.address)?'Address copied':'Couldn’t copy the address.');break;
    case 'contact':saveContact();break;
    case 'review':openDialog('#review-dialog');break;
    case 'google':google();break;
    case 'gallery':showPhoto(0);openDialog('#gallery-dialog');break;
    case 'next-photo':showPhoto(photoIndex+1);break;
    case 'previous-photo':showPhoto(photoIndex-1);break;
    case 'start-over':resetReview();break;
    case 'write-own':if(!busy)editor();break;
    case 'regenerate':if(lastInput){event('ai_review_regenerated');generate(lastInput);}else resetReview();break;
    case 'copy-review':if(!$('#final-review').value.trim()){toast('Write a little about your visit first.');break;}toast(await copy($('#final-review').value)?'Review copied':'Couldn’t copy. Select your review text and copy it manually.');event('ai_review_copied');break;
    case 'continue':{const text=$('#final-review').value.trim();if(!text){toast('Write a little about your visit first.');break;}const copied=await copy(text);$('#handoff-status').textContent=copied?'Review text copied. Paste it into Google and make any final changes before submitting.':'Copy was blocked. Select and copy your text before opening Google.';event('google_review_continue');if(config.googleReviewUrl){const link=document.createElement('a');link.href=config.googleReviewUrl;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open Google Reviews →';link.className='text-button';$('#handoff-status').append(document.createElement('br'),link);toast(copied?'Review copied. Open Google Reviews below.':'Copy your review, then open Google Reviews below.');}else google();break;}
  }});
  document.querySelectorAll('[data-event]').forEach(el=>el.addEventListener('click',()=>event(el.dataset.event)));
  $('#gallery-dialog img').addEventListener('error',()=>{$('#lightbox-caption').textContent='This photo could not load. Try the next photo.';});
  $('.qr-wrap img').addEventListener('error',()=>{$('.qr-wrap').textContent='QR unavailable. Use Share card or Copy link.';});
  event('card_view');
}

init();
fetch('/api/config').then(r=>{if(!r.ok)throw new Error();return r.json();}).then(value=>{config=value;bindLinks();updateStatus();if(config.websiteUrl){const link=$('#website-link');link.hidden=false;link.href=config.websiteUrl;link.target='_blank';link.rel='noopener noreferrer';}if(!config.googleReviewUrl){$('#google-status').textContent='Direct Google review link coming soon. You can still write and copy your review.';}const schema=document.createElement('script');schema.type='application/ld+json';schema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'LiquorStore',name:config.name,telephone:config.phone,url:config.cardUrl,image:`${location.origin}/assets/store-7.webp`,address:{'@type':'PostalAddress',...config.addressParts},sameAs:[config.instagramUrl,config.facebookUrl],openingHours:['Mo-Th 10:30-22:00','Fr-Sa 10:30-24:00','Su 11:00-20:00']});document.head.append(schema);}).catch(()=>{$('#google-status').textContent='Review link temporarily unavailable. Your draft can still be copied.';});
