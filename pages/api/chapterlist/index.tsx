import next, { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";

const handleError = (res: NextApiResponse, statusCode: number, message: string) => {
	res.status(statusCode).json({ error: message });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "GET") {
        await checkUserAuth(req, res, next);
	}

	try {

		// Establish database connection
		const pool = await connect();
		const conn = await pool.getConnection();

		// Fetch only the required fields
		const [rows] = await conn.query(`
			SELECT id, chapter_id, chapter_name, is_launched 
			FROM chapters
		`);

		// Release connection back to pool
		conn.release();

		// Send response
		res.status(200).json({ chapters: rows });
	} catch (error) {
		console.error("Error in GET API:", error);
		handleError(res, 500, "Server Error");
	}
}
