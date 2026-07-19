const Assessment = require('../models/Assessment');
const EmergencyReport = require('../models/EmergencyReport');

// @desc    Get all assessments for the user
// @route   GET /api/history
// @access  Private
const getAssessmentHistory = async (req, res, next) => {
  try {
    const assessments = await Assessment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a specific assessment
// @route   DELETE /api/history/:id
// @access  Private
const deleteAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!assessment) {
      res.status(404);
      throw new Error('Assessment not found');
    }

    // Delete associated reports
    await EmergencyReport.deleteMany({ assessmentId: req.params.id });

    // Delete assessment
    await assessment.deleteOne();

    res.json({
      success: true,
      message: 'Assessment log deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assessment analytics statistics
// @route   GET /api/history/analytics
// @access  Private
const getAnalyticsData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all user assessments
    const assessments = await Assessment.find({ userId }).sort({ createdAt: 1 });

    // 1. Risk distribution
    const riskDistribution = {
      Low: 0,
      Moderate: 0,
      Critical: 0,
    };

    // 2. Timeline data (last 7 assessments)
    const timeline = assessments.map((item) => ({
      date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      painLevel: item.painLevel,
      riskLevel: item.riskLevel,
    })).slice(-7);

    // 3. Chronic disease count (for demographic charts)
    const severityCount = {
      Low: 0,
      Moderate: 0,
      Critical: 0,
    };

    let totalPain = 0;
    
    assessments.forEach((item) => {
      if (riskDistribution[item.riskLevel] !== undefined) {
        riskDistribution[item.riskLevel]++;
        severityCount[item.riskLevel]++;
      }
      totalPain += item.painLevel;
    });

    const averagePain = assessments.length > 0 ? (totalPain / assessments.length).toFixed(1) : 0;

    // 4. Group by symptom category (common symptoms)
    const symptomKeywords = {
      chest: 'Cardiac/Chest',
      breath: 'Respiratory',
      head: 'Neurological/Headache',
      stomach: 'Gastrointestinal',
      abdominal: 'Gastrointestinal',
      burn: 'Burns',
      wound: 'Trauma/Wounds',
      fever: 'Fever/Infection',
      pain: 'General Pain',
    };

    const symptomCategories = {};
    assessments.forEach((item) => {
      const symText = item.symptoms.toLowerCase();
      let matched = false;

      for (const [keyword, category] of Object.entries(symptomKeywords)) {
        if (symText.includes(keyword)) {
          symptomCategories[category] = (symptomCategories[category] || 0) + 1;
          matched = true;
          break;
        }
      }

      if (!matched) {
        symptomCategories['Other'] = (symptomCategories['Other'] || 0) + 1;
      }
    });

    const symptomChartData = Object.keys(symptomCategories).map((key) => ({
      name: key,
      value: symptomCategories[key],
    }));

    res.json({
      success: true,
      data: {
        totalAssessments: assessments.length,
        averagePain: parseFloat(averagePain),
        riskDistribution: [
          { name: 'Low Risk', value: riskDistribution.Low, color: '#22c55e' },
          { name: 'Moderate Risk', value: riskDistribution.Moderate, color: '#f59e0b' },
          { name: 'Critical Risk', value: riskDistribution.Critical, color: '#ef4444' },
        ],
        timeline,
        symptomChartData,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssessmentHistory,
  deleteAssessment,
  getAnalyticsData,
};
