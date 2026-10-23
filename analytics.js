/* ===== 방문 분석 (GA4 + Microsoft Clarity) =====
 * 모든 페이지 <head> 에서 /analytics.js 로 로드. ID 가 비어 있으면 해당 도구는 로드하지 않는다.
 * 섹션 관심도: 섹션 자신의 절반 이상이 보이거나 화면 절반 이상을 차지하면 "보는 중" (동시에 여럿 가능).
 * 탭이 보이고 팝업이 닫혀 있는 동안의 시간만 섹션별로 누적.
 * 섹션별 누적 1초가 되면 section_reach, 누적분은 탭이 가려질 때(이탈·전환 포함) section_time 으로 전송.
 * section 값 = "페이지/섹션" (예: main/about, winter/offer).
 */
(function(){
  var GA_ID = 'G-S7FJXKTDS3';
  var CLARITY_ID = '';  // 예: 'abcd1234ef'

  var BRANCH_BY_LINK = {
    'naver.me/xCtZ89pr': '강동',
    'naver.me/5ISHvGVc': '광장',
    'naver.me/xCjxDHiY': '서현'
  };
  var BRANCH_BY_TEL = {
    '01034206824': '광장',
    '01034208249': '광장',
    '01065266824': '강동',
    '01033885429': '서현'
  };
  var REACH_MS = 1000;

  if(CLARITY_ID){
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window,document,'clarity','script',CLARITY_ID);
  }

  if(!GA_ID) return;

  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(tag);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);

  function track(name, params){
    window.gtag('event', name, params || {});
  }

  var PAGE = (function(){
    var p = location.pathname.replace(/index\.html$/, '');
    if(p === '/' || p === '') return 'main';
    return p.replace(/^\/|\/$/g, '').replace(/\.html$/, '') || 'main';
  })();

  function sectionName(s, i){
    if(s.dataset.track) return s.dataset.track;
    if(s.id) return s.id;
    for(var k = 0; k < s.classList.length; k++){
      if(s.classList[k] !== 'sec') return s.classList[k];
    }
    return 'section' + (i + 1);
  }

  function sectionOf(el){
    var s = el.closest('section');
    if(s && s.dataset.trackName) return s.dataset.trackName;
    if(el.closest('nav, .nav')) return PAGE + '/nav';
    if(el.closest('#mobTabBar')) return PAGE + '/tabbar';
    if(el.closest('#bar, #stickyCta')) return PAGE + '/sticky_bar';
    if(el.closest('.toc-chips')) return PAGE + '/toc';
    if(el.closest('footer')) return PAGE + '/footer';
    return PAGE + '/other';
  }

  function labelOf(el){
    return (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  }

  /* 섹션 도달 + 체류시간 */
  function popupOpen(){
    var pop = document.getElementById('winterPop');
    return !!(pop && !pop.hidden);
  }

  function initSections(){
    var sections = Array.prototype.slice.call(document.querySelectorAll('section'));
    if(!sections.length) return;
    var used = {};
    sections.forEach(function(s, i){
      var name = PAGE + '/' + sectionName(s, i);
      used[name] = (used[name] || 0) + 1;
      if(used[name] > 1) name += '_' + used[name];
      s.dataset.trackName = name;
    });

    var startedAt = {};
    var pending = {};
    var total = {};
    var reached = {};
    var reachTimer = {};

    function stop(name){
      clearTimeout(reachTimer[name]);
      if(startedAt[name]){
        var ms = Date.now() - startedAt[name];
        pending[name] = (pending[name] || 0) + ms;
        total[name] = (total[name] || 0) + ms;
      }
      delete startedAt[name];
    }

    function reach(name){
      if(!reached[name]){
        reached[name] = true;
        track('section_reach', { section: name });
      }
    }

    function start(name){
      startedAt[name] = Date.now();
      if(reached[name]) return;
      // 메뉴 이동 등으로 스쳐 지나간 섹션은 도달로 치지 않는다 (보이는 동안 누적 1초)
      var left = REACH_MS - (total[name] || 0);
      if(left <= 0) reach(name);
      else reachTimer[name] = setTimeout(function(){ if(startedAt[name]) reach(name); }, left);
    }

    function visibleNow(){
      var out = {};
      if(document.visibilityState !== 'visible' || popupOpen()) return out;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      sections.forEach(function(s){
        var r = s.getBoundingClientRect();
        var px = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        if(px > 0 && r.height > 0 && (px >= r.height / 2 || px >= vh / 2)) out[s.dataset.trackName] = true;
      });
      return out;
    }

    function update(){
      var now = visibleNow();
      Object.keys(startedAt).forEach(function(name){ if(!now[name]) stop(name); });
      Object.keys(now).forEach(function(name){ if(!startedAt[name]) start(name); });
    }

    function flush(){
      Object.keys(startedAt).forEach(stop);
      Object.keys(pending).forEach(function(name){
        var sec = Math.round(pending[name] / 1000);
        if(sec >= 1) track('section_time', { section: name, seconds: sec });
      });
      pending = {};
    }

    var ticking = false;
    function onScroll(){
      if(ticking) return;
      ticking = true;
      requestAnimationFrame(function(){ ticking = false; update(); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    var pop = document.getElementById('winterPop');
    if(pop && 'MutationObserver' in window){
      new MutationObserver(update).observe(pop, { attributes: true, attributeFilter: ['hidden'] });
    }

    document.addEventListener('visibilitychange', function(){
      if(document.visibilityState === 'hidden') flush();
      else update();
    });
    window.addEventListener('pagehide', flush);
    window.addEventListener('pageshow', function(e){ if(e.persisted) update(); });
    update();
  }

  /* 윈터스쿨 진입 팝업 (메인) */
  function initPopup(){
    var pop = document.getElementById('winterPop');
    if(!pop || pop.hidden) return;
    track('popup_view', { popup: 'winter' });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && !pop.hidden) track('popup_close', { popup: 'winter', method: 'esc' });
    }, true);
  }

  /* 클릭 */
  function branchOf(url){
    for(var k in BRANCH_BY_LINK){
      if(url.indexOf(k) !== -1) return BRANCH_BY_LINK[k];
    }
    return '';
  }

  document.addEventListener('click', function(e){
    var t = e.target;
    if(!(t instanceof Element)) return;

    var pop = document.getElementById('winterPop');
    if(pop && !pop.hidden && pop.contains(t)){
      if(t.closest('.winter-pop-link')) track('popup_click', { popup: 'winter' });
      else if(t.closest('#winterPopNever')) track('popup_never', { popup: 'winter' });
      else if(t.closest('#winterPopClose')) track('popup_close', { popup: 'winter', method: 'button' });
      else if(t === pop) track('popup_close', { popup: 'winter', method: 'overlay' });
      return;
    }

    var a = t.closest('a[href]');
    if(a){
      var href = a.getAttribute('href');
      if(href.indexOf('naver.me/') !== -1){
        track('naver_click', { branch: branchOf(href), label: labelOf(a), section: sectionOf(a) });
      } else if(href.indexOf('tel:') === 0){
        track('call_click', { branch: BRANCH_BY_TEL[href.replace(/\D/g, '')] || '', section: sectionOf(a) });
      } else if(/^(https:\/\/ubase\.kr)?\/winter\/?$/.test(href)){
        track('winter_link_click', { label: labelOf(a), section: sectionOf(a) });
      } else if(href.charAt(0) === '#' && href.length > 1){
        track('cta_click', { label: labelOf(a), target: href, section: sectionOf(a) });
      }
      return;
    }

    var map = t.closest('.location-map');
    if(map){
      var m = (map.getAttribute('onclick') || '').match(/naver\.me\/[A-Za-z0-9]+/);
      track('map_click', { branch: m ? branchOf(m[0]) : '', section: sectionOf(map) });
      return;
    }
    var fab = t.closest('#chatbotFab');
    if(fab && !fab.classList.contains('active')){
      track('chatbot_open', { section: 'fab' });
      return;
    }
    if(t.closest('#ctaChatbotOpen')){
      track('chatbot_open', { section: sectionOf(t) });
    }
  }, true);

  /* 윈터스쿨 계산기·신청서 (이름·연락처는 보내지 않는다) */
  var calcUsed = false;
  var applyStarted = false;
  var applySubmitted = false;

  function onFormTouch(e){
    var t = e.target;
    if(!(t instanceof Element)) return;
    if(!calcUsed && t.closest('#calc') && (e.type === 'change' || t.closest('button'))){
      calcUsed = true;
      track('calc_use', { section: sectionOf(t) });
    }
    if(!applyStarted && t.closest('#form') && e.type !== 'click'){
      applyStarted = true;
      track('apply_start', { section: sectionOf(t) });
    }
  }
  document.addEventListener('change', onFormTouch, true);
  document.addEventListener('focusin', onFormTouch, true);
  document.addEventListener('click', onFormTouch, true);

  document.addEventListener('submit', function(e){
    var f = e.target;
    if(!f || !f.id) return;
    if(f.id === 'form'){
      var v = function(n){ var el = f.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; };
      var filled = function(n){ var el = f.querySelector('[name="' + n + '"]'); return !!(el && el.value.trim()); };
      var params = { branch: v('branch'), grade: v('grade'), who: v('who'), period: v('when'), section: sectionOf(f) };
      track('apply_attempt', params);
      // 필수 항목이 다 채워진 첫 제출만 신청으로 센다 (접수 연결 전이라 서버 성공 여부는 모름)
      var agree = f.querySelector('input[name="agree"]');
      if(!applySubmitted && params.branch && params.grade && params.who && filled('name') && filled('phone') && agree && agree.checked){
        applySubmitted = true;
        track('apply_submit', params);
      }
    } else if(f.id === 'chatbotForm'){
      var input = document.getElementById('chatbotInput');
      if(input && input.value.trim()) track('chatbot_message');
    }
  }, true);

  function init(){
    initSections();
    initPopup();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
