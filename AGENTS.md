## Project Structure

`apps/server` - Hono + Bun server
`apps/web` - Next.js web app

## Rules for AI Agents

### Web

- Use shadcn/ui for components. Install with `bun shadcn-add <component>` script.
- Use Link from next/link for navigation for app routes. For external links, use <a> tag.
- For buttons that trigger routing, wrap them in a Link component and make the button a child of the Link component.
- Use the `import 'server-only'` directive for any code that should ONLY run on the server. Use `use server` for any server side code that needs to be called from a server component or client component.
- Use Image from next/image for images.
- Prefer function over const for functions.
- Only major components should be default exported, other components should be exported as named exports.
- Break down UI elements into components and put them in the `components` directory. Use ComponentName.tsx naming convention.
- Use bun and bunx for package management in the Next.js app.
- Never start the dev server with `bun run dev` or any other command. The user already has a dev server running.
- Use Tanstack Query and tRPC for data fetching and mutations. Use queryOptions and mutationOptions for this.

### Server

- Structure routes using route groups and put them in one file inside routes folder.
- Chat router is split into a queries and mutations router
- Chat queries go inside chat.queries.ts and chat mutations go inside chat.mutations.ts.
