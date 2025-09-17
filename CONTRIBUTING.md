Contributing to msgpack.org
==========================

Thank you for helping maintain the msgpack.org website. This document explains how to build, run, test and deploy the site as it exists after migration to a TypeScript/npm toolchain.

Prerequisites
-------------
- Node.js 18.x and npm (or use the included devcontainer)
- A GitHub account if you will open pull requests or create a personal access token

Quick start (local)
-------------------
1. Install dependencies

   npm i

2. Generate site content (this fetches GitHub repositories and compiles pages into `dist/`)

   npm run generate

   Notes:
   - The generator uses the GitHub search API. For a higher API rate limit, set a personal access token (PAT) in the environment variable `GITHUB_TOKEN` before running the generator. Example (Linux/macOS/WLS):

     export GITHUB_TOKEN=ghp_your_token_here

   - If you are developing in WSL, make sure `node` and `npm` are the Linux binaries (not the Windows-installed Node). If you hit `ts-node: Permission denied` or other install issues, remove and reinstall node_modules inside WSL:

     rm -rf node_modules package-lock.json
     npm ci

3. Preview static output

   The generator writes HTML to `dist/`. To preview the site quickly you can use a simple static file server:

   npx http-server dist -p 8080

   or open `dist/index.html` in your browser.

4. Run the update server (developer convenience)

   The repo includes a small express server that exposes `/update`. It will run the generator when you visit the endpoint and return textual logs.

   npm run start
   # then visit http://localhost:8580/update

Development (fast iteration)
----------------------------
- For iterative development of the generator itself use the `dev` script which runs the TypeScript server with automatic restart on changes:

  npm run dev

- If TypeScript complains about missing typing packages, run:

  npm ci

  or add the appropriate `@types/*` package and re-run `npm ci`.

Devcontainer
------------
- This repository includes a `.devcontainer` configuration. Open the repository in VS Code and choose "Reopen in Container" (requires the Remote - Containers extension). The devcontainer image contains Node 18 and runs `npm ci` on creation.

Authentication and rate limits
------------------------------
- The generator queries the GitHub Search API. Unauthenticated requests are severely rate-limited (60 requests per hour). Set `GITHUB_TOKEN` to a PAT to raise limits to the authenticated quota.
- Minimal PAT scopes required:
  - For read-only site generation against public repositories you can create a token with no scopes or the `public_repo` scope.
  - If you want the generator or workflows to push generated files back to a repository, the token needs `repo` (or the repo-level `contents: write` in fine-grained tokens) or you can rely on GitHub Actions' built-in `GITHUB_TOKEN` for workflow-run pushes.

  To export the token for local runs (temporary, current shell):

    export GITHUB_TOKEN=ghp_your_token_here

  To persist: add to your `~/.profile` or `~/.bashrc`, or configure your devcontainer to forward the host variable.

CI / Deployment
----------------
- A GitHub Actions workflow (`.github/workflows/build-and-deploy.yml`) is configured to run the generator on push to `master` and publish the `dist/` directory to GitHub Pages. The workflow uses the repository `GITHUB_TOKEN` secret provided automatically by Actions.
- If you need the CI workflow to push to a different branch or change site configuration, edit the workflow and open a PR. The standard review process applies.

Testing and debugging
---------------------
- If the generator fails with `ts-node: Permission denied`, remove `node_modules` and re-run `npm ci` inside the environment (WSL or devcontainer) so executable bits are set correctly.
- If you hit TypeScript errors complaining about missing declaration files, either install the appropriate `@types/*` package or add a small declaration file under `src/` (the repo already contains `src/types.d.ts` to help in this migration).
- If you see rate-limit errors from GitHub, set `GITHUB_TOKEN` and re-run.

Code style and pull requests
---------------------------
- Create a feature branch per logical change: `git checkout -b fix/short-description`.
- Keep changes small and focused. Add tests/documentation for larger changes.
- Open a pull request against `master`. Add a short description of the change and link any relevant issues.

Archiving the old Ruby toolchain
--------------------------------
- The repository still contains the original Ruby scripts and Gemfile for reference. Once the TypeScript generator is stable you can either remove or move the Ruby files to an `archive/` folder; discuss that change in a dedicated PR.

Questions or help
-----------------
If anything in this guide is unclear or fails on your machine, paste the terminal output here and mention the platform (Linux, WSL, macOS, Windows) and I’ll iterate on fixes.
