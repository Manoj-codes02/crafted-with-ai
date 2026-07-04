// ================= GLOBAL STATE & DATA SETS =================
const CROP_PROFILES = {
  tomato: {
    name: "Tomato",
    idealPh: { min: 6.0, max: 6.8 },
    idealN: 60, idealP: 40, idealK: 120,
    idealMoisture: 45,
    stages: [
      { name: "Germination", days: "0-10", desc: "Seed expansion and primary root shoot. Keep soil lightly damp.", todos: ["Maintain high soil humidity", "Inspect seed beds daily"] },
      { name: "Vegetative", days: "11-40", desc: "Rapid foliage canopy extension. High Nitrogen demand.", todos: ["Apply Nitrogen-rich fertilizer", "Inspect lower canopy for leaf mold", "Irrigate regularly"] },
      { name: "Flowering", days: "41-60", desc: "Blossoming buds. Require high Phosphorus and micro-nutrients.", todos: ["Boost Phosphorus/Potassium ratios", "Check for tomato blight spots", "Gently prune excessive foliage"] },
      { name: "Fruit Set", days: "61-80", desc: "Tomato yield expansion. Extreme Potassium and calcium needs.", todos: ["Apply calcium to prevent Blossom End Rot", "Optimal drip irrigation daily", "Monitor leaf moisture profiles"] },
      { name: "Maturity", days: "81+", desc: "Harvest window is open. Decrease watering slightly to intensify flavor.", todos: ["Perform harvest selectively", "Check skin hardness", "Stop chemical applications"] }
    ],
    yieldPerHectare: 65,
    diseases: {
      blight: {
        name: "Tomato Early Blight",
        confidence: "95.4%",
        pathogen: "Alternaria solani (Fungus)",
        severity: 75,
        symptoms: "Concentric target-like dark spots on older leaves. Leaf margins yellow and shed prematurely. Can compromise stem integrity.",
        organic: [
          "Apply liquid copper-based fungicide weekly.",
          "Prune lower foliage 12 inches off soil to block splash spore propagation.",
          "Mulch root zones to isolate soil spores."
        ],
        chemical: [
          "Spray Chlorothalonil or Mancozeb fungicide immediately upon spot confirmation.",
          "Apply chemical systemic preventive treatments at 14-day intervals."
        ]
      },
      healthy: {
        name: "Healthy Tomato Foliage",
        confidence: "98.1%",
        pathogen: "None (Healthy)",
        severity: 0,
        symptoms: "No lesions, pests, or color deficiencies visible. Foliage displays strong turgor pressure and rich chlorophyll pigment.",
        organic: [
          "Continue applying seaweed-based foliar tonic for immune boost.",
          "Ensure consistent crop-rotation schedule next cycle."
        ],
        chemical: [
          "No pesticide or fungicide treatment required. Continue standard irrigation."
        ]
      }
    }
  },
  wheat: {
    name: "Wheat",
    idealPh: { min: 6.0, max: 7.0 },
    idealN: 80, idealP: 30, idealK: 90,
    idealMoisture: 35,
    stages: [
      { name: "Tillering", days: "0-25", desc: "Development of lateral shoots. Crucial for determining spike count.", todos: ["Apply first top-dress Nitrogen", "Monitor weed competition"] },
      { name: "Stem Elongation", days: "26-60", desc: "Rapid vertical stalk growth. High moisture requirement.", todos: ["Check soil moisture levels", "Monitor for Rust spores"] },
      { name: "Heading", days: "61-85", desc: "Emergence of flower spikes. Susceptible to frost and water stress.", todos: ["Ensure crop is fully irrigated", "Apply final protective fungicide"] },
      { name: "Maturity", days: "86+", desc: "Kernels harden, plants transition to golden straw. Ready for reaper harvesting.", todos: ["Measure grain moisture content (<14%)", "Prepare harvesting machinery"] }
    ],
    yieldPerHectare: 4.8,
    diseases: {
      rust: {
        name: "Wheat Stem Rust",
        confidence: "91.2%",
        pathogen: "Puccinia graminis (Fungus)",
        severity: 85,
        symptoms: "Longitudinal, reddish-brown powdery pustules on leaves, stems, and leaf sheaths. Stalks weaken and lodge easily.",
        organic: [
          "Plant rust-resistant seed cultivars in next cycle.",
          "Apply botanical neem oil mixtures early in the morning to disrupt spores."
        ],
        chemical: [
          "Apply Propiconazole or Tebuconazole fungicide directly to foliage.",
          "Utilize chemical systemic protectants if high regional humidity persists."
        ]
      },
      healthy: {
        name: "Healthy Wheat Crop",
        confidence: "96.5%",
        pathogen: "None (Healthy)",
        severity: 0,
        symptoms: "Uniform green stalks and leaf structure. Grain heads are filling symmetrically. Stems exhibit optimal strength.",
        organic: ["Apply bio-stimulants to maximize grain weight.", "Continue crop monitoring."],
        chemical: ["None needed. System is operating at peak productivity."]
      }
    }
  },
  corn: {
    name: "Corn / Maize",
    idealPh: { min: 5.8, max: 6.8 },
    idealN: 120, idealP: 50, idealK: 100,
    idealMoisture: 40,
    stages: [
      { name: "Emergence", days: "0-15", desc: "First leaves breach the surface. Roots establish.", todos: ["Monitor insect cutworms", "Inspect plant population densities"] },
      { name: "V-Stage (Growth)", days: "16-50", desc: "Rapid leaf accumulation. High Nitrogen and moisture intake.", todos: ["Side-dress Nitrogen fertilizer", "Cultivate for weed control"] },
      { name: "Silking & Pollen", days: "51-75", desc: "Critical pollination. Water stress now causes severe yield drop.", todos: ["Maintain maximum irrigation rates", "Monitor leaf blight index"] },
      { name: "Maturity", days: "76+", desc: "Starch accumulates in kernels. Black layers form at kernel bases.", todos: ["Test kernel moisture levels", "Begin dry down schedule"] }
    ],
    yieldPerHectare: 9.5,
    diseases: {
      rust: {
        name: "Corn Common Rust",
        confidence: "93.6%",
        pathogen: "Puccinia sorghi (Fungus)",
        severity: 60,
        symptoms: "Cinnamon-brown pustules erupting on both upper and lower leaf surfaces, leading to leaf chlorosis and necrosis.",
        organic: [
          "Destroy infected crop residues after harvest.",
          "Apply liquid compost tea foliar spray to outcompete pathogen."
        ],
        chemical: [
          "Spray Strobilurin or Triazole class fungicides.",
          "Prioritize sprays if weather continues to be warm and humid."
        ]
      },
      healthy: {
        name: "Healthy Maize Crop",
        confidence: "97.4%",
        pathogen: "None (Healthy)",
        severity: 0,
        symptoms: "Dark green broad leaves, rigid tall stalk, well-filled ears with healthy silks.",
        organic: ["Maintain composting fertilizer schedule.", "Ensure deep root aeration."],
        chemical: ["No intervention required."]
      }
    }
  },
  potato: {
    name: "Potato",
    idealPh: { min: 5.2, max: 6.0 },
    idealN: 70, idealP: 60, idealK: 140,
    idealMoisture: 45,
    stages: [
      { name: "Sprouting", days: "0-20", desc: "Sprouts emerge from seed tubers and develop roots.", todos: ["Verify soil temperature (>10°C)", "Protect sprouts from freezing"] },
      { name: "Vegetative", days: "21-50", desc: "Stems and green leaves expand. Photosynthesis feeds tuber development.", todos: ["Apply primary Nitrogen fertilizer", "Hill the soil around stems"] },
      { name: "Tuber Initiation", days: "51-75", desc: "Tubers form at stolon tips. Plants begin flowering.", todos: ["Maintain steady water availability", "Monitor for Colorado beetle"] },
      { name: "Tuber Bulking", days: "76-100", desc: "Tubers expand rapidly. Potassium requirements peak.", todos: ["Apply Potassium sulphate", "Prevent water logging"] },
      { name: "Maturity", days: "101+", desc: "Vines die back. Skin of tubers thickens for storage.", todos: ["Vine killing/harvest preparation", "Cure potatoes in field before storage"] }
    ],
    yieldPerHectare: 35
  },
  rice: {
    name: "Rice",
    idealPh: { min: 5.5, max: 6.5 },
    idealN: 90, idealP: 45, idealK: 80,
    idealMoisture: 80,
    stages: [
      { name: "Seedling", days: "0-20", desc: "Seeds sprout in nursery, grow leaves, and get transplanted.", todos: ["Prepare flooded paddy fields", "Keep nursery water level shallow"] },
      { name: "Tillering (Flooded)", days: "21-65", desc: "Plants produce multiple tillers. Fields are kept flooded.", todos: ["Maintain 5cm water level", "Apply early Nitrogen splits"] },
      { name: "Panicle Initiation", days: "66-90", desc: "Reproductive organs form inside stem. Water levels are vital.", todos: ["Prevent water shortage", "Apply Potassium top-dress"] },
      { name: "Ripening", days: "91+", desc: "Grain fills, changes color to golden yellow. Drain field 10 days before harvest.", todos: ["Drain fields to hasten drying", "Check grain moisture content"] }
    ],
    yieldPerHectare: 6.2
  }
};

const FIELD_ZONES = [
  { id: "A-1", crop: "tomato", ndvi: 0.82, moisture: 48, temp: 24.2, size: 4.2, coords: "Zone A, Row 1-4" },
  { id: "A-2", crop: "tomato", ndvi: 0.78, moisture: 45, temp: 24.5, size: 4.2, coords: "Zone A, Row 5-8" },
  { id: "A-3", crop: "wheat", ndvi: 0.89, moisture: 38, temp: 23.8, size: 5.5, coords: "Zone A, Row 9-15" },
  { id: "A-4", crop: "wheat", ndvi: 0.85, moisture: 35, temp: 24.0, size: 5.5, coords: "Zone A, Row 16-22" },
  { id: "B-1", crop: "corn", ndvi: 0.65, moisture: 32, temp: 25.1, size: 6.0, coords: "Zone B, Row 1-10" },
  { id: "B-2", crop: "corn", ndvi: 0.42, moisture: 28, temp: 25.8, size: 6.0, coords: "Zone B, Row 11-20" },
  { id: "B-3", crop: "tomato", ndvi: 0.35, moisture: 24, temp: 26.2, size: 3.8, coords: "Zone B, Row 21-25" },
  { id: "B-4", crop: "tomato", ndvi: 0.52, moisture: 31, temp: 25.5, size: 3.8, coords: "Zone B, Row 26-30" },
  { id: "C-1", crop: "potato", ndvi: 0.71, moisture: 42, temp: 22.8, size: 5.0, coords: "Zone C, Row 1-8" },
  { id: "C-2", crop: "potato", ndvi: 0.68, moisture: 40, temp: 23.0, size: 5.0, coords: "Zone C, Row 9-16" },
  { id: "C-3", crop: "rice", ndvi: 0.91, moisture: 85, temp: 26.5, size: 7.2, coords: "Zone C, Row 17-25" },
  { id: "C-4", crop: "rice", ndvi: 0.88, moisture: 82, temp: 26.8, size: 7.2, coords: "Zone C, Row 26-34" },
  { id: "D-1", crop: "wheat", ndvi: 0.28, moisture: 18, temp: 27.2, size: 4.8, coords: "Zone D, Row 1-8" },
  { id: "D-2", crop: "corn", ndvi: 0.79, moisture: 42, temp: 24.6, size: 5.2, coords: "Zone D, Row 9-15" },
  { id: "D-3", crop: "potato", ndvi: 0.58, moisture: 35, temp: 23.5, size: 4.5, coords: "Zone D, Row 16-22" },
  { id: "D-4", crop: "rice", ndvi: 0.45, moisture: 60, temp: 27.0, size: 5.0, coords: "Zone D, Row 23-30" }
];

// Active State
let currentSelectedSample = null;
let currentSelectedField = FIELD_ZONES[0];

// Charts references
let npkChartInstance = null;
let ndviTrendChartInstance = null;

// ================= CLOCK & INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Live Clock updating
  updateClock();
  setInterval(updateClock, 60000);

  // 2. Tab Navigation Binding
  const navBtns = document.querySelectorAll(".nav-btn");
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // 3. Initialize Dashboard NPK Chart
  initializeNPKChart();

  // 4. Initialize Disease Scanner events
  initDiseaseScanner();

  // 5. Initialize Soil Optimizer Sliders listeners
  initOptimizerSliders();

  // 6. Initialize Timeline default
  updateHarvestTimeline();

  // 7. Initialize NDVI Satellite Map Grid
  renderSatelliteMapGrid();
  initializeNDVITrendChart();

  // 8. Chatbot triggers
  const chatTrigger = document.getElementById("chatbot-trigger-btn");
  const chatClose = document.getElementById("chatbot-close-btn");
  const chatWindow = document.getElementById("chatbot-window");

  chatTrigger.addEventListener("click", () => {
    chatWindow.classList.toggle("hidden");
    chatTrigger.classList.toggle("active");
  });

  chatClose.addEventListener("click", () => {
    chatWindow.classList.add("hidden");
  });
});

function updateClock() {
  const clockEl = document.getElementById("live-clock");
  if (!clockEl) return;
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  clockEl.textContent = `${hours}:${minutes} ${ampm}`;
}

function switchTab(tabId) {
  // Hide all sections
  const panes = document.querySelectorAll(".tab-pane");
  panes.forEach(pane => pane.classList.remove("active"));
  
  // Deactivate all nav buttons
  const navBtns = document.querySelectorAll(".nav-btn");
  navBtns.forEach(btn => btn.classList.remove("active"));

  // Show selected section
  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetPane) targetPane.classList.add("active");

  // Activate matching nav button
  const matchingBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (matchingBtn) matchingBtn.classList.add("active");

  // Resize charts on display to avoid display bugs
  if (tabId === 'dashboard' && npkChartInstance) {
    npkChartInstance.resize();
  } else if (tabId === 'satellite-ndvi' && ndviTrendChartInstance) {
    ndviTrendChartInstance.resize();
  }
}

// ================= DASHBOARD NPK CHART =================
function initializeNPKChart() {
  const ctx = document.getElementById("npkChart");
  if (!ctx) return;

  npkChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Nitrogen (N)", "Phosphorus (P)", "Potassium (K)"],
      datasets: [
        {
          label: "Current Field Levels",
          data: [42, 18, 110],
          backgroundColor: [
            "rgba(6, 182, 212, 0.6)", // Cyan
            "rgba(245, 158, 11, 0.6)", // Amber
            "rgba(16, 185, 129, 0.6)"  // Emerald
          ],
          borderColor: [
            "rgba(6, 182, 212, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(16, 185, 129, 1)"
          ],
          borderWidth: 1.5,
          borderRadius: 8
        },
        {
          label: "Target Optimal Levels",
          data: [60, 40, 120],
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderColor: "rgba(255, 255, 255, 0.3)",
          borderWidth: 1.5,
          borderDash: [5, 5],
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#f3f4f6",
            font: { family: "Outfit", size: 12 }
          }
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#9ca3af", font: { family: "Inter" } }
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#9ca3af", font: { family: "Inter" } },
          title: { display: true, text: "Nutrient Value (mg/kg)", color: "#9ca3af" }
        }
      }
    }
  });
}

// ================= AI DISEASE SCANNER =================
function initDiseaseScanner() {
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const startScanBtn = document.getElementById("start-scan-btn");
  const clearScanBtn = document.getElementById("clear-scan-btn");
  const previewImg = document.getElementById("leaf-preview-img");
  const previewContainer = document.getElementById("preview-container");
  const placeholderContent = document.getElementById("upload-placeholder-content");

  // Clicking dropZone triggers file input
  dropZone.addEventListener("click", (e) => {
    if (e.target !== fileInput && !previewContainer.classList.contains("hidden")) return;
    fileInput.click();
  });

  // Handle Drag & Drop
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "var(--mint)";
    dropZone.style.background = "rgba(16, 185, 129, 0.05)";
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "rgba(16, 185, 129, 0.3)";
    dropZone.style.background = "rgba(255, 255, 255, 0.01)";
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "rgba(16, 185, 129, 0.3)";
    dropZone.style.background = "rgba(255, 255, 255, 0.01)";
    
    if (e.dataTransfer.files.length) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length) {
      handleImageUpload(e.target.files[0]);
    }
  });

  // Start Diagnostic Button click
  startScanBtn.addEventListener("click", () => {
    runAIAnalysis();
  });

  // Clear Scan Button click
  clearScanBtn.addEventListener("click", () => {
    resetScanner();
  });
}

function handleImageUpload(file) {
  const reader = new FileReader();
  const previewImg = document.getElementById("leaf-preview-img");
  const previewContainer = document.getElementById("preview-container");
  const placeholderContent = document.getElementById("upload-placeholder-content");
  const startScanBtn = document.getElementById("start-scan-btn");
  const clearScanBtn = document.getElementById("clear-scan-btn");

  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewContainer.classList.remove("hidden");
    placeholderContent.classList.add("hidden");
    
    // Enable diagnose button, disable clear until diagnosed
    startScanBtn.removeAttribute("disabled");
    clearScanBtn.removeAttribute("disabled");
    currentSelectedSample = "uploaded"; // Tag custom uploaded image
  };
  reader.readAsDataURL(file);
}

function selectSample(cropType) {
  const previewImg = document.getElementById("leaf-preview-img");
  const previewContainer = document.getElementById("preview-container");
  const placeholderContent = document.getElementById("upload-placeholder-content");
  const startScanBtn = document.getElementById("start-scan-btn");
  const clearScanBtn = document.getElementById("clear-scan-btn");

  // Select sample card logic
  currentSelectedSample = cropType;

  // Render preview
  if (cropType === 'tomato') {
    previewImg.src = "assets/tomato_blight.png";
  } else if (cropType === 'corn') {
    previewImg.src = "assets/corn_rust.png";
  } else if (cropType === 'wheat') {
    previewImg.src = "assets/healthy_wheat.png";
  }

  previewContainer.classList.remove("hidden");
  placeholderContent.classList.add("hidden");

  // Enable buttons
  startScanBtn.removeAttribute("disabled");
  clearScanBtn.removeAttribute("disabled");
}

function resetScanner() {
  const previewImg = document.getElementById("leaf-preview-img");
  const previewContainer = document.getElementById("preview-container");
  const placeholderContent = document.getElementById("upload-placeholder-content");
  const startScanBtn = document.getElementById("start-scan-btn");
  const clearScanBtn = document.getElementById("clear-scan-btn");
  const fileInput = document.getElementById("file-input");

  previewImg.src = "";
  fileInput.value = "";
  previewContainer.classList.add("hidden");
  placeholderContent.classList.remove("hidden");

  startScanBtn.setAttribute("disabled", "true");
  clearScanBtn.setAttribute("disabled", "true");

  currentSelectedSample = null;

  // Reset Report view
  document.getElementById("result-status-badge").className = "diagnostic-badge idle";
  document.getElementById("result-status-badge").textContent = "Awaiting Input";
  document.getElementById("result-idle-state").classList.remove("hidden");
  document.getElementById("result-report-content").classList.add("hidden");
}

function runAIAnalysis() {
  const laser = document.getElementById("scan-laser-line");
  const overlay = document.getElementById("scanning-overlay-msg");
  const startScanBtn = document.getElementById("start-scan-btn");
  const clearScanBtn = document.getElementById("clear-scan-btn");
  const badge = document.getElementById("result-status-badge");

  // Disable controls during scanning
  startScanBtn.setAttribute("disabled", "true");
  clearScanBtn.setAttribute("disabled", "true");

  // Show scan effects
  laser.classList.remove("hidden");
  overlay.classList.remove("hidden");

  badge.className = "diagnostic-badge loading";
  badge.textContent = "Analyzing...";

  // Simulate scanning delays
  setTimeout(() => {
    // Hide scan effects
    laser.classList.add("hidden");
    overlay.classList.add("hidden");
    
    clearScanBtn.removeAttribute("disabled");

    // Process Diagnosis Report
    displayDiagnosticReport();
  }, 2200);
}

function displayDiagnosticReport() {
  const badge = document.getElementById("result-status-badge");
  const idleBox = document.getElementById("result-idle-state");
  const reportBox = document.getElementById("result-report-content");
  
  idleBox.classList.add("hidden");
  reportBox.classList.remove("hidden");

  // Determine which disease profile to render
  let diseaseData = null;

  if (currentSelectedSample === 'tomato') {
    diseaseData = CROP_PROFILES.tomato.diseases.blight;
    badge.className = "diagnostic-badge infected";
    badge.textContent = "Infected (Tomato Blight)";
    document.getElementById("report-crop-type").textContent = "Tomato";
  } else if (currentSelectedSample === 'corn') {
    diseaseData = CROP_PROFILES.corn.diseases.rust;
    badge.className = "diagnostic-badge infected";
    badge.textContent = "Infected (Corn Rust)";
    document.getElementById("report-crop-type").textContent = "Corn";
  } else if (currentSelectedSample === 'wheat') {
    diseaseData = CROP_PROFILES.wheat.diseases.healthy;
    badge.className = "diagnostic-badge healthy";
    badge.textContent = "Healthy (Wheat)";
    document.getElementById("report-crop-type").textContent = "Wheat";
  } else {
    // Custom upload default (let's simulate a disease diagnosis based on a tomato leaf early blight)
    diseaseData = CROP_PROFILES.tomato.diseases.blight;
    badge.className = "diagnostic-badge infected";
    badge.textContent = "Infected (Tomato Blight)";
    document.getElementById("report-crop-type").textContent = "Tomato (AI Match)";
  }

  // Populate Report HTML
  document.getElementById("report-disease-name").textContent = diseaseData.name;
  document.getElementById("report-confidence").textContent = diseaseData.confidence;
  document.getElementById("report-pathogen").textContent = diseaseData.pathogen;
  document.getElementById("report-symptoms").textContent = diseaseData.symptoms;

  // Severity Bar
  const fill = document.getElementById("report-severity-fill");
  const val = document.getElementById("report-severity-val");
  
  fill.style.width = `${diseaseData.severity}%`;
  
  if (diseaseData.severity === 0) {
    val.textContent = "Optimal (0%)";
    val.style.color = "var(--emerald)";
    fill.style.background = "var(--emerald)";
  } else if (diseaseData.severity < 50) {
    val.textContent = `Moderate (${diseaseData.severity}%)`;
    val.style.color = "var(--amber)";
    fill.style.background = "var(--amber)";
  } else {
    val.textContent = `High (${diseaseData.severity}%)`;
    val.style.color = "var(--red)";
    fill.style.background = "linear-gradient(90deg, var(--amber), var(--red))";
  }

  // Remedies lists
  const organicContainer = document.getElementById("report-organic-remedies");
  const chemicalContainer = document.getElementById("report-chemical-remedies");

  organicContainer.innerHTML = "";
  diseaseData.organic.forEach(rem => {
    const li = document.createElement("li");
    li.textContent = rem;
    organicContainer.appendChild(li);
  });

  chemicalContainer.innerHTML = "";
  diseaseData.chemical.forEach(rem => {
    const li = document.createElement("li");
    li.textContent = rem;
    chemicalContainer.appendChild(li);
  });
}

// ================= SOIL & WATER OPTIMIZER =================
function initOptimizerSliders() {
  const sliders = [
    { id: "opt-moisture", valId: "val-moisture", suffix: "%" },
    { id: "opt-ph", valId: "val-ph", suffix: "" },
    { id: "opt-n", valId: "val-n", suffix: " mg/kg" },
    { id: "opt-p", valId: "val-p", suffix: " mg/kg" },
    { id: "opt-k", valId: "val-k", suffix: " mg/kg" }
  ];

  sliders.forEach(sl => {
    const input = document.getElementById(sl.id);
    const bubble = document.getElementById(sl.valId);
    
    if (input && bubble) {
      input.addEventListener("input", () => {
        bubble.textContent = `${input.value}${sl.suffix}`;
      });
    }
  });

  // Calculate default suggestions once
  calculateSoilRecommendations();
}

function calculateSoilRecommendations() {
  const cropKey = document.getElementById("opt-crop").value;
  const moisture = parseInt(document.getElementById("opt-moisture").value);
  const ph = parseFloat(document.getElementById("opt-ph").value);
  const weather = document.getElementById("opt-weather").value;
  const n = parseInt(document.getElementById("opt-n").value);
  const p = parseInt(document.getElementById("opt-p").value);
  const k = parseInt(document.getElementById("opt-k").value);

  const profile = CROP_PROFILES[cropKey];
  if (!profile) return;

  // 1. Calculate Irrigation recommendation
  const irrBadge = document.getElementById("irr-badge");
  const irrText = document.getElementById("irr-text");
  const irrVol = document.getElementById("irr-vol");
  const irrTime = document.getElementById("irr-time");

  // Irrigation logic
  if (weather === 'rainy') {
    irrBadge.className = "action-alert-badge";
    irrBadge.textContent = "Hold Irrigation";
    irrText.innerHTML = `Heavy rainfall is forecast. Soil moisture is at ${moisture}%. Keep automatic irrigation off to avoid root rot and nutrient leaching.`;
    irrVol.textContent = "0 L/m²";
    irrTime.textContent = "N/A (Rain Forecast)";
  } else if (moisture >= profile.idealMoisture) {
    irrBadge.className = "action-alert-badge info";
    irrBadge.textContent = "Moisture Optimal";
    irrText.innerHTML = `Current soil moisture (${moisture}%) is above the ideal threshold (${profile.idealMoisture}%) for ${profile.name}. Evaporation is low.`;
    irrVol.textContent = "0 L/m²";
    irrTime.textContent = "Monitor Only";
  } else {
    // Moisture deficit
    const deficit = profile.idealMoisture - moisture;
    let vol = 5;
    if (deficit > 25) vol = 15;
    else if (deficit > 10) vol = 10;
    
    irrBadge.className = "action-alert-badge warning";
    irrBadge.textContent = "Water Scheduled";
    
    let weatherModifier = weather === 'sunny' ? "high solar exposure" : "mild overcast skies";
    irrText.innerHTML = `Soil moisture is at ${moisture}%, representing a deficit. With ${weatherModifier}, irrigate with <strong>${vol} liters per square meter</strong> to saturate root depths.`;
    irrVol.textContent = `${vol} L/m²`;
    irrTime.textContent = weather === 'sunny' ? "Early Morning (5-7 AM)" : "Late Afternoon (4-6 PM)";
  }

  // 2. Calculate Fertilizer recipe
  const fertBadge = document.getElementById("fert-badge");
  const fertText = document.getElementById("fert-text");
  const fertRatio = document.getElementById("fert-ratio");
  const fertRecipe = document.getElementById("fert-recipe");

  const diffN = profile.idealN - n;
  const diffP = profile.idealP - p;
  const diffK = profile.idealK - k;

  let needsFert = false;
  let deficits = [];

  if (diffN > 10) deficits.push("Nitrogen (N)");
  if (diffP > 5) deficits.push("Phosphorus (P)");
  if (diffK > 15) deficits.push("Potassium (K)");

  if (deficits.length > 0) {
    needsFert = true;
    fertBadge.className = "action-alert-badge warning";
    fertBadge.textContent = "Deficiency Detected";
    fertText.innerHTML = `Your soil shows deficiencies in: <strong>${deficits.join(", ")}</strong> compared to the ideal standards for ${profile.name} cultivation.`;
    
    // Construct optimal fertilizer NPK blending recommendations
    let nPart = diffN > 0 ? Math.round(diffN / 5) * 5 : 0;
    let pPart = diffP > 0 ? Math.round(diffP / 5) * 5 : 0;
    let kPart = diffK > 0 ? Math.round(diffK / 5) * 5 : 0;
    
    // Normalize ratio to something resembling NPK blend ratios
    const maxVal = Math.max(nPart, pPart, kPart, 1);
    const nRatioVal = Math.max(0, Math.round((nPart / maxVal) * 20));
    const pRatioVal = Math.max(0, Math.round((pPart / maxVal) * 10));
    const kRatioVal = Math.max(0, Math.round((kPart / maxVal) * 15));

    fertRatio.textContent = `${nRatioVal} - ${pRatioVal} - ${kRatioVal}`;
    fertRecipe.textContent = `Apply ${Math.max(40, Math.round(diffN * 1.5))} kg/hectare of a customized ${nRatioVal}-${pRatioVal}-${kRatioVal} chemical compound or compost equivalents.`;
  } else {
    fertBadge.className = "action-alert-badge info";
    fertBadge.textContent = "Nutrients Optimal";
    fertText.textContent = `All macronutrients (Nitrogen, Phosphorus, Potassium) meet the nutritional requirements of ${profile.name}. Yield potential is high.`;
    fertRatio.textContent = "0 - 0 - 0";
    fertRecipe.textContent = "No fertilizer adjustments required for this cycle.";
  }

  // 3. Calculate pH adjustment
  const phBadge = document.getElementById("ph-badge");
  const phText = document.getElementById("ph-text");

  if (ph < profile.idealPh.min) {
    phBadge.className = "action-alert-badge warning";
    phBadge.textContent = "Acidic Soil";
    const delta = (profile.idealPh.min - ph).toFixed(1);
    phText.innerHTML = `Soil is acidic (pH ${ph}) below the ideal threshold of ${profile.idealPh.min} for ${profile.name}. Apply <strong>Agricultural Lime (Calcium Carbonate)</strong> at 150 kg/hectare to buffer acidity by +${delta}.`;
  } else if (ph > profile.idealPh.max) {
    phBadge.className = "action-alert-badge warning";
    phBadge.textContent = "Alkaline Soil";
    const delta = (ph - profile.idealPh.max).toFixed(1);
    phText.innerHTML = `Soil is alkaline (pH ${ph}) above the ideal threshold of ${profile.idealPh.max} for ${profile.name}. Apply <strong>Elemental Sulfur</strong> at 100 kg/hectare to lower soil pH by -${delta}.`;
  } else {
    phBadge.className = "action-alert-badge info";
    phBadge.textContent = "Optimal pH";
    phText.innerHTML = `Soil pH of ${ph} is in the optimal range of ${profile.idealPh.min} - ${profile.idealPh.max}. Nutrient availability is maximized.`;
  }
}

// ================= HARVEST TIMELINE FORECASTER =================
function updateHarvestTimeline() {
  const cropKey = document.getElementById("time-crop").value;
  const plantingDateVal = document.getElementById("time-planting-date").value;
  const tempMod = document.getElementById("time-temp-mod").value;

  const profile = CROP_PROFILES[cropKey];
  if (!profile) return;

  const plantingDate = new Date(plantingDateVal);
  
  // Calculate total days based on climate offset
  let durationMod = 1.0;
  let yieldMod = 0;
  let yieldTrendSign = "+";
  
  if (tempMod === 'hot') {
    durationMod = 0.85; // Faster maturity
    yieldMod = -8; // Slightly decreased yields because of heat stress
    yieldTrendSign = "-";
  } else if (tempMod === 'cold') {
    durationMod = 1.15; // Slower growth
    yieldMod = -4; // Slightly lower yield due to cold delay
    yieldTrendSign = "-";
  } else {
    durationMod = 1.0;
    yieldMod = 4; // Optimized normal cycle yields
    yieldTrendSign = "+";
  }

  // Render yield outputs
  const yieldBase = profile.yieldPerHectare;
  const finalYield = (yieldBase * (1 + yieldMod / 100)).toFixed(2);
  document.getElementById("yf-yield").innerHTML = `${finalYield} Tons/Hectare <span class="yield-trend-up ${yieldTrendSign === '-' ? 'warning' : 'green'}"><i class="fa-solid fa-arrow-trend-${yieldTrendSign === '-' ? 'down' : 'up'}"></i> ${yieldTrendSign}${Math.abs(yieldMod)}%</span>`;

  // Calculate timelines
  const stages = profile.stages;
  let totalDays = 0;
  
  // Precalculate durations of each stage dynamically
  const stageDurationList = stages.map((st, index) => {
    let baseDays = 15;
    if (st.days.includes("-")) {
      const parts = st.days.split("-");
      baseDays = parseInt(parts[1]) - parseInt(parts[0]);
    } else {
      baseDays = 30; // default for last open stage
    }
    return Math.round(baseDays * durationMod);
  });

  const cumulativeStages = [];
  let currentAccum = 0;
  
  stages.forEach((st, idx) => {
    const daysInStage = stageDurationList[idx];
    cumulativeStages.push({
      name: st.name,
      start: currentAccum,
      end: currentAccum + daysInStage,
      desc: st.desc,
      todos: st.todos
    });
    currentAccum += daysInStage;
  });

  totalDays = currentAccum;

  // Calculate harvest dates
  const harvestStartDate = new Date(plantingDate);
  harvestStartDate.setDate(plantingDate.getDate() + (totalDays - Math.round(10 * durationMod)));
  const harvestEndDate = new Date(plantingDate);
  harvestEndDate.setDate(plantingDate.getDate() + totalDays);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const startFmt = `${months[harvestStartDate.getMonth()]} ${harvestStartDate.getDate()}`;
  const endFmt = `${months[harvestEndDate.getMonth()]} ${harvestEndDate.getDate()}, ${harvestEndDate.getFullYear()}`;
  document.getElementById("yf-window").textContent = `${startFmt} - ${endFmt}`;

  // Current stage simulation
  // We mock a growth progress of 50 days (based on normal schedule)
  const currentSimDays = 50;
  document.getElementById("days-since-planting").textContent = `Currently: Day ${currentSimDays} since planting`;

  // Draw timeline nodes
  const stagesWrapper = document.getElementById("stages-wrapper");
  stagesWrapper.innerHTML = "";

  // Connector progress bar width
  const connectorProgress = document.createElement("div");
  connectorProgress.className = "timeline-connector-progress";
  
  // Find current stage
  let activeStageIndex = 0;
  cumulativeStages.forEach((cSt, idx) => {
    if (currentSimDays >= cSt.start && currentSimDays <= cSt.end) {
      activeStageIndex = idx;
    }
  });
  if (currentSimDays > totalDays) activeStageIndex = cumulativeStages.length - 1;

  // Percent width logic
  const progressPercent = Math.min(100, Math.round((currentSimDays / totalDays) * 100));
  connectorProgress.style.width = `${progressPercent}%`;
  stagesWrapper.appendChild(connectorProgress);

  cumulativeStages.forEach((cSt, idx) => {
    const node = document.createElement("div");
    node.className = "timeline-stage-node";
    
    if (idx < activeStageIndex) {
      node.classList.add("completed");
    } else if (idx === activeStageIndex) {
      node.classList.add("current");
    }

    node.innerHTML = `
      <div class="node-dot">
        <i class="fa-solid ${idx < activeStageIndex ? 'fa-check' : 'fa-seedling'}"></i>
      </div>
      <span class="node-title">${cSt.name}</span>
      <span class="node-duration">Day ${cSt.start}-${cSt.end}</span>
    `;

    // Click handler to display stage details
    node.addEventListener("click", () => {
      // Deactivate current selection styles
      document.querySelectorAll(".timeline-stage-node").forEach(n => n.classList.remove("selected-active"));
      node.classList.add("selected-active");
      
      // Update details card
      document.getElementById("stage-title").textContent = `Stage ${idx + 1}: ${cSt.name} (Days ${cSt.start} - ${cSt.end})`;
      document.getElementById("stage-desc").textContent = cSt.desc;

      const todoList = document.getElementById("stage-todos-list");
      todoList.innerHTML = "";
      cSt.todos.forEach((todo, tIdx) => {
        const li = document.createElement("li");
        li.innerHTML = `<i class="fa-regular ${tIdx === 0 && idx <= activeStageIndex ? 'fa-square-check text-green' : 'fa-square'}"></i> ${todo}`;
        todoList.appendChild(li);
      });
    });

    stagesWrapper.appendChild(node);
  });

  // Display current active stage details by default
  const defaultStage = cumulativeStages[activeStageIndex];
  document.getElementById("stage-title").textContent = `Stage ${activeStageIndex + 1}: ${defaultStage.name} (Days ${defaultStage.start} - ${defaultStage.end})`;
  document.getElementById("stage-desc").textContent = defaultStage.desc;
  
  const todoList = document.getElementById("stage-todos-list");
  todoList.innerHTML = "";
  defaultStage.todos.forEach((todo, tIdx) => {
    const li = document.createElement("li");
    li.innerHTML = `<i class="fa-regular fa-square"></i> ${todo}`;
    todoList.appendChild(li);
  });
}

// ================= NDVI SATELLITE MAP =================
function renderSatelliteMapGrid() {
  const mapGrid = document.getElementById("satellite-map-grid");
  if (!mapGrid) return;
  mapGrid.innerHTML = "";

  FIELD_ZONES.forEach(field => {
    const cell = document.createElement("div");
    cell.className = `map-field-cell`;
    if (field.id === currentSelectedField.id) {
      cell.classList.add("selected");
    }

    // Set spectral background colors depending on NDVI value
    // 0.0 - 0.4: red-orange
    // 0.4 - 0.7: orange-yellow-lightgreen
    // 0.7 - 1.0: deep green
    let bgColor = "linear-gradient(135deg, #ef4444, #b91c1c)"; // low NDVI
    if (field.ndvi > 0.7) {
      bgColor = "linear-gradient(135deg, #10b981, #047857)";
    } else if (field.ndvi > 0.5) {
      bgColor = "linear-gradient(135deg, #fbbf24, #b45309)";
    } else if (field.ndvi > 0.3) {
      bgColor = "linear-gradient(135deg, #f97316, #c2410c)";
    }

    cell.style.background = bgColor;
    cell.innerHTML = `
      <span>${field.id}</span>
      <span class="cell-ndvi-label">NDVI ${field.ndvi}</span>
    `;

    cell.addEventListener("click", () => {
      // Select cell
      document.querySelectorAll(".map-field-cell").forEach(c => c.classList.remove("selected"));
      cell.classList.add("selected");
      
      selectFieldSegment(field);
    });

    mapGrid.appendChild(cell);
  });

  // Load default field details
  selectFieldSegment(FIELD_ZONES[0]);
}

function selectFieldSegment(field) {
  currentSelectedField = field;
  document.getElementById("active-field-name").textContent = `Field Zone: ${field.id}`;
  document.getElementById("field-crop").textContent = CROP_PROFILES[field.crop].name;
  document.getElementById("field-ndvi").textContent = field.ndvi;
  document.getElementById("field-size").textContent = `${field.size} Hectares`;
  document.getElementById("field-temp").textContent = `${field.temp} °C`;

  // Draw recommendations list
  const list = document.getElementById("field-recs-list");
  list.innerHTML = "";
  
  if (field.ndvi < 0.4) {
    list.innerHTML += `
      <li><i class="fa-solid fa-triangle-exclamation text-yellow"></i> <strong>Critical Crop Stress</strong>: Immediate irrigation and nutrient checking required.</li>
      <li><i class="fa-solid fa-chevron-right text-green"></i> Inspect field boundaries for fungal infestations (Early Blight signs).</li>
    `;
    document.getElementById("field-ndvi").className = "fm-val text-yellow";
  } else if (field.ndvi < 0.7) {
    list.innerHTML += `
      <li><i class="fa-solid fa-chevron-right text-green"></i> Crop is experiencing mild water stress. Run drip-irrigation line.</li>
      <li><i class="fa-solid fa-chevron-right text-green"></i> Apply fertilizer split-dosages (Potash) as prescribed.</li>
    `;
    document.getElementById("field-ndvi").className = "fm-val text-amber";
  } else {
    list.innerHTML += `
      <li><i class="fa-solid fa-circle-check text-green"></i> Vegetation canopy shows optimal chlorophyll production.</li>
      <li><i class="fa-solid fa-chevron-right text-green"></i> Continue current water regime schedules.</li>
    `;
    document.getElementById("field-ndvi").className = "fm-val text-green";
  }

  // Update chart data
  updateNDVITrendChartData(field);
}

function initializeNDVITrendChart() {
  const ctx = document.getElementById("ndviTrendChart");
  if (!ctx) return;

  ndviTrendChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4 (Current)"],
      datasets: [{
        label: "NDVI Index",
        data: [0.75, 0.78, 0.81, 0.82],
        borderColor: "rgba(6, 182, 212, 1)",
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#6b7280", font: { size: 9 } } },
        y: {
          min: 0, max: 1,
          grid: { color: "rgba(255, 255, 255, 0.03)" },
          ticks: { color: "#6b7280", font: { size: 9 }, stepSize: 0.25 }
        }
      }
    }
  });
}

function updateNDVITrendChartData(field) {
  if (!ndviTrendChartInstance) return;

  // Mock historic NDVI trends depending on the current NDVI
  const finalVal = field.ndvi;
  const val3 = finalVal * 0.95;
  const val2 = finalVal * 0.9;
  const val1 = finalVal * 0.82;

  ndviTrendChartInstance.data.datasets[0].data = [
    parseFloat(val1.toFixed(2)),
    parseFloat(val2.toFixed(2)),
    parseFloat(val3.toFixed(2)),
    finalVal
  ];

  // Colors depending on index
  if (finalVal < 0.4) {
    ndviTrendChartInstance.data.datasets[0].borderColor = "rgba(239, 68, 68, 1)";
    ndviTrendChartInstance.data.datasets[0].backgroundColor = "rgba(239, 68, 68, 0.1)";
  } else if (finalVal < 0.7) {
    ndviTrendChartInstance.data.datasets[0].borderColor = "rgba(245, 158, 11, 1)";
    ndviTrendChartInstance.data.datasets[0].backgroundColor = "rgba(245, 158, 11, 0.1)";
  } else {
    ndviTrendChartInstance.data.datasets[0].borderColor = "rgba(16, 185, 129, 1)";
    ndviTrendChartInstance.data.datasets[0].backgroundColor = "rgba(16, 185, 129, 0.1)";
  }

  ndviTrendChartInstance.update();
}

// ================= FLOATING AI AGRO-BOT CHAT =================
const BOT_RESPONSES = {
  blight: "Tomato Early Blight is caused by the fungus *Alternaria solani*. To treat it organically: \n1. Apply copper-based organic fungicides every 7–10 days.\n2. Prune bottom leaves (lower 12 inches) to prevent dirt splashing onto foliage.\n3. Water at the base of the plant using drip systems to avoid wetting the leaves. \n\nFor chemical control, use Chlorothalonil or Mancozeb sprays.",
  ph: "The ideal soil pH for wheat is between 6.0 and 7.0. If your pH is below 6.0 (acidic), apply agricultural lime (calcium carbonate). If your pH is above 7.0 (alkaline), apply elemental sulfur to lower it. Keeping the pH balanced ensures wheat roots can absorb crucial Nitrogen and Potassium.",
  harvest: "For corn (maize), the harvest window opens when the kernels reach physiological maturity. Look for these signs:\n1. The outer husks turn dry, papery, and brown.\n2. A small black layer forms at the base of the corn kernels (signaling starch deposit completion).\n3. Grain moisture content drops to 15-20% for storage.",
  default: "I can help with agricultural inquiries. For example, try asking:\n- 'How to treat Tomato Late Blight organically?'\n- 'What is the ideal pH for wheat?'\n- 'When should I harvest corn?'"
};

function sendChatMessage() {
  const inputEl = document.getElementById("chat-user-input");
  const text = inputEl.value.trim();
  if (!text) return;

  // Add User Message
  appendChatMessage(text, "user");
  inputEl.value = "";

  // Play bot typing simulation
  simulateBotResponse(text);
}

function sendQuickPrompt(promptText) {
  appendChatMessage(promptText, "user");
  simulateBotResponse(promptText);
}

function appendChatMessage(text, sender) {
  const container = document.getElementById("chat-messages");
  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-msg ${sender}`;
  
  // Format linebreaks for readable responses
  const formattedText = text.replace(/\n/g, "<br>");
  
  msgDiv.innerHTML = `
    <div class="chat-msg-bubble">
      ${formattedText}
    </div>
  `;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function simulateBotResponse(userText) {
  const container = document.getElementById("chat-messages");
  
  // Create animated typing bubble
  const typingDiv = document.createElement("div");
  typingDiv.className = "chat-msg bot typing-msg";
  typingDiv.innerHTML = `
    <div class="chat-msg-bubble">
      <span class="spinner-custom" style="width: 12px; height: 12px; border-width: 2px; display: inline-block;"></span> 
      <span style="font-size: 0.78rem; margin-left: 0.25rem;">FarmAssist AI is thinking...</span>
    </div>
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;

  // Match query keyword
  let reply = BOT_RESPONSES.default;
  const q = userText.toLowerCase();

  if (q.includes("blight") || q.includes("spot")) {
    reply = BOT_RESPONSES.blight;
  } else if (q.includes("ph") || q.includes("acid") || q.includes("soil")) {
    reply = BOT_RESPONSES.ph;
  } else if (q.includes("harvest") || q.includes("yield") || q.includes("window")) {
    reply = BOT_RESPONSES.harvest;
  }

  // Delay reply to feel authentic
  setTimeout(() => {
    // Remove typing indicator
    typingDiv.remove();
    appendChatMessage(reply, "bot");
  }, 1500);
}
