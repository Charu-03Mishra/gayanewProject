import { NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import upload from "@/utils/uploadMiddleware";
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
      const { page, pageSize, search }: any = req.query;
      const parsedPage = parseInt(page) || 1;
      const parsedPageSize = parseInt(pageSize) || 10;
      const searchQuery = search ? `%${search}%` : '%';

      try {
        const offset = (parsedPage - 1) * parsedPageSize;
        const conn = await connect();

        const fields = [
          'tds_records.tan',
          'tds_records.tds_amount',
          'chapters.chapter_name',
          'members.first_name',
          'members.last_name',
          'tds_records.income_head',
          'tds_records.bank_name',
        ];

        let whereClause = fields.map(field => `${field} LIKE ?`).join(' OR ');
        let whereParams = fields.map(() => searchQuery);

        let additionalParams = [];
        let permissionFilter = '';

        if (req.user[0][0].role === "member") {
          permissionFilter = 'tds_records.member_id = ?';
          additionalParams.push(req.user[0][0].id);
        }

        if (permissionFilter) {
          whereClause = `(${whereClause}) AND ${permissionFilter}`;
        }

        const query = `
          SELECT tds_records.*, 
                chapters.chapter_name AS chapter_name, 
                CONCAT(members.first_name, ' ', members.last_name) AS member_name
          FROM tds_records
          LEFT JOIN chapters ON tds_records.chapter_id = chapters.id
          LEFT JOIN members ON tds_records.member_id = members.id
          WHERE ${whereClause}
          LIMIT ${parsedPageSize} OFFSET ${offset}
        `;

        const countQuery = `
          SELECT COUNT(*) AS count
          FROM tds_records
          LEFT JOIN chapters ON tds_records.chapter_id = chapters.id
          LEFT JOIN members ON tds_records.member_id = members.id
          WHERE ${whereClause}
        `;

        const [countResult]: any = await conn.query(countQuery, [...whereParams, ...additionalParams]);
        const totalItems = countResult[0].count;
        const totalPages = Math.ceil(totalItems / parsedPageSize);

        const [rows]: any = await conn.query(query, [...whereParams, ...additionalParams]);

        // conn.end();

        res.status(200).json({
          tds: rows,
          pagination: {
            currentPage: parsedPage,
            totalPages: totalPages,
            totalItems: totalItems,
            pageSize: parsedPageSize,
          },
        });
      } catch (error) {
        console.log('error', error);
        handleError(res, 500, "Server Error");
      }
      break;
    case "POST":
      upload.single("attachment")(req, res, async (err) => {
        if (err) {
          console.error("Error uploading file:", err);
          return res.status(500).json({ error: "Error uploading file" });
        }

        try {
          const {
            member_id,
            chapter_id,
            tan,
            tds_amount,
            income_head,
            account_name,
            bank_name,
            bank_account_number,
            ifsc_code,
            branch,
            status,
            created_by,
          } = req.body;
          const attachment = req.file.filename;

          const conn = await connect();
          await conn.query(
            "INSERT INTO tds_records (member_id, chapter_id, tan, tds_amount, income_head, account_name, bank_name, bank_account_number, ifsc_code, branch, attachment, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              member_id,
              chapter_id,
              tan,
              tds_amount,
              income_head,
              account_name,
              bank_name,
              bank_account_number,
              ifsc_code,
              branch,
              `upload/${attachment}`,
              status,
              created_by,
            ]
          );
          // conn.end();
          return res
            .status(201)
            .json({ message: "Tds record created successfully" });
        } catch (error) {
          return res.status(500).json({ error: "Server Error" });
        }
      });
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
