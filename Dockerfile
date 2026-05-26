FROM nginx:alpine

# Copiar config de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar todos los archivos estaticos
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
