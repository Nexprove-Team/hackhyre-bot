# Contributing to hackhyre-bot

Thanks for taking the time to contribute!

## Getting Started

1. **Fork** the repository.
2. **Clone** your fork:

```bash
git clone https://github.com/<your-username>/hackhyre-bot.git
cd hackhyre-bot
```

3. **Install dependencies**:

```bash
npm install
```

4. **Run the scraper**:

```bash
node index.js backend
```

## Project Structure

```
hackhyre-bot/
├── index.js              # Main scraper
├── package.json          # Dependencies
├── README.md             # Usage & docs
├── .gitignore            # Git ignore rules
├── output/               # Generated JSON files
└── plans/                # Architecture docs
```

## How to Contribute

### 1. Create a Branch

```bash
git checkout -b feat/your-feature-name
```

### 2. Make Changes

- Keep changes focused and small.
- Add clear, concise comments where necessary.
- Use consistent formatting.

### 3. Test Your Changes

Run the scraper to validate functionality:

```bash
node index.js backend
```

### 4. Commit

```bash
git add .
git commit -m "feat: add your feature"
```

### 5. Push & Open a PR

```bash
git push origin feat/your-feature-name
```

Open a Pull Request on GitHub.

## Pull Request Guidelines

- Clearly describe **what** you changed and **why**.
- Reference any related issues.
- Keep PRs focused (avoid unrelated changes).
- Include screenshots/logs for changes to output formatting.

## Reporting Issues

Before opening a new issue:

- Search existing issues to avoid duplicates.
- Include:
  - Expected behavior
  - Actual behavior
  - Steps to reproduce
  - Node.js version
  - Sample command used
  - Error logs (if any)

## Code of Conduct

By participating, you agree to follow the repository’s Code of Conduct. If one
is not yet defined, please be respectful and constructive.

## Questions

If you have questions, open an issue with the **question** label.
