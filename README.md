l# CivicConnect Dashboard

A comprehensive dashboard application for managing civic issues with advanced features including map visualization, analytics, and role-based access control.

## 🚀 Features

### Core Functionality
- **Authentication System** - JWT-based login/register with role management
- **Issue Management** - Create, view, update, and track civic issues
- **Map Visualization** - Interactive map with issue markers and clustering
- **Advanced Filtering** - Multi-criteria filtering and search
- **Analytics Dashboard** - Comprehensive charts and statistics
- **Role-Based Access** - Admin, Department, and User roles
- **Real-time Updates** - Live status changes and notifications

### Technical Features
- **Redux Toolkit** - State management with RTK Query
- **Material-UI** - Modern, responsive UI components
- **TypeScript** - Full type safety
- **React Router** - Client-side routing
- **Leaflet Maps** - Interactive map integration
- **Recharts** - Data visualization
- **Form Validation** - React Hook Form + Yup

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Redux Toolkit + RTK Query
- **UI Framework**: Material-UI (MUI) v5
- **Maps**: Leaflet + React-Leaflet
- **Charts**: Recharts + MUI X Charts
- **Forms**: React Hook Form + Yup validation
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT with refresh tokens

## 📁 Project Structure

```
src/
├── app/
│   └── App.tsx                 # Main app component with routing
├── components/                 # Reusable UI components
├── layouts/                    # Layout components
│   ├── AuthLayout.tsx         # Authentication layout
│   └── DashboardLayout.tsx    # Main dashboard layout
├── pages/                      # Page components
│   ├── auth/                  # Authentication pages
│   ├── dashboard/             # Dashboard pages
│   ├── issues/                # Issue management pages
│   ├── map/                   # Map visualization
│   ├── users/                 # User management
│   ├── departments/           # Department management
│   ├── analytics/             # Analytics and reports
│   └── profile/               # User profile
├── store/                      # Redux store
│   ├── index.ts              # Store configuration
│   ├── slices/               # Redux slices
│   └── api/                  # RTK Query APIs
├── hooks/                      # Custom React hooks
├── theme/                      # Material-UI theme
├── types/                      # TypeScript type definitions
└── utils/                      # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

4. **Preview production build:**
```bash
npm run preview
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://10.76.90.216:5000/api/v1
VITE_APP_NAME=CivicConnect Dashboard
```

### Backend Integration
The dashboard connects to the same backend API as the mobile app:
- **Base URL**: `http://10.76.90.216:5000/api/v1`
- **Authentication**: JWT tokens
- **File Upload**: Cloudinary integration

## 👥 User Roles

### Admin
- Full system access
- User management
- Department management
- Analytics and reports
- Issue assignment and management

### Department Staff
- View assigned issues
- Update issue status
- Department-specific analytics
- Issue management within department

### User
- View public issues
- Create new issues
- Basic dashboard access

## 🗺️ Map Features

- **Interactive Map** - Zoom, pan, and search
- **Issue Markers** - Color-coded by status
- **Clustering** - Group nearby issues
- **Radius Search** - Find issues within distance
- **Filter Integration** - Category and status filters
- **User Location** - GPS-based location services

## 📊 Analytics Features

- **Issue Statistics** - Total, resolved, pending counts
- **Trend Analysis** - Issues over time
- **Category Breakdown** - Issues by category
- **Department Performance** - Resolution rates
- **Geographic Analysis** - Issue distribution
- **Custom Reports** - Exportable data

## 🔍 Advanced Filtering

- **Text Search** - Full-text search across issues
- **Category Filter** - Multiple category selection
- **Status Filter** - Issue status filtering
- **Priority Filter** - Priority level filtering
- **Date Range** - Custom date range selection
- **Location Filter** - Geographic area filtering
- **Department Filter** - Department-specific filtering

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - Theme switching
- **Material Design** - Modern UI components
- **Accessibility** - WCAG compliant
- **Loading States** - Skeleton loaders
- **Error Handling** - User-friendly error messages
- **Notifications** - Toast notifications

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access** - Permission-based routing
- **Token Refresh** - Automatic token renewal
- **Secure Storage** - Encrypted local storage
- **API Security** - Request/response interceptors

## 📱 Mobile Responsiveness

- **Responsive Layout** - Adapts to all screen sizes
- **Touch-Friendly** - Mobile-optimized interactions
- **Progressive Web App** - PWA capabilities
- **Offline Support** - Basic offline functionality

## 🚀 Performance Optimizations

- **Code Splitting** - Lazy loading of routes
- **Memoization** - React.memo and useMemo
- **Virtual Scrolling** - Large data sets
- **Image Optimization** - Lazy loading images
- **Bundle Optimization** - Tree shaking and minification

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Code Quality
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Husky** - Git hooks (if configured)

## 📈 Future Enhancements

- **Real-time Updates** - WebSocket integration
- **Push Notifications** - Browser notifications
- **Advanced Analytics** - Machine learning insights
- **Mobile App** - React Native companion app
- **API Documentation** - Swagger/OpenAPI
- **Testing** - Unit and integration tests
- **CI/CD** - Automated deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for better civic engagement**

