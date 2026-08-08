# NutriSnap

NutriSnap is an AI-assisted meal logging app that recognizes meal photos, adjusts estimates based on preparation details, and presents a personal nutrition dashboard.

## Quick start

### API
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
\# Add GEMINI_API_KEY to backend/.env. Do not put this key in frontend/.env.
python app.py
```

### Web client
```powershell
cd frontend
npm install
npm run dev
```

The client runs at `http://localhost:5173` and the API at `http://localhost:5000`.

## Optional AI integration

Add `GEMINI_API_KEY` to `backend/.env` to enable Gemini vision. The uploaded meal image is sent from the Flask API to Gemini; the key never reaches the Vite client. Gemini returns the identified meal, estimated calories, protein, carbohydrates, fat, and a healthy suggestion. The nutrition calculator lives in `backend/services/nutrition.py` and is designed to be replaced or supplemented with USDA/Edamam data.
