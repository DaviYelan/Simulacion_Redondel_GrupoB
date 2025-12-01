<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1-NTVGFqykxVSmnW33graUw_-x9d2H3yu

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend (Python) - FastAPI

This project can run a Python backend that serves the existing frontend files and runs the simulation server-side.

1. Create a virtual environment and install dependencies:

```powershell
python -m venv .venv
; .\.venv\Scripts\Activate.ps1
; pip install -r python_sim\requirements.txt
```

2. Start the backend (serves static files and WebSocket):

```powershell
uvicorn python_sim.main:app --reload --host 0.0.0.0 --port 8000
```

3. Open your browser at `http://localhost:8000`.

Controls in the UI will communicate with the Python backend via WebSocket at `/ws`.
