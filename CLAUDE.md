# 📋 CLAUDE.md - Documentation du Chatbot

## Vue d'ensemble

Claude IA est un chatbot moderne conçu pour les débutants en codage mais structuré professionnellement. Le projet a été entièrement réorganisé avec une **barre latérale** contenant l'historique et les rôles du chatbot.

## Architecture

### Structure
```
charbot;NEW/
├── Frontend
│   ├── index.html       (interface HTML)
│   ├── styles.css       (tous les styles)
│   └── app.js           (logique JS côté client)
├── Backend (2 options)
│   ├── server.js        (Express/Node.js)
│   └── main.py          (FastAPI/Python)
└── Config & Doc
    ├── package.json     (dépendances Node)
    ├── requirements.txt (dépendances Python)
    ├── .env             (clé API)
    └── README.md        (guide utilisateur)
```

### Points clés de la refonte

1. **Barre latérale ajoutée** 
   - Historique des messages (avec horodatage)
   - Rôles du chatbot (6 personnalités)
   - Boutons de contrôle (nouveau chat, effacer historique)

2. **Séparation des fichiers**
   - HTML/CSS/JS séparés (plus maintenable)
   - Logique centralisée dans `app.js`
   - Styles organisés par composant

3. **Fonctionnalités conservées**
   - ✅ 6 personnalités (Tech, Science, Art, Business, Wellness, Storyteller)
   - ✅ Dictée vocale (speech recognition)
   - ✅ Stickers et emojis
   - ✅ Historique des messages
   - ✅ Photos, vidéos, musique
   - ✅ Tous les réglages (volume, notifications, etc)
   - ✅ Boutons (copier, supprimer, etc)

## Composants principaux

### Frontend (index.html + styles.css + app.js)

**Sidebar** (`<aside class="sidebar">`)
- Section historique avec timestamps
- Section rôles avec raccourcis
- Bouton "nouveau chat"
- Footer avec liens support

**Main Content** (`<main class="main-content">`)
- Header avec titre et description
- Navigation des onglets
- Section chat (par défaut)
- 5 autres onglets : Réglages, Photos, Vidéos, Streaming, Livres

**Chat Tab** (`#tab-chat`)
- Zone des messages (scrollable)
- Section ressources selon personnalité
- Galerie stickers
- Formulaire d'envoi avec boutons (dicter, envoyer)
- Boutons d'actions (copier, supprimer)

### Backend (server.js OU main.py)

Les deux serveurs font la même chose : relayer les messages à Claude avec prompt caching.

**Routes principales:**
- `POST /chat` - Envoyer un message
- `GET /` - Vérifier l'état du serveur

**Personnalités:**
Chaque personnalité a un system prompt distinct avec des instructions spécifiques.

## Variables globales importantes (app.js)

```javascript
let historique = [];           // Historique des messages
let personaliteActive = 'tech'; // Personnalité active
let preferences = {...};       // Réglages utilisateur
let historiqueSidebar = [];    // Pour l'affichage dans la sidebar
```

## Fonctions clés

### Chat
- `envoyerMessage()` - Ajoute un message et obtient une réponse
- `ajouterMessageAuChat(role, contenu)` - Affiche un message
- `copierDernierMessage()` - Copie le dernier message
- `supprimerDernierMessage()` - Supprime le dernier message

### Historique Sidebar
- `ajouterALHistorique(message)` - Ajoute à l'historique sidebar
- `afficherHistoriqueSidebar()` - Rend l'historique
- `effacerHistorique()` - Efface tout l'historique

### Personnalités
- `initialiserPersonnalites()` - Affiche les boutons
- `changerPersonnalite(key)` - Change la personnalité active
- `creerPersonnalite()` - Crée une nouvelle personnalité personnalisée

### Réglages
- `chargerPreferences()` - Charge depuis localStorage
- `sauvegarderPreferences()` - Sauvegarde dans localStorage
- `changeVolume(valeur)` - Ajuste le volume

## Données stockées (localStorage)

```javascript
'claude_api_key'          // Clé API Claude
'chatbot_preferences'     // Objets preferences (JSON)
'profil_nom'              // Nom d'utilisateur
```

## Design & Styles

**Palette:**
- `--gold: #C9A84C` - Accent principal
- `--header-from: #0B1D45` - Bleu nuit
- `--texte: #EAEEff` - Texte clair
- `--carte: rgba(255,255,255,0.08)` - Fond verre

**Composants CSS réutilisables:**
- `.btn-primary` - Bouton doré
- `.btn-danger` - Bouton rouge
- `.card-*` - Cartes réglages
- `.toggle-switch` - Interrupteurs
- `.message` - Bulles de messages

## Améliorations futures

### Phase 2
- [ ] Connexion Firebase/Base de données
- [ ] Sauvegarde persistante des conversations
- [ ] Partage de conversations par URL

### Phase 3
- [ ] Intégration Spotify (pour les playlists)
- [ ] Intégration YouTube (recommandations)
- [ ] Mode offline avec service workers

### Phase 4
- [ ] Traduction automatique multilingue
- [ ] Export PDF/Markdown
- [ ] Analytics des conversations

## Notes importantes

1. **Clé API** - Doit être dans `.env` ou localStorage
2. **CORS** - Activé pour développement (désactiver en prod)
3. **Historique local** - Limité à 20 items dans sidebar pour perf
4. **Cache** - Claude Haiku avec prompt caching pour économiser tokens
5. **Responsive** - Fonctionne sur mobile (sidebar → horizontal)

## Testing

```bash
# Test Node.js
npm install && npm start

# Test Python
pip install -r requirements.txt && python3 -m uvicorn main:app --reload

# Puis ouvrir navigateur
http://localhost:3000  # Express
http://localhost:8000  # FastAPI
```

## Troubleshooting

**Le chat ne répond pas:**
- Vérifie la clé API dans `.env` ou les réglages
- Ouvre la console du navigateur (F12) pour voir les erreurs

**Sidebar ne s'affiche pas:**
- Vérifie que `index.html` et `styles.css` sont au même dossier
- Recharge la page (Ctrl+Shift+R)

**Boutons microphone désactivés:**
- Faut HTTPS (ou localhost) pour web audio API
- Autorise l'accès au microphone

## Conventions de code

- Noms en français pour UX cohérente
- camelCase pour JavaScript
- Classes CSS avec tirets `classe-principale`
- Comments explicatifs aux sections complexes
- localStorage pour données légères seulement

## Contact & Support

Pour questions ou bugs : voir `README.md`
