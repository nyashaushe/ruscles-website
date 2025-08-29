# Ruscle Investments

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nyashaushes-projects/v0-ruscle-investments)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/rDHZQPF49Vo)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/nyashaushes-projects/v0-ruscle-investments](https://vercel.com/nyashaushes-projects/v0-ruscle-investments)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/rDHZQPF49Vo](https://v0.dev/chat/projects/rDHZQPF49Vo)**

## Quick Start

### 1. Environment Setup

Copy the environment template and configure your variables:

```bash
cp .env.example .env.local
```

### 2. Database Setup

Set up your database and run migrations:

```bash
npm run db:setup
```

### 3. Authentication Configuration

Validate your authentication setup:

```bash
npm run auth:validate
```

### 4. Start Development

```bash
npm run dev
```

## Authentication

This application supports dual authentication methods:

- **Google OAuth**: Standard OAuth flow with Google
- **Email/Password**: Direct credential authentication for admin users

Both methods use the same admin email allowlist for access control.

### Configuration

Required environment variables:

```bash
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
ALLOWED_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

Optional (recommended for fallback):

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Validation

Run the authentication configuration validator:

```bash
npm run auth:validate
```

This checks:
- ✅ Required environment variables
- ✅ Email format validation
- ✅ Security best practices
- ✅ Production readiness

For detailed setup instructions, see [docs/AUTHENTICATION_SETUP.md](docs/AUTHENTICATION_SETUP.md).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:setup` - Set up database and run migrations
- `npm run auth:validate` - Validate authentication configuration
- `npm run test` - Run test suite
- `npm run test:coverage` - Run tests with coverage

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
