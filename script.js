    const START_DATE = new Date('2026-08-24T00:00:00-05:00');

    function updateResetDay(){
      const now = new Date();
      const diff = Math.floor((now - START_DATE)/(1000*60*60*24)) + 1;
      const day = Math.max(1, Math.min(90, diff));
      document.getElementById('dayNumber').textContent = day;
      document.getElementById('dayText').textContent = `Día ${day} de 90`;
      document.getElementById('progressFill').style.width = `${(day/90)*100}%`;
      const label = day <= 14 ? 'Etapa 1 · Estabilizar' : day <= 45 ? 'Etapa 2 · Ordenar' : 'Etapa 3 · Crecer';
      document.getElementById('phaseLabel').textContent = label;
    }

    function showToast(){
      const toast = document.getElementById('toast');
      toast.classList.add('show');
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(()=>toast.classList.remove('show'), 900);
    }

    document.querySelectorAll('[data-save]').forEach(el=>{
      const key = 'ymhq:' + el.dataset.save;
      const saved = localStorage.getItem(key);

      if(saved !== null){
        if(el.type === 'checkbox') el.checked = saved === 'true';
        else el.value = saved;
      }

      const valueTarget = document.querySelector(`[data-value-for="${el.dataset.save}"]`);
      if(valueTarget) valueTarget.textContent = el.value;

      const eventName = (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'range') ? 'change' : 'input';
      el.addEventListener(eventName, ()=>{
        const val = el.type === 'checkbox' ? el.checked : el.value;
        localStorage.setItem(key, val);
        if(valueTarget) valueTarget.textContent = el.value;
        showToast();
      });

      if(el.type === 'range'){
        el.addEventListener('input', ()=>{
          if(valueTarget) valueTarget.textContent = el.value;
        });
      }
    });

    const sections = [...document.querySelectorAll('main section')];
    const links = [...document.querySelectorAll('nav a')];
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          links.forEach(a=>a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
        }
      })
    },{rootMargin:'-35% 0px -55% 0px',threshold:0});
    sections.forEach(s=>observer.observe(s));


    function getAllYMHQData(){
      const data = {};
      for(let i=0;i<localStorage.length;i++){
        const key = localStorage.key(i);
        if(key && key.startsWith('ymhq:')){
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    }

    function val(key, fallback=''){
      const v = localStorage.getItem('ymhq:' + key);
      return v === null ? fallback : v;
    }

    function numberVal(key, fallback=0){
      const n = Number(val(key, fallback));
      return Number.isFinite(n) ? n : fallback;
    }

    function historyKey(){
      return 'ymhq:history';
    }

    function readHistory(){
      try{
        return JSON.parse(localStorage.getItem(historyKey()) || '[]');
      }catch(e){
        return [];
      }
    }

    function writeHistory(items){
      localStorage.setItem(historyKey(), JSON.stringify(items));
    }

    function saveWeeklySnapshot(){
      const now = new Date();
      const snapshot = {
        id: now.toISOString(),
        date: now.toISOString(),
        month: now.toISOString().slice(0,7),
        metrics: {
          wellbeing: val('metric-wellbeing',''),
          us: val('metric-us',''),
          money: val('metric-money',''),
          yellower: val('metric-yellower',''),
          fanbox: val('metric-fanbox','')
        },
        habits: {
          sleep: val('habit-sleep','false') === 'true',
          move: val('habit-move','false') === 'true',
          work: val('habit-work','false') === 'true',
          space: val('habit-space','false') === 'true',
          us: val('habit-us','false') === 'true'
        },
        yani: {
          energy: numberVal('y-energy',3),
          motivation: numberVal('y-motivation',3),
          space: numberVal('y-space',2),
          move: numberVal('y-move',2),
          workload: numberVal('y-workload',2)
        },
        matt: {
          sleep: numberVal('m-sleep',2),
          energy: numberVal('m-energy',3),
          space: numberVal('m-space',2),
          creative: numberVal('m-creative',3),
          move: numberVal('m-move',2)
        },
        money: {
          cash: numberVal('money-cash',0),
          receivable: numberVal('money-receivable',0),
          bills: numberVal('money-bills',0),
          pipeline: numberVal('money-pipeline',0)
        },
        us: {
          favorite: val('us-favorite',''),
          watch: val('us-watch',''),
          read: val('us-read',''),
          date: val('us-date','')
        },
        sunday: {
          how: val('sun-how',''),
          worked: val('sun-worked',''),
          drained: val('sun-drained',''),
          money: val('sun-money',''),
          yellower: val('sun-yellower',''),
          us: val('sun-us',''),
          p1: val('sun-p1',''),
          p2: val('sun-p2',''),
          p3: val('sun-p3','')
        }
      };

      const items = readHistory();
      items.push(snapshot);
      writeHistory(items);
      renderHistory();
      showToast();
    }

    function formatMoney(n){
      try{
        return new Intl.NumberFormat('es-CO', {style:'currency',currency:'COP',maximumFractionDigits:0}).format(n || 0);
      }catch(e){
        return '$' + (n || 0);
      }
    }

    function formatDate(iso){
      return new Intl.DateTimeFormat('es-CO', {day:'numeric',month:'long',year:'numeric'}).format(new Date(iso));
    }

    function renderHistory(){
      const monthInput = document.getElementById('historyMonth');
      const targetMonth = monthInput.value || new Date().toISOString().slice(0,7);
      monthInput.value = targetMonth;

      const list = document.getElementById('historyList');
      const items = readHistory()
        .filter(x => x.month === targetMonth)
        .sort((a,b)=> new Date(b.date)-new Date(a.date));

      if(!items.length){
        list.innerHTML = '<div class="empty-state">Todavía no hay semanas guardadas en este mes. ✨</div>';
        return;
      }

      list.innerHTML = items.map((x,index)=>`
        <div class="history-entry">
          <h5>Semana guardada · ${formatDate(x.date)}</h5>
          <div class="history-meta">${x.us.favorite ? '💛 “' + escapeHtml(x.us.favorite) + '”' : 'Sin recuerdo favorito registrado'}</div>
          <div class="history-grid">
            <div class="history-stat">Yani · Energía<strong>${x.yani.energy}/5</strong></div>
            <div class="history-stat">Yani · Motivación<strong>${x.yani.motivation}/5</strong></div>
            <div class="history-stat">Matt · Sueño<strong>${x.matt.sleep}/5</strong></div>
            <div class="history-stat">Matt · Creatividad<strong>${x.matt.creative}/5</strong></div>
            <div class="history-stat">Caja<strong>${formatMoney(x.money.cash)}</strong></div>
            <div class="history-stat">Por cobrar<strong>${formatMoney(x.money.receivable)}</strong></div>
            <div class="history-stat">Hábitos cumplidos<strong>${Object.values(x.habits).filter(Boolean).length}/5</strong></div>
            <div class="history-stat">Nosotros<strong>${escapeHtml(x.metrics.us || '—')}</strong></div>
          </div>
        </div>
      `).join('');
    }

    function escapeHtml(str){
      return String(str ?? '')
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'","&#039;");
    }

    function exportBackup(){
      const payload = {
        app: 'Y&M Life HQ',
        version: 2,
        exportedAt: new Date().toISOString(),
        data: getAllYMHQData()
      };
      const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ym-life-hq-backup-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    async function importBackup(file){
      if(!file) return;
      try{
        const txt = await file.text();
        const payload = JSON.parse(txt);
        const data = payload.data || payload;
        Object.entries(data).forEach(([key,value])=>{
          if(key.startsWith('ymhq:')){
            localStorage.setItem(key, String(value));
          }
        });
        alert('Respaldo importado. La página se recargará para mostrar los datos.');
        location.reload();
      }catch(e){
        alert('No pude importar ese archivo. Revisa que sea un respaldo JSON válido de Y&M Life HQ.');
      }
    }

    document.getElementById('saveWeekBtn').addEventListener('click', saveWeeklySnapshot);
    document.getElementById('historyMonth').addEventListener('change', renderHistory);
    document.getElementById('exportBtn').addEventListener('click', exportBackup);
    document.getElementById('importFile').addEventListener('change', e => importBackup(e.target.files[0]));

    renderHistory();



    // ---------- Google Sheets bridge ----------
    const REMOTE = window.YMHQ_CONFIG || {};

    function isRemoteConfigured(){
      return Boolean(REMOTE.APPS_SCRIPT_URL && !REMOTE.APPS_SCRIPT_URL.includes('PEGA_AQUI'));
    }

    function updateSyncStatus(){
      const dot = document.getElementById('syncDot');
      const status = document.getElementById('syncStatus');
      if(isRemoteConfigured()){
        dot.className = 'sync-dot ok';
        status.textContent = 'Google Sheets listo para recibir registros';
      }else{
        dot.className = 'sync-dot bad';
        status.textContent = 'Falta pegar la URL de Apps Script en config.js';
      }
    }

    async function sendToSheets(action, rows){
      if(!isRemoteConfigured()){
        throw new Error('Primero configura APPS_SCRIPT_URL en config.js');
      }
      const payload = {
        action,
        rows,
        source: 'YM-Life-HQ-GitHub',
        sentAt: new Date().toISOString()
      };
      // no-cors is intentional: Apps Script receives the data while the Sheet remains private.
      await fetch(REMOTE.APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {'Content-Type':'text/plain;charset=utf-8'},
        body: JSON.stringify(payload)
      });
      return true;
    }

    function todayISO(){
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,'0');
      const day = String(d.getDate()).padStart(2,'0');
      return `${y}-${m}-${day}`;
    }

    function weekStartISO(){
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,'0');
      const dd = String(d.getDate()).padStart(2,'0');
      return `${y}-${m}-${dd}`;
    }

    function boolLocal(key){ return val(key,'false') === 'true'; }
    function yesNo(v){ return v ? 'Yes' : 'No'; }

    async function runRemoteSave(resultId, fn){
      const el = document.getElementById(resultId);
      try{
        el.textContent = 'Guardando…';
        await fn();
        el.textContent = '✓ Enviado a Google Sheets';
        showToast();
      }catch(e){
        el.textContent = '⚠ ' + e.message;
      }
    }

    function saveDaily(person){
      const p = person === 'Yani' ? 'y' : 'm';
      const resultId = person === 'Yani' ? 'dailyYResult' : 'dailyMResult';
      return runRemoteSave(resultId, () => sendToSheets('daily', [[
        todayISO(), person,
        numberVal(`daily-${p}-sleep-hours`,0),
        numberVal(`daily-${p}-sleep-quality`,0),
        numberVal(`daily-${p}-move`,0),
        yesNo(boolLocal(`daily-${p}-spirituality`)),
        yesNo(boolLocal(`daily-${p}-work`)),
        yesNo(boolLocal(`daily-${p}-space`)),
        yesNo(boolLocal(`daily-${p}-life`)),
        val(`daily-${p}-note`,''),
        new Date().toISOString()
      ]]));
    }

    function saveWeeklyCheckin(){
      const rows = [
        [weekStartISO(),'Yani',numberVal('y-energy',3),numberVal('y-motivation',3),numberVal('y-space',2),numberVal('y-move',2),'',numberVal('y-workload',2),'', '',new Date().toISOString()],
        [weekStartISO(),'Matt',numberVal('m-energy',3),'',numberVal('m-space',2),numberVal('m-move',2),numberVal('m-creative',3),'','', '',new Date().toISOString()]
      ];
      return runRemoteSave('weeklyResult', () => sendToSheets('weekly', rows));
    }

    function saveMoneySnapshot(){
      const now = new Date().toISOString();
      const d = todayISO();
      const rows = [
        [d,'Cash Snapshot','Personal','Dashboard','Caja actual',numberVal('money-cash',0),'Open','', 'Y&M Life HQ','',now],
        [d,'Receivable','Yellower','Dashboard','Por cobrar',numberVal('money-receivable',0),'Pending','', 'Y&M Life HQ','',now],
        [d,'Debt','Personal','Dashboard','Obligaciones próximas',numberVal('money-bills',0),'Pending','', 'Y&M Life HQ','',now],
        [d,'Pipeline','Yellower','Dashboard','Pipeline potencial',numberVal('money-pipeline',0),'Open','', 'Y&M Life HQ','',now]
      ];
      return runRemoteSave('moneyResult', () => sendToSheets('finances', rows));
    }

    function saveMemories(){
      const now = new Date().toISOString();
      const d = todayISO();
      const rows = [];
      const watch = val('us-watch','').trim();
      const read = val('us-read','').trim();
      const datePlan = val('us-date','').trim();
      const fav = val('us-favorite','').trim();
      if(watch) rows.push([d,'Series / Movie',watch,'Lo que estamos viendo','Both','No','',now]);
      if(read) rows.push([d,'Story',read,'Lectura / cuento actual','Both','No','',now]);
      if(datePlan) rows.push([d,'Date Night','Próxima cita',datePlan,'Both','No','',now]);
      if(fav) rows.push([d,'Other','Momento favorito',fav,'Both','Yes','',now]);
      if(!rows.length){
        document.getElementById('memoriesResult').textContent = 'Escriban algo primero 💛';
        return;
      }
      return runRemoteSave('memoriesResult', () => sendToSheets('memories', rows));
    }

    function saveSundayResetRemote(){
      const row = [[
        todayISO(), weekStartISO(), val('sun-how',''), val('sun-worked',''), val('sun-drained',''),
        val('sun-money',''), val('sun-yellower',''), val('sun-us',''), val('sun-p1',''), val('sun-p2',''),
        val('sun-p3',''), val('us-favorite',''), new Date().toISOString()
      ]];
      return runRemoteSave('sundayResult', () => sendToSheets('sunday', row));
    }

    updateSyncStatus();

    updateResetDay();
