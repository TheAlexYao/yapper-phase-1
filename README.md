# Yapper - Language Learning Application

## Project Overview

Yapper is an innovative language learning application that focuses on building conversation confidence through guided practice scenarios. The application helps users overcome the fear of speaking in another language by providing structured, real-world conversation practice.

## Key Features

- **Guided Conversation Scenarios**: Practice real-life situations like ordering coffee, meeting new friends, or traveling.
- **Multiple Language Support**: Learn various languages with native speaker audio and pronunciation feedback.
- **Progress Tracking**: Monitor your improvement across different conversation scenarios.
- **Personalized Learning**: Choose topics that match your interests and learning goals.
- **Instant Feedback**: Get real-time pronunciation and fluency feedback.

## Technical Stack

This project is built with modern web technologies:

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Backend**: Supabase
  - Authentication
  - PostgreSQL Database
  - Storage
  - Edge Functions
- **State Management**: React Query
- **Routing**: React Router
- **Voice Generation**: Azure Speech Services
- **AI Integration**: OpenAI for conversation generation

## Project Structure

- `/src/components/` - Reusable UI components
  - `/auth/` - Authentication related components
  - `/scenarios/` - Conversation scenario components
  - `/sections/` - Landing page sections
  - `/ui/` - Base UI components (shadcn)
- `/src/pages/` - Main application pages
- `/src/hooks/` - Custom React hooks
- `/src/types/` - TypeScript type definitions
- `/src/utils/` - Utility functions
- `/supabase/` - Supabase configuration and functions

## Getting Started

1. **Clone the Repository**
```sh
git clone <repository-url>
cd yapper
```

2. **Install Dependencies**
```sh
npm install
```

3. **Start Development Server**
```sh
npm run dev
```

## Environment Setup

The following environment variables are required:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `AZURE_SPEECH_KEY`: Azure Speech Services API key
- `AZURE_SPEECH_REGION`: Azure Speech Services region
- `OPENAI_API_KEY`: OpenAI API key for conversation generation

## Deployment

The application can be deployed through:

1. **Lovable Platform**
   - Visit [Lovable](https://lovable.dev/projects/422593ea-64c1-49cf-b1e1-9ce0d8792f86)
   - Click on Share -> Publish

2. **Custom Domain**
   - For custom domain deployment, we recommend using Netlify
   - Follow our [Custom Domain Guide](https://docs.lovable.dev/tips-tricks/custom-domain/)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is private and confidential. All rights reserved.

## Support

For support and questions:
- Visit our [Documentation](https://docs.lovable.dev/)
- Join our [Discord Community](https://discord.gg/lovable)
- Contact support at support@lovable.dev