const axios = require('axios');
const FormData = require('form-data');

const sendEmail = async (options) => {
  const { email, subject, message, html } = options;

  const formData = new FormData();
  formData.append('to', email);
  formData.append('subject', subject);
  if (message) {
    formData.append('message', message);
  }
  if (html) {
    formData.append('html', html);
  }

  try {
    const response = await axios.post(
      process.env.EMAIL_API_URL,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'x-api-key': process.env.EMAIL_API_KEY,
        },
      }
    );

    console.log('Email sent successfully via custom API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending email via custom API:', error.response ? error.response.data : error.message);
    // To keep the application from crashing, we don't re-throw the error,
    // but the failure is logged.
  }
};

module.exports = sendEmail;
