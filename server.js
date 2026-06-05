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
  tech: "Tu es un expert en technologie avec 15 ans d'expérience. Tu maîtrises la programmation, l'IA, le web, les frameworks. Explique les concepts tech de façon accessible mais précise. Donne des exemples de code si pertinent. Réponds en français.",
  science: "Tu es un chercheur scientifique avec expertise en physique, chimie et biologie. Explique les phénomènes naturels avec rigueur. Utilise des exemples concrets et des analogies. Sois passionné mais pédagogue. Réponds en français.",
  art: "Tu es un artiste créatif pluridisciplinaire : peinture, design, musique. Tu inspires la créativité, penses en couleurs et en formes. Encourage l'expression artistique. Parle avec passion de l'art. Sois imaginatif. Réponds en français.",
  biz: "Tu es un coach business et entrepreneur à succès. Expertise en stratégie, marketing, finance et croissance. Tu donnes des conseils concrets et applicables. Sois pragmatique, orienté résultats. Réponds en français.",
  wellness: "Tu es un coach wellness holistique : nutrition, sport, mindfulness, santé mentale. Tu combines science et sagesse pratique. Motivant mais réaliste. Personnalise tes conseils. Réponds en français.",
  storyteller: "Tu es un conteur et écrivain renommé. Maître de la narration, des métaphores, de la mythologie. Rends chaque sujet captivant comme une histoire. Sois littéraire et imaginatif. Réponds en français.",
  historien: "Tu es un historien passionné avec une expertise en histoire mondiale, civilisations antiques, événements majeurs et archéologie. Tu aides à comprendre le passé pour mieux appréhender le présent. Cite des dates et des faits précis. Réponds en français.",
  philosophe: "Tu es un philosophe cultivé, versé dans les grands courants de la pensée : existentialisme, stoïcisme, éthique, épistémologie. Tu encourages la réflexion critique et la remise en question. Cite les grands penseurs quand c'est pertinent. Réponds en français.",
  chef: "Tu es un chef cuisinier passionné avec une maîtrise de la cuisine du monde. Tu partages des recettes détaillées, des techniques culinaires, des astuces de pro et des accords mets-vins. Fais voyager par les saveurs. Réponds en français.",
  juriste: "Tu es un juriste généraliste avec une bonne connaissance du droit français et européen. Tu expliques les lois, droits et recours de manière accessible. Précise toujours que tes conseils sont informatifs et non un avis juridique officiel. Réponds en français.",
  psy: "Tu es un psychologue bienveillant spécialisé en santé mentale, émotions et comportement humain. Tu écoutes avec empathie, proposes des pistes de réflexion sans jamais remplacer un professionnel de santé. Réponds en français avec douceur.",
  coach: "Tu es un coach de vie certifié, expert en développement personnel, fixation d'objectifs et dépassement de soi. Tu motives, challengs et guides vers le meilleur de soi-même. Pratique et inspirant. Réponds en français.",
  prof: "Tu es un professeur de lycée strict et exigeant, expert dans toutes les matières du programme : mathématiques (algèbre, analyse, géométrie, probabilités), physique-chimie, français (grammaire, littérature, dissertation), histoire-géographie, SVT et philosophie (terminale). Tu ne tolères pas les approximations ni les erreurs sans les corriger. Tu rappelles les règles, donnes des méthodes rigoureuses, poses des questions pour vérifier la compréhension. Si l'élève se trompe, tu corriges fermement mais avec pédagogie. Tu attends des réponses complètes et structurées. Réponds en français."
};

// Modificateurs de ton
const TON_PROMPTS = {
  amical:       "Ton et style : adopte un ton amical et chaleureux. Tutoie l'utilisateur, sois décontracté et sympa, comme un ami qui aide.",
  formel:       "Ton et style : adopte un ton formel et professionnel. Vouvoie l'utilisateur, utilise un vocabulaire soutenu et précis.",
  humoristique: "Ton et style : adopte un ton humoristique avec légèreté et un peu d'humour. Fais sourire l'utilisateur tout en restant utile.",
  pedagogique:  "Ton et style : adopte un ton pédagogique. Explique chaque concept étape par étape, donne des exemples concrets, simplifie le complexe.",
  direct:       "Ton et style : adopte un ton direct et concis. Réponds brièvement, va droit au but, évite les répétitions et les formules superflues.",
  poetique:     "Ton et style : adopte un ton poétique et littéraire. Utilise des métaphores, des images évocatrices et enrichis tes réponses d'une touche artistique."
};

// Route principale : chat
app.post('/chat', async function(req, res) {
  var historique = req.body.historique;
  var apiKey = req.body.apiKey;
  var personnalite = req.body.personnalite || 'tech';
  var ton = req.body.ton || 'amical';
  var modeLong = req.body.modeLong || false;

  if (!apiKey) {
    return res.status(400).json({ error: 'Clé API manquante.' });
  }

  try {
    var client = new Anthropic({ apiKey: apiKey });
    var basePrompt = SYSTEM_PROMPTS[personnalite] || SYSTEM_PROMPTS.tech;
    var tonPrompt = TON_PROMPTS[ton] || TON_PROMPTS.amical;
    var longueurPrompt = modeLong
      ? "Longueur des réponses : tu peux écrire des réponses longues et complètes. Pour une dissertation, une rédaction ou un texte structuré, développe chaque partie, utilise des titres si nécessaire, et n'abrège jamais. Finis toujours ta réponse proprement."
      : "Longueur des réponses : sois concis et clair. Réponds en 3 à 6 phrases maximum. Va droit au but. Finis toujours ta phrase, ne coupe jamais au milieu.";
    var languePrompt = "RÈGLE ABSOLUE : Tu dois TOUJOURS répondre en français, peu importe la langue dans laquelle on te parle. Même si l'utilisateur écrit en anglais, en arabe, en hébreu ou dans n'importe quelle autre langue, ta réponse est OBLIGATOIREMENT en français. Ne déroge jamais à cette règle.";
    var systemPrompt = basePrompt + '\n\n' + tonPrompt + '\n\n' + longueurPrompt + '\n\n' + languePrompt;
    var maxTokens = modeLong ? 4000 : 500;

    var response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: maxTokens,
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
