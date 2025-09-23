# 📄 Product Requirements Document (PRD) — v1.1
**Projekt:** System Zarządzania Biblioteką  
**Stack:** Nest.js (API), React (SPA), MySQL, TypeScript  
**Deploy:** Docker & Docker Compose (Node.js + MySQL + usługi pomocnicze)  
**Data:** 2025-09-23  
**Autor:** Wachcio

---

## 1. 🎯 Cel
Aplikacja webowa do zarządzania biblioteką z oddzielnym panelem admina.  
Wersja v1.1 obejmuje:
- Normalizację autorów (osobna tabela `Authors`, relacja **M:N** z `Books`).
- **Wypożyczenia tworzone wyłącznie przez Administratora** (bezpośrednio lub z rezerwacji).
- Kompletny i powtarzalny deployment przez **Docker Compose**.

---

## 2. 👥 Role użytkowników
- **Administrator**
  - CRUD: książki, autorzy, użytkownicy.
  - Zarządzanie rezerwacjami (akceptacja/odrzucenie).
  - **Tworzenie/kończenie/przedłużanie wypożyczeń** (admin-only).
  - Przegląd statystyk (MVP: podstawowe).
- **Wypożyczający (user)**
  - Rejestracja/logowanie, przegląd katalogu.
  - Składanie **rezerwacji** (nie tworzy wypożyczeń).
  - Podgląd historii wypożyczeń i rezerwacji.
- **Gość**
  - Przegląd katalogu publicznego, podstawowe informacje o dostępności.
  - Rejestracja.

---

## 3. 📚 Funkcjonalności
- **Książki**
  - CRUD, statusy: `available`, `reserved`, `borrowed`.
  - Wyszukiwanie/filtrowanie (tytuł, autor, kategoria, ISBN).
  - Szczegóły: autorzy, opis, rok, okładka.
- **Autorzy**
  - CRUD autorów.
  - Powiązanie wielu autorów z jedną książką i odwrotnie (M:N).
- **Użytkownicy**
  - Rejestracja, logowanie (JWT), role `admin`/`user`.
  - Profil, historia.
- **Rezerwacje**
  - Tworzone przez użytkownika.
  - Zarządzane przez admina: akceptacja → konwersja do wypożyczenia / anulacja.
- **Wypożyczenia (admin-only)**
  - Tworzone przez admina (z rezerwacji lub bezpośrednio).
  - Zwrot zmienia status książki na `available`.
  - Domyślny termin: **14 dni** (konfigurowalne).
- **Panel administratora**
  - Dashboard, listy: książki, autorzy, użytkownicy, rezerwacje, wypożyczenia.

---

## 4. 🛠️ Architektura
### Backend (Nest.js)
- REST API, walidacja DTO (class-validator).
- Autoryzacja: JWT (Access/Refresh), guardy ról (RBAC).
- ORM: TypeORM (MySQL).
- Moduły: `Auth`, `Users`, `Authors`, `Books`, `Reservations`, `Loans`, `Health`.
- Migracje TypeORM; endpoint `/health` (liveness/readiness).

### Frontend (React + TypeScript)
- SPA (React Router), TailwindCSS (lub MUI – preferencja: Tailwind).
- Komunikacja: Axios + React Query.
- Widoki: katalog, szczegóły książki, log/rej, profil, **panel admina**.

---

## 5. 🗄️ Model danych (MySQL)

```sql
Users (
  id INT PK AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Authors (
  id INT PK AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  bio TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Books (
  id INT PK AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  year INT NULL,
  isbn VARCHAR(20) UNIQUE NULL,
  category VARCHAR(100) NULL,
  description TEXT NULL,
  cover_url VARCHAR(255) NULL,
  status ENUM('available','reserved','borrowed') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

BookAuthors ( -- relacja M:N
  book_id INT NOT NULL,
  author_id INT NOT NULL,
  PRIMARY KEY (book_id, author_id),
  FOREIGN KEY (book_id) REFERENCES Books(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES Authors(id) ON DELETE CASCADE
);

Reservations (
  id INT PK AUTO_INCREMENT,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  status ENUM('active','cancelled','expired','converted') NOT NULL DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (book_id) REFERENCES Books(id)
);

Loans (
  id INT PK AUTO_INCREMENT,
  user_id INT NOT NULL,  -- dla kogo
  book_id INT NOT NULL,  -- jaka książka
  admin_id INT NOT NULL, -- kto zarejestrował wypożyczenie
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP NOT NULL,
  returned_at TIMESTAMP NULL,
  status ENUM('active','returned','overdue') NOT NULL DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (book_id) REFERENCES Books(id),
  FOREIGN KEY (admin_id) REFERENCES Users(id)
);
```

**Reguły integralności i indeksy (wymagane):**
- `Books.status` kontrolowany przez logikę Loans/Reservations.
- Indeksy:  
  - `Books(title)`, `Authors(last_name, first_name)`,  
  - `Reservations(user_id, book_id, status)`, `Loans(user_id, book_id, status)`.

---

## 6. 🔒 Bezpieczeństwo
- **Autoryzacja:** JWT (Access/Refresh), rotacja i TTL (konfigurowalne).
- **RBAC:** guardy ról (`admin`/`user`) – **Loans CRUD wyłącznie admin**.
- **Hasła:** Argon2 lub Bcrypt (z odpowiednim cost/parallelism).
- **API Hardening:** rate limiting na auth, walidacja/sanitizacja DTO, sensowne kody HTTP.
- **Transport:** HTTPS w produkcji; bezpieczny CORS (whitelist domen).
- **Sekrety:** z `.env`/secret managera, bez commitowania w repo.

---

## 7. ✅ Kryteria akceptacji (MVP)
- Użytkownik może się **zarejestrować** i **zalogować**.
- Użytkownik może złożyć **rezerwację** książki.
- Administrator może:
  - dodać książkę i autora, powiązać ich,
  - przekształcić rezerwację w **wypożyczenie**,
  - utworzyć wypożyczenie bezpośrednio,
  - zamknąć wypożyczenie (zwrot).
- Katalog książek wyświetla poprawne statusy i autorów.
- Całość uruchamia się poprawnie za pomocą:
  ```bash
  docker compose up -d
  ```

---

## 8. 🐳 Wymagania DevOps / Docker

### Pliki do wygenerowania
1. **`docker-compose.yml`**
   - `db`: MySQL 8 (persistent volume, healthcheck).
   - `api`: Nest.js (Dockerfile.api, port 3000).
   - `web`: React (Dockerfile.web + Nginx, port 80).
   - (opcjonalnie) `adminer` lub `phpmyadmin`.
2. **`Dockerfile.api`** — multi-stage:
   - Stage 1: build Nest.js (Node 20 LTS, instalacja depsów, build).
   - Stage 2: uruchomienie w Node 20 Alpine jako non-root.
3. **`Dockerfile.web`** — multi-stage:
   - Stage 1: build React (Node 20, npm/yarn/pnpm build).
   - Stage 2: serwowanie przez Nginx (alpine), fallback na `index.html`.
4. **`.env.example`** — przykładowe zmienne środowiskowe:
   ```env
   MYSQL_HOST=db
   MYSQL_PORT=3306
   MYSQL_DATABASE=library
   MYSQL_USER=library
   MYSQL_PASSWORD=change_me
   MYSQL_ROOT_PASSWORD=root_pw

   APP_PORT=3000
   CLIENT_URL=http://localhost:5173
   JWT_ACCESS_SECRET=access_secret
   JWT_REFRESH_SECRET=refresh_secret
   ```
5. **`nginx.conf`** — konfiguracja dla SPA:
   - Cache dla statyków,
   - Fallback: `try_files $uri /index.html;`.
6. **Migracje TypeORM** albo `init.sql` w katalogu `/db/init`.

### Minimalna zawartość `docker-compose.yml`
- **db**:
  - Obraz: `mysql:8`
  - Env: `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`
  - Wolumen: `db_data:/var/lib/mysql`
  - Healthcheck: `CMD mysqladmin ping -h localhost || exit 1`
- **api**:
  - Build: `./api/Dockerfile.api`
  - Port: `3000:3000`
  - Env: DB connection, JWT secrets
  - `depends_on`: db (condition: service_healthy)
  - Healthcheck: `curl -f http://localhost:3000/health || exit 1`
- **web**:
  - Build: `./web/Dockerfile.web`
  - Port: `8080:80`
  - Env: `VITE_API_URL=http://localhost:3000`
  - `depends_on`: api

---

## 9. 📊 Backlog rozszerzeń
- **Powiadomienia e-mail/SMS** o terminach zwrotu.
- **Import/eksport CSV/Excel** dla książek i autorów.
- **Integracja z OpenLibrary/ISBNdb** w celu autouzupełniania metadanych książek.
- **Zaawansowane role** (np. bibliotekarz vs administrator systemu).
- **Raporty i kary** za przetrzymanie książek.
- **Monitoring i logowanie** (Prometheus, Grafana, ELK/EFK stack).

---
