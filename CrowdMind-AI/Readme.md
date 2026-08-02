# CrowdMind AI

**Disaster Intelligence & Emergency Response Platform**

![CrowdMind AI Platform](frontend\src\assets\screenshot.png)

CrowdMind AI aggregates chaotic disaster reports from public feeds, social media streams, and SMS reports. It utilizes advanced artificial intelligence and Operations Research to filter duplicates, prioritize incidents, and recommend optimized resource routing for command centers and rescue teams.

## Platform Features

- **Active Operations Console**: A centralized dashboard providing a real-time overview of disaster zones, active emergencies, and response efforts.
- **Optimization Solver**: AI-driven operations research integration to optimize route vectors and ensure the most effective distribution of medical supplies, personnel, and field ambulances.
- **Automated Situation Reports**: Intelligent generation of comprehensive, real-time situation reports based on incoming data streams to maintain high situational awareness.
- **Social Media Triage**: NLP-powered analysis of social media feeds designed to detect distress signals, assess severity levels, and pinpoint critical locations.
- **Role-Based Command Center**: Secure, tiered access control designed for Government agencies, NGO Organizations, Rescue Teams, Fire Departments, Police Command, and Volunteer Corps.

## Technology Stack

**Frontend Architecture**
- React 19
- Vite
- Tailwind CSS
- React Router

**Backend Architecture**
- Node.js
- Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for secure authentication
- Bcrypt.js for cryptographic password hashing

## Project Structure

```text
crowdmind-ai/
├── backend/               # Node.js Express server
│   ├── controllers/       # Route logic and request handling
│   ├── routes/            # API endpoints definition
│   └── package.json       # Backend dependencies
├── frontend/              # React Vite client application
│   ├── src/
│   │   ├── pages/         # React components for pages
│   │   ├── utils/         # Helper functions (API handlers)
│   │   └── main.jsx       # React application entry point
│   ├── README.md          # Frontend specific documentation
│   └── package.json       # Frontend dependencies
└── README.md              # Project root documentation
```

## Setup and Installation

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)

### Backend Initialization
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and configure the environment variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the backend service:
   ```bash
   npm run dev
   ```

### Frontend Initialization
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing

Contributions are welcomed. Please follow the standard pull request process. For major architectural changes, please open an issue first to discuss your proposed modifications.

## License

This software is released under the MIT License. Please refer to the LICENSE file for additional details.
