# Contributing

Contributions to this project are [released](https://help.github.com/articles/github-terms-of-service/#6-contributions-under-repository-license) to the public under the [project's open source license](LICENSE).

Everyone is welcome to contribute to this project. Contributing doesn't just mean submitting pull requests—there are many different ways for you to get involved, including answering questions, reporting issues, improving documentation, or suggesting new features.

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request:
1. Check if the issue already exists in the [GitHub Issues](https://github.com/orassayag/typescript-user-authentication-server/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Error messages or logs (if applicable)
   - Your environment details (OS, Node version, MongoDB version)

### Submitting Pull Requests

1. Fork the repository
2. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes following the code style guidelines below
4. Test your changes thoroughly
5. Commit with clear, descriptive messages
6. Push to your fork and submit a pull request

### Code Style Guidelines

This project uses:
- **TypeScript** with strict type checking
- **Node.js** and **Express** for the server framework
- **MongoDB** for database operations

Before submitting:
```bash
# Compile TypeScript to check for errors
npm run compile-to-js

# Test the server locally
npm run dev
```

### Coding Standards

1. **Type safety**: Use proper TypeScript types, avoid using `any`
2. **Security first**: Follow OWASP guidelines and secure coding practices
3. **Error handling**: Implement proper error handling with descriptive messages
4. **Authentication**: Never expose sensitive data in responses or logs
5. **Naming**: Use clear, descriptive names for variables, functions, and classes
6. **Services pattern**: Follow the existing service-based architecture
7. **Middleware**: Use middleware for cross-cutting concerns (auth, logging, error handling)

### Security Considerations

When contributing, always:
1. **Never hardcode** secrets, API keys, or credentials
2. **Validate and sanitize** all user inputs
3. **Use parameterized queries** for database operations
4. **Hash passwords** using strong encryption (bcrypt/argon2)
5. **Implement proper JWT validation** and expiration
6. **Follow CSRF protection** patterns
7. **Log security events** without exposing sensitive data

### Adding New Features

When adding new features:
1. Create appropriate models in `src/models/` or `src/shared/models/`
2. Add service logic in `src/services/` or `src/shared/services/`
3. Create routes in `src/routes/` following the existing pattern
4. Add middleware in `src/middlewares/` if needed
5. Update configuration in `config.ts` if required
6. Test thoroughly with different scenarios
7. Update documentation

### Database Schema

When modifying database collections:
1. Update relevant model files in `src/shared/models/docs/`
2. Ensure backward compatibility or provide migration scripts
3. Update collection constants in `src/shared/consts/db-collections.consts.ts`
4. Test with existing data

### Authentication Flow

When working with authentication:
1. Understand the JWT token flow (access tokens, refresh tokens)
2. Follow the cookie-based session management pattern
3. Implement proper role-based access control (RBAC)
4. Test permission checks thoroughly
5. Never bypass authentication middleware

## Questions or Need Help?

Please feel free to contact me with any question, comment, pull-request, issue, or any other thing you have in mind.

* Or Assayag <orassayag@gmail.com>
* GitHub: https://github.com/orassayag
* StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
* LinkedIn: https://linkedin.com/in/orassayag

Thank you for contributing! 🙏
