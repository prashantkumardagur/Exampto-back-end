const multer = require('multer');


module.exports.fileUpload = multer({
  limits: 5 * 1024 * 1024,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/solutions');
    },
    filename: (req, file, cb) => {
      if(!req.body.examId) cb(new Error('Exam Id is required'));
      cb(null, req.body.examId + '.pdf');
    }
  }),
  fileFilter: (req, file, cb) => {
    if(file.mimetype !== 'application/pdf') {
      cb(new Error('Only pdf files are allowed'));
    }
    if(!req.body.examId) cb(new Error('Exam Id is required'));
    cb(null, true);
  }
});