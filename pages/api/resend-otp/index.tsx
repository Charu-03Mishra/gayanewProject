// pages/api/sendOTP.ts

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for session management (replace this with a database or other server-side store)
const sessionStore: { [key: string]: any } = {};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Assuming authToken is provided in the request body
    const authToken = 'U2FsdGVkX1+1zpS8tZr7JRAk5bGUookn4bSuEvyB2dcp4q5+nomQR3YdgzvIYv/vi/7hUy1zLckSd8Iy4+oQpIbGDoYGB2NWKOyR90r4ZW42X0PK8I6w8G5HsWVnV0wqlVPOOxwcuJ3jdTefMZG2yNx26dIe8k4Jot1zs+6BTmk+QUWhImXWBeuvqRszyzPp';
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
