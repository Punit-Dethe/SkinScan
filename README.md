# SkinSight

A modern web app for AI-powered skin disease detection using Google Gemini API.

## Features
- Upload a skin image and get instant AI analysis
- Beautiful, responsive UI with color-coded diagnosis cards
- Gemini API integration for real-time, multimodal medical insights
- Reset and upload multiple images easily

## Getting Started

### 1. Clone the repository
```sh
git clone https://github.com/yourusername/skinsight.git
cd skinsight
```

### 2. Add your Gemini API Key
- Copy `.env.example` to `.env` and add your Gemini API key:
  ```sh
  cp .env.example .env
  # Then edit .env and set NEXT_PUBLIC_GEMINI_API_KEY=your-key-here
  ```

### 3. Run locally
For local static testing, you can still open `public/index.html` in your browser (but the API key must be hardcoded in `app.js` for this mode). For Vercel/Netlify, use the `.env` method above.

## Project Structure
```
public/
  index.html      # Main HTML file
  style.css       # App styles
  app.js          # App logic and Gemini API integration
README.md         # Project info and instructions
```

## Deployment
You can deploy this app on GitHub Pages, Vercel, Netlify, or any static hosting provider.

### Live Site
Once deployed, your live site will be available at:

`https://your-vercel-site-url.vercel.app/`

Replace with your actual Vercel deployment URL after going live.

## License
MIT

---

**SkinSight** is for educational and informational purposes only. Not a substitute for professional medical advice.
