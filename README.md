# Vite Vanilla JS Template

## Setup

1. Clone repository using this command: `git clone https://github.com/nikitor141/vite-vanilla-js-template.git`
2. Rename the folder of project
3. Install dependencies: `pnpm install`
4. Remove the .git directory, README.md file and run `git init` to clean the commit history.
5. Run the development server: `pnpm dev`

## Build

- Build the project: `pnpm build`
- Preview the build: `pnpm preview`

## Branches

- ### main
  - Uses:
    - prettier
    - eslint (js, html)
- ### next-gen
  - Uses:
    - biome - formatting .js files (linter is off)
    - prettier - for all other files
    - oxlint - .js

- ### now
  - Uses:
    - oxlint - .ts,.js
    - oxfmt - .ts,.js,.html,.scss,.css
