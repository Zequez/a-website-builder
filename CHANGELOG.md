# v0.1.0: The Basic Web Builder Update
- You can create an account
- You can create sites
- You can change site files
- Sites and files are backed to the server
- Sites are published on a subdomain

# v0.2.0: Build System Update

- Build system
  - Sidebar has divisions now, functionals are: Pages, Components and Data
  - Every page and component is treated as a Preact JSX document
  - Data files are YML
  - On pages you can return a mix of paths and JSX elements, and it will generate multiple pages
  - Every data file is avaiable on the "data" object
  - Every component file is available by just using it's name
  - There is a built in default component named Html that takes a title, class, children, and icon
  - UnoCSS build in support with the default preset which looks like Tailwind; also adds the Tailwind CSS reset to the style bundle.
- Code editor uses Codemirror now
- You can add a favicon to the site with Emojis; adding a `<link rel="icon" type="image/emoji" href="🔅" />`. The Html component uses this as default. The emoji is rendered on Canvas and encoded as B64.
- Build indicator and build errors bar
- Files aren't saved on every keystroke (although they are stored locally if you reload the page); you can Cmd+S to save all files and trigger a new build
- Many improvements on the data synchronization system
- Many bugfixes; too many to count
