# API Documentation

Base URL: `http://localhost:3000` (or your deployed URL).

Auth is via HTTP-only cookie set on login/register. Send requests with `credentials: 'include'` from the same origin.

---

## Auth

### POST /api/auth/register

Register a new user. Sets the auth cookie on success.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "Optional Name"
}
```

**Response (201):**

```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "Optional Name"
  }
}
```

**Errors:** 400 (validation), 409 (email exists), 500

---

### POST /api/auth/login

Log in. Sets the auth cookie on success.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**

```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "Optional Name"
  }
}
```

**Errors:** 400 (validation), 401 (invalid credentials), 500

---

### POST /api/auth/logout

Clears the auth cookie.

**Response (200):** `{ "success": true }`

---

### GET /api/auth/me

Returns the current user if the cookie is valid.

**Response (200):**

```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "Optional Name"
  }
}
```

**Errors:** 401 (no/invalid cookie)

---

## Tasks

All task endpoints require a valid auth cookie. Tasks are scoped to the authenticated user.

### GET /api/tasks

List tasks with pagination, optional filter by status, and search by title.

**Query params:**

| Param  | Type   | Default | Description        |
|--------|--------|--------|--------------------|
| page   | number | 1      | Page number        |
| limit  | number | 10     | Items per page     |
| status | string | -      | pending \| in_progress \| completed |
| search | string | -      | Filter by title (case-insensitive) |

**Example:** `GET /api/tasks?page=1&limit=10&status=pending&search=meeting`

**Response (200):**

```json
{
  "tasks": [
    {
      "id": "clx...",
      "title": "Task title",
      "description": "Optional description",
      "status": "pending",
      "createdAt": "2025-03-14T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Errors:** 401 (unauthorized), 500

---

### POST /api/tasks

Create a task.

**Request:**

```json
{
  "title": "Task title",
  "description": "Optional description",
  "status": "pending"
}
```

`status` is optional; allowed: `pending`, `in_progress`, `completed`. Default: `pending`.

**Response (201):**

```json
{
  "id": "clx...",
  "title": "Task title",
  "description": "Optional description",
  "status": "pending",
  "createdAt": "2025-03-14T10:00:00.000Z"
}
```

**Errors:** 400 (validation), 401, 500

---

### GET /api/tasks/[id]

Get a single task by ID (must belong to the current user).

**Response (200):** Same shape as one task in the list above.

**Errors:** 401, 404 (not found or not owned), 500

---

### PATCH /api/tasks/[id]

Update a task. All fields optional.

**Request:**

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed"
}
```

**Response (200):** Updated task object.

**Errors:** 400 (validation), 401, 404, 500

---

### DELETE /api/tasks/[id]

Delete a task.

**Response (200):** `{ "success": true }`

**Errors:** 401, 404, 500
