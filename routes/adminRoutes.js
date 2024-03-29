const express = require('express');
const router = express.Router();

const { validateNewCoordinatorData, validateNewTransactionData } = require('../validators/adminValidators');
const { authCheck, adminCheck } = require('../middlewares/authMiddleware');

const admin = require('../controllers/adminController');

// ========================================================================================================

router.use(authCheck);

router.post('/get-analytics', adminCheck, admin.getAnalytics);
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
router.post('/change-transaction-email', adminCheck, admin.changeTransactionEmail);
router.post('/add-transaction', adminCheck, validateNewTransactionData, admin.addTransaction);
router.post('/deny-transaction', adminCheck, admin.denyTransaction);

router.post('/search-exams', adminCheck, admin.searchExams);

// ========================================================================================================

module.exports = router;