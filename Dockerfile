FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --production

FROM nginx:alpine

# Instalar Node.js para el backend admin
RUN apk add --no-cache nodejs npm

# Copiar Node modules y server
COPY --from=builder /app/node_modules /app/node_modules
COPY server.js /app/server.js
COPY package.json /app/package.json

# Copiar config de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar todos los archivos estaticos
COPY . /usr/share/nginx/html

# Crear directorios necesarios
RUN mkdir -p /usr/share/nginx/html/content/data && \
    mkdir -p /usr/share/nginx/html/assets/images/galeria && \
    chmod -R 755 /usr/share/nginx/html/content && \
    chmod -R 755 /usr/share/nginx/html/assets/images/galeria

EXPOSE 80

# Script de inicio: Node API + Nginx
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cd /app && node server.js &' >> /start.sh && \
    echo 'cd /usr/share/nginx/html && mkdir -p content/data assets/images/galeria' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]
