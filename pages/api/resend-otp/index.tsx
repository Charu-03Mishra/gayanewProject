import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { connect } from '@/utils/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Generate an expiry timestamp (Unix format)
    const expiryTime = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now

    // Generate a unique session identifier
    const sessionId = uuidv4();

    // Connect to database
    const db = await connect();

    // Update OTP and expiry in MySQL
    const updateQuery = `
      UPDATE members 
      SET otpverification = JSON_OBJECT('otp', ?, 'exptime', ?) 
      WHERE primary_number = ?
    `;

    await db.execute(updateQuery, [otp, expiryTime, phone]);

    console.log(`Stored OTP: ${otp} for ${phone}, Expiry: ${expiryTime}`);

    // Send OTP via WhatsApp
    const data = JSON.stringify({
      apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZTVjMmJjZmQyNzdhMGI4ZTU1Yjc0NiIsIm5hbWUiOiJCTkkgLSBTdXJhdCIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NWE0ZjhjZDg3ZWU1MTJlMzMxY2ZjMjYiLCJhY3RpdmVQbGFuIjoiTk9ORSIsImlhdCI6MTcyNjMzMzYyOH0.jEnb7dJ3kdm__7AzgeOZtKTdwtIppg7sr_XmR3RYR8k",
      campaignName: "otp_verification",
      destination: `91${phone}`,
      userName: "BNI - Surat",
      templateParams: [otp],
      source: "new-landing-page form",
      media: {},
      buttons: [
        {
          type: "button",
          sub_type: "url",
          index: 0,
          parameters: [{ type: "text", text: otp }]
        }
      ],
      carouselCards: [],
      location: {},
      paramsFallbackValue: { FirstName: "user" }
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://backend.api-wa.co/campaign/vartalaap/api/v2',
      headers: { 'Content-Type': 'application/json' },
      data: data
    };

    await axios.request(config);

    res.status(200).json({ success: true, message: 'OTP sent successfully', sessionId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

export default handler;
