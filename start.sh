#!/usr/bin/env bash
# start.sh — Nettoie les ports et démarre le serveur localement
# Usage:
#   ./start.sh            → Express / Node.js (défaut)
#   ./start.sh docker     → build Docker + run
#   ./start.sh python     → FastAPI / uvicorn

set -e

# ── 1. Nettoyage des ports ───────────────────────────────────
echo "🧹  Nettoyage des ports 3000 et 8000..."
for PORT in 3000 8000; do
  PID=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo "    → Kill PID $PID sur le port $PORT"
    kill -9 "$PID" 2>/dev/null || true
  else
    echo "    → Port $PORT libre"
  fi
done
echo ""

# ── 2. Démarrage selon le mode ───────────────────────────────
MODE="${1:-node}"

case "$MODE" in
  docker)
    echo "🐳  Build Docker + run (port 3000)..."
    docker build -t charbot .
    docker run --rm -p 3000:3000 charbot
    ;;
  python)
    echo "🐍  Installation des dépendances Python..."
    pip install -r requirements.python.txt
    echo "🐍  Démarrage FastAPI / uvicorn (port 8000)..."
    python3 -m uvicorn main:app --reload --port 8000
    ;;
  *)
    echo "🚀  Démarrage Express / Node.js (port 3000)..."
    npm start
    ;;
esac
