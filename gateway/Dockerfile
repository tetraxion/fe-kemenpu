FROM nginx:1.27-alpine
# substitute only BACKEND_URL, so nginx's own $variables are left alone
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 8080
