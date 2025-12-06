# MediLens AI 🏥

**MediLens AI** is a multimodal medical assistant designed to bridge the healthcare accessibility gap in underserved communities. Powered by **Google Gemini 2.5 Flash**, it uses advanced computer vision and audio reasoning to provide instant, structured medical guidance.

## 🚀 Key Features

*   **Multimodal Diagnosis**: Analyze symptoms via **Camera** (visual) + **Voice** (context) simultaneously.
*   **Multilingual Support**: Real-time translation and adaptation for 5+ languages (English, Spanish, French, Hindi, Swahili).
*   **Accessibility First**: Built-in **Text-to-Speech (TTS)** for users with low literacy or vision impairments.
*   **Local Privacy**: Medical history is stored in the browser's LocalStorage, not on external servers.
*   **Smart Actions**: Deep linking to Google Maps to **"Find Care"** nearby and shareable medical reports.
*   **Emergency Detection**: Automatic flagging of high-urgency symptoms with distinct visual alerts.

---


## 📹 Demo Video

Watch MediLens AI in action:

[![MediLens AI Demo](https://img.youtube.com/vi/zsBSkB530oE/0.jpg)](https://youtu.be/zsBSkB530oE)

---

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **AI Model**: Google Gemini 2.5 Flash (via `@google/genai` SDK)
*   **Icons**: Lucide React
*   **Build/Env**: AI Studio / Vite-compatible structure

---

## ⚙️ Workflow & Architecture

1.  **Input Capture**:
    *   The user takes a photo or uploads an image.
    *   The user records a voice description of their symptoms.
    *   Inputs are processed: Images are resized/compressed to JPEG; Audio is converted to Base64.

2.  **AI Processing**:
    *   Data is sent to Gemini 2.5 Flash with a specialized System Instruction.
    *   The model correlates visual evidence (rash, wound, pill) with audio context.
    *   Gemini outputs a structured **JSON** object containing diagnosis, severity, and actions.

3.  **Presentation**:
    *   The app parses the JSON and renders a user-friendly UI.
    *   Severity is color-coded.
    *   Actions are presented as checklists.

---

## 🔐 Security & Privacy

### Is this application secure?

**1. API Key Security**
*   **Current State**: In this demo environment, the API key is accessed via `process.env.API_KEY` on the client side.
*   **Production Recommendation**: For a public deployment, you **must** move the API interaction to a backend server (e.g., Node.js, Python, or Firebase Functions). The frontend should call your backend, and your backend should call Gemini. This keeps your API key hidden from the browser.

**2. Patient Data Privacy**
*   **Data Storage**: This app uses `localStorage` to save scan history. This data resides **only on the user's specific device/browser**. It is *not* uploaded to any central MediLens database.
*   **Cloud Processing**: Images and audio are sent to Google's servers strictly for the duration of the analysis. Google states that data sent to the Gemini API is not used to train their models (for paid tiers), but users should always be cautious with PII (Personally Identifiable Information).
*   **Mitigation**: We have added a **"Clear History"** button that instantly wipes all local data.

**3. Medical Disclaimer**
*   The app includes a mandatory "Terms of Service" modal on first launch and persistent disclaimers on every result screen to ensure users understand this is an AI tool, not a doctor.

---

## 📦 How to Deploy

1.  **Clone/Download** the repository.
2.  **Install Dependencies**: `npm install`
3.  **Set Environment Variable**: Create a `.env` file with `API_KEY=your_gemini_api_key`.
4.  **Run Locally**: `npm run dev`
5.  **Build for Production**: `npm run build`

---

## 🌐 Check Out Our Website

Visit our official website for more information, updates, and resources:

🔗 **[Visit MediLens AI Official Website](https://ai.studio/apps/drive/1Z-6HfrGoLxUQ9Wdf-AkVHT7hel97HKbS?fullscreenApplet=true)**

---

## 🏆 Hackathon Notes

*   **Impact**: Targets UN SDG 3 (Good Health and Well-being).
*   **Novelty**: Uses Gemini 2.5's native audio-vision reasoning (no separate speech-to-text step required).
*   **Design**: Mobile-first, "Glanceable" UI optimized for stress situations.