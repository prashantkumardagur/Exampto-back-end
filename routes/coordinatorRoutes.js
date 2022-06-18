const express = require('express');
const router = express.Router();

const { authCheck, coordinatorCheck } = require('../middlewares/authMiddleware');

const coordinator = require('../controllers/coordinatorController');

// ========================================================================================================

router.use(authCheck);

router.post('/initialize-test', coordinatorCheck, coordinator.initializeTest);
router.post('/get-unpublished-exams', coordinatorCheck, coordinator.getUnpublishedExams);
router.post('/get-all-exams', coordinatorCheck, coordinator.getAllExams);
router.post('/get-exam', coordinatorCheck, coordinator.getExam);
router.post('/declare-result', coordinatorCheck, coordinator.declareResult);

// ========================================================================================================

module.exports = router;