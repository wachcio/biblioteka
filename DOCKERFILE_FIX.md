# 🔧 Naprawa Dockerfile - "nest: not found"

## ❌ Problem:
```
sh: nest: not found
npm run build
exit code: 127
```

## 🔍 Przyczyna:
W stage `builder` używano:
```dockerfile
RUN npm ci --only=production
```

To instalowało tylko production dependencies, ale `@nestjs/cli` jest w devDependencies, które są potrzebne do budowania.

## ✅ Rozwiązanie:

### Zmiana w Dockerfile API:
```dockerfile
# Przed (błędne):
RUN npm ci --only=production

# Po (poprawne):
RUN npm ci
```

## 📋 Wyjaśnienie:

### Builder Stage (potrzebuje devDependencies):
- `@nestjs/cli` - do budowania projektu
- `typescript` - do kompilacji TypeScript
- `@types/*` - definicje typów

### Production Stage (tylko production dependencies):
- Nadal używa `npm ci --only=production`
- Kopiuje gotowe pliki z builder stage

## ✅ Poprawiony Multi-stage Build:

```dockerfile
# Stage 1: Builder (wszystkie zależności)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                    # ✅ Wszystkie deps (włącznie z @nestjs/cli)
COPY . .
RUN npm run build            # ✅ Teraz działa

# Stage 2: Production (tylko production deps)
FROM node:20-alpine AS production
# ... setup użytkowników ...
COPY package*.json ./
RUN npm ci --only=production  # ✅ Tylko production deps
COPY --from=builder /app/dist ./dist  # ✅ Kopiuj gotowy build
# ... reszta konfiguracji ...
```

## 🎯 Rezultat:
- ✅ `nest build` działa w builder stage
- ✅ Finalny kontener ma tylko production dependencies
- ✅ Mniejszy rozmiar produkcyjnego kontenera
- ✅ Bezpieczeństwo - brak dev tools w produkcji

## 🧪 Test:
```bash
# Test build
docker compose build api

# Lub użyj skryptu testowego
./scripts/test-build.sh
```

---

**Ta naprawa rozwiązuje problem z budowaniem API w Docker.**