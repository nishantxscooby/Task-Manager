# Detailed setup: Environment and database

Follow these steps to copy your env file and connect to a database.

---

## Step 1: Copy the env file

From the project root (`Assignment/`), run:

```bash
cp .env.example .env
```

This creates a `.env` file. **Do not commit `.env`** (it’s in `.gitignore`); it holds secrets.

---

## Step 2: Understand each variable

Open `.env` in your editor. You’ll see:

| Variable        | Purpose |
|----------------|--------|
| `DATABASE_URL` | PostgreSQL connection string. Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE` |
| `JWT_SECRET`   | Secret used to sign JWTs. Must be **at least 32 characters**. Use a long random string. |
| `ENCRYPTION_KEY` | 32-byte key in **hex** = **64 hex characters** (0–9, a–f). Used for optional AES encryption. |
| `NODE_ENV`     | `development` locally; set to `production` when you deploy. |

---

## Step 3: Get a PostgreSQL database

Choose **one** of the options below.

### Option A: Free cloud database (easiest, no install)

**Neon (recommended)**

1. Go to [neon.tech](https://neon.tech) and sign up (free).
2. Create a new project and pick a region.
3. Copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).
4. Paste it into `.env` as `DATABASE_URL`:

   ```env
   DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```

**Supabase**

1. Go to [supabase.com](https://supabase.com), create a project.
2. In **Project Settings → Database**, copy the **URI** (connection string).
3. Use it as `DATABASE_URL` in `.env`. It usually already includes `?sslmode=require` or similar.

---

### Option B: PostgreSQL on your Mac (Homebrew)

1. Install PostgreSQL:

   ```bash
   brew install postgresql@16
   brew services start postgresql@16
   ```

2. Create a user and database (optional; you can use your Mac user):

   ```bash
   createuser -s postgres   # if you want a 'postgres' user
   createdb taskdb         # database name
   ```

3. In `.env` use one of these (replace `YOUR_MAC_USER` with your macOS username if needed):

   ```env
   # Using default local postgres + database 'taskdb'
   DATABASE_URL="postgresql://localhost:5432/taskdb"
   ```

   If PostgreSQL was set up with a username and password:

   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/taskdb"
   ```

---

### Option C: PostgreSQL with Docker

1. Start a Postgres container:

   ```bash
   docker run -d --name taskdb-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=taskdb -p 5432:5432 postgres:16
   ```

2. In `.env`:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskdb"
   ```

---

## Step 4: Generate secrets (JWT_SECRET and ENCRYPTION_KEY)

**JWT_SECRET** – at least 32 characters. Generate a random string:

```bash
openssl rand -base64 32
```

Copy the output (e.g. `K7gNu2...`) into `.env`:

```env
JWT_SECRET="K7gNu2..."
```

**ENCRYPTION_KEY** – exactly 64 hex characters (0–9, a–f). Generate:

```bash
openssl rand -hex 32
```

Example output: `a1b2c3d4e5f6...` (64 chars). Put it in `.env`:

```env
ENCRYPTION_KEY="a1b2c3d4e5f6..."
```

No quotes are required unless the value has spaces; quotes are fine.

---

## Step 5: Your final `.env` (example)

After filling everything in, `.env` should look like this (with your own values):

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# JWT secret (min 32 chars for HS256)
JWT_SECRET="your-generated-secret-from-openssl-rand-base64-32"

# Encryption key (32 bytes hex = 64 chars for AES-256)
ENCRYPTION_KEY="your-64-char-hex-from-openssl-rand-hex-32"

# development locally; production when deployed
NODE_ENV=development
```

---

## Step 6: Create database tables

From the project root:

```bash
npx prisma generate
npx prisma db push
```

- `prisma generate` – generates the Prisma client from your schema.
- `prisma db push` – creates/updates tables in the database to match `prisma/schema.prisma` (no migration files).

If `db push` fails:

- **"Can't reach database"** – check `DATABASE_URL`, and that the DB is running (or the cloud URL is correct and reachable).
- **Authentication failed** – wrong user/password in `DATABASE_URL`.
- **SSL required** – for Neon/Supabase, add `?sslmode=require` at the end of `DATABASE_URL`.

---

## Step 7: Verify

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Register**, create an account, then open **Tasks**. If you see the tasks page and can add a task, the app is using your `.env` and database correctly.

Optional: open the database in a GUI:

```bash
npx prisma studio
```

This opens a browser UI to view and edit `User` and `Task` tables.
