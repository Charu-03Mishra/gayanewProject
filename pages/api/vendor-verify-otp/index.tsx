import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import jwt from "jsonwebtoken";
import { connect } from '@/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
        const { primary_number, otp } = req.body;
      const conn = await connect();

      const [rows]: any[] = await conn.query(
        "SELECT * FROM vendor_master WHERE primary_number = ?",
        [primary_number]
      );
      // conn.end();
      const AUTH_KEY = 'c10a661a952944688a5341afa32aa1ab';

      const response = await axios.get('http://msgclub.softhubinc.com/rest/otpservice/verify-otp', {
        params: {
          AUTH_KEY,
          mobileNumber: primary_number,
          otp,
        },
      });
      if (response.data.responseCode === 2010) {
      // if (otp !== "999999") {

        res.status(400).json({ success: false, message: "response.data.response" });
      } else {
        const token = jwt.sign({ id: rows[0].id, role: "vendor" }, process.env.SECRET_KEY || "", {
              expiresIn: process.env.TOKEN_EXPIRY,
            });

            const vendorDetails = {
              id: rows[0].id,
              name: rows[0].vendor_name,
            };
              res.status(200).json({ success: true,role: "vendor",vendor: vendorDetails, token: token, message: 'Logged In Successfully' });
      
        // res.status(200).json({ success: true,token:token, message: 'OTP verification successful' });
      // }
    } 
    // catch (error) {
    //   console.error('Error verifying OTP:', error);
    //   res.status(500).json({ success: false, message: 'Internal Server Error' });
    // }
  } catch {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}}
