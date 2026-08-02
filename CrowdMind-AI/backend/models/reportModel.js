import mongoose from 'mongoose';
import { checkIsMock, MockModel } from '../config/db.js';

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  aiSummary: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  createdByUserId: { type: String, required: true },
  caseHistory: [{
    timestamp: { type: Date, default: Date.now },
    status: { type: String },
    description: { type: String },
    updatedBy: { type: String }
  }]
}, { timestamps: true });

let ReportModel;
try {
  ReportModel = mongoose.model('Report');
} catch (e) {
  ReportModel = mongoose.model('Report', reportSchema);
}

const mockReports = [
  {
    _id: 'rep-01',
    title: 'Yamuna River Overflow Situation Report',
    aiSummary: 'Continuous heavy monsoon rain has led to an overflow of the Yamuna River bank. Riverside Colony Sector 15 has suffered massive waterlogging with ground floor inundation. Water levels are rising at 2cm/hour. Currently, 30+ houses are affected. Recommendation is to prioritize evacuation via Rescue Boats (BOAT-YAMUNA-01 and BOAT-YAMUNA-02) and establish a medical first-aid hub at the Lajpat Nagar shelter point.',
    createdDate: new Date(Date.now() - 3600000 * 3).toISOString(),
    createdByUserId: 'usr-admin',
    caseHistory: [
      {
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        status: 'Pending',
        description: 'First public reports of waterlogging surfaced via Twitter social streams. AI Engine analyzed and flagged high flood probability (Score 92%).',
        updatedBy: 'AI Engine Parser'
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
        status: 'Pending',
        description: 'Incident verified and logged by Emergency Command Center. Created incident ticket inc-01.',
        updatedBy: 'Director Rajesh Kumar'
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'Dispatched',
        description: 'Deployed local volunteer team VOLUNTEER-GROUP-A to assess ground-level bottlenecks and guide elderly residents.',
        updatedBy: 'Commander Sarah Jenkins'
      }
    ]
  }
];

const mockReportDb = new MockModel('Report', mockReports);

export const Report = {
  find: (query) => checkIsMock() ? mockReportDb.find(query) : ReportModel.find(query),
  findOne: (query) => checkIsMock() ? mockReportDb.findOne(query) : ReportModel.findOne(query),
  findById: (id) => checkIsMock() ? mockReportDb.findById(id) : ReportModel.findById(id),
  create: (doc) => checkIsMock() ? mockReportDb.create(doc) : ReportModel.create(doc),
  findByIdAndUpdate: (id, update, opts) => checkIsMock() ? mockReportDb.findByIdAndUpdate(id, update, opts) : ReportModel.findByIdAndUpdate(id, update, opts),
  findByIdAndDelete: (id) => checkIsMock() ? mockReportDb.findByIdAndDelete(id) : ReportModel.findByIdAndDelete(id),
  countDocuments: (query) => checkIsMock() ? mockReportDb.countDocuments(query) : ReportModel.countDocuments(query),
};
export default Report;
