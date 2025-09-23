# 📚 Library Management System

A complete library management system built with **NestJS**, **React**, **TypeScript**, **MySQL**, and **Docker**.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Admin/User)
- Secure password hashing with Argon2
- Protected routes and API endpoints

### 📖 Book Management
- Complete CRUD operations for books
- Many-to-many relationship with authors
- Book status tracking (Available/Reserved/Borrowed)
- Advanced search and filtering
- Category management
- ISBN support and validation

### ✍️ Author Management
- Author CRUD operations
- Author biography support
- Book-author associations

### 👥 User Management
- User registration and profile management
- Admin user management
- User activity tracking
- Role promotion/demotion

### 📋 Reservation System
- Users can reserve available books
- Automatic expiration after 7 days
- Admin approval/rejection workflow
- Convert reservations to loans

### 📚 Loan Management
- Admin-only loan creation
- 14-day default loan period
- Loan extensions
- Overdue detection and tracking
- Return processing

### 🎛️ Admin Panel
- Comprehensive dashboard with statistics
- Manage all books, authors, users
- Reservation and loan management
- Bulk operations
- Activity monitoring

## 🏗️ Architecture

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: MySQL with TypeORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **Security**: CORS, rate limiting, input sanitization

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Build Tool**: Vite

### Database (MySQL)
- **Users**: Authentication and profile management
- **Authors**: Author information and biography
- **Books**: Complete book catalog with metadata
- **BookAuthors**: Many-to-many relationship table
- **Reservations**: Book reservation system
- **Loans**: Loan tracking and management

## 🐳 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd biblioteka
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit environment variables** (optional but recommended for production)
   ```bash
   nano .env
   ```

4. **Start the application**
   ```bash
   docker compose up -d
   ```

5. **Access the application**
   - **Frontend**: http://localhost:8080
   - **API**: http://localhost:3000
   - **API Documentation**: http://localhost:3000/api/docs
   - **phpMyAdmin**: http://localhost:8081 (optional)

### Default Credentials
- **Admin**: admin@library.com / password123
- **User**: john.doe@example.com / password123

## 📁 Project Structure

```
biblioteka/
├── api/                          # NestJS Backend
│   ├── src/
│   │   ├── auth/                 # Authentication module
│   │   ├── users/                # User management
│   │   ├── authors/              # Author management
│   │   ├── books/                # Book management
│   │   ├── reservations/         # Reservation system
│   │   ├── loans/                # Loan management
│   │   ├── health/               # Health checks
│   │   ├── common/               # Shared utilities
│   │   └── config/               # Configuration
│   ├── Dockerfile
│   └── package.json
├── web/                          # React Frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API services
│   │   ├── types/                # TypeScript types
│   │   ├── hooks/                # Custom hooks
│   │   └── contexts/             # React contexts
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── db/
│   └── init/                     # Database initialization
├── docker-compose.yml           # Docker orchestration
├── .env.example                 # Environment template
└── README.md
```

## 🛠️ Development Setup

### Backend Development

1. **Navigate to API directory**
   ```bash
   cd api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp ../.env.example .env
   ```

4. **Start MySQL database**
   ```bash
   docker compose up db -d
   ```

5. **Run migrations** (if needed)
   ```bash
   npm run migration:run
   ```

6. **Start development server**
   ```bash
   npm run start:dev
   ```

### Frontend Development

1. **Navigate to web directory**
   ```bash
   cd web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token

### Books
- `GET /api/books` - Get all books (with search/filter)
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create book (Admin only)
- `PATCH /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Authors
- `GET /api/authors` - Get all authors
- `GET /api/authors/:id` - Get author by ID
- `POST /api/authors` - Create author (Admin only)
- `PATCH /api/authors/:id` - Update author (Admin only)
- `DELETE /api/authors/:id` - Delete author (Admin only)

### Reservations
- `GET /api/reservations/my-reservations` - Get user's reservations
- `POST /api/reservations` - Create reservation
- `PATCH /api/reservations/:id` - Update reservation status
- `GET /api/reservations` - Get all reservations (Admin only)

### Loans
- `GET /api/loans/my-loans` - Get user's loans
- `POST /api/loans` - Create loan (Admin only)
- `PATCH /api/loans/:id/return` - Return book (Admin only)
- `PATCH /api/loans/:id/extend` - Extend loan (Admin only)
- `GET /api/loans` - Get all loans (Admin only)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin/User role separation
- **Input Validation**: Comprehensive validation using class-validator
- **Password Security**: Argon2 hashing algorithm
- **CORS Protection**: Configurable CORS settings
- **Rate Limiting**: API rate limiting (configurable)
- **SQL Injection Protection**: TypeORM parameterized queries
- **XSS Protection**: Input sanitization and CSP headers

## 🚀 Production Deployment

### Environment Configuration

Update the `.env` file with production values:

```env
# Use strong passwords in production
MYSQL_PASSWORD=your_secure_database_password
MYSQL_ROOT_PASSWORD=your_secure_root_password

# Use cryptographically secure secrets
JWT_ACCESS_SECRET=your_256_bit_secret_key
JWT_REFRESH_SECRET=your_256_bit_refresh_secret

# Production URLs
CLIENT_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com
```

### Docker Production Deployment

```bash
# Build and start services
docker compose up -d --build

# Check service health
docker compose ps

# View logs
docker compose logs -f
```

### Health Checks

- **API Health**: `GET /api/health`
- **Database Health**: Included in Docker health checks
- **Frontend Health**: Nginx status

## 📈 Monitoring and Maintenance

### Logs
```bash
# View API logs
docker compose logs api

# View web server logs
docker compose logs web

# View database logs
docker compose logs db
```

### Database Backup
```bash
# Create backup
docker exec library_db mysqldump -u library -p library > backup_$(date +%Y%m%d).sql

# Restore backup
docker exec -i library_db mysql -u library -p library < backup_file.sql
```

### Updates
```bash
# Pull latest changes
git pull

# Rebuild and restart services
docker compose up -d --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the logs using Docker commands

## 🔧 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check database status
docker compose ps db

# Restart database
docker compose restart db
```

**API Not Starting**
```bash
# Check API logs
docker compose logs api

# Verify environment variables
docker compose config
```

**Frontend Build Issues**
```bash
# Rebuild frontend
docker compose build web --no-cache
```

---

Built with ❤️ using modern web technologies for efficient library management.