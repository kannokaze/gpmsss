FROM nginx
EXPOSE 80

### /usr/share/nginx/html
COPY / /usr/share/nginx/html


ENTRYPOINT nginx -g "daemon off;"