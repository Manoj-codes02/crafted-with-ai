import { Incident } from '../models/incidentModel.js';

// Haversine formula to compute distance between two coordinates in kilometers
export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

// Check for duplicate incidents in the vicinity (within 1.5 km of the same type)
export const checkDuplicate = async (type, lat, lng) => {
  try {
    const activeIncidents = await Incident.find({ status: { $ne: 'Resolved' } });
    for (const inc of activeIncidents) {
      if (inc.type.toLowerCase() === type.toLowerCase()) {
        const distance = getDistanceKm(lat, lng, inc.latitude, inc.longitude);
        if (distance <= 1.5) {
          return inc._id; // Found duplicate
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error in duplicate check:', error);
    return null;
  }
};

// Main AI Analysis wrapper
export const analyzeReportText = async (text, lat, lng) => {
  const apiKey = process.env.GEMINI_API_KEY;
  let result = {
    type: 'Medical',
    priority: 'Medium',
    priorityScore: 50,
    needs: 'General First Aid',
    sentiment: 'Anxious',
    duplicateOfIncidentId: null
  };

  // 1. Identify category & extract needs using rule-based fallback first
  const normalizedText = text.toLowerCase();
  if (normalizedText.includes('flood') || normalizedText.includes('water') || normalizedText.includes('drown') || normalizedText.includes('overflow')) {
    result.type = 'Flood';
    result.needs = 'Rescue Boats, Life Jackets, Volunteers';
    result.priority = 'High';
    result.priorityScore = 88;
  } else if (normalizedText.includes('fire') || normalizedText.includes('smoke') || normalizedText.includes('burn') || normalizedText.includes('explosion')) {
    result.type = 'Fire';
    result.needs = 'Firefighters, Ambulance, Medical Kits';
    result.priority = 'High';
    result.priorityScore = 95;
  } else if (normalizedText.includes('block') || normalizedText.includes('tree') || normalizedText.includes('landslide') || normalizedText.includes('obstruction') || normalizedText.includes('road closed')) {
    result.type = 'RoadClosed';
    result.needs = 'Chainsaw Crew, Heavy Machinery, Volunteers';
    result.priority = 'Medium';
    result.priorityScore = 60;
  } else if (normalizedText.includes('food') || normalizedText.includes('water') || normalizedText.includes('ration') || normalizedText.includes('hunger') || normalizedText.includes('starve')) {
    result.type = 'Food';
    result.needs = 'Food Packs, Clean Drinking Water';
    result.priority = 'Medium';
    result.priorityScore = 55;
  } else if (normalizedText.includes('shelter') || normalizedText.includes('stay') || normalizedText.includes('homeless') || normalizedText.includes('refugee')) {
    result.type = 'Shelter';
    result.needs = 'Tents, Blankets, Sleeping Mats';
    result.priority = 'Medium';
    result.priorityScore = 50;
  } else if (normalizedText.includes('injury') || normalizedText.includes('heart') || normalizedText.includes('bleed') || normalizedText.includes('die') || normalizedText.includes('medicine') || normalizedText.includes('doctor')) {
    result.type = 'Medical';
    result.needs = 'Ambulance, Doctor, Emergency Medical Kits';
    result.priority = 'High';
    result.priorityScore = 90;
  }

  // Elevate priority scores based on urgent keywords
  if (normalizedText.includes('urgent') || normalizedText.includes('trapped') || normalizedText.includes('kid') || normalizedText.includes('child') || normalizedText.includes('elderly') || normalizedText.includes('dying') || normalizedText.includes('immediate')) {
    result.priority = 'High';
    result.priorityScore = Math.min(100, result.priorityScore + 15);
    result.sentiment = 'Panic';
  }

  // 2. Perform duplicate check
  if (lat && lng) {
    const duplicateId = await checkDuplicate(result.type, parseFloat(lat), parseFloat(lng));
    result.duplicateOfIncidentId = duplicateId;
    if (duplicateId) {
      // If duplicate, lower the priority/needs focus to avoid duplicate dispatching
      result.priorityScore = Math.max(10, result.priorityScore - 30);
    }
  }

  // 3. Attempt Gemini API integration if API Key is available
  if (apiKey && apiKey.trim() !== '') {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analyze the following emergency request text. 
                Classify it into one of these exact categories: 'Flood', 'Fire', 'Medical', 'Food', 'RoadClosed', 'Shelter'.
                Assess its urgency and assign a Priority: 'High', 'Medium', 'Low'.
                Generate a Priority Score between 0 (not urgent) and 100 (life-threatening).
                Detect specific resources needed (e.g. 'Boats', 'Ambulance', 'Food Packs').
                Detect patient/reporter sentiment (e.g. 'Calm', 'Anxious', 'Panic').
                
                Respond ONLY with a valid JSON object matching this schema (do not wrap in markdown or backticks):
                {
                  "type": "Category",
                  "priority": "Priority",
                  "priorityScore": 75,
                  "needs": "comma separated resources",
                  "sentiment": "sentiment text"
                }
                
                Text to analyze: "${text.replace(/"/g, '\\"')}"`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        let rawText = data.candidates[0].content.parts[0].text.trim();
        // Remove markdown tags if any
        if (rawText.startsWith('```json')) {
          rawText = rawText.replace(/```json|```/g, '').trim();
        } else if (rawText.startsWith('```')) {
          rawText = rawText.replace(/```/g, '').trim();
        }
        
        const geminiRes = JSON.parse(rawText);
        result.type = geminiRes.type || result.type;
        result.priority = geminiRes.priority || result.priority;
        result.priorityScore = Number(geminiRes.priorityScore) || result.priorityScore;
        result.needs = geminiRes.needs || result.needs;
        result.sentiment = geminiRes.sentiment || result.sentiment;
      }
    } catch (err) {
      console.error('Gemini API Error, falling back to local heuristic analysis:', err.message);
    }
  }

  return result;
};

// AI Endpoint Handler
export const analyzeIncident = async (req, res) => {
  const { text, latitude, longitude } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'Request body must contain text.' });
  }

  try {
    const analysis = await analyzeReportText(text, latitude, longitude);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Generates a mock summary / status report for PDF exporting
export const generateAISummary = async (req, res) => {
  const { title, description, locationName, type, priority, needs, history } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  let summary = `This report details a ${type} incident titled "${title}" located at ${locationName}. 
  The incident is prioritized as ${priority} with required resources identified as: ${needs}. 
  The incident remains in active coordination.`;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Create a brief professional Situation Summary (2-3 sentences) suitable for a disaster response agency about this incident:
                Title: ${title}
                Category: ${type}
                Priority: ${priority}
                Location: ${locationName}
                Description: ${description}
                Needed Resources: ${needs}
                Timeline Events: ${JSON.stringify(history)}
                
                Keep the summary official, authoritative, and direct. Do not include references to AI, chatbots, or placeholders.`
              }]
            }]
          })
        }
      );
      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        summary = data.candidates[0].content.parts[0].text.trim();
      }
    } catch (err) {
      console.log('Gemini Situation Summary generation error, using fallback:', err.message);
    }
  }

  res.json({ summary });
};

// Mock Social Media Feeds for demonstration
export const getSocialFeed = async (req, res) => {
  const feeds = [
    {
      id: 'tweet-1',
      platform: 'Twitter',
      user: '@Anjali_K',
      text: 'Water logging near Okhla Phase 3. It is rising and entering stores. No rescue teams here yet! Need help.',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      location: 'Okhla Phase 3',
      lat: 28.5410,
      lng: 77.2790
    },
    {
      id: 'fb-1',
      platform: 'Facebook',
      user: 'Rahul Deshmukh',
      text: 'Major fire broke out in the waste dump yard near Noida Sector 62. Heavy black smoke is covering the highway. Visibility is low. Drivers be careful.',
      timestamp: new Date(Date.now() - 1500000).toISOString(),
      location: 'Noida Sector 62',
      lat: 28.6210,
      lng: 77.3610
    },
    {
      id: 'sms-1',
      platform: 'SMS',
      user: '+919876543210',
      text: 'URGENT: Road blocked due to landslide on bypass. Two cars are stuck under debris. People need first aid immediately.',
      timestamp: new Date(Date.now() - 200000).toISOString(),
      location: 'Dehradun Bypass Link',
      lat: 28.6750,
      lng: 77.2250
    }
  ];

  res.json(feeds);
};
