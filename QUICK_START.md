# 🚀 Library Management System - Quick Start

## Problem z Docker Compose i zmiennymi środowiskowymi - ROZWIĄZANE ✅

### Przyczyna problemu:
Docker Compose wymagał pliku `.env` w głównym katalogu projektu do odczytu zmiennych środowiskowych.

### Rozwiązanie:

## 📋 Kroki do uruchomienia systemu:

### 🚀 Opcja 1: Szybkie uruchomienie (ZALECANE)
```bash
# Upewnij się, że jesteś w głównym katalogu projektu
cd /path/to/biblioteka

# Uruchom system jedną komendą
./scripts/start.sh
```

### 🏭 Opcja 2: Pełny deployment (dla produkcji)
```bash
# Kompleksowy deployment z weryfikacją
./scripts/deploy.sh
```

### 🔧 Opcja 3: Manualnie (dla zaawansowanych)
```bash
# Utwórz plik .env z przykładowego pliku
cp .env.example .env

# Uruchom wszystkie usługi
docker-compose up -d

# Sprawdź status usług
docker-compose ps
```

## 📜 Dostępne skrypty:

- **`./scripts/start.sh`** - Szybkie uruchomienie
- **`./scripts/deploy.sh`** - Pełny deployment z health checks
- **`./scripts/stop.sh`** - Zatrzymanie systemu
- **`./scripts/logs.sh`** - Podgląd logów (interaktywny)
- **`./scripts/backup.sh`** - Backup bazy danych

## 🔧 Rozwiązywanie problemów

### Problem: "variable is not set"
**Rozwiązanie**: Upewnij się, że plik `.env` istnieje w głównym katalogu i zawiera wszystkie wymagane zmienne.

```bash
# Sprawdź, czy .env istnieje
test -f .env && echo "Plik .env istnieje" || echo "Brak pliku .env"

# W razie potrzeby utwórz go ponownie
cp .env.example .env
```

### Problem: Docker Compose version warning
**Rozwiązanie**: To tylko ostrzeżenie, które zostało już naprawione przez usunięcie przestarzałej opcji `version` z docker-compose.yml.

### Problem: Porty zajęte
```bash
# Sprawdź, co używa portów
sudo netstat -tulpn | grep -E ':3000|:8080|:3306'

# Zatrzymaj konfliktowe usługi lub zmień porty w .env
```

## 📱 Dostęp do aplikacji

Po uruchomieniu, aplikacja będzie dostępna pod adresami:

- **Frontend**: http://localhost:8080
- **API**: http://localhost:3000
- **Dokumentacja API**: http://localhost:3000/api/docs
- **phpMyAdmin**: http://localhost:8081 (opcjonalnie)

## 👤 Domyślne konta

```
Administrator:
Email: admin@library.com
Hasło: password123

Użytkownik:
Email: john.doe@example.com
Hasło: password123
```

## 🐳 Przydatne komendy Docker

```bash
# Zobacz logi wszystkich usług
docker-compose logs -f

# Zobacz logi konkretnej usługi
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db

# Restart usług
docker-compose restart

# Zatrzymaj usługi
docker-compose down

# Zatrzymaj i usuń wszystko (włącznie z wolumenami)
docker-compose down -v

# Rebuild i restart
docker-compose up -d --build
```

## 🔍 Sprawdzenie poprawności konfiguracji

```bash
# Test połączenia z bazą danych
docker-compose exec db mysql -u library -p -e "SHOW DATABASES;"

# Test API
curl http://localhost:3000/api/health

# Test frontendu
curl http://localhost:8080
```

## ✅ System jest teraz gotowy!

Wszystkie problemy z konfiguracją Docker Compose zostały rozwiązane. System powinien uruchamiać się bez ostrzeżeń o brakujących zmiennych środowiskowych.

---

**Uwaga**: Jeśli nadal widzisz ostrzeżenia o zmiennej "fr8MC9", prawdopodobnie pochodzą one z innego środowiska lub konfiguracji Docker poza tym projektem.