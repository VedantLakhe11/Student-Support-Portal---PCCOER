const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Create a transporter using ethereal for dev, or real SMTP for production
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Email could not be sent', error);
    return false;
  }
};

module.exports = sendEmail;
