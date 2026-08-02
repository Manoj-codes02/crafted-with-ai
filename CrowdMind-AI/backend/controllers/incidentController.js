import { Incident } from '../models/incidentModel.js';
import { Resource } from '../models/resourceModel.js';
import { analyzeReportText } from './aiController.js';

export const getIncidents = async (req, res) => {
  try {
    const { status, priority, type } = req.query;
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (type) query.type = type;

    const incidents = await Incident.find(query);
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export const createIncident = async (req, res) => {
  const { title, description, locationName, latitude, longitude, source, reporterName } = req.body;

  try {
    if (!description || !locationName || !latitude || !longitude) {
      return res.status(400).json({ message: 'Description, location name, and coordinates (lat/lng) are required.' });
    }

    // Call the AI utility to extract metadata: type, priority, priorityScore, needs, and duplicate check
    const aiAnalysis = await analyzeReportText(description, latitude, longitude);

    const newIncident = await Incident.create({
      title: title || `Reported ${aiAnalysis.type} at ${locationName}`,
      description,
      locationName,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      type: aiAnalysis.type,
      status: 'Pending',
      priority: aiAnalysis.priority,
      priorityScore: aiAnalysis.priorityScore,
      source: source || 'WebReport',
      reporterName: reporterName || 'Anonymous Citizen',
      duplicateOfIncidentId: aiAnalysis.duplicateOfIncidentId,
      needs: aiAnalysis.needs,
      assignedResources: []
    });

    res.status(201).json(newIncident);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export const updateIncident = async (req, res) => {
  try {
    const { title, description, locationName, status, priority, priorityScore, type, needs, assignedResources } = req.body;
    
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const updated = await Incident.findByIdAndUpdate(req.params.id, {
      title: title !== undefined ? title : incident.title,
      description: description !== undefined ? description : incident.description,
      locationName: locationName !== undefined ? locationName : incident.locationName,
      status: status !== undefined ? status : incident.status,
      priority: priority !== undefined ? priority : incident.priority,
      priorityScore: priorityScore !== undefined ? parseFloat(priorityScore) : incident.priorityScore,
      type: type !== undefined ? type : incident.type,
      needs: needs !== undefined ? needs : incident.needs,
      assignedResources: assignedResources !== undefined ? assignedResources : incident.assignedResources
    }, { new: true });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    await Incident.findByIdAndDelete(req.params.id);
    res.json({ message: 'Incident removed successfully' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};
