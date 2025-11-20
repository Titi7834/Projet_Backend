FROM node:18-alpine

WORKDIR /app

# Copier les fichiers
COPY package.json ./

# Installer les dépendances
RUN npm install --production

# Copier le code
COPY . .

# Exposer le port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Démarrer l'application
CMD ["node", "src/app.js"]
