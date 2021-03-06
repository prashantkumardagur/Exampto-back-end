const express = require('express');
const router = express.Router();

const { validateNewCoordinatorData} = require('../validators/adminValidators');
const { authCheck, adminCheck } = require('../middlewares/authMiddleware');

const admin = require('../controllers/adminController');

// ========================================================================================================

router.use(authCheck);

router.post('/get-coordinators', adminCheck, admin.getCoordinators);
router.post('/get-users', adminCheck, admin.getUsers);
router.post('/create-new-coordinator', adminCheck, validateNewCoordinatorData, admin.createNewCoordinator);
router.post('/toggle-ban', adminCheck, admin.toggleBan);

router.post('/search-exams', adminCheck, admin.searchExams);

// ========================================================================================================

module.exports = router;