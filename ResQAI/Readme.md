# ResQAI ⚕️
### AI-Powered Emergency Triage & Disaster Response Assistant

ResQAI is a production-grade, clinical decision-support and emergency triage platform designed to assist patients and first-responders during critical scenarios. Powered by Google Gemini AI, ResQAI analyzes symptoms, visually evaluates injury wounds, calculates clinical risk levels, coordinates localized disaster advice, maps nearby hospitals, and packages patient metrics into downloadable PDF summaries with embedded scan-ready QR codes.

---

## 🚀 Key Features

*   **AI Symptom Triage**: Enter or dictate symptoms to receive real-time, structured emergency severity risk levels (Low, Moderate, Critical), priority triage levels, clinical reasoning, and warning signs.
*   **Voice Dictation Input**: Integrates HTML5 Web Speech Recognition API for hands-free symptom descriptions.
*   **Injury Visual Analyzer**: Multimodal evaluation allows uploading photos of cuts, burns, or wounds for Gemini AI to assess tissue damage and recommend immediate local treatment.
*   **Family SOS Broadcast**: One-click emergency panic trigger that polls GPS coordinates and broadcasts medical snapshots to all saved contacts.
*   **Disaster Command Center**: Provides offline-ready, actionable guidelines (Do's and Don'ts) for floods, fires, earthquakes, cyclones, heatwaves, snake bites, and chemical spills.
*   **Nearby Hospital Navigation**: Embeds interactive Leaflet map overlays pointing to regional trauma clinics, utilizing OpenStreetMap/Overpass API coordinates.
*   **PDF Triage Reports**: Generates professional PDF records using PDFKit, complete with patient profile snapshots and a scan-ready QR code.
*   **Accessibility & Localization**: Offers dynamic text-resizing, high contrast visual filters, and real-time interface translation for English, Hindi, and Gujarati.

---

## 🛠️ Technology Stack

### Frontend
*   **React 19 / Vite / TypeScript**
*   **Tailwind CSS** (Custom clinical dark/light mode themes, glassmorphism filters)
*   **Zustand** (Global auth, theme, and accessibility state sync)
*   **Recharts** (Visualizing pain index trends and triage risk distributions)
*   **Leaflet Maps** (Interactive coordinate marker plotting)

### Backend
*   **Node.js / Express**
*   **MongoDB / Mongoose** (Persistent credentials, profiles, assessments, and reports)
*   **Google Gemini API** (Generative AI symptom parsing and multimodal image evaluations)
*   **PDFKit & QRCode** (Compiling scan-ready triage documents)
*   **Helmet & Express Rate Limit** (Production-hardened security configurations)

---

## 📂 Project Structure

```
├── client/                     # React 19 Frontend Web Application
│   ├── public/                 # Static assets, PWA icons, & Service Worker
│   ├── src/
│   │   ├── components/         # Layout modules (Navbar, Sidebar, layout wrapper)
│   │   ├── constants/          # Multilingual dictionary
│   │   ├── pages/              # Landing, Dashboard, Assessment, Disaster, Hospitals, Profile, Settings
│   │   ├── services/           # Axios interceptors configuration
│   │   ├── store/              # Zustand state stores
│   │   ├── types/              # TS interface blueprints
│   │   ├── App.tsx             # Route registry
│   │   └── main.tsx            # Entry and Service Worker mount
├── server/                     # Express API Server
│   ├── config/                 # Database links
│   ├── controllers/            # Auth, AI triage, hospitals, and PDF generators
│   ├── middleware/             # Upload grids, rate limits, error triggers
│   ├── models/                 # Mongoose schema definitions
│   ├── routes/                 # REST endpoints mapping
│   ├── services/               # Gemini AI prompt engine & PDFKit compiler
│   └── server.js               # Node.js entrance hook
```

---

## ⚙️ Setup & Installation

### Prerequisite
*   Node.js (v18+)
*   MongoDB Instance (running locally on `mongodb://127.0.0.1:27017/resqai` or via MongoDB Atlas URI)

### 1. Backend Server Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install server modules:
   ```bash
   npm install
   ```
3. Configure the environment variables in a `.env` file (a template `.env` is created for you in `/server`):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/resqai
   JWT_SECRET=resqai_secret_123456
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   *Note: If MongoDB is offline, the server will log a warning and continue running in offline fallback mode.*

### 2. Frontend Client Setup
1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install client modules:
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web app in your browser at `http://localhost:5173`.

---

## 🔬 Local Demonstration Guidelines

1.  **Register a profile**: Open `http://localhost:5173`, click **Sign Up**, and complete details.
2.  **Add Emergency Contacts**: Navigate to **Medical Profile**, specify your blood group, list allergies, and add 2-3 contacts checking the **SOS Alert** box.
3.  **Perform AI Triage**: Go to **Symptom Triage**, turn on the **Microphone** to dictate chest pain or stomach issues, upload an injury photo, and submit.
4.  **Read Diagnostic Checklist**: Examine the severity indicator, step-by-step first aid checklist, and warning flags. Click **Download Triage Report** to view the PDF.
5.  **Simulate SOS Panic Button**: Navigate to the **Dashboard** and press the large red **SOS** trigger. The app will grab your browser's GPS coordinates and print an SMS broadcast notification list.
6.  **Try Settings**: Go to **Accessibility** to toggle **Large Text**, **High Contrast**, or change language translation to **Hindi** or **Gujarati**.
