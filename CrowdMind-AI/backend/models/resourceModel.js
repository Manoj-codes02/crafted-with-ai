import mongoose from 'mongoose';
import { checkIsMock, MockModel } from '../config/db.js';

const resourceSchema = new mongoose.Schema({
  type: { type: String, enum: ['Ambulance', 'Boat', 'Helicopter', 'MedicalKit', 'FoodPack', 'Volunteer'], required: true },
  identifier: { type: String, required: true, unique: true },
  status: { type: String, enum: ['Available', 'Deployed', 'Maintenance'], default: 'Available' },
  currentLatitude: { type: Number, required: true },
  currentLongitude: { type: Number, required: true },
  assignedIncidentId: { type: String, default: null },
  capacity: { type: Number, default: 1 } // e.g. capacity for carrying passengers, or resource quantity
}, { timestamps: true });

let ResourceModel;
try {
  ResourceModel = mongoose.model('Resource');
} catch (e) {
  ResourceModel = mongoose.model('Resource', resourceSchema);
}

const mockResources = [
  {
    _id: 'res-amb-01',
    type: 'Ambulance',
    identifier: 'AMB-DELHI-01',
    status: 'Deployed',
    currentLatitude: 28.6304,
    currentLongitude: 77.2177,
    assignedIncidentId: 'inc-02',
    capacity: 2
  },
  {
    _id: 'res-amb-02',
    type: 'Ambulance',
    identifier: 'AMB-DELHI-02',
    status: 'Available',
    currentLatitude: 28.6012,
    currentLongitude: 77.2201,
    assignedIncidentId: null,
    capacity: 2
  },
  {
    _id: 'res-amb-03',
    type: 'Ambulance',
    identifier: 'AMB-DELHI-03',
    status: 'Available',
    currentLatitude: 28.5620,
    currentLongitude: 77.1950,
    assignedIncidentId: null,
    capacity: 2
  },
  {
    _id: 'res-boat-01',
    type: 'Boat',
    identifier: 'BOAT-YAMUNA-01',
    status: 'Available',
    currentLatitude: 28.6180,
    currentLongitude: 77.2510,
    assignedIncidentId: null,
    capacity: 8
  },
  {
    _id: 'res-boat-02',
    type: 'Boat',
    identifier: 'BOAT-YAMUNA-02',
    status: 'Available',
    currentLatitude: 28.6320,
    currentLongitude: 77.2590,
    assignedIncidentId: null,
    capacity: 8
  },
  {
    _id: 'res-heli-01',
    type: 'Helicopter',
    identifier: 'HELI-AIRBASE-01',
    status: 'Available',
    currentLatitude: 28.5800,
    currentLongitude: 77.1200, // Safdarjung/Hindan area airbase
    assignedIncidentId: null,
    capacity: 12
  },
  {
    _id: 'res-med-01',
    type: 'MedicalKit',
    identifier: 'MEDKIT-WH-A',
    status: 'Available',
    currentLatitude: 28.5520,
    currentLongitude: 77.2680,
    assignedIncidentId: null,
    capacity: 50 // 50 kits available at warehouse
  },
  {
    _id: 'res-food-01',
    type: 'FoodPack',
    identifier: 'FOOD-SHELTER-HUB',
    status: 'Available',
    currentLatitude: 28.5490,
    currentLongitude: 77.2510,
    assignedIncidentId: null,
    capacity: 250 // 250 packs available
  },
  {
    _id: 'res-vol-01',
    type: 'Volunteer',
    identifier: 'VOLUNTEER-GROUP-A',
    status: 'Available',
    currentLatitude: 28.6100,
    currentLongitude: 77.2250,
    assignedIncidentId: null,
    capacity: 15 // 15 volunteers in this group
  }
];

const mockResourceDb = new MockModel('Resource', mockResources);

export const Resource = {
  find: (query) => checkIsMock() ? mockResourceDb.find(query) : ResourceModel.find(query),
  findOne: (query) => checkIsMock() ? mockResourceDb.findOne(query) : ResourceModel.findOne(query),
  findById: (id) => checkIsMock() ? mockResourceDb.findById(id) : ResourceModel.findById(id),
  create: (doc) => checkIsMock() ? mockResourceDb.create(doc) : ResourceModel.create(doc),
  findByIdAndUpdate: (id, update, opts) => checkIsMock() ? mockResourceDb.findByIdAndUpdate(id, update, opts) : ResourceModel.findByIdAndUpdate(id, update, opts),
  findByIdAndDelete: (id) => checkIsMock() ? mockResourceDb.findByIdAndDelete(id) : ResourceModel.findByIdAndDelete(id),
  countDocuments: (query) => checkIsMock() ? mockResourceDb.countDocuments(query) : ResourceModel.countDocuments(query),
};
export default Resource;
