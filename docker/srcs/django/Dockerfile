FROM debian:bullseye

RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  python3-dev \
  git \
  libpq-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . /app

RUN python3 manage.py collectstatic --noinput

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "transcendence.asgi:application"]
