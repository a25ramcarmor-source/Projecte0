
FROM node:20

WORKDIR /home/node/app

# Copiamos primero los archivos de dependencias
COPY package*.json ./

# Instalamos todas las dependencias
RUN npm install

# Copiamos el resto del proyecto
COPY . .

# Puerto de Express
EXPOSE 4000

# Migrar la BD y arrancar Node
CMD ["sh", "-c", "node migrate.js && node app.js"]
