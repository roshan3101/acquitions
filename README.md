# Acquisitions API

A modern, secure RESTful API built with Node.js, Express, and PostgreSQL. This API provides authentication and user management functionality with comprehensive security features, rate limiting, and role-based access control.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with HTTP-only cookies
  - Role-based access control (Admin/User)
  - Secure password hashing with bcrypt
  - Token expiration and validation

- **User Management**
  - Complete CRUD operations for users
  - Self-service profile management
  - Admin user management
  - Pagination, search, and sorting

- **Security**
  - Arcjet integration for bot detection and rate limiting
  - Helmet.js for security headers
  - CORS configuration
  - Input validation with Zod
  - SQL injection protection with Drizzle ORM

- **Developer Experience**
  - Hot reload in development
  - Comprehensive logging with Winston
  - ESLint and Prettier for code quality
  - Jest testing framework with coverage
  - Docker support for development and production

- **CI/CD**
  - Automated linting and formatting checks
  - Automated testing with coverage reports
  - Multi-platform Docker builds
  - GitHub Actions workflows

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **npm** 9.x or higher
- **PostgreSQL** database (or Neon Cloud)
- **Docker** and **Docker Compose** (optional, for containerized development)

## 🛠️ Tech Stack

- **Runtime:** Node.js 20.x
- **Framework:** Express.js 5.x
- **Database:** PostgreSQL with Neon Serverless
- **ORM:** Drizzle ORM
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **Security:** Arcjet, Helmet, bcrypt
- **Logging:** Winston
- **Testing:** Jest, Supertest
- **Code Quality:** ESLint, Prettier

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/roshan3101/acquitions.git
cd acquitions
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create `.env.development` for local development:

```env
NODE_ENV=development
PORT=3000

# Database - Neon Local or PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/database

# JWT Configuration
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRES_IN=15m

# Arcjet Security
ARCJET_KEY=your_arcjet_key

# Logging
LOG_LEVEL=debug
```

For production, create `.env.production` with your production credentials.

### 4. Set up the database

#### Option A: Using Neon Local (Docker)

```bash
npm run dev:docker
```

This will:
- Start Neon Local database container
- Run database migrations
- Start the application with hot reload

#### Option B: Using Neon Cloud or PostgreSQL

1. Get your database connection string from Neon Cloud dashboard
2. Update `DATABASE_URL` in your `.env` file
3. Run migrations:

```bash
npm run db:migrate
```

### 5. Start the application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The API will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment (development/production) | Yes | - |
| `PORT` | Server port | No | 3000 |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT signing | Yes | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | No | 15m |
| `ARCJET_KEY` | Arcjet API key for security | Yes | - |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | No | info |

### Database Setup

The application uses Drizzle ORM for database management:

```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

All user routes require authentication via JWT token. The token can be provided in:
- **Cookie:** `token` (HTTP-only, set automatically on sign-in)
- **Header:** `Authorization: Bearer <token>`

### Public Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-17T14:30:00.000Z",
  "uptime": 1234.567
}
```

#### API Info
```http
GET /api
```

### Authentication Endpoints

#### Sign Up
```http
POST /api/auth/sign-up
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // optional, defaults to "user"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Sign In
```http
POST /api/auth/sign-in
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "User signed in successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Note:** Token is automatically set as HTTP-only cookie.

#### Sign Out
```http
POST /api/auth/sign-out
```

**Response:** `200 OK`
```json
{
  "message": "User signed out successfully"
}
```

### User Endpoints

#### Get Current User Profile
```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "User profile fetched successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2025-11-17T14:30:00.000Z",
    "updated_at": "2025-11-17T14:30:00.000Z"
  }
}
```

#### Update Current User Profile
```http
PATCH /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "newpassword123"
}
```

**Note:** Role cannot be changed via self-update.

#### Get All Users (Admin Only)
```http
GET /api/users?page=1&limit=10&search=john&sortBy=name&sortOrder=asc
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10, max: 100) - Items per page
- `search` (optional) - Search in name and email
- `sortBy` (default: created_at) - Sort field (id, name, email, role, created_at, updated_at)
- `sortOrder` (default: desc) - Sort direction (asc, desc)

**Response:** `200 OK`
```json
{
  "message": "Users fetched successfully",
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

**Access:** Self or Admin only

#### Update User (Admin Only)
```http
PATCH /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin",
  "password": "newpassword123"
}
```

#### Delete User (Admin Only)
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

**Note:** Cannot delete your own account.

### Error Responses

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

**Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage

Coverage reports are generated in the `coverage/` directory. Open `coverage/lcov-report/index.html` in a browser to view the detailed coverage report.

## 🐳 Docker

### Development with Docker

```bash
# Windows (PowerShell)
npm run dev:docker

# Linux/Mac
bash ./scripts/dev.sh
```

This will:
- Start Neon Local database
- Run migrations
- Start the app with hot reload

### Production with Docker

```bash
# Windows (PowerShell)
npm run prod:docker

# Linux/Mac
bash ./scripts/prod.sh
```

### Manual Docker Commands

```bash
# Build development image
docker compose -f docker-compose.dev.yaml build

# Start development environment
docker compose -f docker-compose.dev.yaml up

# Stop containers
docker compose -f docker-compose.dev.yaml down

# View logs
docker compose -f docker-compose.dev.yaml logs -f
```

## 🔄 CI/CD

The project includes GitHub Actions workflows for:

### 1. Lint and Format Check
- Runs on pushes and PRs to `main` and `staging`
- Checks ESLint and Prettier compliance
- Provides fix suggestions on failure

### 2. Tests
- Runs on pushes and PRs to `main` and `staging`
- Executes test suite with coverage
- Uploads coverage reports as artifacts
- Generates test summary

### 3. Docker Build and Push
- Runs on pushes to `main` or manual trigger
- Builds multi-platform Docker images (linux/amd64, linux/arm64)
- Pushes to Docker Hub with multiple tags:
  - `latest` (main branch only)
  - `main` (branch name)
  - `main-<sha>` (commit SHA)
  - `prod-YYYYMMDD-HHmmss` (timestamp)

### Required GitHub Secrets

Add these in your repository settings:

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub access token
- `DATABASE_URL` - Test database URL (optional)
- `ARCJET_KEY` - Arcjet API key (optional for tests)

## 📁 Project Structure

```
acquitions/
├── .github/
│   └── workflows/          # CI/CD workflows
├── src/
│   ├── config/             # Configuration files
│   │   ├── arcjet.js       # Arcjet security config
│   │   ├── database.js     # Database connection
│   │   └── logger.js       # Winston logger config
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.js
│   │   └── user.controller.js
│   ├── middleware/         # Express middleware
│   │   ├── auth.middleware.js      # JWT authentication
│   │   ├── authorize.middleware.js # Role-based authorization
│   │   └── security.middleware.js  # Arcjet security
│   ├── models/             # Database models (Drizzle)
│   │   └── user.model.js
│   ├── routes/             # API routes
│   │   ├── auth.routes.js
│   │   └── user.routes.js
│   ├── services/           # Business logic
│   │   ├── auth.service.js
│   │   └── user.service.js
│   ├── utils/              # Utility functions
│   │   ├── cookies.js      # Cookie helpers
│   │   ├── format.js       # Formatting utilities
│   │   └── jwt.js          # JWT utilities
│   ├── validations/        # Zod validation schemas
│   │   ├── auth.validations.js
│   │   └── user.validations.js
│   ├── app.js              # Express app setup
│   ├── index.js            # Entry point
│   └── server.js           # Server startup
├── test/                   # Test files
│   └── app.test.js
├── scripts/                # Utility scripts
│   ├── dev.sh / dev.ps1    # Development setup
│   └── prod.sh / prod.ps1  # Production setup
├── drizzle/                # Database migrations
├── logs/                   # Application logs
├── coverage/               # Test coverage reports
├── docker-compose.dev.yaml # Development Docker setup
├── docker-compose.prod.yaml # Production Docker setup
├── Dockerfile              # Docker image definition
├── drizzle.config.js       # Drizzle ORM configuration
├── jest.config.mjs         # Jest test configuration
├── eslint.config.js        # ESLint configuration
└── package.json            # Project dependencies
```

## 🛡️ Security Features

- **Password Hashing:** bcrypt with salt rounds
- **JWT Tokens:** HTTP-only cookies, configurable expiration
- **Rate Limiting:** Role-based limits (Admin: 20/min, User: 10/min, Guest: 5/min)
- **Bot Detection:** Arcjet integration
- **Security Headers:** Helmet.js
- **Input Validation:** Zod schemas for all inputs
- **SQL Injection Protection:** Parameterized queries via Drizzle ORM
- **CORS:** Configurable cross-origin resource sharing

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm start` | Start production server |
| `npm test` | Run tests with Jest |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run format-check` | Check code formatting |
| `npm run db:generate` | Generate database migration |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run dev:docker` | Start development with Docker (Windows) |
| `npm run prod:docker` | Start production with Docker (Windows) |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow ESLint rules
- Use Prettier for formatting
- Write tests for new features
- Update documentation as needed

## 📄 License

ISC License

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is running and accessible
- For Neon Local, ensure Docker is running

### Authentication Issues

- Verify `JWT_SECRET` is set
- Check token expiration time
- Ensure cookies are enabled in your client

### Docker Issues

- Ensure Docker Desktop is running
- Check Docker Compose version: `docker compose version`
- Verify `.env.development` or `.env.production` exists

### Test Failures

- Ensure all environment variables are set
- Check database connection for integration tests
- Verify Jest configuration matches your setup

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/roshan3101/acquitions/issues)
- **Repository:** [GitHub Repository](https://github.com/roshan3101/acquitions)

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Neon](https://neon.tech/)
- [Arcjet](https://arcjet.com/)

---

Made with ❤️ using Node.js and Express

