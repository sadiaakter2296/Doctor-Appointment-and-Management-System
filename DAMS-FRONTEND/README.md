# Medical Management System

A comprehensive medical management system built with React, Redux Toolkit, and modern web technologies.

## 🚀 Features

### ✅ Newly Added Libraries & Features
- **UseBounce / useBounce** - Custom bounce animation hooks
- **UseRedux / useRedux** - Typed Redux hooks for state management  
- **Api / APi** - Complete API utilities with error handling
- **ApiSlice / APiSlice** - RTK Query data fetching and caching

### 🏥 Medical Management Features
- **Patient Management** - Complete CRUD operations
- **Doctor Management** - Doctor profiles, schedules, and performance tracking
- **Appointment Scheduling** - Interactive appointment booking and management
- **Billing System** - Invoice generation and payment tracking
- **Inventory Management** - Medicine stock and supply management
- **Staff Management** - Healthcare staff administration
- **Reports & Analytics** - Comprehensive reporting dashboard
- **Communication Center** - Internal messaging system
- **Audit Logs** - Complete activity tracking
- **Waiting List Management** - Queue management system

## 🛠 Technology Stack

- **Frontend**: React 18, React Router v7
- **State Management**: Redux Toolkit, RTK Query
- **Styling**: Tailwind CSS, Custom animations
- **Icons**: Lucide React
- **Charts**: Recharts
- **Build Tool**: Vite
- **Package Manager**: npm

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/SaMe-96/DAMS.git

# Navigate to project directory
cd DAMS

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Usage

### Using Custom Hooks

```javascript
// Bounce animations
import { useBounce } from './hooks/useBounce.js';
const { bounce, bounceStyle } = useBounce({ scale: 1.2 });

// Redux state management
import { useRedux } from './store/hooks.js';
const { dispatch, selector } = useRedux();

// API calls
import { api } from './api/index.js';
const patients = await api.get('/patients');
```

### Using RTK Query

```javascript
import { useGetPatientsQuery, useCreatePatientMutation } from './store/apiSlice.js';

const { data: patients, isLoading } = useGetPatientsQuery();
const [createPatient] = useCreatePatientMutation();
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── appointments/    # Appointment management
│   ├── billing/         # Billing and invoicing
│   ├── doctors/         # Doctor management
│   ├── patients/        # Patient management
│   ├── dashboard/       # Dashboard and analytics
│   └── ...
├── store/              # Redux store and slices
│   ├── index.js        # Store configuration
│   ├── apiSlice.js     # RTK Query API
│   ├── authSlice.js    # Authentication state
│   └── uiSlice.js      # UI state management
├── hooks/              # Custom React hooks
│   └── useBounce.js    # Bounce animation hook
├── api/                # API utilities
│   └── index.js        # HTTP client and endpoints
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

## 🎨 Features in Detail

### Redux State Management
- **Authentication**: Login/logout, user sessions, token management
- **UI State**: Notifications, modals, sidebar, theme management
- **API Caching**: Automatic data synchronization with RTK Query

### Custom Animations
- Bounce animations with customizable scale, duration, and easing
- Hover, click, and trigger-based animation variants
- CSS-in-JS and className-based approaches

### API Integration
- Centralized HTTP client with error handling
- Automatic token injection for authenticated requests
- Retry mechanisms and timeout configuration
- Comprehensive endpoint management

## 🔐 Authentication

The system includes complete authentication management:
- User login/logout
- Token-based authentication
- Role-based access control
- Session persistence

## 📊 Available API Endpoints

- `/patients` - Patient management
- `/doctors` - Doctor profiles and schedules  
- `/appointments` - Appointment booking
- `/medicines` - Inventory management
- `/staff` - Staff administration
- `/billings` - Billing and invoicing
- `/auth` - Authentication

## 🚦 Getting Started

1. Install Git: https://git-scm.com/download/win
2. Clone this repository
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start development server
5. Open `http://localhost:5173` in your browser

## 📝 Documentation

- [Feature Documentation](FEATURES.md) - Detailed feature descriptions
- [Git Setup Guide](GIT_SETUP.md) - Git installation and setup
- [API Documentation](src/api/index.js) - API endpoints and usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**SaMe-96**
- GitHub: [@SaMe-96](https://github.com/SaMe-96)
- Repository: [DAMS](https://github.com/SaMe-96/DAMS)

---

**Built with ❤️ for modern healthcare management**
"# DAMS" 
