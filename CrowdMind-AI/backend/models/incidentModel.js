import mongoose from 'mongoose';
import { checkIsMock, MockModel } from '../config/db.js';

const incidentSchema = new mongoose.Schema({
  type: { type: String, enum: ['Flood', 'Fire', 'Medical', 'Food', 'RoadClosed', 'Shelter'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  locationName: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Dispatched', 'Resolved'], default: 'Pending' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  priorityScore: { type: Number, default: 50 },
  source: { type: String, enum: ['WebReport', 'Twitter', 'Facebook', 'SMS'], default: 'WebReport' },
  reporterName: { type: String, default: 'Anonymous' },
  timestamp: { type: Date, default: Date.now },
  duplicateOfIncidentId: { type: String, default: null },
  needs: { type: String },
  assignedResources: [{ type: String }] // Resource identifiers
}, { timestamps: true });

let IncidentModel;
try {
  IncidentModel = mongoose.model('Incident');
} catch (e) {
  IncidentModel = mongoose.model('Incident', incidentSchema);
}

// Coordinate baseline: New Delhi (Lat: 28.6139, Lng: 77.2090)
const mockIncidents = [
  {
    _id: 'inc-01',
    type: 'Flood',
    title: 'Severe Flooding in Riverside Colony',
    description: 'Water has entered the ground floors of over 30 houses. Elderly residents are stranded on rooftops. Immediate evacuation required.',
    locationName: 'Yamuna River Bank, Sector 15',
    latitude: 28.6250,
    longitude: 77.2400,
    status: 'Pending',
    priority: 'High',
    priorityScore: 92,
    source: 'Twitter',
    reporterName: '@CitizenAlert_Delhi',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    duplicateOfIncidentId: null,
    needs: 'Boats, Volunteers, Food Packs',
    assignedResources: []
  },
  {
    _id: 'inc-02',
    type: 'Fire',
    title: 'Commercial Building Fire',
    description: 'Electrical short circuit caused fire in a 3-story retail building. Smoke is dense. People are reported trapped on the second floor.',
    locationName: 'Connaught Place Outer Circle',
    latitude: 28.6304,
    longitude: 77.2177,
    status: 'Dispatched',
    priority: 'High',
    priorityScore: 98,
    source: 'SMS',
    reporterName: 'Resident Association',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    duplicateOfIncidentId: null,
    needs: 'Ambulance, Firefighters, Medical Kits',
    assignedResources: ['res-amb-01']
  },
  {
    _id: 'inc-03',
    type: 'RoadClosed',
    title: 'Fallen Trees Blocking Main Arterial Road',
    description: 'Storm winds have knocked down two large banyan trees. Traffic is completely backed up. Emergency vehicles cannot pass.',
    locationName: 'Panchsheel Marg near Metro Gate 2',
    latitude: 28.5880,
    longitude: 77.2050,
    status: 'Pending',
    priority: 'Medium',
    priorityScore: 65,
    source: 'WebReport',
    reporterName: 'Traffic Inspector Sharma',
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    duplicateOfIncidentId: null,
    needs: 'Volunteers, Chainsaw Crew',
    assignedResources: []
  },
  {
    _id: 'inc-04',
    type: 'Medical',
    title: 'Stranded Patient Needing Dialysis',
    description: 'An elderly patient needs transport to the hospital for scheduled critical dialysis. Street is flooded with knee-deep water.',
    locationName: 'Lajpat Nagar II, Lane 4',
    latitude: 28.5700,
    longitude: 77.2350,
    status: 'Pending',
    priority: 'High',
    priorityScore: 85,
    source: 'Facebook',
    reporterName: 'Sunita Mehra',
    timestamp: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
    duplicateOfIncidentId: null,
    needs: 'Ambulance, Boat',
    assignedResources: []
  },
  {
    _id: 'inc-05',
    type: 'Food',
    title: 'Resource Shortage at Relief Shelter',
    description: 'The community center shelter housing 200 displaced people is running out of clean drinking water and baby food.',
    locationName: 'Government Secondary School, Okhla',
    latitude: 28.5450,
    longitude: 77.2720,
    status: 'Pending',
    priority: 'Medium',
    priorityScore: 58,
    source: 'WebReport',
    reporterName: 'Shelter Manager Vikas',
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    duplicateOfIncidentId: null,
    needs: 'Food Packs, Volunteers',
    assignedResources: []
  },
  {
    _id: 'inc-06',
    type: 'Medical',
    title: 'Minor Injuries from Roof Collapse',
    description: 'A small brick shed roof collapsed due to heavy rainfall. Two individuals have minor leg injuries and scrapes. Stable but need first aid.',
    locationName: 'Karol Bagh Market Area',
    latitude: 28.6450,
    longitude: 77.1900,
    status: 'Resolved',
    priority: 'Low',
    priorityScore: 35,
    source: 'Twitter',
    reporterName: '@KB_Trader',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    duplicateOfIncidentId: null,
    needs: 'Medical Kits',
    assignedResources: []
  }
];

const mockIncidentDb = new MockModel('Incident', mockIncidents);

export const Incident = {
  find: (query) => checkIsMock() ? mockIncidentDb.find(query) : IncidentModel.find(query),
  findOne: (query) => checkIsMock() ? mockIncidentDb.findOne(query) : IncidentModel.findOne(query),
  findById: (id) => checkIsMock() ? mockIncidentDb.findById(id) : IncidentModel.findById(id),
  create: (doc) => checkIsMock() ? mockIncidentDb.create(doc) : IncidentModel.create(doc),
  findByIdAndUpdate: (id, update, opts) => checkIsMock() ? mockIncidentDb.findByIdAndUpdate(id, update, opts) : IncidentModel.findByIdAndUpdate(id, update, opts),
  findByIdAndDelete: (id) => checkIsMock() ? mockIncidentDb.findByIdAndDelete(id) : IncidentModel.findByIdAndDelete(id),
  countDocuments: (query) => checkIsMock() ? mockIncidentDb.countDocuments(query) : IncidentModel.countDocuments(query),
};
export default Incident;
