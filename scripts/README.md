# 📜 Scripts - Library Management System

Ten folder zawiera przydatne skrypty do zarządzania systemem biblioteki.

## 🚀 Dostępne skrypty:

### `start.sh` - Szybkie uruchomienie
Najłatwiejszy sposób na uruchomienie całego systemu.

```bash
./scripts/start.sh
```

**Co robi:**
- Sprawdza i tworzy plik `.env` jeśli nie istnieje
- Uruchamia wszystkie usługi Docker
- Wyświetla status i informacje o dostępie

### `deploy.sh` - Pełny deployment
Kompletny skrypt deploymentu z weryfikacją i health checks.

```bash
./scripts/deploy.sh
```

**Co robi:**
- Sprawdza wymagania (Docker, Docker Compose)
- Konfiguruje środowisko
- Buduje i uruchamia wszystkie usługi
- Wykonuje health checks
- Wyświetla podsumowanie

### `stop.sh` - Zatrzymanie systemu
Bezpieczne zatrzymanie wszystkich usług.

```bash
./scripts/stop.sh
```

**Co robi:**
- Zatrzymuje wszystkie usługi Docker
- Pyta czy usunąć dane (volumes)
- Czyści zasoby

### `logs.sh` - Podgląd logów
Interaktywny viewer logów wszystkich usług.

```bash
./scripts/logs.sh
```

**Opcje:**
1. Wszystkie usługi
2. Tylko API
3. Tylko baza danych
4. Tylko frontend
5. Logi na żywo
6. Wyjście

### `backup.sh` - Backup bazy danych
Automatyczne tworzenie kopii zapasowej bazy danych.

```bash
./scripts/backup.sh
```

**Co robi:**
- Tworzy folder `./backups`
- Eksportuje bazę danych do pliku SQL
- Nazywa pliki datą i czasem
- Usuwa stare backupy (zostawia 10 najnowszych)
- Pokazuje rozmiar i listę backupów

## 🎯 Typowe scenariusze użycia:

### Pierwsze uruchomienie:
```bash
./scripts/start.sh
```

### Uruchomienie na serwerze produkcyjnym:
```bash
./scripts/deploy.sh
```

### Debugging problemów:
```bash
./scripts/logs.sh
# Wybierz opcję 5 dla logów na żywo
```

### Backup przed aktualizacją:
```bash
./scripts/backup.sh
```

### Zatrzymanie systemu:
```bash
./scripts/stop.sh
```

## 📋 Wymagania:

- Docker i Docker Compose zainstalowane
- Uprawnienia do wykonywania skryptów
- Porty 3000, 8080, 3306 dostępne

## 🔧 Rozwiązywanie problemów:

### Skrypt nie ma uprawnień:
```bash
chmod +x scripts/*.sh
```

### Port zajęty:
```bash
# Sprawdź co używa portu
sudo netstat -tulpn | grep :3000

# Lub zmień port w .env
```

### Docker nie jest zainstalowany:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# CentOS/RHEL
sudo yum install docker docker-compose
```

## 📱 Po uruchomieniu:

- **Frontend**: http://localhost:8080
- **API**: http://localhost:3000
- **Dokumentacja**: http://localhost:3000/api/docs

**Domyślne konta:**
- Admin: admin@library.com / password123
- User: john.doe@example.com / password123