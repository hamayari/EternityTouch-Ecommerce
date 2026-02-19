# Git Workflow - Best Practices

## Branch Structure

```
main (production)
  └── develop (development)
       └── feature/* (features)
```

## Branches

- **main**: Production-ready code only. Protected branch.
- **develop**: Integration branch for features. Default development branch.
- **feature/***: Individual features (e.g., `feature/payment-gateway`)

## Workflow

### 1. Start New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 2. Work on Feature
```bash
# Make changes
git add .
git commit -m "feat: description of changes"
git push origin feature/your-feature-name
```

### 3. Merge to Develop
```bash
git checkout develop
git pull origin develop
git merge feature/your-feature-name
git push origin develop
```

### 4. Deploy to Production
```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

## Commit Message Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

## Examples

```bash
git commit -m "feat: add email confirmation for orders"
git commit -m "fix: resolve cart total calculation bug"
git commit -m "docs: update deployment guide"
```

## Current Status

✅ Repository: https://github.com/hamayari71-bit/eternity-touch-ecommerce
✅ Branches: main, develop
✅ Remote configured
