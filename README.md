<div align="center">

# Differ

### Intelligent Project Structure Comparison Tool

Compare two codebases side-by-side. Detect added, deleted, modified, and moved files with a fast, non-blocking diff engine powered by Web Workers.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## Overview

**Differ** is a browser-based tool for comparing two project structures — whether local directories or compressed archives (`.zip`, `.war`, `.jar`). It intelligently detects structural and content-level changes, highlights moved files, and presents results in a clean, interactive dashboard with a side-by-side diff viewer.

All heavy computation runs inside a **Web Worker**, keeping the UI fully responsive even when comparing large projects with thousands of files.

---

## Features

| Feature               | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| **Folder Picker**     | Select local directories via the File System Access API            |
| **Archive Support**   | Load `.zip`, `.war`, and `.jar` files directly                     |
| **Drag & Drop**       | Drop archives onto the drop zones                                  |
| **Move Detection**    | Identifies files moved to a different path                         |
| **Content Diff**      | Whitespace-insensitive side-by-side diff viewer                    |
| **Smart Filtering**   | Filter results by change type (Added / Modified / Deleted / Moved) |
| **File Tree**         | Collapsible tree with color-coded change indicators                |
| **Virtualized Lists** | Handles thousands of files without performance degradation         |
| **Non-blocking**      | All diff processing runs in a Web Worker                           |
| **Dark Theme**        | Polished dark UI with smooth Framer Motion transitions             |

---

## Tech Stack

```
Frontend        React 19 + TypeScript + Vite 7
State           Zustand
Routing         Wouter
Styling         Tailwind CSS 4 + Lucide React
Animations      Framer Motion
Diff Engine     diff-match-patch
Archives        JSZip
Virtualization  @tanstack/react-virtual
Processing      Web Workers (ES modules)
```

---

## Project Structure

```
src/
├── core/                   # Pure business logic (no DOM dependencies)
│   ├── types.ts            # Domain types: FileNode, DiffResult, ChangeType
│   ├── comparator.ts       # Main comparison pipeline
│   ├── diffEngine.ts       # Whitespace-normalized content diff
│   ├── moveDetector.ts     # Move detection by name + hash
│   ├── fileHash.ts         # SHA-256 hashing via SubtleCrypto
│   └── filters.ts          # Default exclusion patterns
├── store/
│   └── useProjectStore.ts  # Zustand global state
├── hooks/
│   ├── useFileLoader.ts    # File System Access API
│   ├── useArchiveLoader.ts # JSZip archive extraction
│   └── useDiffWorker.ts    # Web Worker wrapper hook
├── workers/
│   └── diff.worker.ts      # Off-thread comparison runner
├── components/
│   ├── Layout.tsx
│   ├── Dashboard/          # SummaryCards, ChangeList
│   ├── DiffViewer/         # SideBySideDiff, DiffHeader
│   ├── FileTree/           # FileTreePanel, FileTreeNode
│   └── Loader/             # ProjectLoader drop zones
└── pages/
    ├── HomePage.tsx
    └── ResultsPage.tsx
```

---

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- A modern browser with [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) support (Chrome 86+, Edge 86+)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/differ.git
cd differ

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Usage

### 1. Load Projects

- Click **Browse Folder** to select a local directory, or
- Click **Upload Archive** to load a `.zip`, `.war`, or `.jar` file, or
- **Drag & drop** an archive onto either drop zone

### 2. Analyze

Click **Analyze Differences**. A progress bar tracks the Web Worker as it processes files in the background.

### 3. Review Results

- **Summary cards** at the top show counts per change type — click to filter
- **Change list** (left panel) sorted by impact magnitude — click any row to open its diff
- **Side-by-side viewer** (right panel) shows line-level changes with color highlighting
- **File tree** (toggle button, top right) shows the full project tree with color-coded nodes

### 4. Start Over

Click **New Comparison** to reset and load different projects.

---

## Change Types

| Type                 | Color  | Description                           |
| -------------------- | ------ | ------------------------------------- |
| **Added**            | Green  | File exists only in Project B         |
| **Deleted**          | Red    | File exists only in Project A         |
| **Modified**         | Amber  | Same path, different content          |
| **Moved**            | Blue   | Same name + content, different path   |
| **Moved + Modified** | Violet | Same name, different path and content |

---

## Default Exclusions

The following paths are automatically ignored during comparison:

`node_modules` · `.git` · `dist` · `target` · `.bin` · `.venv` · `.DS_Store` · `Thumbs.db`

---

## Browser Compatibility

| Browser      | Support                    |
| ------------ | -------------------------- |
| Chrome 86+   | Full                       |
| Edge 86+     | Full                       |
| Firefox 111+ | Full (no folder picker)    |
| Safari 16.4+ | Partial (no folder picker) |

> **Note**: The folder picker (`showDirectoryPicker`) requires a Chromium-based browser. Archive upload works in all modern browsers.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
