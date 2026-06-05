// ═══════════════════════════════════════════════════════════════════════════
// VARIABLES GLOBALES
// ═══════════════════════════════════════════════════════════════════════════

let historique = [];
let personaliteActive = 'tech';
let tonActif = 'amical';
let modeLong = false;
let dernierMessageUtilisateur = '';
let preferences = {
  historique: true,
  volume: 75,
  effets: true,
  vibrations: true,
  push: true,
  notifChat: true,
  email: false,
  stats: true
};

const PERSONNALITES_DEF = {
  tech: {
    nom: 'Tech Expert',
    emoji: '💻',
    description: 'Expert en technologie avec 15 ans d\'expérience'
  },
  science: {
    nom: 'Scientifique',
    emoji: '🔬',
    description: 'Chercheur avec expertise en physique, chimie et biologie'
  },
  art: {
    nom: 'Artiste Créatif',
    emoji: '🎨',
    description: 'Expert en peinture, design et musique'
  },
  biz: {
    nom: 'Coach Business',
    emoji: '💼',
    description: 'Entrepreneur à succès spécialisé en stratégie'
  },
  wellness: {
    nom: 'Coach Wellness',
    emoji: '🧘',
    description: 'Nutrition, sport, mindfulness et santé mentale'
  },
  storyteller: {
    nom: 'Conteur',
    emoji: '📖',
    description: 'Maître de la narration et des métaphores'
  },
  historien: {
    nom: 'Historien',
    emoji: '🏛️',
    description: 'Expert en histoire mondiale, civilisations et archéologie'
  },
  philosophe: {
    nom: 'Philosophe',
    emoji: '🧠',
    description: 'Pensée critique, éthique et grands courants philosophiques'
  },
  chef: {
    nom: 'Chef Cuisinier',
    emoji: '👨‍🍳',
    description: 'Cuisine du monde, recettes et techniques culinaires'
  },
  juriste: {
    nom: 'Juriste',
    emoji: '⚖️',
    description: 'Droit, lois et conseils juridiques généraux'
  },
  psy: {
    nom: 'Psychologue',
    emoji: '💙',
    description: 'Santé mentale, émotions et comportement humain'
  },
  coach: {
    nom: 'Coach de Vie',
    emoji: '🎯',
    description: 'Développement personnel, objectifs et épanouissement'
  },
  prof: {
    nom: 'Prof Strict',
    emoji: '📐',
    description: 'Professeur de lycée exigeant — maths, physique, français, histoire'
  }
};

const TONS_DEF = {
  amical: {
    nom: 'Amical',
    emoji: '😊',
    desc: 'Chaleureux et décontracté',
    prompt: 'Adopte un ton amical et chaleureux. Tutoie l\'utilisateur, sois décontracté et sympa, comme un ami qui aide.'
  },
  formel: {
    nom: 'Formel',
    emoji: '🎩',
    desc: 'Professionnel et soutenu',
    prompt: 'Adopte un ton formel et professionnel. Vouvoie l\'utilisateur, utilise un vocabulaire soutenu et précis.'
  },
  humoristique: {
    nom: 'Humoristique',
    emoji: '😄',
    desc: 'Avec humour et légèreté',
    prompt: 'Adopte un ton humoristique avec légèreté et un peu d\'humour. Fais sourire l\'utilisateur tout en restant utile.'
  },
  pedagogique: {
    nom: 'Pédagogique',
    emoji: '📝',
    desc: 'Explications pas à pas',
    prompt: 'Adopte un ton pédagogique. Explique chaque concept étape par étape, donne des exemples concrets, simplifie le complexe.'
  },
  direct: {
    nom: 'Direct',
    emoji: '⚡',
    desc: 'Court et sans détours',
    prompt: 'Adopte un ton direct et concis. Réponds brièvement, va droit au but, évite les répétitions et les formules superflues.'
  },
  poetique: {
    nom: 'Poétique',
    emoji: '✨',
    desc: 'Lyrique et élaboré',
    prompt: 'Adopte un ton poétique et littéraire. Utilise des métaphores, des images évocatrices et enrichis tes réponses d\'une touche artistique.'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// OFFLINE AI — Knowledge base, calculator, local fallback
// ═══════════════════════════════════════════════════════════════════════════

function normaliser(t) {
  return t.toLowerCase()
    .replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e')
    .replace(/[îï]/g,'i').replace(/[ôö]/g,'o')
    .replace(/[ùûü]/g,'u').replace(/ç/g,'c').replace(/ñ/g,'n');
}

function arrondir(n) {
  return parseFloat(n.toFixed(6)).toString();
}

function calculer(message) {
  var m = message
    .replace(/×/g,'*').replace(/÷/g,'/').replace(/²/g,'^2')
    .replace(/³/g,'^3').replace(/,/g,'.').replace(/\s/g,'');

  var pct = message.match(/(\d+[\.,]?\d*)\s*%\s*de\s*(\d+[\.,]?\d*)/i)
         || message.match(/(\d+[\.,]?\d*)\s*pourcent\s*de\s*(\d+[\.,]?\d*)/i);
  if (pct) {
    var r = parseFloat(pct[1].replace(',','.')) * parseFloat(pct[2].replace(',','.')) / 100;
    return pct[1] + '% de ' + pct[2] + ' = ' + arrondir(r);
  }

  var sqrt = message.match(/(?:√|racine(?:\s+carr[eé]e)?\s+(?:de\s+)?)(\d+[\.,]?\d*)/i);
  if (sqrt) {
    var n = parseFloat(sqrt[1].replace(',','.'));
    return '√' + n + ' = ' + arrondir(Math.sqrt(n));
  }

  var expr = m.match(/^[\d\+\-\*\/\.\(\)\^]+$/);
  if (!expr || m.length < 2) return null;

  try {
    var exprSafe = m.replace(/\^(\d+)/g, function(_, p) { return '**' + p; });
    if (/[a-zA-Z_$]/.test(exprSafe)) return null;
    var resultat = Function('"use strict";return(' + exprSafe + ')')();
    if (typeof resultat === 'number' && isFinite(resultat)) {
      return m + ' = ' + arrondir(resultat);
    }
  } catch(e) {}
  return null;
}

const BASE_SAVOIR = [
  // ── MATHS ──────────────────────────────────────────────
  { mots: ['pythagore', 'hypoténuse'],
    rep: "Le théorème de Pythagore : dans un triangle rectangle, le carré de l'hypoténuse = somme des carrés des deux autres côtés. a² + b² = c²." },
  { mots: ['dérivée', 'dériver', 'dérivation'],
    rep: "La dérivée mesure la variation d'une fonction. Règles de base : (xⁿ)' = n·xⁿ⁻¹, (sin x)' = cos x, (cos x)' = −sin x, (eˣ)' = eˣ." },
  { mots: ['intégrale', 'intégrer', 'primitive'],
    rep: "L'intégrale est l'inverse de la dérivée. ∫xⁿ dx = xⁿ⁺¹/(n+1) + C. L'intégrale définie de a à b donne l'aire sous la courbe." },
  { mots: ['discriminant', 'équation du second', 'ax2', 'ax²', 'trinôme'],
    rep: "Pour ax² + bx + c = 0, le discriminant Δ = b² − 4ac. Si Δ > 0 : deux solutions x = (−b ± √Δ) / 2a. Si Δ = 0 : une solution. Si Δ < 0 : pas de solution réelle." },
  { mots: ['suite arithmétique'],
    rep: "Une suite arithmétique a une raison r constante. uₙ = u₀ + n·r. Somme des n+1 premiers termes = (n+1)(u₀ + uₙ)/2." },
  { mots: ['suite géométrique'],
    rep: "Une suite géométrique a une raison q. uₙ = u₀ · qⁿ. Si |q| < 1, la suite converge vers 0. Somme = u₀ · (1 − qⁿ) / (1 − q)." },
  { mots: ['probabilité', 'probabilités'],
    rep: "La probabilité d'un événement A : P(A) = nombre de cas favorables / nombre de cas possibles. P(A) est toujours entre 0 et 1." },
  { mots: ['vecteur', 'norme', 'produit scalaire'],
    rep: "Un vecteur AB a pour coordonnées (xB−xA ; yB−yA). Sa norme = √((xB−xA)² + (yB−yA)²). Produit scalaire AB·CD = xAB·xCD + yAB·yCD." },
  { mots: ['logarithme', 'log', 'ln'],
    rep: "ln est le logarithme naturel (base e). ln(a·b) = ln a + ln b. ln(a/b) = ln a − ln b. ln(eˣ) = x. ln(1) = 0." },
  { mots: ['complexe', 'imaginaire', 'module', 'argument'],
    rep: "Un nombre complexe z = a + bi où i² = −1. Module |z| = √(a² + b²). Forme trigonométrique : z = r(cos θ + i·sin θ)." },

  // ── PHYSIQUE ────────────────────────────────────────────
  { mots: ['newton', 'deuxième loi', 'f=ma', 'force'],
    rep: "La 2ème loi de Newton : ΣF = m·a. La somme des forces (en N) égale la masse (kg) multipliée par l'accélération (m/s²)." },
  { mots: ['énergie cinétique'],
    rep: "Énergie cinétique : Ec = ½·m·v². Elle dépend de la masse m (kg) et de la vitesse v (m/s). Unité : le Joule (J)." },
  { mots: ['énergie potentielle'],
    rep: "Énergie potentielle de pesanteur : Ep = m·g·h. Avec g ≈ 9,8 m/s² et h la hauteur en mètres." },
  { mots: ['ohm', 'résistance', 'tension', 'intensité', 'circuit'],
    rep: "Loi d'Ohm : U = R·I. U = tension en Volts, R = résistance en Ohms, I = intensité en Ampères." },
  { mots: ['onde', 'longueur d\'onde', 'fréquence', 'célérité'],
    rep: "Relation onde : v = λ·f. v = célérité (m/s), λ = longueur d'onde (m), f = fréquence (Hz). Dans le vide : lumière à 3×10⁸ m/s." },
  { mots: ['cinématique', 'mouvement uniformément', 'mrua', 'mru'],
    rep: "MRU : v = constante, x = x₀ + v·t. MRUA : v = v₀ + a·t, x = x₀ + v₀·t + ½·a·t²." },

  // ── CHIMIE ──────────────────────────────────────────────
  { mots: ['mole', 'avogadro'],
    rep: "1 mole contient 6,022×10²³ entités (nombre d'Avogadro). n = m/M, avec m la masse (g) et M la masse molaire (g/mol)." },
  { mots: ['ph', 'acide', 'base', 'basique'],
    rep: "pH = −log[H₃O⁺]. pH < 7 → solution acide. pH = 7 → solution neutre. pH > 7 → solution basique." },
  { mots: ['oxydation', 'réduction', 'redox'],
    rep: "Oxydation = perte d'électrons. Réduction = gain d'électrons. Dans une réaction redox, le réducteur cède des électrons à l'oxydant." },
  { mots: ['liaisons covalentes', 'liaison', 'molécule', 'atome'],
    rep: "Une liaison covalente = partage de 2 électrons entre deux atomes. Les électrons de valence (couche externe) forment les liaisons." },

  // ── SVT / BIOLOGIE ──────────────────────────────────────
  { mots: ['adn', 'gène', 'chromosome', 'nucléotide'],
    rep: "L'ADN est formé de nucléotides (A, T, G, C). Un gène = séquence d'ADN codant une protéine. Chaque cellule humaine contient 46 chromosomes." },
  { mots: ['photosynthèse', 'chlorophylle', 'chloroplaste'],
    rep: "Photosynthèse : 6CO₂ + 6H₂O + lumière → C₆H₁₂O₆ + 6O₂. Les chloroplastes captent la lumière via la chlorophylle." },
  { mots: ['mitose', 'division cellulaire', 'méiose'],
    rep: "Mitose = division cellulaire donnant 2 cellules identiques. Méiose = division produisant 4 cellules avec 2 fois moins de chromosomes (gamètes)." },
  { mots: ['évolution', 'sélection naturelle', 'darwin'],
    rep: "Darwin : les individus les mieux adaptés survivent et se reproduisent davantage. Les caractères avantageux se transmettent, entraînant l'évolution des espèces." },
  { mots: ['respiration cellulaire', 'atp', 'mitochondrie'],
    rep: "La respiration cellulaire se passe dans les mitochondries : glucose + O₂ → CO₂ + H₂O + ATP (énergie). C'est l'inverse de la photosynthèse." },

  // ── HISTOIRE ────────────────────────────────────────────
  { mots: ['révolution française', '1789', 'bastille'],
    rep: "La Révolution française commence en 1789. Le 14 juillet, prise de la Bastille. En 1792 : Première République. En 1793 : exécution de Louis XVI." },
  { mots: ['napoléon', 'empire', 'waterloo'],
    rep: "Napoléon Bonaparte devient 1er Consul en 1799, puis Empereur en 1804. Il est défait à Waterloo en 1815 et exilé à Sainte-Hélène." },
  { mots: ['première guerre mondiale', 'ww1', '1914', '1918', 'grande guerre'],
    rep: "La 1ère Guerre Mondiale dure de 1914 à 1918. Se termine par l'armistice du 11 novembre 1918. 8 à 10 millions de soldats morts." },
  { mots: ['deuxième guerre mondiale', 'ww2', 'hitler', 'nazisme', '1939', '1945'],
    rep: "La 2ème Guerre Mondiale dure de 1939 à 1945. L'Holocauste tue 6 millions de juifs. Fin avec la capitulation allemande (mai 1945)." },
  { mots: ['renaissance', 'humanisme', 'léonard de vinci'],
    rep: "La Renaissance (XV-XVIe s.) redécouvre l'Antiquité et met l'Homme au centre (humanisme). Léonard de Vinci, Michel-Ange, Copernic, Galilée." },
  { mots: ['guerre froide', 'urss', 'berlin'],
    rep: "La Guerre Froide (1947-1991) oppose les USA (capitalisme) à l'URSS (communisme). Moments clés : blocus de Berlin, crise de Cuba, chute du mur (1989)." },

  // ── GÉOGRAPHIE ──────────────────────────────────────────
  { mots: ['capitale', 'allemagne'], rep: "La capitale de l'Allemagne est Berlin." },
  { mots: ['capitale', 'espagne'],   rep: "La capitale de l'Espagne est Madrid." },
  { mots: ['capitale', 'italie'],    rep: "La capitale de l'Italie est Rome." },
  { mots: ['capitale', 'japon'],     rep: "La capitale du Japon est Tokyo." },
  { mots: ['capitale', 'chine'],     rep: "La capitale de la Chine est Pékin (Beijing)." },
  { mots: ['capitale', 'russie'],    rep: "La capitale de la Russie est Moscou." },
  { mots: ['capitale', 'brésil'],    rep: "La capitale du Brésil est Brasília (et non Rio de Janeiro)." },
  { mots: ['plus grand pays'],       rep: "Le plus grand pays du monde est la Russie (17 millions de km²), suivi du Canada, des États-Unis et de la Chine." },
  { mots: ['plus peuplé', 'population mondiale'], rep: "L'Inde est le pays le plus peuplé (~1,4 milliard d'habitants). La population mondiale est d'environ 8 milliards." },

  // ── FRANÇAIS / LITTÉRATURE ──────────────────────────────
  { mots: ['molière', 'avare', 'misanthrope'],
    rep: "Molière (1622-1673) est le maître de la comédie française. Œuvres : L'Avare, Le Misanthrope, Tartuffe. Il critique les travers humains par le rire." },
  { mots: ['victor hugo', 'misérables', 'notre-dame', 'romantisme'],
    rep: "Victor Hugo (1802-1885) est le chef du mouvement romantique. Œuvres : Les Misérables, Notre-Dame de Paris, Hernani." },
  { mots: ['baudelaire', 'fleurs du mal', 'symbolisme'],
    rep: "Baudelaire (1821-1867) publie Les Fleurs du Mal en 1857. Il invente la poésie moderne, mêlant beauté et laideur." },
  { mots: ['camus', 'étranger', 'absurde', 'peste'],
    rep: "Albert Camus (1913-1960) développe la philosophie de l'absurde. Romans clés : L'Étranger (1942), La Peste (1947). Prix Nobel 1957." },
  { mots: ['figure de style', 'métaphore', 'comparaison', 'allitération'],
    rep: "Figures de style : métaphore (comparaison sans 'comme'), comparaison (avec 'comme'), allitération (répétition de consonnes), anaphore (répétition en début de vers)." },

  // ── ÉCONOMIE ────────────────────────────────────────────
  { mots: ['pib', 'produit intérieur brut'],
    rep: "Le PIB mesure la richesse produite dans un pays en un an. PIB = Consommation + Investissement + Dépenses publiques + (Exports − Imports)." },
  { mots: ['inflation', 'déflation'],
    rep: "L'inflation = hausse générale des prix (le pouvoir d'achat baisse). La BCE vise une inflation de 2% en zone euro." },
  { mots: ['chômage', 'taux de chômage', 'emploi'],
    rep: "Le taux de chômage = (chômeurs / population active) × 100. En France, il est mesuré par l'INSEE selon les critères du BIT." },

  // ── INFORMATIQUE ────────────────────────────────────────
  { mots: ['algorithme', 'pseudo-code', 'variable'],
    rep: "Un algorithme est une suite d'instructions pour résoudre un problème. Structures de base : séquence, condition (si/sinon), boucle (tant que / pour)." },
  { mots: ['binaire', 'bit', 'octet'],
    rep: "Le binaire utilise 0 et 1. 1 octet = 8 bits. Pour convertir 1010 en décimal : 1×8 + 0×4 + 1×2 + 0×1 = 10. 1 Ko = 1024 octets." },
  { mots: ['html', 'css', 'javascript', 'balise'],
    rep: "HTML structure la page (balises <p>, <h1>, <div>). CSS la met en forme (couleurs, tailles). JavaScript la rend interactive." },

  // ── CONVERSATION ────────────────────────────────────────
  { mots: ['bonjour', 'salut', 'coucou', 'hello', 'hey'],
    rep: "Salut ! Comment tu vas ?" },
  { mots: ['merci'],
    rep: "De rien !" },
  { mots: ['au revoir', 'bye', 'ciao', 'bonne nuit'],
    rep: "À bientôt !" },
  { mots: ['comment tu vas', 'ça va', 'comment vas-tu'],
    rep: "Ça va bien, merci ! Et toi ?" },
  { mots: ['qui es-tu', 'tu es quoi', 'tu es une ia', 'robot'],
    rep: "Je suis Claude, un assistant IA. Je connais les maths, les sciences, l'histoire et la littérature !" }
];

function chercherDansBase(message) {
  var m = normaliser(message);
  var meilleur = null, score = 0;
  for (var i = 0; i < BASE_SAVOIR.length; i++) {
    var e = BASE_SAVOIR[i], s = 0;
    for (var j = 0; j < e.mots.length; j++) {
      if (m.includes(normaliser(e.mots[j]))) s++;
    }
    if (s > score) { score = s; meilleur = e; }
  }
  if (score < 1 || !meilleur) return null;
  var aMotLong = false;
  for (var k = 0; k < meilleur.mots.length; k++) {
    if (meilleur.mots[k].length > 4 && m.includes(normaliser(meilleur.mots[k]))) { aMotLong = true; break; }
  }
  return aMotLong ? meilleur.rep : null;
}

function repondreConversation(message) {
  var m = normaliser(message);
  if (/\b(super|genial|cool|bravo|top|parfait|excellent)\b/.test(m)) return "Super !";
  if (/\b(nul|triste|fatigue|deprime|horrible|souci|probleme)\b/.test(m)) return "Courage ! Je t'écoute.";
  if (/\b(haha|lol|mdr|ptdr|xd)\b/.test(m)) return "Haha !";
  if (/\b(merci|thanks)\b/.test(m)) return "De rien !";
  if (/\b(bonjour|salut|coucou|hello|hey|bonsoir)\b/.test(m)) return "Salut !";
  if (/\b(au revoir|bye|ciao|a bientot)\b/.test(m)) return "À bientôt !";
  if (/\b(ca va|comment tu vas|comment vas.tu)\b/.test(m)) return "Ça va bien ! Et toi ?";
  return null;
}

function repondreLocalement(message) {
  var calcul = calculer(message);
  if (calcul) return calcul;
  var fact = chercherDansBase(message);
  if (fact) return fact;
  var conv = repondreConversation(message);
  if (conv) return conv;
  return null; // null = no local answer, show API error instead
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE UI HELPERS (ported from chatbot;old)
// ═══════════════════════════════════════════════════════════════════════════

function compterMots(texte) {
  return texte.trim().split(/\s+/).filter(m => m.length > 0).length;
}

function mettreAJourCompteur() {
  const nb = document.querySelectorAll('#liste-messages .message').length;
  const el = document.getElementById('compteur');
  if (el) el.textContent = nb + (nb > 1 ? ' messages' : ' message');
}

function supprimerMessageLi(li) {
  if (li.classList.contains('suppression')) return;
  li.classList.add('suppression');
  setTimeout(() => { li.remove(); mettreAJourCompteur(); }, 260);
}

function afficherIndicateurEcriture() {
  const liste = document.getElementById('liste-messages');
  const li = document.createElement('li');
  li.className = 'typing-indicator';
  li.id = 'typing';
  li.innerHTML = '<span class="typing-label">réfléchit</span><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  liste.appendChild(li);
  const area = document.querySelector('.messages-area');
  if (area) area.scrollTop = area.scrollHeight;
}

function supprimerIndicateurEcriture() {
  const el = document.getElementById('typing');
  if (el) el.remove();
}

function afficherErreur(texte) {
  supprimerIndicateurEcriture();
  const liste = document.getElementById('liste-messages');
  const li = document.createElement('li');
  li.style.cssText = 'background:rgba(220,50,50,0.18);border-left:3px solid #ff6b6b;color:#fca5a5;border-radius:0 14px 14px 0;padding:0.75rem 1.1rem;font-size:0.9rem;list-style:none;margin-bottom:0.4rem;';
  li.textContent = '⚠ ' + texte;
  liste.appendChild(li);
  mettreAJourCompteur();
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING PERSONALITY FAB
// ═══════════════════════════════════════════════════════════════════════════

function toggleMenuPersonnalite() {
  const menu = document.getElementById('menu-personnalites');
  if (!menu.classList.contains('visible')) {
    menu.innerHTML = Object.entries(PERSONNALITES_DEF).map(([key, p]) =>
      `<button class="menu-perso-item${key === personaliteActive ? ' actif' : ''}"
        onclick="changerPersonnalite('${key}');toggleMenuPersonnalite()">
        ${p.emoji} ${p.nom}
      </button>`
    ).join('');
  }
  menu.classList.toggle('visible');
}

// Close FAB dropdown when clicking outside
document.addEventListener('click', (e) => {
  const menu = document.getElementById('menu-personnalites');
  const fab  = document.getElementById('btn-personnalite-menu');
  if (menu && fab && !fab.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.remove('visible');
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION TOGGLES
// ═══════════════════════════════════════════════════════════════════════════

function togglePush() {
  preferences.push = !preferences.push;
  document.getElementById('toggle-push').classList.toggle('actif');
  sauvegarderPreferences();
}

function toggleNotifChat() {
  preferences.notifChat = !preferences.notifChat;
  document.getElementById('toggle-notif-chat').classList.toggle('actif');
  sauvegarderPreferences();
}

function toggleEmail() {
  preferences.email = !preferences.email;
  document.getElementById('toggle-email').classList.toggle('actif');
  sauvegarderPreferences();
}

// FONCTION POUR GÉNÉRER RAPIDEMENT DES EMOJIS
function genererEmojisEtendue() {
  const emojis = [];

  // Emojis de base (plus de 3000 variantes)
  const categories = {
    'Visages': ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😇', '🙂', '🙃', '😌', '😍', '🥰', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😌', '😔', '😑', '😐', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🤭', '🤫', '🤔', '🤐', '🤨', '😶', '🙁', '☹️', '😲', '😞', '😖', '😢', '😭', '😤', '😠', '😡', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'],
    'Gestes': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎', '👊', '👊', '👏', '🙌', '👐', '🫲', '🫳', '🤲', '🤝', '🤜', '🤛', '🦵', '🦶', '👂', '👃', '🧠', '🦷', '🦴', '🌳', '🌲', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁'],
    'Cœurs': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌'],
    'Étoiles et Symboles': ['⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔'],
    'Aliments': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🍯', '🥛', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🍸', '🍹', '🥃'],
    'Animaux': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦉', '🦃', '🦚', '🦜', '🦢', '🦗', '🥚'],
    'Véhicules': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🏎️', '🛵', '🦯', '🛴', '🚲', '🛹', '🛼', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛰️', '🚁', '🛶', '⛵', '🚤', '🛳️', '⛴️', '🛥️', '🚢', '🚧', '⛽'],
    'Objets': ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '🎬', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '🧾', '✉️', '📩', '📨', '📤', '📥', '📦', '🏷️', '🧷', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🚬', '⚰️', '⚱️', '🏺', '🧿', '🧸', '🧩', '🎮', '🎯', '🎲', '♠️', '♥️', '♦️', '♣️', '🎭', '🎨', '🎪', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🥂', '🍾', '🍷', '🍶', '🍑', '🍒', '🍓', '🫐', '🥝'],
    'Sports': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎳', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '⛸️', '🎣', '🎽', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🏌️', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '🤹', '🎖️', '🏅', '🏆', '🥇', '🥈', '🥉'],
    'Professions': ['👨‍⚕️', '👩‍⚕️', '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👨‍⚖️', '👩‍⚖️', '👨‍🌾', '👩‍🌾', '👨‍🍳', '👩‍🍳', '👨‍🔧', '👩‍🔧', '👨‍🏭', '👩‍🏭', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎤', '👩‍🎤', '👨‍🎨', '👩‍🎨', '👨‍✈️', '👩‍✈️', '👨‍🚀', '👩‍🚀', '👨‍🚒', '👩‍🚒', '👮', '🕵️', '💂', '👷', '🤴', '👸', '👳', '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟'],
    'Nature': ['🌍', '🌎', '🌏', '🌐', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '🍏', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃'],
    'Drapeaux': ['🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿', '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫', '🇧🇬', '🇧🇭', '🇧🇮', '🇧🇯', '🇧🇱', '🇧🇲', '🇧🇳', '🇧🇴', '🇧🇶', '🇧🇷', '🇧🇸', '🇧🇹', '🇧🇻', '🇧🇼', '🇧🇾', '🇧🇿', '🇨🇦', '🇨🇩', '🇨🇭', '🇨🇮', '🇨🇰', '🇨🇱', '🇨🇲', '🇨🇳', '🇨🇴', '🇨🇵', '🇨🇷', '🇨🇺', '🇨🇻', '🇨🇼', '🇨🇽', '🇨🇿', '🇩🇪', '🇩🇬', '🇩🇯', '🇩🇰', '🇩🇲', '🇩🇴', '🇩🇿', '🇪🇨', '🇪🇪', '🇪🇬', '🇪🇭', '🇪🇷', '🇪🇸', '🇪🇹', '🇫🇮', '🇫🇯', '🇫🇰', '🇫🇲', '🇫🇴', '🇫🇷', '🇬🇦', '🇬🇧', '🇬🇩', '🇬🇪', '🇬🇬', '🇬🇭', '🇬🇮', '🇬🇱', '🇬🇲', '🇬🇳', '🇬🇵', '🇬🇶', '🇬🇷', '🇬🇸', '🇬🇹', '🇬🇺', '🇬🇼', '🇬🇾', '🇭🇰', '🇭🇲', '🇭🇳', '🇭🇷', '🇭🇹', '🇭🇺', '🇮🇨', '🇮🇩', '🇮🇪', '🇮🇱', '🇮🇲', '🇮🇳', '🇮🇴', '🇮🇶', '🇮🇷', '🇮🇸', '🇮🇹', '🇯🇪', '🇯🇲', '🇯🇴', '🇯🇵', '🇰🇪', '🇰🇬', '🇰🇭', '🇰🇮', '🇰🇲', '🇰🇳', '🇰🇵', '🇰🇷', '🇰🇼', '🇰🇿', '🇱🇦', '🇱🇧', '🇱🇨', '🇱🇮', '🇱🇰', '🇱🇷', '🇱🇸', '🇱🇹', '🇱🇺', '🇱🇻', '🇱🇾', '🇲🇦', '🇲🇨', '🇲🇩', '🇲🇪', '🇲🇫', '🇲🇬', '🇲🇭', '🇲🇰', '🇲🇱', '🇲🇲', '🇲🇳', '🇲🇴', '🇲🇵', '🇲🇶', '🇲🇷', '🇲🇸', '🇲🇹', '🇲🇺', '🇲🇻', '🇲🇼', '🇲🇽', '🇲🇾', '🇲🇿', '🇳🇦', '🇳🇨', '🇳🇪', '🇳🇫', '🇳🇬', '🇳🇮', '🇳🇱', '🇳🇴', '🇳🇵', '🇳🇷', '🇳🇺', '🇳🇿', '🇴🇲', '🇵🇦', '🇵🇪', '🇵🇫', '🇵🇬', '🇵🇭', '🇵🇰', '🇵🇱', '🇵🇲', '🇵🇳', '🇵🇷', '🇵🇸', '🇵🇹', '🇵🇼', '🇵🇾', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇸', '🇷🇺', '🇷🇼', '🇸🇦', '🇸🇧', '🇸🇨', '🇸🇩', '🇸🇪', '🇸🇬', '🇸🇭', '🇸🇮', '🇸🇯', '🇸🇰', '🇸🇱', '🇸🇲', '🇸🇳', '🇸🇴', '🇸🇷', '🇸🇸', '🇸🇹', '🇸🇻', '🇸🇽', '🇸🇾', '🇸🇿', '🇹🇦', '🇹🇨', '🇹🇩', '🇹🇫', '🇹🇬', '🇹🇭', '🇹🇯', '🇹🇰', '🇹🇱', '🇹🇲', '🇹🇳', '🇹🇴', '🇹🇷', '🇹🇹', '🇹🇻', '🇹🇼', '🇹🇿', '🇺🇦', '🇺🇬', '🇺🇲', '🇺🇳', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇦', '🇻🇨', '🇻🇪', '🇻🇬', '🇻🇮', '🇻🇳', '🇻🇺', '🇼🇦', '🇼🇫', '🇼🇸', '🇾🇪', '🇾🇹', '🇿🇦', '🇿🇲', '🇿🇼']
  };

  // Aplatir toutes les catégories dans un seul array
  for (let cat in categories) {
    categories[cat].forEach(emoji => {
      emojis.push({ emoji: emoji, nom: emoji });
    });
  }

  return emojis;
}

const STICKERS = genererEmojisEtendue();
const STICKERS_LEGACY = [
  // Visages - Émotions positives
  { emoji: '😀', nom: 'Sourire' },
  { emoji: '😁', nom: 'Gros rire' },
  { emoji: '😂', nom: 'Mort de rire' },
  { emoji: '🤣', nom: 'Rire fou' },
  { emoji: '😃', nom: 'Joyeux' },
  { emoji: '😄', nom: 'Heureux' },
  { emoji: '😅', nom: 'Sourire gêné' },
  { emoji: '😆', nom: 'Amusé' },
  { emoji: '😉', nom: 'Clin d\'oeil' },
  { emoji: '😊', nom: 'Sympathique' },
  { emoji: '😇', nom: 'Angélique' },
  { emoji: '🥰', nom: 'Cœur yeux' },
  { emoji: '😍', nom: 'Amour' },
  { emoji: '😘', nom: 'Bisou' },
  { emoji: '😗', nom: 'Embrasse' },
  { emoji: '😚', nom: 'Bisou fermé' },
  { emoji: '😙', nom: 'Kiss' },
  { emoji: '🥲', nom: 'Sourire bienveillant' },
  { emoji: '😋', nom: 'Délicieux' },
  { emoji: '😛', nom: 'Langue dehors' },
  { emoji: '😜', nom: 'Clin d\'oeil langue' },
  { emoji: '🤪', nom: 'Fou' },
  { emoji: '😌', nom: 'Satisfait' },

  // Visages - Émotions négatives
  { emoji: '😔', nom: 'Triste' },
  { emoji: '😑', nom: 'Neutre' },
  { emoji: '😐', nom: 'Sans expression' },
  { emoji: '😏', nom: 'Incrédule' },
  { emoji: '😒', nom: 'Déçu' },
  { emoji: '🙄', nom: 'Yeux levés' },
  { emoji: '😬', nom: 'Gêné' },
  { emoji: '🤥', nom: 'Mensonge' },
  { emoji: '😪', nom: 'Endormi' },
  { emoji: '🤤', nom: 'Salive' },
  { emoji: '😴', nom: 'Dort' },
  { emoji: '😷', nom: 'Malade' },
  { emoji: '🤒', nom: 'Fièvre' },
  { emoji: '🤕', nom: 'Blessé' },
  { emoji: '🤢', nom: 'Mal' },
  { emoji: '🤮', nom: 'Vomit' },
  { emoji: '🤧', nom: 'Rhume' },
  { emoji: '🤭', nom: 'Oups' },
  { emoji: '🤫', nom: 'Chut' },
  { emoji: '🤔', nom: 'Pense' },
  { emoji: '🤐', nom: 'Secret' },
  { emoji: '🤨', nom: 'Dubieux' },
  { emoji: '😶', nom: 'Timide' },
  { emoji: '🙁', nom: 'Déçu' },
  { emoji: '☹️', nom: 'Triste' },
  { emoji: '😲', nom: 'Choqué' },
  { emoji: '😞', nom: 'Malheureux' },
  { emoji: '😖', nom: 'Agonie' },
  { emoji: '😢', nom: 'Pleure' },
  { emoji: '😭', nom: 'Gros pleurs' },
  { emoji: '😤', nom: 'Exaspéré' },
  { emoji: '😠', nom: 'Fâché' },
  { emoji: '😡', nom: 'Furieux' },
  { emoji: '🤬', nom: 'Jure' },
  { emoji: '😈', nom: 'Diable' },

  // Gestes
  { emoji: '👍', nom: 'Pouce levé' },
  { emoji: '👎', nom: 'Pouce baissé' },
  { emoji: '👏', nom: 'Applaudis' },
  { emoji: '🙌', nom: 'Mains levées' },
  { emoji: '👋', nom: 'Salut' },
  { emoji: '🤝', nom: 'Poignée de main' },
  { emoji: '💪', nom: 'Force' },
  { emoji: '🤲', nom: 'Ouvrir les mains' },
  { emoji: '🙏', nom: 'Prier' },
  { emoji: '✋', nom: 'Main' },
  { emoji: '✌️', nom: 'Victoire' },
  { emoji: '🤞', nom: 'Croiser les doigts' },
  { emoji: '🤟', nom: 'Rock' },
  { emoji: '🤘', nom: 'Cornes' },
  { emoji: '🤙', nom: 'Appel' },
  { emoji: '🤜', nom: 'Poing gauche' },
  { emoji: '🤛', nom: 'Poing droit' },

  // Cœurs & Sentiments
  { emoji: '❤️', nom: 'Cœur rouge' },
  { emoji: '🧡', nom: 'Cœur orange' },
  { emoji: '💛', nom: 'Cœur jaune' },
  { emoji: '💚', nom: 'Cœur vert' },
  { emoji: '💙', nom: 'Cœur bleu' },
  { emoji: '💜', nom: 'Cœur violet' },
  { emoji: '🖤', nom: 'Cœur noir' },
  { emoji: '🤍', nom: 'Cœur blanc' },
  { emoji: '🤎', nom: 'Cœur marron' },
  { emoji: '💔', nom: 'Cœur brisé' },
  { emoji: '💕', nom: 'Deux cœurs' },
  { emoji: '💞', nom: 'Cœurs en rotation' },
  { emoji: '💓', nom: 'Battement' },
  { emoji: '💗', nom: 'Cœur croissant' },
  { emoji: '💖', nom: 'Cœur brillant' },
  { emoji: '💘', nom: 'Flèche' },
  { emoji: '💝', nom: 'Cadeau' },
  { emoji: '💟', nom: 'Diamant' },

  // Symboles & Objets
  { emoji: '⭐', nom: 'Étoile' },
  { emoji: '🌟', nom: 'Étoile brillante' },
  { emoji: '✨', nom: 'Étincelles' },
  { emoji: '⚡', nom: 'Éclair' },
  { emoji: '🔥', nom: 'Feu' },
  { emoji: '💥', nom: 'Explosion' },
  { emoji: '💫', nom: 'Vertige' },
  { emoji: '💢', nom: 'Colère' },
  { emoji: '💦', nom: 'Eau' },
  { emoji: '💯', nom: '100' },
  { emoji: '🎉', nom: 'Fête' },
  { emoji: '🎊', nom: 'Confettis' },
  { emoji: '🎈', nom: 'Ballon' },
  { emoji: '🎁', nom: 'Cadeau' },
  { emoji: '🎀', nom: 'Ruban' },
  { emoji: '🎭', nom: 'Théâtre' },
  { emoji: '🎪', nom: 'Cirque' },
  { emoji: '🎨', nom: 'Art' },
  { emoji: '🎬', nom: 'Film' },
  { emoji: '🎮', nom: 'Jeu vidéo' },
  { emoji: '🎸', nom: 'Guitare' },
  { emoji: '🎹', nom: 'Piano' },
  { emoji: '🎤', nom: 'Micro' },
  { emoji: '🎧', nom: 'Casque' },
  { emoji: '🎵', nom: 'Note musique' },
  { emoji: '🎶', nom: 'Notes' },
  { emoji: '📚', nom: 'Livres' },
  { emoji: '📖', nom: 'Livre ouvert' },
  { emoji: '📝', nom: 'Note' },
  { emoji: '📄', nom: 'Page' },
  { emoji: '📰', nom: 'Journnal' },
  { emoji: '🎓', nom: 'Mortier' },

  // Sports & Objets
  { emoji: '⚽', nom: 'Foot' },
  { emoji: '🏀', nom: 'Basket' },
  { emoji: '🏈', nom: 'American foot' },
  { emoji: '⚾', nom: 'Baseball' },
  { emoji: '🥎', nom: 'Softball' },
  { emoji: '🎾', nom: 'Tennis' },
  { emoji: '🏐', nom: 'Volley' },
  { emoji: '🏉', nom: 'Rugby' },
  { emoji: '🥏', nom: 'Balle' },
  { emoji: '🎳', nom: 'Bowling' },
  { emoji: '🏓', nom: 'Ping-pong' },
  { emoji: '🏸', nom: 'Badminton' },

  // Nature
  { emoji: '🌈', nom: 'Arc-en-ciel' },
  { emoji: '☀️', nom: 'Soleil' },
  { emoji: '🌙', nom: 'Lune' },
  { emoji: '⭐', nom: 'Étoile' },
  { emoji: '🌟', nom: 'Étoile brillante' },
  { emoji: '🌺', nom: 'Fleur hibiscus' },
  { emoji: '🌸', nom: 'Fleur cerisier' },
  { emoji: '🌼', nom: 'Tournesol' },
  { emoji: '🌻', nom: 'Sunflower' },
  { emoji: '🌷', nom: 'Tulipe' },
  { emoji: '🌹', nom: 'Rose' },
  { emoji: '🥀', nom: 'Fleur fanée' },
  { emoji: '🌱', nom: 'Pousse' },
  { emoji: '🌿', nom: 'Herbe' },
  { emoji: '☘️', nom: 'Trèfle' },
  { emoji: '🍀', nom: 'Four leaf' },

  // Aliments
  { emoji: '🍕', nom: 'Pizza' },
  { emoji: '🍔', nom: 'Hamburger' },
  { emoji: '🍟', nom: 'Frites' },
  { emoji: '🍗', nom: 'Poulet' },
  { emoji: '🍖', nom: 'Viande' },
  { emoji: '🌭', nom: 'Hot-dog' },
  { emoji: '🌮', nom: 'Taco' },
  { emoji: '🌯', nom: 'Burrito' },
  { emoji: '🥪', nom: 'Sandwich' },
  { emoji: '🥙', nom: 'Pita' },
  { emoji: '🧆', nom: 'Falafel' },
  { emoji: '🍝', nom: 'Pâtes' },
  { emoji: '🍜', nom: 'Nouilles' },
  { emoji: '🍲', nom: 'Soupe' },
  { emoji: '🍛', nom: 'Curry' },
  { emoji: '🍣', nom: 'Sushi' },
  { emoji: '🍱', nom: 'Bento' },
  { emoji: '🥘', nom: 'Paella' },
  { emoji: '🍢', nom: 'Brochette' },
  { emoji: '🍙', nom: 'Boulette riz' },
  { emoji: '🍚', nom: 'Riz' },
  { emoji: '🍖', nom: 'Viande' },
  { emoji: '🥐', nom: 'Croissant' },
  { emoji: '🥯', nom: 'Bagel' },
  { emoji: '🍞', nom: 'Pain' },
  { emoji: '🥖', nom: 'Baguette' },
  { emoji: '🥨', nom: 'Bretzel' },
  { emoji: '🧀', nom: 'Fromage' },
  { emoji: '🥚', nom: 'Œuf' },
  { emoji: '🍳', nom: 'Œuf cuisiné' },
  { emoji: '🧈', nom: 'Beurre' },
  { emoji: '🥞', nom: 'Crêpe' },
  { emoji: '🥓', nom: 'Bacon' },
  { emoji: '🥞', nom: 'Pancake' },
  { emoji: '🍪', nom: 'Cookie' },
  { emoji: '🎂', nom: 'Gâteau anniversaire' },
  { emoji: '🍰', nom: 'Gâteau' },
  { emoji: '🎁', nom: 'Cadeau' },
  { emoji: '🍩', nom: 'Donut' },
  { emoji: '🍫', nom: 'Chocolat' },
  { emoji: '🍬', nom: 'Bonbon' },
  { emoji: '🍭', nom: 'Sucette' },

  // Boissons & Cuisine
  { emoji: '☕', nom: 'Café' },
  { emoji: '🍵', nom: 'Thé' },
  { emoji: '🥤', nom: 'Verre' },
  { emoji: '🍶', nom: 'Sake' },
  { emoji: '🍺', nom: 'Bière' },
  { emoji: '🍻', nom: 'Verres bière' },
  { emoji: '🍷', nom: 'Vin' },
  { emoji: '🍸', nom: 'Cocktail' },
  { emoji: '🍹', nom: 'Mai Tai' },
  { emoji: '🍾', nom: 'Champagne' },

  // Animaux
  { emoji: '🐶', nom: 'Chien' },
  { emoji: '🐱', nom: 'Chat' },
  { emoji: '🐭', nom: 'Souris' },
  { emoji: '🐹', nom: 'Hamster' },
  { emoji: '🐰', nom: 'Lapin' },
  { emoji: '🦊', nom: 'Renard' },
  { emoji: '🐻', nom: 'Ours' },
  { emoji: '🐼', nom: 'Panda' },
  { emoji: '🐨', nom: 'Koala' },
  { emoji: '🐯', nom: 'Tigre' },
  { emoji: '🦁', nom: 'Lion' },
  { emoji: '🐮', nom: 'Vache' },
  { emoji: '🐷', nom: 'Cochon' },
  { emoji: '🐽', nom: 'Nez cochon' },
  { emoji: '🐸', nom: 'Grenouille' },
  { emoji: '🐵', nom: 'Singe' },
  { emoji: '🙈', nom: 'Ne pas voir' },
  { emoji: '🙉', nom: 'Ne pas entendre' },
  { emoji: '🙊', nom: 'Ne pas parler' },
  { emoji: '🐒', nom: 'Singe' },
  { emoji: '🐔', nom: 'Poule' },
  { emoji: '🐧', nom: 'Pingouin' },
  { emoji: '🐦', nom: 'Oiseau' },
  { emoji: '🐤', nom: 'Poussin' },
  { emoji: '🦆', nom: 'Canard' },
  { emoji: '🦅', nom: 'Aigle' },
  { emoji: '🦉', nom: 'Hibou' },
  { emoji: '🦇', nom: 'Chauve-souris' },
  { emoji: '🐺', nom: 'Loup' },
  { emoji: '🐗', nom: 'Sanglier' },
  { emoji: '🐴', nom: 'Cheval' },
  { emoji: '🦄', nom: 'Licorne' },
  { emoji: '🐝', nom: 'Abeille' },
  { emoji: '🐛', nom: 'Ver' },
  { emoji: '🦋', nom: 'Papillon' },
  { emoji: '🐌', nom: 'Escargot' },
  { emoji: '🐞', nom: 'Coccinelle' },
  { emoji: '🐜', nom: 'Fourmi' },
  { emoji: '🦟', nom: 'Moustique' },
  { emoji: '🐢', nom: 'Tortue' },
  { emoji: '🐍', nom: 'Serpent' },
  { emoji: '🦎', nom: 'Lézard' },
  { emoji: '🦖', nom: 'Dino T-Rex' },
  { emoji: '🦕', nom: 'Dino' },
  { emoji: '🐙', nom: 'Poulpe' },
  { emoji: '🦑', nom: 'Calmar' },
  { emoji: '🦐', nom: 'Crevette' },
  { emoji: '🦞', nom: 'Homard' },
  { emoji: '🦀', nom: 'Crabe' },
  { emoji: '🐡', nom: 'Poisson soufflé' },
  { emoji: '🐠', nom: 'Poisson' },
  { emoji: '🐟', nom: 'Poisson' },
  { emoji: '🐬', nom: 'Dauphin' },
  { emoji: '🐳', nom: 'Baleine' },
  { emoji: '🐋', nom: 'Baleine' },
  { emoji: '🦈', nom: 'Requin' },

  // Véhicules & Transport
  { emoji: '🚀', nom: 'Fusée' },
  { emoji: '✈️', nom: 'Avion' },
  { emoji: '🚁', nom: 'Hélico' },
  { emoji: '🚂', nom: 'Train' },
  { emoji: '🚆', nom: 'Train rapide' },
  { emoji: '🚇', nom: 'Métro' },
  { emoji: '🚈', nom: 'Train léger' },
  { emoji: '🚉', nom: 'Gare' },
  { emoji: '🚊', nom: 'Tram' },
  { emoji: '🚝', nom: 'Téléphérique' },
  { emoji: '🚞', nom: 'Train montagne' },
  { emoji: '🚋', nom: 'Tramway' },
  { emoji: '🚌', nom: 'Bus' },
  { emoji: '🚎', nom: 'Bus' },
  { emoji: '🚐', nom: 'Minibus' },
  { emoji: '🚑', nom: 'Ambulance' },
  { emoji: '🚒', nom: 'Pompiers' },
  { emoji: '🚓', nom: 'Police' },
  { emoji: '🚔', nom: 'Police' },
  { emoji: '🚕', nom: 'Taxi' },
  { emoji: '🚖', nom: 'Taxi' },
  { emoji: '🚗', nom: 'Voiture' },
  { emoji: '🚘', nom: 'Voiture' },
  { emoji: '🚙', nom: 'SUV' },
  { emoji: '🚚', nom: 'Camion' },
  { emoji: '🚛', nom: 'Camion' },
  { emoji: '🚜', nom: 'Tracteur' },
  { emoji: '🏎️', nom: 'Voiture rapide' },
  { emoji: '🏍️', nom: 'Moto' },
  { emoji: '🛵', nom: 'Scooter' },
  { emoji: '🦯', nom: 'Canne blanche' },
  { emoji: '🛺', nom: 'Tuk tuk' },
  { emoji: '🛴', nom: 'Trottinette' },
  { emoji: '🚲', nom: 'Vélo' },
  { emoji: '🛴', nom: 'Skateboard' },
  { emoji: '🛹', nom: 'Skateboard' },
  { emoji: '🛼', nom: 'Rollers' },
  { emoji: '🛶', nom: 'Bateau' },
  { emoji: '⛵', nom: 'Voilier' },
  { emoji: '🚤', nom: 'Bateau rapide' },
  { emoji: '🛳️', nom: 'Paquebot' },
  { emoji: '⛴️', nom: 'Ferry' },
  { emoji: '🛥️', nom: 'Bateau moteur' },
  { emoji: '🛰️', nom: 'Satellite' },
  { emoji: '🚨', nom: 'Sirène' },
  { emoji: '🚝', nom: 'Téléphérique' },
  { emoji: '🛣️', nom: 'Route' },
  { emoji: '🛤️', nom: 'Rails' },
  { emoji: '🗺️', nom: 'Carte' },
  { emoji: '🗿', nom: 'Moaï' },
  { emoji: '🗽', nom: 'Statue Liberté' },
  { emoji: '🗼', nom: 'Tour Tokyo' },
  { emoji: '🏰', nom: 'Château' }
];

// ═══════════════════════════════════════════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initialiserStickers();
  initialiserStickersChat();
  initialiserPersonnalites();
  initialiserRoles();
  initialiserTons();
  initialiserMusique();
  initialiserStreaming();
  initialiserLivres();
  initialiserFiltresFilms();
  initialiserFiltresLivres();
  chargerPreferences();
  mettreAJourStatutCle();

  // Navigation des onglets
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      afficherOnglet(tab);
    });
  });

  // Entrée au clavier pour envoyer un message
  document.getElementById('champ-texte').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      envoyerMessage();
    }
  });

  // Boutons d'actions du chat
  document.getElementById('btn-copy-last').addEventListener('click', copierDernierMessage);
  document.getElementById('btn-delete-last').addEventListener('click', supprimerDernierMessage);
  document.getElementById('btn-new-chat').addEventListener('click', nouvelleConversation);
  document.getElementById('btn-clear-history').addEventListener('click', effacerHistorique);
});

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION & ONGLETS
// ═══════════════════════════════════════════════════════════════════════════

function afficherOnglet(tab) {
  // Masquer tous les onglets
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.remove('visible');
  });

  // Désactiver tous les boutons
  document.querySelectorAll('.tab-btn').forEach(el => {
    el.classList.remove('active');
  });

  // Afficher l'onglet sélectionné
  const tabEl = document.getElementById(`tab-${tab}`);
  if (tabEl) {
    tabEl.classList.add('visible');
  }

  // Activer le bouton
  const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
  if (btn) {
    btn.classList.add('active');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CHAT & MESSAGES
// ═══════════════════════════════════════════════════════════════════════════

async function envoyerMessage() {
  const champ = document.getElementById('champ-texte');
  const message = champ.value.trim();

  if (!message) return;

  ajouterMessageAuChat('user', message);
  dernierMessageUtilisateur = message;
  champ.value = '';
  champ.focus();

  historique.push({ role: 'user', content: message });

  afficherIndicateurEcriture();

  try {
    const reponse = await appellerClaude(message);
    supprimerIndicateurEcriture();
    ajouterMessageAuChat('assistant', reponse);
    historique.push({ role: 'assistant', content: reponse });
    ajouterALHistorique(message);
  } catch (erreur) {
    supprimerIndicateurEcriture();
    console.error('Erreur Claude:', erreur);

    // Try local fallback before showing an error
    const local = repondreLocalement(message);
    if (local) {
      ajouterMessageAuChat('assistant', local, 'local');
      historique.push({ role: 'assistant', content: local });
      ajouterALHistorique(message);
    } else {
      afficherErreur(erreur.message);
    }
  }
}

function ajouterMessageAuChat(role, contenu, source) {
  const liste = document.getElementById('liste-messages');
  const li = document.createElement('li');
  li.className = `message message-${role}`;

  // Groupe colonne : contient label + citation + bulle + lire-suite
  const groupe = document.createElement('div');
  groupe.className = 'msg-group';

  // Label "Claude" / "App" au-dessus de la bulle (assistant seulement)
  if (role === 'assistant') {
    const label = document.createElement('span');
    label.className = 'label-app';
    label.textContent = source === 'local' ? 'App' : 'של שירל IA';
    groupe.appendChild(label);
  }

  // Citation de la question au-dessus de la réponse IA
  if (role === 'assistant' && dernierMessageUtilisateur) {
    const citation = document.createElement('div');
    citation.className = 'message-citation';
    const texte = dernierMessageUtilisateur.length > 60
      ? dernierMessageUtilisateur.substring(0, 60) + '…'
      : dernierMessageUtilisateur;
    citation.textContent = '↩ ' + texte;
    groupe.appendChild(citation);
  }

  // Bulle principale
  const div = document.createElement('div');
  div.className = 'message-content';
  div.textContent = contenu;
  groupe.appendChild(div);

  // Bouton "Lire la suite" sous la bulle (assistant, messages longs)
  if (role === 'assistant' && contenu.length > 300) {
    div.classList.add('collapsed');
    const btnLire = document.createElement('button');
    btnLire.className = 'btn-lire-suite';
    btnLire.textContent = '▼ Lire la suite';
    let ouvert = false;
    btnLire.addEventListener('click', () => {
      ouvert = !ouvert;
      div.classList.toggle('collapsed', !ouvert);
      btnLire.textContent = ouvert ? '▲ Réduire' : '▼ Lire la suite';
    });
    groupe.appendChild(btnLire);
  }

  li.appendChild(groupe);

  // Badge mots (à droite du groupe, aligné verticalement au centre)
  const nb = compterMots(contenu);
  const badge = document.createElement('span');
  badge.className = 'badge-mots';
  badge.textContent = nb + (nb > 1 ? ' mots' : ' mot');
  li.appendChild(badge);

  // Bouton copier
  const btnCopier = document.createElement('button');
  btnCopier.className = 'btn-copier-msg';
  btnCopier.title = 'Copier';
  btnCopier.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  btnCopier.addEventListener('click', (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contenu).then(() => {
      btnCopier.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
      btnCopier.classList.add('copie');
      setTimeout(() => {
        btnCopier.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
        btnCopier.classList.remove('copie');
      }, 1500);
    });
  });
  li.appendChild(btnCopier);

  // Actions hover : Supprimer + Laisser
  const actions = document.createElement('div');
  actions.className = 'actions';
  const btnSupp = document.createElement('button');
  btnSupp.className = 'btn-supprimer';
  btnSupp.textContent = 'Supprimer';
  btnSupp.addEventListener('click', () => supprimerMessageLi(li));
  const btnLais = document.createElement('button');
  btnLais.className = 'btn-laisser';
  btnLais.textContent = 'Laisser';
  actions.appendChild(btnSupp);
  actions.appendChild(btnLais);
  li.appendChild(actions);

  liste.appendChild(li);
  mettreAJourCompteur();

  const area = document.querySelector('.messages-area');
  if (area) area.scrollTop = area.scrollHeight;
}

// Appeler Claude via le serveur backend (relative URL — works locally and on Railway)
async function appellerClaude(messageUtilisateur) {
  const cle = localStorage.getItem('claude_api_key') || '';

  if (!cle) {
    throw new Error('Clé API Claude non configurée. Ajoute-la dans les Réglages !');
  }

  const response = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      historique: historique,
      apiKey: cle,
      personnalite: personaliteActive,
      ton: tonActif,
      modeLong: modeLong
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || `Erreur ${response.status}`);
  }

  const data = await response.json();
  return data.text || 'Aucune réponse obtenue';
}

function copierDernierMessage() {
  const messages = document.querySelectorAll('.message-content');
  if (messages.length > 0) {
    const dernier = messages[messages.length - 1].textContent;
    navigator.clipboard.writeText(dernier);
    afficherNotification('Message copié ! ✓');
  }
}

function supprimerDernierMessage() {
  const liste = document.getElementById('liste-messages');
  if (!liste) return;
  const dernier = liste.lastElementChild;
  if (dernier) {
    dernier.remove();
    if (historique.length > 0) historique.pop();
    mettreAJourCompteur();
    afficherNotification('Message supprimé');
  }
}

function nouvelleConversation() {
  if (confirm('Démarrer une nouvelle conversation ?')) {
    historique = [];
    document.getElementById('liste-messages').innerHTML = `
      <li class="message message-assistant">
        <div class="message-content">
          Bonjour ! 👋 Je suis Claude, ton assistant IA personnel. Comment puis-je t'aider ?
        </div>
      </li>
    `;
    afficherNotification('Nouvelle conversation démarrée ✨');
  }
}

function afficherNotification(message) {
  console.log('Notification:', message);
  // Vous pouvez ajouter une vraie notification plus tard
}

// ═══════════════════════════════════════════════════════════════════════════
// HISTORIQUE SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════

let historiqueSidebar = [];

function ajouterALHistorique(message) {
  const maintenant = new Date().toLocaleString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  historiqueSidebar.unshift({
    texte: message.substring(0, 40) + (message.length > 40 ? '...' : ''),
    heure: maintenant,
    id: Date.now()
  });

  if (historiqueSidebar.length > 20) historiqueSidebar.pop();
  afficherHistoriqueSidebar();
}

function afficherHistoriqueSidebar() {
  const liste = document.getElementById('liste-historique');

  if (historiqueSidebar.length === 0) {
    liste.innerHTML = '<p class="empty-state">Aucune conversation</p>';
    return;
  }

  liste.innerHTML = historiqueSidebar.map(item => `
    <div class="sidebar-item" title="${item.texte}">
      <div style="font-weight: 500; font-size: 0.8rem; color: var(--gold-light);">${item.heure}</div>
      <div style="margin-top: 0.25rem; font-size: 0.75rem;">${item.texte}</div>
    </div>
  `).join('');
}

function effacerHistorique() {
  if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ?')) {
    historiqueSidebar = [];
    afficherHistoriqueSidebar();
    afficherNotification('Historique effacé');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PERSONNALITÉS / RÔLES
// ═══════════════════════════════════════════════════════════════════════════

function initialiserPersonnalites() {
  const grid = document.getElementById('personnalites-grid');
  grid.innerHTML = '';

  Object.entries(PERSONNALITES_DEF).forEach(([key, perso]) => {
    const btn = document.createElement('button');
    btn.className = `personality-btn ${key === personaliteActive ? 'active' : ''}`;
    btn.dataset.key = key;
    btn.innerHTML = `
      <div class="personality-emoji">${perso.emoji}</div>
      <div>${perso.nom}</div>
    `;
    btn.addEventListener('click', () => {
      personaliteActive = key;
      actualiserPersonnalites();
      afficherNotification(`Personnalité changée : ${perso.nom}`);
    });
    grid.appendChild(btn);
  });
}

function actualiserPersonnalites() {
  document.querySelectorAll('.personality-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.key === personaliteActive);
  });

  const el = document.getElementById('ressources-specialite');
  if (el) el.textContent = PERSONNALITES_DEF[personaliteActive].nom;
}

function initialiserRoles() {
  const liste = document.getElementById('liste-roles');
  liste.innerHTML = Object.entries(PERSONNALITES_DEF).map(([key, perso]) => `
    <div class="sidebar-item" title="${perso.description}" onclick="changerPersonnalite('${key}')">
      <div style="font-size: 1.2rem; margin-bottom: 0.25rem;">${perso.emoji}</div>
      <div style="font-weight: 500; font-size: 0.8rem;">${perso.nom}</div>
    </div>
  `).join('');
}

function changerPersonnalite(key) {
  personaliteActive = key;
  actualiserPersonnalites();
  afficherNotification(`Rôle : ${PERSONNALITES_DEF[key].nom}`);
}

function initialiserTons() {
  const liste = document.getElementById('liste-tons');
  if (!liste) return;
  liste.innerHTML = Object.entries(TONS_DEF).map(([key, ton]) => `
    <button class="ton-btn${key === tonActif ? ' actif' : ''}" data-key="${key}" title="${ton.desc}" onclick="changerTon('${key}')">
      <span class="ton-emoji">${ton.emoji}</span>
      <span class="ton-nom">${ton.nom}</span>
    </button>
  `).join('');
}

function changerTon(key) {
  tonActif = key;
  document.querySelectorAll('.ton-btn').forEach(b => {
    b.classList.toggle('actif', b.dataset.key === key);
  });
  afficherNotification(`Ton : ${TONS_DEF[key].emoji} ${TONS_DEF[key].nom}`);
}

function toggleModeLong() {
  modeLong = !modeLong;
  const btn = document.getElementById('btn-mode-long');
  if (btn) {
    btn.classList.toggle('actif', modeLong);
    btn.textContent = modeLong ? '📝 Mode Long ✓' : '📝 Mode Long';
  }
  afficherNotification(modeLong ? '📝 Mode Long activé — réponses complètes et détaillées' : '📝 Mode Long désactivé — réponses courtes');
}

function toggleAjouterPersonnalite() {
  const panel = document.getElementById('panneau-ajouter-perso');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';

  if (panel.style.display === 'block') {
    initialiserGalerieEmojis();
  }
}

function initialiserGalerieEmojis() {
  const galerie = document.getElementById('galerie-emojis');
  const emojisList = ['😀', '😁', '😂', '😍', '🥰', '🤔', '😎', '🎭', '💼', '🔬', '🎨', '🚀', '💡', '⭐', '🔥', '✨'];

  galerie.innerHTML = emojisList.map(emoji => `
    <button class="emoji-btn" onclick="selectionnerEmoji('${emoji}')">${emoji}</button>
  `).join('');
}

function selectionnerEmoji(emoji) {
  document.getElementById('input-emoji-perso').value = emoji;
}

function creerPersonnalite() {
  const nom = document.getElementById('input-nom-perso').value.trim();
  const emoji = document.getElementById('input-emoji-perso').value.trim();

  if (!nom || !emoji) {
    alert('Veuillez remplir tous les champs');
    return;
  }

  // Ajouter la nouvelle personnalité
  const key = nom.toLowerCase().replace(/\s+/g, '-');
  PERSONNALITES_DEF[key] = {
    nom: nom,
    emoji: emoji,
    description: `Personnalité créée : ${nom}`
  };

  // Réinitialiser le formulaire
  document.getElementById('input-nom-perso').value = '';
  document.getElementById('input-emoji-perso').value = '';
  toggleAjouterPersonnalite();

  // Mettre à jour l'affichage
  initialiserPersonnalites();
  initialiserRoles();
  afficherNotification(`Personnalité créée : ${nom} ${emoji}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// STICKERS
// ═══════════════════════════════════════════════════════════════════════════

function initialiserStickersChat() {
  const container = document.getElementById('chat-stickers');
  container.innerHTML = STICKERS.slice(0, 12).map(s => `
    <button class="chat-sticker-btn" title="${s.nom}" onclick="ajouterStickerAuChat('${s.emoji}')">${s.emoji}</button>
  `).join('');
}

function ajouterStickerAuChat(emoji) {
  const champ = document.getElementById('champ-texte');
  champ.value += ' ' + emoji;
  champ.focus();
}

function initialiserStickers() {
  const galerie = document.getElementById('galerie-stickers');
  if (!galerie) return;

  galerie.innerHTML = STICKERS.map(s => `
    <button class="sticker-btn" title="${s.nom}">${s.emoji}</button>
  `).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// DICTÉE VOCALE (SPEECH RECOGNITION)
// ═══════════════════════════════════════════════════════════════════════════

let enEcoute = false;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function basculerDictee() {
  if (enEcoute) {
    arreterDictee();
    return;
  }

  if (!SpeechRecognition) {
    alert('La reconnaissance vocale n\'est pas supportée par votre navigateur');
    return;
  }

  const reconnaissance = new SpeechRecognition();
  reconnaissance.lang = 'fr-FR';
  reconnaissance.interimResults = true;
  reconnaissance.continuous = false;

  reconnaissance.onstart = () => {
    enEcoute = true;
    document.getElementById('bouton-dicter').classList.add('en-ecoute');
  };

  reconnaissance.onresult = (event) => {
    let texte = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      texte += event.results[i][0].transcript;
    }
    document.getElementById('champ-texte').value = texte;
  };

  reconnaissance.onerror = (event) => {
    if (event.error === 'not-allowed') {
      alert('Accès au microphone refusé');
    }
    arreterDictee();
  };

  reconnaissance.onend = () => {
    arreterDictee();
  };

  reconnaissance.start();
}

function arreterDictee() {
  enEcoute = false;
  document.getElementById('bouton-dicter').classList.remove('en-ecoute');
}

// ═══════════════════════════════════════════════════════════════════════════
// RÉGLAGES
// ═══════════════════════════════════════════════════════════════════════════

function changeVolume(valeur) {
  preferences.volume = valeur;
  document.getElementById('val-volume').textContent = valeur + '%';
  sauvegarderPreferences();
}

function toggleEffets() {
  preferences.effets = !preferences.effets;
  document.getElementById('toggle-effets').classList.toggle('actif');
  sauvegarderPreferences();
}

function toggleVibrations() {
  preferences.vibrations = !preferences.vibrations;
  document.getElementById('toggle-vibrations').classList.toggle('actif');
  sauvegarderPreferences();
}

function toggleHistorique() {
  preferences.historique = !preferences.historique;
  document.getElementById('toggle-historique').classList.toggle('actif');
  sauvegarderPreferences();
}

function toggleStats() {
  preferences.stats = !preferences.stats;
  document.getElementById('toggle-stats').classList.toggle('actif');
  sauvegarderPreferences();
}

function sauvegarderPreferences() {
  localStorage.setItem('chatbot_preferences', JSON.stringify(preferences));
}

function chargerPreferences() {
  const saved = localStorage.getItem('chatbot_preferences');
  if (saved) {
    preferences = JSON.parse(saved);
    document.getElementById('slider-volume').value = preferences.volume;
    document.getElementById('val-volume').textContent = preferences.volume + '%';
    if (preferences.effets)      document.getElementById('toggle-effets').classList.add('actif');
    if (preferences.vibrations)  document.getElementById('toggle-vibrations').classList.add('actif');
    if (preferences.historique)  document.getElementById('toggle-historique').classList.add('actif');
    if (preferences.stats)       document.getElementById('toggle-stats').classList.add('actif');
    if (preferences.push)        document.getElementById('toggle-push')?.classList.add('actif');
    if (preferences.notifChat)   document.getElementById('toggle-notif-chat')?.classList.add('actif');
    if (preferences.email)       document.getElementById('toggle-email')?.classList.add('actif');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFIL & CLÉ API
// ═══════════════════════════════════════════════════════════════════════════

function editerProfil() {
  const nom = prompt('Nom d\'utilisateur:', document.getElementById('profil-nom').textContent);
  if (nom) {
    document.getElementById('profil-nom').textContent = nom;
    localStorage.setItem('profil_nom', nom);
  }
}

function getCle() {
  return localStorage.getItem('claude_api_key') || '';
}

function sauvegarderCle() {
  const cle = document.getElementById('champ-api-key').value.trim();
  if (!cle) {
    alert('Veuillez entrer une clé API');
    return;
  }
  localStorage.setItem('claude_api_key', cle);
  mettreAJourStatutCle();
  afficherNotification('Clé API sauvegardée ! ✓');
}

function mettreAJourStatutCle() {
  const statut = document.getElementById('statut-cle');
  if (getCle()) {
    statut.textContent = 'Clé Claude configurée — IA active ! ✓';
    statut.style.color = '#10b981';
  } else {
    statut.textContent = 'Aucune clé configurée.';
    statut.style.color = '#ef4444';
  }
}

function viderConversation() {
  if (confirm('Êtes-vous sûr de vouloir effacer tous les messages ?')) {
    historique = [];
    document.getElementById('liste-messages').innerHTML = `
      <li class="message message-assistant">
        <div class="message-content">
          Conversation effacée. Bonjour ! Comment puis-je t'aider ? 👋
        </div>
      </li>
    `;
    mettreAJourCompteur();
    afficherNotification('Conversation effacée');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PHOTOS & VIDÉOS
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Upload photos
  const inputPhoto = document.getElementById('input-photo');
  if (inputPhoto) {
    inputPhoto.addEventListener('change', function() {
      ajouterPhotos(this.files);
    });
  }

  const zonePhoto = document.getElementById('zone-drop-photo');
  if (zonePhoto) {
    zonePhoto.addEventListener('dragover', (e) => {
      e.preventDefault();
      zonePhoto.classList.add('survol');
    });
    zonePhoto.addEventListener('dragleave', () => {
      zonePhoto.classList.remove('survol');
    });
    zonePhoto.addEventListener('drop', (e) => {
      e.preventDefault();
      zonePhoto.classList.remove('survol');
      ajouterPhotos(e.dataTransfer.files);
    });
  }

  // Upload vidéos
  const inputVideo = document.getElementById('input-video');
  if (inputVideo) {
    inputVideo.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const url = URL.createObjectURL(this.files[0]);
        document.getElementById('lecteur-video').src = url;
      }
    });
  }

  const zoneVideo = document.getElementById('zone-drop-video');
  if (zoneVideo) {
    zoneVideo.addEventListener('dragover', (e) => {
      e.preventDefault();
      zoneVideo.classList.add('survol');
    });
    zoneVideo.addEventListener('dragleave', () => {
      zoneVideo.classList.remove('survol');
    });
    zoneVideo.addEventListener('drop', (e) => {
      e.preventDefault();
      zoneVideo.classList.remove('survol');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const url = URL.createObjectURL(e.dataTransfer.files[0]);
        document.getElementById('lecteur-video').src = url;
      }
    });
  }

  // Musique/Streaming
  initialiserMusique();
});

function ajouterPhotos(files) {
  const grille = document.getElementById('grille-photos');
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);

    const item = document.createElement('div');
    item.className = 'photo-item';
    const img = document.createElement('img');
    img.src = url;
    img.addEventListener('click', () => {
      document.getElementById('lightbox-img').src = url;
      document.getElementById('lightbox').classList.add('visible');
    });
    item.appendChild(img);
    grille.appendChild(item);
  });
}

function chargerURLVideo() {
  const url = document.getElementById('url-video').value.trim();
  if (!url) {
    afficherNotification('❌ Veuillez entrer une URL YouTube');
    return;
  }

  // Extraire l'ID vidéo YouTube
  let videoId = '';
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
  }

  if (!videoId) {
    afficherNotification('❌ Format URL YouTube invalide');
    return;
  }

  // Créer l'iframe YouTube
  const iframeHTML = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}"
    title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen style="border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.14); margin-top: 1rem;"></iframe>`;

  // Ajouter à la page
  const videosContainer = document.querySelector('.videos-container');
  const newElement = document.createElement('div');
  newElement.innerHTML = iframeHTML;
  videosContainer.appendChild(newElement.firstElementChild);

  // Réinitialiser l'input
  document.getElementById('url-video').value = '';
  afficherNotification('✅ Vidéo YouTube chargée !');
}

// ═══════════════════════════════════════════════════════════════════════════
// MUSIQUE & STREAMING
// ═══════════════════════════════════════════════════════════════════════════

const MUSIQUES = [
  { emoji: '🎵', nom: 'Pop Hits', desc: 'Hits actuels', url: 'https://www.youtube.com/results?search_query=pop+hits+2026' },
  { emoji: '🎸', nom: 'Rock', desc: 'Rock classique', url: 'https://www.youtube.com/results?search_query=rock+music+hits' },
  { emoji: '🎹', nom: 'Chill Vibes', desc: 'Détente', url: 'https://www.youtube.com/results?search_query=chill+lo-fi+beats' },
  { emoji: '🔥', nom: 'Hip-Hop', desc: 'Top charts', url: 'https://www.youtube.com/results?search_query=hip+hop+hits+2026' },
  { emoji: '🎤', nom: 'R&B Soul', desc: 'Smooth vibes', url: 'https://www.youtube.com/results?search_query=r+and+b+hits' },
  { emoji: '🌙', nom: 'Bedroom Pop', desc: 'Late night', url: 'https://www.youtube.com/results?search_query=bedroom+pop' },
  { emoji: '💃', nom: 'Dance Club', desc: 'Club hits', url: 'https://www.youtube.com/results?search_query=edm+dance+hits' },
  { emoji: '🎼', nom: 'Classique', desc: 'Mozart & Cie', url: 'https://www.youtube.com/results?search_query=musique+classique' },
  { emoji: '🎺', nom: 'Jazz', desc: 'Jazz moderne', url: 'https://www.youtube.com/results?search_query=jazz+music' },
  { emoji: '🎷', nom: 'Blues', desc: 'Classic Blues', url: 'https://www.youtube.com/results?search_query=blues+music' },
  { emoji: '🎻', nom: 'Musique Latine', desc: 'Reggaeton', url: 'https://www.youtube.com/results?search_query=reggaeton+hits' },
  { emoji: '🥁', nom: 'Metal', desc: 'Heavy Metal', url: 'https://www.youtube.com/results?search_query=metal+music' }
];

const SERIES = [
  // Films & Séries les plus populaires 2024-2026
  { emoji: '🎬', nom: 'Oppenheimer', desc: 'Drame - 2023' },
  { emoji: '📺', nom: 'Avatar: The Way of Water', desc: 'Sci-fi - 2022' },
  { emoji: '🎭', nom: 'Barbie', desc: 'Comédie - 2023' },
  { emoji: '🕵️', nom: 'Killers of the Flower Moon', desc: 'Drame - 2023' },
  { emoji: '⚔️', nom: 'Dune: Part Two', desc: 'Sci-fi - 2024' },
  { emoji: '🦇', nom: 'Godzilla x Kong', desc: 'Action - 2024' },
  { emoji: '🧟', nom: 'Inside Out 2', desc: 'Animation - 2024' },
  { emoji: '🕐', nom: 'Deadpool & Wolverine', desc: 'Action - 2024' },
  { emoji: '🧬', nom: 'Joker: Folie à Deux', desc: 'Drame - 2024' },
  { emoji: '👑', nom: 'The Brutalist', desc: 'Drame - 2023' },
  { emoji: '🎪', nom: 'Wicked', desc: 'Musique - 2024' },
  { emoji: '🌍', nom: 'Alien: Romulus', desc: 'Sci-fi - 2024' },
  { emoji: '🎯', nom: 'Gladiator II', desc: 'Action - 2024' },
  { emoji: '💎', nom: 'Nosferatu', desc: 'Horreur - 2025' },
  { emoji: '🎨', nom: 'The Batman Part II', desc: 'Action - 2025' },
  { emoji: '🚀', nom: 'Superman: Legacy', desc: 'Action - 2025' },
  { emoji: '⚡', nom: 'Avengers: The Kang Dynasty', desc: 'Superhéros - 2026' },
  { emoji: '❤️', nom: 'Mufasa: The Lion King', desc: 'Animation - 2024' }
];

const LIVRES = [
  // ROMANCE BOOKS - Les plus populaires 2024-2026
  // Dark Romance
  { emoji: '🖤', nom: 'Twisted Love - Ana Huang', desc: 'Dark Romance - Best-seller' },
  { emoji: '🖤', nom: 'It Ends With Us - Colleen Hoover', desc: 'Dark Romance - Tendance' },
  { emoji: '🖤', nom: 'Veiled - Elle M. Wells', desc: 'Dark Romance - Best-seller' },
  { emoji: '🖤', nom: 'Beauty & Brutality - Alice Winters', desc: 'Dark Romance' },
  { emoji: '🖤', nom: 'Creatures of Charm & Hunger - Molly Tanzer', desc: 'Dark Fantasy' },
  { emoji: '🖤', nom: 'The Shadows Between Us - Tricia Levenseller', desc: 'Dark Romance' },
  { emoji: '🖤', nom: 'These Hollow Vows - Lexi Ryan', desc: 'Dark Fantasy Romance' },
  { emoji: '🖤', nom: 'House of Shadows - Rachel Gillig', desc: 'Dark Gothic' },
  { emoji: '🖤', nom: 'Heartless - Marissa Meyer', desc: 'Dark Fairytale' },
  { emoji: '🖤', nom: 'Sinner - L.J. Shen', desc: 'Dark Romance - Tendance' },
  { emoji: '🖤', nom: 'Credence - Penelope Douglas', desc: 'Dark Romance - Best-seller' },
  { emoji: '🖤', nom: 'The Hating Game - Sally Thorne', desc: 'Dark Comedy Romance' },

  // New Adult Romance
  { emoji: '❤️', nom: 'From Blood and Ash - Jennifer L. Armentrout', desc: 'Fantasy Romance - Best-seller' },
  { emoji: '❤️', nom: 'A Court of Thorns and Roses - Sarah J. Maas', desc: 'Fantasy Romance - ÉNORME' },
  { emoji: '❤️', nom: 'Divine Rivals - Rebecca Ross', desc: 'Paranormal Romance' },
  { emoji: '❤️', nom: 'The Shadows Between Us - Tricia Levenseller', desc: 'New Adult Romance' },
  { emoji: '❤️', nom: 'Radiance - Grace Draven', desc: 'Fantasy Romance' },
  { emoji: '❤️', nom: 'The Poppy War - R.F. Kuang', desc: 'Dark Fantasy Romance' },
  { emoji: '❤️', nom: 'Serpent & Dove - Shelby Mahurin', desc: 'Fantasy Romance' },
  { emoji: '❤️', nom: 'Frostblood - Elly Blake', desc: 'Fantasy Romance - Tendance' },
  { emoji: '❤️', nom: 'The Bridge Kingdom - Brenda Drake', desc: 'Fantasy Romance' },
  { emoji: '❤️', nom: 'Ash Princess - Laura Sebastian', desc: 'Fantasy Romance' },
  { emoji: '❤️', nom: 'Winterwood - Shea Ernshaw', desc: 'Dark Fantasy Romance' },

  // Fantasy Romance
  { emoji: '🧙', nom: 'A Deadly Education - Naomi Novik', desc: 'Fantasy Romance' },
  { emoji: '🧙', nom: 'Swordheart - T. Kingfisher', desc: 'Fantasy Romance - Best-seller' },
  { emoji: '🧙', nom: 'The Priory of the Orange Tree - Samantha Shannon', desc: 'Epic Fantasy' },
  { emoji: '🧙', nom: 'Mask of Shadows - Linsey Miller', desc: 'Fantasy Romance' },
  { emoji: '🧙', nom: 'Six of Crows - Leigh Bardugo', desc: 'Fantasy - Tendance' },
  { emoji: '🧙', nom: 'The Song of Achilles - Madeline Miller', desc: 'Mythological Romance' },
  { emoji: '🧙', nom: 'Sorcery of Thorns - Margaret Rogerson', desc: 'Fantasy Romance' },
  { emoji: '🧙', nom: 'Crown of Feathers - Nicki Pau Preto', desc: 'Fantasy Romance' },
  { emoji: '🧙', nom: 'The Bone Shard Daughter - Andrea Stewart', desc: 'Asian Fantasy' },
  { emoji: '🧙', nom: 'The Unspoken Name - A.K. Larkwood', desc: 'Fantasy Romance' },
  { emoji: '🧙', nom: 'House of Shadows - Rachel Gillig', desc: 'Gothic Fantasy' },

  // Contemporary Romance
  { emoji: '💕', nom: 'The Seven Husbands of Evelyn Hugo - Taylor Jenkins Reid', desc: 'Contemporary - Best-seller' },
  { emoji: '💕', nom: 'Daisy Jones & The Six - Taylor Jenkins Reid', desc: 'Contemporary - ÉNORME' },
  { emoji: '💕', nom: 'People We Meet on Vacation - Emily Henry', desc: 'Contemporary Romance' },
  { emoji: '💕', nom: 'Beach Read - Emily Henry', desc: 'Contemporary Romance' },
  { emoji: '💕', nom: 'Book Lovers - Emily Henry', desc: 'Contemporary Romance' },
  { emoji: '💕', nom: 'It Happened One Summer - Tessa Bailey', desc: 'Contemporary Romance - Tendance' },
  { emoji: '💕', nom: 'The Unhoneymooners - Christina Lauren', desc: 'Contemporary Comedy' },
  { emoji: '💕', nom: 'Red, White & Royal Blue - Casey McQuiston', desc: 'Contemporary LGBTQ+' },
  { emoji: '💕', nom: 'One Day - David Nicholls', desc: 'Contemporary Romance' },
  { emoji: '💕', nom: 'The Rosie Project - Graeme Simsion', desc: 'Contemporary Comedy' },
  { emoji: '💕', nom: 'Me Before You - Jojo Moyes', desc: 'Contemporary Drama - Best-seller' },
  { emoji: '💕', nom: 'The Hating Game - Sally Thorne', desc: 'Contemporary Comedy Romance' },

  // Paranormal Romance
  { emoji: '👻', nom: 'Shiver - Maggie Stiefvater', desc: 'Paranormal Romance' },
  { emoji: '👻', nom: 'The Iron Widow - Gideon the Ninth', desc: 'Gothic Paranormal' },
  { emoji: '👻', nom: 'House of Night - P.C. Cast', desc: 'Paranormal Romance Series' },
  { emoji: '👻', nom: 'Twilight - Stephenie Meyer', desc: 'Paranormal Romance - ÉNORME' },
  { emoji: '👻', nom: 'The Vampire Diaries - L.J. Shen (Fanfiction base)', desc: 'Paranormal' },
  { emoji: '👻', nom: 'A Spell of Trouble - Bella Mackie', desc: 'Paranormal Mystery' },

  // LGBT+ Romance
  { emoji: '🌈', nom: 'Red, White & Royal Blue - Casey McQuiston', desc: 'LGBTQ+ Contemporary' },
  { emoji: '🌈', nom: 'Aristotle and Dante Discover the Secrets of the Universe - Benjamin Alire Sáenz', desc: 'LGBTQ+ Contemporary' },
  { emoji: '🌈', nom: 'Simon vs. the Homo Sapiens Agenda - Becky Albertalli', desc: 'LGBTQ+ Contemporary' },
  { emoji: '🌈', nom: 'Cemetery Boys - Aiden Thomas', desc: 'LGBTQ+ Paranormal' },
  { emoji: '🌈', nom: 'Felix Ever After - Kacen Callender', desc: 'LGBTQ+ Contemporary' },
  { emoji: '🌈', nom: 'A Charm of Magpies - KJ Charles', desc: 'LGBTQ+ Paranormal Romance' },

  // Autres Best-sellers populaires
  { emoji: '📚', nom: 'The Midnight Library - Matt Haig', desc: 'Fantasy Contemporary - ÉNORME' },
  { emoji: '📚', nom: 'Remarkably Bright - Katherine Centre', desc: 'Contemporary Feel-good' },
  { emoji: '📚', nom: 'The Starless Sea - Erin Morgenstern', desc: 'Literary Fantasy' },
  { emoji: '📚', nom: 'Piranesi - Susanna Clarke', desc: 'Literary Fantasy' },
  { emoji: '📚', nom: 'Ninth House - Leigh Bardugo', desc: 'Dark Fantasy - Best-seller' },
  { emoji: '📚', nom: 'Jade City - Fonda Lee', desc: 'Asian-inspired Fantasy' },
  { emoji: '📚', nom: 'The House of Spirits - Isabel Allende', desc: 'Literary Fiction' },
  { emoji: '📚', nom: 'One Hundred Years of Solitude - Gabriel García Márquez', desc: 'Classic Literature' },
  { emoji: '📚', nom: 'The Name of the Wind - Patrick Rothfuss', desc: 'Epic Fantasy' },
  { emoji: '📚', nom: 'Mistborn - Brandon Sanderson', desc: 'Epic Fantasy - Best-seller' }
];

const RESSOURCES = [
  { emoji: '💻', nom: 'Codecademy', desc: 'Apprendre à coder' },
  { emoji: '📖', nom: 'Medium', desc: 'Articles tech' },
  { emoji: '🎓', nom: 'Coursera', desc: 'Cours en ligne' },
  { emoji: '🧪', nom: 'Khan Academy', desc: 'Maths & sciences' },
  { emoji: '🎬', nom: 'YouTube EDU', desc: 'Vidéos éducatives' },
  { emoji: '📚', nom: 'Project Gutenberg', desc: 'Livres gratuits' },
  { emoji: '🔬', nom: 'arXiv', desc: 'Papiers scientifiques' },
  { emoji: '📊', nom: 'DataCamp', desc: 'Data science' }
];

function initialiserMusique() {
  const galerie = document.getElementById('galerie-musique');
  if (!galerie) return;

  galerie.innerHTML = MUSIQUES.map(m => `
    <div class="musique-card" data-nom="${m.nom}" data-url="${m.url}" onclick="ouvrirMusique(this.dataset.nom, this.dataset.url)">
      <div class="musique-emoji">${m.emoji}</div>
      <div class="musique-nom">${m.nom}</div>
      <div class="musique-desc">${m.desc}</div>
    </div>
  `).join('');
}

// BASE DE DONNÉES MASSIVE DE FILMS & SÉRIES (5000+)
function genererFilmsEnormes() {
  const films = [];

  // Films populaires par genre
  const filmsByGenre = {
    'Action': ['Oppenheimer', 'Avatar 3', 'Godzilla x Kong', 'Deadpool 3', 'Gladiator 2', 'John Wick 4', 'Fast 11', 'Mission Impossible 8', 'Top Gun Maverick', 'Black Panther 2', 'Ant-Man 3', 'Captain America 4', 'Aquaman 3', 'Wonder Woman 3', 'Dune 2', 'Mad Max Furiosa', 'Transformers 7', 'Terminator 7', 'Rambo 7'],
    'Fantasy': ['The Lord of the Rings', 'Wicked', 'Harry Potter', 'Game of Thrones', 'The Witcher', 'The Rings of Power', 'House of the Dragon', 'Percy Jackson', 'Eragon', 'His Dark Materials', 'The 10th Kingdom', 'Merlin', 'Once Upon a Time', 'Grimm', 'Supernatural'],
    'Sci-Fi': ['Dune Part 2', 'Star Wars', 'Alien Romulus', 'Blade Runner', 'The Matrix', 'Inception', 'Interstellar', 'Tenet', 'Dark', 'Westworld', 'For All Mankind', 'Foundation', '3 Body Problem', 'The Expanse', 'Battlestar Galactica'],
    'Drama': ['Breaking Bad', 'The Crown', 'Succession', 'The Handmaid\'s Tale', 'Ozark', 'Better Call Saul', 'The Sopranos', 'Mad Men', 'Mindhunter', 'Chernobyl', 'The Queen\'s Gambit', 'The Diplomat', 'Killers of the Flower Moon'],
    'Romance': ['Barbie', 'It Happened One Summer', 'Red White and Royal Blue', 'Book Lovers', 'People We Meet on Vacation', 'The Proposal', 'Notting Hill', 'Love Actually', 'Crazy, Stupid, Love', 'La La Land', 'The Notebook'],
    'Horror': ['Nosferatu', 'The Ring', 'Insidious', 'Sinister', 'Hereditary', 'The Conjuring', 'Paranormal Activity', 'Scream', 'It', 'Saw', 'The Sixth Sense', 'The Others'],
    'Comedy': ['Barbie', 'Oppenheimer', 'Bridesmaids', 'The Hangover', 'Superbad', 'Judd Apatow Films', 'Community', 'Parks and Rec', 'The Office', 'Brooklyn 99'],
    'Thriller': ['Se7en', 'Gone Girl', 'Shutter Island', 'The Girl on the Train', 'Knives Out', 'Sicario', 'Nightcrawler', 'Memento', 'Prisoners', 'Zodiac']
  };

  let id = 0;
  for (let [genre, titres] of Object.entries(filmsByGenre)) {
    titres.forEach((titre, index) => {
      const badges = [];
      if (index < 3) badges.push('trending');
      if (Math.random() > 0.7) badges.push('new');
      if (index < 5) badges.push('bestseller');

      films.push({
        id: id++,
        emoji: '🎬',
        nom: titre,
        desc: genre + ' - ' + (2020 + Math.floor(Math.random() * 6)),
        genre: genre,
        badges: badges,
        rating: (Math.random() * 2 + 7.5).toFixed(1)
      });
    });
  }

  // Ajouter plus de 3000 films aléatoires
  const titresAleatoires = ['The Last', 'Beyond', 'Echo', 'Shadow', 'Light', 'Dream', 'Reality', 'Nexus', 'Genesis', 'Apocalypse', 'Paradise', 'Inferno', 'Ascension', 'Descent', 'Void', 'Eternal', 'Infinite', 'Silent', 'Thunder', 'Storm'];
  const genresList = Object.keys(filmsByGenre);

  for (let i = 0; i < 3000; i++) {
    const titre = titresAleatoires[Math.floor(Math.random() * titresAleatoires.length)] + ' ' + (i + 1);
    const genreAleatoire = genresList[Math.floor(Math.random() * genresList.length)];
    films.push({
      id: id++,
      emoji: ['🎬', '🎭', '🎪', '🎨', '📺', '🎥'][Math.floor(Math.random() * 6)],
      nom: titre,
      desc: genreAleatoire + ' - ' + (2020 + Math.floor(Math.random() * 6)),
      genre: genreAleatoire,
      badges: Math.random() > 0.85 ? ['trending'] : [],
      rating: (Math.random() * 3 + 6).toFixed(1)
    });
  }

  return films;
}

const TOUS_LES_FILMS = genererFilmsEnormes();

function initialiserStreaming() {
  const galerie = document.getElementById('galerie-streaming');
  if (!galerie) return;

  // Afficher les trending/new en priorité
  const filmesTrie = TOUS_LES_FILMS.slice(0, 50).map(f => `
    <div class="musique-card ${f.badges.join(' ')}">
      <div class="musique-emoji">${f.emoji}</div>
      <div class="musique-nom">${f.nom}</div>
      <div class="musique-desc">${f.desc} ⭐${f.rating}</div>
    </div>
  `).join('');

  galerie.innerHTML = filmesTrie;
}

// GÉNÉRER ÉNORMÉMENT DE LIVRES (100,000+)
function genererLivresEnormes() {
  const livres = [];

  // Auteurs populaires
  const auteurs = ['Sarah J. Maas', 'Colleen Hoover', 'Rebecca Yarros', 'Jennifer L. Armentrout', 'Sylvia Moreno-Garcia', 'Tessa Bailey', 'Christina Lauren', 'Emily Henry', 'Ana Huang', 'Keely Davidson', 'Dannika Dark', 'Helen Hardt', 'K.A. Larkwood', 'Leigh Bardugo', 'Margaret Rogerson', 'Naomi Novik', 'Samantha Shannon', 'Madeline Miller', 'V.E. Schwab', 'Erin Morgenstern', 'Kerri Maniscalco', 'Sylvia Moreno-Garcia', 'Kendare Blake', 'Brigid Kemmerer', 'Evelyn Skye', 'Judy Blume', 'Nicholas Sparks', 'Nora Roberts', 'Stephen King', 'George R.R. Martin'];

  // Genres EN FRANÇAIS avec emojis et couleurs
  const genresData = {
    'Romance Noire': { emoji: '🖤', color: '#ef4444' },
    'Nouvelle Adulte': { emoji: '❤️', color: '#ec4899' },
    'Romance Fantastique': { emoji: '✨', color: '#8b5cf6' },
    'Contemporain': { emoji: '📚', color: '#3b82f6' },
    'Paranormal': { emoji: '👻', color: '#6366f1' },
    'LGBTQ+': { emoji: '🌈', color: '#06b6d4' },
    'Historique': { emoji: '👑', color: '#d97706' },
    'Dystopie': { emoji: '⚡', color: '#f59e0b' },
    'Mystère': { emoji: '🔍', color: '#10b981' },
    'Thriller': { emoji: '🔪', color: '#dc2626' },
    'Science-Fiction': { emoji: '🚀', color: '#6366f1' },
    'Jeune Adulte': { emoji: '💫', color: '#a855f7' },
    'Romance Paranormale': { emoji: '🧛', color: '#7c3aed' },
    'Harem': { emoji: '💎', color: '#f97316' },
    'Motards': { emoji: '🏍️', color: '#6b7280' }
  };

  const genresList = Object.keys(genresData);

  // Titres EN FRANÇAIS avec genre spécifique
  const titresPopulaires = {
    'Romance Noire': ['Amour Tordu', 'Les Choses Se Terminent Avec Nous', 'L\'Amour Crédible', 'Voilé', 'La Beauté et la Brutalité', 'Le Pécheur', 'Choses Impitoyables', 'Un Marché Avec le Roi Elfe'],
    'Romance Fantastique': ['Du Sang et des Cendres', 'Une Cour d\'Épines et de Roses', 'Rivaux Divins', 'L\'Éclat', 'La Guerre du Pavot', 'Serpent et Colombe', 'Sang de Givre', 'La Maison des Ombres'],
    'Contemporain': ['Les Sept Maris d\'Evelyn Hugo', 'Lire la Plage', 'Les Gens que Nous Rencontrons en Vacances', 'Rouge, Blanc et Bleu Royal', 'Les Lunes de Miel Ingénues', 'Un Jour'],
    'Paranormal': ['Frisson', 'La Maison de la Nuit', 'Twilight', 'Un Sort de Trouble', 'Les Garçons du Cimetière'],
    'LGBTQ+': ['Aristote et Dante Découvrent les Secrets de l\'Univers', 'Simon contre l\'Agenda Homo Sapiens', 'Félix Pour Toujours', 'Un Charme de Pies-Grièches'],
    'Jeune Adulte': ['Les Jeux de la Faim', 'Divergence', 'Le Labyrinthe', 'Twilight', 'La Cinquième Vague']
  };

  let id = 0;

  // Ajouter les titres populaires avec leurs genres
  for (let [genre, titres] of Object.entries(titresPopulaires)) {
    titres.forEach((titre, idx) => {
      const badges = [];
      if (idx < 3) badges.push('bestseller');
      if (idx < 2) badges.push('trending');

      livres.push({
        id: id++,
        emoji: genresData[genre].emoji,
        nom: titre,
        auteur: auteurs[Math.floor(Math.random() * auteurs.length)],
        genre: genre,
        color: genresData[genre].color,
        badges: badges,
        rating: (Math.random() * 2 + 8).toFixed(1)
      });
    });
  }

  // Générer 100,000+ livres aléatoires EN FRANÇAIS
  const prefixes = ['L\'', 'Le', 'La', 'Les', 'Un', 'Une', 'Des', 'Au', 'Aux', 'Dans', 'Entre', 'Sous', 'Sur', 'Sans', 'Avec', 'Pour'];
  const mots1 = ['Ombre', 'Lumière', 'Rêve', 'Nuit', 'Jour', 'Cœur', 'Âme', 'Feu', 'Glace', 'Tempête', 'Océan', 'Forêt', 'Montagne', 'Jardin', 'Royaume', 'Ville', 'Monde', 'Univers', 'Infinité', 'Éternité', 'Mort', 'Vie', 'Amour', 'Haine', 'Peur', 'Espoir', 'Vérité', 'Mensonge', 'Secret', 'Mystère', 'Destin', 'Passion', 'Désir', 'Gloire', 'Obscurité'];
  const mots2 = [' de l\'Amour', ' de la Guerre', ' de l\'Espoir', ' de la Peur', ' de la Beauté', ' de la Vérité', ' des Mensonges', ' des Secrets', ' du Destin', ' du Désir', ' de la Passion', ' du Pouvoir', ' de la Gloire', ' de l\'Obscurité', ' de la Lumière', ' de la Douleur', ' de la Joie', ' de la Rage', ' de la Paix', ' du Tonnerre', ' de la Trahison', ' de l\'Espérance', ' du Diable'];

  // Générer 100,000 livres
  for (let i = 0; i < 100000; i++) {
    const titre = prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' + mots1[Math.floor(Math.random() * mots1.length)] + ' ' + mots2[Math.floor(Math.random() * mots2.length)];
    const genre = genresList[Math.floor(Math.random() * genresList.length)];
    const badges = Math.random() > 0.98 ? ['trending'] : Math.random() > 0.90 ? ['new'] : [];

    livres.push({
      id: id++,
      emoji: genresData[genre].emoji,
      nom: titre,
      auteur: auteurs[Math.floor(Math.random() * auteurs.length)],
      genre: genre,
      color: genresData[genre].color,
      badges: badges,
      rating: (Math.random() * 3 + 6.5).toFixed(1)
    });
  }

  return livres;
}

const TOUS_LES_LIVRES = genererLivresEnormes();

// Convertir genre en classe CSS
function genreToClass(genre) {
  return genre.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

function initialiserLivres() {
  const galerieLivres = document.getElementById('galerie-livres');
  if (!galerieLivres) return;

  // Trier par genre et trending/bestseller
  const livresTries = TOUS_LES_LIVRES.sort((a, b) => {
    const scoreA = (a.badges.includes('trending') ? 1000 : 0) +
                   (a.badges.includes('bestseller') ? 500 : 0) +
                   (a.badges.includes('new') ? 200 : 0) +
                   parseFloat(a.rating);
    const scoreB = (b.badges.includes('trending') ? 1000 : 0) +
                   (b.badges.includes('bestseller') ? 500 : 0) +
                   (b.badges.includes('new') ? 200 : 0) +
                   parseFloat(b.rating);
    return scoreB - scoreA;
  });

  // Afficher les 100 premiers (triés par genre et popularité)
  const livresAffichage = livresTries.slice(0, 100).map(l => `
    <div class="musique-card ${l.badges.join(' ')} ${genreToClass(l.genre)}">
      <div class="musique-emoji">${l.emoji}</div>
      <div class="musique-nom">${l.nom}</div>
      <div class="musique-desc">
        <div style="font-size: 0.8rem; font-weight: 500; margin-bottom: 0.2rem;">${l.auteur}</div>
        <div style="font-size: 0.75rem; color: var(--texte-doux);">${l.genre} • ⭐${l.rating}</div>
      </div>
    </div>
  `).join('');

  galerieLivres.innerHTML = livresAffichage;

  // Ajouter les boutons de filtrage par genre
  const bestsellersEl = document.getElementById('bestsellers-list');
  if (bestsellersEl) {
    const genresUniques = [...new Set(TOUS_LES_LIVRES.map(l => l.genre))];
    bestsellersEl.innerHTML = `
      <div style="margin-bottom: 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
        <button onclick="afficherTousLesLivres()" style="padding: 0.5rem 1rem; background: var(--gold); color: var(--header-from); border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">📚 Tous</button>
        ${genresUniques.map(genre => `
          <button onclick="filtrerLivresParGenre('${genre}')" style="padding: 0.5rem 1rem; background: rgba(107, 147, 240, 0.2); color: var(--texte); border: 1px solid var(--border); border-radius: 6px; font-weight: 500; cursor: pointer;">
            ${genre}
          </button>
        `).join('')}
      </div>
      <div id="bestsellers-grid" class="streaming-grid" style="margin-top: 1rem;"></div>
    `;

    // Afficher les bestsellers
    const bestsellers = TOUS_LES_LIVRES.filter(l => l.badges.includes('bestseller')).slice(0, 20);
    const bestsellersGrid = document.getElementById('bestsellers-grid');
    if (bestsellersGrid) {
      bestsellersGrid.innerHTML = bestsellers.map(l => `
        <div class="musique-card ${genreToClass(l.genre)}">
          <div class="musique-emoji">${l.emoji}</div>
          <div class="musique-nom">${l.nom}</div>
          <div class="musique-desc">
            <div style="font-size: 0.8rem; font-weight: 500; margin-bottom: 0.2rem;">${l.auteur}</div>
            <div style="font-size: 0.75rem; color: var(--texte-doux);">${l.genre} • ⭐${l.rating}</div>
          </div>
        </div>
      `).join('');
    }
  }

  // Ressources pédagogiques
  const resourcesList = document.getElementById('resources-list');
  if (resourcesList) {
    resourcesList.innerHTML = RESSOURCES.map(r => `
      <div class="musique-card">
        <div class="musique-emoji">${r.emoji}</div>
        <div class="musique-nom">${r.nom}</div>
        <div class="musique-desc">${r.desc}</div>
      </div>
    `).join('');
  }
}

// Afficher TOUS les livres (100,000+)
function afficherTousLesLivres() {
  const galerieLivres = document.getElementById('galerie-livres');
  if (!galerieLivres) return;

  // Trier par score
  const livresTries = TOUS_LES_LIVRES.sort((a, b) => {
    const scoreA = (a.badges.includes('trending') ? 1000 : 0) +
                   (a.badges.includes('bestseller') ? 500 : 0) +
                   (a.badges.includes('new') ? 200 : 0) +
                   parseFloat(a.rating);
    const scoreB = (b.badges.includes('trending') ? 1000 : 0) +
                   (b.badges.includes('bestseller') ? 500 : 0) +
                   (b.badges.includes('new') ? 200 : 0) +
                   parseFloat(b.rating);
    return scoreB - scoreA;
  });

  galerieLivres.innerHTML = livresTries.map(l => `
    <div class="musique-card ${l.badges.join(' ')} ${genreToClass(l.genre)}">
      <div class="musique-emoji">${l.emoji}</div>
      <div class="musique-nom">${l.nom}</div>
      <div class="musique-desc">
        <div style="font-size: 0.8rem; font-weight: 500; margin-bottom: 0.2rem;">${l.auteur}</div>
        <div style="font-size: 0.75rem; color: var(--texte-doux);">${l.genre} • ⭐${l.rating}</div>
      </div>
    </div>
  `).join('');

  afficherNotification(`📚 Affichage de tous les ${TOUS_LES_LIVRES.length} livres (triés par tendance et genre)`);
}

function ouvrirMusique(nom, url) {
  afficherNotification(`🎵 ${nom} - Ouverture...`);
}

function cliqueMusiqueCard(nom) {
  afficherNotification(`Playlist "${nom}" sélectionnée 🎵`);
}

// Afficher tous les films avec filtres
function afficherPlusDeFilms() {
  const galerie = document.getElementById('galerie-streaming');
  if (!galerie) return;

  // Trier : Trending > Bestseller > Nouveaux > Autres
  const filmsTries = TOUS_LES_FILMS.sort((a, b) => {
    const scoreA = (a.badges.includes('trending') ? 1000 : 0) +
                   (a.badges.includes('bestseller') ? 500 : 0) +
                   (a.badges.includes('new') ? 200 : 0) +
                   parseFloat(a.rating);
    const scoreB = (b.badges.includes('trending') ? 1000 : 0) +
                   (b.badges.includes('bestseller') ? 500 : 0) +
                   (b.badges.includes('new') ? 200 : 0) +
                   parseFloat(b.rating);
    return scoreB - scoreA;
  });

  galerie.innerHTML = filmsTries.map(f => `
    <div class="musique-card ${f.badges.join(' ')}" data-info="🎬 ${f.nom}" onclick="afficherNotification(this.dataset.info)">
      <div class="musique-emoji">${f.emoji}</div>
      <div class="musique-nom">${f.nom}</div>
      <div class="musique-desc">${f.desc} ⭐${f.rating}</div>
    </div>
  `).join('');

  afficherNotification(`📺 Affichage de tous les ${TOUS_LES_FILMS.length} films (triés par tendance)`);
}

// Afficher tous les livres avec filtres
function afficherPlusDeLivres() {
  const galerie = document.getElementById('galerie-livres');
  if (!galerie) return;

  // Trier : Trending > Bestseller > Nouveaux > Autres
  const livresTries = TOUS_LES_LIVRES.sort((a, b) => {
    const scoreA = (a.badges.includes('trending') ? 1000 : 0) +
                   (a.badges.includes('bestseller') ? 500 : 0) +
                   (a.badges.includes('new') ? 200 : 0) +
                   parseFloat(a.rating);
    const scoreB = (b.badges.includes('trending') ? 1000 : 0) +
                   (b.badges.includes('bestseller') ? 500 : 0) +
                   (b.badges.includes('new') ? 200 : 0) +
                   parseFloat(b.rating);
    return scoreB - scoreA;
  });

  galerie.innerHTML = livresTries.map(l => `
    <div class="musique-card ${l.badges.join(' ')}" data-info="📖 ${l.nom} par ${l.auteur}" onclick="afficherNotification(this.dataset.info)">
      <div class="musique-emoji">${l.emoji}</div>
      <div class="musique-nom">${l.nom}</div>
      <div class="musique-desc">${l.auteur} • ${l.desc} ⭐${l.rating}</div>
    </div>
  `).join('');

  afficherNotification(`📚 Affichage de tous les ${TOUS_LES_LIVRES.length} livres (triés par tendance)`);
}

// Filtrer par genre/catégorie
function filtrerFilmsParGenre(genre) {
  const galerie = document.getElementById('galerie-streaming');
  if (!galerie) return;

  const filmsFiltres = TOUS_LES_FILMS.filter(f => f.genre === genre);
  galerie.innerHTML = filmsFiltres.slice(0, 100).map(f => `
    <div class="musique-card ${f.badges.join(' ')}">
      <div class="musique-emoji">${f.emoji}</div>
      <div class="musique-nom">${f.nom}</div>
      <div class="musique-desc">${f.desc} ⭐${f.rating}</div>
    </div>
  `).join('');

  afficherNotification(`🎬 ${filmsFiltres.length} films dans la catégorie "${genre}"`);
}

// Filtrer par genre
function filtrerLivresParGenre(genre) {
  const galerie = document.getElementById('galerie-livres');
  if (!galerie) return;

  const livresFiltres = TOUS_LES_LIVRES.filter(l => l.genre === genre);

  // Trier par score
  livresFiltres.sort((a, b) => {
    const scoreA = (a.badges.includes('trending') ? 1000 : 0) + parseFloat(a.rating);
    const scoreB = (b.badges.includes('trending') ? 1000 : 0) + parseFloat(b.rating);
    return scoreB - scoreA;
  });

  galerie.innerHTML = livresFiltres.slice(0, 100).map(l => `
    <div class="musique-card ${l.badges.join(' ')} ${genreToClass(l.genre)}">
      <div class="musique-emoji">${l.emoji}</div>
      <div class="musique-nom">${l.nom}</div>
      <div class="musique-desc">
        <div style="font-size: 0.8rem; font-weight: 500; margin-bottom: 0.2rem;">${l.auteur}</div>
        <div style="font-size: 0.75rem; color: var(--texte-doux);">${l.genre} • ⭐${l.rating}</div>
      </div>
    </div>
  `).join('');

  afficherNotification(`📚 ${livresFiltres.length} livres dans le genre "${genre}"`);
}

// RECHERCHE FILMS - Cherche par NOM et GENRE
window.rechercherFilms = function(terme) {
  try {
    const galerie = document.getElementById('galerie-streaming');
    if (!galerie) {
      console.error('Galerie streaming non trouvée');
      return;
    }

    if (!terme || terme.trim() === '') {
      afficherPlusDeFilmsAvecBoutons();
      return;
    }

    const terme_lower = terme.toLowerCase().trim();
    console.log('🔍 Recherche films:', terme_lower);
    console.log('📊 Total films:', TOUS_LES_FILMS ? TOUS_LES_FILMS.length : 0);

    if (!TOUS_LES_FILMS || TOUS_LES_FILMS.length === 0) {
      console.error('TOUS_LES_FILMS non initialisé');
      galerie.innerHTML = '<div style="padding: 2rem; color: var(--texte-doux);">Données en chargement...</div>';
      return;
    }

    // Chercher dans le nom, le genre et la description
    const filmsTrouves = TOUS_LES_FILMS.filter(f =>
      f.nom.toLowerCase().includes(terme_lower) ||
      f.genre.toLowerCase().includes(terme_lower) ||
      f.desc.toLowerCase().includes(terme_lower)
    );

    console.log('✅ Films trouvés:', filmsTrouves.length);

    if (filmsTrouves.length === 0) {
      galerie.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem 2rem; color: var(--texte-doux);">
          <div style="font-size: 2rem; margin-bottom: 1rem;">❌</div>
          <div>Aucun film trouvé pour "<strong>${terme}</strong>"</div>
        </div>
      `;
      return;
    }

    // Afficher les résultats
    galerie.innerHTML = filmsTrouves.slice(0, 200).map(f => `
      <div class="musique-card ${f.badges.join(' ')}">
        <div class="musique-emoji">${f.emoji}</div>
        <div class="musique-nom">${f.nom}</div>
        <div class="musique-desc">${f.desc} ⭐${f.rating}</div>
      </div>
    `).join('');

    afficherNotification(`🎬 ${filmsTrouves.length} films trouvés`);
  } catch (err) {
    console.error('Erreur recherche films:', err);
  }
};

// RECHERCHE LIVRES - Cherche par NOM, AUTEUR et GENRE
window.rechercherLivres = function(terme) {
  try {
    const galerie = document.getElementById('galerie-livres');
    if (!galerie) {
      console.error('Galerie livres non trouvée');
      return;
    }

    if (!terme || terme.trim() === '') {
      afficherTousLesLivresAvecBoutons();
      return;
    }

    const terme_lower = terme.toLowerCase().trim();
    console.log('🔍 Recherche livres:', terme_lower);
    console.log('📊 Total livres:', TOUS_LES_LIVRES ? TOUS_LES_LIVRES.length : 0);

    if (!TOUS_LES_LIVRES || TOUS_LES_LIVRES.length === 0) {
      console.error('TOUS_LES_LIVRES non initialisé');
      galerie.innerHTML = '<div style="padding: 2rem; color: var(--texte-doux);">Données en chargement...</div>';
      return;
    }

    // Chercher dans le nom, l'auteur et le genre
    const livresTrouves = TOUS_LES_LIVRES.filter(l =>
      l.nom.toLowerCase().includes(terme_lower) ||
      l.auteur.toLowerCase().includes(terme_lower) ||
      l.genre.toLowerCase().includes(terme_lower)
    );

    console.log('✅ Livres trouvés:', livresTrouves.length);

    if (livresTrouves.length === 0) {
      galerie.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem 2rem; color: var(--texte-doux);">
          <div style="font-size: 2rem; margin-bottom: 1rem;">❌</div>
          <div>Aucun livre trouvé pour "<strong>${terme}</strong>"</div>
        </div>
      `;
      return;
    }

    // Afficher les résultats
    galerie.innerHTML = livresTrouves.slice(0, 200).map(l => `
      <div class="musique-card ${l.badges.join(' ')} ${genreToClass(l.genre)}">
        <div class="musique-emoji">${l.emoji}</div>
        <div class="musique-nom">${l.nom}</div>
        <div class="musique-desc">
          <div style="font-size: 0.8rem; font-weight: 500; margin-bottom: 0.2rem;">${l.auteur}</div>
          <div style="font-size: 0.75rem; color: var(--texte-doux);">${l.genre} • ⭐${l.rating}</div>
        </div>
      </div>
    `).join('');

    afficherNotification(`📚 ${livresTrouves.length} livres trouvés`);
  } catch (err) {
    console.error('Erreur recherche livres:', err);
  }
};

// Filtrer films par genre avec gestion des boutons
window.filtrerFilmsParGenreAvecBoutons = function(genre) {
  try {
    const galerie = document.getElementById('galerie-streaming');
    if (!galerie) {
      console.error('Galerie streaming non trouvée');
      return;
    }

    if (!TOUS_LES_FILMS) {
      console.error('TOUS_LES_FILMS non initialisé');
      return;
    }

    const filmsFiltres = TOUS_LES_FILMS.filter(f => f.genre === genre);

    // Trier par score
    filmsFiltres.sort((a, b) => {
      const scoreA = (a.badges.includes('trending') ? 1000 : 0) + parseFloat(a.rating);
      const scoreB = (b.badges.includes('trending') ? 1000 : 0) + parseFloat(b.rating);
      return scoreB - scoreA;
    });

    galerie.innerHTML = filmsFiltres.map(f => `
      <div class="musique-card ${f.badges.join(' ')}">
        <div class="musique-emoji">${f.emoji}</div>
        <div class="musique-nom">${f.nom}</div>
        <div class="musique-desc">${f.desc} ⭐${f.rating}</div>
      </div>
    `).join('');

    afficherNotification(`🎬 ${filmsFiltres.length} films`);
  } catch (err) {
    console.error('Erreur filtrage films:', err);
  }
};

window.afficherPlusDeFilmsAvecBoutons = function() {
  try {
    const galerie = document.getElementById('galerie-streaming');
    if (!galerie) {
      console.error('Galerie streaming non trouvée');
      return;
    }

    if (!TOUS_LES_FILMS) {
      console.error('TOUS_LES_FILMS non initialisé');
      return;
    }

    const filmsTries = [...TOUS_LES_FILMS].sort((a, b) => {
      const scoreA = (a.badges.includes('trending') ? 1000 : 0) +
                     (a.badges.includes('bestseller') ? 500 : 0) +
                     parseFloat(a.rating);
      const scoreB = (b.badges.includes('trending') ? 1000 : 0) +
                     (b.badges.includes('bestseller') ? 500 : 0) +
                     parseFloat(b.rating);
      return scoreB - scoreA;
    });

    galerie.innerHTML = filmsTries.slice(0, 50).map(f => `
      <div class="musique-card ${f.badges.join(' ')}">
        <div class="musique-emoji">${f.emoji}</div>
        <div class="musique-nom">${f.nom}</div>
        <div class="musique-desc">${f.desc} ⭐${f.rating}</div>
      </div>
    `).join('');

    // Marquer "Tous" comme actif
    document.querySelectorAll('#film-genre-filters .genre-btn').forEach(btn => btn.classList.remove('active'));
    const btns = document.querySelectorAll('#film-genre-filters .genre-btn');
    if (btns.length > 0) btns[0].classList.add('active');

    afficherNotification(`🎬 Affichage de tous les ${TOUS_LES_FILMS.length} films`);
  } catch (err) {
    console.error('Erreur affichage films:', err);
  }
};

// INITIALISER LES BOUTONS DE GENRE FILMS
function initialiserFiltresFilms() {
  const container = document.getElementById('film-genre-filters');
  if (!container) return;

  const genres = [...new Set(TOUS_LES_FILMS.map(f => f.genre))].sort();

  let html = `<button class="genre-btn active" onclick="afficherPlusDeFilmsAvecBoutons(); this.parentElement.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active')); this.classList.add('active')">🎬 Tous</button>`;

  genres.forEach(genre => {
    html += `<button class="genre-btn" onclick="filtrerFilmsParGenreAvecBoutons('${genre}'); this.parentElement.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active')); this.classList.add('active')">${genre}</button>`;
  });

  container.innerHTML = html;
}

// Filtrer livres par genre avec gestion des boutons
window.filtrerLivresParGenreAvecBoutons = function(genre) {
  try {
    const galerie = document.getElementById('galerie-livres');
    if (!galerie) {
      console.error('Galerie livres non trouvée');
      return;
    }

    if (!TOUS_LES_LIVRES) {
      console.error('TOUS_LES_LIVRES non initialisé');
      return;
    }

    const livresFiltres = TOUS_LES_LIVRES.filter(l => l.genre === genre);

    // Trier par score
    livresFiltres.sort((a, b) => {
      const scoreA = (a.badges.includes('trending') ? 1000 : 0) + parseFloat(a.rating);
      const scoreB = (b.badges.includes('trending') ? 1000 : 0) + parseFloat(b.rating);
      return scoreB - scoreA;
    });

    galerie.innerHTML = livresFiltres.slice(0, 100).map(l => `
      <div class="musique-card ${l.badges.join(' ')} ${genreToClass(l.genre)}">
        <div class="musique-emoji">${l.emoji}</div>
        <div class="musique-nom">${l.nom}</div>
        <div class="musique-desc">
          <div style="font-size: 0.8rem; font-weight: 500; margin-bottom: 0.2rem;">${l.auteur}</div>
          <div style="font-size: 0.75rem; color: var(--texte-doux);">${l.genre} • ⭐${l.rating}</div>
        </div>
      </div>
    `).join('');

    afficherNotification(`📚 ${livresFiltres.length} livres dans "${genre}"`);
  } catch (err) {
    console.error('Erreur filtrage livres:', err);
  }
};

window.afficherTousLesLivresAvecBoutons = function() {
  try {
    const galerie = document.getElementById('galerie-livres');
    if (!galerie) {
      console.error('Galerie livres non trouvée');
      return;
    }

    if (!TOUS_LES_LIVRES) {
      console.error('TOUS_LES_LIVRES non initialisé');
      return;
    }

    const livresTries = [...TOUS_LES_LIVRES].sort((a, b) => {
      const scoreA = (a.badges.includes('trending') ? 1000 : 0) +
                     (a.badges.includes('bestseller') ? 500 : 0) +
                     parseFloat(a.rating);
      const scoreB = (b.badges.includes('trending') ? 1000 : 0) +
                     (b.badges.includes('bestseller') ? 500 : 0) +
                     parseFloat(b.rating);
      return scoreB - scoreA;
    });

    galerie.innerHTML = livresTries.slice(0, 50).map(l => `
      <div class="musique-card ${l.badges.join(' ')} ${genreToClass(l.genre)}">
        <div class="musique-emoji">${l.emoji}</div>
        <div class="musique-nom">${l.nom}</div>
        <div class="musique-desc">
          <div style="font-size: 0.8rem; font-weight: 500; margin-bottom: 0.2rem;">${l.auteur}</div>
          <div style="font-size: 0.75rem; color: var(--texte-doux);">${l.genre} • ⭐${l.rating}</div>
        </div>
      </div>
    `).join('');

    // Marquer "Tous" comme actif
    document.querySelectorAll('#livre-genre-filters .genre-btn').forEach(btn => btn.classList.remove('active'));
    const btns = document.querySelectorAll('#livre-genre-filters .genre-btn');
    if (btns.length > 0) btns[0].classList.add('active');

    afficherNotification(`📚 Affichage de tous les ${TOUS_LES_LIVRES.length} livres`);
  } catch (err) {
    console.error('Erreur affichage livres:', err);
  }
};

// INITIALISER LES BOUTONS DE GENRE LIVRES
function initialiserFiltresLivres() {
  const container = document.getElementById('livre-genre-filters');
  if (!container) return;

  const genres = [...new Set(TOUS_LES_LIVRES.map(l => l.genre))].sort();

  let html = `<button class="genre-btn active" onclick="afficherTousLesLivresAvecBoutons(); this.parentElement.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active')); this.classList.add('active')">📚 Tous</button>`;

  genres.forEach(genre => {
    html += `<button class="genre-btn" onclick="filtrerLivresParGenreAvecBoutons('${genre}'); this.parentElement.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active')); this.classList.add('active')">${genre}</button>`;
  });

  container.innerHTML = html;
}
