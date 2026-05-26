# Deploying to Cloudflare Pages

The app is a pure-static SvelteKit build (`@sveltejs/adapter-static`, every route prerendered). Cloudflare Pages serves the `build/` directory directly — no Workers, no SSR.

## One-time setup (CF dashboard)

1. **Cloudflare → Workers & Pages → Create → Pages → Connect to Git**
2. Authorize Cloudflare's GitHub app on `jedbjorn/md-converter` (the repo is public, so the GitHub app only needs read access)
3. **Production branch:** `main`
4. **Build settings:**
   - **Framework preset:** `SvelteKit (static)` (auto-fills the values below)
   - **Build command:** `npm run build`
   - **Build output directory:** `build`
   - **Root directory:** _(leave blank)_
   - **Environment variables:** none
5. Save and deploy. First build takes a couple of minutes; subsequent builds ~30–60s.

## Custom domain

After the first deploy lands at `<project>.pages.dev`:

1. **Project → Custom domains → Set up a custom domain**
2. Enter `md-converter.designs-os.com`
3. Cloudflare auto-creates a CNAME in the `designs-os.com` zone (which is in the same account, since `emergence.designs-os.com` is already on it) and issues an SSL cert. No manual DNS work.

## Node version

`.nvmrc` pins Node `22` so CF's build environment matches local. Bump it there when you bump local.

## What ships per push

Every push to `main` triggers a new build. PR pushes get a preview URL too (`<branch>.<project>.pages.dev`) — handy for reviewing visual changes before merge.

## Rolling back

CF Pages keeps every deployment. **Project → Deployments → ⋯ → Rollback** swaps the production domain to any previous build instantly. No rebuild needed.

## Verifying a deploy

After a build completes:
- Open `https://md-converter.designs-os.com/`
- Open the sidebar (top-right "Style" button)
- Try Upload markdown with `docs/themed-examples/converter-spec.md`
- Switch through all 5 themes
- Export HTML — confirm the downloaded file opens standalone

## Cost

Cloudflare Pages free tier: 500 builds/month, unlimited bandwidth, unlimited requests. This app fits well under that for normal use.
