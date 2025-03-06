import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import jwt from "jsonwebtoken";
import { connect } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { primary_number, otp, isphone } = req.body;

    console.log("Received OTP:", otp);

    if (!primary_number || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number and OTP are required" });
    }

    // Connect to database
    const conn = await connect();

    // Fetch user details
    const [rows]: any[] = await conn.query(
      "SELECT id, role, otpverification FROM members WHERE primary_number = ?",
      [primary_number]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = rows[0];

    if (isphone) {
      // External OTP verification
      const AUTH_KEY = "c10a661a952944688a5341afa32aa1ab";
      const response = await axios.get(
        "http://msgclub.softhubinc.com/rest/otpservice/verify-otp",
        {
          params: { AUTH_KEY, mobileNumber: primary_number, otp },
        }
      );

      console.log("response of otp", response)

      if (response.data.responseCode === 2010) {
        return res
          .status(400)
          .json({ success: false, message: response.data.response });
      }
    } else {
      // Database OTP verification
      if (user.otpverification) {
        try {
          const storedOtpData = user.otpverification;
          console.log("Database OTP data:", storedOtpData);

          const storedOtp = String(storedOtpData.otp);
          const expiryTime = Number(storedOtpData.exptime);

          const currentTime = Math.floor(Date.now() / 1000);

          if (storedOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
          }

          if (expiryTime <= currentTime) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
          }
        } catch (error) {
          console.error("Error verifying OTP:", error);
          return res
            .status(500)
            .json({ success: false, message: "OTP verification error" });
        }
      } else {
        return res.status(400).json({ success: false, message: "No OTP found for verification" });
      }
    }

    // OTP verification successful, update database
    await conn.query(
      "UPDATE members SET otpverification = NULL WHERE primary_number = ?",
      [primary_number]
    );

    return sendTokenResponse(user, res);
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

// Function to generate JWT and respond
const sendTokenResponse = (user: any, res: NextApiResponse) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.SECRET_KEY || "",
    { expiresIn: process.env.TOKEN_EXPIRY || "1h" }
  );

  return res.status(200).json({
    success: true,
    token,
    message: "Logged In Successfully",
    userRole: user.role,
  });
};
