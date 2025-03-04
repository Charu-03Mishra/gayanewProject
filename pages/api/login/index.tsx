import { NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import dotenv from "dotenv";
import axios from "axios";
import jwt from "jsonwebtoken";
const sessionStore: { [key: string]: any } = {};
import { v4 as uuidv4 } from "uuid";

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
					"SELECT * FROM members WHERE primary_number = ?",
					[primary_number]
				);
				// conn.end();
				if (rows.length > 0) {

          console.log("data while attempting", rows[0])
					if (rows[0].membership_status === "Active") {
						if (rows[0].membership_status === primary_number) {
							// Direct login without OTP
							const token = jwt.sign(
								{ id: rows[0].id, role: rows[0].role },
								process.env.SECRET_KEY || "",
								{
									expiresIn: process.env.TOKEN_EXPIRY,
								}
							);
							const userRole = rows[0].role;

							const memberDetails = {
								id: rows[0].id,
								membership_id: rows[0].membership_id,
								bni_membership_id: rows[0].bni_membership_id,
								title: rows[0].title,
								first_name: rows[0].first_name,
								last_name: rows[0].last_name,
								company_name: rows[0].company_name,
								gst_no: rows[0].gst_no,
								role: rows[0].role,
								membership_status: rows[0].membership_status,
								profession: rows[0].profession,
								speciality: rows[0].speciality,
								chapter_id: rows[0].chapter_id,
								primary_number: rows[0].primary_number,
								email: rows[0].email,
								permission_LT: rows[0].permission_LT,
								permission_SGDC: rows[0].permission_SGDC,
								flag: rows[0].flag,
							};

							res
								.status(200)
								.json({
									success: true,
									token: token,
									message: "Logged In Successfully",
									userRole: userRole,
									memberDetails: memberDetails,
								});
						} else {
							try {
								const otpApiResponse = await axios.get(
									"http://msgclub.softhubinc.com/rest/otpservice/generate-otp",
									{
										params: {
											AUTH_KEY: "c10a661a952944688a5341afa32aa1ab", //ab removed
											mobileNumber: rows[0].primary_number,
										},
									}
								);
								res.status(200).send({
									success: true,
									user: { phone: rows[0].primary_number },
									otpApiResponse: otpApiResponse.data,
								});
							} catch (otpApiError) {
								res.status(500).send({
									status: "failed",
									message: "Error calling OTP API",
								});
							}
						}
					} else {
						handleError(res, 404, "Member is not active.");
					}
				} else {
					handleError(
						res,
						404,
						"Mobile number not found. Please register first."
					);
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

