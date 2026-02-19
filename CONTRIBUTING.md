# Contributing Guide

## Git Workflow

### Branch Strategy

We use **Git Flow** with two main branches:

- `main` - Production code (protected)
- `develop` - Development integration branch

### Working on Features

1. **Create feature branch from develop:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

2. **Make changes and commit:**
```bash
git add .
git commit -m "feat: your feature description"
```

3. **Push to GitHub:**
```bash
git push origin feature/your-feature-name
```

4. **Merge to develop when ready:**
```bash
git checkout develop
git merge feature/your-feature-name
git push origin develop
```

5. **Deploy to production (main):**
```bash
git checkout main
git merge develop
git push origin main
```

### Commit Message Format

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code formatting
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat: add email confirmation for orders"
git commit -m "fix: resolve cart calculation bug"
git commit -m "docs: update API documentation"
```

## Testing

Always run tests before pushing:

```bash
cd backend
npm test                    # All tests
npm run test:integration    # Integration tests
npm run test:critical       # Critical unit tests
```

## Code Quality

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits focused and atomic

## Pull Request Process

1. Create feature branch
2. Make changes with tests
3. Push to GitHub
4. Create PR to `develop`
5. Wait for review
6. Merge when approved

## Questions?

Open an issue on GitHub or contact the team.
