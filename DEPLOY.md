# Deploy to Vercel

## Quick Deploy (No Installation Required)

**First, login to Vercel:**

```bash
npx vercel login
```

This will open your browser to authenticate. After logging in, you can deploy:

```bash
npx vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (for first deployment)
- Project name? (Press Enter for default)
- Directory? (Press Enter for current directory)
- Override settings? **No** (uses vercel.json)

For production deployment:
```bash
npx vercel --prod
```

## Alternative: Install Vercel CLI

If you prefer to install globally:

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

## GitHub Integration (Recommended)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect settings from `vercel.json`
6. Click "Deploy"

## Verify Build Locally First

Before deploying, test the build:

```bash
npm run build
npm run preview
```

This ensures everything works before deploying to Vercel.

