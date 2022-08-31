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

router.post('/get-messages', adminCheck, admin.getMessages);
router.post('/toggle-message-resolve', adminCheck, admin.toggleMessageResolve);
router.post('/delete-message', adminCheck, admin.deleteMessage);

router.post('/get-payments', adminCheck, admin.getPayments);
router.post('/get-pending-payments', adminCheck, admin.getPendingPayments);
router.post('/reject-payment', adminCheck, admin.rejectPayment);
router.post('/approve-payment', adminCheck, admin.approvePayment);

router.post('/search-exams', adminCheck, admin.searchExams);

// ========================================================================================================

module.exports = router;