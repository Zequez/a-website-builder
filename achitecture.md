# System Architecture

## Server

At `/server`

### Main Tech stack

- Express
- Postgres

### Core Static Assets

Core pages are built with Vite. Any request that matches one of these are directly served as static pages by Vercel without going through the server.

### Members Sites Pages

Currently the pre-rendered pages are stored on Postgres on the `prerendered` table with a `path` and `content`. The pages are stored as the whole HTML document.

The configured domains are hardcoded into the repo at the `/server/domains.ts` file.

Using the request hostname it separates the domain and subdomain, and finds a the proper site from the `tsites` table.

Then it loads the proper prerendered page using the path and serves it directly, replacing the static assets imports with the latest version generated during the core build.

The pre-rendering is currently done browser-side upon client deployment and the prerendered page sent to the server. The reasoning behind this is to allow users to deploy completely custom pages. However, newer design decision deprecated this idea, so in the future the pre-rendering will be done server-side and static pages cached as static files instead.

### API

API routes are under the `_API_` path.
An Express server with a single endpoint called pipe.

Most complexity from web apps come from the data translation from frontend-backend
In order to simplify this, instead of relying on the traditional HTTP headers and paths
the backend consists of a single endpoint called `pipe/<functionName>`.

- Every request is a POST request.
- Every method that starts with $ on the `server/api/functions.ts` Functions class is callable
- Every method takes a typed parameter read from the request body as JSON
- Through static code generation all the functions, their parameter types and return types get a helper function to be used by the frontend at `app/src/lib/pipes.ts` using a pipe wrapper
- To make authenticaiton explicit, if a function requires authentication it might make a "token" part if it's parameters and use private Function methods to handle them
- The pipe wrapper helper returns a promise with the return type from the Function method
- Dates from the server are converted to Date on the frontend automatically if the attribute ends with "_at"
- Server, bad requests or authentication errors fail the promise so may be handled with a try/catch block. Other expected application such as validations error types are made explicit by adding "errors" on the return object.

## Database

Using Postgres, no ORM is used. SQL queries are just build with some helpers.

### Migrations

There is a simple migration system in place.

- db:migrations:add <migration_name>: Creates a new migration file at `/server/db/migrations`
- db:migrations:run:dev <number>: Runs a number of migrations (can be negative to roll back). There is a migration  table that tracks the DB migration version.
- db:migrations:run:prod <number>: Same as dev. Production migrations are run when neccesary manually from my local computer.

### Schema types

Using `pg-to-ts` a `schema.ts` file is generated with all the typed DB tables. The file is comitted into the repo. Runs with the codegen script.

## Scripts

At `/scripts`

- codegen: Handles the codegen for config schema, DB typings and API helpers
- migrate: Handles the DB migration system

## Frontend

At `/app`

### Main Tech stack

- Vite
- Preact
- UnoCSS

### Entrypoints

- index.html: The public sites are rendered using this
- editor.html: This renders a site with a wrapper that adds the editor
- admin.html: This renders the admin panel

Each loads their own main-*.tsx to allow for code sharding.

### Stores

- useStore: This is the editor store
- useAdminStore: This is the store used by the admin panel
- usePageContentEditorStore: This is the store used by the content editor inside the app

Work is pending on separating the editor store from the public app store for better code sharding. Most functionalities from the editor store are not used by the public app (the final rendered sites), so this optimization should lower the bundle size for everyone.

### Config Schema

Every site is configured with a Config. The type is defined as a JSON schema at `/app/src/schemas/config.yml`. Sub-schemas are also defined on the same directory. Through codegen a single index.ts is generated that exports the schema ready to be used by both frontend and backend.

Validation of the site config is done using AJV.

## Vercel related

A single index.js file on the /api folder that boots the Express server

No middleware neccesary at the moment, anything that is not catch by rendered static files is either an API call or an Hoja site.

From the Vercel stack these are used

- Vercel Postgres
- Vercel Storage

The runtime is Vercel node. The build uses tsc to compile the server to plain JS node which is loaded by the Vercel API as a single serverless function.