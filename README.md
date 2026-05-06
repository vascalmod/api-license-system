# API License System

A production-ready monetized API license system with React + Vite + Tailwind CSS frontend, Vercel Serverless Functions backend, and Supabase PostgreSQL database.

## Features

- **Token-based license generation** with 8-hour expiration
- **Monetization integration** with PopAds and Linkvertise
- **CAPTCHA verification** before key generation
- **Rate limiting** and abuse prevention
- **Renewal loop** for recurring ad impressions
- **Supabase Row Level Security** (RLS) for data protection

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Monetization**: PopAds + Linkvertise

## Quick Start

### 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Run the SQL schema from `supabase-schema.sql` in the SQL Editor
3. Get your project URL and service role key from Project Settings > API

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `SUPABASE_ANON_KEY` - Your Supabase anon key (for client-side, if needed)

### 3. Install Dependencies

```bash
npm install
```

### 4. Development

```bash
npm run dev
```

### 5. Deploy to Vercel

```bash
vercel deploy
```

Make sure to add environment variables in Vercel dashboard.

## Database Schema

### redeem_tokens
- `token` - Unique token string
- `used` - Boolean flag
- `ip_address` - User's IP
- `created_at` - Creation timestamp
- `expires_at` - Token expiration (24h default)

### licenses
- `id` - UUID primary key
- `api_key` - Unique API key
- `token` - Foreign key to redeem_tokens
- `ip_address` - User's IP
- `created_at` - Creation timestamp
- `expires_at` - License expiration (8h from creation)
- `status` - active | expired | revoked
- `request_count` - API request counter

### usage_logs (optional)
- `id` - UUID primary key
- `api_key` - Foreign key to licenses
- `endpoint_used` - API endpoint
- `timestamp` - Request timestamp
- `ip_address` - Request IP

## API Endpoints

### POST /api/validate-token
Validates a redeem token.
```json
{
  "token": "your_token_here"
}
```

### POST /api/generate-key
Generates an API key after CAPTCHA verification.
```json
{
  "token": "your_token_here",
  "captcha_verified": true
}
```

### GET /api/check-key?api_key=xxx
Checks API key validity and returns status.

## Monetization Setup

### PopAds Integration

Replace the placeholder ad divs in frontend pages with actual PopAds code:

1. Sign up at https://popads.net
2. Get your publisher ID
3. Replace ad placeholders in:
   - `src/pages/RedeemPage.jsx`
   - `src/pages/ResultPage.jsx`
   - `src/pages/Dashboard.jsx`

### Linkvertise Integration

Use Linkvertise to generate protected links:

```
https://domain.com/redeem?token=UNIQUE_TOKEN
```

Tokens should be generated and stored in Supabase `redeem_tokens` table.

## Security Features

- **Rate limiting**: 3 requests per 15 minutes per IP
- **CAPTCHA requirement**: Before key generation
- **Single-use tokens**: Tokens are marked as used after redemption
- **IP-based restrictions**: Prevents multiple active keys per IP
- **Row Level Security**: Supabase RLS policies restrict direct table access
- **Auto-expiration**: Licenses automatically expire after 8 hours

## License Renewal Loop

1. User generates key → Sees ads on landing page
2. Key expires after 8 hours
3. User returns to landing page → Sees ads again
4. New key generated → Cycle repeats

This creates recurring ad impressions and revenue.

## Usage Example

```bash
# User visits with token
https://yourdomain.com/redeem?token=abc123

# After generation, use API key
curl -H "X-API-Key: ak_your_key_here" https://your-api.com/endpoint
```

## Project Structure

```
/
├── api/                    # Vercel serverless functions
│   ├── validate-token.js
│   ├── generate-key.js
│   └── check-key.js
├── src/
│   ├── pages/             # React pages
│   │   ├── RedeemPage.jsx
│   │   ├── ResultPage.jsx
│   │   └── Dashboard.jsx
│   ├── components/        # Reusable components
│   ├── App.jsx
│   └── main.jsx
├── supabase-schema.sql    # Database schema
├── vercel.json           # Vercel config
└── package.json
```
