const axios = require('axios');
const config = require('../config/env');

const sendEmail = async ({ to, subject, htmlContent }) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'SecureConnect', email: 'noreply@secureconnect.app' },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          'api-key': config.brevoApiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Brevo email error:', error.response?.data || error.message);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendEmail };
