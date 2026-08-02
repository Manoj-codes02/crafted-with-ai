import { Resource } from '../models/resourceModel.js';

export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export const createResource = async (req, res) => {
  const { type, identifier, status, currentLatitude, currentLongitude, capacity } = req.body;

  try {
    if (!type || !identifier || currentLatitude === undefined || currentLongitude === undefined) {
      return res.status(400).json({ message: 'Type, identifier, and coordinates are required.' });
    }

    const exists = await Resource.findOne({ identifier });
    if (exists) {
      return res.status(400).json({ message: `Resource with identifier ${identifier} already exists.` });
    }

    const newResource = await Resource.create({
      type,
      identifier,
      status: status || 'Available',
      currentLatitude: parseFloat(currentLatitude),
      currentLongitude: parseFloat(currentLongitude),
      capacity: capacity || 1,
      assignedIncidentId: null
    });

    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export const updateResource = async (req, res) => {
  try {
    const { status, currentLatitude, currentLongitude, assignedIncidentId, capacity } = req.body;

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const updated = await Resource.findByIdAndUpdate(req.params.id, {
      status: status !== undefined ? status : resource.status,
      currentLatitude: currentLatitude !== undefined ? parseFloat(currentLatitude) : resource.currentLatitude,
      currentLongitude: currentLongitude !== undefined ? parseFloat(currentLongitude) : resource.currentLongitude,
      assignedIncidentId: assignedIncidentId !== undefined ? assignedIncidentId : resource.assignedIncidentId,
      capacity: capacity !== undefined ? parseInt(capacity) : resource.capacity
    }, { new: true });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource removed successfully' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};
