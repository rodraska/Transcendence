FROM debian:bullseye

ARG DOMAIN_NAME
ENV DOMAIN_NAME=${DOMAIN_NAME}

RUN apt-get update && apt-get install -y \
    nginx \
    openssl \
    gettext-base \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/nginx/ssl /etc/nginx/templates /run/nginx

RUN openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/${DOMAIN_NAME}.key \
    -out /etc/nginx/ssl/${DOMAIN_NAME}.crt \
    -subj "/C=US/ST=State/L=City/O=SchoolProject/OU=Dev/CN=${DOMAIN_NAME}"

COPY nginx.conf.template /etc/nginx/templates/nginx.conf

CMD envsubst '${DOMAIN_NAME}' < /etc/nginx/templates/nginx.conf > /etc/nginx/nginx.conf && \
    nginx -g 'daemon off;'
