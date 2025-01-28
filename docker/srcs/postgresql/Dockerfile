FROM debian:bullseye

RUN apt-get update && apt-get install -y \
    postgresql \
    postgresql-contrib \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /var/lib/postgresql/data && chown -R postgres:postgres /var/lib/postgresql

USER postgres

RUN /usr/lib/postgresql/13/bin/initdb -D /var/lib/postgresql/data \
    --encoding=UTF8 \
    --locale=C.UTF-8

RUN echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf

RUN /usr/lib/postgresql/13/bin/pg_ctl -D /var/lib/postgresql/data \
    -o "-c listen_addresses='localhost'" \
    -w start \
    && psql --command "CREATE USER admin WITH SUPERUSER PASSWORD 'admin';" \
    && createdb -O admin transcendence \
    && /usr/lib/postgresql/13/bin/pg_ctl -D /var/lib/postgresql/data -m fast -w stop

EXPOSE 5432

CMD ["/usr/lib/postgresql/13/bin/postgres", "-D", "/var/lib/postgresql/data", "-c", "listen_addresses=*"]
