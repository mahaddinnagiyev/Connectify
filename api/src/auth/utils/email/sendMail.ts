import * as FormData from 'form-data';
import Mailgun from 'mailgun.js';
import * as dotenv from 'dotenv';

dotenv.config();

export const sendMail = () => {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
  });

  return mg;
};
