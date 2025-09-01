# DAMS - Digital Administration Management System

A comprehensive hospital and clinic management system built with React.js frontend and Laravel backend.

## 🏥 Features

### 🔐 Authentication System
- User registration and login
- Token-based authentication
- Secure password hashing
- Session management

### 📊 Dashboard & Analytics
- Real-time statistics
- Patient flow monitoring
- Appointment analytics
- Revenue tracking

### 👥 Patient Management
- Patient registration and profiles
- Medical history tracking
- Appointment scheduling
- Billing and invoicing

### 👨‍⚕️ Doctor Management
- Doctor profiles and specializations
- Schedule management
- Performance analytics
- Patient assignment

### 📅 Appointment System
- Online booking
- Calendar integration
- Automated reminders
- Status tracking

### 🏥 Hospital Modules
- **Pharmacy Management**: Medicine inventory, prescriptions, stock tracking
- **Laboratory Management**: Test orders, results, sample tracking
- **Admission Management**: Patient admissions, room assignments, discharge
- **Emergency Management**: Emergency cases, triage, critical care
- **Inventory Management**: Medical supplies, equipment tracking

### 💊 Prescription & Billing
- Digital prescriptions
- Insurance processing
- Payment tracking
- Financial reports

### 📋 Additional Features
- Staff management
- Notification system
- Report generation
- Audit logs
- Settings & configuration

## 🛠️ Technology Stack

### Frontend
- **React.js** - User interface
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Router** - Navigation
- **Vite** - Build tool

### Backend
- **Laravel** - PHP framework
- **SQLite** - Database
- **Laravel Sanctum** - API authentication
- **Eloquent ORM** - Database abstraction

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- PHP (v8.1+)
- Composer
- Git

### Frontend Setup
```bash
cd DAMS-FRONTEND
npm install
npm run dev
```

### Backend Setup
```bash
cd DAMS-Backend
composer install
php artisan migrate
php artisan db:seed
php artisan serve --port=3001
```

## 🔑 Default Login Credentials

### Test Users
- **Admin**: admin@dams.com / password123
- **Doctor**: doctor@dams.com / doctor123
- **Nurse**: nurse@dams.com / nurse123

## 📡 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get user profile

### Health Check
- `GET /api/health` - API health status
- `GET /api/test` - API test endpoint

## 🏗️ Project Structure

```
DAMS/
├── DAMS-FRONTEND/          # React.js frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   ├── api/           # API services
│   │   └── hooks/         # Custom hooks
│   └── public/            # Static files
│
├── DAMS-Backend/          # Laravel backend
│   ├── app/
│   │   ├── Http/          # Controllers & middleware
│   │   └── Models/        # Eloquent models
│   ├── database/          # Migrations & seeders
│   ├── routes/            # API routes
│   └── storage/           # Logs & files
│
└── README.md
```

## 🎨 UI Features

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on all devices
- **Glass Morphism**: Modern visual effects
- **Interactive Cards**: Hover effects and animations
- **Color-coded Status**: Visual status indicators
- **Loading States**: User feedback for all actions

## 🛡️ Security Features

- Password hashing with bcrypt
- CSRF protection
- Input validation and sanitization
- Token-based authentication
- CORS configuration
- Error handling and logging

## 🔄 Development Workflow

### Starting Development Servers
```bash
# Start backend (Terminal 1)
cd DAMS-Backend
php artisan serve --port=3001

# Start frontend (Terminal 2)
cd DAMS-FRONTEND
npm run dev
```

### Making Changes
1. Make your changes in the appropriate files
2. Test locally
3. Commit changes: `git add . && git commit -m "Your message"`
4. Push to GitHub: `git push origin main`

## 📝 Recent Updates

### Latest Features (September 2025)
- ✅ Full backend API integration
- ✅ Real database authentication
- ✅ Enhanced error handling
- ✅ Admission management functionality
- ✅ Laboratory management system
- ✅ Pharmacy management module
- ✅ 500 error prevention system
- ✅ Cross-origin request handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for modern healthcare management**
