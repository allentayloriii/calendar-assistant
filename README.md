# AI-Powered Task Calendar

A modern task calendar application with natural language processing capabilities, built with React, Convex, and FullCalendar.

## Features

- **Natural Language Processing**: Create and query tasks using natural language commands
- **Interactive Calendar**: Full-featured calendar with month, week, and day views
- **Real-time Updates**: Live synchronization across all connected clients
- **User Authentication**: Secure login with Convex Auth
- **Smart Task Creation**: AI-powered parsing of dates, times, and durations
- **Advanced Search**: Text-based and date-range task searching
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS
- **Backend**: Convex (database, functions, real-time updates)
- **Calendar**: FullCalendar
- **AI/NLP**: OpenAI GPT-4.1-nano (built-in Convex integration)
- **Authentication**: Convex Auth
- **UI Components**: Custom components with Sonner for notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd task-calendar
```

2. Install dependencies:
```bash
npm install
```

3. Set up Convex:
```bash
npx convex dev
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Natural Language Commands

The AI assistant understands various natural language commands:

### Creating Tasks
- "Create a meeting tomorrow at 2pm"
- "Schedule dentist appointment next Friday at 10am for 1 hour"
- "Add workout session at 6am daily"
- "Book conference room for presentation on Monday at 3pm"

### Querying Tasks
- "Show me my tasks for today"
- "What do I have tomorrow morning?"
- "Find all meetings this week"
- "Search for dentist appointments"

### Supported Date/Time Formats
- Relative dates: "today", "tomorrow", "next Friday", "this week"
- Specific dates: "January 15th", "12/25/2024"
- Times: "2pm", "14:30", "9:00 AM"
- Durations: "for 1 hour", "30 minutes", "2h"

## Project Structure

```
src/
├── components/
│   ├── TaskCalendar.tsx              # Main calendar component
│   ├── EnhancedNaturalLanguageInput.tsx # AI-powered input
│   ├── CreateEventModal.tsx          # Event creation modal
│   ├── EventDetailsModal.tsx         # Event viewing/editing modal
│   └── QueryResults.tsx              # Search results display
├── App.tsx                           # Main app component
└── main.tsx                          # App entry point

convex/
├── events.ts                         # Event CRUD operations
├── nlp.ts                           # Natural language processing
├── schema.ts                        # Database schema
└── auth.ts                          # Authentication setup
```

## Database Schema

### Events Table
- `title`: string - Event title
- `start`: string - ISO datetime string
- `end`: string (optional) - ISO datetime string
- `description`: string (optional) - Event description
- `createdBy`: Id<"users"> (optional) - User who created the event
- `createdAt`: string - ISO datetime when created

## API Functions

### Queries
- `listEvents`: Get all events for the current user
- `queryEventsByText`: Search events by text
- `queryEventsByDateRange`: Get events for specific date ranges

### Mutations
- `createEvent`: Create a new event
- `updateEvent`: Update an existing event
- `deleteEvent`: Delete an event

### Actions
- `processNaturalLanguage`: Process natural language input with AI

## Environment Variables

The app uses Convex's built-in OpenAI integration, so no additional API keys are required for basic functionality.

For advanced features, you can set up:
- `OPENAI_API_KEY`: Your OpenAI API key (optional)
- `DIALOGFLOW_PROJECT_ID`: Google Dialogflow project ID (optional)
- `DIALOGFLOW_PRIVATE_KEY`: Dialogflow service account private key (optional)
- `DIALOGFLOW_CLIENT_EMAIL`: Dialogflow service account email (optional)

## Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to Convex:
```bash
npx convex deploy
```

3. Deploy the frontend to your preferred hosting service (Vercel, Netlify, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.
