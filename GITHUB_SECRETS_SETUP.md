# 🔐 GitHub Secrets Setup Guide

The CI/CD pipeline requires certain secrets to be configured in your GitHub repository. This guide shows you how to set them up.

## Overview of Required Secrets

| Secret | Purpose | Required | Where to Get |
|--------|---------|----------|--------------|
| `DOCKER_USERNAME` | Docker Hub account username | ✅ For Docker builds | [Docker Hub Account](https://hub.docker.com) |
| `DOCKER_PASSWORD` | Docker Hub access token | ✅ For Docker builds | Docker Hub Settings → Security |
| `SNYK_TOKEN` | Snyk security scanning token | ❌ Optional | [Snyk Dashboard](https://app.snyk.io) |

## Step-by-Step Setup

### 1. Go to Repository Settings

1. Navigate to your GitHub repository: `https://github.com/th3on7in3gam3r/biblefunland-vite`
2. Click the **Settings** tab (top right)
3. In the left sidebar, click **Secrets and variables** → **Actions**

### 2. Add Docker Hub Credentials

#### Get Docker Username & Token

1. Visit [Docker Hub](https://hub.docker.com)
2. Sign in to your account
3. Click your profile icon (top right) → **Account Settings**
4. In the left sidebar, click **Security**
5. Click **New Access Token**
6. Name it: `biblefunland-github-actions`
7. Select scope: **Read, Write & Delete**
8. Click **Generate**
9. Copy the token (you won't see it again!)

#### Add to GitHub

**For `DOCKER_USERNAME`:**
1. Click **New repository secret** (green button)
2. Name: `DOCKER_USERNAME`
3. Value: Your Docker Hub username
4. Click **Add secret**

**For `DOCKER_PASSWORD`:**
1. Click **New repository secret**
2. Name: `DOCKER_PASSWORD`
3. Value: The access token you generated (NOT your Docker password)
4. Click **Add secret**

### 3. (Optional) Add Snyk Token

Only needed if you want Snyk security scanning. If you skip this, npm audit will still run.

1. Visit [Snyk Dashboard](https://app.snyk.io) (create account if needed)
2. Click your profile icon → **Account Settings**
3. Click **Auth Token**
4. Click **Click to show** and copy the token
5. In GitHub Secrets:
   - Name: `SNYK_TOKEN`
   - Value: Your Snyk token
   - Click **Add secret**

## Verification

After adding secrets, verify they're recognized:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see your secrets listed (values are hidden):
   - ✅ `DOCKER_USERNAME`
   - ✅ `DOCKER_PASSWORD`
   - ⭕ `SNYK_TOKEN` (if added)

## How They're Used

### DOCKER_USERNAME & DOCKER_PASSWORD
- Used in the **Docker Build** job (runs on main branch only)
- Logs into Docker Hub to push your containers
- Without these, Docker job will fail (but other jobs still pass)

### SNYK_TOKEN
- Used in the **Security Scan** job
- Runs Snyk vulnerability scan on dependencies
- This job has `continue-on-error: true`, so workflow succeeds even if Snyk fails

## What Happens Without Secrets

If you don't set up Docker credentials:
- ✅ **Lint** job: Still runs, no secrets needed
- ✅ **Test** job: Still runs, no secrets needed
- ✅ **Build** job: Still runs, no secrets needed
- ❌ **Docker** job: Skips or fails (won't push to Docker Hub)
- ✅ **Security** job: Runs npm audit without Snyk
- ✅ **Notify** job: Still runs

**Recommended:** Set up Docker secrets if you plan to deploy via Docker.

## Security Best Practices

1. **Use Access Tokens, Not Passwords**
   - Docker: Use access token from Security settings, not your password
   - Snyk: Use auth token from account settings

2. **Rotate Periodically**
   - Every 90 days, regenerate your tokens
   - Delete old tokens after rotation

3. **Review Permissions**
   - Docker token should have Read, Write & Delete only
   - Don't give excessive permissions

4. **Don't Commit Secrets**
   - Never paste secrets into code or docs
   - GitHub Secrets are encrypted and hidden from logs

## Troubleshooting

### "Context access might be invalid" Warning in VS Code
This is just a linter warning - it's normal! The secrets are properly configured.

### Docker Job Fails with "Unable to authenticate"
1. Verify `DOCKER_USERNAME` is correct (exactly as in Docker Hub)
2. Verify `DOCKER_PASSWORD` is an **access token**, not your password
3. Check that token hasn't expired in Docker Hub

### Snyk Job Fails
- This is non-blocking (continues workflow)
- Either get SNYK_TOKEN or remove Snyk step if not needed

## Need Help?

- **Docker Hub Access Token**: https://docs.docker.com/docker-hub/access-tokens/
- **Snyk Auth Token**: https://docs.snyk.io/getting-started/authentication-for-api
- **GitHub Secrets Docs**: https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions

## Next Steps

1. Set up Docker credentials (recommended)
2. Optionally set up Snyk token
3. Push a commit to `main` or `develop` branch
4. Watch the **Actions** tab to see your pipeline run
5. Check the logs to verify everything works

---

**Note:** You can view pipeline runs at: `https://github.com/th3on7in3gam3r/biblefunland-vite/actions`
