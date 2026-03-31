# Task Management API System

A production-ready RESTful API built with **Laravel 12** + **Laravel Sanctum** for token-based authentication. Users can register, login, and fully manage their personal tasks with filtering, pagination, and soft deletes.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Laravel 12 |
| Auth | Laravel Sanctum (token-based) |
| Database | MySQL (SQLite for tests) |
| ORM | Eloquent |
| Testing | PHPUnit 11 |
| PHP | ^8.2 |

---

## Setup Steps

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd task-api
```

### 2. Install dependencies

```bash
composer install
```

### 3. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and set your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=task_api
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Run migrations

```bash
php artisan migrate
```

### 5. Start the development server

```bash
php artisan serve
```

The API will be available at: `http://127.0.0.1:8000/api`

---

## Authentication Flow

```
POST /api/register  →  Returns { token }
POST /api/login     →  Returns { token }

All protected routes require:
  Header: Authorization: Bearer <token>

POST /api/logout    →  Revokes token
```

---

## API Endpoints

### 🔓 Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Login and get token |

### 🔒 Protected Routes (require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me` | Get authenticated user profile |
| POST | `/api/logout` | Logout (revoke token) |
| GET | `/api/tasks` | List all tasks (paginated, filterable) |
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks/{id}` | Get a single task |
| PUT/PATCH | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Soft-delete a task |

---

## Request & Response Examples

### Register

**Request:**
```json
POST /api/register
{
  "name": "Shadab Alam",
  "email": "shadab@example.com",
  "password": "secret123",
  "password_confirmation": "secret123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": { "id": 1, "name": "Shadab Alam", "email": "shadab@example.com" },
    "token": "1|abc123..."
  }
}
```

---

### Login

**Request:**
```json
POST /api/login
{
  "email": "shadab@example.com",
  "password": "secret123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "user": { ... },
    "token": "2|xyz789..."
  }
}
```

---

### Create Task

**Request:**
```json
POST /api/tasks
Authorization: Bearer <token>

{
  "title": "Build task API",
  "description": "Complete with tests and documentation.",
  "status": "in-progress",
  "due_date": "2026-04-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "Build task API",
    "status": "in-progress",
    "due_date": "2026-04-15",
    ...
  }
}
```

---

### List Tasks with Filtering

```
GET /api/tasks                          → All tasks (paginated, 10/page)
GET /api/tasks?status=pending           → Filter by status
GET /api/tasks?due_date=2026-04-15      → Filter by due date
GET /api/tasks?status=completed&page=2  → Status filter + page 2
```

---

## Task Fields

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `title` | string | ✅ | max 255 chars |
| `description` | string | ❌ | — |
| `status` | enum | ❌ | `pending`, `in-progress`, `completed` |
| `due_date` | date | ❌ | `YYYY-MM-DD` format |

---

## Database Schema

### `users`

| Column | Type |
|--------|------|
| id | bigint (PK) |
| name | varchar |
| email | varchar (unique) |
| password | varchar |
| remember_token | varchar |
| timestamps | — |

### `tasks`

| Column | Type |
|--------|------|
| id | bigint (PK) |
| user_id | bigint (FK → users) |
| title | varchar |
| description | text (nullable) |
| status | enum: pending/in-progress/completed |
| due_date | date (nullable) |
| deleted_at | timestamp (soft delete) |
| timestamps | — |

**Indexes:** `status`, `user_id`

---

## Running Tests

```bash
php artisan test
```

Tests use **SQLite in-memory** (configured in `phpunit.xml`) — no database setup needed.

| Test Class | # Tests |
|-----------|---------|
| `AuthTest` | 7 |
| `TaskTest` | 12 |

---

## Error Response Format

All API errors return a consistent JSON shape:

```json
{
  "success": false,
  "message": "Human-readable error message.",
  "errors": { ... }   // only for 422 validation errors
}
```

| HTTP Code | Meaning |
|-----------|---------|
| 200 | Success |
| 201 | Created |
| 401 | Unauthenticated |
| 403 | Forbidden (not your resource) |
| 404 | Not found |
| 422 | Validation error |
| 500 | Server error |

---

## Postman Collection

Import [`postman_collection.json`](./postman_collection.json) into Postman for a ready-to-use collection of all API endpoints.

---

## Features Implemented

- ✅ User Registration, Login, Logout, Profile
- ✅ Token-based auth with Laravel Sanctum
- ✅ Full CRUD for tasks (create, read, update, soft-delete)
- ✅ Task filtering by status and due date
- ✅ Pagination (10 tasks per page)
- ✅ Soft deletes
- ✅ Form Request validation classes
- ✅ Global JSON error handling (401, 404, 405, 422, 500)
- ✅ Laravel logging for API errors
- ✅ 19 automated feature tests
- ✅ Postman collection

---

## License

MIT
