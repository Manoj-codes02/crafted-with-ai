import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { checkIsMock, MockModel } from '../config/db.js';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'RescueTeam', 'Volunteer', 'Viewer'], default: 'Viewer' },
  agency: { type: String },
}, { timestamps: true });

let UserModel;
try {
  UserModel = mongoose.model('User');
} catch (e) {
  UserModel = mongoose.model('User', userSchema);
}

// Pre-hashed passwords for test accounts ("admin123", "rescue123", "volunteer123", "viewer123")
const salt = bcrypt.genSaltSync(10);
const adminHash = bcrypt.hashSync('admin123', salt);
const rescueHash = bcrypt.hashSync('rescue123', salt);
const volunteerHash = bcrypt.hashSync('volunteer123', salt);
const viewerHash = bcrypt.hashSync('viewer123', salt);

const mockUserDb = new MockModel('User', [
  {
    _id: 'usr-admin',
    email: 'admin@crowdmind.ai',
    password: adminHash,
    name: 'Director Rajesh Kumar',
    role: 'Admin',
    agency: 'National Disaster Response Force (NDRF)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'usr-rescue',
    email: 'rescue@crowdmind.ai',
    password: rescueHash,
    name: 'Commander Sarah Jenkins',
    role: 'RescueTeam',
    agency: 'City Fire & Rescue Services',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'usr-volunteer',
    email: 'volunteer@crowdmind.ai',
    password: volunteerHash,
    name: 'Amit Patel',
    role: 'Volunteer',
    agency: 'Red Cross Volunteers',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'usr-viewer',
    email: 'viewer@crowdmind.ai',
    password: viewerHash,
    name: 'Media Representative',
    role: 'Viewer',
    agency: 'Independent Press',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]);

export const User = {
  find: (query) => checkIsMock() ? mockUserDb.find(query) : UserModel.find(query),
  findOne: (query) => checkIsMock() ? mockUserDb.findOne(query) : UserModel.findOne(query),
  findById: (id) => checkIsMock() ? mockUserDb.findById(id) : UserModel.findById(id),
  create: (doc) => checkIsMock() ? mockUserDb.create(doc) : UserModel.create(doc),
  findByIdAndUpdate: (id, update, opts) => checkIsMock() ? mockUserDb.findByIdAndUpdate(id, update, opts) : UserModel.findByIdAndUpdate(id, update, opts),
  findByIdAndDelete: (id) => checkIsMock() ? mockUserDb.findByIdAndDelete(id) : UserModel.findByIdAndDelete(id),
  countDocuments: (query) => checkIsMock() ? mockUserDb.countDocuments(query) : UserModel.countDocuments(query),
};
export default User;
