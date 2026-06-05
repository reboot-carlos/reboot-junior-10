# 🤖 Claude IA - Chatbot Intelligent

Un chatbot moderne et intelligent avec Claude, conçu comme un débutant en codage mais structuré comme un professionnel.

## ✨ Fonctionnalités

### Chat & Conversation
- **Zone de chat standard** : Interface claire et intuitive
- **Barre latérale** : Historique des conversations et rôles du chatbot
- **6 Personnalités** : Tech, Science, Art, Business, Wellness, Storyteller
- **Dictée vocale** : Dicte tes messages avec le microphone 🎙️
- **Boutons rapides** : Copier, supprimer, les actions essentielles

### Rôles du Chatbot
- **Tech Expert** 💻 : Questions techniques et programmation
- **Scientifique** 🔬 : Physique, chimie, biologie
- **Artiste Créatif** 🎨 : Design, musique, art
- **Coach Business** 💼 : Stratégie et entrepreneuriat
- **Coach Wellness** 🧘 : Santé, sport, bien-être
- **Conteur** 📖 : Narratifs et histoires

### Onglets supplémentaires
- **Réglages** ⚙️ : Volume, notifications, confidentialité
- **Photos** 🖼️ : Upload avec stickers
- **Vidéos** 🎬 : Lecteur vidéo et YouTube
- **Streaming** 🎵 : Musique et playlists
- **Livres** 📚 : Ressources éducatives

### Personnalisation
- Créer tes propres personnalités avec emoji
- Modifier les paramètres audio (volume, effets, vibrations)
- Gérer l'historique et les notifications

## 🚀 Démarrage Rapide

### Prérequis
- Node.js (pour le serveur Express)
- Python 3.8+ (pour FastAPI - optionnel)
- Une clé API Claude

### Installation

#### 1. Cloner / Copier les fichiers
```bash
cd /path/to/charbot;NEW
```

#### 2. Configuration de la clé API

Édite le fichier `.env` :
```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

Obtiens ta clé ici : https://console.anthropic.com/settings/keys

#### 3. Démarrer le serveur (Option A : Express/Node.js)

```bash
npm install
npm start
```

Puis ouvre : http://localhost:3000

#### 4. Démarrer le serveur (Option B : FastAPI/Python)

```bash
pip install -r requirements.txt
python3 -m uvicorn main:app --reload
```

Puis ouvre : http://localhost:8000

## 📁 Structure des fichiers

```
charbot;NEW/
├── index.html          # Interface HTML avec barre latérale
├── styles.css          # Styles modernes (palette or/bleu nuit)
├── app.js              # Logique JavaScript (chat, IA, réglages)
├── server.js           # Serveur Express (Node.js)
├── main.py             # Serveur FastAPI (Python)
├── package.json        # Dépendances Node.js
├── requirements.txt    # Dépendances Python
├── .env                # Configuration (clé API)
└── README.md           # Cette documentation
```

## 🎨 Design

- **Palette** : Or (#C9A84C) + Bleu Nuit (#0B1D45)
- **Fonts** : Cormorant Garamond (titres) + Inter (corps)
- **Effets** : Verre dépoli (glassmorphism), gradients, ombres douces
- **Layout** : Sidebar + Main content responsive

## 🎯 Utilisation

### Envoyer un message
1. Tape un message dans le champ de saisie
2. Appuie sur **Entrée** ou clique **Envoyer**
3. Claude répond selon la personnalité active

### Changer de personnalité
- Clique sur un rôle dans la **barre latérale**
- Ou dans l'onglet **Réglages** → **Personnalité du Chat**

### Dicter un message
- Clique le bouton 🎙️ **microphone**
- Parle clairement
- Le texte s'ajoute automatiquement

### Copier/Supprimer des messages
- Clique **Copier** pour copier le dernier message
- Clique **Supprimer** pour l'effacer

### Historique
- L'historique s'affiche dans la **barre latérale**
- Clique **Effacer l'historique** pour tout supprimer

## ⚙️ Réglages

### Son & Audio
- **Volume** : 0-100%
- **Effets sonores** : Clics, notifications
- **Vibrations** : Retours haptiques

### Notifications
- **Push** : Alertes en temps réel
- **Messages** : Réponses de Claude
- **Email** : Mises à jour

### Confidentialité
- **Historique** : Conserve tes messages localement
- **Statistiques** : Données anonymisées

## 🔧 Troubleshooting

### "Clé API introuvable"
- Vérifie le fichier `.env`
- Régenère ta clé si nécessaire

### Microphone ne fonctionne pas
- Autorise l'accès au microphone (navigateur)
- Essaie avec HTTPS (certains navigateurs l'exigent)

### Messages lents
- Vérife la connexion internet
- Vérifie le quota API Claude

## 📚 Améliorations Futures

- [ ] Sauvegarde des conversations en base de données
- [ ] Partage de conversations
- [ ] Mode hors ligne
- [ ] Intégration Spotify/YouTube
- [ ] Traduction en temps réel
- [ ] Export PDF des conversations

## 📝 Licence

Projet éducatif - Utilisation libre

## 🙋 Support

Pour toute question ou problème, consulte la documentation Claude :
https://docs.anthropic.com

---

**Créé avec ❤️ comme un projet de débutant, structuré comme un professionnel**
