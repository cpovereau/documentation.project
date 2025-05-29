# Utiliser une image de base
FROM node:20-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et installer les dépendances
COPY package.json package-lock.json ./
RUN npm install

# Copier le reste des fichiers
COPY . .

# Exposer le port pour le frontend
EXPOSE 3000

# Commande par défaut pour démarrer l'application
CMD ["npm", "start"]
