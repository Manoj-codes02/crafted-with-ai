const fs = require('fs');
const path = require('path');
const Assessment = require('../models/Assessment');
const MedicalProfile = require('../models/MedicalProfile');
const EmergencyReport = require('../models/EmergencyReport');
const { generateEmergencyReportPdf } = require('../services/pdfService');

// @desc    Generate and save a PDF report for an assessment
// @route   POST /api/reports/generate/:assessmentId
// @access  Private
const createReport = async (req, res, next) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findOne({
      _id: assessmentId,
      userId: req.user._id,
    });

    if (!assessment) {
      res.status(404);
      throw new Error('Assessment not found');
    }

    const medicalProfile = await MedicalProfile.findOne({ userId: req.user._id });
    
    // Ensure reports directory exists
    const reportsDir = path.join(__dirname, '../uploads/reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportName = `resqai-report-${assessmentId}-${Date.now()}.pdf`;
    const outputPath = path.join(reportsDir, reportName);

    // Call PDF generation service
    await generateEmergencyReportPdf(assessment, medicalProfile, req.user, outputPath);

    // Create Report Entry in DB
    const report = await EmergencyReport.create({
      userId: req.user._id,
      assessmentId: assessment._id,
      reportName: reportName,
      pdfPath: `/uploads/reports/${reportName}`,
    });

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's reports list
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res, next) => {
  try {
    const reports = await EmergencyReport.find({ userId: req.user._id })
      .populate('assessmentId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download PDF report file
// @route   GET /api/reports/download/:id
// @access  Private
const downloadReportPdf = async (req, res, next) => {
  try {
    const report = await EmergencyReport.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!report) {
      res.status(404);
      throw new Error('Report not found');
    }

    const reportsDir = path.join(__dirname, '../uploads/reports');
    const filePath = path.join(reportsDir, report.reportName);

    if (!fs.existsSync(filePath)) {
      res.status(404);
      throw new Error('Report file does not exist on disk');
    }

    res.download(filePath, `ResQAI-Emergency-Report-${report._id}.pdf`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  downloadReportPdf,
};
