# Login API 🔐

This is a backend authentication service built as part of my coding course. It handles user registration, login, and secure token generation.

## 🛠 Features
- **User Registration**: Hash passwords before saving to the database.
- **Secure Login**: Validates credentials and returns a JWT (JSON Web Token).
- **Protected Routes**: Restricts access to specific data unless the user is logged in.

## 💻 Tech Stack
- **Node.js** & **Express** (Server)
- **Bcrypt** (Password hashing)
- **JSON Web Token (JWT)** (Authentication)
- **MongoDB/PostgreSQL** (Database - *choose yours*)

## 🚦 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Login and get a token |
| GET | `/api/profile` | View profile (Protected) |

## ⚙️ Setup Instructions
1. Navigate to this folder: `cd login-api`
2. Install packages: `npm install`
3. Create a `.env` file and add your `JWT_SECRET` and `PORT`.
4. Run the server: `npm run dev`
