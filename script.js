const tabs = [...document.querySelectorAll('.tab')];
const panels = [...document.querySelectorAll('.panel')];

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => item.classList.remove('is-active'));
    panels.forEach((panel) => panel.classList.remove('is-active'));

    tab.classList.add('is-active');
    const targetPanel = document.getElementById(tab.dataset.tab);
    if (targetPanel) {
      targetPanel.classList.add('is-active');
    }
  });
});

const mapInfo = document.getElementById('map-info');

const map = L.map('map', {
  scrollWheelZoom: false,
  zoomControl: true,
}).setView([47.4, 6.2], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 18,
}).addTo(map);

const offersByCountry = [
  {
    label: 'Europe (Interrail)',
    coords: [50.5, 10.2],
    color: '#0b7285',
    html: `
      <strong>Interrail (Europe)</strong><br>
      Ce pass n'est pas réservé aux jeunes. Astuce: l'acheter pendant les promos (souvent 2 fois/an).<br>
      <a href="https://www.interrail.eu/fr" target="_blank" rel="noopener noreferrer">Site Interrail</a><br>
      <a href="https://www.interrail.eu/en/interrail-passes/deals" target="_blank" rel="noopener noreferrer">Promotions Interrail</a>
    `,
  },
  {
    label: 'France',
    coords: [46.2, 2.2],
    color: '#087f5b',
    html: `
      <strong>Carte Avantage SNCF</strong><br>
      <a href="https://www.sncf-connect.com/app/catalogue" target="_blank" rel="noopener noreferrer">Voir la carte</a>
    `,
  },
  {
    label: 'Belgique',
    coords: [50.8, 4.4],
    color: '#e67700',
    html: `
      <strong>Train+ (SNCB)</strong><br>
      <a href="https://www.belgiantrain.be/fr/tickets-and-railcards" target="_blank" rel="noopener noreferrer">Voir les offres</a>
    `,
  },
  {
    label: 'Suisse',
    coords: [46.8, 8.2],
    color: '#c92a2a',
    html: `
      <strong>Demi-tarif CFF</strong><br>
      <a href="https://www.sbb.ch/fr/abonnements-et-billets/abonnements/demi-tarif.html" target="_blank" rel="noopener noreferrer">Voir l'offre</a>
    `,
  },
  {
    label: 'Italie',
    coords: [42.8, 12.5],
    color: '#2b8a3e',
    html: `
      <strong>Pass d'été régional (Italia in Tour)</strong><br>
      <a href="https://www.trenitalia.com/it/offerte_e_servizi/italia-in-tour.html" target="_blank" rel="noopener noreferrer">Voir l'offre</a>
    `,
  },
  {
    label: 'Reservations Interrail',
    coords: [48.2, 2.3],
    color: '#5f3dc4',
    html: `
      <strong>Réservations sièges/couchettes</strong><br>
      <a href="https://www.raileurope.com/en-us/help/rail-passes/interrail-pass/how-do-i-book-seats-for-my-interrail-pass-trip" target="_blank" rel="noopener noreferrer">Rail Europe</a>
    `,
  },
];

offersByCountry.forEach((entry) => {
  const marker = L.circleMarker(entry.coords, {
    radius: 9,
    color: '#fff',
    weight: 2,
    fillColor: entry.color,
    fillOpacity: 0.95,
  }).addTo(map);

  marker.bindPopup(entry.html);

  marker.on('click', () => {
    mapInfo.innerHTML = `<strong>${entry.label}</strong><br>${entry.html}`;
  });
});

mapInfo.innerHTML =
  'Sélectionne un pays sur la carte pour voir le bon plan correspondant et accéder au lien.';
