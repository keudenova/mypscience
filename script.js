// ============================================================
// Energy Quest — student site interactivity
// Session-based progress (resets on reload — there's no login
// system here). For progress tracking across time, the teacher
// uses a separate Google Form quiz.
// ============================================================

const state = {
  missions: {},   // { "1": {correct:0, total:0, attempted:0} }
  xp: 0
};

function initLangToggle(){
  const buttons = document.querySelectorAll('[data-lang-btn]');
  buttons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const mode = btn.getAttribute('data-lang-btn');
      document.body.classList.toggle('show-zh', mode === 'bi');
      buttons.forEach(b=>b.classList.toggle('active', b===btn));
    });
  });
}

function missionTotalsFromDOM(){
  document.querySelectorAll('.quiz[data-mission]').forEach(q=>{
    const m = q.getAttribute('data-mission');
    if (!state.missions[m]) state.missions[m] = {correct:0, total:0, attempted:0};
    state.missions[m].total++;
  });
}

function initQuizzes(){
  document.querySelectorAll('.quiz').forEach(quiz=>{
    const opts = quiz.querySelectorAll('.quiz-opt');
    const feedback = quiz.querySelector('.quiz-feedback');
    const mission = quiz.getAttribute('data-mission');
    let answered = false;
    opts.forEach(opt=>{
      opt.addEventListener('click', ()=>{
        if (answered) return;
        answered = true;
        const correct = opt.getAttribute('data-correct') === 'true';
        opts.forEach(o=>{
          o.disabled = true;
          if (o.getAttribute('data-correct') === 'true') o.classList.add('correct');
        });
        if (!correct) opt.classList.add('incorrect');
        if (feedback){
          feedback.textContent = correct
            ? '✅ Correct — ' + (quiz.getAttribute('data-explain') || 'nice work.')
            : '❌ Not quite — ' + (quiz.getAttribute('data-explain') || 'take another look above.');
        }
        quiz.classList.add('just-answered');

        if (mission && state.missions[mission]){
          state.missions[mission].attempted++;
          if (correct){ state.missions[mission].correct++; state.xp += 10; }
          updateMissionUI(mission);
          updateGlobalMeter();
        }
      });
    });
  });
}

function starsFor(correct, total){
  if (total === 0) return 0;
  const ratio = correct / total;
  if (ratio >= 0.99) return 3;
  if (ratio >= 0.6) return 2;
  if (ratio > 0) return 1;
  return 0;
}

function updateMissionUI(missionId){
  const data = state.missions[missionId];
  const stars = starsFor(data.correct, data.total);

  document.querySelectorAll(`.mission-stars-live[data-mission="${missionId}"]`).forEach(el=>{
    let out = '';
    for (let i=0;i<3;i++) out += `<span class="${i<stars?'lit':''}">${i<stars?'★':'☆'}</span>`;
    el.innerHTML = out;
  });

  const card = document.querySelector(`.mission-card[data-mission-card="${missionId}"]`);
  if (card){
    const starEl = card.querySelector('.m-stars');
    if (starEl){
      let out = '';
      for (let i=0;i<3;i++) out += (i<stars) ? '★' : '☆';
      starEl.textContent = out;
    }
    card.classList.remove('status-progress','status-complete');
    if (data.attempted >= data.total && data.total > 0){
      card.classList.add('status-complete');
    } else if (data.attempted > 0){
      card.classList.add('status-progress');
    }
  }

  const xpPill = document.getElementById('xp-count');
  if (xpPill) xpPill.textContent = state.xp;
}

function updateGlobalMeter(){
  let totalCorrect = 0, totalQuestions = 0;
  Object.values(state.missions).forEach(m=>{ totalCorrect += m.correct; totalQuestions += m.total; });
  const pct = totalQuestions ? Math.round((totalCorrect/totalQuestions)*100) : 0;
  const fill = document.getElementById('energy-meter-fill');
  const label = document.getElementById('energy-meter-pct');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = pct + '%';

  if (pct === 100){
    document.querySelectorAll('.badge').forEach(b=>b.classList.add('earned'));
  }
}

function initConfidence(){
  document.querySelectorAll('.confidence-row').forEach(row=>{
    const btns = row.querySelectorAll('.conf-btn');
    btns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        btns.forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  });
}

function initSideNav(){
  const links = document.querySelectorAll('.side-nav a');
  if (!links.length) return;
  const sections = Array.from(links).map(l=>document.querySelector(l.getAttribute('href')));
  const setActive = ()=>{
    let idx = 0;
    sections.forEach((sec, i)=>{
      if (sec && sec.getBoundingClientRect().top - 110 <= 0) idx = i;
    });
    links.forEach((l,i)=>l.classList.toggle('active', i===idx));
  };
  window.addEventListener('scroll', setActive, {passive:true});
  setActive();
}

function initTabs(){
  document.querySelectorAll('[data-tab-btn]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const group = btn.getAttribute('data-tab-group');
      const tab = btn.getAttribute('data-tab-btn');
      document.querySelectorAll(`[data-tab-btn][data-tab-group="${group}"]`).forEach(b=>b.classList.toggle('active', b===btn));
      document.querySelectorAll(`[data-tab-panel][data-tab-group="${group}"]`).forEach(p=>p.classList.toggle('active', p.getAttribute('data-tab-panel')===tab));
    });
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initLangToggle();
  missionTotalsFromDOM();
  initQuizzes();
  initConfidence();
  initSideNav();
  initTabs();
  updateGlobalMeter();
});
