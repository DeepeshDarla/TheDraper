window.dataLayer = window.dataLayer || [];

function pushAnalyticsEvent(eventName, params) {
  window.dataLayer.push(Object.assign({ event: eventName }, params));
}

function resolveSectionLocation(el, ctaSectionValue) {
  const section = el.closest('section');
  const cls = section ? section.className : '';
  if (cls.indexOf('hero') > -1) { return 'hero'; }
  if (cls.indexOf('cta') > -1) { return ctaSectionValue; }
  return 'content';
}

const menu=document.querySelector('.menu');
const mobile=document.querySelector('.mobile-nav');
if(menu&&mobile){menu.addEventListener('click',()=>{mobile.classList.toggle('open');menu.setAttribute('aria-expanded',mobile.classList.contains('open'));});mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobile.classList.remove('open')))}

document.querySelectorAll('.faq-q').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const expanded=btn.getAttribute('aria-expanded')==='true';
    const panel=document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded',String(!expanded));
    if(panel){panel.classList.toggle('is-open',!expanded);}
  });
});

const preferredDate=document.getElementById('preferred-date');
if(preferredDate){preferredDate.min=new Date().toISOString().split('T')[0];}

document.addEventListener('click', function(e){
  const cta = e.target.closest('a.btn[href="contact.html"]');
  if(!cta){ return; }
  pushAnalyticsEvent('booking_cta_click', {
    page: window.location.pathname,
    cta_location: resolveSectionLocation(cta, 'closing_cta')
  });
});

document.addEventListener('click', function(e){
  const link = e.target.closest('a[href^="https://wa.me/"]');
  if(!link){ return; }
  let placement;
  if(link.classList.contains('whatsapp')){
    placement = 'floating';
  } else if(link.closest('footer')){
    placement = 'footer';
  } else {
    placement = resolveSectionLocation(link, 'contact');
  }
  pushAnalyticsEvent('whatsapp_click', {
    placement: placement,
    page: window.location.pathname
  });
});

document.addEventListener('click', function(e){
  const link = e.target.closest('a[href^="tel:"]');
  if(!link){ return; }
  let placement;
  if(link.closest('footer')){
    placement = 'footer';
  } else {
    placement = resolveSectionLocation(link, 'contact');
  }
  pushAnalyticsEvent('phone_click', {
    placement: placement,
    page: window.location.pathname
  });
});

const homeVisitForm=document.getElementById('home-visit-form');
const formNotice=document.getElementById('form-notice');
if(homeVisitForm){
  homeVisitForm.addEventListener('focusin',function(){
    pushAnalyticsEvent('form_start', {
      form_name: 'home-visit',
      page: window.location.pathname
    });
  },{once:true});

  homeVisitForm.addEventListener('submit',function(e){
    e.preventDefault();
    const btn=homeVisitForm.querySelector('button[type="submit"]');
    const originalBtnText=btn?btn.textContent:'';
    if(btn){btn.disabled=true;btn.textContent='SENDING...';}
    const body=new URLSearchParams(new FormData(homeVisitForm)).toString();
    fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body})
      .then(function(res){
        if(!res.ok){throw new Error('Submit failed');}
        const needField=homeVisitForm.querySelector('[name="need"]');
        const needValue=(needField&&needField.value)?needField.value:'not_specified';
        pushAnalyticsEvent('generate_lead', {
          form_name: 'home-visit',
          lead_type: 'home_visit',
          need: needValue
        });
        homeVisitForm.hidden=true;
        if(formNotice){formNotice.textContent="Thanks! We've received your enquiry and will contact you shortly to arrange your home visit.";}
      })
      .catch(function(){
        if(btn){btn.disabled=false;btn.textContent=originalBtnText;}
        if(formNotice){formNotice.textContent='Something went wrong sending that. Please try again, or message us directly on WhatsApp below.';}
      });
  });
}
