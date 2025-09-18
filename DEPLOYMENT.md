# Production Deployment Guide

## Quick Start

1. **Build for production:**
   ```bash
   ./build-production.sh
   ```

2. **Configure environment variables:**
   - Edit `backend/.env.production` with your actual values
   - Update JWT_SECRET, MONGODB_URI, and ALLOWED_ORIGINS

3. **Deploy:**
   ```bash
   # For Vercel
   vercel --prod
   
   # For other platforms, follow their specific instructions
   ```

## Detailed Instructions

### 1. Environment Variables Setup

Create or update `backend/.env.production`:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-jwt-secret-key-here-minimum-32-characters
MONGODB_URI=mongodb://localhost:27017/potrosnja-smole-prod
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/potrosnja-smole-prod
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Important:** 
- Generate a strong JWT_SECRET (minimum 32 characters)
- Use your actual production domain in ALLOWED_ORIGINS
- Ensure MongoDB URI is accessible from your hosting platform

### 2. Build Process

The build process compiles both frontend and backend:

```bash
# Install all dependencies
npm run install-all

# Build backend (TypeScript to JavaScript)
cd backend && npm run build

# Build frontend (React to static files)
cd frontend && npm run build
```

### 3. Deployment Options

#### Option A: Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login and deploy:
   ```bash
   vercel login
   vercel --prod
   ```

3. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add environment variables from `.env.production`

#### Option B: Other Platforms

**Heroku:**
```bash
# Install Heroku CLI, then:
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set ALLOWED_ORIGINS=https://your-app-name.herokuapp.com
git push heroku main
```

**DigitalOcean/Railway/Render:**
- Follow their specific deployment guides
- Set environment variables in their dashboards
- Ensure they support Node.js applications

### 4. Database Setup

#### MongoDB Atlas (Recommended for production)

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Create database user with read/write permissions
4. Whitelist your hosting platform's IP addresses
5. Get connection string and update `MONGODB_URI`

#### Self-hosted MongoDB

1. Install MongoDB on your server
2. Configure authentication and network access
3. Update `MONGODB_URI` with your server details

### 5. Domain Configuration

1. **Custom Domain:**
   - Point your domain to your hosting platform
   - Update `ALLOWED_ORIGINS` with your domain
   - Configure SSL certificate (usually automatic)

2. **Subdomain:**
   - Create subdomain (e.g., app.yourdomain.com)
   - Update DNS records
   - Update `ALLOWED_ORIGINS`

### 6. Security Checklist

- [ ] Strong JWT_SECRET (32+ characters)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Database access restricted
- [ ] Environment variables secured
- [ ] Regular backups scheduled

### 7. Monitoring and Maintenance

- Set up error monitoring (Sentry, LogRocket)
- Monitor database performance
- Regular security updates
- Backup verification

### 8. Troubleshooting

#### Common Issues:

**CORS Errors:**
- Check `ALLOWED_ORIGINS` includes your domain
- Verify frontend is making requests to correct URL

**Authentication Issues:**
- Ensure JWT_SECRET is same across deployments
- Check token expiration settings

**Database Connection:**
- Verify MongoDB URI is correct
- Check network access and authentication

**Build Failures:**
- Ensure all dependencies are installed
- Check TypeScript compilation errors
- Verify environment variables are set

### 9. Production URLs

After deployment, your application will be available at:
- Frontend: `https://yourdomain.com`
- API: `https://yourdomain.com/api/`

### 10. Performance Optimization

- Enable gzip compression
- Set up CDN for static assets
- Optimize database queries
- Implement caching strategies
- Monitor and optimize bundle sizes

## Support

For deployment issues:
1. Check server logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for errors
5. Review this guide for common solutions
