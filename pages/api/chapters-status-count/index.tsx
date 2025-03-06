import { NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";

export const config = {
	api: {
		bodyParser: false,
	},
};

const handleError = (
	res: NextApiResponse,
	statusCode: number,
	message: string
) => {
	res.status(statusCode).json({ error: message });
};

export default async function handler(req: any, res: any, next: Function) {
	const { method } = req;
	if (method === "GET") {
		await checkUserAuth(req, res, next);
	}

	switch (method) {
		case "GET":
			try {
				const conn = await connect();
				const [rows]: any = await conn.query(`SELECT 
    COUNT(CASE WHEN is_launched = 1 THEN 1 END) AS totalActive, 
    COUNT(CASE WHEN is_launched = 0 THEN 1 END) AS totalNonActive 
FROM chapters;

        `);
				// conn.end();
				res.status(200).json(rows[0]);
			} catch (error) {
				handleError(res, 500, "Server Error");
			}
			break;

		default:
			res.setHeader("Allow", ["GET"]);
			res.status(405).end(`Method ${method} Not Allowed`);
	}
}
