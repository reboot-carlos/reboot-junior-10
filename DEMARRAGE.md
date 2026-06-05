# 🚀 Guide de Démarrage - Chatbot Claude

## ⚡ Démarrage rapide (3 étapes)

### 1️⃣ Configurer la clé API

**Option A: Dans le fichier .env**
```bash
# Édite le fichier .env et ajoute:
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

**Option B: Dans l'interface du chat**
1. Ouvre le chatbot dans ton navigateur
2. Onglet **Réglages** → **Connexion IA — Claude**
3. Colle ta clé API et clique **Sauvegarder**

👉 Obtiens ta clé : https://console.anthropic.com/settings/keys

---

### 2️⃣ Lancer le serveur backend

**Option A: Express (Node.js)** - ⭐ RECOMMANDÉ (plus rapide)
```bash
cd charbot;NEW
npm install
npm start
```
→ Le serveur démarre sur http://localhost:3000

**Option B: FastAPI (Python)**
```bash
cd charbot;NEW
pip install -r requirements.txt
python3 -m uvicorn main:app --reload
```
→ Le serveur démarre sur http://localhost:8000

---

### 3️⃣ Ouvrir le chatbot

1. **Express**: Ouvre http://localhost:3000 dans ton navigateur
2. **FastAPI**: Ouvre http://localhost:8000 dans ton navigateur

✅ C'est prêt ! Envoie un message et Claude répond en temps réel.

---

## ✅ Vérification du fonctionnement

### ✓ Le chat répond correctement
- Les réponses sont **contextuelles** (pas juste des templates)
- Les réponses respectent la **personnalité active** (Tech, Science, Art, etc)
- L'**historique** s'affiche dans la sidebar

### ✗ Problèmes courants

**"Aucun serveur Claude disponible"**
```
→ Lance le serveur! (npm start ou uvicorn)
```

**"Clé API Claude non configurée"**
```
→ Ajoute ta clé API dans .env ou Réglages
```

**"Erreur 429 - Quota dépassé"**
```
→ Tu as dépassé le quota de l'API Claude
→ Attends quelques minutes avant de réessayer
```

**CORS error en console**
```
→ C'est normal en développement (CORS activé)
→ En production, désactive CORS dans server.js/main.py
```

---

## 🎯 Test basique

Voici comment tester que tout marche :

1. **Envoie ce message** : "Explique Python en une phrase"
2. **Attends la réponse** : Tu devrais voir une vraie réponse technique
3. **Change de personnalité** : Sidebar → clique "Artiste Créatif"
4. **Envoie** : "Explique l'art en une phrase"
5. **Vérifie** : La réponse doit être artistique, pas technique ✨

---

## 🔧 Développement

### Code important (app.js)

**Fonction qui appelle Claude:**
```javascript
async function appellerClaude(messageUtilisateur) {
  // Envoie au serveur backend
  // Essaie Express (3000) puis FastAPI (8000)
  // Retourne la vraie réponse de Claude
}
```

**Envoi d'un message:**
```javascript
async function envoyerMessage() {
  // 1. Affiche le message utilisateur
  // 2. Appelle Claude via appellerClaude()
  // 3. Affiche la vraie réponse
  // 4. Ajoute à l'historique
}
```

### Déboguer la console

Ouvre F12 et vérifie :
```javascript
// Voir les messages en train de s'envoyer
fetch('http://localhost:3000/chat', {...})

// Vérifier la clé API
localStorage.getItem('claude_api_key')

// Vérifier l'historique
console.log(historique)

// Vérifier la personnalité active
console.log(personaliteActive)
```

---

## 📊 Flux de données

```
Utilisateur tape un message
     ↓
envoyerMessage() affiche le message
     ↓
appellerClaude() envoie au serveur backend
     ↓
Serveur reçoit et appelle l'API Claude
     ↓
API Claude retourne la réponse
     ↓
Affiche la vraie réponse dans le chat
     ↓
Ajoute à l'historique sidebar
```

---

## 🎉 Prochaines étapes

Maintenant que ça marche :

1. **Créer des personnalités** : Réglages → "+ Créer une personnalité"
2. **Uploader des photos** : Onglet Photos → drag & drop
3. **Dicter un message** : Clique 🎙️ et parle
4. **Personnaliser le profil** : Réglages → Modifier le profil

---

## 📞 Aide

**Serveur ne démarre pas ?**
```bash
# Vérifier les dépendances
npm list    # Express
pip list    # Python

# Vérifier les ports
lsof -i :3000   # Port 3000 utilisé?
lsof -i :8000   # Port 8000 utilisé?
```

**Message très lent ?**
```bash
# C'est normal pour la première réponse (model load)
# Les réponses suivantes sont plus rapides (cache)
```

**Besoin d'aide API Claude ?**
https://docs.anthropic.com

---

**Bon chat ! 🚀**
