NAME = transcendence

all: build up collectstatic

build:
	docker-compose -f srcs/docker-compose.yml build

up:
	docker-compose -f srcs/docker-compose.yml up -d

down:
	docker-compose -f srcs/docker-compose.yml down

collectstatic:
	docker-compose -f srcs/docker-compose.yml exec web python3 manage.py collectstatic --noinput

clean: down
	docker system prune -af

delete-volumes:
	docker volume prune -f

delete-all-volumes:
	docker volume rm $$(docker volume ls -q)

re: clean all

.PHONY: all build up down clean re delete-volumes delete-all-volumes
