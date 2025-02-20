# AI-Powered Travel Companion Platform

An intelligent travel platform that provides adaptive travel insights through an interactive web application.

## Features

- Mistral AI-powered intelligent responses
- Interactive map integration with OpenStreetMap and Leaflet
- Dynamic AI-powered travel recommendations
- Language translation services
- Real-time weather information
- Cultural insights and local information

## Tech Stack

- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL with Drizzle ORM
- AI: Mistral AI and OpenAI
- Maps: Leaflet with OpenStreetMap
- Styling: Tailwind CSS with shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (optional, can use in-memory storage)
- API keys for:
  - Mistral AI
  - OpenAI (for translations)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/guest498/travel-planner.git
cd travel-planner
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
MISTRAL_API_KEY=your_mistral_api_key
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_database_url (optional)
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Development

- Frontend code is in the `client/` directory
- Backend code is in the `server/` directory
- Shared types and schemas are in the `shared/` directory

## License

MIT
