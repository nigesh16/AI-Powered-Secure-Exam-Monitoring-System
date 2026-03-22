"""
AI Engine for online exam cheating detection.
Uses YOLOv5 (pretrained) + OpenCV face cascade.

uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from detector import analyze

app = FastAPI(title="Online Exam AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    image: str  # base64 encoded


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
def analyze_image(req: AnalyzeRequest):
    try:
        result = analyze(req.image)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
