## Project Structure

`server/` - Go server running on Fiber
`web/` - Next.js web app

## Rules for AI Agents

### Web

- Use shadcn/ui for components. Install with `bun shadcn-add <component>` script.
- Use zod for input validation.
- Use Link from next/link for navigation for app routes. For external links, use <a> tag.
- Use the `import 'server-only'` directive for any code that should ONLY run on the server. Use `use server` for any server side code that needs to be called from a server component or client component.
- Use Image from next/image for images.
- Prefer function over const for functions.
- Only major components should be default exported, other components should be exported as named exports.
- Break down UI elements into components and put them in the `components` directory.
- Use bun and bunx for package management in the Next.js app.
- Never start the dev server with `bun run dev` or any other command. The user already has a dev server running.
- Use the `fetcher` function in lib/utils.ts for all API requests.

### Server

- Strucutre routes in the server folder with route groups.
- Put all similar routes together in a file in the route group package.
- Refer the auth package to understand folder structure semantics.
