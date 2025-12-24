<div align="center">

# 🎓 Learnflow

### Modern Learning Management System

![Learnflow Logo](./images/logo.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Support](#-support)

</div>

---

## 📖 Overview

Learnflow is a comprehensive Learning Management System designed to streamline educational administration and enhance the learning experience. Built with modern web technologies, it provides a complete solution for managing students, teachers, courses, schedules, and more.

<div align="center">

![Main Dashboard](image.png)
*Main Dashboard - Your central hub for all activities*

</div>

---

## ✨ Features

### 👨‍💼 **Administration**
- **User Management** - Complete CRUD operations for students, teachers, and administrators
- **Department Management** - Organize departments, specialties, and levels
- **Class Management** - Create and manage classes with bulk student assignments
- **Reference Data** - Manage rooms, subjects, and educational resources

<div align="center">

![Admin User Management](image-1.png)
*User Management Interface*

![Department Management](image-2.png)
*Department & Specialties Management*

</div>

### 📅 **Calendar & Scheduling**
- **Smart Timetable Generator** - Automated schedule creation with conflict detection
- **Drag & Drop Interface** - Intuitive schedule management
- **Teacher Calendar** - Individual teacher schedules and availability
- **Class Schedules** - Weekly and monthly views
- **Event Management** - Create and manage academic events

<div align="center">

![Calendar Dashboard](image-3.png)
*Calendar Management Dashboard*

![Timetable View](image-4.png)
*Weekly Timetable View*

![Class Schedule](image-5.png)
*Class Schedule Management*

</div>

### 📚 **Academic Management**
- **Grade Management** - Track and manage student grades
- **Document Repository** - Centralized document storage and sharing
- **Project Management** - Manage student projects and submissions
- **Announcements** - System-wide and class-specific announcements

<div align="center">

![Grade Management](image-6.png)
*Grade Management System*

![Document Repository](image-7.png)
*Document Repository Interface*

</div>

### 💬 **Communication**
- **Real-time Messaging** - Instant communication between users
- **Notifications Center** - Comprehensive notification system
- **Event Registration** - Student event enrollment and management
- **Announcements Feed** - Stay updated with latest news

<div align="center">

![Messaging System](image-8.png)
*Real-time Messaging Interface*

![Notifications](image-9.png)
*Notifications Center*

</div>

### 📊 **Department Head Dashboard**
- **Department Overview** - Complete statistics and insights
- **Student Monitoring** - Track individual student performance
- **Teacher Management** - Manage department teaching staff
- **Analytics** - Data-driven decision making

<div align="center">

![Department Head Dashboard](image-10.png)
*Department Head Dashboard with Analytics*

</div>

### 👨‍🏫 **Teacher Portal**
- **Personal Dashboard** - Overview of classes and schedules
- **Grade Entry** - Easy grade management
- **Attendance Tracking** - Mark and review attendance
- **Course Materials** - Share resources with students

<div align="center">

![Teacher Dashboard](image-11.png)
*Teacher Portal Dashboard*

![Teacher Schedule](image-12.png)
*Teacher Schedule & Classes*

</div>

### 🎓 **Student Portal**
- **Personal Dashboard** - Access to all courses and grades
- **Schedule Viewer** - Personal timetable and events
- **Absence Justification** - Submit and track absence requests
- **Document Access** - Download course materials
- **Event Registration** - Register for school events

<div align="center">

![Student Dashboard](image-13.png)
*Student Portal Dashboard*

![Student Schedule](image-14.png)
*Student Personal Schedule*

</div>

### 📋 **Additional Features**
- **Absence Justification System** - Submit and review absence requests
- **Library Management** - Browse and borrow books
- **Support Center** - Help desk and ticket system
- **Feedback System** - Collect and manage user feedback
- **Multi-role Access** - Role-based permissions and views

---

## 🚀 Demo

### Live Screenshots

<div align="center">

| Events Management | Announcements | Support Center |
|-------------------|---------------|----------------|
| ![Events](image-15.png) | ![Announcements](image-16.png) | ![Support](image-17.png) |

| Library System | Analytics | Reports |
|----------------|-----------|----------|
| ![Library](image-18.png) | ![Analytics](image-19.png) | ![Reports](image.png) |

</div>

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.3+ - UI Framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP Client
- **CSS Modules** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication

### Services Architecture
```
📦 Learnflow
├── 🔐 Auth Service (Port 3000)
├── 📅 Events Service (Port 3002)
├── 💬 Messaging Service (Port 3003)
└── 🔔 Notifications Service (Port 3004)
```

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/MaizaAymen/Learnflow.git
cd Learnflow
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend/learnflow
npm install

# Install backend services
cd ../../backend/auth-service
npm install

cd ../Gestion\ des\ Événements
npm install

cd ../Messagerie
npm install

cd ../Service\ de\ Notifications
npm install
```

3. **Configure environment variables**

Create `.env` files in each service directory:

**Auth Service** (`backend/auth-service/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/learnflow"
JWT_SECRET="your-secret-key"
PORT=3000
```

**Events Service** (`backend/Gestion des Événements/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/learnflow"
PORT=3002
```

**Messaging Service** (`backend/Messagerie/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/learnflow"
PORT=3003
```

**Notifications Service** (`backend/Service de Notifications/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/learnflow"
PORT=3004
```

**Frontend** (`frontend/learnflow/.env`):
```env
VITE_AUTH_URL=http://localhost:3000/auth
VITE_EVENTS_URL=http://localhost:3002
VITE_MESSAGING_URL=http://localhost:3003
VITE_NOTIFICATIONS_URL=http://localhost:3004
```

4. **Setup database**
```bash
cd backend/auth-service
npx prisma migrate dev
npx prisma db seed
```

5. **Start services**

Use the provided scripts or start each service manually:

**Windows:**
```bash
./setup.bat
```

**Linux/Mac:**
```bash
./setup.sh
```

**Or manually:**
```bash
# Terminal 1 - Auth Service
cd backend/auth-service
npm start

# Terminal 2 - Events Service
cd backend/Gestion\ des\ Événements
npm start

# Terminal 3 - Messaging Service
cd backend/Messagerie
npm start

# Terminal 4 - Notifications Service
cd backend/Service\ de\ Notifications
npm start

# Terminal 5 - Frontend
cd frontend/learnflow
npm run dev
```

6. **Access the application**
```
Frontend: http://localhost:5173
Backend Services: http://localhost:3000-3004
```

---

## 📚 Documentation

Comprehensive documentation is available in the `/arch` directory:

- **[START_HERE.md](./arch/START_HERE.md)** - Getting started guide
- **[ARCHITECTURE_DIAGRAMS.md](./arch/ARCHITECTURE_DIAGRAMS.md)** - System architecture
- **[COMPLETE_FILE_STRUCTURE.md](./arch/COMPLETE_FILE_STRUCTURE.md)** - Project structure
- **[DOCUMENTATION_INDEX.md](./arch/DOCUMENTATION_INDEX.md)** - Complete documentation index

### Key Documentation
- [Calendar System Guide](./arch/CALENDAR_CRUD_COMPLETE.md)
- [Drag & Drop Calendar](./arch/DRAGDROP_CALENDAR_GUIDE.md)
- [Absence Justification](./arch/README_ABSENCE_JUSTIFICATION.md)
- [Events Registration](./arch/STUDENT_EVENTS_REGISTRATION_IMPLEMENTATION.md)
- [Bulk Student Assignment](./arch/STUDENT_BULK_ASSIGNMENT_GUIDE.md)

---

## 🎯 User Roles

### 🔑 Default Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | admin@learnflow.com | admin123 |
| Teacher | teacher@learnflow.com | teacher123 |
| Student | student@learnflow.com | student123 |
| Department Head | head@learnflow.com | head123 |

### 👥 Role Permissions

- **Administrator** - Full system access and configuration
- **Department Head** - Department management and teacher oversight
- **Teacher** - Class management, grades, and attendance
- **Student** - Access to courses, grades, and personal schedule

---

## 🚀 Deployment

### Vercel Deployment (Frontend)
```bash
cd frontend/learnflow
vercel deploy
```

### Render Deployment (Backend)
See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed instructions.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Update documentation for new features
- Add tests for new functionality

---

## 🐛 Known Issues & Troubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Reset database
npx prisma migrate reset
npx prisma generate
```

**Port Already in Use:**
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Module Not Found:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Project Statistics

- **Total Lines of Code**: 50,000+
- **Components**: 100+
- **Services**: 4 microservices
- **Database Tables**: 20+
- **API Endpoints**: 150+

---

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered grade predictions
- [ ] Video conferencing integration
- [ ] Mobile notifications
- [ ] Multi-language support
- [ ] Advanced reporting system
- [ ] Integration with external LMS
- [ ] Blockchain certificates

---

## 📞 Support

Need help? We're here for you!

- 📧 **Email**: support@learnflow.com
- 💬 **Discord**: [Join our community](https://discord.gg/learnflow)
- 📖 **Documentation**: [docs.learnflow.com](https://docs.learnflow.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/MaizaAymen/Learnflow/issues)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape Learnflow
- Built with ❤️ by the Learnflow team
- Special thanks to the open-source community

---

<div align="center">

### ⭐ Star us on GitHub if you find this project useful!

Made with ❤️ by [Aymen Maiza](https://github.com/MaizaAymen)

**[Back to Top](#-learnflow)**

</div>