# SportConnect - Complete Sports Social Platform

🏃‍♂️ **SportConnect** is a comprehensive sports social platform built for Denmark that connects people with similar sporting interests to organize and participate in sports events.

## 🚀 Features

### 🔐 **Authentication System**
- User registration with full profile setup
- Secure login/logout with JWT tokens
- Protected routes and session management
- Multi-language support (English/Danish)

### 🏠 **Dashboard**
- Real-time user statistics (events participated, created, badges, friends)
- Event discovery with advanced filtering
- Search by sport, date, skill level, and location
- Quick event joining from dashboard
- Upcoming events overview

### 📅 **Events Management**
- Create detailed sports events with bilingual content
- Event details with participant management
- Real-time chat for event participants
- Join/leave events with capacity management
- Event search and filtering
- Location-based event discovery

### 👤 **Profile Management**
- Complete profile editing (bio, sports, skill level)
- Sports preferences selection
- Achievement badges system
- User statistics tracking
- Profile photo support

### 👥 **Social Features**
- Friends system with intelligent suggestions
- Add/remove friends functionality
- Real-time friend search
- Private chat with friends
- Mutual events tracking

### 🎨 **Modern UI/UX**
- Responsive design for all devices
- Sports-themed visual design
- Smooth animations and transitions
- Loading states and error handling
- Toast notifications
- Dark/light theme support

## 🛠️ Technology Stack

### **Frontend**
- **React 19** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form management
- **Zustand** - State management

### **Backend**
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **JWT** - Authentication tokens
- **Pydantic** - Data validation
- **Bcrypt** - Password hashing

### **DevOps & Tools**
- **Docker** - Containerization
- **Supervisor** - Process management
- **Hot Reload** - Development efficiency
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
/app/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── contexts/       # React contexts (Auth, Language)
│   │   ├── services/       # API service layer
│   │   ├── hooks/          # Custom React hooks
│   │   └── data/           # Constants and utilities
│   ├── public/
│   └── package.json
├── backend/
│   ├── server.py           # Main FastAPI application
│   ├── models.py           # Pydantic data models
│   ├── database.py         # MongoDB utilities
│   ├── auth.py             # Authentication logic
│   ├── sports_data.py      # Sports configuration
│   ├── utils.py            # Helper functions
│   └── requirements.txt
└── README.md
```

## 🏃‍♂️ Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Python 3.11+ (for development)

### Development Setup

1. **Clone and start the application:**
   ```bash
   # The application is already running in the container
   # Frontend: http://localhost:3000
   # Backend API: http://localhost:8001/api
   ```

2. **Access the application:**
   - Frontend: `https://your-preview-url.com`
   - Backend API: `https://your-preview-url.com/api`
   - API Documentation: `https://your-preview-url.com/api/docs`

### 🔧 Configuration

#### Environment Variables

**Frontend** (`.env`):
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

**Backend** (`.env`):
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=sportconnect
SECRET_KEY=your-jwt-secret-key
```

## 📚 API Documentation

The API is automatically documented using FastAPI's built-in Swagger UI:
- **Swagger UI**: `/api/docs`
- **ReDoc**: `/api/redoc`

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Events
- `GET /api/events` - List events with filters
- `POST /api/events` - Create new event
- `GET /api/events/{id}` - Get event details
- `POST /api/events/{id}/join` - Join event
- `POST /api/events/{id}/leave` - Leave event
- `GET /api/events/{id}/messages` - Get event messages
- `POST /api/events/{id}/messages` - Send message

#### Users
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics

#### Friends
- `GET /api/friends` - Get friends list
- `GET /api/friends/suggestions` - Get friend suggestions
- `POST /api/friends/{id}` - Add friend
- `DELETE /api/friends/{id}` - Remove friend

#### Sports
- `GET /api/sports` - Get all sports

## 🌍 Internationalization

The application supports:
- **English** (default)
- **Danish** (Dansk)

All user-facing content is localized, including:
- UI text and labels
- Event titles and descriptions
- Sports names
- Error messages

## 🎯 Features in Detail

### Event Creation
- Bilingual event titles and descriptions
- Sport categorization with visual icons
- Date and time scheduling
- Location with full address
- Participant capacity limits
- Skill level targeting
- Pricing support (free or paid events)

### Chat System
- Real-time messaging in events
- Participant-only access
- Message history
- Bilingual message support
- Private friend chat

### Friends System
- Intelligent friend suggestions based on:
  - Shared sports interests
  - Location proximity
  - Mutual events
- Search functionality
- Friend status tracking

### Sports Categories
- ⚽ Football (Fodbold)
- 🏀 Basketball
- 🎾 Tennis
- 🏃 Running (Løb)
- 🚴 Cycling (Cykling)
- 💪 Fitness

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS configuration
- SQL injection prevention

## 📱 Mobile Responsiveness

- Fully responsive design
- Mobile-first approach
- Touch-friendly interface
- Optimized for all screen sizes
- Progressive Web App features

## 🚀 Performance

- Optimized API queries
- Database indexing
- Lazy loading
- Code splitting
- Image optimization
- Caching strategies

## 🧪 Testing

The application includes comprehensive testing:
- Backend API testing (25+ endpoints)
- Frontend component testing
- Integration testing
- User flow testing

## 🔄 Real-time Features

- Live event updates
- Real-time participant changes
- Instant chat messaging
- Friend status updates

## 🏆 Achievement System

Users earn badges for:
- First event participation
- Event creation
- Community building
- Consistent participation

## 🌟 Future Enhancements

- Push notifications
- GPS-based event discovery
- Social media integration
- Advanced analytics
- Event recurring schedules
- Payment integration

## 📄 License

This project is proprietary software developed for SportConnect.

## 👥 Support

For support and questions:
- Email: support@sportconnect.dk
- GitHub Issues: [Project Repository]

---

**Built with ❤️ for the Danish sports community** 🇩🇰

Ready to connect athletes and organize amazing sports events! 🏃‍♂️⚽🏀🎾🚴💪