# --- Etapa 1: compilar Angular ---
# Angular 22 requiere Node ^22.22.3 || ^24.15.0
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Etapa 2: servir con nginx ---
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/disfraces-express/browser /usr/share/nginx/html

EXPOSE 80
