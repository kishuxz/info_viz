# 100% Free Deployment Guide

## 🎉 Host Everything for Free!

This guide will help you deploy your entire stack at **zero cost**:
- ✅ **Frontend** (React) → Netlify (Free forever)
- ✅ **Backend** (Node.js) → Render.com (Free tier)
- ✅ **Database** (MongoDB) → MongoDB Atlas (Free tier)

---

## 📋 Overview

| Service | What It Hosts | Free Tier Limits |
|---------|---------------|------------------|
| **Netlify** | React frontend | 100GB bandwidth/month, unlimited sites |
| **Render** | Node.js backend | 750 hours/month (enough for one app), 512MB RAM |
| **MongoDB Atlas** | MongoDB database | 512MB storage, shared cluster |

**Total Cost: $0/month** 🎉

---

## 🚀 Step-by-Step Deployment

### Part 1: Deploy Database (MongoDB Atlas) - 5 minutes

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for free

2. **Create Free Cluster**
   - Click "Build a Database"
   - Choose **FREE** (M0) tier
   - Select a cloud provider (AWS recommended)
   - Choose a region close to you
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Create Database User**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Username: `adminuser` (or your choice)
   - Password: Generate a strong password (save it!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Allow Network Access**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
   - ⚠️ This allows connections from Render (necessary for free tier)

5. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string:
     ```
     mongodb+srv://adminuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - **Save this!** You'll need it for Render

---

### Part 2: Deploy Backend (Render.com) - 10 minutes

1. **Push Backend Code to GitHub**
   ```bash
   # From your project root
   git add .
   git commit -m "Prepare backend for deployment"
   git push origin main
   ```

2. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub (easier)

3. **Create New Web Service**
   - Dashboard → "New +" → "Web Service"
   - Click "Connect a repository"
   - Find and select your repository
   - Click "Connect"

4. **Configure Web Service**
   Fill in these settings:

   **Basic Settings:**
   - **Name**: `your-app-backend` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend` ⚠️ Important!
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

   **Instance Type:**
   - Select **Free** (important!)

5. **Add Environment Variables**
   Click "Advanced" → Add these variables:

   | KEY | VALUE |
   |-----|-------|
   | `MONGO_URI` | Your MongoDB connection string from Part 1 |
   | `JWT_SECRET` | Any random string (e.g., `mySuper$ecretKey123!`) |
   | `JWT_EXPIRE` | `15m` |
   | `JWT_REFRESH_EXPIRE` | `7d` |
   | `SESSION_TIMEOUT` | `1800000` |
   | `NODE_ENV` | `production` |

6. **Deploy!**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - You'll get a URL like: `https://your-app-backend.onrender.com`
   - **Save this URL!** You'll need it for Netlify

⚠️ **Important Note about Render Free Tier:**
- Free tier spins down after 15 minutes of inactivity
- First request after inactivity takes 30-60 seconds (cold start)
- This is normal and expected for free tier

---

### Part 3: Deploy Frontend (Netlify) - 5 minutes

1. **Push Frontend Code to GitHub**
   ```bash
   # If not already pushed
   git add .
   git commit -m "Add learning hub and netlify config"
   git push origin main
   ```

2. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub (easier)

3. **Import Project**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Select your repository
   - Netlify auto-detects React settings ✓

4. **Configure Build Settings** (Should auto-fill, verify these)
   - **Base directory**: (leave blank)
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

5. **Deploy!**
   - Click "Deploy site"
   - Wait 2-3 minutes
   - You'll get a random URL like: `https://random-name-123.netlify.app`

6. **Add Environment Variable** ⚠️ **Critical!**
   - Go to "Site configuration" → "Environment variables"
   - Click "Add a variable" → "Add a single variable"
   - **Key**: `REACT_APP_API_URL`
   - **Value**: Your Render backend URL (from Part 2)
     - Example: `https://your-app-backend.onrender.com`
   - Click "Create variable"

7. **Redeploy with Environment Variable**
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"
   - Wait 2-3 minutes

8. **Custom Domain (Optional)**
   - Go to "Site configuration" → "Domain management"
   - Click "Add custom domain"
   - Choose a better name: `your-app-name.netlify.app`
   - Free SSL certificate included!

---

### Part 4: Update Backend CORS ⚠️ Important!

Your backend needs to allow requests from your Netlify frontend.

1. **Get Your Netlify Domain**
   - From Netlify dashboard, copy your site URL
   - Example: `https://your-app-name.netlify.app`

2. **Update Backend CORS**
   - Open `backend/server.js`
   - Find the CORS configuration
   - Add your Netlify domain:

   ```javascript
   const corsOptions = {
     origin: [
       'http://localhost:3000', // Development
       'https://your-app-name.netlify.app'  // Production - ADD THIS
     ],
     credentials: true
   };
   
   app.use(cors(corsOptions));
   ```

3. **Push and Redeploy**
   ```bash
   git add backend/server.js
   git commit -m "Update CORS for production"
   git push origin main
   ```
   - Render will automatically redeploy (takes 5-10 minutes)

---

## ✅ Verification Checklist

Test your deployment:

- [ ] Visit your Netlify site URL
- [ ] Homepage loads correctly
- [ ] Navigate to `/learn/getting-started` - learning hub works
- [ ] Click "Learn" dropdown in navbar
- [ ] Try to login/signup (tests backend connection)
- [ ] Check browser console for errors

---

## � Troubleshooting

### "Cannot connect to backend" / API errors

**Solution:**
1. Check `REACT_APP_API_URL` is set in Netlify (step 3.6)
2. Verify it matches your Render URL exactly
3. Make sure you redeployed after setting the variable
4. Check Render logs: Dashboard → Your service → Logs

### "CORS error" in browser console

**Solution:**
1. Verify you updated `backend/server.js` with Netlify URL (Part 4)
2. Make sure it includes `https://` (not `http://`)
3. Check Render deployed the new code (check logs)

### "Backend is slow to respond"

**Reason:** Render free tier spins down after 15 minutes of inactivity.

**Solution:**
- Normal behavior for free tier
- First request takes 30-60 seconds
- Consider paid tier ($7/month) if you need instant responses

### MongoDB connection fails

**Solution:**
1. Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
2. Verify connection string in Render has correct password
3. Check MongoDB cluster is running (green status)

---

## 🎯 Your Live URLs

After deployment, you'll have:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `https://your-app.netlify.app` | Main website (share this!) |
| **Backend** | `https://your-backend.onrender.com` | API (for internal use) |
| **Database** | `cluster0.xxxxx.mongodb.net` | MongoDB (internal) |

**Share the Netlify URL with users!** 🎉

---

## 💡 Pro Tips

### Keep Your Free Tier Active

**Render Backend:**
- Spins down after 15 minutes of no requests
- To keep it "warm": Use a free service like [cron-job.org](https://cron-job.org) to ping your backend every 14 minutes
  - URL to ping: `https://your-backend.onrender.com/api/health`

### Monitor Your Services

**Netlify:**
- Dashboard → Analytics: See visitor stats
- Dashboard → Deploys: See build history

**Render:**
- Dashboard → Logs: See backend activity
- Dashboard → Metrics: Monitor RAM/CPU usage

**MongoDB Atlas:**
- Clusters → Metrics: See database usage
- Set up alerts for approaching limits

### Automatic Deployments

Both Netlify and Render watch your GitHub repo:
- Push to `main` branch → Automatic deployment
- Pull request → Preview deployment (Netlify)
- No manual deployment needed!

---

## 🚨 Free Tier Limits to Watch

| Service | Limit | What Happens |
|---------|-------|--------------|
| **Netlify** | 100GB bandwidth/month | Site goes offline until next month |
| **Render** | 750 hours/month | One app = 744 hours (fits perfectly) |
| **MongoDB Atlas** | 512MB storage | Database becomes read-only |

For a small-to-medium event website, you'll likely never hit these limits.

---

## � When to Upgrade

Consider paid tiers if:
- **Netlify**: Exceed 100GB bandwidth (unlikely for learning hub)
- **Render**: Need instant response times (no cold starts) - $7/month
- **MongoDB**: Need more than 512MB storage - $9/month

But start with free tier and upgrade only if needed!

---

## 🎉 You're Live!

Congratulations! Your full-stack network mapping platform is now live and free to use.

**Next Steps:**
1. Share your Netlify URL with potential users
2. Test the complete flow (signup → create form → collect data → export)
3. Monitor usage in service dashboards
4. Consider custom domain (Netlify supports custom domains for free)

**Questions?**
- Netlify Docs: [docs.netlify.com](https://docs.netlify.com)
- Render Docs: [render.com/docs](https://render.com/docs)
- MongoDB Atlas Docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

Happy deploying! 🚀
