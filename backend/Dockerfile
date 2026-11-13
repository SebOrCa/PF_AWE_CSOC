# Supuestos (la carpeta backend aun esta vacia): Node.js, package.json con
# script "start", y la API escuchando en el puerto de la variable PORT (3000).
# Ajustalo cuando exista el backend real.
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000
USER node
CMD ["npm", "start"]
