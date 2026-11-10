# FastAPI Learning Project

A personal project for learning FastAPI by building a REST API backend.

> The React frontend is taken from [navinreddy20/fastapi-demo](https://github.com/navinreddy20/fastapi-demo). All credit for the frontend goes to the original author. The backend in this repo is my own learning work.

## Tech Stack

| Layer | Technology |
| ------- | ------------ |
| Backend | Python, FastAPI, Uvicorn |
| Frontend | React (from the original demo) |
| Validation | Pydantic |

## Project Structure

```
learn_fastAPI/
├── frontend/        # React app (from navinreddy20/fastapi-demo)
├── main.py          # FastAPI app entry point
├── requirements.txt
└── README.md
```

## Setup

### Backend

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- API: <http://localhost:8000>
- Interactive docs: <http://localhost:8000/docs>

### Frontend

```powershell
cd frontend
npm install
npm start
```

- App: <http://localhost:3000>
- The dev server proxies API requests to `http://localhost:8000`, so start the backend first to avoid `ECONNREFUSED` proxy errors.

## Goals

- Learn FastAPI routing, request/response models, and validation
- Connect a FastAPI backend to a React frontend
- Practice project structure and clean API design

## Credits

- Frontend: [navinreddy20/fastapi-demo](https://github.com/navinreddy20/fastapi-demo)
