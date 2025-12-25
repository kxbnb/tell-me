# Tell Me - Local Insights

A web application that generates personalized travel narrations and audio guides based on your location and interests. Discover the stories of the places you go with AI-powered travel insights.

## Features

- 🌍 **Location-based insights**: Get information about your current location or any destination
- 🎯 **Smart destination suggestions**: AI-powered suggestions for nearby landmarks and attractions
- 🎧 **Audio narration**: Text-to-speech audio guides for hands-free listening
- 🚶 **Travel mode optimization**: Tailored content for walking or driving
- 🎨 **Interest-based customization**: Filter content by your interests (Arts, History, Nature, Architecture, Culture, Food)
- 📍 **Geolocation support**: Automatically detect your current location
- 🎨 **Modern UI**: Clean, responsive interface with smooth animations

## Technology Stack

- **Backend**: FastAPI (Python)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI Services**: OpenAI GPT-3.5-turbo (text generation) and TTS-1 (audio synthesis)
- **Deployment**: Vercel serverless functions
- **Styling**: Custom CSS with Outfit font family

## Prerequisites

- Python 3.8+
- OpenAI API key
- Node.js and npm (for deployment)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tellme
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Local Development

Run the application locally using uvicorn:

```bash
uvicorn api.index:app --reload
```

The application will be available at `http://localhost:8000`

## Deployment

This project is configured for deployment on Vercel:

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Configure environment variables**
   
   Add your `OPENAI_API_KEY` in the Vercel dashboard under Project Settings → Environment Variables

## Project Structure

```
tellme/
├── api/
│   └── index.py           # FastAPI application and API routes
├── static/
│   ├── script.js          # Frontend JavaScript logic
│   └── style.css          # Styling and animations
├── templates/
│   └── index.html         # Main HTML template
├── requirements.txt       # Python dependencies
├── vercel.json           # Vercel deployment configuration
└── README.md             # Project documentation
```

## API Endpoints

### `GET /`
Renders the main application interface

### `POST /api/generate`
Generates a travel script and audio narration

**Request Body:**
```json
{
  "location": "string (required)",
  "headed_towards": "string (optional)",
  "travel_mode": "Walking | Car (optional)",
  "interests": ["Arts", "History", "Nature", ...]
}
```

**Response:**
```json
{
  "script": "Generated travel script text",
  "audio_url": "data:audio/mp3;base64,..."
}
```

### `POST /api/suggest`
Suggests nearby landmarks and destinations

**Request Body:**
```json
{
  "location": "string (required)"
}
```

**Response:**
```json
["Destination 1", "Destination 2", "Destination 3"]
```

## Usage

1. **Enter your location** or use the location icon to auto-detect your position
2. **Optionally specify** where you're headed (with auto-suggestions)
3. **Select your interests** from the available categories
4. **Choose your travel mode** (Walking or Car) for optimized content
5. **Click "Tell Me"** to generate your personalized travel narration
6. **Listen to the audio** or read the generated script
7. **Start over** to create a new travel story

## Features in Detail

### Geolocation
The app uses the browser's Geolocation API and OpenStreetMap's Nominatim service to automatically detect and resolve your current location to a human-readable place name.

### AI-Powered Content
- Uses GPT-3.5-turbo to generate engaging 30-second travel scripts (approximately 75 words)
- Adapts content based on travel mode, destination, and personal interests
- Ensures informative yet exciting tone suitable for travelers

### Audio Synthesis
- Converts generated text to natural-sounding speech using OpenAI's TTS-1 model
- Audio is delivered as base64-encoded MP3 for instant playback
- Custom audio player with modern controls

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues, questions, or suggestions, please open an issue in the repository.

---

Built with ❤️ for travelers and explorers
