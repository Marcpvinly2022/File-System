# Enterprise Express Authentication Engine 🔐

A production-grade, highly secure authentication engine migrated from manual Node.js core streams to a robust **Enterprise Express Architecture**. This system features a distributed runtime ecosystem that completely separates web-traffic processing from background asynchronous email tasks via a Redis memory bus.

## 🛠 Advanced Architecture & Features

- **Distributed Micro-Processes (Multi-Process Execution)**: Engineered for high scaling. The core web API and the background email queue run as entirely independent processes, isolating SMTP network overloads from the main user experience loops.
- **Asynchronous Task Queueing**: Background worker offloading powered by **BullMQ** and **Nodemailer** ensuring user registration and password resets never block or slow down web server execution.
- **Express-Driven Middleware Pipelines**: Replaced legacy, manual Node.js request parsing (`getBody`) and manual header overrides (`res.writeHead`) with native, scalable Express pipelines.
- **Pipelined Security & DoS Protection**: 
  - Automated secure HTTP headers using **Helmet**.
  - Strict input stream limits (`express.json({ limit: '1mb' })`) preventing payload-based Denial-of-Service (DoS) memory overloads.
  - Network-level **Rate Limiting** via `express-rate-limit` tracking client IPs to arrest brute-force routines.
- **Robust Input Sanitization**: Defensive boundary casing via `.trim().toLowerCase()` transformations mapping safely to backend database queries.
- **Dual-Token Native Cookie Engine**: Access tokens paired alongside securely isolated, Express-managed `HttpOnly`, `SameSite: strict`, and SSL-enforced state validation cookies.
- **Real-Time Token Revocation**: Instant signature revocation on logouts mapping dynamic JWT expiration values directly to an in-memory **Redis Cache engine**.
- **Declarative RBAC Middleware**: Flat, human-readable execution pipelines isolating public, general user, and strict Administrative boundaries.
- **Dockerized Runtime Ecosystem**: Engineered for high portability and scaling. The entire stack (API, Worker, Postgres, Redis, Dashboard) is orchestrated via Docker, isolating SMTP network overloads and database processes from the main user experience loops.
- **Asynchronous Task Queueing**: Background worker offloading powered by **BullMQ** ensuring user registration and password resets never block web server execution.
- **Atomic Idempotency Locking**: Implemented a Redis-backed **Atomic Lock** (`X-Idempotency-Key`) to prevent "double-tap" request spam and redundant expensive Bcrypt operations.
- **Pipelined Security & Obscurity**: 
  - Automated secure HTTP headers using **Helmet**.
  - Strict input stream limits (`express.json({ limit: '1mb' })`) preventing payload-based DoS memory overloads.
  - **Tricky Rate Limiting**: Redis-powered IP tracking with "vague" responses (`SEC-THR-01`) to mislead automated brute-force scripts.
- **Observability Dashboard**: Integrated **BullBoard** for real-time visual monitoring of background email queues (Active/Waiting/Failed/Completed).
- **Automated Infrastructure**: Uses `init.sql` for automated UUID-based schema provisioning on container startup.

## 💻 Tech Stack

- **Framework**: Express (Node.js REST API Architecture)
- **Database**: PostgreSQL (Driver optimized with Parameterized Queries to block SQL Injection)
- **Caching & Queue Infrastructure**: Redis Engine (`ioredis` client wrapper & `bullmq` worker ecosystem)
- **Email Microservice Engine**: Nodemailer (Decoupled completely from web server threads)
- **Security Utilities**: Bcrypt, Helmet, JSON Web Tokens (JWT), Express-Rate-Limit, Cookie-Parser
- **Orchestration**: Docker & Docker Compose
- **Task Automation & Process Isolation**: Nodemon, BullMQ Worker Handlers

## 🚦 Core API Pipeline Documentation

All route processing chains pass through centralized Express middleware arrays before executing controller code.



| Method | Endpoint | Description | Guard Middleware | Access Layer |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/register` | Spawns user entry & pushes background email jobs to Redis | None | Public |
| **POST** | `/api/login` | Validates records, passes Rate Limiter, drops native cookies | `loginLimiter` | Public |
| **POST** | `/api/refresh` | Rotates short-lived state variables using valid cookie values | None | Public |
| **POST** | `/api/forgot-password` | Formats obfuscated reset token generation (Mitigates profiling) | None | Public |
| **POST** | `/api/reset-password`| Consumes valid SHA256 hashed parameters to execute credential changes | None | Public |
| **POST** | `/api/logout` | Clears client cookies and commits active signatures to Redis cache | None | Private |
| **GET** | `/api/protected` | General protected asset path execution | `authenticate`, `authorize` | User / Admin |
| **GET** | `/api/admin` | Enterprise isolation tier paths | `authenticate`, `authorize` | Admin Only |

## 📸 Enterprise Integration Matrix (Thunder Client Tests)

### Register Endpoint
![Register Success](../media/register-endpoint.png)

### Login Endpoint
![Login Success](../media/login-endpoint.png)

### Refresh Endpoint
![Refresh Token Success](../media/refreshtoken-test.png)

### Logout Endpoint
![Logout Success](../media/logout.png)

### Protected Endpoint
![Authorize User and Admin can access the resource](../media/protected.png)

### Admin Endpoint
![Only Admin can access the resource](../media/Admin.png)

## ⚙️ Orchestration and Infrastructure Installation

### 1. Repository Initializing
Navigate to your active directory core and install the production module dependencies:
```bash
cd login-api
npm install
```

### 2. Configuration Parameters Matrix (`.env`)
Create a root `.env` system profile using the blueprint mapping matrix below:
```env
# Server Pipeline Configuration
PORT=6000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,https://yourfrontend.com

# Crypto / Security Engine Credentials
JWT_SECRET=your_ultra_secure_access_secret_signature
REFRESH_SECRET=your_long_lived_refresh_rotation_secret

# Relational Database Storage Parameters
POSTGRE_PASSWORD=your_secure_db_password

# Asynchronous Memory Bus Configurations (BullMQ / Token Blacklists)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Email SMTP Credentials (Used inside emailWorker.js via Nodemailer)
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### 3. Local Infrastructure Verification
Ensure both your local PostgreSQL schema instances and your background Redis memory queues are up and responding efficiently before spinning up the Express app pipeline:
```bash
# Verify or trigger native local background engine tasks
sudo service redis-server start
```

### 4. Running the Ecosystem (Dual-Process Orchestration)
Because this application relies on a **distributed worker model**, you must spin up both processes in separate terminal instances so they can coordinate via Redis:


### Background Email Processing SystemTo ensure our application stays 
 fast and responsive, we process time-consuming tasks like sending emails in the background using a Queue System powered by Redis and 
 
 - **BullMQ.💡 Why use a queue?**
 
 When a user registers or requests a password reset, sending an email immediately can slow down the website. 
 
 If the email provider is slow, the user is left waiting. By using a queue, we instantly tell the user "Success!" and let our background system handle the heavy lifting.
 
 - **How It Works (The 3 Components)**
 The Post Office (Redis Connection - redisClient.js)Redis acts as our central database holding tank.
 
 We created a stable connection that safely holds all the pending tasks (like a mailbox waiting to be emptied) without slowing down our main app.
 
 - **The Mailbox (The Queue - emailQueue.js)**
 
 This is where jobs are placed when a user triggers an action.
 If a user signs up, a send-email job is added to the queue.If they lose their password, a reset-password job is added.Safety built-in: 
 
 If a job fails (e.g., a temporary network issue), the queue automatically retries up to 3 times before giving up.
 
 - **The Mail Carrier (The Worker - emailWorker.js)**
 The Worker runs continuously in the background, listening to the Redis mailbox.
 As soon as a job drops into the queue, the worker picks it up and uses Nodemailer to send out the actual email (Welcome or Password Reset).
 Traffic Control: The worker is strictly configured to process emails one by one at a safe speed to avoid being flagged as spam by Google.

* **Terminal 1: Start the Main API Gateway Server**
  ```bash
  npm run dev
  ```
* **Terminal 2: Start the Asynchronous BullMQ Nodemailer Worker Process**
  ```bash
  npm run worker
  ```

## ⚙️ Orchestration & Installation

### 1. Blueprint Configuration (`.env`)
Create a root `.env` system profile using the blueprint below:
```env
# Docker Networking (Use Service Names)
DB_HOST=db-srv
REDIS_HOST=redis-srv
PORT=6000

# Security
POSTGRES_PASSWORD=your_password
JWT_SECRET=your_secret
REFRESH_SECRET=your_refresh_secret
```

### 2. Running the Ecosystem
We have simplified the lifecycle management via npm scripts:

* **Standard Start / Apply Code Changes:**
  ```bash
  npm run docker:up
  ```
* **Wipe Database & Start Fresh (Atomic Reset):**
  ```bash
  npm run docker:reset
  ```

### 3. Service Access Map
* **Main API**: `http://localhost:6000`
* **Queue Dashboard**: `http://localhost:3001` (Monitor emails here)
* **Postgres External**: `localhost:5433` (For pgAdmin/DBeaver)

## 📸 Enterprise Integration Matrix

### Queue Observability (BullBoard)
*Monitor the asynchronous memory bus in real-time.*
![BullBoard Dashboard](../media/bull-board.png)

### Security Shield (Rate Limiting & Idempotency)
*Blocking double-submissions and brute-force attempts.*
![Security Logs](../media/security-logs.png)