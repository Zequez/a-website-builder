# A Web-based Website Building Platform

This is an experiment to test the following hypothesis:

- I can commit to a long-term creative project and enjoy building it
- I can actually use it to offer websites to people IRL
- I can use to teach people how to make websites, use the system as a sandbox
- This keeps coming up as something that I feel enthusiastic about, I might be happy if I make progress on it

## Vision

- Gotta be web-based to be accessible
- Gotta be mobile usable
- Websites should be functional, useful as gameworld boards, installable on phones as PWA
- Should adjust to different levels of competence in programming; and switch between different editing modes
- Anyone should be able to deploy the system anywhere and have their own multi-tenant website builder they can maintain for people
- It should be able to limit access on a pay-as-much-as-you-want model, like a club membership

## Development

Install

```
git clone https://github.com/Zequez/a-website-builder
cd a-website-builder
pnpm i
```

Run dev servers:

```
pnpm dev:all
```

- Vercel Dev Server: For the serverless functions. You can test the multi-domains capabilities here. (localhost:3000)
- Vite Dev Server: For the app. This is what th system serves at the top level domain. (localhost:3000)
