# GitHub Pages Setup Guide

## Current Status

The Seam Lattice Visualizer is configured to deploy to GitHub Pages, but Pages must be enabled in your repository settings.

## Steps to Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/MacMayo1993/Seam-Lattice`

2. Click on **Settings** (top navigation bar)

3. In the left sidebar, click on **Pages** (under "Code and automation")

4. Under **Build and deployment**:
   - **Source**: Select "GitHub Actions"
   - This allows the workflow in `.github/workflows/deploy.yml` to deploy your site

5. Click **Save**

6. The workflow will automatically run on the next push to `main` branch, or you can:
   - Go to **Actions** tab
   - Select the "Deploy to GitHub Pages" workflow
   - Click **Run workflow** to trigger it manually

## Expected GitHub Pages URL

After enabling, your site will be available at:
```
https://macmayo1993.github.io/Seam-Lattice/
```

## Verification

To verify the deployment is working:

1. Go to the **Actions** tab in your repository
2. Check that the "Deploy to GitHub Pages" workflow runs successfully
3. Visit the GitHub Pages URL above

## Current Configuration

- **Base Path**: `/Seam-Lattice/` (configured in `vite.config.ts`)
- **Build Output**: `dist/` directory
- **Deploy Trigger**: Pushes to `main` branch or manual workflow dispatch
- **Node Version**: 20

## Troubleshooting

If the deployment fails:

1. Check the Actions tab for error messages
2. Verify the workflow has proper permissions (already configured in `deploy.yml`)
3. Ensure the `main` branch exists and has the latest code
4. Check that the build completes successfully locally: `npm run build`
