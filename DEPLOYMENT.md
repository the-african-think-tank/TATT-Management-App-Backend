# Deployment Guide (Docker)

This guide explains how to deploy the TATT Management App Backend alongside a PostgreSQL database using Docker Compose.

## 1. Prerequisites
- Docker and Docker Compose installed on your server.
- Basic knowledge of terminal commands.

## 2. Configuration (`.env`)
Create or update your `.env` file in the root directory. Ensure it contains the necessary credentials:

```env
# Server Port
PORT=3000

# Database Credentials
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_secure_password
DB_NAME=tatt_db

# Set to true for the VERY FIRST run to create tables, then set to false
DB_SYNC=true

# Security
JWT_SECRET=your_jwt_secret_key

# Third Party Integrations
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mail (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM="TATT <noreply@tatt.org>"

# App URLs
API_BASE_URL=https://api.yourdomain.com
CORS_ORIGINS=https://app.yourdomain.com,http://localhost:3000
```

## 3. Deployment Steps

### Step 1: Build and Start
Run the following command to build the images and start the containers in the background:

```bash
docker-compose up -d --build
```

### Step 2: Initialize Schema (First Time Only)
Ensure `DB_SYNC=true` is set in your `.env` before running `docker-compose up`. The application will automatically create all tables and enums on startup.

**Important:** Once the application is running and tables are created, it is highly recommended to change `DB_SYNC=false` and restart the container to prevent accidental schema changes.

```bash
# Update .env to DB_SYNC=false
docker-compose up -d
```

### Step 3: Verify
- **API Docs**: Visit `http://your-server-ip:3000/api-docs` to ensure the API is up.
- **Database**: Visit `http://your-server-ip:8080` (Adminer) to inspect the database. 
  - *System*: PostgreSQL
  - *Server*: postgres
  - *User*: (your DB_USER)
  - *Password*: (your DB_PASS)

## 4. Folder Structure for Volumes
- **`./uploads`**: This local folder is mapped to `/app/uploads` in the container. All media uploaded via the API will persist here.
- **`postgres_data`**: A Docker volume named `postgres_data` is used to persist your database data even if containers are removed.

## 5. Maintenance
- **View Logs**: `docker-compose logs -f api`
- **Restart**: `docker-compose restart api`
- **Stop**: `docker-compose down` (Add `-v` if you want to delete all database data - BE CAREFUL).
