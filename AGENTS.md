## Project Structure

`apps/server` - Hono + Bun server
`apps/web` - Tanstack Start app

## Rules for AI Agents

### Web

- Use shadcn/ui for components.
- Use Link from @tanstack/react-router for navigation for app routes. For external links, use <a> tag.
- Prefer function over const for functions.
- Only major components should be default exported, other components should be exported as named exports.
- Break down UI elements into components and put them in the `components` directory. Use ComponentName.tsx naming convention.
- Never start the dev server. The user already has a dev server running.
- Use Tanstack Query and tRPC for data fetching and mutations. Use queryOptions and mutationOptions for this.

### Server

- Structure routes using route groups and put them in one file inside routes folder.
- Chat router is split into a queries and mutations router
- Chat queries go inside chat.queries.ts and chat mutations go inside chat.mutations.ts.
