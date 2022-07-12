const multer = require('multer');
const { v1: uuidv1 } = require('uuid');


const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
}


module.exports.imageUpload = multer({
  limits: 1 * 1024 * 1024,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
      cb(null, `${uuidv1()}.${MIME_TYPE_MAP[file.mimetype]}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid mime type!');
    cb(error, isValid);
  }
});