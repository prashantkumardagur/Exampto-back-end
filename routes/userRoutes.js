const express = require('express');
const router = express.Router();

const { authCheck, userCheck } = require('../middlewares/authMiddleware');

const user = require('../controllers/userController');

// ========================================================================================================

router.use(authCheck);

router.post('/get-exams', userCheck, user.getExams);
router.post('/get-results', userCheck, user.getResults);
router.post('/search-exams', userCheck, user.searchExams);

router.post('/get-practice-exams', userCheck, user.getPracticeExams);

router.post('/get-wallet', userCheck, user.getWallet);

router.post('/get-exam', userCheck, user.getExam);
router.post('/get-result', userCheck, user.getResult);
router.post('/enroll', userCheck, user.enroll);
router.post('/download-solution', userCheck, user.downloadSolution);
router.post('/update-withdraw-details', userCheck, user.updateWithdrawDetails);
router.post('/request-withdraw', userCheck, user.requestWithdraw);

// ========================================================================================================

module.exports = router;