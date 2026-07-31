/* Salido Resort — behaviour */
(function(){
  "use strict";

  /* respect "reduce motion": SVG (SMIL) animations ignore the CSS media query,
     so stop the logo shine sweep for users who prefer reduced motion */
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var glints = document.querySelectorAll('#logoGlint animateTransform');
    for(var gi=0; gi<glints.length; gi++){
      try{ glints[gi].parentNode.removeChild(glints[gi]); }catch(e){}
    }
  }

  var head = document.getElementById('head');
  var onScroll = function(){ head.classList.toggle('is-stuck', window.scrollY > 40); };
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  /* Temporarily simplify costly visual effects while scrolling. */
  var scrollEndTimer = 0;
  window.addEventListener('scroll', function(){
    document.body.classList.add('is-scrolling');
    window.clearTimeout(scrollEndTimer);
    scrollEndTimer = window.setTimeout(function(){
      document.body.classList.remove('is-scrolling');
    }, 120);
  }, {passive:true});


  /* cinematic "live image" hero: gentle scroll parallax and pointer-responsive depth */
  var hero = document.querySelector('.hero');
  var heroImg = document.querySelector('.hero__media');
  var heroVideo = document.querySelector('.hero__video');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(heroVideo){
    var markVideoReady = function(){ hero && hero.classList.add('is-video-ready'); };
    if(heroVideo.readyState >= 3) markVideoReady();
    else heroVideo.addEventListener('canplay', markVideoReady, {once:true});
    if(reduceMotion){ heroVideo.pause(); }
    if('IntersectionObserver' in window && !reduceMotion){
      var videoObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ var playPromise=heroVideo.play(); if(playPromise&&playPromise.catch) playPromise.catch(function(){}); }
          else heroVideo.pause();
        });
      }, {threshold:.05});
      videoObserver.observe(heroVideo);
    }
  }
  if(hero && heroImg && !reduceMotion && !(window.matchMedia && window.matchMedia('(pointer: coarse)').matches)){
    var glow = document.createElement('span');
    glow.className = 'hero__glow';
    glow.setAttribute('aria-hidden','true');
    hero.appendChild(glow);
    var raf = 0;
    function paintHero(){
      raf = 0;
      var rect = hero.getBoundingClientRect();
      var progress = Math.max(-1, Math.min(1, -rect.top / Math.max(rect.height,1)));
      hero.style.setProperty('--hero-scroll', (progress * 18).toFixed(1) + 'px');
    }
    window.addEventListener('scroll', function(){ if(!raf) raf=requestAnimationFrame(paintHero); }, {passive:true});
    hero.addEventListener('pointermove', function(e){
      var r=hero.getBoundingClientRect();
      var nx=(e.clientX-r.left)/r.width-.5, ny=(e.clientY-r.top)/r.height-.5;
      hero.style.setProperty('--hero-x',(nx*-10).toFixed(1)+'px');
      hero.style.setProperty('--hero-y',(ny*-7).toFixed(1)+'px');
      glow.style.left=(e.clientX-r.left)+'px'; glow.style.top=(e.clientY-r.top)+'px'; glow.style.opacity='.22';
    });
    hero.addEventListener('pointerleave', function(){
      hero.style.setProperty('--hero-x','0px'); hero.style.setProperty('--hero-y','0px'); glow.style.opacity='0';
    });
    paintHero();
  }

  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function(){
    var open = document.body.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.addEventListener('click', function(e){
    if(e.target.tagName === 'A'){ document.body.classList.remove('is-open'); burger.setAttribute('aria-expanded','false'); }
  });

  document.getElementById('yr').textContent = new Date().getFullYear();

  /* reveal on scroll */
  var els = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
    els.forEach(function(el){ io.observe(el); });
  } else {
    els.forEach(function(el){ el.classList.add('in'); });
  }

  /* the dock (WhatsApp/call/top) hides while any section that already has its own
     WhatsApp button is on screen — so it never covers those buttons */
  var dock = document.querySelector('.dock');
  var hideEls = document.querySelectorAll('[data-dock-hide]');
  if(dock && hideEls.length && 'IntersectionObserver' in window){
    var visible = new Set();
    var dio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting) visible.add(en.target); else visible.delete(en.target);
      });
      dock.classList.toggle('show', visible.size === 0);
    }, {threshold:0});
    hideEls.forEach(function(el){ dio.observe(el); });
  } else if(dock){
    dock.classList.add('show');
  }

  /* scroll-to-top (lives in the dock, so it shows/hides with it) */
  var topBtn = document.getElementById('topBtn');
  if(topBtn){
    topBtn.addEventListener('click', function(){
      window.scrollTo({ top:0, behavior:'smooth' });
    });
  }

  /* attraction detail modal — clicking a Kandy card opens more info */
  var rail = document.querySelector('.rail');
  var sm = document.getElementById('spotModal');
  if(rail && sm){
    var EXTRA = [{"desc":["A 27-acre bird park in the Hanthana hills, next to the Tea Museum, opened in 2023.","Home to over a hundred endemic and migratory species — parrots, owls, eagles, kingfishers and peacocks — with walk-through areas, feeding times, and small animals the children will like."],"facts":[["What it is","27-acre bird park & recreation centre"],["Good for","Families and an easy half-day"],["Best time","Early morning or late afternoon"],["Entry","Ticketed — check the current rate"]],"maps":"Hanthana International Bird Park, Kandy"},{"desc":["Sri Dalada Maligawa — Sri Lanka's holiest Buddhist site and a UNESCO World Heritage Site — sits on Kandy Lake within the old royal palace complex.","It houses the sacred tooth relic of the Buddha, kept inside golden caskets. The relic itself is never shown, but during the daily puja the shrine doors open and the drums begin."],"facts":[["Open","Daily, roughly 5:30am – 8:00pm"],["Puja (offerings)","5:30am · 9:30am · 6:30pm — evening is the most atmospheric"],["Entry","Around LKR 2,000 for foreign visitors"],["Dress","Cover shoulders and knees; shoes off inside"]],"maps":"Temple of the Sacred Tooth Relic, Kandy"},{"desc":["Also called Kiri Muhuda, the “Sea of Milk”, this lake was created in 1807 by the last king of Kandy.","A slow loop beside the temple and the old town — one of the nicest and easiest things to do in the city."],"facts":[["Cost","Free to walk"],["Best time","Early morning or evening"],["Right by","The Temple of the Tooth"]],"maps":"Kandy Lake, Kandy"},{"desc":["An 88-foot white seated Buddha on Bahirawa Kanda hill, completed in the 1990s and visible from all over the city.","The short climb (or a quick tuk-tuk) is rewarded with the best panoramic view over Kandy, the lake and the hills. It's lit up at night."],"facts":[["Highlight","The best viewpoint over Kandy"],["Best time","Late afternoon, for the sunset"],["Entry","Small fee, around LKR 250"],["Dress","Cover shoulders and knees; shoes off"]],"maps":"Bahirawakanda Vihara Buddha Statue, Kandy"},{"desc":["The city centre — colonial-era facades, the central market, shops, and plenty of places to eat before the drive back.","The National Museum of Kandy sits right beside the Temple of the Tooth if you want a little more history."],"facts":[["What's there","Market, shops and food"],["Nearby","National Museum, by the temple"],["Best time","Daytime for the market"]],"maps":"Kandy city centre, Sri Lanka"},{"desc":["A shaded loop all the way around Kandy Lake — flat, easy and quiet, with the temple and old town on one side.","Best early in the day, before the heat and the traffic build up."],"facts":[["Cost","Free"],["Best time","Early morning"],["Good for","An easy stroll"]],"maps":"Kandy Lake, Kandy"}];
    var smImg=document.getElementById('sm-img'), smEye=document.getElementById('sm-eyebrow'),
        smTitle=document.getElementById('sm-title'), smKm=document.getElementById('sm-km'),
        smDesc=document.getElementById('sm-desc'), smFacts=document.getElementById('sm-facts'),
        smDir=document.getElementById('sm-dir'), smX=document.getElementById('sm-x'), smLast=null;
    function esc(s){ var d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
    function openSpot(card){
      var i=+card.getAttribute('data-i'); var x=EXTRA[i]||{desc:[],facts:[],maps:''};
      var img=card.querySelector('img'); smImg.src=img?img.src:''; smImg.alt=img?img.alt:'';
      var eye=card.querySelector('.spot__body span'); smEye.textContent=eye?eye.textContent:'';
      var t=card.querySelector('h3'); smTitle.textContent=t?t.textContent:'';
      var km=card.querySelector('.spot__km'); smKm.textContent=km?km.textContent:'';
      smDesc.innerHTML=(x.desc||[]).map(function(p){return '<p>'+esc(p)+'</p>';}).join('');
      smFacts.innerHTML=(x.facts||[]).map(function(f){return '<li><span><b>'+esc(f[0])+':</b> '+esc(f[1])+'</span></li>';}).join('');
      smDir.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(x.maps||smTitle.textContent);
      smLast=document.activeElement; sm.classList.add('open'); document.body.style.overflow='hidden'; smX.focus();
    }
    function closeSpot(){ sm.classList.remove('open'); document.body.style.overflow=''; if(smLast) smLast.focus(); }
    rail.addEventListener('click', function(e){ var c=e.target.closest('.spot'); if(c) openSpot(c); });
    rail.addEventListener('keydown', function(e){
      var c=e.target.closest('.spot'); if(!c) return;
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openSpot(c); }
    });
    smX.addEventListener('click', closeSpot);
    sm.addEventListener('click', function(e){ if(e.target===sm) closeSpot(); });
    sm.addEventListener('keydown', function(e){
      if(e.key==='Escape'){ closeSpot(); return; }
      if(e.key==='Tab'){ var f=[smX,smDir]; var idx=f.indexOf(document.activeElement); e.preventDefault(); f[(idx+(e.shiftKey?-1:1)+f.length)%f.length].focus(); }
    });
  }

  /* filterable gallery + lightbox */
  var gal = document.querySelector('.lux-gallery');
  if(gal){
    var allShots = [].slice.call(gal.querySelectorAll('figure'));
    var shots = allShots.slice();
    function setOrientation(figure){
      var img=figure.querySelector('img'); if(!img) return;
      function apply(){
        var portrait=img.naturalHeight>img.naturalWidth;
        figure.classList.toggle('is-portrait',portrait);
        figure.classList.toggle('is-landscape',!portrait);
        figure.setAttribute('data-orientation',portrait?'portrait':'landscape');
      }
      if(img.complete && img.naturalWidth) apply(); else img.addEventListener('load',apply,{once:true});
    }
    allShots.forEach(function(figure){
      setOrientation(figure);
      var cap=figure.querySelector('figcaption');
      var hasCaption=!!(cap && cap.textContent.trim());
      figure.classList.toggle('has-caption',hasCaption);
      if(cap) cap.hidden=!hasCaption;
    });
    var filterButtons = [].slice.call(document.querySelectorAll('[data-gallery-filter]'));
    var result = document.getElementById('gallery-result');
    var labels = {gallery:'gallery',rooms:'room'};
    function applyGalleryFilter(category){
      allShots.forEach(function(figure){
        var match = category === 'all' || figure.getAttribute('data-category') === category;
        figure.hidden = !match;
      });
      shots = allShots.filter(function(figure){ return !figure.hidden; });
      filterButtons.forEach(function(button){
        var active = button.getAttribute('data-gallery-filter') === category;
        button.classList.toggle('is-active',active);
        button.setAttribute('aria-selected',active?'true':'false');
      });
      gal.classList.remove('is-filtering'); void gal.offsetWidth; gal.classList.add('is-filtering');
      if(result){
        var noun = labels[category] || 'gallery';
        result.textContent = 'Showing '+shots.length+' '+noun+' photo'+(shots.length===1?'':'s');
      }
    }
    filterButtons.forEach(function(button){
      button.addEventListener('click',function(){ applyGalleryFilter(button.getAttribute('data-gallery-filter')); });
    });
    applyGalleryFilter('gallery');

    var lb = document.getElementById('lb'), lbImg = document.getElementById('lb-img'),
        lbCap = document.getElementById('lb-cap'), cur = 0, lastFocus = null;
    var lbX = document.getElementById('lb-x'), lbP = document.getElementById('lb-p'), lbN = document.getElementById('lb-n');
    function showPhoto(i){
      if(!shots.length) return;
      cur = (i + shots.length) % shots.length;
      var img = shots[cur].querySelector('img');
      lbImg.src = img.src; lbImg.alt = img.alt || '';
      var cap = shots[cur].querySelector('figcaption');
      var caption = cap ? cap.textContent.trim() : '';
      lbCap.textContent = caption;
      lbCap.hidden = !caption;
    }
    function openPhoto(figure){
      shots = allShots.filter(function(item){ return !item.hidden; });
      var i = shots.indexOf(figure); if(i<0) return;
      lastFocus=document.activeElement; showPhoto(i); lb.classList.add('open');
      document.body.style.overflow='hidden'; lbX.focus();
    }
    function closePhoto(){ lb.classList.remove('open'); document.body.style.overflow=''; if(lastFocus) lastFocus.focus(); }
    allShots.forEach(function(figure){
      figure.setAttribute('tabindex','0'); figure.setAttribute('role','button');
      figure.addEventListener('click',function(){ openPhoto(figure); });
      figure.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();openPhoto(figure);} });
    });
    lbX.addEventListener('click',closePhoto);
    lbP.addEventListener('click',function(){showPhoto(cur-1);});
    lbN.addEventListener('click',function(){showPhoto(cur+1);});
    lb.addEventListener('click',function(e){if(e.target===lb)closePhoto();});
    lb.addEventListener('keydown',function(e){
      if(e.key!=='Tab')return; var f=[lbX,lbP,lbN],i=f.indexOf(document.activeElement);
      e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus();
    });
    document.addEventListener('keydown',function(e){
      if(!lb.classList.contains('open'))return;
      if(e.key==='Escape')closePhoto(); if(e.key==='ArrowLeft')showPhoto(cur-1); if(e.key==='ArrowRight')showPhoto(cur+1);
    });
    applyGalleryFilter('gallery');
  }

  /* scroll-spy: highlight the nav link for the section in view */
  var spyLinks = [].slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var spyMap = {};
  var spyTargets = [];
  spyLinks.forEach(function(a){
    var id = a.getAttribute('href').slice(1);
    var el = id === 'top' ? document.getElementById('top') : document.getElementById(id);
    if(el){ spyMap[el.id] = a; spyTargets.push(el); }
  });
  if(spyTargets.length && 'IntersectionObserver' in window){
    var current = null;
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting) current = en.target.id;
      });
      spyLinks.forEach(function(a){ a.removeAttribute('aria-current'); });
      if(current && spyMap[current]) spyMap[current].setAttribute('aria-current','page');
    }, {rootMargin:'-45% 0px -50% 0px', threshold:0});
    spyTargets.forEach(function(el){ spy.observe(el); });
  }

  /* dates: no past check-in, check-out follows check-in */
  var fin = document.getElementById('f-in'), fout = document.getElementById('f-out');
  var today = new Date().toISOString().slice(0,10);
  fin.min = today; fout.min = today;
  fin.addEventListener('change', function(){
    fout.min = fin.value || today;
    if(fout.value && fout.value < fin.value) fout.value = '';
  });

  /* build a WhatsApp message from the form */
  var pretty = function(v){
    if(!v) return '';
    var d = new Date(v + 'T00:00:00');
    if(isNaN(d)) return v;
    return d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  };
  document.getElementById('send').addEventListener('click', function(){
    var name = document.getElementById('f-name').value.trim();
    var ci = pretty(fin.value), co = pretty(fout.value);
    var g = document.getElementById('f-guests').value;
    var r = document.getElementById('f-rooms').value;
    var m = document.getElementById('f-msg').value.trim();
    var lines = ['Hello Salido Resort, I would like to check availability.'];
    if(name) lines.push('Name: ' + name);
    if(ci) lines.push('Check-in: ' + ci);
    if(co) lines.push('Check-out: ' + co);
    lines.push('Guests: ' + g);
    lines.push('Rooms: ' + r);
    if(m) lines.push('Note: ' + m);
    window.open('https://wa.me/94742698328?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });

  /* quick-book bar under the hero — compact mirror of the contact form */
  var qin = document.getElementById('qb-in'), qout = document.getElementById('qb-out');
  if(qin && qout){
    qin.min = today; qout.min = today;
    qin.addEventListener('change', function(){
      qout.min = qin.value || today;
      if(qout.value && qout.value < qin.value) qout.value = '';
    });
    document.getElementById('qb-send').addEventListener('click', function(){
      var ci = pretty(qin.value), co = pretty(qout.value);
      var g = document.getElementById('qb-guests').value;
      var lines = ['Hello Salido Resort, I would like to check availability.'];
      if(ci) lines.push('Check-in: ' + ci);
      if(co) lines.push('Check-out: ' + co);
      lines.push('Guests: ' + g);
      window.open('https://wa.me/94742698328?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }

  /* live Kandy weather — Open-Meteo (free, no API key). Only loads when online. */
  var wx = document.getElementById('wx');
  if(wx){
    var WCODE = {0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Fog',
      51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',
      66:'Freezing rain',67:'Freezing rain',71:'Snow',73:'Snow',75:'Snow',80:'Rain showers',
      81:'Rain showers',82:'Heavy showers',95:'Thunderstorm',96:'Thunderstorm',99:'Thunderstorm'};
    var ICON = {
      sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
      cloud:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 6 19h11.5Z"/></svg>',
      rain:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 15a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 6 15"/><path d="M8 18v2M12 18v3M16 18v2"/></svg>',
      storm:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 15a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 6 15"/><path d="m13 12-3 5h4l-3 5"/></svg>'
    };
    var pick = function(c){ if(c===0||c===1) return 'sun'; if(c>=95) return 'storm';
      if((c>=51&&c<=82)) return 'rain'; return 'cloud'; };
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=7.2844504&longitude=80.6651848' +
      '&current=temperature_2m,relative_humidity_2m,weather_code' +
      '&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FColombo';
    fetch(url).then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(d){
      var c = d.current, day = d.daily;
      var t = Math.round(c.temperature_2m),
          hi = Math.round(day.temperature_2m_max[0]),
          lo = Math.round(day.temperature_2m_min[0]);
      var updated = new Date(c.time || Date.now()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      wx.innerHTML =
        '<div class="wx__top"><span class="wx__live"><i></i> Live weather</span><span class="wx__updated">Updated ' + updated + '</span></div>' +
        '<div class="wx__main"><div class="wx__ico">' + ICON[pick(c.weather_code)] + '</div>' +
        '<div class="wx__body"><span class="wx__loc">Kandy right now</span>' +
        '<span class="wx__temp">' + t + '\u00B0C</span>' +
        '<span class="wx__cond">' + (WCODE[c.weather_code] || '\u2014') + '</span></div></div>' +
        '<div class="wx__stats"><span><b>' + hi + '\u00B0</b> High</span><span><b>' + lo + '\u00B0</b> Low</span><span><b>' + c.relative_humidity_2m + '%</b> Humidity</span></div>';
      wx.classList.add('is-loaded');
    }).catch(function(){
      wx.innerHTML = '<span class="wx__off">Live Kandy weather shows here once the site is online.</span>';
    });
  }
})();

/* ============ language switcher (EN / Sinhala / Tamil) ============ */
(function(){
  "use strict";
  var I18N = {"si":{"nav.home":"මුල් පිටුව","nav.about":"අප ගැන","nav.facilities":"පහසුකම්","nav.rooms":"කාමර","nav.gallery":"ගැලරිය","nav.kandy":"මහනුවර","nav.contact":"සම්බන්ධ වන්න","cta.check":"ලබා ගත හැකිද බලන්න","cta.book":"වෙන්කරවා ගන්න","cta.explore":"කාමර බලන්න","cta.seerooms":"කාමර බලන්න","cta.rates":"වත්මන් මිල ලබා ගන්න","cta.directions":"මාර්ගෝපදේශ ලබා ගන්න","cta.details":"විස්තර බලන්න","cta.send":"WhatsApp හරහා යවන්න","hero.place":"සොබාදහම වෙත ගිලෙන්න","hero.h1lead":"හදවතේම සුවපහසු නවාතැනක් — ","hero.h1city":"මහනුවර","hero.creed":"විවේකය <span class=\"sep\">·</span> සැහැල්ලුව <span class=\"sep\">·</span> අත්දැකීම","hero.sub":"තෙන්නෙකුඹුර, රිවර්වීව් පාරේ නිස්කලංක නවාතැනක් — දළදා මාළිගාව, මහනුවර වැව සහ හන්තාන කඳුවැටියට විනාඩි කිහිපයයි.","about.eyebrow":"සාදරයෙන් පිළිගනිමු","about.h2":"කුඩා නවාතැනක්,<br>නිසි ලෙස පවත්වාගෙන යයි","about.p1":"සලිඩෝ රිසෝර්ට් පිහිටා ඇත්තේ තෙන්නෙකුඹුර, රිවර්වීව් පාරේ — මහනුවරට කිට්ටුවෙන්, නමුත් හොඳට නිදාගන්න තරමට නිස්කලංකව. කාමර සරල, පිරිසිදු හා සුවපහසුයි; ඔබ කැමති පරිදි වායුසමීකරණ සහිතව හෝ රහිතව.","about.p2":"අපගේ බොහෝ අමුත්තන් එන්නේ මහනුවර බලන්නයි: දළදා මාළිගාව, වැව, හන්තාන කඳු. අපි ඒ ගමනේ නිස්කලංක කොටසයි — දවස අවසානයේ නැවත පැමිණීමට තැනක්.","about.statb":"ඔබේ සුවපහසුව<br>අපගේ ප්‍රමුඛතාවයයි","about.stati":"පළමු දිනයේ සිට","fac.eyebrow":"අපගේ පහසුකම්","fac.h2":"නවාතැනට අවශ්‍ය සියල්ල, අනවශ්‍ය කිසිවක් නැත","fac.lede":"අමතර ගාස්තු නැහැ, බලෙන් විකිණීම් නැහැ. කාමරයක් සැබවින්ම සුවපහසු කරන දේවල්, ඒ සියල්ලම ඇතුළත්.","fac.ac.t":"වායුසමීකරණ සහිත/රහිත කාමර","fac.ac.d":"ඔබට ගැළපෙන දේ තෝරන්න. රාත්‍රියේ කඳුකරයේ සිසිල් සුළඟ බොහෝ දේ කරයි.","fac.bath.t":"ඇමුණූ නාන කාමර","fac.bath.d":"සෑම කාමරයකම, පෞද්ගලික, උණුසුම් ජලය සමඟ.","fac.wifi.t":"නොමිලේ Wi-Fi","fac.wifi.d":"මුළු පරිශ්‍රය පුරාම, කූපනයක් හෝ කේතයක් අවශ්‍ය නැහැ.","fac.hot.t":"උණුසුම් ජලය","fac.hot.d":"ඕනෑම වේලාවක සූදානම් — උදෑසන පිටත්වීම් හා රාත්‍රී පැමිණීම් සඳහා.","fac.view.t":"සොබාවික දර්ශනය","fac.view.d":"එක් පැත්තකින් හරිත කඳු, අනෙක් පැත්තෙන් ගංගා පාර. මිනිසුන් මෙතැන වෙන්කරවා ගන්නේ ඒ නිසයි.","fac.bbq.t":"බාබකියු පහසුකම","fac.bbq.d":"කලින් දන්වන්න, අපි උද්‍යානයේ එය සකසා දෙන්නෙමු.","fac.park.t":"ආරක්ෂිත වාහන නැවැත්වීම","fac.park.d":"පාරෙන් ඉවතින්, පරිශ්‍රය තුළ, අමතර ගාස්තුවකින් තොරව.","gal.eyebrow":"ගැලරිය","gal.h2":"සලිඩෝ රිසෝර්ට් හි දසුනක්","gal.lede":"ගඟ අද්දර විවේක ගන්න, නිස්කලංක කාමර භුක්ති විඳින්න, අපගේ සුවපහසු නවාතැනින් මහනුවරේ සුන්දරත්වය අත්විඳින්න.","gal.c1":"රිසෝර්ට් දර්ශනය","gal.c2":"සුවපහසු කාමර","gal.c3":"මහනුවර දර්ශන","gal.c4":"විවේකී අවකාශ","gal.c5":"ආහාර අත්දැකීම","gal.c6":"මහනුවර ගවේෂණය","att.eyebrow":"අවට","att.h2":"මහනුවර, දොරකඩම","att.lede":"තෙන්නෙකුඹුරේ නිස්කලංකයේ රැඳී සිටින්න — නගරය ඔබ වෙතට එනු ඇත.","att.scroll":"තවත් බලන්න ස්ක්‍රෝල් කරන්න","att.distnote":"දුර ප්‍රමාණ සරල රේඛාවකින් — රිය ගමන ටිකක් දිගයි.","att.s0.label":"හන්තාන","att.s0.t":"හන්තාන කුරුළු උද්‍යානය","att.s0.km":"කි.මී. 3.7 දුරින්","att.s0.d":"නගරයට ඉහළින් කඳුවල පිහිටි කුරුළු කූඩු හා විනෝද මධ්‍යස්ථානයක් — දරුවන් සමඟ පහසු අර්ධ දිනයක්.","att.s1.label":"ශ්‍රී දළදා මාළිගාව","att.s1.t":"දළදා මාළිගාව","att.s1.km":"කි.මී. 2.8 දුරින්","att.s1.d":"ශ්‍රී ලංකාවේ වඩාත්ම ගෞරවනීය දේවාලය. බෙර වයන සවස් පූජාවට යන්න.","att.s2.label":"බෝගම්බර","att.s2.t":"මහනුවර වැව","att.s2.km":"කි.මී. 2.7 දුරින්","att.s2.d":"වතුර වටා සෙමින් ඇවිදින්න — එක් පසෙකින් මාළිගාව සහ පැරණි නගරය.","att.s3.label":"බහිරවකන්ද","att.s3.t":"බහිරවකන්ද විහාරය","att.s3.km":"කි.මී. 4.0 දුරින්","att.s3.d":"සුදු බුදු පිළිමය වෙත පඩි නැඟ මුළු නගරයම දැකගත හැකි හොඳම දර්ශනය ලබා ගන්න.","att.s4.label":"නගර මධ්‍යය","att.s4.t":"මහනුවර නගරය","att.s4.km":"කි.මී. 2.8 දුරින්","att.s4.d":"යටත්විජිත ගොඩනැඟිලි, වෙළඳපොළ, සහ ආපසු යාමට පෙර කෑමට තැනක්.","att.s5.label":"ඇවිදීම්","att.s5.t":"වැව අද්දර ඇවිදීම","att.s5.km":"කි.මී. 2.7 දුරින්","att.s5.d":"වටේටම හෙවණ. උදෑසන හොඳම — රස්නය හා තදබදය එන්නට පෙර.","spot.note":"වේලාවන් හා මිල ගණන් මඟ පෙන්වීමක් පමණි, වෙනස් විය හැක — යාමට පෙර පරීක්ෂා කරන්න.","get.eyebrow":"ඔබේ ගමන සැලසුම් කරන්න","get.h2":"මහනුවරට එන ආකාරය","get.lede":"අපි කොළඹ සිට පැය 3ක් පමණ දුරින්. බොහෝ අමුත්තන් එන්නේ දුම්රියෙන් — සුන්දරම මාර්ගය — හෝ බසයෙන්. මෙන්න ආකාරය, සහ දැන් කාලගුණය.","get.wxload":"මහනුවර කාලගුණය පූරණය වෙමින්…","get.train.t":"කොළඹ සිට දුම්රියෙන්","get.train.p":"කොළඹ කොටුව → මහනුවර මාර්ගය ආසියාවේ සුන්දරම දුම්රිය ගමන් අතරින් එකකි — තේ වතු හරහා කි.මී. 116ක්, පැය 2½–3ක් පමණ. හොඳම දර්ශන සඳහා දකුණු පස වාඩි වන්න.","get.train.s1":"සුන්දර නිල් දුම්රිය","get.train.s2":"වේගවත්ම, ~පැ2මි25","get.train.s3":"සුන්දර නිල් දුම්රිය","get.train.s4":"වේගවත් දහවල","get.train.last":"අවසන් දුම්රිය","get.train.s5":"සවස","get.train.note":"ගාස්තු ~රු. 350 සිට (2 වන පන්තිය). වෙන්කළ අසුන් ඉක්මනින් අවසන් වේ — <a href=\"https://www.railway.gov.lk\" target=\"_blank\" rel=\"noopener\">railway.gov.lk</a> හරහා කලින් වෙන්කරවා ගන්න. වේලාවන් වෙනස් විය හැක, ගමනට පෙර පරීක්ෂා කරන්න.","get.bus.t":"කොළඹ සිට බසයෙන්","get.bus.p":"අන්තර් නගර බස් රථ කොළඹ (පිටකොටුව / බස්තියන් මාවත නැවතුම) සිට මහනුවරට නිතර පිටත් වේ — විනාඩි 15–30කට වරක් පමණ, වෙන්කිරීමක් අවශ්‍ය නැහැ. තදබදය අනුව ගමනට පැය 3–4ක් ගතවේ.","get.bus.b1":"වායුසමීකරණ අන්තර් නගර","get.bus.s1":"සුවපහසුම, ~රු. 500–700","get.bus.b2":"සාමාන්‍ය බස්","get.bus.s2":"ලාභම, ~රු. 250–350","get.bus.note":"බස් රථ උදෑසන සිට රාත්‍රිය දක්වා ධාවනය වේ. අධිවේගී මාර්ගයෙන් ටැක්සියක් හෝ පෞද්ගලික රථයක් පැය 3ක් පමණ — පිකප් එකක් සකසා ගැනීමට අපි සතුටින් උදව් කරන්නෙමු, <a href=\"https://wa.me/94742698328\" target=\"_blank\" rel=\"noopener\">WhatsApp හරහා අපට පණිවිඩයක් එවන්න</a>.","con.eyebrow":"සම්බන්ධ වීම් හා වෙන්කිරීම්","con.h2":"අදම ඔබේ නවාතැන වෙන්කරවා ගන්න","con.lede":"ඔබේ දිනයන් දන්වන්න, අපි වහාම ලබා ගත හැකි බව තහවුරු කරන්නෙමු.","con.address":"ලිපිනය","con.call":"අමතන්න","con.whatsapp":"WhatsApp","con.facebook":"Facebook","con.fbval":"Facebook හි සලිඩෝ රිසෝර්ට්","con.form.h3":"ඔබේ දිනයන් දන්වන්න","con.form.p":"ලබා ගත හැකි බව හා අද මිල සමඟ අපි නැවත සම්බන්ධ වන්නෙමු.","con.form.name":"ඔබේ නම","con.form.name.ph":"උදා: නිමල් පෙරේරා","con.form.in":"පැමිණෙන දිනය","con.form.out":"පිටවෙන දිනය","con.form.guests":"අමුත්තන්","con.form.rooms":"කාමර","con.form.msg":"වෙන යමක්ද?","con.form.msg.ph":"වායුසමීකරණ හෝ නැති, පැමිණෙන වේලාව, බාබකියු…","con.form.note":"ඔබේ විස්තර පුරවා WhatsApp විවෘත කරයි. ඔබ යැවීම ඔබන තෙක් කිසිවක් නොයැවේ.","foot.address":"10/10, රිවර්වීව් පාර,<br>තෙන්නෙකුඹුර, මහනුවර,<br>ශ්‍රී ලංකාව.","foot.tag":"ඔබේ සුවපහසුව අපගේ ප්‍රමුඛතාවයයි.","foot.explore":"ගවේෂණය","foot.reservations":"වෙන්කිරීම්","foot.fbpage":"Facebook පිටුව","foot.rights":"සියලු හිමිකම් ඇවිරිණි.","nav.notices":"දැන්වීම්","not.eyebrow":"දැන්වීම් පුවරුව","not.h2":"සලිඩෝ හි අලුත් දේ","not.lede":"විශේෂ දීමනා, උත්සව සහ පැමිණීමට පෙර දැනගත යුතු දේ.","not.n1.date":"2026 අගෝස්තු","not.n1.flag":"පින් කළා","not.n1.t":"ඇසළ පෙරහැර කාලය — කලින් වෙන්කරවා ගන්න","not.n1.d":"පෙරහැර කාලයේ කාමර ඉක්මනින් අවසන් වේ. දැන් වෙන්කිරීම් භාර ගනිමු, නගරයට යාමට හා ආපසු එීමට රියදුරෙකුද සකසා දිය හැක.","not.n1.cta":"WhatsApp හරහා අපට පණිවිඩයක් එවන්න","not.n2.date":"සෑම සෙනසුරාදාවකම","not.n2.flag":"අලුත්","not.n2.t":"සෑම සෙනසුරාදා සවසකම ගඟ අද්දර බාබකියු","not.n2.d":"රාත්‍රී 7 සිට ගඟ අද්දර — ග්‍රිල් කළ මාළු, කුකුළු මස් හා එළවළු පිඟන්. කරුණාකර දිනකට කලින් දන්වන්න.","not.n2.cta":"WhatsApp හරහා අපට පණිවිඩයක් එවන්න"},"ta":{"nav.home":"முகப்பு","nav.about":"எங்களைப் பற்றி","nav.facilities":"வசதிகள்","nav.rooms":"அறைகள்","nav.gallery":"படத்தொகுப்பு","nav.kandy":"கண்டி","nav.contact":"தொடர்பு","cta.check":"அறை உள்ளதா எனப் பாருங்கள்","cta.book":"முன்பதிவு செய்யுங்கள்","cta.explore":"அறைகளைப் பாருங்கள்","cta.seerooms":"அறைகளைப் பாருங்கள்","cta.rates":"தற்போதைய கட்டணங்களைப் பெறுங்கள்","cta.directions":"வழிகாட்டுதலைப் பெறுங்கள்","cta.details":"விவரங்களைப் பார்க்க","cta.send":"WhatsApp இல் அனுப்புங்கள்","hero.place":"இயற்கையில் இளைப்பாறுங்கள்","hero.h1lead":"இதயப் பகுதியில் ஒரு வசதியான தங்குமிடம் — ","hero.h1city":"கண்டி","hero.creed":"இளைப்பாறுதல் <span class=\"sep\">·</span> அமைதி <span class=\"sep\">·</span> அனுபவம்","hero.sub":"தென்னெகும்புர, ரிவர்வியூ வீதியில் ஒரு அமைதியான தங்குமிடம் — தலதா மாளிகை, கண்டி ஏரி மற்றும் ஹந்தான மலைகளுக்கு சில நிமிடங்களே.","about.eyebrow":"வரவேற்பு","about.h2":"சிறிய ரிசார்ட்,<br>சரியாக நடத்தப்படுகிறது","about.p1":"சலிடோ ரிசார்ட் தென்னெகும்புர, ரிவர்வியூ வீதியில் அமைந்துள்ளது — கண்டிக்கு அருகில், ஆனால் நிம்மதியாக உறங்கும் அளவுக்கு அமைதியாக. அறைகள் எளிமையானவை, சுத்தமானவை, வசதியானவை; உங்கள் விருப்பப்படி ஏசி உடன் அல்லது இல்லாமல்.","about.p2":"எங்கள் விருந்தினர்கள் பலர் கண்டியைப் பார்க்க வருகிறார்கள்: தலதா மாளிகை, ஏரி, ஹந்தான மலைகள். அந்தப் பயணத்தின் அமைதியான பகுதி நாங்கள் — நாள் முடிவில் திரும்பி வர ஒரு இடம்.","about.statb":"உங்கள் வசதியே<br>எங்கள் முன்னுரிமை","about.stati":"முதல் நாளிலிருந்து","fac.eyebrow":"எங்கள் வசதிகள்","fac.h2":"தங்குதலுக்குத் தேவையான அனைத்தும், தேவையற்றது எதுவுமில்லை","fac.lede":"கூடுதல் கட்டணங்கள் இல்லை, தேவையற்ற விற்பனை இல்லை. ஒரு அறையை உண்மையிலேயே வசதியாக்கும் விஷயங்கள் — அனைத்தும் உள்ளடங்கியது.","fac.ac.t":"ஏசி & ஏசி இல்லாத அறைகள்","fac.ac.d":"உங்களுக்கு ஏற்றதைத் தேர்ந்தெடுங்கள். இரவில் மலைக் காற்றே பெரும்பாலான வேலையைச் செய்யும்.","fac.bath.t":"இணைந்த குளியலறைகள்","fac.bath.d":"ஒவ்வொரு அறையிலும் தனிப்பட்ட குளியலறை, சூடான நீருடன்.","fac.wifi.t":"இலவச Wi-Fi","fac.wifi.d":"முழு வளாகத்திலும், எந்த வவுச்சரோ குறியீடோ தேவையில்லை.","fac.hot.t":"சூடான நீர்","fac.hot.d":"எந்த நேரத்திலும் தயார் — அதிகாலைப் புறப்பாடுகள் மற்றும் இரவு வருகைகளுக்கு.","fac.view.t":"இயற்கைக் காட்சி","fac.view.d":"ஒரு பக்கம் பசுமையான மலைகள், மறுபக்கம் ஆற்றங்கரை சாலை. மக்கள் இங்கு முன்பதிவு செய்வதற்கு இதுவே காரணம்.","fac.bbq.t":"பார்பிக்யூ வசதி","fac.bbq.d":"முன்கூட்டியே எங்களிடம் சொல்லுங்கள், தோட்டத்தில் ஏற்பாடு செய்கிறோம்.","fac.park.t":"பாதுகாப்பான வாகன நிறுத்தம்","fac.park.d":"சாலையை விட்டு, வளாகத்திற்குள், கூடுதல் கட்டணமில்லாமல்.","gal.eyebrow":"படத்தொகுப்பு","gal.h2":"சலிடோ ரிசார்ட்டின் ஒரு பார்வை","gal.lede":"ஆற்றங்கரையில் இளைப்பாறுங்கள், அமைதியான அறைகளை அனுபவியுங்கள், எங்கள் வசதியான தங்குமிடத்திலிருந்து கண்டியின் அழகை அனுபவியுங்கள்.","gal.c1":"ரிசார்ட் காட்சி","gal.c2":"வசதியான அறைகள்","gal.c3":"கண்டி காட்சிகள்","gal.c4":"நிதானமான இடங்கள்","gal.c5":"உணவு அனுபவம்","gal.c6":"கண்டியை ஆராயுங்கள்","att.eyebrow":"அருகில்","att.h2":"கண்டி, வாசலருகில்","att.lede":"தென்னெகும்புராவின் அமைதியில் தங்குங்கள் — நகரம் உங்களிடம் வரட்டும்.","att.scroll":"மேலும் பார்க்க ஸ்க்ரோல் செய்யுங்கள்","att.distnote":"தூரங்கள் நேர்கோட்டில் — வாகனப் பயணம் சற்று அதிகம்.","att.s0.label":"ஹந்தான","att.s0.t":"ஹந்தான பறவை பூங்கா","att.s0.km":"3.7 கி.மீ தொலைவில்","att.s0.d":"நகருக்கு மேலே மலைகளில் பறவைக் கூடங்களும் பொழுதுபோக்கு மையமும் — குழந்தைகளுடன் எளிதான அரை நாள்.","att.s1.label":"ஸ்ரீ தலதா மாளிகை","att.s1.t":"தலதா மாளிகை","att.s1.km":"2.8 கி.மீ தொலைவில்","att.s1.d":"இலங்கையின் மிகவும் புனிதமான ஆலயம். மேளம் தொடங்கும் மாலைப் பூஜைக்குச் செல்லுங்கள்.","att.s2.label":"போகம்பர","att.s2.t":"கண்டி ஏரி","att.s2.km":"2.7 கி.மீ தொலைவில்","att.s2.d":"நீரைச் சுற்றி மெதுவான நடை — ஒரு பக்கம் ஆலயமும் பழைய நகரமும்.","att.s3.label":"பஹிரவகந்த","att.s3.t":"பஹிரவகந்த விகாரை","att.s3.km":"4.0 கி.மீ தொலைவில்","att.s3.d":"வெள்ளை புத்தர் சிலைக்குப் படிகளில் ஏறி முழு நகரத்தின் சிறந்த காட்சியைப் பாருங்கள்.","att.s4.label":"நகர மையம்","att.s4.t":"கண்டி நகரம்","att.s4.km":"2.8 கி.மீ தொலைவில்","att.s4.d":"காலனித்துவ கட்டிடங்கள், சந்தை, திரும்பிச் செல்வதற்கு முன் சாப்பிட ஓரிடம்.","att.s5.label":"நடைப்பாதைகள்","att.s5.t":"ஏரிக்கரை நடை","att.s5.km":"2.7 கி.மீ தொலைவில்","att.s5.d":"சுற்றிலும் நிழல். அதிகாலையே சிறந்தது — வெயிலும் நெரிசலும் வருவதற்கு முன்.","spot.note":"நேரங்களும் விலைகளும் வழிகாட்டுதலே, மாறலாம் — செல்வதற்கு முன் சரிபார்க்கவும்.","get.eyebrow":"உங்கள் பயணத்தைத் திட்டமிடுங்கள்","get.h2":"கண்டிக்கு வருவது எப்படி","get.lede":"நாங்கள் கொழும்பிலிருந்து சுமார் 3 மணி நேரம். பெரும்பாலான விருந்தினர்கள் ரயிலில் — அழகிய பாதை — அல்லது பேருந்தில் வருகிறார்கள். இதோ வழி, மற்றும் இப்போதைய வானிலை.","get.wxload":"கண்டி வானிலை ஏற்றப்படுகிறது…","get.train.t":"கொழும்பிலிருந்து ரயிலில்","get.train.p":"கொழும்பு கோட்டை → கண்டி பாதை ஆசியாவின் மிக அழகிய ரயில் பயணங்களில் ஒன்று — தேயிலைத் தோட்டங்கள் வழியே 116 கி.மீ, சுமார் 2½–3 மணிநேரம். சிறந்த காட்சிக்கு வலப்பக்கம் அமருங்கள்.","get.train.s1":"அழகிய நீல ரயில்","get.train.s2":"வேகமானது, ~2ம25நி","get.train.s3":"அழகிய நீல ரயில்","get.train.s4":"வேகமான மதியம்","get.train.last":"கடைசி ரயில்","get.train.s5":"மாலை","get.train.note":"கட்டணம் ~LKR 350 முதல் (2ம் வகுப்பு). முன்பதிவு இருக்கைகள் விரைவில் விற்றுவிடும் — <a href=\"https://www.railway.gov.lk\" target=\"_blank\" rel=\"noopener\">railway.gov.lk</a> இல் முன்பதிவு செய்யுங்கள். நேரங்கள் மாறலாம், பயணத்திற்கு முன் சரிபார்க்கவும்.","get.bus.t":"கொழும்பிலிருந்து பேருந்தில்","get.bus.p":"இடைநகர பேருந்துகள் கொழும்பு (பேட்டா / பஸ்தியன் மாவத்தை நிறுத்தம்) இலிருந்து கண்டிக்கு அடிக்கடி புறப்படும் — சுமார் 15–30 நிமிடங்களுக்கு ஒருமுறை, முன்பதிவு தேவையில்லை. நெரிசலைப் பொறுத்து 3–4 மணிநேரம் ஆகும்.","get.bus.b1":"ஏசி இடைநகர்","get.bus.s1":"மிக வசதியானது, ~LKR 500–700","get.bus.b2":"சாதாரண பேருந்து","get.bus.s2":"மலிவானது, ~LKR 250–350","get.bus.note":"பேருந்துகள் அதிகாலை முதல் இரவு வரை இயங்கும். அதிவேக நெடுஞ்சாலை வழியாக டாக்ஸி அல்லது தனியார் கார் ~3 மணிநேரம் — பிக்அப் ஏற்பாடு செய்ய நாங்கள் உதவுகிறோம், <a href=\"https://wa.me/94742698328\" target=\"_blank\" rel=\"noopener\">WhatsApp இல் எங்களுக்கு செய்தி அனுப்புங்கள்</a>.","con.eyebrow":"தொடர்பு & முன்பதிவு","con.h2":"இன்றே உங்கள் தங்குமிடத்தை முன்பதிவு செய்யுங்கள்","con.lede":"உங்கள் தேதிகளைச் சொல்லுங்கள், உடனே இருப்பை உறுதிப்படுத்துகிறோம்.","con.address":"முகவரி","con.call":"அழையுங்கள்","con.whatsapp":"WhatsApp","con.facebook":"Facebook","con.fbval":"Facebook இல் சலிடோ ரிசார்ட்","con.form.h3":"உங்கள் தேதிகளைச் சொல்லுங்கள்","con.form.p":"இருப்பு மற்றும் இன்றைய கட்டணத்துடன் திரும்பத் தொடர்பு கொள்கிறோம்.","con.form.name":"உங்கள் பெயர்","con.form.name.ph":"எ.கா. நிமல் பெரேரா","con.form.in":"வரும் தேதி","con.form.out":"செல்லும் தேதி","con.form.guests":"விருந்தினர்கள்","con.form.rooms":"அறைகள்","con.form.msg":"வேறு ஏதேனும்?","con.form.msg.ph":"ஏசி அல்லது இல்லை, வரும் நேரம், பார்பிக்யூ…","con.form.note":"உங்கள் விவரங்களுடன் WhatsApp திறக்கும். நீங்கள் அனுப்பு அழுத்தும் வரை எதுவும் அனுப்பப்படாது.","foot.address":"10/10, ரிவர்வியூ வீதி,<br>தென்னெகும்புர, கண்டி,<br>இலங்கை.","foot.tag":"உங்கள் வசதியே எங்கள் முன்னுரிமை.","foot.explore":"ஆராயுங்கள்","foot.reservations":"முன்பதிவு","foot.fbpage":"Facebook பக்கம்","foot.rights":"அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.","nav.notices":"அறிவிப்புகள்","not.eyebrow":"அறிவிப்புப் பலகை","not.h2":"சலிடோவில் என்ன நடக்கிறது","not.lede":"சிறப்புச் சலுகைகள், நிகழ்வுகள், வருகைக்கு முன் தெரிந்துகொள்ள வேண்டியவை.","not.n1.date":"ஆகஸ்ட் 2026","not.n1.flag":"முக்கியம்","not.n1.t":"எசல பெரஹரா பருவம் — முன்கூட்டியே முன்பதிவு செய்யுங்கள்","not.n1.d":"பெரஹரா காலத்தில் அறைகள் விரைவில் நிரம்பிவிடும். இப்போது முன்பதிவுகளை ஏற்கிறோம், நகருக்குச் சென்று திரும்ப ஓட்டுநரையும் ஏற்பாடு செய்யலாம்.","not.n1.cta":"WhatsApp இல் எங்களுக்கு செய்தி அனுப்புங்கள்","not.n2.date":"ஒவ்வொரு சனிக்கிழமையும்","not.n2.flag":"புதியது","not.n2.t":"ஒவ்வொரு சனிக்கிழமை மாலையும் ஆற்றங்கரை பார்பிக்யூ","not.n2.d":"இரவு 7 மணி முதல் நீர்க்கரையில் — வறுத்த மீன், கோழி மற்றும் சைவ உணவுகள். தயவுசெய்து ஒரு நாள் முன்பே தெரிவியுங்கள்.","not.n2.cta":"WhatsApp இல் எங்களுக்கு செய்தி அனுப்புங்கள்"}};
  var htmlEl = document.documentElement;
  var nodes  = [].slice.call(document.querySelectorAll('[data-i18n],[data-i18n-html],[data-i18n-ph]'));
  var orig   = new Map();
  nodes.forEach(function(el){
    orig.set(el, {
      t: el.hasAttribute('data-i18n')      ? el.textContent            : null,
      h: el.hasAttribute('data-i18n-html') ? el.innerHTML              : null,
      p: el.hasAttribute('data-i18n-ph')   ? (el.getAttribute('placeholder')||'') : null
    });
  });
  var btns = [].slice.call(document.querySelectorAll('#lang button'));

  function apply(lang){
    var d = I18N[lang];               /* undefined for 'en' -> restore originals */
    nodes.forEach(function(el){
      var o = orig.get(el);
      if(el.hasAttribute('data-i18n')){
        var k = el.getAttribute('data-i18n');
        el.textContent = (d && d[k]!=null) ? d[k] : o.t;
      }
      if(el.hasAttribute('data-i18n-html')){
        var kh = el.getAttribute('data-i18n-html');
        el.innerHTML = (d && d[kh]!=null) ? d[kh] : o.h;
      }
      if(el.hasAttribute('data-i18n-ph')){
        var kp = el.getAttribute('data-i18n-ph');
        el.setAttribute('placeholder', (d && d[kp]!=null) ? d[kp] : o.p);
      }
    });
    htmlEl.setAttribute('lang', lang);
    btns.forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-lang')===lang ? 'true':'false'); });
    try{ localStorage.setItem('salido_lang', lang); }catch(e){}
  }

  btns.forEach(function(b){
    b.addEventListener('click', function(){ apply(b.getAttribute('data-lang')); });
  });

  var saved=null;
  try{ saved = localStorage.getItem('salido_lang'); }catch(e){}
  if(saved==='si' || saved==='ta'){ apply(saved); }


  /* branded interactive map: dark resort style with satellite toggle */
  var mapNode = document.getElementById('resortMap');
  if(mapNode && window.L){
    var resortCoords = [7.2844504, 80.6651848];
    var resortMap = L.map(mapNode, {scrollWheelZoom:false, zoomControl:true, attributionControl:true}).setView(resortCoords, 15);
    var darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom:20, subdomains:'abcd', attribution:'&copy; OpenStreetMap &copy; CARTO'
    });
    var satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom:19, attribution:'Tiles &copy; Esri'
    });
    darkTiles.addTo(resortMap);
    var markerIcon = L.divIcon({
      className:'salido-map-icon',
      html:'<div class="v43-option-a" aria-hidden="true"><span class="v43-option-a__ping"></span><span class="v43-option-a__shadow"></span><span class="v43-option-a__pin"><span class="v43-option-a__core">S</span></span><span class="v43-option-a__card"><strong>Salido Resort</strong><small>Riverside Stay · Kandy</small></span></div>',
      iconSize:[133,46], iconAnchor:[21,43], popupAnchor:[44,-35]
    });
    var resortMarker;
    var markerShown=false;
    function revealResortMarker(){
      if(markerShown) return;
      markerShown=true;
      resortMap.flyTo(resortCoords,15,{duration:1.25,easeLinearity:.22});
      window.setTimeout(function(){
        resortMarker=L.marker(resortCoords,{icon:markerIcon,title:'Salido Resort',keyboard:true})
          .addTo(resortMap)
          .bindPopup('<strong>Salido Resort</strong><br>Riverview Road, Tennekumbura, Kandy');
      },650);
    }
    if('IntersectionObserver' in window){
      var mapObserver=new IntersectionObserver(function(entries){
        if(entries.some(function(entry){return entry.isIntersecting;})){
          revealResortMarker(); mapObserver.disconnect();
        }
      },{threshold:.24});
      mapObserver.observe(mapNode);
    }else{ revealResortMarker(); }
    var styleButton=document.getElementById('mapStyleToggle');
    var satellite=false;
    if(styleButton){ styleButton.addEventListener('click',function(){
      satellite=!satellite;
      if(satellite){ resortMap.removeLayer(darkTiles); satelliteTiles.addTo(resortMap); styleButton.textContent='Dark map'; }
      else { resortMap.removeLayer(satelliteTiles); darkTiles.addTo(resortMap); styleButton.textContent='Satellite'; }
    }); }
    setTimeout(function(){resortMap.invalidateSize();},350);
  }

  /* Official Google Places review loader. Google returns up to five reviews. */
  (function(){
    var section=document.getElementById('google-reviews');
    if(!section) return;
    var grid=document.getElementById('googleReviewsGrid');
    var summary=document.getElementById('googleReviewsSummary');
    var note=document.getElementById('googleReviewsNote');
    var googleUrl=section.getAttribute('data-google-url');
    var placeId=section.getAttribute('data-google-place-id');
    var key=(window.SALIDO_GOOGLE_MAPS_API_KEY||'').trim();

    function escapeHtml(value){return String(value||'').replace(/[&<>'"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch];});}
    function fallback(){
      summary.innerHTML='<strong>Google Reviews</strong><span>Latest verified feedback</span>';
      grid.innerHTML='<article class="google-review google-review--fallback"><p>Open Google to read the latest verified guest rating and feedback.</p><a class="review-card-link" href="'+escapeHtml(googleUrl)+'" target="_blank" rel="noopener">View Google reviews <span>↗</span></a></article>';
      note.textContent='Verified reviews on Google';
    }
    function stars(rating){var n=Math.max(0,Math.min(5,Math.round(Number(rating)||0)));return '★★★★★'.slice(0,n)+'☆☆☆☆☆'.slice(0,5-n);}
    function render(place){
      var reviews=(place.reviews||[]).slice(0,1);
      var rating=place.rating?Number(place.rating).toFixed(1):'—';
      var total=place.user_ratings_total||0;
      summary.innerHTML='<strong>★ '+escapeHtml(rating)+'</strong><span>'+escapeHtml(total)+' Google reviews</span>';
      if(!reviews.length){fallback();return;}
      grid.innerHTML=reviews.map(function(review){
        var photo=review.profile_photo_url?'<img class="google-review__avatar" src="'+escapeHtml(review.profile_photo_url)+'" alt="" loading="lazy" referrerpolicy="no-referrer">':'<span class="google-review__avatar"></span>';
        return '<article class="google-review">'+
          '<div class="google-review__top">'+photo+'<div class="google-review__who"><strong>'+escapeHtml(review.author_name)+'</strong><span>'+escapeHtml(review.relative_time_description||'Google review')+'</span></div></div>'+
          '<div class="google-review__stars" aria-label="'+escapeHtml(review.rating)+' out of 5 stars">'+stars(review.rating)+'</div>'+
          '<p>'+escapeHtml(review.text||'Rating shared on Google.')+'</p><span class="google-review__source">Google Review</span></article>';
      }).join('');
      note.textContent='Latest review excerpt provided by Google.';
    }
    function requestReviews(){
      var service=new google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails({placeId:placeId,fields:['name','rating','user_ratings_total','reviews','url']},function(place,status){
        if(status===google.maps.places.PlacesServiceStatus.OK&&place){render(place);}else{fallback();}
      });
    }
    if(!key){fallback();return;}
    if(window.google&&google.maps&&google.maps.places){requestReviews();return;}
    window.salidoGoogleReviewsInit=requestReviews;
    var script=document.createElement('script');
    script.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(key)+'&libraries=places&callback=salidoGoogleReviewsInit';
    script.async=true;script.defer=true;script.onerror=function(){fallback();};
    document.head.appendChild(script);
  })();

})();
