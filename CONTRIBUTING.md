# Contributing to Google SSO Implementation

First off, thank you for considering contributing to this project! 🎉

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Pull Request Process](#pull-request-process)
5. [Style Guidelines](#style-guidelines)
6. [Commit Messages](#commit-messages)

---

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (browser, OS, etc.)
- **Console errors** (if any)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Include:

- **Clear title** describing the enhancement
- **Use case** - why is this needed?
- **Proposed solution** (if you have one)
- **Alternatives considered**

### Pull Requests

We love pull requests! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your branch
7. Open a Pull Request

---

## Development Setup

### Prerequisites

- Node.js 14+ (for development tools)
- Modern web browser
- Text editor with JavaScript support

### Local Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/google-sso-implementation.git
cd google-sso-implementation

# Install development dependencies
npm install

# Start local server
npm start
# or
python3 -m http.server 8080
```

### Testing

```bash
# Run tests (when implemented)
npm test

# Manual testing
# Open http://localhost:8080 in browser
# Use ?demo=user@test.com for quick testing
```

---

## Pull Request Process

1. **Update documentation** - If you change functionality, update README.md
2. **Update examples** - Ensure examples still work
3. **Test in multiple browsers** - At least Chrome, Firefox, Safari
4. **Describe your changes** - Clear PR description
5. **Link related issues** - Use "Fixes #123" format
6. **Wait for review** - Be responsive to feedback

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How did you test this?

## Screenshots
(if applicable)

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have tested my changes
- [ ] I have updated documentation
- [ ] My changes don't break existing functionality
```

---

## Style Guidelines

### JavaScript

```javascript
// Use modern ES6+ syntax
const getUserType = (email) => {
    const domain = email.split('@')[1];
    return domain;
};

// Use meaningful variable names
const userSessionData = getSession();  // ✓
const data = getSession();              // ✗

// Use JSDoc comments for functions
/**
 * Get the user type based on email domain
 * @param {string} email - User email address
 * @returns {string} User type (admin|corporate|personal)
 */
function getUserType(email) {
    // ...
}

// Use 4 spaces for indentation
function example() {
    if (condition) {
        doSomething();
    }
}

// Use single quotes for strings
const message = 'Hello World';

// Add spaces around operators
const total = price + tax;
```

### HTML

```html
<!-- Use semantic elements -->
<header>...</header>
<main>...</main>
<footer>...</footer>

<!-- Use meaningful IDs and classes -->
<div id="user-dashboard" class="dashboard-container">

<!-- Indent nested elements -->
<div class="container">
    <div class="content">
        <p>Text</p>
    </div>
</div>
```

### CSS

```css
/* Use CSS custom properties for theming */
:root {
    --primary-color: #a855f7;
    --text-color: #ffffff;
}

/* Use meaningful class names */
.user-profile-card { }  /* ✓ */
.upc { }                 /* ✗ */

/* Group related properties */
.element {
    /* Positioning */
    position: absolute;
    top: 0;
    left: 0;
    
    /* Display */
    display: flex;
    align-items: center;
    
    /* Visual */
    background: var(--primary-color);
    border-radius: 8px;
    
    /* Typography */
    font-size: 1rem;
    color: var(--text-color);
}
```

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add support for multiple Google accounts

fix(session): resolve session not persisting after page refresh

docs(readme): update installation instructions

style(auth): format code with prettier

refactor(roles): simplify permission checking logic

test(auth): add unit tests for JWT decoding

chore(deps): update Google Identity Services SDK
```

---

## Recognition

Contributors will be:

- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in documentation

Thank you for making this project better! 🙏

