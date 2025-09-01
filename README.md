# Echo Messenger

A real-time messaging app inspired by WhatsApp featuring direct messages (for now). Built with Next.js 15 App Router, Bun + Hono server, and Socket.IO.

## Features

- Real-time 1:1 chat utilizing WebSockets via Socket.IO (new chats and messages broadcast instantly to relevant clients)
- Email/Password and Username auth (Better Auth) with sign up, sign in, sign out, and delete account
- Type-safe end-to-end API with tRPC, using TanStack Query to call queries and mutations from the frontend
- Full messenger like interface with search, chats list, and messages
- Fully responsive and mobile friendly UI using shadcn/ui components and Tailwind v4

## Tech Stack

### Backend

- [Hono](https://hono.dev) - Fast, lightweight, and flexible server framework for any JS runtime
- [Bun](https://bun.sh) - Fast, modern JavaScript runtime
- [tRPC](https://trpc.io) - Type-safe RPC framework
- [Socket.IO](https://socket.io) - Bi-directional web socket and communication library
- [Drizzle ORM](https://orm.drizzle.team) - Type-safe database ORM
- [PostgreSQL](https://www.postgresql.org) - Powerful, open-source relational database
- [Better Auth](https://better-auth.com) - Modern authentication and authorization library
- [Zod](https://zod.dev) - Type-safe data validation

### Frontend

- [Next.js 15 App Router](https://nextjs.org) - Full stack React framework
- [React 19](https://react.dev) - Latest React
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview) - Client side data fetching and caching library
- [shadcn/ui](https://ui.shadcn.com) - Composable UI component library based on Radix UI
- [Tailwind CSS v4](https://tailwindcss.com) - Utility-first inline CSS framework
- [React Hook Form](https://react-hook-form.com) - Form library
- [Lucide React](https://lucide.dev) - Icon library

### Extras

- [Bun](https://bun.sh) - Also used as the package manager
- [Turborepo](https://turbo.build) - Build system for monorepos
- [Husky](https://typicode.github.io/husky/) - Git hooks for linting and formatting
- [Prettier](https://prettier.io) - Code formatter

## Project Structure

```
echo-messenger/
├── apps/
│ ├── server/    # Hono server running on Bun
│ ├── web/       # Next.js frontend app
├── packages/
│ ├── shared/    # Shared websocket types
```

## Getting Started

### Prerequisites

[Bun](https://bun.sh) is strongly recommended, but you could use any other package manager and switch the Hono server to use any runtime of your choice as specified in the [docs](https://hono.dev/docs/getting-started/basic).

### Installation

1. Clone the repo

```
git clone https://github.com/anmhrk/echo-messenger.git
cd echo-messenger
```

2. Install dependencies

```
bun install
```

3. Set environment variables

```
bun run env # this will move the .env.example files to .env in both apps for you to fill out
```

4. Start the development servers

```
bun run dev
```

5. The servers will be running on the following ports:

- Server: `http://localhost:3001`
- Web: `http://localhost:3000`

## Deployment

This project is deployed on Railway. Steps to do the same:

1. Create a PostgreSQL service and connect it to the server service.

2. Create a Server service with the following settings:
   - Custom build command: `bunx turbo build -F server`
   - Custom start command: `cd apps/server && bun run start`

3. Create a Web service with the following settings:
   - Custom build command: `npx turbo build -F web`
   - Custom start command: `cd apps/web && npm run start`

The root `nixpacks.toml` file is configured to enable both the Bun and Node.js images. Bun will be used to install dependencies in both services.
