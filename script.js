// ─── I18N & BASE PATH ─────────────────────────────────────────────────────────
const BASE = (typeof window.RS_BASE !== 'undefined') ? window.RS_BASE : '';

// ─── UNSPLASH (hero fallback) ──────────────────────────────────────────────────
// Free key from https://unsplash.com/developers — 50 req/hour, attribution required
const UNSPLASH_KEY = '';
const T = Object.assign({
  departure:  'Départ',
  arrival:    'Arrivée',
  highlights: 'Coups de cœur',
  storyLinkLabel: 'Le récit de Mathilde →',
  back:       'Retour',
  by:         'Par',
  mapError:   'Impossible de charger la carte. Vérifie ta connexion.',
  bonsPlans:  'Bons plans',
  interrailNote: 'Couvert par le pass Interrail — valable dans 33 pays européens',
  readStory:  'Lire le récit',
}, typeof window.RS_I18N !== 'undefined' ? window.RS_I18N : {});

// ─── FORMULAIRE NATIF (Je monte à bord / All Aboard) ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const form       = document.getElementById('rs-story-form');
  const successDiv = document.getElementById('rs-form-success');
  const resetBtn   = document.getElementById('rs-form-reset');
  const submitBtn  = document.getElementById('rs-form-submit');
  const msgDiv     = document.getElementById('rs-form-msg');
  const durInput   = document.getElementById('rs-dur-input');
  const durH       = document.getElementById('rs-dur-h');
  const durM       = document.getElementById('rs-dur-m');

  if (!form) return;

  if (durInput) {
    durInput.addEventListener('change', () => {
      const m = durInput.value.match(/^(\d{1,2})[h:](\d{2})$/);
      if (m) { if (durH) durH.value = m[1]; if (durM) durM.value = m[2]; }
    });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const origLabel = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>';
    if (msgDiv) msgDiv.className = 'alert d-none mb-3';
    try {
      await fetch(form.action, { method: 'POST', body: new FormData(form), mode: 'no-cors' });
      form.style.display = 'none';
      if (successDiv) successDiv.classList.remove('d-none');
    } catch {
      if (msgDiv) {
        msgDiv.className = 'alert alert-danger mb-3';
        msgDiv.textContent = 'Une erreur s\'est produite. Envoie ton récit à contact@railstories.eu';
      }
      submitBtn.disabled = false;
      submitBtn.innerHTML = origLabel;
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset(); form.style.display = '';
      if (successDiv) successDiv.classList.add('d-none');
      if (msgDiv) msgDiv.className = 'alert d-none mb-3';
    });
  }

  const shareModal = document.getElementById('shareModal');
  if (shareModal) {
    shareModal.addEventListener('hidden.bs.modal', () => {
      form.reset(); form.style.display = '';
      if (successDiv) successDiv.classList.add('d-none');
      if (msgDiv) msgDiv.className = 'alert d-none mb-3';
    });
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
  '191':'Croatie','203':'Tchéquie','208':'Danemark','231':'Éthiopie','233':'Estonie',
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
  '428':'Lettonie','804':'Ukraine','807':'Macédoine du Nord','826':'Royaume-Uni',
  '840':'États-Unis','858':'Uruguay','704':'Viêt Nam',
};

// ─── BONS PLANS PAR PAYS ─────────────────────────────────────────────────────
let BONS_PLANS = {};
let _bonsPlansLoaded = false;

fetch(BASE + 'bons-plans.json')
  .then(r => r.ok ? r.json() : {})
  .then(data => {
    BONS_PLANS = data;
    _bonsPlansLoaded = true;
    if (_mapPending && _storiesLoaded) initMap();
  })
  .catch(() => {
    _bonsPlansLoaded = true;
    if (_mapPending && _storiesLoaded) initMap();
  });

// ─── VILLE → COORDONNÉES ──────────────────────────────────────────────────────
const CITY_TO_COORDS = {
  // Amérique du Nord
  'denver':        [39.739, -104.984],
  'san francisco': [37.774, -122.419],
  'emeryville':    [37.831, -122.285],
  'sacramento':    [38.581, -121.494],
  'chicago':       [41.878, -87.630],
  'new york':      [40.712, -74.006],
  'los angeles':   [34.052, -118.244],
  'seattle':       [47.608, -122.335],
  'portland':      [45.505, -122.675],
  // Europe
  'arosa':       [46.777, 9.678],
  'augsbourg':   [48.370, 10.898],
  'belgrade':    [44.818, 20.463],
  'berlin':      [52.520, 13.405],
  'berne':       [46.948, 7.447],
  'bilbao':      [43.263, -2.935],
  'bordeaux':    [44.838, -0.579],
  'bratislava':  [48.149, 17.108],
  'bruxelles':   [50.850, 4.352],
  'brussels':    [50.850, 4.352],
  'bâle':        [47.560, 7.589],
  'basel':       [47.560, 7.589],
  'coire':       [46.850, 9.533],
  'chur':        [46.850, 9.533],
  'cologne':     [50.933, 6.950],
  'köln':        [50.933, 6.950],
  'constance':   [47.660, 9.176],
  'konstanz':    [47.660, 9.176],
  'copenhague':  [55.676, 12.568],
  'copenhagen':  [55.676, 12.568],
  'francfort':   [50.111, 8.682],
  'frankfurt':   [50.111, 8.682],
  'grenade':     [37.177, -3.599],
  'granada':     [37.177, -3.599],
  'göteborg':    [57.709, 11.975],
  'goteborg':    [57.709, 11.975],
  'hambourg':    [53.575, 10.015],
  'hamburg':     [53.575, 10.015],
  'hendaye':     [43.357, -1.774],
  'lausanne':    [46.520, 6.632],
  'lille':       [50.629, 3.057],
  'liège':       [50.633, 5.580],
  'liege':       [50.633, 5.580],
  'ljubjlana':   [46.057, 14.506],
  'ljubljana':   [46.057, 14.506],
  'luleå':       [65.585, 22.155],
  'lulea':       [65.585, 22.155],
  'madrid':      [40.417, -3.704],
  'malmö':       [55.605, 13.004],
  'malmo':       [55.605, 13.004],
  'marseille':   [43.297, 5.370],
  'montpellier': [43.611, 3.877],
  'moscou':      [55.756, 37.617],
  'moscow':      [55.756, 37.617],
  'munich':      [48.135, 11.582],
  'münchen':     [48.135, 11.582],
  'paris':       [48.857, 2.352],
  'prague':      [50.076, 14.438],
  'riga':        [56.946, 24.106],
  'sebej':       [56.234, 28.480],
  'stockholm':   [59.329, 18.069],
  'strasbourg':  [48.573, 7.752],
  'toulouse':    [43.605, 1.444],
  'turin':       [45.070, 7.687],
  'torino':      [45.070, 7.687],
  'varsovie':    [52.230, 21.012],
  'warsaw':      [52.230, 21.012],
  'vienne':      [48.208, 16.374],
  'vienna':      [48.208, 16.374],
  'wien':        [48.208, 16.374],
  'zagreb':      [45.815, 15.982],
};

// ─── VILLE → PAYS ─────────────────────────────────────────────────────────────
const CITY_TO_COUNTRY = {
  // Belgique
  'bruxelles':'56','brussels':'56','liège':'56','liege':'56','anvers':'56','antwerp':'56','gand':'56','ghent':'56',
  // Allemagne
  'cologne':'276','köln':'276','koln':'276','hambourg':'276','hamburg':'276','berlin':'276',
  'munich':'276','münchen':'276','munchen':'276','frankfurt':'276','düsseldorf':'276','dusseldorf':'276',
  'stuttgart':'276','leipzig':'276','dresde':'276','dresden':'276','nuremberg':'276','nürnberg':'276','hanovre':'276','hannover':'276',
  // Danemark
  'copenhague':'208','copenhagen':'208','københavn':'208','aarhus':'208','odense':'208',
  // France
  'paris':'250','lille':'250','marseille':'250','lyon':'250','bordeaux':'250','toulouse':'250',
  'nice':'250','strasbourg':'250','montpellier':'250','nantes':'250','rennes':'250','grenoble':'250',
  'dijon':'250','reims':'250','metz':'250','nancy':'250',
  // Italie
  'turin':'380','torino':'380','rome':'380','roma':'380','milan':'380','milano':'380',
  'venise':'380','venezia':'380','florence':'380','firenze':'380','naples':'380','napoli':'380',
  'bologne':'380','bologna':'380','gênes':'380','genova':'380','vérone':'380','verona':'380',
  // Pologne
  'varsovie':'616','warsaw':'616','warszawa':'616','cracovie':'616','kraków':'616','krakow':'616',
  'gdansk':'616','wroclaw':'616','poznan':'616','poznań':'616',
  // Lettonie
  'riga':'428',
  // Russie
  'moscou':'643','moscow':'643','moskva':'643','sebej':'643','saint-pétersbourg':'643','saint-petersbourg':'643',
  // Suisse
  'berne':'756','bern':'756','lausanne':'756','zürich':'756','zurich':'756',
  'genève':'756','geneve':'756','geneva':'756','bâle':'756','basel':'756','lugano':'756','lucerne':'756',
  // Suède
  'stockholm':'752','göteborg':'752','goteborg':'752','malmö':'752','malmo':'752','luleå':'752','lulea':'752',
  // Espagne (Pays Basque)
  'bilbao':'724','san sebastian':'724','donostia':'724','hendaye':'250',
  // Suisse (lignes alpines)
  'coire':'756','chur':'756','arosa':'756','constance':'276','constanz':'276','konstanz':'276',
  // Pays-Bas
  'amsterdam':'528','rotterdam':'528','utrecht':'528','la haye':'528','den haag':'528',
  // Autriche
  'vienne':'40','vienna':'40','wien':'40','salzbourg':'40','salzburg':'40','innsbruck':'40','graz':'40',
  // Tchéquie
  'prague':'203','praha':'203','brno':'203',
  // Hongrie
  'budapest':'348',
  // Espagne
  'barcelone':'724','barcelona':'724','madrid':'724','valence':'724','valencia':'724',
  'grenade':'724','granada':'724','séville':'724','seville':'724','sevilla':'724','bilbao':'724',
  // Portugal
  'lisbonne':'620','lisbon':'620','porto':'620',
  // Grèce
  'athènes':'300','athens':'300','thessalonique':'300','thessaloniki':'300',
  // Roumanie
  'bucarest':'642','bucharest':'642',
  // Serbie
  'belgrade':'688','beograd':'688',
  // Bulgarie
  'sofia':'100',
  // Croatie
  'zagreb':'191','split':'191','dubrovnik':'191',
  // Slovénie
  'ljubljana':'705',
  // Slovaquie
  'bratislava':'703',
  // Lituanie
  'vilnius':'440',
  // Estonie
  'tallinn':'233',
  // Finlande
  'helsinki':'246',
  // Norvège
  'oslo':'578','bergen':'578',
  // Royaume-Uni
  'londres':'826','london':'826','edinburgh':'826','édimbourg':'826','manchester':'826','glasgow':'826',
  // Luxembourg
  'luxembourg':'442',
  // Monténégro
  'podgorica':'499',
  // Ukraine
  'kyiv':'804','kiev':'804','lviv':'804',
};

// Pays éligibles au pass Interrail global
const INTERRAIL_COUNTRIES = new Set([
  '40','56','70','100','191','203','208','233','246','250','276','826',
  '300','348','372','380','428','440','442','499','528','807',
  '578','616','620','642','688','703','705','724','752','756','792'
]);

let STORIES = {};
let STORY_INDEX = {};
let _storiesLoaded = false;
let _mapPending    = false;
let currentStoryData = null;
let _routeMap = null;
let _pendingRouteMap = null;
let activeLayer = null;
let _routeOverlays = null;
let _mapBackControl = null;

function routeCoords(route) {
  if (!route) return [];
  return route.split('→').map(s => s.trim().toLowerCase())
    .map(city => CITY_TO_COORDS[city])
    .filter(Boolean);
}

function initRouteMap(route) {
  const el = document.getElementById('sp-route-map');
  if (!el) return;
  const customPoints = currentStoryData?.routePoints;
  const coords = (customPoints && customPoints.length >= 2) ? customPoints : routeCoords(route);
  if (coords.length < 2) { el.style.display = 'none'; return; }
  if (_routeMap) { _routeMap.remove(); _routeMap = null; }
  _routeMap = L.map(el, {
    zoomControl: false, scrollWheelZoom: false,
    dragging: false, doubleClickZoom: false,
    attributionControl: false,
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(_routeMap);
  const line = L.polyline(coords, { color: '#10318f', weight: 2.5, opacity: 0.85, dashArray: '6 4' }).addTo(_routeMap);
  const markerPoints = customPoints ? [coords[0], coords[coords.length - 1]] : coords;
  markerPoints.forEach(c => {
    L.circleMarker(c, { radius: 5, fillColor: '#10318f', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(_routeMap);
  });
  _routeMap.fitBounds(line.getBounds(), { padding: [18, 18] });
}
let activeCode       = null;

function buildStoryIndex() {
  const index = {};
  Object.entries(STORIES).forEach(([slug, data]) => {
    const countryCode = data.countryCode || slug;
    if (!index[countryCode]) index[countryCode] = [];
    if (!index[countryCode].some(([s]) => s === slug)) index[countryCode].push([slug, data]);
    if (data.route) {
      const parts = data.route.split('→').map(c => c.trim().toLowerCase());
      const depCountry = CITY_TO_COUNTRY[parts[0]] || countryCode;
      const arrCountry = CITY_TO_COUNTRY[parts[parts.length - 1]] || countryCode;
      if (depCountry !== countryCode) {
        if (!index[depCountry]) index[depCountry] = [];
        if (!index[depCountry].some(([s]) => s === slug)) index[depCountry].push([slug, data]);
      }
      parts.forEach(city => {
        const cc = CITY_TO_COUNTRY[city];
        if (cc && cc !== countryCode && cc !== depCountry && cc !== arrCountry) {
          if (!index[cc]) index[cc] = [];
          if (!index[cc].some(([s]) => s === slug)) index[cc].push([slug, data]);
        }
      });
    }
  });
  return index;
}

if (!window.RS_STORY_PAGE) {
  fetch(BASE + 'stories/index.json')
    .then(r => r.json())
    .then(codes => Promise.all(
      codes.map(code =>
        fetch(BASE + `stories/${code}.json`).then(r => r.json()).then(data => [code, data])
      )
    ))
    .then(entries => {
      STORIES = Object.fromEntries(entries);
      STORY_INDEX = buildStoryIndex();
      _storiesLoaded = true;
      if (_mapPending && _bonsPlansLoaded) initMap();
      renderRecitsSection();
      openStoryFromHash();
    })
    .catch(() => console.error('Impossible de charger les récits'));
}

// ─── DEEP LINK ────────────────────────────────────────────────────────────────

function openStoryFromHash() {
  const code = new URLSearchParams(window.location.search).get('story');
  if (!code) return;
  window.location.replace(`histoire/?story=${code}`);
}

// ─── MAP ──────────────────────────────────────────────────────────────────────

function showCountryRoutes(map, storiesForCode) {
  if (_routeOverlays) { _routeOverlays.remove(); _routeOverlays = null; }
  _routeOverlays = L.layerGroup().addTo(map);
  storiesForCode.forEach(([slug, data]) => {
    const coords = (data.routePoints && data.routePoints.length >= 2)
      ? data.routePoints : routeCoords(data.route);
    if (coords.length < 2) return;
    const parts = (data.route || data.name).split('→').map(s => s.trim());
    const label = `${parts[0]} → ${parts[parts.length - 1]}`;
    L.polyline(coords, { color: '#10318f', weight: 3, opacity: 0.85, dashArray: '6 4' }).addTo(_routeOverlays);
    L.polyline(coords, { color: 'transparent', weight: 20, opacity: 0.001 })
      .bindTooltip(label, { sticky: true, className: 'rs-tooltip' })
      .on('click', () => { window.location.href = `${BASE}histoire/?story=${slug}`; })
      .addTo(_routeOverlays);
    [coords[0], coords[coords.length - 1]].forEach(c => {
      L.circleMarker(c, { radius: 5, fillColor: '#10318f', color: '#fff', weight: 2, fillOpacity: 1 })
        .on('click', () => { window.location.href = `${BASE}histoire/?story=${slug}`; })
        .addTo(_routeOverlays);
    });
  });
}

function showMapBack(map) {
  if (_mapBackControl) return;
  _mapBackControl = L.control({ position: 'topleft' });
  _mapBackControl.onAdd = () => {
    const div = L.DomUtil.create('div', 'rs-map-back-btn');
    div.innerHTML = '<i class="bi bi-arrow-left"></i> Retour';
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.on(div, 'click', () => {
      if (_routeOverlays) { _routeOverlays.remove(); _routeOverlays = null; }
      map.setView([52, 12], 3, { animate: true });
      if (activeLayer) {
        activeLayer.setStyle({ fillOpacity: 0.65, fillColor: '#c8960c' });
        activeLayer = null; activeCode = null;
      }
      _mapBackControl.remove(); _mapBackControl = null;
    });
    return div;
  };
  _mapBackControl.addTo(map);
}

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
  }).setView([52, 12], 3);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 18,
    noWrap: true,
  }).addTo(map);

  L.control.attribution({ position: 'bottomright' })
    .addAttribution('© <a href="https://carto.com/attributions">CARTO</a> | © <a href="https://openstreetmap.org/copyright">OSM</a>')
    .addTo(map);

  // Force Leaflet to recalculate container size then re-center
  requestAnimationFrame(() => {
    map.invalidateSize({ pan: false });
    map.setView([52, 12], 3, { animate: false });
  });

  const FILL_DEFAULT  = '#c8960c';   /* dark yellow — récits et bons plans */
  const FILL_ACTIVE   = '#8a6500';   /* deeper yellow — actif   */
  const FILL_INACTIVE = '#e0e0e0';   /* light grey              */
  const FILL_TIPS     = '#c8960c';   /* same yellow — bons plans */
  const FILL_TIPS_ACT = '#8a6500';   /* same active — bons plans */

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
          const code     = String(Number(feature.id));
          const hasStory = (STORY_INDEX[code] || []).length > 0;
          const hasTips  = !hasStory && (!!BONS_PLANS[code] || INTERRAIL_COUNTRIES.has(code));
          return {
            fillColor:   hasStory ? FILL_DEFAULT : hasTips ? FILL_TIPS : FILL_INACTIVE,
            fillOpacity: hasStory ? 0.65 : hasTips ? 0.65 : 0.3,
            color:       '#ffffff',
            weight:      0.7,
          };
        },

        onEachFeature(feature, layer) {
          const code            = String(Number(feature.id));
          const storiesForCode  = STORY_INDEX[code] || [];
          const hasTips         = !!BONS_PLANS[code] || INTERRAIL_COUNTRIES.has(code);

          if (!storiesForCode.length && !hasTips) {
            layer.options.interactive = false;
            return;
          }

          const tipsOnly  = !storiesForCode.length && hasTips;
          const fillDef   = tipsOnly ? FILL_TIPS    : FILL_DEFAULT;
          const fillAct   = tipsOnly ? FILL_TIPS_ACT : FILL_ACTIVE;
          const fillOpDef = 0.65;

          const countryName = COUNTRY_NAMES[code] || code;
          const storyCount  = storiesForCode.length;
          const tipsCount   = (BONS_PLANS[code] || []).length + (INTERRAIL_COUNTRIES.has(code) ? 1 : 0);
          const iconParts   = [];
          if (storyCount > 0) iconParts.push(`<span class="rs-tt-icon rs-tt-story"><i class="bi bi-book"></i> ${storyCount}</span>`);
          if (tipsCount  > 0) iconParts.push(`<span class="rs-tt-icon rs-tt-tips"><i class="bi bi-tag"></i> ${tipsCount}</span>`);
          layer.bindTooltip(
            `<span class="rs-tt-name">${countryName}</span>${iconParts.length ? `<span class="rs-tt-icons">${iconParts.join('')}</span>` : ''}`,
            { sticky: true, direction: 'top', offset: [0, -4], className: 'rs-tooltip' }
          );

          layer.on('mouseover', () => { if (layer !== activeLayer) layer.setStyle({ fillOpacity: 0.85, fillColor: fillAct }); });
          layer.on('mouseout',  () => { if (layer !== activeLayer) layer.setStyle({ fillOpacity: fillOpDef, fillColor: fillDef }); });

          layer.on('click', () => {
            if (activeLayer && activeLayer !== layer) {
              const prevTipsOnly = !(STORY_INDEX[activeCode] || []).length && (!!BONS_PLANS[activeCode] || INTERRAIL_COUNTRIES.has(activeCode));
              activeLayer.setStyle({
                fillOpacity: prevTipsOnly ? 0.55 : 0.65,
                fillColor:   prevTipsOnly ? FILL_TIPS : FILL_DEFAULT,
              });
            }
            activeLayer = layer;
            activeCode  = code;
            layer.setStyle({ fillOpacity: 1, fillColor: fillAct });

            if (storiesForCode.length) {
              map.fitBounds(layer.getBounds(), { padding: [40, 40], maxZoom: 6 });
              showCountryRoutes(map, storiesForCode);
              showMapBack(map);
            } else {
              document.getElementById('storyModalTitle').textContent = countryName;
              currentStoryData = null;
              document.getElementById('storyModalBody').innerHTML = renderBonsPlansOnly(code);
              bootstrap.Modal.getOrCreateInstance(document.getElementById('storyModal')).show();
            }
          });
        },
      }).addTo(map);
    })
    .catch(() => {
      document.getElementById('map').insertAdjacentHTML('beforeend',
        `<p style="padding:1rem;color:#c00">${T.mapError}</p>`
      );
    });

}

// ─── MODAL LISTENERS (indépendants de la carte) ───────────────────────────────
const _storyModalEl = document.getElementById('storyModal');
if (_storyModalEl) {
  _storyModalEl.addEventListener('shown.bs.modal', () => {
    if (_pendingRouteMap) {
      initRouteMap(_pendingRouteMap);
      _pendingRouteMap = null;
    }
  });

  _storyModalEl.addEventListener('hidden.bs.modal', () => {
    if (activeLayer) {
      const wasTipsOnly = !(STORY_INDEX[activeCode] || []).length && (!!BONS_PLANS[activeCode] || INTERRAIL_COUNTRIES.has(activeCode));
      activeLayer.setStyle({
        fillOpacity: wasTipsOnly ? 0.55 : 0.65,
        fillColor:   wasTipsOnly ? '#c8960c' : '#c8960c',
      });
      activeLayer = null;
      activeCode  = null;
    }
    currentStoryData = null;
    if (_routeMap) { _routeMap.remove(); _routeMap = null; }
    history.replaceState(null, '', '#carte');
  });

  document.getElementById('storyModalBody').addEventListener('click', e => {
    // Lightbox photo
    const photoEl = e.target.closest('.sp-photo');
    if (photoEl) {
      const gallery = photoEl.closest('.sp-photos');
      if (gallery) openLightbox(JSON.parse(gallery.dataset.photos || '[]'), parseInt(photoEl.dataset.idx, 10));
      return;
    }
    // Niveau 1 → page récit (navigation)
    const listItem = e.target.closest('.sp-story-list-item');
    if (listItem && !e.target.closest('[data-action]') && !e.target.closest('a[href]')) {
      const storyCode = listItem.dataset.storyCode;
      window.location.href = `histoire/?story=${storyCode}`;
      return;
    }
    // Niveau 2 → Niveau 1 : bouton retour (kept for renderStory context)
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'show-level1') {
      currentStoryData = null;
      history.replaceState(null, '', '#carte');
      document.getElementById('storyModalTitle').textContent = COUNTRY_NAMES[activeCode] || activeCode;
      document.getElementById('storyModalBody').innerHTML = renderLevel1(activeCode, STORY_INDEX[activeCode] || []);
    }
  });
}

function buildTicketCard(data, storyCode, countryCode) {
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
  const storyHomeCountry = String(data.countryCode || storyCode);
  const depCountry = data.route
    ? (CITY_TO_COUNTRY[data.route.split('→')[0].trim().toLowerCase()] || storyHomeCountry)
    : storyHomeCountry;
  const isTransit = countryCode && storyHomeCountry !== String(countryCode) && String(countryCode) !== depCountry;
  const countryName = COUNTRY_NAMES[countryCode] || '';
  return `
  <div class="sp-journey-card">
    <div class="sp-ticket-main">
      <div class="sp-ticket-route-row">
        <div class="sp-ticket-station">
          <div class="sp-ticket-label">${T.departure}</div>
          <div class="sp-ticket-city">${from}</div>
        </div>
        <div class="sp-ticket-connector">
          <div class="sp-ticket-dash"></div>
          <i class="bi bi-train-front-fill sp-ticket-train"></i>
          <div class="sp-ticket-dash"></div>
        </div>
        <div class="sp-ticket-station" style="text-align:right">
          <div class="sp-ticket-label">${T.arrival}</div>
          <div class="sp-ticket-city">${to}</div>
        </div>
      </div>
      ${via ? `<div class="sp-ticket-via">${via}</div>` : ''}
      ${data.author ? `<div class="sp-ticket-passenger"><i class="bi bi-person-fill"></i>${data.author}</div>` : ''}
      ${isTransit ? `<div class="sp-ticket-transit"><i class="bi bi-arrow-left-right me-1"></i>Escale en ${countryName}</div>` : ''}
    </div>
    <div class="sp-ticket-sep">
      <div class="sp-notch sp-notch--t"></div>
      <div class="sp-notch sp-notch--b"></div>
    </div>
    <div class="sp-ticket-stub">
      ${data.duration ? `<div class="sp-ticket-info"><i class="bi bi-clock"></i>${data.duration}</div>` : ''}
      ${data.price    ? `<div class="sp-ticket-info"><i class="bi bi-tag"></i>${data.price}</div>`     : ''}
      ${bookingUrl    ? `<a href="${bookingUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()" class="sp-ticket-book" style="pointer-events:auto"><i class="bi bi-box-arrow-up-right"></i>${bookingLabel}</a>` : ''}
    </div>
  </div>`;
}

// Niveau 1 : billets de train + bons plans
function renderLevel1(countryCode, stories) {
  const tickets = stories.map(([storyCode, data]) => `
    <div class="sp-story-list-item" data-story-code="${storyCode}" role="button" tabindex="0" style="margin-bottom:0.75rem;cursor:pointer">
      <div style="pointer-events:none">${buildTicketCard(data, storyCode, countryCode)}</div>
    </div>`
  ).join('');
  return `${tickets}${renderBonsPlansSection(countryCode)}`;
}

function photoGalleryHtml(subset) {
  if (!subset.length) return '';
  return `<div class="sp-photos" data-photos='${JSON.stringify(subset)}'>
    ${subset.map((url, i) => `<img class="sp-photo" src="${BASE}${url}" alt="" data-idx="${i}" loading="lazy">`).join('')}
  </div>`;
}

function injectPhotoMarkers(html, photos) {
  if (!photos || !photos.length) return html;
  return html.replace(/<div[^>]*data-photo-insert="([^"]*)"[^>]*><\/div>/g, (_, indices) => {
    const subset = indices.split(',').map(s => photos[parseInt(s.trim(), 10)]).filter(Boolean);
    return photoGalleryHtml(subset);
  });
}

function photosHtml(data) {
  const photos = data.photos || [];
  if (!photos.length) return '';
  return photoGalleryHtml(photos);
}

function openLightbox(photos, startIdx) {
  if (!photos.length) return;
  let current = startIdx;
  const overlay = document.createElement('div');
  overlay.className = 'sp-lightbox';
  overlay.innerHTML = `
    <button class="sp-lb-close">×</button>
    ${photos.length > 1 ? '<button class="sp-lb-prev">&#8249;</button>' : ''}
    <img class="sp-lb-img" alt="">
    ${photos.length > 1 ? '<button class="sp-lb-next">&#8250;</button>' : ''}
    ${photos.length > 1 ? '<div class="sp-lb-count"></div>' : ''}
  `;
  const img   = overlay.querySelector('.sp-lb-img');
  const count = overlay.querySelector('.sp-lb-count');
  const update = () => {
    img.src = BASE + photos[current];
    if (count) count.textContent = `${current + 1} / ${photos.length}`;
  };
  update();
  overlay.querySelector('.sp-lb-close').onclick = () => overlay.remove();
  overlay.querySelector('.sp-lb-prev')?.addEventListener('click', e => { e.stopPropagation(); current = (current - 1 + photos.length) % photos.length; update(); });
  overlay.querySelector('.sp-lb-next')?.addEventListener('click', e => { e.stopPropagation(); current = (current + 1) % photos.length; update(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  const onKey = e => {
    if (!document.body.contains(overlay)) { document.removeEventListener('keydown', onKey); return; }
    if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKey); }
    if (e.key === 'ArrowLeft'  && photos.length > 1) { current = (current - 1 + photos.length) % photos.length; update(); }
    if (e.key === 'ArrowRight' && photos.length > 1) { current = (current + 1) % photos.length; update(); }
  };
  document.addEventListener('keydown', onKey);
  document.body.appendChild(overlay);
}

function highlightsHtml(data) {
  const items = data.highlights || [];
  if (!items.length) return '';
  return `<div class="sp-pepites-label"><i class="bi bi-heart me-1"></i>${T.highlights}</div>
    <ul class="sp-city-tips">${items.map(t => `<li>${t}</li>`).join('')}</ul>`;
}

// Niveau 2 : récit + coups de cœur
function renderLevel2(data) {
  return `
    <button class="sp-back-btn sp-back-btn--nar" data-action="show-level1">
      <i class="bi bi-arrow-left me-1"></i>${T.back}
    </button>
    ${data.warning ? `<div class="sp-warning">⚠️ ${data.warning}</div>` : ''}
    ${data.route ? '<div id="sp-route-map" class="sp-route-map"></div>' : ''}
    ${data.narrative ? `<article class="sp-narrative-article">${data.narrative}</article>` : ''}
    ${photosHtml(data)}
    ${highlightsHtml(data)}`;
}

// Utilisé depuis le wagon des bons plans (hors carte)
function renderStory(data, code) {
  return `
    ${data.warning ? `<div class="sp-warning">⚠️ ${data.warning}</div>` : ''}
    ${buildTicketCard(data, code, null)}
    ${data.route ? '<div id="sp-route-map" class="sp-route-map"></div>' : ''}
    ${data.narrative ? `<article class="sp-narrative-article">${data.narrative}</article>` : ''}
    ${photosHtml(data)}
    ${highlightsHtml(data)}
    ${code ? renderBonsPlansSection(code) : ''}`;
}

function renderBonsPlansSection(code) {
  const tips       = BONS_PLANS[code] || [];
  const isInterrail = INTERRAIL_COUNTRIES.has(code);
  if (!tips.length && !isInterrail) return '';

  const tipsHtml = tips.map(t => `
    <a href="${t.url}" target="_blank" rel="noopener" class="sp-tip-card">
      <div class="sp-tip-strip"><i class="bi bi-tag-fill"></i></div>
      <div class="sp-tip-body">
        <span class="sp-tip-label">${t.label}</span>
        <p class="sp-tip-desc">${t.desc}</p>
      </div>
      <i class="bi bi-chevron-right sp-tip-arrow"></i>
    </a>
  `).join('');

  const interrailHtml = isInterrail ? `
    <a href="https://www.interrail.eu/fr" target="_blank" rel="noopener" class="sp-tip-card sp-tip-card--interrail">
      <div class="sp-tip-strip"><i class="bi bi-globe2"></i></div>
      <div class="sp-tip-body">
        <span class="sp-tip-label">Pass Interrail</span>
        <p class="sp-tip-desc">${T.interrailNote}.</p>
      </div>
      <i class="bi bi-chevron-right sp-tip-arrow"></i>
    </a>
  ` : '';

  return `
    <div class="sp-bonsplans-divider">
      <span>🏷️ ${T.bonsPlans}</span>
    </div>
    <div class="sp-tips-list">
      ${tipsHtml}
      ${interrailHtml}
    </div>
  `;
}

function renderBonsPlansOnly(code) {
  const section = renderBonsPlansSection(code);
  if (!section) return `<p class="text-muted small">${COUNTRY_NAMES[code] || code}</p>`;
  return section;
}

function renderRecitsSection() {
  const list = document.getElementById('recits-list');
  if (!list) return;

  const entries = Object.entries(STORIES).filter(([, data]) =>
    data.cities?.some(c =>
      c.tips?.some(t => t.trim() && !t.includes('Récit à venir'))
    )
  );

  if (!entries.length) {
    list.innerHTML = '<p class="text-muted">Aucun récit pour le moment.</p>';
    return;
  }

  list.innerHTML = entries.map(([code, data]) => {
    const citiesHtml = data.cities.map(city => {
      const tips = city.tips
        .flatMap(t => t.split('\n').filter(s => s.trim()))
        .filter(t => !t.includes('Récit à venir'));
      if (!tips.length) return '';
      return `
        <div class="sp-city">
          <div class="sp-city-name">
            <span>${city.icon}</span>
            <span>${city.name}</span>
            ${city.hours ? `<span class="sp-city-meta">(${city.hours} · ${city.price})</span>` : ''}
          </div>
          <div class="sp-pepites-label"><i class="bi bi-heart me-1"></i>${T.highlights}</div>
          <ul class="sp-city-tips">
            ${tips.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>`;
    }).join('');

    if (!citiesHtml.trim()) return '';

    const warningHtml = data.warning
      ? `<div class="sp-warning">⚠️ ${data.warning}</div>` : '';

    return `
      <div class="card rs-bento-card mb-4 p-0">
        <div class="card-body p-4 p-lg-5">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <h3 class="rs-bp-heading mb-0">${data.name}</h3>
            ${data.narrative ? `<button class="btn btn-warning btn-sm rounded-pill fw-bold rs-open-story" data-story-code="${code}"><i class="bi bi-book me-1"></i>${T.readStory}</button>` : ''}
          </div>
          ${warningHtml}
          <div class="sp-country">${citiesHtml}</div>
        </div>
      </div>`;
  }).filter(Boolean).join('');

  list.querySelectorAll('.rs-open-story').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = `histoire/?story=${btn.dataset.storyCode}`;
    });
  });
}

const mapObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    mapObserver.disconnect();
    if (_storiesLoaded && _bonsPlansLoaded) initMap();
    else _mapPending = true;
  }
}, { threshold: 0.1 });

const _mapEl = document.getElementById('map');
if (_mapEl) mapObserver.observe(_mapEl);

// ─── PAGE RÉCIT ──────────────────────────────────────────────────────────────

async function applyStoryHero(heroEl, photoSrc, unsplashPhoto) {
  if (!heroEl) return;
  if (photoSrc) {
    heroEl.style.backgroundImage = `url(${photoSrc})`;
    heroEl.classList.add('sp-hero-has-image');
    return;
  }
  if (!unsplashPhoto) return;
  heroEl.style.backgroundImage = `url(${unsplashPhoto.urls.regular})`;
  heroEl.classList.add('sp-hero-has-image');
  const credit = heroEl.querySelector('.sp-hero-credit');
  if (credit) {
    const pUrl  = `${unsplashPhoto.user.links.html}?utm_source=railstories&utm_medium=referral`;
    const uUrl  = 'https://unsplash.com/?utm_source=railstories&utm_medium=referral';
    credit.innerHTML = `Photo : <a href="${pUrl}" target="_blank" rel="noopener">${unsplashPhoto.user.name}</a> / <a href="${uUrl}" target="_blank" rel="noopener">Unsplash</a>`;
    credit.hidden = false;
  }
}

async function fetchUnsplashPhoto(query) {
  if (!UNSPLASH_KEY) return null;
  try {
    const r = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${UNSPLASH_KEY}`
    );
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

async function initStoryPage() {
  const code = new URLSearchParams(window.location.search).get('story');
  const contentEl = document.getElementById('sp-story-content');
  const titleEl   = document.getElementById('sp-story-title');
  if (!code || !contentEl) return;

  try {
    const [data, bonsPlans] = await Promise.all([
      fetch(BASE + `stories/${code}.json`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(BASE + 'bons-plans.json').then(r => r.ok ? r.json() : {}).catch(() => ({})),
    ]);

    BONS_PLANS = bonsPlans;
    currentStoryData = data;

    const countryCode = String(data.countryCode || code.split('-')[0]);
    const parts = (data.route || data.name).split('→').map(s => s.trim());
    const routeTitle = `${parts[0]} → ${parts[parts.length - 1]}`;

    document.title = `${routeTitle} — Rail Stories`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && data.narrative) {
      metaDesc.content = data.narrative.replace(/<[^>]*>/g, '').trim().slice(0, 160);
    }
    if (titleEl) titleEl.textContent = routeTitle;

    // Hero background: story photo → Unsplash fallback
    const heroEl = document.querySelector('.sp-story-hero');
    const storyPhoto = data.heroPhoto ? BASE + data.heroPhoto : (data.photos && data.photos[0] ? BASE + data.photos[0] : null);
    const unsplashQuery = `train travel ${parts[parts.length - 1]} ${COUNTRY_NAMES[countryCode] || ''}`.trim();
    const unsplashPhoto = storyPhoto ? null : await fetchUnsplashPhoto(unsplashQuery);
    applyStoryHero(heroEl, storyPhoto, unsplashPhoto);

    // Hero: byline
    const bylineEl = document.getElementById('sp-story-byline');
    const country = COUNTRY_NAMES[countryCode] || '';
    if (bylineEl) {
      bylineEl.textContent = [data.author ? `${T.by} ${data.author}` : '', country].filter(Boolean).join(' · ');
    }

    // Hero: stats chips (duration · price · booking)
    const statsEl = document.getElementById('sp-story-stats');
    if (statsEl) {
      const chips = [];
      if (data.duration) chips.push(`<span class="sp-stat"><i class="bi bi-clock"></i>${data.duration}</span>`);
      if (data.price)    chips.push(`<span class="sp-stat"><i class="bi bi-tag"></i>${data.price}</span>`);
      if (data.booking) {
        const bUrl   = data.booking.startsWith('http') ? data.booking : `https://www.${data.booking.toLowerCase().replace(/\s/g,'')}.com`;
        const bLabel = data.booking.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
        chips.push(`<a href="${bUrl}" target="_blank" rel="noopener" class="sp-stat"><i class="bi bi-box-arrow-up-right"></i>${bLabel}</a>`);
      }
      statsEl.innerHTML = chips.join('');
    }

    // Sidebar: route map + key facts card
    const asideEl = document.getElementById('sp-story-aside');
    if (asideEl) {
      const bUrl   = data.booking && data.booking.startsWith('http') ? data.booking : data.booking ? `https://www.${data.booking.toLowerCase().replace(/\s/g,'')}.com` : null;
      const bLabel = bUrl ? bUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : null;
      const hasFacts = data.duration || data.price || bUrl;

      asideEl.innerHTML = `
        ${data.route ? '<div id="sp-route-map" class="sp-route-map"></div>' : ''}
        ${hasFacts ? `
          <div class="sp-aside-card">
            ${data.duration ? `<div class="sp-aside-stat"><i class="bi bi-clock"></i><span>${data.duration}</span></div>` : ''}
            ${data.price    ? `<div class="sp-aside-stat"><i class="bi bi-tag"></i><span>${data.price}</span></div>` : ''}
            ${bUrl          ? `<a href="${bUrl}" target="_blank" rel="noopener" class="sp-aside-stat"><i class="bi bi-box-arrow-up-right"></i><span>${bLabel}</span></a>` : ''}
          </div>` : ''}
        ${highlightsHtml(data)}
        ${renderBonsPlansSection(countryCode)}
      `;
    }

    // Main article content
    contentEl.innerHTML = `
      ${data.warning ? `<div class="sp-warning">⚠️ ${data.warning}</div>` : ''}
      ${data.narrative ? `<article class="sp-narrative-article">${data.narrative}</article>` : ''}
      ${photosHtml(data)}
    `;

    if (data.route) requestAnimationFrame(() => initRouteMap(data.route));

    contentEl.addEventListener('click', e => {
      const photoEl = e.target.closest('.sp-photo');
      if (photoEl) {
        const gallery = photoEl.closest('.sp-photos');
        if (gallery) openLightbox(JSON.parse(gallery.dataset.photos || '[]'), parseInt(photoEl.dataset.idx, 10));
      }
    });
  } catch {
    if (contentEl) contentEl.innerHTML = '<p class="text-muted py-5 text-center">Récit introuvable.</p>';
  }
}
