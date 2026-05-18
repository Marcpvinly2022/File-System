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

## 💻 Tech Stack

- **Framework**: Express (Node.js REST API Architecture)
- **Database**: PostgreSQL (Driver optimized with Parameterized Queries to block SQL Injection)
- **Caching & Queue Infrastructure**: Redis Engine (`ioredis` client wrapper & `bullmq` worker ecosystem)
- **Email Microservice Engine**: Nodemailer (Decoupled completely from web server threads)
- **Security Utilities**: Bcrypt, Helmet, JSON Web Tokens (JWT), Express-Rate-Limit, Cookie-Parser
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

* **Terminal 1: Start the Main API Gateway Server**
  ```bash
  npm run dev
  ```
* **Terminal 2: Start the Asynchronous BullMQ Nodemailer Worker Process**
  ```bash
  npm run worker
  ```
