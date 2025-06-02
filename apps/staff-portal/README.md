# Staff Onboarding Portal

A comprehensive React-based staff onboarding portal for Irish Summer Adventures, designed to streamline the onboarding process for new team members joining our English language tour operator specializing in summer camps.

## 🎯 Project Vision

The staff-onboarding-portal serves as the primary digital touchpoint for new hires, providing a welcoming, efficient, and clear onboarding experience. It ensures new staff can easily provide necessary information, access important documents like contracts, and understand initial company policies.

## ✨ Features

### Core Functionality

- **Secure Authentication**: Login system with session management
- **Progressive Onboarding**: Step-by-step guided onboarding process
- **Real-time Progress Tracking**: Visual progress indicators and completion status
- **Responsive Design**: Fully responsive for desktop, tablet, and mobile devices
- **Professional UI**: Clean, modern interface using Material-UI components

### Onboarding Steps

1. **Personal Profile Completion**
   - Personal information collection
   - Emergency contact details
   - Bank details for payroll (securely handled)

2. **Contract Review & Digital Signing**
   - Personalized employment contract display
   - Digital signature functionality
   - Terms and conditions acknowledgment

3. **Document Upload** (Coming Soon)
   - Passport/ID copy upload
   - Proof of address
   - Right to work documentation

4. **Company Policies Review** (Coming Soon)
   - Code of conduct
   - Data protection policy
   - Health & safety guidelines
   - IT usage policy
   - Employee handbook

5. **Role & Team Information** (Coming Soon)
   - Role-specific information
   - Team introductions
   - Initial responsibilities

## 🛠 Technology Stack

- **Frontend Framework**: React 19.1.0 with Vite
- **UI Library**: Material-UI (MUI) 6.1.8
- **Routing**: React Router DOM 6.28.0
- **Form Management**: React Hook Form 7.53.2
- **Validation**: Yup 1.4.0
- **State Management**: React Context API with useReducer
- **Styling**: Emotion (CSS-in-JS)
- **File Upload**: React Dropzone 14.2.9

## 📁 Project Structure

```
apps/staff-portal/src/
├── components/          # Reusable UI components
│   ├── common/         # Common components
│   ├── forms/          # Form-specific components
│   ├── layout/         # Layout components
│   ├── navigation/     # Navigation components
│   └── onboarding/     # Onboarding-specific components
├── contexts/           # React Context providers
│   └── AuthContext.jsx # Authentication state management
├── data/               # Mock data and constants
│   └── mock/           # Mock data for development
│       ├── users.js    # User data and credentials
│       ├── onboarding.js # Onboarding steps and policies
│       └── contracts.js # Contract templates
├── hooks/              # Custom React hooks
├── layouts/            # Page layout components
│   └── MainLayout.jsx  # Main application layout
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   ├── onboarding/     # Onboarding step pages
│   ├── profile/        # User profile pages
│   └── resources/      # Resource pages
├── services/           # API service functions
│   ├── authService.js  # Authentication services
│   └── onboardingService.js # Onboarding services
└── utils/              # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the staff portal directory:
   ```bash
   cd apps/staff-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Credentials

For testing purposes, use these demo credentials:

**New Staff Member (In Progress):**
- Email: `sarah.johnson@summercamp.ie`
- Password: `welcome123`

**Completed Staff Member:**
- Email: `james.murphy@summercamp.ie`
- Password: `welcome123`

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Mock Data System

The application uses a comprehensive mock data system to simulate API responses:

- **User Management**: Mock user profiles with different onboarding states
- **Session Simulation**: localStorage-based session management
- **Progress Tracking**: Simulated step completion and validation
- **Contract Personalization**: Dynamic contract content with user data

### Form Validation

All forms use React Hook Form with Yup validation schemas:

- **Real-time Validation**: Immediate feedback on form errors
- **Accessibility**: Proper error messaging and ARIA attributes
- **User Experience**: Clear validation messages and visual indicators

## 🎨 Design System

### Theme Configuration

The application uses a custom Material-UI theme with:

- **Primary Color**: #1976d2 (Professional blue)
- **Typography**: Roboto font family with consistent weight hierarchy
- **Spacing**: 8px base unit for consistent spacing
- **Border Radius**: 8px default for modern appearance

### Component Standards

- **Consistent Styling**: All components follow the established design system
- **Accessibility**: WCAG 2.1 AA compliance considerations
- **Responsive Design**: Mobile-first approach with breakpoint considerations
- **Loading States**: Proper loading indicators and skeleton screens

## 🔐 Security Considerations

### Current Implementation (Mock Data)

- Session management via localStorage
- Client-side form validation
- Mock authentication flow

### Future Backend Integration

When connecting to a real backend, implement:

- **Data Encryption**: Encrypt sensitive personal and financial data
- **GDPR Compliance**: Proper data handling for Irish/EU regulations
- **Secure Authentication**: JWT tokens with proper expiration
- **Input Sanitization**: Server-side validation and sanitization
- **File Upload Security**: Virus scanning and file type validation
- **Audit Logging**: Track all onboarding activities

## 🔄 API Integration Ready

The service layer is designed for easy backend integration:

### Service Functions

All API calls are abstracted through service functions:

```javascript
// Example service function structure
export const onboardingService = {
  async getOnboardingStatus(userId) {
    // Currently returns mock data
    // Replace with actual API call
    return await apiClient.get(`/onboarding/${userId}/status`);
  }
};
```

### Migration Path

1. Replace mock data imports with API endpoints
2. Update service functions to use actual HTTP clients
3. Implement proper error handling and retry logic
4. Add authentication headers and CSRF protection

## 📱 Responsive Design

The portal is fully responsive with breakpoints:

- **Mobile**: < 600px
- **Tablet**: 600px - 960px
- **Desktop**: > 960px

Key responsive features:
- Collapsible navigation on mobile
- Adaptive form layouts
- Touch-friendly interface elements
- Optimized content hierarchy

## 🧪 Testing Strategy

### Recommended Testing Approach

1. **Unit Tests**: Component testing with React Testing Library
2. **Integration Tests**: User flow testing with Cypress
3. **Accessibility Tests**: Automated a11y testing
4. **Performance Tests**: Lighthouse audits
5. **Cross-browser Testing**: Chrome, Firefox, Safari, Edge

## 🚀 Deployment

### Build Process

```bash
npm run build
```

Creates optimized production build in `dist/` directory.

### Environment Configuration

For production deployment, configure:

- API endpoints
- Authentication providers
- File upload services
- Error tracking (e.g., Sentry)
- Analytics (e.g., Google Analytics)

## 🤝 Contributing

### Development Guidelines

1. Follow the established folder structure
2. Use TypeScript for new components (when migrating)
3. Implement proper error boundaries
4. Add loading states for async operations
5. Follow accessibility best practices
6. Write comprehensive tests

### Code Style

- Use functional components with hooks
- Implement proper prop validation
- Follow Material-UI theming patterns
- Use semantic HTML elements
- Implement proper ARIA attributes

## 📞 Support

For questions or issues:

- **Development Team**: Contact the development team
- **HR Support**: hr@summercamp.ie
- **Technical Issues**: +353 1 234 5678

## 📄 License

This project is proprietary to Irish Summer Adventures Ltd.

---

**Built with ❤️ for Irish Summer Adventures team members**
