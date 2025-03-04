// pages/api/sendOTP.ts

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for session management (replace this with a database or other server-side store)
const sessionStore: { [key: string]: any } = {};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Assuming authToken is provided in the request body
    const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZTVjMmJjZmQyNzdhMGI4ZTU1Yjc0NiIsIm5hbWUiOiJCTkkgLSBTdXJhdCIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NWE0ZjhjZDg3ZWU1MTJlMzMxY2ZjMjYiLCJhY3RpdmVQbGFuIjoiTk9ORSIsImlhdCI6MTcyNjMzMzYyOH0.jEnb7dJ3kdm__7AzgeOZtKTdwtIppg7sr_XmR3RYR8k';
    const { phone } = req.body;

    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Generate a unique session identifier
    const sessionId = uuidv4();

    // Store OTP in session store
    sessionStore[sessionId] = { otp };

    // Make a request to send the OTP via WhatsApp
    const response = await axios.post('https://app.11za.in/apis/template/sendTemplate', {
      authToken,
      sendto: `91${phone}`,
      originWebsite: 'https://bnigreatersurat.com/',
      templateName: 'bni_otp',
      language: 'en',
      data: [otp.toString()],
    });

    // Send a response to the client
    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

export default handler;
