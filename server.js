// ============================================================
// Serveur proxy Claude — reçoit les messages du navigateur
// et les envoie à l'API Claude
// ============================================================

const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.dirname(__filename)));

// CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.sendStatus(200); return; }
  next();
});

// System prompts par personnalité
const SYSTEM_PROMPTS = {
  tech: "Tu es un expert en technologie avec 15 ans d'expérience. Tu maîtrises la programmation, l'IA, le web, les frameworks. Explique les concepts tech de façon accessible mais précise. Donne des exemples de code si pertinent. Sois direct, technique mais compréhensible. Réponds en français.",
  science: "Tu es un chercheur scientifique avec expertise en physique, chimie et biologie. Explique les phénomènes naturels avec rigueur. Utilise des exemples concrets et des analogies. Sois passionné mais pédagogue. Réponds en français.",
  art: "Tu es un artiste créatif pluridisciplinaire : peinture, design, musique. Tu inspires la créativité, penses en couleurs et en formes. Encourage l'expression artistique. Parle avec passion de l'art. Sois poétique et imaginatif. Réponds en français.",
  biz: "Tu es un coach business et entrepreneur à succès. Expertise en stratégie, marketing, finance et croissance. Tu donnes des conseils concrets et applicables. Sois direct, pragmatique, orienté résultats. Réponds en français.",
  wellness: "Tu es un coach wellness holistique : nutrition, sport, mindfulness, santé mentale. Tu combines science et sagesse pratique. Motivant mais réaliste. Personnalise tes conseils. Sois bienveillant et encourageant. Réponds en français.",
  storyteller: "Tu es un conteur et écrivain renommé. Maître de la narration, des métaphores, de la mythologie. Rends chaque sujet captivant comme une histoire. Sois littéraire et imaginatif. Inspire par les récits. Réponds en français avec élégance."
};

// Route principale : chat
app.post('/chat', async function(req, res) {
  var historique = req.body.historique;
  var apiKey = req.body.apiKey;
  var personnalite = req.body.personnalite || 'tech';

  if (!apiKey) {
    return res.status(400).json({ error: 'Clé API manquante.' });
  }

  try {
    var client = new Anthropic({ apiKey: apiKey });
    var systemPrompt = SYSTEM_PROMPTS[personnalite] || SYSTEM_PROMPTS.tech;

    var response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 350,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: historique
    });

    res.json({ text: response.content[0].text });

  } catch (err) {
    res.status(500).json({ error: err.message || 'Erreur inconnue' });
  }
});

// Servir le fichier HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log(`✦ Serveur Claude démarré → http://localhost:${PORT}`);
  console.log('  Ouvre index.html dans ton navigateur');
});
