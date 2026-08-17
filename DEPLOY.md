# Hosting this on Cloudflare

The repository is deploy-ready. `wrangler.toml` publishes `site/` as static
assets on a Worker named **`sabika-dhf-project`**, which serves:

| Path | What |
|---|---|
| `/deck/` | the 28-slide deck — scroll to advance, `E` to edit text |
| `/` | the long-form strategy page |

Verified locally against the real Workers runtime (`wrangler dev`): `/deck/`
returns all 28 slide frames, `/deck` 307-redirects to `/deck/`, assets and fonts
resolve. `wrangler deploy --dry-run` reads all 81 asset files and reports no
missing bindings, so the only thing standing between this repo and a live URL is
a credential — and that has to be created by whoever owns the Cloudflare account.

---

## Path A — Cloudflare builds it (no secret anywhere)

The closest thing to "hosted directly on Cloudflare": Cloudflare clones the repo
and deploys it itself, authenticated by your dashboard session. Nothing is
pasted into GitHub, and every later push redeploys.

Cloudflare dashboard → **Compute (Workers)** → **Create** → **Import a
repository** → authorise GitHub → pick `tirtham-spec/hopper-tessarakt`, then:

| Field | Value |
|---|---|
| Branch | `claude/honest-farms-ppt-design-l0mql0` |
| Project name | `sabika-dhf-project` |
| Build command | `npm ci --omit=dev` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |

`package-lock.json` is committed and `wrangler` is a runtime dependency, so
`npm ci --omit=dev` installs it and skips the Playwright QA tooling.

---

## Path B — GitHub Actions (one secret)

`.github/workflows/deploy.yml` already runs on every push to the deck branch and
on manual dispatch. It needs one repository secret:

1. Cloudflare dashboard → **My Profile → API Tokens → Create Token** → use the
   **Edit Cloudflare Workers** template → Create.
2. GitHub → repo **Settings → Secrets and variables → Actions → New repository
   secret** → name `CLOUDFLARE_API_TOKEN`, paste the value.
   Add `CLOUDFLARE_ACCOUNT_ID` too if that token spans several accounts.
3. Push anything, or re-run the workflow from the Actions tab.

Until the secret exists the workflow **skips the deploy and finishes green**,
with a note on the run summary saying why — so it stays quiet if Cloudflare is
already building the repo through its own Git integration, instead of filling
the Actions tab with red runs.

---

## Path C — one command, from your machine

```bash
git clone -b claude/honest-farms-ppt-design-l0mql0 \
  https://github.com/tirtham-spec/hopper-tessarakt
cd hopper-tessarakt
npx wrangler deploy          # prompts a browser login the first time
```

Wrangler 4.102+ also supports `npx wrangler deploy --temporary`, which deploys
with no login at all to a 60-minute preview account and prints a claim URL you
open to attach it to your own account.

---

## Why this could not be deployed from the Claude session

Not an authentication problem. The session's network egress policy rejects the
CONNECT to every Cloudflare host:

```
api.cloudflare.com:443     — gateway answered 403 to CONNECT (policy denial)
sparrow.cloudflare.com:443 — gateway answered 403 to CONNECT (policy denial)
dash.cloudflare.com:443    — gateway answered 403 to CONNECT (policy denial)
*.workers.dev:443          — gateway answered 403 to CONNECT (policy denial)
```

So a token would not have helped, and neither did the credential-free
`--temporary` flow: the socket never opens. Allowing Cloudflare hosts in the
environment's network policy would let a future session deploy directly —
see https://code.claude.com/docs/en/claude-code-on-the-web

## Result

```
https://sabika-dhf-project.<your-subdomain>.workers.dev/deck/
https://sabika-dhf-project.<your-subdomain>.workers.dev/
```
