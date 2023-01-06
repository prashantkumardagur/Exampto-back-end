const nodemailer = require('nodemailer');


const sendForgotPasswordMail = async (email) => {

  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // generated ethereal user
      pass: process.env.SMTP_PASS, // generated ethereal password
    }
  });

  let mailOptions = {
    from: "help.exampto.com", // sender address
    to: email,
    subject: 'Reset Password for Exampto',
    text: 'Click on the link to reset your password'
  };

  let info = await transporter.sendMail(mailOptions);


}

module.exports = sendForgotPasswordMail;