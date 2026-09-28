# ── Frontend: Angular 18 build + Nginx ──────────────────────────────
# Stage 1: build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve estático con Nginx
FROM nginx:1.27-alpine
# Config con proxy /api -> servicio api y fallback SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf
# El application builder de Angular emite en dist/<name>/browser
COPY --from=build /app/dist/pf-perez-59435/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
