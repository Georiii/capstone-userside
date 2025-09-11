const express = require('express');
const jwt = require('jsonwebtoken');
const Report = require('../models/Report');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/database');

const router = express.Router();

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid token.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// POST /api/report - Submit a user report
router.post('/', auth, async (req, res) => {
  try {
    console.log('Report submission request body:', req.body);
    console.log('Report submission headers:', req.headers);
    
    const { reportedUserId, reason, evidencePhotos } = req.body;
    const reporterId = req.userId;

    console.log('Parsed data:', { reportedUserId, reason, evidencePhotos, reporterId });

    if (!reportedUserId || !reason) {
      console.log('Missing required fields:', { reportedUserId, reason });
      return res.status(400).json({ message: 'reportedUserId and reason are required.' });
    }

    // Check if reported user exists
    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({ message: 'Reported user not found.' });
    }

    // Check if user is trying to report themselves
    if (reporterId === reportedUserId) {
      return res.status(400).json({ message: 'You cannot report yourself.' });
    }

    // Check if this user has already reported the same user
    const existingReport = await Report.findOne({
      reporterId,
      reportedUserId,
      status: { $in: ['pending', 'reviewed'] }
    });

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this user.' });
    }

    const report = new Report({
      reporterId,
      reportedUserId,
      reason,
      evidencePhotos: evidencePhotos || [],
      timestamp: new Date(),
      status: 'pending'
    });

    await report.save();

    // Populate reporter and reported user info for response
    await report.populate('reporterId', 'name email');
    await report.populate('reportedUserId', 'name email');

    res.status(201).json({ 
      message: 'Report submitted successfully.', 
      report: report 
    });
  } catch (err) {
    console.error('Error submitting report:', err);
    res.status(500).json({ message: 'Failed to submit report.', error: err.message });
  }
});

// GET /api/report/list - Get all reports (admin only)
router.get('/list', auth, async (req, res) => {
  try {
    // Check if user is admin (you might want to add admin role check here)
    const reports = await Report.find()
      .populate('reporterId', 'name email')
      .populate('reportedUserId', 'name email')
      .sort({ timestamp: -1 });

    res.json({ reports });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Failed to fetch reports.', error: err.message });
  }
});

// PUT /api/report/:id/restrict - Restrict a user account (admin only)
router.put('/:id/restrict', auth, async (req, res) => {
  try {
    const { restrictionDuration, restrictionReason } = req.body;
    const reportId = req.params.id;

    if (!restrictionDuration || !restrictionReason) {
      return res.status(400).json({ message: 'restrictionDuration and restrictionReason are required.' });
    }

    // Get the report
    const report = await Report.findById(reportId).populate('reportedUserId');
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    const reportedUser = report.reportedUserId;
    const now = new Date();
    
    // Calculate restriction end date based on duration
    let restrictionEndDate;
    switch (restrictionDuration) {
      case '1 day':
        restrictionEndDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case '10 days':
        restrictionEndDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
        break;
      case '20 days':
        restrictionEndDate = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
        break;
      case '1 month':
        restrictionEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return res.status(400).json({ message: 'Invalid restriction duration.' });
    }

    // Update user account status
    reportedUser.accountStatus = {
      isActive: true,
      isRestricted: true,
      restrictionReason: restrictionReason,
      restrictionStartDate: now,
      restrictionEndDate: restrictionEndDate,
      restrictionDuration: restrictionDuration,
      restrictedBy: req.userId
    };

    await reportedUser.save();

    // Update report status
    report.status = 'resolved';
    report.resolvedAt = now;
    report.adminNotes = `User restricted for ${restrictionDuration}. Reason: ${restrictionReason}`;
    await report.save();

    res.json({ 
      message: 'User account restricted successfully.', 
      restrictionEndDate: restrictionEndDate,
      restrictionDuration: restrictionDuration
    });
  } catch (err) {
    console.error('Error restricting user:', err);
    res.status(500).json({ message: 'Failed to restrict user.', error: err.message });
  }
});

// GET /api/report - Get all reports (admin only)
router.get('/list', auth, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email')
      .populate('reportedUserId', 'name email')
      .sort({ timestamp: -1 });

    res.json({ reports });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Failed to fetch reports.', error: err.message });
  }
});

// PUT /api/report/:reportId/status - Update report status (admin only)
router.put('/:reportId/status', auth, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    if (!status || !['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required.' });
    }

    const updateData = { status };
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      updateData,
      { new: true }
    ).populate('reporterId', 'name email')
     .populate('reportedUserId', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    res.json({ message: 'Report status updated successfully.', report });
  } catch (err) {
    console.error('Error updating report status:', err);
    res.status(500).json({ message: 'Failed to update report status.', error: err.message });
  }
});

// GET /api/report/stats - Get report statistics (admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    res.json({
      stats,
      totalReports,
      pendingReports
    });
  } catch (err) {
    console.error('Error fetching report stats:', err);
    res.status(500).json({ message: 'Failed to fetch report stats.', error: err.message });
  }
});

module.exports = router; 