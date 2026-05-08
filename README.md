# RepoDigest

RepoDigest is a high-performance source code extraction engine that instantly converts any GitHub repository into a single, LLM-ready text file. It provides a complete project structure along with all textual file contents, making it perfect for feeding context into Large Language Models (LLMs), conducting code audits, or generating comprehensive documentation.

## ✨ Features

- **Recursive Tree Analysis**: One-click mapping of entire repository structures.
- **Smart Filtering**: Automatically identifies and skips binary files (images, archives, etc.) to keep digests clean.
- **High-Performance Fetching**: Batched API requests to optimize speed while respecting GitHub rate limits.
- **Zero Trust Architecture**: All processing happens in your browser. Your GitHub tokens and code never leave your machine except to talk directly to GitHub's API.
- **LLM-Ready Output**: Generates a structured `.txt` file with clear delimiters that AI models can easily parse.
- **Aesthetic UI**: A brutalist, engineering-focused interface with real-time process monitoring.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- (Optional) A [GitHub Personal Access Token](https://github.com/settings/tokens) to increase API rate limits.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/repo-digest.git
   cd repo-digest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

### Development

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```
   This generates a `dist/` folder with optimized static assets.

2. **Preview the build:**
   ```bash
   npm run preview
   ```

## 🛠️ Built With

- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **Tailwind CSS 4** - Styling
- **Motion** - Fluid layout animations
- **Lucide React** - Iconography
- **GitHub REST API** - Data sourcing

## 📖 Usage Guide

1. **Enter Repository URL**: Paste the link to any public GitHub repository (e.g., `https://github.com/facebook/react`).
2. **(Optional) Add Token**: If you are extracting a large repository or have hit the 60-request hourly limit, enter a Personal Access Token.
3. **Generate Digest**: Click the "Generate .txt" button.
4. **Monitor Progress**: Watch the "Process Monitor" for real-time status updates and fetch logs.
5. **Download**: Once the process is terminated successfully, click "Download" to save the `.txt` digest to your device.

## 📄 License

This project is licensed under the Apache-2.0 License.
