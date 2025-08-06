
// Skin Disease Detector using Gemini API
// Gemini API key is now loaded from environment variable for Vercel hosting
const GEMINI_API_KEY = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_GEMINI_API_KEY
  ? process.env.NEXT_PUBLIC_GEMINI_API_KEY
  : "YOUR_GEMINI_API_KEY_HERE";

const form = document.getElementById('uploadForm');
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');

const resultDiv = document.getElementById('result');
let resetBtn = null;


imageInput.addEventListener('change', function() {
  preview.innerHTML = '';
  resultDiv.textContent = '';
  removeResetBtn();
  const file = imageInput.files[0];
  if (file) {   
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
    preview.appendChild(img);
    addResetBtn();
  }
});

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  resultDiv.textContent = 'Analyzing image...';
  const file = imageInput.files[0];
  if (!file) {
    resultDiv.textContent = 'Please select an image.';
    return;
  }
  try {
    // Convert image to base64
    const base64 = await toBase64(file);
    // Call Gemini API
    const geminiResult = await analyzeWithGemini(base64);
    resultDiv.innerHTML = geminiResult;
    addResetBtn();
  } catch (err) {
    resultDiv.textContent = 'Error: ' + err.message;
    addResetBtn();
  }
});
// Add a reset button below the preview
function addResetBtn() {
  if (resetBtn) return;
  resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset';
  resetBtn.type = 'button';
  resetBtn.style.marginTop = '1rem';
  resetBtn.style.background = '#f3f4f6';
  resetBtn.style.color = '#374151';
  resetBtn.style.border = '1px solid #cbd5e1';
  resetBtn.style.borderRadius = '8px';
  resetBtn.style.padding = '8px 20px';
  resetBtn.style.fontWeight = '600';
  resetBtn.style.cursor = 'pointer';
  resetBtn.onclick = function() {
    preview.innerHTML = '';
    resultDiv.textContent = '';
    imageInput.value = '';
    removeResetBtn();
  };
  preview.parentNode.insertBefore(resetBtn, preview.nextSibling);
}

function removeResetBtn() {
  if (resetBtn && resetBtn.parentNode) {
    resetBtn.parentNode.removeChild(resetBtn);
    resetBtn = null;
  }
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function analyzeWithGemini(imageBase64) {
  // Gemini Vision API endpoint and model (per latest docs)
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;
  // Instruct Gemini to reply in a simple markdown-like format for easier parsing and styling
  const prompt = `You are a dermatologist AI. Analyze the uploaded skin image and respond in the following markdown-like format:

## Diagnosis
<diagnosis text>

## Explanation
<explanation text>

## Contributing Factors
- <factor 1>
- <factor 2>

## Recommendations
1. <recommendation 1>
2. <recommendation 2>

## When to See a Doctor
<when to see a doctor text>

Use clear section headers and bullet/numbered lists. Do not include any text outside this format.`;
  const payload = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: "image/jpeg", data: imageBase64 } },
          { text: prompt }
        ]
      }
    ]
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Gemini API error: " + res.status);
  const data = await res.json();
  // Parse Gemini response and format it visually
  try {
    const raw = data.candidates[0].content.parts[0].text;
    return formatGeminiResponse(raw);
  } catch {
    return "No diagnosis found. Please try another image.";
  }
}

// Format Gemini's markdown-like response into a beautiful card
function formatGeminiResponse(raw) {
  // Convert markdown-like sections to styled HTML
  let html = raw
    .replace(/^## Diagnosis$/m, '<div class="section"><span class="icon">🩺</span><h2>Diagnosis</h2>')
    .replace(/^## Explanation$/m, '</div><div class="section"><span class="icon">💡</span><h2>Explanation</h2>')
    .replace(/^## Contributing Factors$/m, '</div><div class="section"><span class="icon">🔎</span><h2>Contributing Factors</h2>')
    .replace(/^## Recommendations$/m, '</div><div class="section"><span class="icon">📝</span><h2>Recommendations</h2>')
    .replace(/^## When to See a Doctor$/m, '</div><div class="section"><span class="icon">⚠️</span><h2>When to See a Doctor</h2>');

  // List handling: convert markdown lists to HTML lists (no nested <ul> or <ol> inside <li>)
  // 1. Replace - and 1. with <ul><li> and <ol><li> at the start of a line
  html = html.replace(/(?:<br>|^)\s*- ([^<]*)/g, '<ul><li>$1</li></ul>');
  html = html.replace(/(?:<br>|^)\s*\d+\. ([^<]*)/g, '<ol><li>$1</li></ol>');
  // 2. Remove consecutive closing/opening ul/ol tags
  html = html.replace(/<\/ul>\s*<ul>/g, '');
  html = html.replace(/<\/ol>\s*<ol>/g, '');
  // 3. Remove <br> before/after lists
  html = html.replace(/<br>(<ul>|<ol>)/g, '$1');
  html = html.replace(/(<\/ul>|<\/ol>)<br>/g, '$1');
  // 4. Replace remaining line breaks with <br>
  html = html.replace(/\n/g, '<br>');
  html += '</div>';
  // Wrap in a card
  return `<div class="gemini-card">${html}</div>`;

}
