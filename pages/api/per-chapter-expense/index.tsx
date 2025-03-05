import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";

const handleError = (
	res: NextApiResponse,
	statusCode: number,
	message: string
) => {
	res.status(statusCode).json({ error: message });
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { method } = req;
	const { chapter_name } = req.query; // Retrieve chapter_name from query parameters

	console.log("chapter name in case of all", chapter_name);

	switch (method) {
		case "GET":
			try {
				const conn = await connect();
				if (chapter_name && chapter_name !== "" && chapter_name !== "all") {
          const [rows] = await conn.query(
              `SELECT 
                  e.expense_head,
                  ROUND(SUM(e.amount), 2) AS total_expense
              FROM 
                  gayanew.expense e
              JOIN 
                  gayanew.chapters ch ON e.chapter_id = ch.id
              WHERE 
                  e.date_of_meeting >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                  AND ch.chapter_name = ?
              GROUP BY 
                  e.expense_head
              ORDER BY 
                  total_expense DESC;`,
              [chapter_name] // Pass chapter_name as an array item for parameterized query
          );
          res.status(200).json(rows);
      } else {
          const [rows] = await conn.query(
              `SELECT 
                  e.expense_head,
                  ROUND(SUM(e.amount), 2) AS total_expense
              FROM 
                  gayanew.expense e
              JOIN 
                  gayanew.chapters ch ON e.chapter_id = ch.id
              WHERE 
                  e.date_of_meeting >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
              GROUP BY 
                  e.expense_head
              ORDER BY 
                  total_expense DESC;`
          );
      
          res.status(200).json(rows);
      }
      

			} catch (error) {
				console.error("Error fetching data:", error);
				handleError(res, 500, "Server Error");
			}
			break;

		default:
			res.setHeader("Allow", ["GET"]);
			res.status(405).end(`Method ${method} Not Allowed`);
	}
}

