/* Kaart (OpenStreetMap via Leaflet) + foto's bij een activiteit */
(function () {
  const DEFAULT = [50.78570, 5.02330];
  const DEFAULT_ZOOM = 16;

  function tiles(map) {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
  }

  /* ---------- Pin kiezen (nieuw/aanpassen) ---------- */
  function initPicker(el) {
    const latI = document.getElementById(el.dataset.latInput);
    const lngI = document.getElementById(el.dataset.lngInput);
    const start = latI.value && lngI.value ? [parseFloat(latI.value), parseFloat(lngI.value)] : DEFAULT;
    const map = L.map(el).setView(start, DEFAULT_ZOOM);
    tiles(map);

    let marker = null;
    const out = el.parentElement.querySelector('.map-coords');
    function setPin(latlng) {
      if (!marker) {
        marker = L.marker(latlng, { draggable: true }).addTo(map);
        marker.on('dragend', () => setPin(marker.getLatLng()));
      } else {
        marker.setLatLng(latlng);
      }
      latI.value = latlng.lat.toFixed(6);
      lngI.value = latlng.lng.toFixed(6);
      if (out) out.textContent = latI.value + ', ' + lngI.value;
    }
    if (latI.value && lngI.value) setPin(L.latLng(parseFloat(latI.value), parseFloat(lngI.value)));
    map.on('click', (e) => setPin(e.latlng));

    el.parentElement.querySelector('[data-map-gps]')?.addEventListener('click', () => {
      if (!navigator.geolocation) return alert('Locatie niet beschikbaar op dit toestel');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const ll = L.latLng(pos.coords.latitude, pos.coords.longitude);
          map.setView(ll, 17);
          setPin(ll);
        },
        () => alert('Locatie ophalen mislukt'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
    el.parentElement.querySelector('[data-map-default]')?.addEventListener('click', () => {
      const ll = L.latLng(DEFAULT[0], DEFAULT[1]);
      map.setView(ll, DEFAULT_ZOOM);
      setPin(ll);
    });
    el.parentElement.querySelector('[data-map-clear]')?.addEventListener('click', () => {
      if (marker) { map.removeLayer(marker); marker = null; }
      latI.value = ''; lngI.value = '';
      if (out) out.textContent = 'Geen pin';
    });
    setTimeout(() => map.invalidateSize(), 200);
  }

  /* ---------- Kaart tonen op detail ---------- */
  function initView(el) {
    const lat = parseFloat(el.dataset.lat), lng = parseFloat(el.dataset.lng);
    const map = L.map(el).setView([lat, lng], DEFAULT_ZOOM);
    tiles(map);
    L.marker([lat, lng]).addTo(map).bindPopup(el.dataset.label || 'Activiteit');
    let pins = [];
    try { pins = JSON.parse(el.dataset.photoPins || '[]'); } catch (e) { pins = []; }
    pins.forEach((p) => {
      L.circleMarker([p.lat, p.lng], { radius: 7, color: '#0d6efd', fillOpacity: 0.9 })
        .addTo(map)
        .bindPopup('Foto');
    });
    setTimeout(() => map.invalidateSize(), 200);
  }

  /* ---------- Foto's ---------- */
  function initPhotos(box) {
    const activityId = box.dataset.activity;
    const csrf = box.dataset.csrf;
    const grid = box.querySelector('[data-photo-grid]');
    const input = box.querySelector('input[type=file]');
    const status = box.querySelector('[data-photo-status]');
    const useGps = box.querySelector('[data-photo-gps]');
    const canDeleteAll = box.dataset.staff === '1';
    const me = box.dataset.me;

    function render(photos) {
      grid.innerHTML = '';
      if (!photos.length) {
        grid.innerHTML = '<p class="muted">Nog geen foto\'s.</p>';
        return;
      }
      photos.forEach((p) => {
        const fig = document.createElement('figure');
        fig.className = 'photo-tile';
        const a = document.createElement('a');
        a.href = '/' + p.path; a.target = '_blank'; a.rel = 'noopener';
        const img = document.createElement('img');
        img.src = '/' + p.path; img.alt = p.caption || 'Foto bij activiteit'; img.loading = 'lazy';
        a.appendChild(img); fig.appendChild(a);
        const cap = document.createElement('figcaption');
        cap.textContent = p.uploader_name || '';
        if (p.lat && p.lng) {
          const link = document.createElement('a');
          link.href = 'https://www.openstreetmap.org/?mlat=' + p.lat + '&mlon=' + p.lng + '#map=17/' + p.lat + '/' + p.lng;
          link.target = '_blank'; link.rel = 'noopener'; link.textContent = ' 📍';
          cap.appendChild(link);
        }
        if (canDeleteAll || p.uploaded_by === me) {
          const del = document.createElement('button');
          del.type = 'button'; del.className = 'btn small danger'; del.textContent = 'Verwijderen';
          del.addEventListener('click', async () => {
            if (!confirm('Foto verwijderen?')) return;
            const fd = new FormData(); fd.append('_csrf', csrf);
            await fetch('/photos/' + p.id + '/delete', { method: 'POST', body: fd });
            load();
          });
          cap.appendChild(del);
        }
        fig.appendChild(cap);
        grid.appendChild(fig);
      });
    }

    async function load() {
      const r = await fetch('/planning/' + activityId + '/photos');
      const d = await r.json();
      render(d.photos || []);
    }

    async function upload(files) {
      if (!files.length) return;
      status.textContent = 'Bezig met opladen…';
      const fd = new FormData();
      fd.append('_csrf', csrf);
      for (const f of files) fd.append('photos[]', f);
      if (useGps && useGps.checked && navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 })
          );
          fd.append('lat', pos.coords.latitude);
          fd.append('lng', pos.coords.longitude);
        } catch (e) { /* zonder locatie doorgaan */ }
      }
      const r = await fetch('/planning/' + activityId + '/photos', { method: 'POST', body: fd });
      const d = await r.json();
      status.textContent = d.ok ? 'Foto\'s toegevoegd' : (d.errors?.join(', ') || d.error || 'Opladen mislukt');
      input.value = '';
      load();
      setTimeout(() => (status.textContent = ''), 4000);
    }

    input?.addEventListener('change', () => upload(Array.from(input.files || [])));
    load();
  }

  document.querySelectorAll('[data-map-picker]').forEach(initPicker);
  document.querySelectorAll('[data-map-view]').forEach(initView);
  document.querySelectorAll('[data-photos]').forEach(initPhotos);
})();
