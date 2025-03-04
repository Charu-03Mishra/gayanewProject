import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";
import moment from "moment";
import { Readable } from 'stream';

const handleError = (res: NextApiResponse, statusCode: number, message: string) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(req: any, res: any, next: Function) {
  const { method } = req;

  if (method === "GET") {
    await checkUserAuth(req, res, next);
  }

  switch (method) {
    case 'GET':
      const { search, startDate, endDate, payment_type }: any = req.query;
      const searchQuery = search ? `%${search}%` : '%';

      try {
        const conn = await connect();

        const fields = [
          'payments.payment_type',
          'payments.total_amount',
          'payments.invoice_no',
          'payments.order_id',
          'visitor.visitor_name',
          "CONCAT(members.first_name, ' ', members.last_name)",
          'chapters.chapter_name'
        ];

        let whereClauses = [];
        let queryParams = [];

        // Constructing search condition
        if (search) {
          whereClauses.push(`(${fields.map(field => `${field} LIKE ?`).join(' OR ')})`);
          queryParams.push(...fields.map(() => searchQuery));
        }

        if (startDate && endDate) {
          const formattedStartDate = moment(startDate).format("YYYY-MM-DD 00:00:00");
          const formattedEndDate = moment(endDate).format("YYYY-MM-DD 23:59:59");
          whereClauses.push(`payments.createdAt BETWEEN ? AND ?`);
          queryParams.push(formattedStartDate, formattedEndDate);
        }

        whereClauses.push(`payments.status = 'captured'`);
        whereClauses.push(`payments.payment_type = ?`);
        queryParams.push(payment_type);
        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const query = `
          SELECT 
            payments.total_amount,
            payments.order_id,
            payments.invoice_no,
            chapters.chapter_name AS chapter,
            IF(payments.payment_type = 'visitor fees', visitor.visitor_name, CONCAT(members.first_name, ' ', members.last_name)) AS memberName,
            DATE_FORMAT(payments.createdAt, "%M %e, %Y") AS createdAt,
            CASE
              WHEN payments.status = 'captured' THEN 'paid'
              ELSE 'pending'
            END AS status
          FROM payments
          LEFT JOIN members ON payments.member_id = members.id
          LEFT JOIN chapters ON payments.chapter_id = chapters.id
          LEFT JOIN visitor ON payments.member_id = visitor.id AND payments.payment_type = 'visitor fees'
          ${whereClause}
        `;

        // Execute main query
        const [rows]: any = await conn.query(query, queryParams);

        // conn.end();

        // Write CSV headers
        res.setHeader('Content-Disposition', 'attachment; filename=All_Transaction_Payment_Report.csv');
        res.setHeader('Content-Type', 'text/csv');
        res.write('"Amount","Txn ID","Invoice No","Chapter","Member Name","Date","Status"\n');

        // Process rows and write to response
        rows.forEach((row: any) => {
          const rowData = `"${row.total_amount}","${row.order_id}","${row.invoice_no}","${row.chapter}","${row.memberName}","${row.createdAt}","${row.status}"\n`;
          res.write(rowData);
        });

        res.end();

      } catch (error) {
        console.error('Error generating CSV:', error);
        handleError(res, 500, 'Server Error');
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
