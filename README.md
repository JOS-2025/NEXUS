# Nexus — Digital Publishing & AI Intelligence Platform

**Nexus** is a full-stack, production-ready digital publishing platform designed for modern tech journalism, artificial intelligence insights, productivity frameworks, and entrepreneurship playbooks.

---

## 🌟 Key Features

### 📰 Editorial & Publishing Engine
- **Rich Article Reader**: Responsive reader layout with typography controls, estimated reading time, author profiles, category tagging, and interactive reaction/bookmarking controls.
- **Content Management**: Real-time article creation, markdown editing, draft publishing, and author attribution.
- **Resource Library**: Curated technical blueprints, downloadable prompt packs, Excel budget templates, and system checklists.

### 🤖 AI Assistant & AI Tools Directory
- **Server-Side Gemini Integration**: Powered by `@google/genai` for generating article summaries, drafting ideas, and answering reader inquiries.
- **AI Tools Directory**: Filterable directory comparing state-of-the-art AI software with pricing models, pros/cons, rating metrics, and direct alternatives.

### 📊 Digital Publishing Operations Center (Admin Console)
- **Analytics & Metrics**: Real-time reader stats, category distribution charts powered by `recharts`, top-performing articles, and revenue metrics.
- **Operations Dashboard**: Manage articles, draft pipelines, newsletter campaigns, user roles, and audit security logs.
- **Brand & System Settings**: Customizable site name, taglines, legal URLs, and SEO settings.

### 👤 Reader Experience & Subscriptions
- **Reader Dashboard**: Personalized reading history, saved bookmarks, subscription status, and activity tracking.
- **Subscription Management**: Support for premium membership plans and payment gateway authorization flow.
- **Newsletter Intelligence Digest**: Built-in subscription forms and newsletter broadcasting workflows.
- **Privacy & Compliance**: GDPR cookie consent manager and configurable compliance disclosures.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Motion](https://motion.dev/) (Framer Motion), [Lucide React Icons](https://lucide.dev/), [Recharts](https://recharts.org/)
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), [tsx](https://github.com/privatenumber/tsx)
- **Bundler & Build Tools**: [Vite](https://vitejs.dev/), [esbuild](https://esbuild.github.io/)
- **AI Framework**: [@google/genai](https://www.npmjs.com/package/@google/genai) SDK

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd nexus
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development
```

### 3. Running in Development Mode

To launch both the Express backend server and Vite dev middleware together:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

---

## 📦 Production & Deployment

### Local Production Build

To build the static client assets and bundle the Express backend with `esbuild`:

```bash
npm run build
npm start
```

### Deployment Options

#### 🐳 Container / Server Deployments (Cloud Run, Railway, Render, Fly.io)
Because Nexus runs a unified Express server that hosts both the API endpoints and serves the compiled Vite static assets:
1. Run `npm run build` during deployment.
2. Set `PORT` environment variable (defaults to `3000`).
3. Set `GEMINI_API_KEY` in your provider's secret manager.
4. Execute `npm start` (`node dist/server.cjs`).

#### ⚡ Vercel Deployment
To deploy to Vercel:
- **Serverless API Routes**: Route `/api/*` endpoints to serverless functions or deploy as a custom Express runtime on Vercel Node.js functions.
- **Client SPA**: Build output directory is `dist`. Set build command to `npm run build`.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
