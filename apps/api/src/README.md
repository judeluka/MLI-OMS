# API Refactored Structure

This directory contains the refactored Node.js Express API, organized into a modular and maintainable structure.

## Directory Structure

```
/apps/api/src/
├── server.js                 # Main entry point
├── config/
│   └── db.js                # Database configuration
├── routes/
│   ├── index.js             # Main router aggregator
│   ├── auth.routes.js       # Authentication routes
│   ├── groups.routes.js     # Group management routes
│   ├── programme.routes.js  # Programme slot routes
│   ├── activities.routes.js # Activity management routes
│   ├── flights.routes.js    # Flight management routes
│   ├── participants.routes.js # Participant management routes
│   ├── transfers.routes.js  # Transfer management routes
│   ├── agencies.routes.js   # Agency routes
│   ├── centres.routes.js    # Centre management routes
│   └── staff.routes.js      # Staff management routes
├── controllers/
│   ├── auth.controller.js   # Authentication request handlers
│   ├── groups.controller.js # Group request handlers
│   ├── programme.controller.js # Programme request handlers
│   ├── activities.controller.js # Activity request handlers
│   ├── flights.controller.js # Flight request handlers
│   ├── participants.controller.js # Participant request handlers
│   ├── transfers.controller.js # Transfer request handlers
│   ├── agencies.controller.js # Agency request handlers
│   ├── centres.controller.js # Centre request handlers
│   └── staff.controller.js  # Staff request handlers
├── services/
│   ├── auth.service.js      # Authentication business logic
│   ├── groups.service.js    # Group business logic
│   ├── programme.service.js # Programme business logic
│   ├── activities.service.js # Activity business logic
│   ├── flights.service.js   # Flight business logic
│   ├── participants.service.js # Participant business logic
│   ├── transfers.service.js # Transfer business logic
│   ├── agencies.service.js  # Agency business logic
│   ├── centres.service.js   # Centre business logic
│   └── staff.service.js     # Staff business logic
└── utils/
    └── helpers.js           # Utility functions
```

## Architecture Overview

### Layer Separation

1. **Routes Layer** (`/routes/`): Defines API endpoints and maps them to controller functions
2. **Controllers Layer** (`/controllers/`): Handles HTTP requests/responses, validation, and calls services
3. **Services Layer** (`/services/`): Contains business logic and database operations
4. **Utils Layer** (`/utils/`): Shared utility functions and helpers

### Key Features

- **Modular Structure**: Each feature (groups, activities, etc.) has its own route, controller, and service files
- **Separation of Concerns**: Clear separation between request handling, business logic, and data access
- **Centralized Configuration**: Database and other configurations are centralized in `/config/`
- **Reusable Utilities**: Common functions are extracted to `/utils/helpers.js`

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Environment variables configured (see `.env` file)

### Installation

1. Navigate to the API directory:
   ```bash
   cd apps/api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env file with:
   DATABASE_URL=your_postgresql_connection_string
   PORT=5000
   ```

4. Start the server:
   ```bash
   node src/server.js
   ```

## API Endpoints

### Authentication
- `POST /login` - User authentication

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create a new group
- `GET /api/groups/:groupId` - Get group by ID
- `PUT /api/groups/:groupId` - Update group
- `DELETE /api/groups/:groupId` - Delete group
- `POST /api/groups/import` - Import multiple groups
- `GET /api/groups/sales-grid-groups` - Get sales grid data
- `POST /api/groups/:groupId/flights` - Add flight to group
- `DELETE /api/groups/:groupId/flights/:flightId` - Remove flight from group
- `GET /api/groups/:groupId/participants` - Get group participants
- `GET /api/groups/:groupId/transfers` - Get group transfers
- `POST /api/groups/:groupId/transfers` - Assign transfer to group
- `PUT /api/groups/:groupId/transfers/:assignmentId` - Update transfer assignment
- `DELETE /api/groups/:groupId/transfers/:assignmentId` - Remove transfer from group

### Programme Management
- `POST /api/programme-slot` - Save/update programme slot
- `GET /api/groups/:groupId/programme` - Get group programme
- `GET /api/centres/:centreName/programme-slots` - Get centre programme slots

### Activities
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create activity
- `GET /api/activities/:activityId` - Get activity by ID
- `PUT /api/activities/:activityId` - Update activity
- `GET /api/activities/:activityId/participation` - Get activity participation

### Flights
- `GET /api/flights` - Get all flights
- `POST /api/flights` - Create flight
- `GET /api/flights/:flightId` - Get flight by ID
- `PUT /api/flights/:flightId` - Update flight
- `GET /api/flights/:flightId/groups` - Get flight groups

### Participants
- `GET /api/participants` - Get all participants
- `POST /api/participants` - Create participant
- `GET /api/participants/:id` - Get participant by ID
- `PUT /api/participants/:id` - Update participant
- `DELETE /api/participants/:id` - Delete participant

### Transfers
- `GET /api/transfers` - Get all transfers
- `POST /api/transfers` - Create transfer
- `GET /api/transfers/transport-transfers` - Get transport transfers
- `GET /api/transfers/:id` - Get transfer by ID
- `PUT /api/transfers/:id` - Update transfer
- `DELETE /api/transfers/:id` - Delete transfer

### Agencies
- `GET /api/agencies` - Get all agencies

### Centres
- `GET /api/centres` - Get all centres
- `POST /api/centres` - Create centre
- `GET /api/centres/occupancy` - Get centre occupancy data
- `PUT /api/centres/:id` - Update centre
- `DELETE /api/centres/:id` - Delete centre

### Staff
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create staff
- `GET /api/staff/accommodation-assignments` - Get accommodation assignments
- `GET /api/staff/:id` - Get staff by ID
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff
- `GET /api/staff/:id/accommodation-assignments` - Get staff accommodation assignments
- `GET /api/staff/:id/work-assignments` - Get staff work assignments
- `GET /api/staff/:id/documents` - Get staff documents
- `POST /api/staff/:id/work-assignments` - Create work assignment
- `POST /api/staff/:id/accommodation-assignments` - Create accommodation assignment

## Development Guidelines

### Adding New Features

1. **Create Route File**: Add new route file in `/routes/` directory
2. **Create Controller**: Add controller file in `/controllers/` directory
3. **Create Service**: Add service file in `/services/` directory
4. **Update Main Router**: Import and use the new route in `/routes/index.js`

### Code Structure

- **Controllers** should be thin and only handle request/response logic
- **Services** should contain all business logic and database operations
- **Routes** should only define endpoints and map to controllers
- Use consistent error handling and response formats
- Follow the existing naming conventions

### Database Operations

- Always use connection pooling via the `pool` from `/config/db.js`
- Properly release database connections in `finally` blocks
- Use parameterized queries to prevent SQL injection
- Handle database errors appropriately

## Migration from Original server.js

The original monolithic `server.js` file has been refactored as follows:

1. **Server Setup**: Moved to `/src/server.js` (entry point)
2. **Database Config**: Extracted to `/src/config/db.js`
3. **Route Handlers**: Split into feature-specific controllers
4. **Business Logic**: Extracted to service layer
5. **Utilities**: Moved to `/src/utils/helpers.js`

### Benefits of Refactoring

- **Improved Maintainability**: Code is organized by feature and responsibility
- **Better Testability**: Each layer can be tested independently
- **Enhanced Scalability**: Easy to add new features without affecting existing code
- **Team Collaboration**: Multiple developers can work on different features simultaneously
- **Code Reusability**: Services and utilities can be reused across different controllers

## Notes

- Some service implementations are placeholders and need to be completed based on your specific database schema
- Error handling can be enhanced with custom middleware
- Consider adding input validation middleware (e.g., using Joi or express-validator)
- Add logging middleware for better debugging and monitoring
- Consider implementing authentication middleware for protected routes 