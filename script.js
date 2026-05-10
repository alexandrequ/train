// ─── JOTFORM MODAL: hide navbar while open ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const jotformEl = document.getElementById('jotformModal');
  const navbar    = document.getElementById('site-header');
  if (jotformEl && navbar) {
    jotformEl.addEventListener('show.bs.modal',   () => { navbar.style.visibility = 'hidden'; });
    jotformEl.addEventListener('hidden.bs.modal', () => { navbar.style.visibility = ''; });
  }
});

// ─── NAV: active link on scroll ───────────────────────────────────────────────

const navLinks = [...document.querySelectorAll('.rs-nav-link')];
const sections = [...document.querySelectorAll('section[id], footer[id]')];
const header   = document.getElementById('site-header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);

  const scrollY = window.scrollY + 120;
  let current = '';
  sections.forEach(s => { if (s.offsetTop <= scrollY) current = s.id; });
  navLinks.forEach(a => {
    const href = a.getAttribute('href').replace('#', '');
    a.classList.toggle('is-active', href === current);
  });
}, { passive: true });

// ─── MAP DATA ─────────────────────────────────────────────────────────────────

const COUNTRY_NAMES = {
  '4':'Afghanistan','8':'Albanie','12':'Algérie','24':'Angola','32':'Argentine',
  '36':'Australie','40':'Autriche','50':'Bangladesh','56':'Belgique','68':'Bolivie',
  '70':'Bosnie-Herzégovine','76':'Brésil','100':'Bulgarie','116':'Cambodge',
  '120':'Cameroun','124':'Canada','152':'Chili','156':'Chine','170':'Colombie',
  '191':'Croatie','203':'Tchéquie','208':'Danemark','231':'Éthiopie',
  '246':'Finlande','250':'France','276':'Allemagne','300':'Grèce',
  '320':'Guatemala','340':'Honduras','348':'Hongrie','356':'Inde',
  '360':'Indonésie','364':'Iran','368':'Irak','372':'Irlande','376':'Israël',
  '380':'Italie','392':'Japon','400':'Jordanie','404':'Kenya','410':'Corée du Sud',
  '422':'Liban','440':'Lituanie','442':'Luxembourg','458':'Malaisie',
  '484':'Mexique','499':'Monténégro','504':'Maroc','524':'Népal',
  '528':'Pays-Bas','554':'Nouvelle-Zélande','566':'Nigeria','578':'Norvège',
  '586':'Pakistan','604':'Pérou','608':'Philippines','616':'Pologne',
  '620':'Portugal','642':'Roumanie','643':'Russie','682':'Arabie Saoudite',
  '688':'Serbie','703':'Slovaquie','705':'Slovénie','724':'Espagne',
  '752':'Suède','756':'Suisse','764':'Thaïlande','792':'Turquie',
  '804':'Ukraine','807':'Macédoine du Nord','826':'Royaume-Uni',
  '840':'États-Unis','858':'Uruguay','704':'Viêt Nam',
};

let STORIES = {};
let _storiesLoaded = false;
let _mapPending    = false;

fetch('stories.json')
  .then(r => r.json())
  .then(data => {
    STORIES = data;
    _storiesLoaded = true;
    if (_mapPending) initMap();
  })
  .catch(() => console.error('Impossible de charger stories.json'));

// ─── MAP ──────────────────────────────────────────────────────────────────────

let mapReady = false;

function initMap() {
  if (mapReady) return;
  mapReady = true;

  const map = L.map('map', {
    scrollWheelZoom: false,
    zoomControl: true,
    attributionControl: false,
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0,
  }).setView([52, 12], 4);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 18,
    noWrap: true,
  }).addTo(map);

  L.control.attribution({ position: 'bottomright' })
    .addAttribution('© <a href="https://carto.com/attributions">CARTO</a> | © <a href="https://openstreetmap.org/copyright">OSM</a>')
    .addTo(map);

  let activeLayer      = null;
  let currentStoryData = null;

  const FILL_DEFAULT  = '#c8960c';   /* dark yellow   */
  const FILL_ACTIVE   = '#8a6500';   /* deeper yellow */
  const FILL_INACTIVE = '#e0e0e0';   /* light grey    */

  // Normalize polygon coordinates so no ring crosses the antimeridian.
  // Consecutive vertices with longitude gap > 180° get shifted to stay consistent,
  // preventing Leaflet from drawing stripes across Russia / Alaska.
  function fixAntimeridian(geojson) {
    const processRing = coords => {
      for (let i = 1; i < coords.length; i++) {
        while (coords[i][0] - coords[i - 1][0] >  180) coords[i][0] -= 360;
        while (coords[i - 1][0] - coords[i][0] >  180) coords[i][0] += 360;
      }
    };
    geojson.features.forEach(f => {
      if (!f.geometry) return;
      const t = f.geometry.type;
      if (t === 'Polygon')      f.geometry.coordinates.forEach(processRing);
      if (t === 'MultiPolygon') f.geometry.coordinates.forEach(p => p.forEach(processRing));
    });
    return geojson;
  }

  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(r => r.json())
    .then(world => {
      const geojson = fixAntimeridian(topojson.feature(world, world.objects.countries));

      L.geoJSON(geojson, {
        style(feature) {
          const code = String(feature.id);
          const hasStory = !!STORIES[code];
          return {
            fillColor:   hasStory ? FILL_DEFAULT : FILL_INACTIVE,
            fillOpacity: hasStory ? 0.65 : 0.3,
            color:       '#ffffff',
            weight:      0.7,
          };
        },

        onEachFeature(feature, layer) {
          const code    = String(feature.id);
          const storyData = STORIES[code];

          if (!storyData) {
            layer.options.interactive = false;
            return;
          }

          layer.bindTooltip(storyData.name, {
            sticky: true,
            direction: 'top',
            offset: [0, -4],
            className: 'rs-tooltip',
          });

          layer.on('mouseover', () => {
            if (layer !== activeLayer) {
              layer.setStyle({ fillOpacity: 0.85, fillColor: FILL_ACTIVE });
            }
          });

          layer.on('mouseout', () => {
            if (layer !== activeLayer) {
              layer.setStyle({ fillOpacity: 0.65, fillColor: FILL_DEFAULT });
            }
          });

          layer.on('click', () => {
            if (activeLayer && activeLayer !== layer) {
              activeLayer.setStyle({ fillOpacity: 0.65, fillColor: FILL_DEFAULT });
            }
            activeLayer = layer;
            currentStoryData = storyData;
            layer.setStyle({ fillOpacity: 1, fillColor: FILL_ACTIVE });

            document.getElementById('storyModalTitle').textContent = storyData.name;
            document.getElementById('storyModalBody').innerHTML = renderStory(storyData);
            bootstrap.Modal.getOrCreateInstance(document.getElementById('storyModal')).show();
          });
        },
      }).addTo(map);
    })
    .catch(() => {
      document.getElementById('map').insertAdjacentHTML('beforeend',
        '<p style="padding:1rem;color:#c00">Impossible de charger la carte. Vérifie ta connexion.</p>'
      );
    });

  document.getElementById('storyModal').addEventListener('hidden.bs.modal', () => {
    if (activeLayer) {
      activeLayer.setStyle({ fillOpacity: 0.65, fillColor: FILL_DEFAULT });
      activeLayer = null;
    }
    currentStoryData = null;
  });

  document.getElementById('storyModalBody').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn || !currentStoryData) return;
    const action = btn.dataset.action;
    if (action === 'show-narrative') {
      document.getElementById('storyModalBody').innerHTML = renderNarrative(currentStoryData);
    } else if (action === 'show-story') {
      document.getElementById('storyModalBody').innerHTML = renderStory(currentStoryData);
    }
  });
}

function renderStory(data) {
  const warningHtml = data.warning
    ? `<div class="sp-warning">⚠️ ${data.warning}</div>`
    : '';

  const journeyCardHtml = (() => {
    if (!data.narrative) return '';
    const parts = (data.route || data.name).split('→').map(s => s.trim());
    const from  = parts[0];
    const to    = parts[parts.length - 1];
    const via   = parts.length > 2 ? 'via ' + parts.slice(1, -1).join(' → ') : '';
    const bookingUrl = data.booking
      ? (data.booking.startsWith('http') ? data.booking : `https://www.${data.booking.toLowerCase().replace(/\s/g,'')}.com`)
      : null;
    const bookingLabel = data.booking
      ? data.booking.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
      : '';
    return `
    <div class="sp-journey-card" role="button" data-action="show-narrative">
      <div class="sp-ticket-main">
        <div class="sp-ticket-route-row">
          <div class="sp-ticket-station">
            <div class="sp-ticket-label">Départ</div>
            <div class="sp-ticket-city">${from}</div>
          </div>
          <div class="sp-ticket-connector">
            <div class="sp-ticket-dash"></div>
            <i class="bi bi-train-front-fill sp-ticket-train"></i>
            <div class="sp-ticket-dash"></div>
          </div>
          <div class="sp-ticket-station" style="text-align:right">
            <div class="sp-ticket-label">Arrivée</div>
            <div class="sp-ticket-city">${to}</div>
          </div>
        </div>
        ${via ? `<div class="sp-ticket-via">${via}</div>` : ''}
        <div class="sp-ticket-passenger"><i class="bi bi-person-fill"></i>${data.author}</div>
      </div>
      <div class="sp-ticket-sep">
        <div class="sp-notch sp-notch--t"></div>
        <div class="sp-notch sp-notch--b"></div>
      </div>
      <div class="sp-ticket-stub">
        ${data.duration ? `<div class="sp-ticket-info"><i class="bi bi-clock"></i>${data.duration}</div>` : ''}
        ${data.price    ? `<div class="sp-ticket-info"><i class="bi bi-tag"></i>${data.price}</div>`     : ''}
        ${bookingUrl    ? `<a href="${bookingUrl}" target="_blank" rel="noopener" class="sp-ticket-book" onclick="event.stopPropagation()"><i class="bi bi-box-arrow-up-right"></i>${bookingLabel}</a>` : ''}
        <div class="sp-ticket-read"><i class="bi bi-arrow-right-circle-fill"></i></div>
      </div>
    </div>`;
  })();

  const citiesHtml = data.cities.map(city => `
    <div class="sp-city">
      <div class="sp-city-name">
        <span>${city.icon}</span>
        <span>${city.name}</span>
        ${city.hours ? `<span class="sp-city-meta">(${city.hours} · ${city.price})</span>` : ''}
      </div>
      ${city.storyLink ? `<a href="${city.storyLink}" class="sp-story-link">Le récit de Mathilde →</a>` : ''}
      <div class="sp-pepites-label">🤍 Coups de cœur</div>
      <ul class="sp-city-tips">
        ${city.tips.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  return `
    ${warningHtml}
    ${journeyCardHtml}
    ${citiesHtml}
  `;
}

function renderNarrative(data) {
  const parts = (data.route || data.name).split('→').map(s => s.trim());
  const from  = parts[0];
  const to    = parts[parts.length - 1];
  const via   = parts.length > 2 ? parts.slice(1, -1).join(' · ') : '';

  return `
    <button class="sp-back-btn sp-back-btn--nar" data-action="show-story">
      <i class="bi bi-arrow-left me-1"></i>Retour
    </button>

    <header class="sp-nar-header">
      <div class="sp-nar-route-row">
        <span class="sp-nar-city">${from}</span>
        <span class="sp-nar-arrow">
          <i class="bi bi-train-front-fill"></i>
        </span>
        <span class="sp-nar-city">${to}</span>
      </div>
      ${via ? `<div class="sp-nar-via">via ${via}</div>` : ''}
      <div class="sp-nar-byline">
        <i class="bi bi-person-circle"></i>
        <span>Par <strong>${data.author}</strong></span>
        ${data.duration ? `<span class="sp-nar-dot">·</span><i class="bi bi-clock"></i><span>${data.duration}</span>` : ''}
        ${data.price    ? `<span class="sp-nar-dot">·</span><i class="bi bi-tag"></i><span>${data.price}</span>` : ''}
      </div>
    </header>

    <article class="sp-narrative-article">
      ${data.narrative}
    </article>
  `;
}

const mapObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    mapObserver.disconnect();
    if (_storiesLoaded) initMap();
    else _mapPending = true;
  }
}, { threshold: 0.1 });

mapObserver.observe(document.getElementById('map'));
