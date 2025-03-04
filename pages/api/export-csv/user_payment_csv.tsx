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
      const { search, startDate, endDate }: any = req.query;
      const searchQuery = search ? `%${search}%` : '%';

      try {
        const conn = await connect();

        const fields = [
        //   '_payments.payment_type',
          '_payments.total_amount',
        //   '_payments.invoice_no',
          '_payments.razorpay_order_id',
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
          whereClauses.push(`_payments.created_at BETWEEN ? AND ?`);
          queryParams.push(formattedStartDate, formattedEndDate);
        }

        // if (req.user[0][0].permission_SGDC) {
        //   whereClauses.push('payments.chapter_id IN (?)');
        //   const querySGDC = `SELECT chapter_id FROM sgdc WHERE id = ?`;
        //   const [sgdcRows]: any = await conn.query(querySGDC, [req.user[0][0].permission_SGDC]);
        //   const chapterId = JSON.parse(sgdcRows[0].chapter_id);
        //   queryParams.push(chapterId);
        // } else if (req.user[0][0].permission_LT) {
        //   whereClauses.push(`payments.chapter_id = ?`);
        //   const queryLT = `SELECT chapter_id FROM leadership WHERE id = ?`;
        //   const [ltRows]: any = await conn.query(queryLT, [req.user[0][0].permission_LT]);
        //   const chapterId = ltRows[0].chapter_id;
        //   queryParams.push(chapterId);
        // }

        // whereClauses.push(`_payments.status = 'captured'`);
        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const query = `
         SELECT 
            _payments.total_amount,
            _payments.razorpay_order_id,
            _payments.created_at,
            _users.chapterName,
            _users.firstName,
            _users.lastName,
            _users.member,
            _users.association
        FROM _users
        JOIN _payments ON _users.id = _payments.user_id
        ${whereClause};
        `;

        // Execute main query
        const [rows]: any = await conn.query(query, queryParams);

        // conn.end();

        // Write CSV headers
        res.setHeader('Content-Disposition', 'attachment; filename=All_Transaction_Payment_Report.csv');
        res.setHeader('Content-Type', 'text/csv');
        res.write('"Amount","Txn ID","Chapter","Date","Name", "Member", "Association Name" "\n');

        // Process rows and write to response
        rows.forEach((row: any) => {
          const rowData = `"${row.total_amount}","${row.razorpay_order_id}","${!row.chapterName?"NA":row.chapterName}","${row.created_at}","${row.firstName} ${row.lastName}","${row.member}","${!row.association?"NA":row.association}"\n`;
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
