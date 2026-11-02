# Portfolio + Packs de Sauce

Un site statique en HTML, CSS et JS, sans framework ni build. Tout le contenu se trouve dans le dossier `content/`, et le code n'a jamais besoin d'être touché pour ajouter une création, un jeu ou un pack.

```
index.html          la page (Portfolio + Packs, on passe de l'une à l'autre avec #packs)
css/style.css       le design
js/app.js           lit content/*.json et construit la page
content/
  profile.json      nom, stat 550M+, about, réseaux, dispo, couleurs
  creations.json    la grille Work (render + wireframe + tris)
  contributions.json  les jeux
  packs.json        la boutique (le pack avec "featured": true passe en haut)
  shop.json         l'intro de la boutique, les étapes d'achat et la FAQ
media/              les images
.pages.yml          la config de Pages CMS (édition sans code)
```

## 1. Mettre en ligne (GitHub Pages, gratuit)

1. Crée un repo GitHub nommé **`<pseudo-github>.github.io`**, par exemple `sauce741.github.io`, pour avoir l'URL la plus propre.
2. Upload tout le contenu de ce dossier à la racine du repo, y compris `.pages.yml` et `.nojekyll`.
3. Va dans **Settings → Pages → Build and deployment → Source : Deploy from a branch**, puis choisis la branche `main` et le dossier `/ (root)`.
4. Le site est en ligne au bout d'environ une minute sur `https://<pseudo-github>.github.io`.

Pour un domaine perso (ex. `sauce741.com`) : achète-le, puis renseigne-le dans **Settings → Pages → Custom domain** et coche **Enforce HTTPS**.

> En local, ouvrir `index.html` en double-cliquant ne marche pas, parce que le navigateur bloque la lecture des JSON. Lance plutôt `python -m http.server` dans le dossier, puis ouvre http://localhost:8000.

## 2. Modifier le site sans code (Pages CMS)

1. Va sur https://app.pagescms.org et connecte-toi avec GitHub.
2. Choisis le repo. Tu tombes sur des formulaires : **Créations**, **Jeux**, **Packs**, **Texte de la boutique**, **Profil, contact et couleurs**.
3. Ajoute ou modifie ce que tu veux, upload les images, puis clique sur **Save**. Le site se met à jour tout seul une minute plus tard.

Tu peux aussi éditer directement les `.json` sur github.com (icône crayon).

## 3. Ce qu'il faut remplacer (templates)

- **Créations** : les 8 modèles low-poly sont des placeholders. Pour chaque pièce, mets l'image (`cover`), le nombre de **tris**, les textures et les logiciels. Ajoute une vidéo `.mp4` si tu as une turntable (courte, sans son, moins de 10 Mo).
- **Jeux** : `Game Title 1..4` sont des templates. Mets le vrai nom, le studio, **ce que tu as fait précisément**, les visites, le CCU, une miniature 16:9 et le lien Roblox.
- **About** : le 2e paragraphe est à réécrire.
- **Packs** : le pack coché « Pack vedette » s'affiche en grand en haut de la page Packs : image en 16:9 à gauche, infos et paiement à droite. Pour tous : noms, prix, images et surtout `paypalUrl` et `robuxUrl`. Tant qu'un lien est vide, le bouton affiche « This payment link isn't set up yet. » au lieu de casser.

## 4. Paiements

Le site ne gère pas l'argent lui-même : chaque bouton envoie vers ta plateforme.

- **PayPal** : un lien produit Payhip, Gumroad ou autre, avec livraison automatique du fichier.
- **Robux** : le lien de ton hub ou de ton système habituel.

## 5. Changer les couleurs

Il y a deux thèmes : `theme` pour le portfolio (dégradé bleu clair, boutons bleu ciel) et `packsTheme` pour la page Packs (noir/violet). Tu les modifies dans Pages CMS → **Profil**, ou dans `content/profile.json` :

```json
"theme":      { "background": "#eef7ff", "surface": "#ffffff", "text": "#0c2238", "accent": "#1592d4", "button": "#2aa7ea", "heroFrom": "#b5defd", "heroTo": "#e1f1ff" },
"packsTheme": { "background": "#0b0910", "surface": "#16121f", "text": "#efeaff", "accent": "#a47cff" }
```

Toutes les autres teintes (fonds teintés, bordures, grille, boutons) sont calculées à partir de ces couleurs, donc tout reste cohérent. Pour changer les polices, il faut modifier les 3 variables `--f-display` (nom et titres, Bricolage Grotesque), `--f-body` (texte, Geist) et `--f-mono` (petits labels, Geist Mono) en haut de `css/style.css`.

## Scroll fluide

Le scroll fluide utilise la petite librairie Lenis, chargée depuis un CDN. Si elle ne charge pas, le site garde le scroll normal, rien ne casse. Il est désactivé chez les gens qui ont activé « réduire les animations ».

## Conseils images

- Format **WebP** ou **JPG**, 1600 px de large max, en 4:3 pour les créations et en 16:9 pour les miniatures de jeux.
- Mets les vidéos lourdes sur YouTube et un lien dans `link`, plutôt que dans le repo (GitHub Pages est limité à 1 Go).
