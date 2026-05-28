# 🚀 CarAI Backend

Production-ready backend на **NestJS + Clean Architecture**  
с поддержкой Docker, PostgreSQL, Redis и Prisma ORM.

---

# 📚 Stack

- **NestJS**
- **TypeScript**
- **PostgreSQL**
- **Prisma ORM**
- **Redis**
- **Swagger / OpenAPI**
- **Pino Logger** (`nestjs-pino`)
- **Docker + Docker Compose**
- **ESLint + Prettier + Husky**

---

# ⚡ Quick Start

## 1. Клонировать проект

```
git clone <repo-url>cd carai-backend
```

---

## 2. Создать `.env`

```
cp .env.example .env
```

---

## 3. Запустить проект

```
docker compose up -d --build
```

---

## 4. Проверить работу API

|Service|URL|
|---|---|
|API|[http://localhost:3000/api/v1](http://localhost:3000/api/v1)|
|Swagger|[http://localhost:3000/docs](http://localhost:3000/docs)|
|Healthcheck|[http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)|

---

# ⚙️ Environment Variables

Основные переменные:

```
DATABASE_URL=REDIS_HOST=REDIS_PORT=PORT=
```

Все env-переменные валидируются через:

```
src/config/env.validation.ts
```

Если какой-то переменной не хватает — приложение не запустится.

---

# 🐳 Development Mode (Docker)

Development-режим использует:

- hot reload
- bind mounts
- `docker-compose.override.yml`

Docker Compose автоматически подхватывает override-файл.

---

## 🚀 Первый запуск

```
docker compose up -d --build
```

---

## ▶️ Запуск

```
docker compose up -d
```

---

## ⛔ Остановка

```
docker compose down
```

---

## 🔁 Перезапуск

```
docker compose restart
```

---

## 📜 Логи приложения

```
docker compose logs -f app
```

---

# 🧠 Полезные команды

## Установить зависимости

После добавления новых пакетов:

```
docker compose run --rm app npm install
```

---

## Prisma Generate

```
docker compose exec app npx prisma generate
```

---

## Prisma Migration

Создать новую миграцию:

```
docker compose exec app npm run prisma:migrate -- --name init
```

---

## Prisma Studio

```
docker compose exec app npx prisma studio
```

---

# 🔥 Как работает Dev Mode

В development-режиме:

- проект монтируется через bind mount:

```
.:/app
```

- используется:

```
npm run dev
```

- включён hot reload
- используется `.env.development`

Изменения в коде применяются автоматически без пересборки контейнера.

---

# 🧹 Полная пересборка

Если контейнеры или зависимости сломались:

```
docker compose down -vdocker compose up -d --build
```

---

# 📦 Production

Production-сборка запускается без hot reload:

```
docker compose -f docker-compose.yml up -d --build
```

---

# 🧰 Git Hooks (Husky)

Перед каждым commit автоматически запускаются:

- lint
- format check

```
npm run lintnpm run format:check
```

---

## Если Git hooks не работают

```
git initnpm run prepare
```

---

# 📁 Project Structure

```
src/├── common/        # shared utils, filters, guards├── config/        # env configs├── modules/       # feature modules├── prisma/        # prisma service├── infrastructure/└── main.ts
```

---

# ✅ Recommended Workflow

После pull новых изменений:

```
docker compose pulldocker compose up -ddocker compose exec app npx prisma generate
```

Если появились новые миграции:

```
docker compose exec app npx prisma migrate deploy
```

---

# 🛠 Troubleshooting

## Prisma Client outdated

```
docker compose exec app npx prisma generate
```

---

## Полностью очистить Docker

```
docker compose down -vdocker system prune -f
```

---

## Контейнер не видит изменения файлов

Перезапустить контейнер:

```
docker compose restart app
```