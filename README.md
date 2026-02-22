
<div align="center">
  <img src="images/icon.svg" width="120" height="auto" alt="Moire Logo">
  <br/>
  <br/>
  <h1>Moire</h1>
  <p>
    Sync your thoughts from Apple Notes to GitHub Pages by Shortcuts.
  </p>
  <p>
    <a href="https://moire.blog">Moire</a> &nbsp;&nbsp;|&nbsp;&nbsp; <a href="https://docs.moire.blog">Docs</a> &nbsp;&nbsp;|&nbsp;&nbsp; <a href="https://themes.moire.blog">Themes</a>
  </p>
  <br/>
  <img src="images/moire.png" width="100%" alt="Moire Preview">
</div>

<br/>

## Introduction

Moire is a tool designed to seamlessly synchronize your thoughts from Apple Notes using Shortcuts.

## Features

- **Seamless Sync**: Direct integration with Apple Notes via Shortcuts.
- **Markdown Export**: Convert your notes to Markdown format. Easy to migrate.
- **Theme Support**: Customizable themes (e.g., Receipt, Pixel).

## Development

### Prerequisites

Ensure you have the following installed:
- Node.js (v18 or higher)
- pnpm (recommended)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/moirelog/moire.git
cd moire
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

### Build

Build for production:

```bash
pnpm build
```

### Quality checks

Type-check the app:

```bash
pnpm check
```

Run memo smoke tests:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test:watch
```

### Cleanup memo images

Preview which images would be removed:

```bash
pnpm run cleanup:images -- --dry-run
```

Remove unused memo images:

```bash
pnpm run cleanup:images
```

## License

This project is licensed under the GPL-3.0 License.
