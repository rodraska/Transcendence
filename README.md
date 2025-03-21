# Fix Volumes and Reset DB

## Passos no terminal:

Aqui vamos ter por completo os containers a correr com novos volumes. O objetivo é garantir que tudo está “limpo” e pronto para as novas migrações e povoamento da base de dados.

1. **Parar os containers:**
   ```bash
   make down
   ```
   Ou se necessário:
   ```bash
   docker compose -f srcs/docker-compose.yml down -v
   ```
   (Remove também os volumes associados a estes containers)

2. **Limpar volumes de forma mais agressiva:**
   ```bash
   make delete-volumes
   ```
   Para confirmar se ainda existem volumes:
   ```bash
   docker volume ls
   ```
   Se quiser remover *todos* os volumes Docker (cuidado!):
   ```bash
   make delete-all-volumes
   ```

3. **Reconstruir e subir os containers novamente:**
   ```bash
   make build
   make up
   ```
   Garante que criamos os containers “from scratch” e geramos novos volumes.

---

## Criar SuperUser para app OAuth 42

Depois de os containers estarem a correr, podemos criar o superuser no Django para administrar a aplicação e configurar o OAuth:

```bash
docker compose -f srcs/docker-compose.yml exec web python3 manage.py createsuperuser
```

Seguir a GUI (prompt no terminal) para criar o admin e guardar as credenciais.

---

## Migrações

### Se existir apenas 1 ficheiro de migrations no `transcendence/migrations`
Basta rodar:
```bash
docker compose -f srcs/docker-compose.yml exec web python3 manage.py migrate
```

### Se não existir nenhum
Criar as migrações e depois migrar:
```bash
docker compose -f srcs/docker-compose.yml exec web python3 manage.py makemigrations
docker compose -f srcs/docker-compose.yml exec web python3 manage.py migrate
```

(Nunca deve haver mais que 1 ficheiro de migrações para a mesma app, portanto ajustar conforme as práticas de desenvolvimento.)

---

## Seguir GUI para criar o admin e guardar as credenciais

Depois de criar o superuser, é só aceder ao admin do Django em `http://localhost:8000/admin/`.

Caso seja necessário criar uma **Social App** para o OAuth 42:
1. Entrar em **Social applications** no admin (`socialaccount/socialapp/`).
2. Preencher os dados:
   - **clientid**: `u-s4t2ud-77d60e691cb374371e92ff006758ec64be4ada6e19b55bba5e99c0433d774e7e`
   - **secret**: `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`  
   Valid until 13/04/2025 (will be replaced by the next secret after that)
3. Verificar se é preciso criar o site `localhost:8000` em **Sites**. Tomar nota do `ID` e comparar com `SITE_ID` nos settings do projeto (`transcendence/settings.py`). Se for diferente, colocar o ID correto nos settings.

---

## make re

No final, podemos fazer um:
```bash
make re
```
Isto faz o “clean” e o “all” de forma completa, trazendo tudo do zero novamente.

---

## Repopulação de DB

A seguir, queries simples para popular as tabelas principais através do DBeaver (ou outro cliente) ligado ao PostgreSQL do container.

### 1. Tabela `transcendence_gametype`

Inserir **Pong**, **Curve** e **Any** **nesta ordem**:

```sql
INSERT INTO transcendence_gametype (name) VALUES ('Pong');
SELECT * FROM transcendence_gametype;

INSERT INTO transcendence_gametype (name) VALUES ('Curve');
SELECT * FROM transcendence_gametype;

INSERT INTO transcendence_gametype (name) VALUES ('Any');
SELECT * FROM transcendence_gametype;
```

### 2. Utilizadores

Utilizadores devem ser criados via registo normal da aplicação (não fazer INSERT manual). Depois de registrados, podemos consultá-los e garantir que existam no `transcendence_customuser`.

### 3. Tabela `transcendence_match`

Para inserir uma partida (match), assumindo que:
- O `game_type_id = 1` seja **Pong** (caso se tenha verificado via `SELECT * FROM transcendence_gametype`)
- O utilizador com `id = 10` exista (ex.: `SELECT * FROM transcendence_customuser WHERE id = 10`)
- O utilizador com `id = 11` exista
- Para ver todos os uitilizadores basta remover o filtro de where (ex.: `SELECT * FROM transcendence_customuser`)

Exemplo de INSERT:
```sql
INSERT INTO transcendence_match (
  game_type_id,
  player1_id,
  player2_id,
  winner_id,
  started_on,
  ended_on
) VALUES (
  1,  -- Pong, se o ID do gametype for 1
  10, -- jogador 1, caso este user ID exista
  11, -- jogador 2, caso este user ID exista
  10, -- vencedor (mesmo user do jogador 1)
  NOW(), -- data/hora atual como início
  NOW()  -- data/hora atual como fim (ou ajustar conforme necessário)
);
SELECT * FROM transcendence_match;
```

Repetir ou adaptar para criar quantas partidas forem necessárias. O essencial é adequar os IDs à vossa base de dados. Se preferirem, podem continuar a usar subqueries para evitar hardcode de IDs.

Subquery de exemplo para substituir hardcode de ID's:
```sql
INSERT INTO transcendence_match (
  game_type_id,
  player1_id,
  player2_id,
  winner_id,
  started_on,
  ended_on
) VALUES (
  (SELECT id FROM transcendence_gametype WHERE name = 'Pong'),
  (SELECT id FROM transcendence_customuser WHERE username = 'user1Name'),
  (SELECT id FROM transcendence_customuser WHERE username = 'user2Name'),
  (SELECT id FROM transcendence_customuser WHERE username = 'user1Name'),
  '2025-03-21 15:00:00',
  '2025-03-21 15:30:00'
);
SELECT * FROM transcendence_match;
```
