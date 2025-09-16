# Deployment Instructions

## Backend Deployment

### 1. Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-jwt-secret-key-here
MONGODB_URI=your-mongodb-connection-string-here
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000,http://localhost:3001
```

### 2. Build and Deploy
```bash
cd backend
npm install
npm run build
npm start
```

### 3. Common 403 Forbidden Issues and Solutions

#### CORS Issues
- Make sure your frontend domain is included in `ALLOWED_ORIGINS`
- Check that the frontend is making requests to the correct backend URL
- Verify that credentials are being sent with requests

#### JWT Token Issues
- Ensure the same `JWT_SECRET` is used on both frontend and backend
- Check that tokens are not expired (24h default)
- Verify that the Authorization header is properly formatted: `Bearer <token>`

#### Authentication Flow
1. User logs in via `/api/auth/login`
2. Backend returns JWT token
3. Frontend stores token in localStorage
4. Frontend includes token in Authorization header for subsequent requests
5. Backend validates token on protected routes

### 4. Debugging Steps
1. Check server logs for CORS errors
2. Verify JWT token format and expiration
3. Test API endpoints directly with tools like Postman
4. Check browser network tab for request/response details

### 5. Production Checklist
- [ ] Environment variables configured
- [ ] CORS origins updated for production domain
- [ ] JWT secret is secure and consistent
- [ ] MongoDB connection string is correct
- [ ] Server is running on correct port
- [ ] Frontend API base URL matches backend URL
