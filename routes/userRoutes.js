const express = require('express');
const router = express.Router();

const { authCheck, userCheck } = require('../middlewares/authMiddleware');

const user = require('../controllers/userController');

// ========================================================================================================

router.use(authCheck);

router.post('/get-exams', userCheck, user.getExams);
router.post('/get-exam', userCheck, user.getExam);
router.post('/get-result', userCheck, user.getResult);
router.post('/enroll', userCheck, user.enroll);

// ========================================================================================================

module.exports = router;