const express = require('express');
const router = express.Router();
const { createSOS, acceptRequest, getRequests, getRequestById, updateDoctorLocation, updateAmbulanceLocation, updateStatus
} = require('../controllers/requestController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Only logged-in doctors and admins may see all emergencies or act on them
const staffOnly = [protect, requireRole('doctor', 'admin')];

// Public on purpose: an emergency must never be blocked by a login screen,
// and the patient's tracking page reads its own request by id.
router.post('/sos', createSOS);
router.get('/request/:id', getRequestById);

// Staff only
router.get('/requests', staffOnly, getRequests);
router.put('/request/:id', staffOnly, acceptRequest);
router.put('/request/:id/location', staffOnly, updateDoctorLocation);
router.put('/request/:id/ambulance-location', staffOnly, updateAmbulanceLocation);
router.put('/request/:id/status', staffOnly, updateStatus);

module.exports = router;
