const express = require('express');
const router = express.Router();

const { authCheck, userCheck } = require('../middlewares/authMiddleware');

const exam = require('../controllers/examController');

const { validateAnswer } = require('../validators/examValidators');

// ========================================================================================================

router.use(authCheck);

router.post('/initialize-exam', userCheck, exam.initializeExam);
router.post('/mark-answer', userCheck, validateAnswer, exam.markAnswer);
router.post('/submit-exam', userCheck, exam.submitExam);

// ========================================================================================================

module.exports = router;