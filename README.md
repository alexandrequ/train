# Rail Stories

Site statique pour `railstories.eu`: récits de voyage en train, wagon des bons plans, carte interactive et formulaire de contribution intégré.

## Développement

Lancer un petit serveur local pour que la carte GeoJSON se charge correctement:

```sh
python3 -m http.server 8765
```

Puis ouvrir `http://127.0.0.1:8765/index.html`.

## À compléter avant mise en ligne

- Remplacer les placeholders des pages légales: responsable de publication, email de contact, hébergeur.
- Confirmer l'adresse email publique dans la section Contact.
- Ajouter le fichier de police Tufuli Arabic dans `fonts/` si la licence le permet, puis déclarer le `@font-face` dans `styles.css`.
