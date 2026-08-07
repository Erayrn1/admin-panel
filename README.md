# Admin Panel Documentation

## Overview

Full-stack admin panel application with authentication, user management, and contact management features.

## Features

✅ **Authentication**
- User login and registration
- JWT-based authentication
- Password reset functionality
- Email verification

✅ **User Management**
- Create, read, update, delete users
- Role-based access control (Admin, Moderator, User)
- User status management

✅ **Contact Management**
- Manage contact submissions
- Full CRUD operations
- Contact information tracking

✅ **Dashboard**
- Statistics overview
- User activity tracking
- System logs

## Technology Stack

### Backend
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Email**: Nodemailer

### Frontend
- **Library**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS3

## Project Structure

```
admin-panel/
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── contacts.js
│   │   ├── dashboard.js
│   │   └── logs.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Contact.js
│   │   └── Log.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── logger.js
│   ├── app.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   └── ContactManagement.jsx
│   │   ├── styles/
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── index.css
│   └── public/
│       └── index.html
├── .env
├── package.json
├── setup.sh
└── setup.bat
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-panel
   ```

2. **Run setup script**
   
   **On Linux/Mac:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   
   **On Windows:**
   ```bash
   setup.bat
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

## Running the Application

### Development Mode

**Both Backend and Frontend:**
```bash
npm run dev-all
```

**Backend Only:**
```bash
npm run dev
```

**Frontend Only:**
```bash
cd frontend
npm start
```

### Production Mode

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Contacts
- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/:id` - Get contact by ID
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Logs
- `GET /api/logs` - Get activity logs

## Default Credentials

After setup, you can login with:
- **Email**: admin@example.com
- **Password**: admin123

⚠️ **IMPORTANT**: Change these credentials in production!

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/admin-panel

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d

# Email (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Application
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using that port

### CORS Error
- Ensure `CLIENT_URL` in `.env` matches frontend URL
- Check backend CORS configuration

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration
- Ensure cookies are enabled

## Security Considerations

⚠️ **Before Production:**
1. Change all default secrets and passwords
2. Enable HTTPS
3. Implement rate limiting
4. Add API key authentication
5. Set up proper CORS policies
6. Enable database backups
7. Implement input validation
8. Set up error logging
9. Configure firewall rules
10. Use environment-specific configurations

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a pull request

## License

ISC License - see LICENSE file for details

## Support

For issues or questions, please create an issue in the repository.

## Version History

### v1.0.0 (Current)
- Initial release
- Authentication system
- User management
- Contact management
- Dashboard
- Admin panel
