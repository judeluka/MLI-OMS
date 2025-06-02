# Summer Camp Booking Portal

A modern, responsive React application for education agencies to manage group enrollments for English language summer camps.

## 🎯 Project Overview

This booking portal is designed specifically for international education agencies to:
- Browse and explore summer camp programs
- Enroll groups of students in English language camps
- Manage existing enrollments and track progress
- Access important documents and resources
- Handle accommodation and package selections

## 🚀 Features

### ✅ Implemented (Phase 1)
- **Authentication System**: Secure login for agency partners
- **Dashboard**: Overview of enrollments, statistics, and quick actions
- **Modern UI**: Professional design with Tailwind CSS
- **Responsive Layout**: Mobile-first design that works on all devices
- **Navigation**: Intuitive sidebar navigation with user management
- **State Management**: Zustand store for enrollment flow management
- **Mock Data**: Comprehensive mock API for development
- **Service Layer**: API abstraction ready for real backend integration

### 🚧 Coming Next (Phase 2)
- **Multi-Step Enrollment Flow**: 5-step process for new group enrollments
- **Program Catalog**: Browse available summer camp programs
- **Enrollment Management**: View, filter, and manage existing enrollments
- **Document Center**: Access to brochures, handbooks, and resources
- **Agency Profile**: Manage agency information and preferences

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 19 with functional components and hooks
- **Routing**: React Router DOM for client-side navigation
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state
- **Forms**: React Hook Form for form validation and handling
- **Icons**: Heroicons for consistent iconography
- **Date Handling**: date-fns for date formatting and manipulation

### Folder Structure
```
apps/bookings-portal/src/
├── components/           # Reusable UI components
│   └── layout/          # Layout components (Layout, AuthLayout)
├── pages/               # Page components
│   ├── auth/           # Authentication pages
│   └── enrollment/     # Enrollment flow pages
├── services/           # API service functions
├── store/              # Zustand stores
├── data/               # Mock data
│   └── mock/           # Mock JSON data files
├── utils/              # Utility functions
└── assets/             # Static assets
```

### Design System
- **Primary Color**: Blue (#3b82f6) - Professional and trustworthy
- **Secondary Color**: Green (#22c55e) - Success and positive actions
- **Accent Color**: Yellow (#eab308) - Warnings and highlights
- **Typography**: Inter font family for modern readability
- **Components**: Consistent button styles, cards, badges, and form elements

## 🎨 UI/UX Approach

### Design Philosophy
- **Professional & Modern**: Clean, business-appropriate design for education agencies
- **User-Centered**: Intuitive workflows optimized for common tasks
- **Accessibility**: WCAG compliant with proper contrast and keyboard navigation
- **Performance**: Optimized for fast loading and smooth interactions

### Key Components
- **Sidebar Navigation**: Fixed sidebar with collapsible mobile menu
- **Dashboard Cards**: Statistics and quick actions prominently displayed
- **Status Badges**: Color-coded status indicators for enrollments
- **Progress Indicators**: Step-by-step flow visualization
- **Responsive Tables**: Mobile-optimized data display

## 📊 Data Architecture

### Mock Data Structure
```javascript
// Camp Programs
{
  id: 'intensive-english-dublin',
  name: 'Intensive English Summer Camp',
  location: 'Dublin Campus',
  targetAge: '12-17 years',
  sessions: [...],
  features: [...]
}

// Enrollments
{
  id: 'ENR-2024-001',
  groupName: 'Madrid International School',
  programId: 'intensive-english-dublin',
  numberOfStudents: 15,
  status: 'confirmed',
  pricing: {...}
}
```

### Service Layer
All API calls are abstracted through service functions:
- `campService`: Program and accommodation data
- `enrollmentService`: Enrollment management
- `agencyService`: Agency profile management
- `authService`: Authentication handling

## 🔐 Authentication

### Demo Credentials
- **Email**: sarah.johnson@globaleducation.com
- **Password**: demo123

### Implementation
- Token-based authentication with localStorage
- Protected routes with automatic redirection
- Session persistence across browser refreshes
- Logout functionality with cleanup

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Navigate to the project
cd apps/bookings-portal

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔄 Development Workflow

### Adding New Features
1. Create components in appropriate directories
2. Add routes to `App.jsx`
3. Implement service functions for data fetching
4. Update Zustand stores for state management
5. Add mock data if needed

### API Integration
When ready to connect to a real backend:
1. Update service functions in `/services/`
2. Replace mock data with actual API endpoints
3. Update authentication flow
4. Handle error states and loading

### Styling Guidelines
- Use Tailwind utility classes
- Follow the established design system
- Create custom components for reusable styles
- Maintain responsive design principles

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 0-767px
- **Tablet**: 768px-1023px  
- **Desktop**: 1024px+

### Key Responsive Features
- Collapsible sidebar navigation
- Adaptive card layouts
- Mobile-optimized forms
- Touch-friendly interactions

## 🔧 State Management

### Zustand Stores
- **enrollmentStore**: Manages multi-step enrollment flow
- Persistent state across browser sessions
- Validation helpers for form steps
- Progress tracking utilities

### Local State
- Component-level state for UI interactions
- Form state managed by React Hook Form
- Loading and error states

## 📈 Performance Considerations

- Lazy loading for route components
- Optimized bundle size with tree shaking
- Efficient re-renders with proper state management
- Image optimization for program photos

## 🔮 Future Enhancements

### Phase 2 Features
- Real-time enrollment updates
- Payment processing integration
- Document upload functionality
- Email notifications
- Advanced filtering and search
- Export capabilities
- Multi-language support

### Technical Improvements
- Unit and integration tests
- E2E testing with Cypress
- Performance monitoring
- Error boundary implementation
- PWA capabilities

## 🤝 Contributing

1. Follow the established folder structure
2. Maintain consistent coding style
3. Add TypeScript for type safety (future)
4. Write tests for new features
5. Update documentation

## 📄 License

This project is proprietary and confidential.

---

**Built for MLI-OMS** - English Language Summer Camp Operations
