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
