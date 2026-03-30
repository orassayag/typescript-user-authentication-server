# Instructions

## Setup Instructions

1. Open the project in your IDE (VSCode recommended)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install PM2 globally (required for production deployment):
   ```bash
   sudo npm install -g pm2
   ```

## Configuration

### Environment Variables

The server uses environment variables for configuration. Create a `.env` file or set the following variables:

```bash
ENV=development                          # Environment: development | production
PORT=5111                                # Server port
MONGO_CONNSTRING=mongodb://localhost:27017  # MongoDB connection string
MONGO_DATABASE_UA=UA_DB_Dev             # User authentication database name
MONGO_DATABASE_LOGS=UA_Logs_Dev         # Logs database name
```

### Configuration File

Edit `config.ts` to customize server settings:

#### Server Configuration
- `appId`: Application identifier (default: UA)
- `env`: Environment (development/production)
- `port`: Server port (default: 5111)

#### MongoDB Configuration
- `connectionString`: MongoDB connection string
- `uaDatabase`: User authentication database name

#### Logging Configuration
- `logsFolder`: Directory for log files
- `maxMemoryLogs`: Maximum logs kept in memory
- Configure appenders for:
  - **Incoming requests**: Console and memory logging
  - **Request/Response details**: Memory and file logging
  - **Errors**: Console, file, database, and server logging

#### JWT Configuration
- `encryptionKey`: Secret key for JWT token encryption (⚠️ **Change in production!**)
- `expiresIn`: Token expiration time (default: 30 days)
- `issuer`: JWT token issuer

#### Cookie Configuration
- `access.maxAge`: Access cookie expiration (default: 15 minutes)
- `refresh.maxAge`: Refresh cookie expiration (default: 4 hours)
- `userData.maxAge`: User data cookie expiration (default: 15 minutes)

## Running the Server

### Development Mode

Run with TypeScript directly:
```bash
npm run dev
```

Run with nodemon for auto-restart:
```bash
npm run watch
# In another terminal:
npm run dev
```

Debug mode with inspector:
```bash
npm run debug
```

### Production Mode with PM2

Start the server with PM2:
```bash
pm2 start node --name UATool server
```

#### PM2 Commands

Check server status:
```bash
pm2 status
```

View logs in real-time:
```bash
pm2 logs
# Press CTRL+C to exit logs
```

Restart the server:
```bash
pm2 restart UATool
# Or restart all processes:
pm2 restart all
```

Stop the server:
```bash
pm2 stop UATool
```

Delete the process:
```bash
pm2 delete UATool
```

### Alternative: Run as Background Process

Without PM2, you can run as a background process:
```bash
nohup node server -a UATool & disown
```

**Explanation:**
- `nohup`: Keeps the process running when closing the SSH terminal
- `-a UATool`: Names the process for identification
- `disown`: Detaches the process completely

## API Endpoints

### Authentication Routes (`/auth`)

#### Get User Permissions
```http
GET /auth/permissions/:appId
```
Returns user permissions for a specific application.

#### Login
```http
POST /auth/login
Body: { userName, password, appId }
```
Authenticates user and returns permissions with JWT cookies.

#### Signup
```http
GET /auth/signup
```
Signup endpoint (TODO: implement full functionality).

#### Logout
```http
GET /auth/logout
```
Clears authentication cookies and ends session.

### User Management Routes (`/api/user`)

**Note**: Requires admin authentication.

#### Get All Users
```http
GET /api/user/
```
Returns all users with their roles and permissions.

#### Create User
```http
POST /api/user/
Body: { firstName, lastName, userName, password, isActive }
```
Creates a new user.

#### Update User
```http
PUT /api/user/:userId
Body: { firstName, lastName, userName, password, isActive }
```
Updates user information.

#### Delete User
```http
DELETE /api/user/:userId
```
Deletes user and all associated roles.

#### Assign User Roles
```http
POST /api/user/:userId/app-roles
Body: [{ appId, roleId, isActive }]
```
Assigns roles to a user for specific applications.

#### Remove User Role
```http
DELETE /api/user/:userId/app/:appId/role/:roleId
```
Removes a specific role from a user.

### Application Management Routes (`/api/app`)

**Note**: Requires admin authentication.

#### Get All Applications
```http
GET /api/app/
```
Returns all registered applications and their roles.

#### Create Application
```http
POST /api/app/
Body: { name, isActive }
```
Creates a new application.

#### Update Application
```http
PUT /api/app/:appId
Body: { name, isActive }
```
Updates application information.

#### Delete Application
```http
DELETE /api/app/:appId
```
Deletes an application.

### Role Management Routes (`/api/userRoles`)

#### Get User Roles for Application
```http
GET /api/userRoles?appId={appId}
```
Returns user roles for a specific application.

### Admin Routes (`/api/admin`)

**Note**: Requires admin authentication.

Various administrative endpoints for system management.

### Development & Monitoring Routes

#### Server Status
```http
GET /ping
```
Returns server health status.

#### Incoming Requests Log
```http
GET /log/incoming
```
Shows incoming requests without details.

#### Request/Response Log
```http
GET /log/requests
```
Shows detailed request/response logs (best viewed in Postman).

#### Error Log
```http
GET /log/errors
```
Shows error logs with stack traces.

## Database Collections

The server uses the following MongoDB collections:

- **Users**: User accounts with credentials
- **RolesUsers**: User-to-role assignments per application
- **Apps**: Registered applications with roles
- **Logs**: System error logs (when DB logging is enabled)

## Security Considerations

### Production Checklist

Before deploying to production:

1. ✅ Change `jwt.auth.encryptionKey` to a strong random secret
2. ✅ Set `ENV=production` environment variable
3. ✅ Use secure MongoDB connection string with authentication
4. ✅ Enable HTTPS/TLS for all connections
5. ✅ Configure proper CORS settings
6. ✅ Review and restrict API rate limiting
7. ✅ Enable database logging for security events
8. ✅ Set strong password policies
9. ✅ Review and update cookie security settings
10. ✅ Configure proper firewall rules

### Password Security

Passwords are encrypted using strong hashing before storage. Never store plain-text passwords.

### JWT Token Security

- Access tokens expire after 15 minutes
- Refresh tokens expire after 4 hours
- All tokens are signed with the secret encryption key
- Tokens are validated on every request

### CSRF Protection

The server includes CSRF token middleware for protection against cross-site request forgery attacks.

## Troubleshooting

### Port Already in Use
```
Error: port 5111 is already in use
```
**Solution**: Change the port in `config.ts` or stop the process using the port.

### MongoDB Connection Failed
```
Error: failed to connect to MongoDB
```
**Solution**: 
- Ensure MongoDB is running
- Check connection string in environment variables
- Verify network connectivity

### JWT Token Errors
```
Error: Token validation error
```
**Solution**:
- Verify encryption key matches between token creation and validation
- Check token expiration time
- Ensure issuer is correct

## Development Tips

1. Use the `/test` routes (only available in development mode) for testing
2. Monitor logs in real-time with `pm2 logs` or check log files
3. Use Postman or similar tools for API testing
4. Enable debug mode for detailed error information
5. Test authentication flows thoroughly

## Author

* **Or Assayag** - *Initial work* - [orassayag](https://github.com/orassayag)
* Or Assayag <orassayag@gmail.com>
* GitHub: https://github.com/orassayag
* StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
* LinkedIn: https://linkedin.com/in/orassayag
