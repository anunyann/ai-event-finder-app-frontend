# AI Event Finder

A modern React application for discovering and managing events through intelligent AI conversations. Built with React, TypeScript, and Tailwind CSS with a beautiful glassmorphism design.

## Features

- 🤖 **AI-Powered Chat**: Natural language event discovery and search
- 📅 **Event Management**: Create, view, and manage events with rich details
- 👥 **Participant Management**: Add and remove event participants
- 🎨 **Beautiful UI**: Glassmorphism design with smooth animations
- 🌓 **Dark/Light Mode**: Seamless theme switching
- 📱 **Responsive Design**: Works perfectly on all devices
- 🔐 **Authentication**: Secure JWT-based login and registration

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Animations**: Framer Motion (micro-interactions)
- **Date Handling**: date-fns
- **State Management**: React hooks (lightweight approach)
- **HTTP Client**: Native fetch with custom wrapper

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Flask API backend running (see backend setup below)

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Flask API URL:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:8080`

## Backend API Integration

This frontend connects to a Flask API backend. The API should provide the following endpoints:

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /users` - Register new user

### Chat & AI
- `GET /app/prompt?prompt=<query>` - AI-powered event search

### Events
- `GET /events` - List all events
- `POST /events` - Create new event
- `GET /events/title/:title` - Get event by title
- `GET /events/location/:location` - Get events by location
- `GET /events/category/:category` - Get events by category
- `GET /events/organizer/:email` - Get events by organizer
- `GET /events/date/:YYYY-MM-DD` - Get events by date

### Participants
- `GET /app/:eventTitle/participants` - List event participants
- `POST /app/:eventTitle/participants/:userEmail` - Add participant
- `DELETE /app/:eventTitle/participants/:userEmail` - Remove participant

All protected endpoints require `Authorization: Bearer <token>` header.

## Project Structure

```
src/
├── components/           # React components
│   ├── Chat/            # Chat interface components
│   ├── Events/          # Event management components
│   ├── Participants/    # Participant management
│   └── UI/              # Shared UI components
├── hooks/               # Custom React hooks
├── pages/               # Page components (routes)
├── lib/                 # Utility functions
├── types.ts             # TypeScript type definitions
└── api.ts               # API client with error handling
```

## Key Features

### Chat Interface
- Natural language event queries
- Real-time AI responses
- Event result cards with quick actions
- Message history with recent prompts

### Event Management
- Create events with rich form validation
- Filter and search events by multiple criteria
- Responsive card-based event display
- Participant management for each event

### Design System
- Glassmorphism cards with backdrop blur
- Indigo/Fuchsia gradient color scheme
- Smooth micro-interactions
- Consistent spacing and typography

## API Error Handling

The application includes robust error handling:
- JWT expiration detection and auto-logout
- Form validation with server error mapping
- Toast notifications for user feedback
- Network error recovery

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

- `VITE_API_BASE_URL` - Flask API base URL (required)

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

3. **Configure environment variables** on your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.