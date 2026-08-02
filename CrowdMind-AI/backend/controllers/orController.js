import { Incident } from '../models/incidentModel.js';
import { Resource } from '../models/resourceModel.js';
import { getDistanceKm } from './aiController.js';

// Compatibility table between incident types and resource types
const COMPATIBILITY_MAP = {
  'Flood': ['Boat', 'Volunteer', 'Helicopter'],
  'Fire': ['Ambulance', 'Volunteer', 'Helicopter'],
  'Medical': ['Ambulance', 'Helicopter', 'Volunteer'],
  'Food': ['FoodPack', 'Volunteer'],
  'Shelter': ['Volunteer', 'FoodPack'],
  'RoadClosed': ['Volunteer']
};

export const getOptimizedAllocation = async (req, res) => {
  try {
    // 1. Fetch pending incidents and sort by priorityScore (highest first) - Priority Queue
    const pendingIncidents = await Incident.find({ status: 'Pending' });
    const sortedIncidents = pendingIncidents.sort((a, b) => b.priorityScore - a.priorityScore);

    // 2. Fetch available resources
    const availableResources = await Resource.find({ status: 'Available' });

    const allocations = [];
    const matchedResources = new Set();
    let totalOptimizedDistance = 0;

    // Average travel speeds in km/h
    const SPEED_MAP = {
      'Ambulance': 50,
      'Boat': 25,
      'Helicopter': 120,
      'Volunteer': 30
    };

    // 3. Match incidents with resources using Greedy Priority Allocation
    for (const incident of sortedIncidents) {
      const compatibleResourceTypes = COMPATIBILITY_MAP[incident.type] || ['Volunteer'];
      
      let bestMatch = null;
      let minDistance = Infinity;

      // Find closest compatible available resource
      for (const resource of availableResources) {
        if (matchedResources.has(resource._id) || matchedResources.has(resource.id)) continue;
        
        if (compatibleResourceTypes.includes(resource.type)) {
          const dist = getDistanceKm(
            incident.latitude,
            incident.longitude,
            resource.currentLatitude,
            resource.currentLongitude
          );
          
          if (dist < minDistance) {
            minDistance = dist;
            bestMatch = resource;
          }
        }
      }

      // If a resource was matched, allocate it
      if (bestMatch) {
        const speed = SPEED_MAP[bestMatch.type] || 30; // default 30 km/h
        const estTimeMinutes = Math.round((minDistance / speed) * 60);

        allocations.push({
          incidentId: incident._id || incident.id,
          incidentTitle: incident.title,
          incidentType: incident.type,
          incidentPriority: incident.priority,
          incidentPriorityScore: incident.priorityScore,
          incidentLocation: { lat: incident.latitude, lng: incident.longitude, name: incident.locationName },
          resourceId: bestMatch._id || bestMatch.id,
          resourceIdentifier: bestMatch.identifier,
          resourceType: bestMatch.type,
          resourceLocation: { lat: bestMatch.currentLatitude, lng: bestMatch.currentLongitude },
          distanceKm: parseFloat(minDistance.toFixed(2)),
          estTimeMinutes: estTimeMinutes,
          routeLine: [
            [bestMatch.currentLatitude, bestMatch.currentLongitude],
            [incident.latitude, incident.longitude]
          ]
        });

        matchedResources.add(bestMatch._id || bestMatch.id);
        totalOptimizedDistance += minDistance;
      }
    }

    // 4. Calculate performance stats
    const totalIncidents = pendingIncidents.length;
    const allocatedCount = allocations.length;
    const unallocatedCount = totalIncidents - allocatedCount;
    const avgResponseTime = allocatedCount > 0 
      ? Math.round(allocations.reduce((sum, item) => sum + item.estTimeMinutes, 0) / allocatedCount) 
      : 0;

    res.json({
      success: true,
      allocations,
      stats: {
        totalPendingIncidents: totalIncidents,
        allocatedResourcesCount: allocatedCount,
        unallocatedIncidentsCount: unallocatedCount,
        totalAvailableResources: availableResources.length,
        remainingResourcesCount: availableResources.length - allocatedCount,
        totalOptimizedDistanceKm: parseFloat(totalOptimizedDistance.toFixed(2)),
        avgEstResponseTimeMinutes: avgResponseTime,
        resourceUtilizationPercent: availableResources.length > 0 
          ? Math.round((allocatedCount / availableResources.length) * 100) 
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: `Server error during optimization: ${error.message}` });
  }
};

// Dispatches suggested OR allocations automatically in database
export const dispatchAllocations = async (req, res) => {
  const { allocations } = req.body;

  if (!allocations || !Array.isArray(allocations)) {
    return res.status(400).json({ message: 'Allocations list is required' });
  }

  try {
    for (const alloc of allocations) {
      // 1. Update incident status to 'Dispatched' and push resource
      await Incident.findByIdAndUpdate(alloc.incidentId, {
        status: 'Dispatched',
        $addToSet: { assignedResources: alloc.resourceId }
      });

      // 2. Update resource status to 'Deployed' and link incident
      await Resource.findByIdAndUpdate(alloc.resourceId, {
        status: 'Deployed',
        assignedIncidentId: alloc.incidentId
      });
    }

    res.json({ success: true, message: 'Resource dispatches successfully executed.' });
  } catch (error) {
    res.status(500).json({ message: `Server error executing dispatch: ${error.message}` });
  }
};
