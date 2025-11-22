# Task Manager - Full Stack Application

A modern task management application built with React, Node.js, Express, and MongoDB featuring JWT authentication, real-time search, and responsive UI.

## Features

### Authentication & Security
- User registration and login with JWT tokens
- Password hashing using bcrypt
- Protected routes with middleware
- Client and server-side validation

### Task Management
- Create, read, update, and delete tasks
- Toggle task completion status
- Real-time search functionality
- Filter tasks by status (All, Pending, Completed)

### User Interface
- Responsive design with Tailwind CSS
- Loading states and notifications
- Smooth animations
- Error handling

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Lucide React  
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs  

## Prerequisites

- Node.js (v16+)
- MongoDB (v6+)
- npm or yarn

## Installation

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your-secret-key-min-32-characters
NODE_ENV=development
```

### 2. Frontend Setup

```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Application

Start MongoDB:
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

Start Backend (Terminal 1):
```bash
cd backend
npm run dev
```

Start Frontend (Terminal 2):
```bash
cd client
npm run dev
```

Access the app at http://localhost:3000

## Project Structure

```
task-manager/
├── backend/
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth middleware
│   ├── models/            # Database schemas
│   ├── routes/            # API routes
│   ├── server.js          # Entry point
│   └── package.json
│
└── client/
    ├── src/
    │   ├── App.jsx        # Main component
    │   ├── main.jsx       # React entry
    │   └── index.css      # Styles
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Tasks (All Protected)
- `GET /api/tasks` - Get all tasks (supports `?status=` and `?search=`)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task



## Security Features

- Bcrypt password hashing (10 salt rounds)
- JWT authentication (7-day expiration)
- Protected API routes
- Input validation (client & server)
- CORS configuration
- Environment variable protection



## Deployment

**Backend:** Railway, Render, Heroku  
**Frontend:** Vercel, Netlify, GitHub Pages  
**Database:** MongoDB Atlas (free tier available)




Built with React, Node.js, Express, and MongoDB
