# Contributing to Prinvue

Thank you for your interest in contributing to Prinvue! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Be respectful and professional in all interactions. We're committed to providing a welcoming and inclusive environment for all contributors.

## Getting Started

### 1. Fork and Clone

```bash
git clone https://github.com/SiencePark/Prinvue.git
cd prinvue
```

### 2. Set Up Development Environment

```bash
# Install pnpm (recommended)
npm install -g pnpm@9

# Install dependencies
pnpm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/issue-description
```

## Development Workflow

### Code Style

- Use TypeScript for all code
- Use meaningful variable and component names
- Prefer functional components and hooks

### Before Committing

1. **Run type checking:**
   ```bash
   pnpm exec tsc --noEmit
   ```

2. **Build the project:**
   ```bash
   pnpm build
   ```

3. **Test in development:**
   ```bash
   pnpm dev
   ```

### Commit Messages

Write clear, descriptive commit messages:

```
feat: add printer status refresh button

- Add refresh button to PrinterCard component
- Implement manual status polling
- Update dashboard layout

Fixes #123
```

**Commit message format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring without feature changes
- `style:` - CSS and styling changes
- `perf:` - Performance improvements
- `chore:` - Dependencies, build, configuration

## Adding Features

### 1. New Components

Create a component:

```typescript
// src/components/MyComponent/MyComponent.tsx
import "./MyComponent.css";

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div className="my-component">
      <h2>{title}</h2>
      {onAction && <button onClick={onAction}>Action</button>}
    </div>
  );
}
```

Add styling:

```css
/* src/components/MyComponent/MyComponent.css */
.my-component {
  padding: 1rem;
  border-radius: 8px;
  background: var(--bg-secondary);
}

.my-component h2 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}
```

### 2. Adding New Views

1. Define the view in `App.tsx`:
   ```typescript
   type ViewState = 'overview' | 'settings' | 'docs' | 'mynewview';
   ```

2. Add the component to render:
   ```typescript
   {currentView === 'mynewview' && <MyNewView />}
   ```

3. Update sidebar navigation

### 3. Tauri Integration

For backend Rust commands:

1. Update `src-tauri/src/lib.rs`:
   ```rust
   #[tauri::command]
   fn my_new_command(param: String) -> String {
       format!("Processed: {}", param)
   }
   ```

2. Call from React:
   ```typescript
   import { invoke } from "@tauri-apps/api/core";

   const result = await invoke("my_new_command", { param: "value" });
   ```

### 4. API Communication

For Printerkurwa backend calls:

```typescript
const getServerUrl = () => {
  let url = localStorage.getItem('serverUrl') || 'http://127.0.0.1:8080';
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
};

async function fetchData() {
  try {
    const response = await fetch(`${getServerUrl()}/api/endpoint`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
```

### 5. Type Safety

Always define interfaces in `Types.ts` or in component files:

```typescript
// Types.ts
export interface Printer {
  id: string;
  name: string;
  model: string;
  status: 'online' | 'offline' | 'error';
  temperature?: number;
}

export interface PrinterCard {
  printer: Printer;
  onSelect: (printer: Printer) => void;
}
```

## Pull Request Process

### 1. Before Pushing

```bash
# Update your branch with latest main
git fetch origin
git rebase origin/main

# Type check
pnpm exec tsc --noEmit

# Build
pnpm build
```

### 2. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:

- **Title:** Clear, concise description
- **Description:**
  - What changes are included
  - Why these changes are needed
  - Any related issues (#123)
  - Screenshots for UI changes
- **Checklist:**
  - Type checking passes
  - Build succeeds
  - Tested in development
  - No console warnings/errors

### 3. PR Template

```markdown
## Description
Brief summary of changes

## Related Issue
Fixes #123

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] UI/Style update
- [ ] Documentation
- [ ] Refactoring

## Testing
- [ ] Tested in dev mode (pnpm dev)
- [ ] Tested in production build (pnpm build)
- [ ] No console errors
- [ ] Responsive design verified

## Screenshots
<!-- Add screenshots for UI changes -->

## Checklist
- [ ] Code follows project style guidelines
- [ ] TypeScript passes (no errors/warnings)
- [ ] Build succeeds
- [ ] No breaking changes (or clearly documented)
```

## Code Review

- Maintainers will review your PR within 1 week
- Feedback should be addressed with new commits
- Once approved, your PR will be merged to main

## Reporting Issues

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS information
- Screenshots if UI-related
- Console errors

### Feature Requests

Describe:
- Use case and motivation
- How users would interact with the feature
- Example mockups (if UI-related)
- Any technical considerations

## File Organization

```
src/components/
├── ComponentName/
│   ├── ComponentName.tsx       # Component code
│   └── ComponentName.css       # Component styles
├── Feature/
│   ├── Feature.tsx
│   └── Feature.css
└── ...

src/
├── Types.ts                    # Shared interfaces
├── App.tsx                     # Main app component
├── App.css                     # Global styles
└── main.tsx                    # Entry point
```

## Naming Conventions

- **Components:** PascalCase (e.g., `PrinterCard.tsx`)
- **Files:** Match component name or use kebab-case for utilities
- **Functions/Variables:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **Interfaces:** PascalCase with I prefix optional (e.g., `PrinterProps`)

## Documentation

Update documentation for:
- New user-facing features → Add/update `public/docs/*.md`
- Component usage → Add JSDoc comments
- API changes → Update relevant README sections
- Breaking changes → Update CHANGELOG

## Questions?

- Open a GitHub Discussion
- Check existing issues and PRs
- Review the built-in Documentation
- Contact the development team

## License

By contributing, you agree that your contributions will be licensed under the ... License.

---

Thank you for contributing to Prinvue!
