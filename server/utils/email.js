const nodemailer = require('nodemailer');

// This function will configure and send an email.
// It uses a test account from Ethereal.email.
const sendEmail = async (options) => {
  // 1) Create a transporter using a test account
  // In a real app, you'd use your actual SMTP server details
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: '"HRM Solution" <no-reply@hrm-solution.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: can be used for formatted emails
  };

  // 3) Actually send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
