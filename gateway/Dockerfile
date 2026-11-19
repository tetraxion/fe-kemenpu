FROM nginx:1.27-alpine
# The image renders templates with envsubst on start, which fills in
# BACKEND_URL. Only that variable is substituted, so nginx's own $variables
# in the file are left alone.
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 8080
