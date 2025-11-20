# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copier les dépendances du builder
COPY --from=builder /app/node_modules ./node_modules

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3002

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Démarrer l'application
CMD ["node", "src/server.js"]
