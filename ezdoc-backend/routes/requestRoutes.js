const express = require('express');
const router = express.Router();
const { createSOS, acceptRequest, getRequests, getRequestById, updateDoctorLocation, updateAmbulanceLocation, updateStatus
} = require('../controllers/requestController');

router.post('/sos', createSOS);
router.get('/requests', getRequests);
router.get('/request/:id', getRequestById);
router.put('/request/:id', acceptRequest);
router.put('/request/:id/location', updateDoctorLocation);
router.put('/request/:id/ambulance-location', updateAmbulanceLocation);
router.put('/request/:id/status', updateStatus);

module.exports = router;
