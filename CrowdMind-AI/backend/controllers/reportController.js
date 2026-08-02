import { Report } from '../models/reportModel.js';
import { User } from '../models/userModel.js';

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export const createReport = async (req, res) => {
  const { title, aiSummary, caseHistory } = req.body;

  try {
    if (!title || !aiSummary) {
      return res.status(400).json({ message: 'Title and AI Summary are required.' });
    }

    const createdByUserId = req.user ? req.user.id : 'usr-admin'; // Fallback to admin if request auth isn't fully set
    
    // Fetch user name
    const user = await User.findById(createdByUserId);
    const creatorName = user ? user.name : 'System Admin';

    // Build initial history item if not provided
    const history = caseHistory || [
      {
        timestamp: new Date().toISOString(),
        status: 'Report Created',
        description: `Official Situation Report compiled by ${creatorName}.`,
        updatedBy: creatorName
      }
    ];

    const newReport = await Report.create({
      title,
      aiSummary,
      createdByUserId,
      caseHistory: history,
      createdDate: new Date().toISOString()
    });

    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export const updateReport = async (req, res) => {
  try {
    const { title, aiSummary, caseHistory } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const updated = await Report.findByIdAndUpdate(req.params.id, {
      title: title !== undefined ? title : report.title,
      aiSummary: aiSummary !== undefined ? aiSummary : report.aiSummary,
      caseHistory: caseHistory !== undefined ? caseHistory : report.caseHistory
    }, { new: true });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};
