# Time Capsule

A dream journaling app that captures your dreams through voice or text, then uses AI to transform them into beautifully structured, poetic narratives.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Anonymous Auth
- **Voice**: Web Speech API (browser-native speech recognition)
- **AI Processing**: Supabase Edge Functions + MIMO API (OpenAI-compatible)
- **Realtime**: Supabase Realtime subscriptions
- **Deployment**: Vercel

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/muzaibawakened/Time-Capsule.git
cd Time-Capsule
npm install
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the database migration:
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents of `supabase/migrations/001_create_dreams_table.sql`
   - Run the migration

### 3. Environment Variables

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Edge Function Setup (AI Processing)

The `process-dream` Edge Function requires MIMO API credentials. Set them as Supabase Edge Function secrets:

```bash
supabase secrets set MIMO_API_KEY=your-mimo-api-key
supabase secrets set MIMO_BASE_URL=https://api.mimo.com/v1
supabase secrets set MIMO_MODEL=mimo-default
```

Then deploy the Edge Function:

```bash
supabase functions deploy process-dream
```

### 5. Database Webhook

Create a webhook in Supabase Dashboard:
- Go to Database → Webhooks
- Create a webhook targeting the `dreams` table
- Events: INSERT
- Method: POST
- URL: `https://your-project-ref.functions.supabase.co/process-dream`
- Headers: `Authorization: Bearer your-supabase-service-role-key`

### 6. Run Locally

```bash
npm run dev
```

### 7. Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Set environment variables in Vercel Dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Features

- 🎙️ **Voice Recording**: Speak your dreams using browser-native speech recognition
- ✍️ **Text Input**: Type your dreams directly
- 🤖 **AI Processing**: Dreams are processed by AI to generate poetic titles, structured narratives, moods, and thematic tags
- 🔒 **Private Vault**: Each device gets its own anonymous vault
- ✨ **Realtime Updates**: AI-processed dream updates appear instantly
- 📱 **Responsive**: Works on mobile and desktop
- 🎨 **Dark Aesthetic**: Immersive dark UI with violet/gold accents

## Project Structure

```
├── public/
├── src/
│   ├── components/
│   │   ├── DreamCard.jsx          # Dream card in vault grid
│   │   ├── DreamDetail.jsx        # Full dream view
│   │   ├── DreamPreview.jsx       # Preview before saving
│   │   ├── EmptyState.jsx         # Empty vault illustration
│   │   ├── Header.jsx             # App header/navigation
│   │   ├── MoodBadge.jsx          # Mood indicator badge
│   │   ├── OrnamentalDivider.jsx  # Decorative dividers
│   │   ├── Particles.jsx          # Background particle effects
│   │   ├── RecordScreen.jsx       # Main recording interface
│   │   ├── TextInput.jsx          # Text input component
│   │   └── VoiceRecorder.jsx      # Voice recording with Web Speech API
│   ├── hooks/
│   │   └── useDreams.js           # Supabase CRUD + Realtime hook
│   ├── lib/
│   │   ├── speechRecognition.js   # Web Speech API wrapper
│   │   └── supabase.js            # Supabase client
│   ├── App.jsx                    # Main app with routing
│   ├── data.js                    # Mock data & constants
│   ├── index.css                  # Global styles
│   └── main.jsx                   # Entry point
├── supabase/
│   ├── functions/
│   │   └── process-dream/
│   │       └── index.ts           # AI processing Edge Function
│   └── migrations/
│       └── 001_create_dreams_table.sql
├── .env.local                     # Environment variables
├── index.html
├── package.json
├── tailwind.config.ts
└── vite.config.ts
```

## Tech Stack

- React 19
- Vite
- Tailwind CSS v4
- Framer Motion
- Supabase (Database, Auth, Edge Functions, Realtime)
- MIMO API (OpenAI-compatible LLM)
- Web Speech API
- Lucide React Icons

## License

