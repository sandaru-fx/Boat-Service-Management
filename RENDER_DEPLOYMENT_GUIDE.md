# 🚀 Render Deployment Guide

## Prerequisites
1. GitHub repository: `https://github.com/bigunhe/boat-service-management.git`
2. MongoDB Atlas account (free)
3. Stripe account (for payments)
4. Gmail account (for email notifications)

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create new cluster (free tier)
4. Create database user
5. Get connection string
6. Whitelist IP addresses (0.0.0.0/0 for Render)

## Step 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Select repository: `boat-service-management`
5. Configure:
   - **Name**: `boat-service-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: `Free`

## Step 3: Environment Variables (Backend)

Set these in Render dashboard:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/boat_service_management_test
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://boat-service-frontend.onrender.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@boatservice.com
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_CURRENCY=lkr
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret
```

## Step 4: Deploy Frontend to Render

1. In Render dashboard, click "New +" → "Static Site"
2. Connect GitHub repository
3. Configure:
   - **Name**: `boat-service-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Plan**: `Free`

## Step 5: Environment Variables (Frontend)

Set these in Render dashboard:

```env
REACT_APP_API_URL=https://boat-service-backend.onrender.com/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
REACT_APP_NAME=Boat Service Management
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=production
```

## Step 6: Update Frontend API URLs

The frontend will automatically use the production API URL from environment variables.

## Step 7: Test Deployment

1. Backend: `https://boat-service-backend.onrender.com/api/health`
2. Frontend: `https://boat-service-frontend.onrender.com`

## Step 8: Custom Domain (Optional)

1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add your domain
4. Update DNS records

## Troubleshooting

### Common Issues:
1. **Build fails**: Check build logs in Render dashboard
2. **CORS errors**: Verify FRONTEND_URL is correct
3. **Database connection**: Check MongoDB Atlas connection string
4. **Environment variables**: Ensure all required vars are set

### Logs:
- View logs in Render dashboard
- Check both build and runtime logs

## Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelist configured
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Render
- [ ] Environment variables set
- [ ] Stripe keys configured
- [ ] Email settings configured
- [ ] Health check passing
- [ ] Frontend loads correctly
- [ ] Authentication working
- [ ] Payments working

## Support

- Render Documentation: https://render.com/docs
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com
- Stripe Documentation: https://stripe.com/docs
