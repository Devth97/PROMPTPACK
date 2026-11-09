// Optional motion controls; category navigation and the graphic work without JavaScript.
(()=>{
 const art=document.querySelector('[data-hero-universe]');if(!art)return;
 const button=art.querySelector('.uh-motion');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false;
 const update=()=>{art.dataset.paused=String(paused);button.setAttribute('aria-pressed',String(paused));button.innerHTML=paused?'Resume motion <span aria-hidden="true">▶</span>':'Pause motion <span aria-hidden="true">Ⅱ</span>';button.hidden=reduced.matches;};
 button.addEventListener('click',()=>{paused=!paused;update();});
 reduced.addEventListener('change',update);update();
})();
