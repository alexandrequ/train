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

const STORIES = {
  '250': {
    name: 'France',
    cities: [
      {
        name: 'Arcachon', icon: '🌊',
        tips: [
          "Observatoire Sainte-Cécile — vue sur la ville depuis cette tour de l'ère Eiffel",
          "Marché des Halles d'Arcachon + marché de la place le dimanche matin",
          "Dune du Pilat au coucher du soleil (entrée : Av. Louis Gaume & Av. des Dunes pour éviter le parking payant)",
          "Le Pique-Nique du Bassin — fruits de mer à emporter ou en terrasse",
          "Huîtres à la Teste : cabane 164 ou Le Cailloc",
          "Balade en bateau jusqu'à l'île aux Oiseaux (Union des Bateliers arcachonnais)",
        ]
      },
      {
        name: 'Bordeaux', icon: '🍷',
        tips: [
          "Huîtres et vin blanc au marché",
          "Pass musées de Bordeaux",
          "Cité du Vin + Musée du Négoce",
          "Les Halles de Bordeaux",
          "Distillerie (comprise dans le pass)",
          "Balade en bateau avec cannelés à volonté",
          "Verre à l'école de sommelier (longue file, ça vaut le coup)",
          "La Toque Cuivrée",
        ]
      },
      {
        name: 'Marseille', icon: '☀️',
        tips: [
          "Goûter les navettes — spécialité marseillaise à la fleur d'oranger",
          "Balade dans le quartier du Panier (décor de \"Plus belle la vie\")",
          "La Friche Belle de Mai — tiers-lieu culturel incontournable",
          "Terrasse du MuCEM",
          "Stand-up à Garage Comedy",
          "Terrasse à Cours Julien",
          "Notre-Dame de la Garde au coucher du soleil",
          "Randonnée Marseilleveyre → Calanque de Callelongue",
          "Le Vallon des Auffes",
        ]
      },
    ]
  },

  '380': {
    name: 'Italie',
    cities: [
      {
        name: 'Turin', icon: '🏔️',
        tips: [
          "Mont dei Cappuccini au lever du soleil (+ musée de l'alpinisme si ouvert)",
          "Architecture Liberty de l'époque + Galerie Subalpina",
          "La Pista 500 — ancienne piste d'essai Fiat reconvertie en musée à ciel ouvert, vue imprenable",
          "Musée des Antiquités Égyptiennes — un incontournable",
          "Mole Antonelliana + Musée du Cinéma (réserver longtemps à l'avance !)",
          "Le Bicerin : Café Mulassano / Café Torino / Café Al Bicerin / Café Elena",
          "Tranvia Sassi-Superga (tram à crémaillère) → Basilique di Superga + monter sur le toit",
          "Focaccia bien fournie chez Mollica",
        ]
      },
    ]
  },

  '724': {
    name: 'Espagne',
    warning: "Les trains TGV sont sécurisés depuis les attentats de Madrid en 2004. Prévoir suffisamment de temps pour les contrôles de sécurité supplémentaires.",
    cities: [
      {
        name: 'Barcelone', icon: '🌺',
        tips: [
          "Arrêt glace artisanale près de la gare",
        ]
      },
      {
        name: 'Madrid', icon: '🏛️',
        tips: [
          "Arrêt café à côté de la gare",
        ]
      },
      {
        name: 'Grenade', icon: '🕌',
        tips: [
          "Route «Dobla del Oro» le dimanche — Palacio Dal-Horra, Cuarto Santo Domingo, les bains",
          "Spa + massage + thé aux Baños de Elvira (ambiance très intimiste)",
          "Thé dans la rue des teterías",
          "Café 4 Gatos avec vue sur l'Alhambra",
          "Cafés de spécialité : Atypica · Perspective · Aora",
          "Casa Kuna — friperie & upcycling (projet social)",
          "Taller de Oda — art loufoque et féministe",
          "Piononos de Santa Fé — meilleure adresse : Dulce de Ángel",
          "Tapas : El Minauro",
          "Végétarien : El Piano (tout vegan) · Hicuri",
          "Jardins de Generalife + Alhambra — réserver très longtemps à l'avance",
          "Jardin de Carmen",
          "Sacromonte et ses maisons troglodytes (musée ethnologique)",
          "Excursion à Salobreña (bus Alsa)",
          "Mirador San Nicolás dans l'Albaïcin",
        ]
      },
      {
        name: 'Valence', icon: '🍊',
        tips: [
          "Plaza de Toros + Gare du Nord aux mosaïques d'époque",
          "Plaza de la Virgen + Cathédrale (le « vrai » Saint Graal ?)",
          "Tour El Micalet — 2 €, vue panoramique",
          "Torres de Serranos (gratuit le dimanche)",
          "Mercado Central (ferme à 15h)",
          "La Lonja de la Seda — ancienne halle marchande, très belle architecture",
          "La Estrecha — jadis l'immeuble le plus étroit d'Europe",
          "Plaza de la Redonda (tissus locaux)",
          "Quartier El Carmen (street art)",
          "CCCC — expos d'art contemporain gratuites",
          "Café del Duende — flamenco (arriver tôt, pas de réservation possible)",
          "Marché de la Tapineria",
          "Bains de l'Amiral — anciens bains turcs",
          "Musée National de la Céramique — l'extérieur vaut le déplacement",
        ]
      },
    ]
  },

  '208': {
    name: 'Danemark',
    cities: [
      {
        name: 'Copenhague', icon: '🚲',
        tips: [
          "Récit à venir — partage le tien dans « Je monte à bord » !",
        ]
      },
    ]
  },

  '752': {
    name: 'Suède',
    cities: [
      {
        name: 'Malmö', icon: '🌉',
        tips: [
          "Récit à venir — partage le tien dans « Je monte à bord » !",
        ]
      },
    ]
  },
};

// ─── MAP ──────────────────────────────────────────────────────────────────────

let mapReady = false;

function initMap() {
  if (mapReady) return;
  mapReady = true;

  const map = L.map('map', {
    scrollWheelZoom: false,
    zoomControl: true,
    attributionControl: false,
  }).setView([52, 12], 4);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 18,
  }).addTo(map);

  L.control.attribution({ position: 'bottomright' })
    .addAttribution('© <a href="https://carto.com/attributions">CARTO</a> | © <a href="https://openstreetmap.org/copyright">OSM</a>')
    .addTo(map);

  const storyPanel = document.getElementById('story-panel');
  let activeLayer  = null;

  const FILL_DEFAULT  = '#5aa8cc';   /* logo sky blue */
  const FILL_ACTIVE   = '#1746d0';   /* royal blue    */
  const FILL_INACTIVE = '#e8f4fb';   /* pale sky      */

  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(r => r.json())
    .then(world => {
      const geojson = topojson.feature(world, world.objects.countries);

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
            layer.setStyle({ fillOpacity: 1, fillColor: FILL_ACTIVE });
            renderStory(storyPanel, storyData);
          });
        },
      }).addTo(map);
    })
    .catch(() => {
      document.getElementById('map').insertAdjacentHTML('beforeend',
        '<p style="padding:1rem;color:#c00">Impossible de charger la carte. Vérifie ta connexion.</p>'
      );
    });
}

function renderStory(panel, data) {
  const warningHtml = data.warning
    ? `<div class="sp-warning">⚠️ ${data.warning}</div>`
    : '';

  const citiesHtml = data.cities.map(city => `
    <div class="sp-city">
      <div class="sp-city-name">
        <span>${city.icon}</span>
        <span>${city.name}</span>
      </div>
      <ul class="sp-city-tips">
        ${city.tips.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  panel.innerHTML = `
    <div class="sp-country">
      <div class="sp-country-name">${data.name}</div>
      ${warningHtml}
    </div>
    ${citiesHtml}
  `;
}

// Init map as soon as the map section enters the viewport
const mapObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    initMap();
    mapObserver.disconnect();
  }
}, { threshold: 0.1 });

mapObserver.observe(document.getElementById('map'));
