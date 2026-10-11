# Contributing

Thank you for your interest in contributing to the IEEE GEHU website. We welcome contributions from all branch members and the open-source community.

---

## Getting Started

Before contributing, make sure you have the project running locally. See **[SETUP.md](SETUP.md)** for a complete setup guide.

---

## Workflow

1. **Fork** the repository and clone your fork
2. **Create** a new branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make** your changes and ensure existing tests still pass:
   ```bash
   cd frontend && npm test
   ```
4. **Commit** using [Conventional Commits](https://www.conventionalcommits.org):
   ```
   feat: add team archive page
   fix: correct pagination offset bug
   docs: update API reference
   style: clean up navbar spacing
   ```
5. **Push** to your fork and open a **Pull Request** against `main`

---

## Guidelines

- All pull requests must pass the **CI pipeline** (Vitest) before merging
- Avoid committing `.env` files or secrets
- Follow the existing code style and component patterns
- Keep PRs focused — one feature or fix per PR

---

## Reporting Issues

Use [GitHub Issues](https://github.com/IEEE-Student-Branch-GEHU/ieee.web/issues) to report bugs or propose features. Please include:
- A clear description of the problem or proposal
- Steps to reproduce (for bugs)
- Expected vs actual behavior

---

## Questions

For general questions, reach out to the development team at [ieee@gehu.ac.in](mailto:ieee@gehu.ac.in).
