from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import os
import uvicorn
from dotenv import load_dotenv

from openai import OpenAI
import base64

load_dotenv()

app = FastAPI()

# Mount static files for local development
# In Vercel, static files are handled automatically if placed in 'static' folder at root, 
# but for the python rewrite to work with them locally we need this.
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

from typing import Optional

class GenerateRequest(BaseModel):
    location: str
    headed_towards: Optional[str] = None
    travel_mode: Optional[str] = None
    interests: list[str] = []

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/generate")
async def generate_script(request: GenerateRequest):
    try:
        # 1. Generate Script with OpenAI (Text)
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        prompt = f"Write a 30 second engaging travel script (approx 75 words) about {request.location}."
        if request.headed_towards:
            prompt += f" The traveler is headed towards {request.headed_towards}."
        
        if request.travel_mode == "Walking":
            prompt += " The traveler is walking, so point out details easily seen on foot."
        elif request.travel_mode == "Car":
            prompt += " The traveler is driving, so focus on major landmarks and scenic views visible from the road."

        if request.interests:
            prompt += f" Focus on these interests: {', '.join(request.interests)}."
        prompt += " The tone should be excited and informative. Do not include any scene directions, just the spoken text."

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful travel guide narrator."},
                {"role": "user", "content": prompt}
            ]
        )
        script_text = response.choices[0].message.content

        # 2. Generate Audio with OpenAI
        audio_response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=script_text
        )
        
        # Encode audio to base64 to send to frontend
        audio_base64 = base64.b64encode(audio_response.content).decode('utf-8')
        audio_url = f"data:audio/mp3;base64,{audio_base64}"

        return {"script": script_text, "audio_url": audio_url}

    except Exception as e:
       print(f"Error: {e}")
       raise HTTPException(status_code=500, detail=str(e))

class SuggestRequest(BaseModel):
    location: str

@app.post("/api/suggest")
async def suggest_destinations(request: SuggestRequest):
    try:
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        prompt = f"List 3 popular landmarks or interesting destinations near {request.location}. Return only a JSON array of strings, e.g. [\"Place 1\", \"Place 2\"]"
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful travel assistant. Output only valid JSON."},
                {"role": "user", "content": prompt}
            ]
        )
        
        content = response.choices[0].message.content
        import json
        suggestions = json.loads(content)
        return {"suggestions": suggestions}
    except Exception as e:
        print(f"Error fetching suggestions: {e}")
        return {"suggestions": []}

if __name__ == "__main__":
    uvicorn.run("api.index:app", host="0.0.0.0", port=8000, reload=True)
    #uvicorn api.index:app --reload --host 0.0.0.0 --port 8000