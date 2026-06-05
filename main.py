# ============================================================
# Tunnel FastAPI → Claude
# La clé API est lue depuis le fichier .env automatiquement.
#
# Lancer : python3 -m uvicorn main:app --reload
# Docs   : http://localhost:8000/docs
# ============================================================

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import anthropic

# Charge le fichier .env depuis le même dossier que main.py
try:
    from dotenv import load_dotenv
    _env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    load_dotenv(_env_path)
except ImportError:
    pass

# Récupère la clé API depuis l'environnement
API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

if not API_KEY:
    print("⚠  ANTHROPIC_API_KEY introuvable dans .env ou les variables d'environnement.")

app = FastAPI(title="Tunnel Claude", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

# ── Modèles ───────────────────────────────────────────────────────────────────

class Message(BaseModel):
    role: str
    content: str

class RequeteChat(BaseModel):
    historique: List[Message]
    personnalite: str = "tech"

# ── System prompts par spécialité ─────────────────────────────────────────────

PERSONNALITES = {
    "tech": (
        "Tu es un expert en technologie avec 15 ans d'expérience. Tu maîtrises la programmation, l'IA, le web, les frameworks. "
        "Explique les concepts tech de façon accessible mais précise. Donne des exemples de code si pertinent. "
        "Sois direct, technique mais compréhensible. Réponds en français."
    ),
    "science": (
        "Tu es un chercheur scientifique avec expertise en physique, chimie et biologie. Explique les phénomènes naturels avec rigueur. "
        "Utilise des exemples concrets et des analogies. Sois passionné mais pédagogue. "
        "Réponds en français, reste actuel sur les découvertes."
    ),
    "art": (
        "Tu es un artiste créatif pluridisciplinaire : peinture, design, musique. Tu inspires la créativité, penses en couleurs et en formes. "
        "Encourage l'expression artistique. Parle avec passion de l'art. Sois poétique et imaginatif. Réponds en français."
    ),
    "biz": (
        "Tu es un coach business et entrepreneur à succès. Expertise en stratégie, marketing, finance et croissance. "
        "Tu donnes des conseils concrets et applicables. Sois direct, pragmatique, orienté résultats. "
        "Réponds en français, partage des cas réels."
    ),
    "wellness": (
        "Tu es un coach wellness holistique : nutrition, sport, mindfulness, santé mentale. "
        "Tu combines science et sagesse pratique. Motivant mais réaliste. Personnalise tes conseils. "
        "Sois bienveillant et encourageant. Réponds en français."
    ),
    "storyteller": (
        "Tu es un conteur et écrivain renommé. Maître de la narration, des métaphores, de la mythologie. "
        "Rends chaque sujet captivant comme une histoire. Sois littéraire et imaginatif. Inspire par les récits. "
        "Réponds en français avec élégance."
    )
}

# ── Route principale ──────────────────────────────────────────────────────────

@app.post("/chat")
async def chat(req: RequeteChat):
    if not API_KEY:
        raise HTTPException(500, "Clé API introuvable. Vérifie le fichier .env.")

    try:
        client = anthropic.Anthropic(api_key=API_KEY)
        messages = [m.model_dump() for m in req.historique]

        # Sélectionne le prompt selon la personnalité
        system_prompt = PERSONNALITES.get(req.personnalite, PERSONNALITES["tech"])

        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=1024,
            system=[{
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"}
            }],
            messages=messages
        )

        texte = "".join(b.text for b in response.content if hasattr(b, "text") and b.text)
        return {"text": texte.strip() or "Aucune réponse obtenue."}

    except anthropic.AuthenticationError:
        raise HTTPException(401, "Clé API invalide.")
    except anthropic.RateLimitError:
        raise HTTPException(429, "Quota dépassé, réessaie dans un moment.")
    except Exception as e:
        raise HTTPException(500, str(e))

# ── Santé ─────────────────────────────────────────────────────────────────────

@app.get("/")
def index():
    return {"status": "ok", "cle_presente": bool(API_KEY)}

# Servir les fichiers statiques
app.mount("/", StaticFiles(directory=".", html=True), name="static")
