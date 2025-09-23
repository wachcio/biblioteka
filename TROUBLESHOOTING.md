# 🔧 Troubleshooting Guide - Library Management System

## 🚨 Najczęstsze problemy i rozwiązania

### ⚠️ Problem: Ostrzeżenia o zmiennej "fr8MC9"
```
WARN[0000] The "fr8MC9" variable is not set. Defaulting to a blank string.
```

**Przyczyna**: Ostrzeżenie pochodzi z systemu Docker lub Docker Desktop, nie z naszej aplikacji.

**Rozwiązanie**:
- To ostrzeżenie jest nieszkodliwe i nie wpływa na działanie aplikacji
- Można je zignorować lub wykonać czyszczenie cache Docker:
```bash
./scripts/clean.sh
```

### ❌ Problem: "failed to compute cache key" lub błąd z migrations
```
COPY --chown=nestjs:nodejs ./src/migrations ./src/migrations: not found
```

**Przyczyna**: Brakujący folder migrations w API.

**Rozwiązanie**:
```bash
mkdir -p api/src/migrations
touch api/src/migrations/.gitkeep
./scripts/deploy.sh
```

### 🐳 Problem: docker-compose vs docker compose
**Przyczyna**: Nowe wersje Docker używają `docker compose` zamiast `docker-compose`.

**Rozwiązanie**: Wszystkie skrypty zostały zaktualizowane do nowej składni.

### 📄 Problem: Brak pliku .env
**Rozwiązanie**:
```bash
cp .env.example .env
```

### 🔌 Problem: Porty zajęte
**Sprawdzenie**:
```bash
sudo netstat -tulpn | grep -E ':3000|:8080|:3306'
```

**Rozwiązanie**: Zatrzymaj konfliktowe usługi lub zmień porty w `.env`

### 💾 Problem: Brak uprawnień do Docker
**Rozwiązanie**:
```bash
sudo usermod -aG docker $USER
# Wyloguj się i zaloguj ponownie
```

## 🛠️ Narzędzia diagnostyczne

### Debug systemu:
```bash
./scripts/debug.sh
```

### Czysta instalacja:
```bash
./scripts/clean.sh
./scripts/start.sh
```

### Podgląd logów:
```bash
./scripts/logs.sh
```

## 🎯 Szybkie rozwiązania

### Problem z uruchomieniem:
1. `./scripts/clean.sh` - wyczyść cache
2. `./scripts/start.sh` - uruchom ponownie

### Problem z bazą danych:
1. `./scripts/logs.sh` - wybierz opcję 3 (database logs)
2. Sprawdź hasła w `.env`
3. `docker compose restart db`

### Problem z API:
1. `./scripts/logs.sh` - wybierz opcję 2 (API logs)
2. Sprawdź, czy porty są wolne
3. `docker compose restart api`

### Problem z frontendem:
1. `./scripts/logs.sh` - wybierz opcję 4 (web logs)
2. Sprawdź konfigurację Nginx
3. `docker compose restart web`

## 📊 Weryfikacja działania

### Sprawdź status wszystkich usług:
```bash
docker compose ps
```

### Sprawdź połączenie z API:
```bash
curl http://localhost:3000/api/health
```

### Sprawdź frontend:
```bash
curl http://localhost:8080
```

### Sprawdź bazę danych:
```bash
docker compose exec db mysql -u library -p -e "SHOW DATABASES;"
```

## 🔄 Pełna reinstalacja

Jeśli wszystko inne zawiedzie:

```bash
# 1. Zatrzymaj i usuń wszystko
./scripts/stop.sh
# Odpowiedz 'y' aby usunąć volumes

# 2. Wyczyść Docker
./scripts/clean.sh
# Odpowiedz 'y' na wszystkie pytania

# 3. Sprawdź czy .env istnieje
ls -la .env || cp .env.example .env

# 4. Uruchom ponownie
./scripts/deploy.sh
```

## 📞 Dalsze wsparcie

Jeśli problemy nadal występują:

1. Uruchom `./scripts/debug.sh` i zapisz wynik
2. Sprawdź logi: `./scripts/logs.sh`
3. Sprawdź konfigurację Docker: `docker info`

## ✅ Oznaki poprawnego działania

System działa prawidłowo gdy:
- ✅ `docker compose ps` pokazuje wszystkie usługi jako "Up"
- ✅ `curl http://localhost:3000/api/health` zwraca status 200
- ✅ `curl http://localhost:8080` zwraca stronę HTML
- ✅ Możesz zalogować się na http://localhost:8080

**Default credentials:**
- Admin: admin@library.com / password123
- User: john.doe@example.com / password123

---

**Uwaga**: Ostrzeżenia o zmiennych typu "fr8MC9" pochodzą z systemu Docker i są nieszkodliwe dla aplikacji.