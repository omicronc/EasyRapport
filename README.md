# EasyRapport

Extension de navigateur (Chrome et Firefox) pour créer rapidement des rapports circonstanciés tâche par tâche, prêts à être collés dans Gmail.

![Capture](capture.png)

## Fonctionnalités

- Saisie des métadonnées (Titre, Date, Auteur) et liste des tâches
- Génération d’un HTML propre, compatible Gmail
- Copie au presse‑papiers du HTML et du texte brut
- Sauvegarde locale automatique via `chrome.storage.local`
- Bouton “Réinitialiser” pour repartir de zéro
- Titre auto basé sur le jour de la semaine (“Rapport du lundi”, etc.)
- Compatibilité multi‑navigateurs:
  - Chrome: input date avec icône visible en thème sombre
  - Firefox: input date avec un sélecteur personnalisé intégré

## Structure du projet

```
EasyRapport/
├─ chrome-extension/        # Version Chrome (Manifest MV3)
│  ├─ assets/               # Icônes (16/48/128)
│  ├─ manifest.json
│  ├─ popup.html
│  ├─ popup.css
│  └─ popup.js
├─ firefox-extension/       # Version Firefox (Manifest MV3 + gecko)
│  ├─ assets/
│  ├─ manifest.json
│  ├─ popup.html
│  ├─ popup.css
│  └─ popup.js
├─ build.ps1                # Script optionnel de packaging (Windows/PowerShell)
├─ capture.png              # Illustration
└─ .gitignore
```

## Installation (développement)

### Chrome
- Ouvre `chrome://extensions/`
- Active le “Mode développeur”
- Clique “Charger l’extension non empaquetée”
- Choisis le dossier `chrome-extension`

### Firefox
- Ouvre `about:debugging#/runtime/this-firefox`
- Clique “Charger un module complémentaire temporaire…”
- Sélectionne `firefox-extension/manifest.json`

## Packaging (“compilation”)

### Méthode simple (PowerShell)

Dans le dossier racine du projet:

```powershell
# Chrome
Compress-Archive -Path "chrome-extension\*" -DestinationPath "EasyRapport-chrome-extension.zip" -Force

# Firefox (XPI = ZIP renommé)
Compress-Archive -Path "firefox-extension\*" -DestinationPath "EasyRapport-firefox-extension.zip" -Force
Rename-Item "EasyRapport-firefox-extension.zip" "EasyRapport-firefox-extension.xpi" -Force
```

### Script optionnel

Tu peux aussi utiliser le script [build.ps1](file:///c:/Users/cchatelain/Documents/webdev/EasyRapport/build.ps1):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\build.ps1"
```

Le script lit les versions dans les manifests et génère:
- `EasyRapport-chrome-vX.Y.Z.zip`
- `EasyRapport-firefox-vX.Y.Z.xpi`

## Publication

### Chrome Web Store
- Envoie `EasyRapport-chrome-extension.zip` (ou `EasyRapport-chrome-vX.Y.Z.zip`)
- Vérifie que l’archive contient directement `manifest.json`, `assets/`, `popup.html`, `popup.css`, `popup.js` à la racine
- Icône d’action déclarée dans le manifest (Chrome): [chrome-extension/manifest.json](file:///c:/Users/cchatelain/Documents/webdev/EasyRapport/chrome-extension/manifest.json#L11-L17)

### Firefox (addons.mozilla.org, AMO)
- Envoie `EasyRapport-firefox-extension.xpi` (ou `EasyRapport-firefox-vX.Y.Z.xpi`)
- Déclare l’ID et la version minimale (gecko):
  - `strict_min_version` doit être ≥ 142 pour utiliser `data_collection_permissions`
  - ID à personnaliser (ex: `easyrapport@tondomaine.com`)
- Déclare la collecte de données (aucune) via:
  - [firefox-extension/manifest.json](file:///c:/Users/cchatelain/Documents/webdev/EasyRapport/firefox-extension/manifest.json#L11-L19)

Extrait:

```json
"browser_specific_settings": {
  "gecko": {
    "id": "easyrapport@example.com",
    "strict_min_version": "142.0",
    "data_collection_permissions": {
      "required": ["none"]
    }
  }
}
```

## Utilisation

- Remplis Titre / Date / Auteur
- Ajoute tes tâches (Titre + Description)
- Clique “Générer l’aperçu”, puis “Copier HTML pour Gmail”
- Colle le HTML directement dans un email Gmail

Notes:
- Le HTML est échappé pour éviter l’injection; les retours à la ligne sont convertis en `<br>`
- L’aperçu est rendu côté popup sans utiliser `innerHTML` directement (sécurité)

## Dépannage

- Icônes introuvables après packaging:
  - Vérifie que `assets/` est bien à la racine de l’archive et que `default_icon` est déclaré
  - Chrome: [chrome-extension/manifest.json](file:///c:/Users/cchatelain/Documents/webdev/EasyRapport/chrome-extension/manifest.json#L11-L17)
  - Firefox: [firefox-extension/manifest.json](file:///c:/Users/cchatelain/Documents/webdev/EasyRapport/firefox-extension/manifest.json#L20-L26)

- Icône du datepicker invisible en thème sombre (Chrome):
  - Correction via CSS:
  - [chrome-extension/popup.css](file:///c:/Users/cchatelain/Documents/webdev/EasyRapport/chrome-extension/popup.css)

- Firefox: clic sur l’icône date ne fait rien
  - Comportement attendu (pas de picker natif): un picker personnalisé s’ouvre au focus/clic
  - Fichiers:
    - [firefox-extension/popup.js](file:///c:/Users/cchatelain/Documents/webdev/EasyRapport/firefox-extension/popup.js)
    - [firefox-extension/popup.css](file:///c:/Users/cchatelain/Documents/webdev/EasyRapport/firefox-extension/popup.css)

- Presse‑papiers:
  - Utilise `ClipboardItem` quand disponible, sinon fallback en texte

## Confidentialité

- Aucune collecte ni transmission de données personnelles
- Déclaré via `data_collection_permissions: { required: ["none"] }` dans le manifest Firefox

## Licence

GPLv3. Voir les fichiers LICENSE dans:
- [chrome-extension/LICENSE](file:///c:/Users/cchatelain/Documents/webdev/EasyRapport/chrome-extension/LICENSE)
- [firefox-extension/LICENSE](file:///c:/Users/cchatelain/Documents/webdev/EasyRapport/firefox-extension/LICENSE)

## Contribution

- Ouvre une PR ou un ticket avec tes améliorations/bugs
- Respecte la structure existante et le style de code

