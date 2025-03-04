import { NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const handleError = (
  res: NextApiResponse,
  statusCode: number,
  message: string
) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(req: any, res: any) {
  const { method } = req;

  switch (method) {
    case "POST":
      const { primary_number, otp } = req.body;
      try {
        const conn = await connect();
        const [rows]: any[] = await conn.query(
          "SELECT * FROM vendor_master WHERE primary_number = ?",
          [primary_number]
        );
        // conn.end();
        
        if(rows.length > 0){
          if (rows[0].login_access === "yes") {
              try {
                const otpApiResponse = await axios.get(
                    'http://msgclub.softhubinc.com/rest/otpservice/generate-otp',
                    {
                        params: {
                            AUTH_KEY: 'c10a661a952944688a5341afa32aa1ab',
                            mobileNumber: rows[0].primary_number,
                        },
                    }
                );
                res.status(200).send({
                    success: true,
                    vendorUser: { phone: rows[0].primary_number },
                    otpApiResponse: otpApiResponse.data,
                });
            } catch (otpApiError) {
                res.status(500).send({
                    status: "failed",
                    message: "Error calling OTP API",
                });
            } 
          } else {
          handleError(res, 404, "Permission is not approved");
          }
        } else {
            handleError(res, 404, "Mobile number not found. Please register first.");
        }
      } catch (error) {
        handleError(res, 500, "Server Error");
      }
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
