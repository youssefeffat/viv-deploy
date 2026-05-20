# Contributing to Viveris Carbone

Thank you for your interest in contributing to Viveris Carbone! This document provides guidelines and steps for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/viveris-carbone-backend.git
   cd viveris-carbone-backend
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Abdoullah93/viveris-carbone-backend.git
   ```

4. **Set up development environment**:
   ```bash
   # Copy environment files
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Start development environment
   docker-compose up -d
   ```

## 💻 Development Workflow

### 1. Sync with Upstream

Before starting work, ensure your fork is up to date:

```bash
git checkout develop
git fetch upstream
git merge upstream/develop
git push origin develop
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent fixes for production
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 3. Make Your Changes

- Write clean, readable code
- Follow the project's coding standards
- Add tests for new features
- Update documentation as needed

### 4. Test Your Changes

```bash
# Backend tests
cd backend
pytest

# Frontend tests  
cd frontend
npm test

# Build and test with Docker
docker-compose up --build
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "Type: Brief description"
```

See [Commit Messages](#commit-messages) for format guidelines.

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

## 🌳 Branching Strategy

### Main Branches

- **`main`**: Production-ready code
  - Protected branch
  - Only accepts PRs from `develop` or `hotfix/*` branches
  - All commits should be tagged with version numbers

- **`develop`**: Integration branch
  - Contains latest development changes
  - All feature branches merge here
  - Periodically merged to `main` for releases

### Supporting Branches

- **Feature branches**: `feature/*`
  - Branch from: `develop`
  - Merge back to: `develop`
  - Naming: `feature/descriptive-name`

- **Bugfix branches**: `bugfix/*`
  - Branch from: `develop`
  - Merge back to: `develop`
  - Naming: `bugfix/issue-description`

- **Hotfix branches**: `hotfix/*`
  - Branch from: `main`
  - Merge back to: `main` AND `develop`
  - Naming: `hotfix/critical-fix`

## 🔄 Pull Request Process

### Creating a Pull Request

1. **Push your branch** to your fork
2. **Navigate** to the original repository
3. **Click** "New Pull Request"
4. **Select** base branch:
   - `develop` for features and bugfixes
   - `main` for hotfixes (with approval)
5. **Fill out** the PR template
6. **Request** reviews from maintainers

### PR Template

Your pull request should include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List specific changes
- One per line

## Testing
- [ ] Backend tests pass
- [ ] Frontend tests pass
- [ ] Manual testing completed
- [ ] Docker build succeeds

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

### PR Review Process

1. **Automated checks** run (CI/CD)
2. **Code review** by maintainers
3. **Address feedback** if requested
4. **Approval** by at least one maintainer
5. **Merge** by maintainer

### After Your PR is Merged

1. **Delete** your feature branch:
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. **Update** your local repository:
   ```bash
   git checkout develop
   git pull upstream develop
   ```

## 📝 Coding Standards

### Python (Backend)

- Follow [PEP 8](https://pep8.org/) style guide
- Use type hints where appropriate
- Write docstrings for functions and classes
- Maximum line length: 100 characters

```python
def example_function(param: str) -> dict:
    """
    Brief description of function.
    
    Args:
        param: Description of parameter
        
    Returns:
        Description of return value
    """
    return {"result": param}
```

### JavaScript/Svelte (Frontend)

- Use ES6+ features
- 2 spaces for indentation
- Use meaningful variable names
- Comment complex logic

```javascript
// Good
const userData = await fetchUserData();

// Bad
const d = await fetch();
```

### General Guidelines

- ✅ Write self-documenting code
- ✅ Keep functions small and focused
- ✅ Use meaningful names
- ✅ Add comments for complex logic
- ✅ Remove commented-out code
- ❌ Don't commit sensitive data
- ❌ Don't commit large binary files

## 📝 Commit Messages

### Format

```
Type: Brief description (max 50 chars)

Optional detailed description
- Explain what and why
- Not how (code shows how)

Refs: #issue-number
```

### Types

- **Add**: New feature or functionality
- **Fix**: Bug fix
- **Update**: Modify existing feature
- **Remove**: Delete code/files
- **Refactor**: Code restructuring
- **Docs**: Documentation changes
- **Test**: Add or update tests
- **Style**: Code style changes
- **Chore**: Maintenance tasks

### Examples

```bash
# Good
git commit -m "Add: User authentication endpoint"
git commit -m "Fix: Login validation error"
git commit -m "Update: Improve error handling in API"

# Bad
git commit -m "changes"
git commit -m "fixed stuff"
git commit -m "WIP"
```

## 🐛 Reporting Bugs

### Before Submitting

- Check existing issues
- Verify bug on latest version
- Collect relevant information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., Ubuntu 22.04]
- Docker version: [e.g., 24.0.0]
- Browser: [e.g., Chrome 120]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution**
What you want to happen

**Describe alternatives**
Other solutions you've considered

**Additional context**
Any other context or screenshots
```

## 🤝 Getting Help

- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Email**: Contact maintainers

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing! 🎉
