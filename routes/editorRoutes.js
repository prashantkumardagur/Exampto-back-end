const express = require('express');
const router = express.Router();

const { authCheck, coordinatorCheck } = require('../middlewares/authMiddleware');
const { fileUpload } = require('../middlewares/fileUpload');
const { imageUpload } = require('../middlewares/imageUpload');

const editor = require('../controllers/editorController');

const { validateUpdateExamData, validateNewQuestionData, validateUpdateQuestionData } = require('../validators/editorValidators');

//=======================================================================================

router.use(authCheck);

router.post('/get-exam', coordinatorCheck, editor.getExam);
router.post('/publish-exam', coordinatorCheck, editor.publishExam);
router.post('/update-exam-details', coordinatorCheck, validateUpdateExamData, editor.updateExamDetails);
router.post('/add-question', validateNewQuestionData, coordinatorCheck, editor.addQuestion);
router.post('/update-question', validateUpdateQuestionData, coordinatorCheck, editor.updateQuestion);
router.post('/delete-question', coordinatorCheck, editor.deleteQuestion);
router.post('/delete-exam', coordinatorCheck, editor.deleteExam);

router.post('/upload-solution/', coordinatorCheck, fileUpload.single('solutionFile'), editor.solutionUpload);
router.post('/upload-image', coordinatorCheck, imageUpload.single('imageFile'), editor.imageUpload);
router.post('/delete-image', coordinatorCheck, editor.deleteImage);

//=======================================================================================

module.exports = router;