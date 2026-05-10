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

const STORIES = {
  '250': {
    name: 'France',
    cities: [
      {
        name: 'Arcachon', icon: '<i class="bi bi-water" style="color:#5aa8cc"></i>',
        hours: '~4h30', price: 'à partir de 60 €',
        storyLink: '#',
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
        name: 'Bordeaux', icon: '<i class="bi bi-cup-hot-fill" style="color:#b83060"></i>',
        hours: '~3h30', price: 'à partir de 45 €',
        storyLink: '#',
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
        name: 'Marseille', icon: '<i class="bi bi-sun-fill" style="color:#c8960c"></i>',
        hours: '~4h30', price: 'à partir de 55 €',
        storyLink: '#',
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
        name: 'Turin', icon: '<i class="bi bi-snow" style="color:#5aa8cc"></i>',
        hours: '~5h', price: 'à partir de 70 €',
        storyLink: '#',
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
        name: 'Barcelone', icon: '<i class="bi bi-palette-fill" style="color:#b83060"></i>',
        hours: '~7h', price: 'à partir de 100 €',
        storyLink: '#',
        tips: [
          "Arrêt glace artisanale près de la gare",
        ]
      },
      {
        name: 'Madrid', icon: '<i class="bi bi-bank" style="color:#10318f"></i>',
        hours: '~9h', price: 'à partir de 120 €',
        storyLink: '#',
        tips: [
          "Arrêt café à côté de la gare",
        ]
      },
      {
        name: 'Grenade', icon: '<i class="bi bi-gem" style="color:#c8960c"></i>',
        hours: '~12h', price: 'à partir de 140 €',
        storyLink: '#',
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
        name: 'Valence', icon: '<i class="bi bi-brightness-high-fill" style="color:#c8960c"></i>',
        hours: '~9h', price: 'à partir de 100 €',
        storyLink: '#',
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
        name: 'Copenhague', icon: '<i class="bi bi-bicycle" style="color:#1c2d52"></i>',
        hours: '~10h', price: 'à partir de 100 €',
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
        name: 'Malmö', icon: '<i class="bi bi-buildings" style="color:#1c2d52"></i>',
        hours: '~10h', price: 'à partir de 100 €',
        tips: [
          "Récit à venir — partage le tien dans « Je monte à bord » !",
        ]
      },
    ]
  },

  '643': {
    name: 'Russie',
    warning: "La liaison Riga–Moscou est suspendue depuis le début de la guerre en Ukraine en 2022. Ce récit est publié dans l'espoir d'une paix durable.",
    author: 'Mathilde Gs',
    route: 'Riga → Sebej → Moscou',
    duration: '16h00',
    price: '~37,55 €',
    booking: 'ldz.lv',
    narrative: `<p><strong>À bord du Latvijas Expresis.</strong> Ce trajet était mon premier voyage en train solo, en 2017.</p><p>Départ de Riga dans l'après-midi. Je partage mon wagon avec des Russes transfrontaliers qui travaillent dans la capitale lettone. Ma première destination est la petite ville de Sebej, à un peu plus de 300 km, juste de l'autre côté de la frontière — j'y vais pour un projet de volontariat en permaculture dans un éco-lieu. Durant le trajet, je sympathise avec deux personnes : Elena, qui parle bien anglais et vit à Velikié Louki (juste après Sebej), et un homme d'une quarantaine d'années qui ne parle que russe. Elena fait l'interprète pour qu'on puisse échanger tous les trois.</p><p>Ils sont étonnés de ma présence dans ce train et s'inquiètent de me savoir seule — d'autant plus que mon heure d'arrivée à Sebej est après minuit et que je n'ai pas de nouvelles de la personne censée venir me chercher. Pendant les quelques heures passées ensemble, on échange sur nos cultures, nos vies et nos rêves. C'est le cœur lourd que je descends du train, en pleine nuit, au milieu de nulle part, avec leurs contacts notés sur un bout de papier. Presque 10 ans plus tard, j'échange encore des messages de temps à autre avec Elena, qui a été mon ange gardien.</p><p>Long story short — le projet de volontariat à Sebej n'existe pas, et je me retrouve dans une situation compliquée. Je reste environ 48h avant de booker en urgence un train de nuit pour Moscou. Malgré la réservation de dernière minute, ce train ne coûte que 37,55 € — sans l'option couchette, bien sûr. Il est tard quand j'embarque, je me trouve un bout de banquette et essaie de fermer les yeux.</p><p>À Moscou, je suis accueillie par une représentante de l'association qui m'avait envoyée à Sebej. Elle me fait visiter la ville et m'emmène dans ses endroits préférés. Je trouve la ville assez inhospitalière — tout est grand et froid, les Moscovites rencontrés aussi. La Place Rouge est tout de même très impressionnante, et je me sens chanceuse d'avoir pu la voir.</p>`,
    cities: [
      {
        name: 'Moscou', icon: '<i class="bi bi-snow2" style="color:#c8393b"></i>',
        hours: '~16h depuis Riga', price: '~37,55 €',
        tips: [
          "🔴 Place Rouge — cathédrale Saint-Basile-le-Bienheureux (splendide), le Kremlin et le mausolée de Lénine",
          "🏛 Centre commercial Goum — arcades historiques face au Kremlin",
          "🛒 Épicerie Eliseyevskiy — grands lustres et moulures, une épicerie palatiale",
          "🌇 Vue panoramique depuis le toit du Central Children's World (Square Lubyanka)",
          "🦀 Restaurant « Crousty Krab » — thème Bob l'Éponge, existait à l'époque du récit (2017)",
        ]
      },
    ]
  },

  '276': {
    name: 'Allemagne',
    cities: [
      {
        name: 'Berlin', icon: '<i class="bi bi-palette-fill" style="color:#c8393b"></i>',
        hours: '~4h depuis Bruxelles', price: 'via Varsovie ~140 €',
        tips: [
          "East Side Gallery — street art sur les vestiges du mur de Berlin, à quelques pas de la gare d'Ostbahnhof",
        ]
      },
    ]
  },

  '616': {
    name: 'Pologne',
    author: 'Mathilde Gs',
    route: 'Bruxelles → Cologne → Berlin → Varsovie',
    duration: '12h35',
    price: '~140 €',
    booking: 'Trainline',
    narrative: `<p>Je démarre tôt de Bruxelles (6h20), pour éviter les retards de la Deutsche Bahn (la compagnie ferroviaire allemande, connue pour être très peu ponctuelle). Après un rapide changement de train à Cologne, j'arrive à Berlin juste à temps pour le lunch, que je prends à la gare.</p><p>La gare d'Ostbahnhof ne se trouve qu'à quelques mètres de la « East Side Gallery » (vestiges du mur de Berlin), et je profite donc de mes 45 minutes d'attente pour aller m'y balader. Ensuite, je ne suis plus qu'à un train (5 heures) de ma destination finale. Petit bonus des trains polonais : une distribution d'eau gratuite — plate ou pétillante, au choix !</p><p>À Varsovie, j'arrive à la gare qui se trouve juste à côté du Palais de la culture et de la science (un bâtiment de style communiste, aussi appelé le cadeau controversé de Staline), direction mon hôtel capsule pour y passer le weekend !</p>`,
    cities: [
      {
        name: 'Varsovie', icon: '<i class="bi bi-buildings" style="color:#1c2d52"></i>',
        hours: '~12h35 depuis Bruxelles', price: '~140 €',
        tips: [
          "🏛 Musée de l'insurrection — incontournable, prévoir ~2h",
          "🏰 La vieille ville (Stare Miasto) — reconstituée après la Seconde Guerre mondiale, avec ses châteaux",
          "🎵 Église Sainte-Croix — le cœur de Chopin est scellé dans un pilier",
          "🏘 Praga, le vieux quartier ouvrier — de Zabkowska jusqu'à la rivière",
          "✡ Monument aux héros du ghetto, angle des rues Anielewizca et Zamenhofa",
          "🥣 Bar Zabkowski (Praga) — « bar à lait » communiste : zurek, bortsch et pierogi à prix mini",
          "🏭 Fabryka Norblina — foodcourt dans une ancienne usine réhabilitée",
          "🍩 Cukiernia Pawlowicz — les meilleurs pączki (beignets fourrés) de la ville",
          "☕ E. Wedel — chocolat chaud maison, une institution varsovienne",
          "🌇 30e étage du Palais de la culture et de la science — vue imprenable sur la ville",
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
      <div class="sp-pepites-label">Les pépites</div>
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
  return `
    <button class="sp-back-btn" data-action="show-story">
      <i class="bi bi-arrow-left me-1"></i>Retour aux pépites
    </button>
    <div class="sp-narrative-full">
      ${data.narrative}
    </div>
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
