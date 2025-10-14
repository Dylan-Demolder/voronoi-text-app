# Voronoi Text App

Minimal React app that renders text as a Voronoi pattern using canvas and d3-delaunay.

Run locally:

```bash
# install
npm install

# dev server
npm run dev
```

Deploy to Vercel:

- This is a standard Vite React app. You can connect the repo to Vercel and it will detect the project.
- Build command: `npm run build`
- Output directory: `dist`

Auto-deploy from GitHub (recommended):

1. The repo includes a GitHub Actions workflow at `.github/workflows/vercel-deploy.yml` that builds the site and deploys to Vercel on pushes to `main`.
2. Add the following repository secrets in GitHub (Repository -> Settings -> Secrets -> Actions):
	- `VERCEL_TOKEN` - a Vercel Personal Token (see Vercel account settings -> Tokens).
	- `VERCEL_ORG_ID` - your Vercel Organization ID.
	- `VERCEL_PROJECT_ID` - the Vercel Project ID (create a project in Vercel and find the Project ID).
3. Push to `main` and the workflow will build and publish to Vercel. The action will post a comment on the PR with the deployment URL.

Notes:
- Try short text (like initials) or single words for denser shapes. Tweak the density slider.

