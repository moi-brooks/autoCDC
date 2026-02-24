# AutoCdC – Automated Cahier des Charges Generator

AutoCdC is a requirements engineering automation platform that generates a structured Cahier des Charges (CdC) from a public web URL.

## Architecture

- **Backend:** FastAPI (Python), Playwright (Crawling), OpenAI (Analysis)
- **Frontend:** React + TypeScript + Vite, Tailwind CSS
- **Infrastructure:** PostgreSQL, Redis, Docker

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Install Playwright browsers:
   ```bash
   playwright install chromium
   ```
4. Start the API:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Infrastructure

Start the database and cache using Docker:
```bash
docker-compose up -d
```

## License

MIT
