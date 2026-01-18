# GitHub Pages Troubleshooting Guide

## Issue: Getting 403 Forbidden Error

If you're seeing a **403 Forbidden** error when accessing `https://macmayo1993.github.io/Seam-Lattice/`, this means GitHub Pages is not properly configured. Follow these steps:

### Step 1: Enable GitHub Pages (CRITICAL)

1. Go to: https://github.com/MacMayo1993/Seam-Lattice/settings/pages
2. Under **"Build and deployment"** section:
   - Find the **"Source"** dropdown
   - Select **"GitHub Actions"** (NOT "Deploy from a branch")
3. Click **Save** if there's a save button
4. You should see a message indicating Pages is being built from GitHub Actions

**Why this matters:** Even though the workflow runs successfully, GitHub won't serve the site unless Pages is enabled with the correct source.

### Step 2: Verify the Workflow Ran

1. Go to: https://github.com/MacMayo1993/Seam-Lattice/actions
2. Look for the latest "Deploy to GitHub Pages" workflow
3. Verify both jobs completed:
   - ✅ build
   - ✅ deploy
4. If the workflow hasn't run, trigger it manually:
   - Click on "Deploy to GitHub Pages" workflow
   - Click "Run workflow" button
   - Select "main" branch
   - Click "Run workflow"

### Step 3: Check Deployment Status

1. Go to: https://github.com/MacMayo1993/Seam-Lattice/deployments
2. You should see a "github-pages" deployment
3. Status should be "Active"
4. Click on it to see the deployment URL

### Step 4: Wait for Deployment

- After enabling Pages or running the workflow, wait 1-2 minutes
- GitHub Pages can take time to propagate
- Clear your browser cache if needed (Ctrl+Shift+R or Cmd+Shift+R)

### Step 5: Verify the URL

Your site should be accessible at:
```
https://macmayo1993.github.io/Seam-Lattice/
```

**Note the trailing slash!** The base path is configured as `/Seam-Lattice/` in vite.config.ts

## Common Issues and Solutions

### Issue: 404 Not Found
- **Cause:** Wrong source selected in Pages settings
- **Solution:** Ensure "GitHub Actions" is selected, NOT "Deploy from a branch"

### Issue: Blank page or assets not loading
- **Cause:** Missing .nojekyll file (now fixed)
- **Solution:** Rebuild and redeploy (already done in latest commit)

### Issue: Workflow succeeds but site doesn't update
- **Cause:** Browser cache
- **Solution:** Hard refresh (Ctrl+Shift+R) or clear cache

### Issue: Cannot access /settings/pages
- **Cause:** Not repository owner/admin
- **Solution:** Ask repository owner to enable Pages

## Verification Checklist

- [ ] Repository Settings > Pages > Source is set to "GitHub Actions"
- [ ] Latest workflow run shows both build and deploy jobs succeeded
- [ ] Deployment shows as "Active" in deployments page
- [ ] Can access https://macmayo1993.github.io/Seam-Lattice/
- [ ] No 403 or 404 errors

## Technical Details

### What's in the build:
- ✅ `.nojekyll` file (prevents Jekyll processing)
- ✅ `404.html` (for SPA routing)
- ✅ Correct base path: `/Seam-Lattice/`
- ✅ All assets properly referenced

### Workflow permissions:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

These are correctly configured for Pages deployment.

## Still Not Working?

If you've followed all steps and it's still not working:

1. Check if the repository is public (it should be)
2. Verify you have admin access to the repository
3. Check GitHub Status: https://www.githubstatus.com/
4. Try disabling and re-enabling Pages
5. Contact GitHub Support if the issue persists

## Testing Locally

To verify the build works correctly:

```bash
npm run build
npm run preview
```

This serves the production build locally at http://localhost:4173/Seam-Lattice/
