const router = require('express').Router();
const { createComplaint, getMyComplaints, getAllComplaints, updateComplaintStatus } = require('../controllers/complaintController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { ROLES } = require('../constants/roles');

router.use(authenticateToken);

router.post('/', createComplaint);
router.get('/my-complaints', getMyComplaints);

// Staff and Admin routes
router.get('/', authorizeRoles(ROLES.STAFF, ROLES.ADMIN), getAllComplaints);
router.put('/:id/status', authorizeRoles(ROLES.STAFF, ROLES.ADMIN), updateComplaintStatus);

module.exports = router;
