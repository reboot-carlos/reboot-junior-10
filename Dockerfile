FROM node:20-slim

WORKDIR /app

# Install production dependencies (cached layer — only re-runs when package.json changes)
COPY package.json ./
RUN npm install --omit=dev

# Copy server and frontend assets
COPY server.js  ./
COPY index.html ./
COPY styles.css ./
COPY app.js     ./

EXPOSE 3000

CMD ["npm", "start"]
