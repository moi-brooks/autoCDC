# 📄 AutoCdC – Automated "Cahier des Charges" Generator

AutoCdC is an AI-powered requirements engineering platform that automatically generates a structured, professional **Cahier des Charges (CdC)** from any public web URL. Using advanced crawling and Llama 3.3 (via Groq), it analyzes websites to produce high-quality project specifications in seconds.

---

## 🚀 Key Features

- **🌐 Intelligent Crawling:** Deep analysis of URLs to extract forms, links, buttons, and page metadata.
- **🤖 AI-Driven Analysis:** Generates a comprehensive 15-section CdC in French using Llama 3.3.
- **✍️ Interactive Editor:** Refine, edit, and save sections of the generated document directly in your browser.
- **📄 Professional Export:** Download your project specifications in **Markdown** or **PDF** format.
- **⚡ Modern Tech Stack:** FastAPI, React (TypeScript), Playwright, and Groq.

---

## 🛠️ Tech Stack

- **Frontend:** [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/)
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/), [Playwright](https://playwright.dev/), [Groq SDK](https://console.groq.com/)
- **Analysis:** [Llama 3.3 70B (Groq)](https://groq.com/)
- **Infrastructure:** [PostgreSQL](https://www.postgresql.org/), [Redis](https://redis.io/), [Docker Compose](https://docs.docker.com/compose/)

---

## 🏗️ Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Python 3.12+](https://www.python.org/)
- [Docker & Docker Compose](https://www.docker.com/)
- [Groq API Key](https://console.groq.com/keys)

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```
2. **Setup environment:**
   Create a `.env` file and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
3. **Install dependencies:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   playwright install chromium --with-deps
   ```
4. **Run development server:**
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```
2. **Install and run:**
   ```bash
   npm install
   npm run dev
   ```

---

## 🐳 Running with Docker

You can easily start the required infrastructure (PostgreSQL & Redis) using Docker:

```bash
docker compose up -d
```

---

## 📖 How to Use

1. **Enter URL:** Paste the public URL of a website you want to analyze (e.g., a landing page for a new SaaS product).
2. **Generate:** Click "Generate" and wait a few seconds while the crawler and AI work their magic.
3. **Review & Refine:**
   - Browse the 15 generated sections (Contexte, Périmètre, Architecture, etc.).
   - Click the **Edit (pencil)** icon on any section to customize its content.
   - Click **Save** to update the local draft.
4. **Export:** Once satisfied, click **Export PDF** or **Markdown** to download your professional Cahier des Charges.

---

## 🧪 Testing

To run backend tests:
```bash
cd backend
PYTHONPATH=. pytest tests/
```

## 📄 License

MIT - See [LICENSE](LICENSE) for details.
