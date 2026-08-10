// Push subscribe
function urlB64ToUint8Array(b64){const p='='.repeat((4-b64.length%4)%4);const s=(b64+p).replace(/-/g,'+').replace(/_/g,'/');const raw=atob(s);const arr=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i);return arr}

document.getElementById('push-subscribe')?.addEventListener('click', async (e) => {
  const vapid = e.currentTarget.dataset.vapid;
  if (!vapid) return alert('VAPID publieke sleutel ontbreekt in config.');
  if (!('serviceWorker' in navigator)) return alert('Service Worker niet ondersteund.');
  const reg = await navigator.serviceWorker.register('/sw.js');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return;
  const sub = await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey: urlB64ToUint8Array(vapid) });
  await fetch('/push/subscribe', {method:'POST', headers:{'Content-Type':'application/json','X-CSRF':window.CSRF_TOKEN}, body: JSON.stringify(sub)});
  alert('Push geactiveerd.');
});

// WebAuthn register
document.getElementById('webauthn-register')?.addEventListener('click', async () => {
  const r = await fetch('/webauthn/register/options',{method:'POST',headers:{'X-CSRF':window.CSRF_TOKEN}});
  if (!r.ok) return alert('Kan opties niet ophalen.');
  const opts = await r.json();
  opts.challenge = urlB64ToUint8Array(opts.challenge);
  opts.user.id = urlB64ToUint8Array(opts.user.id);
  const cred = await navigator.credentials.create({publicKey: opts});
  // Export public key as base64 (raw attestation kept simple; server slaat opgeslagen)
  const rawId = new Uint8Array(cred.rawId);
  const b64 = btoa(String.fromCharCode(...rawId)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const pk = new Uint8Array(cred.response.getPublicKey ? cred.response.getPublicKey() : []);
  const pkB64 = btoa(String.fromCharCode(...pk));
  await fetch('/webauthn/register/verify', {method:'POST',headers:{'Content-Type':'application/json','X-CSRF':window.CSRF_TOKEN},
    body: JSON.stringify({id:b64, publicKey: pkB64, label: navigator.userAgent.slice(0,60)})});
  alert('Vingerafdruk geregistreerd.');
});

// WebAuthn login
document.getElementById('webauthn-login')?.addEventListener('click', async () => {
  const email = document.querySelector('input[name=email]').value;
  if (!email) return alert('Vul eerst e-mail in.');
  const r = await fetch('/webauthn/login/options', {method:'POST',headers:{'Content-Type':'application/json','X-CSRF':window.CSRF_TOKEN}, body: JSON.stringify({email})});
  if (!r.ok) return alert('Geen passkey voor dit account.');
  const opts = await r.json();
  opts.challenge = urlB64ToUint8Array(opts.challenge);
  opts.allowCredentials = opts.allowCredentials.map(c => ({...c, id: urlB64ToUint8Array(c.id)}));
  const cred = await navigator.credentials.get({publicKey: opts});
  const rawId = new Uint8Array(cred.rawId);
  const b64 = btoa(String.fromCharCode(...rawId)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const rr = await fetch('/webauthn/login/verify', {method:'POST',headers:{'Content-Type':'application/json','X-CSRF':window.CSRF_TOKEN}, body: JSON.stringify({id:b64})});
  if (rr.ok) { const j = await rr.json(); location.href = j.redirect || '/planning'; }
  else alert('Kon niet aanmelden.');
});

// ===== Live takenlijst =====
(function () {
  const root = document.querySelector('[data-checklist]');
  if (!root) return;
  const activityId = root.dataset.activity || '';
  const list = root.querySelector('[data-checklist-list]');
  const progress = root.querySelector('[data-checklist-progress]');
  const scopeQS = activityId ? '?activity_id=' + encodeURIComponent(activityId) : '';

  const post = (url, data) => {
    const body = new URLSearchParams(data || {});
    if (activityId) body.set('activity_id', activityId);
    body.set('_csrf', window.CSRF_TOKEN);
    return fetch(url, { method: 'POST', headers: { 'X-CSRF': window.CSRF_TOKEN }, body });
  };

  let lastSignature = '';
  function render(data) {
    const sig = JSON.stringify(data.items.map(i => [i.id, i.title, i.done]));
    if (sig === lastSignature) return;
    lastSignature = sig;
    progress.textContent = data.done + '/' + data.total;
    list.innerHTML = '';
    if (!data.items.length) {
      const li = document.createElement('li');
      li.className = 'muted';
      li.textContent = 'Nog geen taken.';
      list.appendChild(li);
      return;
    }
    data.items.forEach(function (it) {
      const li = document.createElement('li');
      li.className = Number(it.done) ? 'done' : '';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!Number(it.done);
      cb.addEventListener('change', async function () {
        li.classList.toggle('done', cb.checked);
        await post('/checklist/items/' + it.id + '/toggle');
        refresh();
      });
      const span = document.createElement('span');
      span.className = 'task-title';
      span.textContent = it.title;
      span.addEventListener('dblclick', async function () {
        const t = prompt('Taak aanpassen', it.title);
        if (t && t.trim()) { await post('/checklist/items/' + it.id + '/rename', { title: t.trim() }); refresh(); }
      });
      const del = document.createElement('button');
      del.className = 'task-del';
      del.type = 'button';
      del.setAttribute('aria-label', 'Verwijderen');
      del.textContent = '\u00d7';
      del.addEventListener('click', async function () {
        if (!confirm('Taak verwijderen?')) return;
        await post('/checklist/items/' + it.id + '/delete');
        refresh();
      });
      li.append(cb, span, del);
      list.appendChild(li);
    });
  }

  async function refresh() {
    try {
      const r = await fetch('/checklist/items' + scopeQS, { headers: { 'Accept': 'application/json' } });
      if (r.ok) render(await r.json());
    } catch (e) { /* offline: stil negeren */ }
  }

  root.querySelector('[data-checklist-add]')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const input = e.target.querySelector('input[name=title]');
    const title = input.value.trim();
    if (!title) return;
    input.value = '';
    await post('/checklist/items', { title: title });
    refresh();
  });

  root.querySelector('[data-checklist-apply]')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const sel = e.target.querySelector('select');
    if (!sel.value) return;
    await post('/checklist/apply-template', { template_id: sel.value });
    sel.value = '';
    refresh();
  });

  root.querySelector('[data-checklist-copy]')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const sel = e.target.querySelector('select');
    if (!sel.value) return;
    await post('/checklist/copy-from', { from_activity_id: sel.value });
    sel.value = '';
    refresh();
  });

  root.querySelector('[data-checklist-save-template]')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const input = e.target.querySelector('input[name=name]');
    if (!input.value.trim()) return;
    const r = await post('/checklist/save-template', { name: input.value.trim() });
    input.value = '';
    alert(r.ok ? 'Sjabloon bewaard.' : 'Bewaren mislukt.');
  });

  refresh();
  let timer = setInterval(refresh, 5000);
  document.addEventListener('visibilitychange', function () {
    clearInterval(timer);
    if (!document.hidden) { refresh(); timer = setInterval(refresh, 5000); }
  });
})();
