### 1. Estrutura do Projeto

- **Pasta `srcs/django/`**: contém tudo do Django  
  - `Dockerfile` (para criar a imagem do Django)  
  - `requirements.txt` (bibliotecas Python, como Django e psycopg2)  
  - `manage.py` (comandos principais do Django)  
  - `transcendence/` (app gerada com `startapp transcendence`, **temos de avaliar se queremos centralizar todo o código nesta app, ou se preferimos construir apps pequenas**)  
- **Pasta `srcs/postgresql/`**: contém o `Dockerfile` do PostgreSQL  
- **`docker-compose.yml`**: configura e orquestra os dois containers (Django e Postgres)  
- **Makefile**: para facilitar comandos de build, up, down, etc.

---

### 2. Levantar os Containers com Docker

1. **Compilar** as imagens:
   ```bash
   make build
   ```
2. **Subir** os containers:
   ```bash
   make up
   ```
3. Verifica se estão a correr:
   ```bash
   docker compose -f srcs/docker-compose.yml ps
   ```

Se tudo estiver correto, deves ver dois serviços (por exemplo, `django` e `postgres`) “Up”.

---

### 3. Aceder à Aplicação Web

- Abre o navegador em:  
  [http://localhost:8000](http://localhost:8000)  
- Deverás ver a página inicial do teu projeto Django.

Se não vires nada, podes verificar os logs:
```bash
docker compose -f srcs/docker-compose.yml logs web
docker compose -f srcs/docker-compose.yml logs db
```

---

### 4. Painel de Admin

Para usares o `/admin/`, precisas de um superutilizador:

1. **Aplicar** as migrações (criar tabelas no Postgres):
   ```bash
   docker compose -f srcs/docker-compose.yml exec web python3 manage.py migrate
   ```
2. **Criar** um superutilizador:
   ```bash
   docker compose -f srcs/docker-compose.yml exec web python3 manage.py createsuperuser
   ```
3. Abre [http://localhost:8000/admin/](http://localhost:8000/admin/) e entra com as credenciais criadas.

---

### 5. Estrutura do Código Django

No projeto, já existe a app `transcendence`.  
- Para criar apps adicionais. Basta correr:
  ```bash
  docker compose -f srcs/docker-compose.yml exec web python3 manage.py startapp nome_da_app
  ```
- Se preferirmos, podemos concentrar o código todo na app `transcendence`.  
- As migrações (tabelas) são geridas pelo Django. Ao alterares ou criares modelos, basta correres:
  ```bash
  docker compose -f srcs/docker-compose.yml exec web python3 manage.py makemigrations
  docker compose -f srcs/docker-compose.yml exec web python3 manage.py migrate
  ```

---

### 6. Comandos Úteis

- **Parar containers**:
  ```bash
  make down
  ```
- **Limpar tudo e reconstruir**:
  ```bash
  make clean
  make build
  make up
  ```
- **Ver logs**:
  ```bash
  docker compose -f srcs/docker-compose.yml logs -f web
  docker compose -f srcs/docker-compose.yml logs -f db
  ```

---

**Avaliar a persistência de volumes entre máquinas**

Por padrão, os volumes criados localmente para o PostgreSQL (por exemplo, `db_data`) ficam apenas na máquina em que foram criados. Isto significa que subir os containers noutro computador, a base de dados estará vazia no volume local dele. 
Opção para partilhar o estado do volume entre máquinas:

1. **Exportar/Importar via Dump**  
   - **Exportar**: No teu container, faz um dump da base de dados:
     ```bash
     docker compose exec db pg_dump -U admin transcendence > dump.sql
     ```
   - **Importar**: O colega pode subir o container dele e depois restaurar os dados:
     ```bash
     docker compose exec -T db psql -U admin transcendence < dump.sql
     ```
   Desta forma, sincronizamos manualmente os dados de uma máquina para outra.

   Mantemos cada um a sua base de dados local e, quando quisermos alinhar os dados, fazemos um dump oficial (por exemplo, `pg_dump -U admin transcendence > dump.sql`) e colocamos no repositório. Depois, quem precisar sincronizar simplesmente faz `psql -U admin transcendence < dump.sql`. Assim, as migrações do Django tratam a estrutura da BD, enquanto o dump permite partilhar dados concretos (utilizadores, estatísticas, etc.) apenas quando for necessário.

## Conclusão

1. Correr `make build` e `make up` (ou `make`) para levantar o Django e o Postgres em Docker.  
2. Acede a [http://localhost:8000](http://localhost:8000) para ver a app.  
3. Vai a [http://localhost:8000/admin/](http://localhost:8000/admin/) para o painel de administração e cria um superutilizador caso ainda não exista.  
4. Cria ou atualiza modelos no Django, executa migrações e ficas com as tabelas em PostgreSQL.  
5. Se precisares de mais apps, cria-as no mesmo diretório e faz `startapp`.  