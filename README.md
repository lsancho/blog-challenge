# Blog

Escrito com Node.js, Fastify, Vite, React, Postgres e Docker.

São 3 servicos principais: Database, API e Frontend.

```mermaid
graph LR
    API --> Database
    Frontend --> API
```

### Database

O banco de dados é um Postgres. Escolhi este por ser um banco de dados relacional e por ser um dos mais utilizados no mercado.

- `backend/database/01.sql` - Criação do banco de dados, tabelas e functions

### Api

A API é um servidor [Fastify](https://www.fastify.io/). Escolhi este por ser um servidor web extremamente rápido, com facilidade para validar requests/responses e também pode ser facilmente extendido.

- `backend/api/src/routes/auth.route.ts` - Logica de autenticação usando token PASETO
- `backend/api/src/routes/post.route.ts` - Logica de CRUD de posts
- `backend/api/src/entities.ts` - Tipos das entidades do banco de dados
- `backend/api/src/config.ts` - Dados de configuracao usando o [Convict](https://github.com/mozilla/node-convict)
- `backend/api/src/index.ts` - Inicialização do servidor Fastify

A ideia foi a simplicidade e velocidade na hora de criar os endpoints.
Ações simples na base de dados sao feitas com SQL simples, as mais complexas eu criei uma function.
Principais rotas estão protegidas com autenticação via o token PASETO.

### Frontend

O frontend é um projeto React com [Vite](https://vitejs.dev/). Escolhi o Vite por ser um bundler extremamente rápido e fácil de utilizar.

Coloquei o [NextUI](https://nextui.org/) para facilitar a criação de componentes e o [SWR](https://swr.vercel.app/) para facilitar a criação de hooks para requests.

- `frontend/src/routes/index.tsx` - Organizei as rotas com [React Router](https://reactrouter.com/)
- `frontend/src/routes/home.tsx` - A home após login, onde mostra todos os posts
- `frontend/src/routes/post/index.tsx` - A página de criação de post
- `frontend/src/routes/auth/index.tsx` - A página com componente de cadastro e login


## Como rodar

O comando abaixo irá subir os 3 serviços.

```bash
docker-compose up
```

Após a subida apenas acessar no browser `http://localhost:5000`

