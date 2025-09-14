# Calendar Assistant

An AI-powered calendar and task manager with natural language input, built using React, Convex, and FullCalendar. Easily create, search, and manage events and tasks with conversational commands. All users are signed in anonymously—no authentication or login required. The app loads directly to the calendar for every user.

## Features

- **Conversational AI**: Add, search, and manage tasks/events using natural language ("Show me my meetings next week", "Schedule a call tomorrow at 2pm")
- **FullCalendar Integration**: Modern calendar UI with multi-month, month, week, and day views
- **Real-Time Sync**: All changes update instantly for all users
- **Anonymous Access**: No login or signup—every user is anonymous
- **Smart Event Creation**: AI parses dates, times, durations, and descriptions
- **Advanced Search**: Filter by text, date, or time range
- **Responsive UI**: Optimized for desktop and mobile
- **Conversation History**: See your recent AI interactions and queries

## Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS
- **Backend**: Convex (database, functions, real-time updates)
- **Calendar**: FullCalendar
- **AI/NLP**: OpenAI GPT-4.1-nano (Convex integration)
- **UI**: Custom React components, Sonner for notifications

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd calendar-assistant
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Convex (local dev):

   ```bash
   npx convex dev
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

The app will be available at [http://localhost:5173](http://localhost:5173). All users are anonymous and taken directly to the calendar page.

## Natural Language Examples

You can interact with the calendar using natural language. Examples:

### Create Events

- "Create a meeting tomorrow at 2pm"
- "Schedule dentist appointment next Friday at 10am for 1 hour"
- "Add workout session at 6am daily"
- "Book conference room for presentation on Monday at 3pm"

### Query Events

- "Show me my tasks for today"
- "What do I have tomorrow morning?"
- "Find all meetings this week"
- "Search for dentist appointments"

### Supported Date/Time Formats

- Relative: today, tomorrow, next Friday, this week
- Specific: January 15th, 12/25/2024
- Times: 2pm, 14:30, 9:00 AM
- Durations: for 1 hour, 30 minutes, 2h

## Project Structure

```
src/
├── components/
│   ├── TaskCalendar.tsx              # Main calendar & logic
│   ├── UserNLPInput.tsx              # AI-powered input
│   ├── CreateEventModal.tsx          # Event creation modal
│   ├── EventDetailsModal.tsx         # Event details/edit modal
│   ├── QueryResults.tsx              # Search results display
│   └── ConversationHistory.tsx       # Recent AI interactions
├── App.tsx                           # Main app component
└── main.tsx                          # App entry point

convex/
├── events.ts                         # Event CRUD operations
├── nlp.ts                            # Natural language processing
├── schema.ts                         # Database schema
├── auth.ts                           # (Legacy) Authentication setup — not used, all users are anonymous
└── ...
```

## Database Schema

### Events

- `title`: string — Event title
- `start`: string — ISO datetime
- `end`: string (optional) — ISO datetime
- `description`: string (optional)
- `createdBy`: Id<"users"> (optional)
- `createdAt`: string — ISO datetime

## API Functions

### Queries

- `listEvents`: Get all events for the current user
- `queryEventsByText`: Search events by text
- `queryEventsByDateRange`: Get events for specific date ranges

### Mutations

- `createEvent`: Create a new event
- `updateEvent`: Update an event
- `deleteEvent`: Delete an event

### Actions

- `processNaturalLanguage`: Process natural language input with AI

## Environment Variables

Convex's built-in OpenAI integration works out of the box. For advanced features:

- `OPENAI_API_KEY`: Your OpenAI API key (optional)
- `DIALOGFLOW_PROJECT_ID`: Google Dialogflow project ID (optional)
- `DIALOGFLOW_PRIVATE_KEY`: Dialogflow service account private key (optional)
- `DIALOGFLOW_CLIENT_EMAIL`: Dialogflow service account email (optional)

No authentication environment variables are required. All users are anonymous.

## Deployment

1. Build the project:

   ```bash
   npm run build
   ```

2. Deploy backend to Convex:

   ```bash
   npx convex deploy
   ```

3. Deploy frontend to your preferred hosting (Vercel, Netlify, etc.)

No authentication setup required for deployment.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT — see LICENSE for details.

## Support

For issues or questions, open a GitHub issue or contact the maintainers.
