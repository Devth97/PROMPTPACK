'use strict';
(() => {
 const form=document.querySelector('[data-blog-search]');
 if(!form)return;
 const input=document.getElementById('blog-search'),status=document.getElementById('blog-results');
 const cards=[...document.querySelectorAll('[data-blog-card]')],groups=[...document.querySelectorAll('[data-blog-group]')];
 const searchable=cards.map(card=>({card,text:card.textContent.toLowerCase()}));
 function filter(){
  const terms=input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let count=0;
  for(const item of searchable){item.card.hidden=!terms.every(term=>item.text.includes(term));if(!item.card.hidden)count++;}
  for(const group of groups)group.hidden=![...group.querySelectorAll('[data-blog-card]')].some(card=>!card.hidden);
  status.textContent=count+' of '+cards.length+' articles';
  document.getElementById('blog-empty').hidden=count!==0;
 }
 form.hidden=false;
 form.addEventListener('submit',event=>event.preventDefault());
 input.addEventListener('input',filter);
 form.addEventListener('reset',()=>{input.value='';filter();input.focus();});
})();
