import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";
import moment from "moment";

const handleError = (res: NextApiResponse, statusCode: number, message: string) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      const { start_date, end_date } = req.query;
     
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
     
        if (start_date && end_date) {
          const formattedStartDate = moment(start_date as string).format("YYYY-MM-DD 00:00:00");
          const formattedEndDate = moment(end_date as string).format("YYYY-MM-DD 23:59:59");
          whereClauses.push(`payments.createdAt BETWEEN ? AND ?`);
          queryParams.push(formattedStartDate, formattedEndDate);
        }        
        
     
        whereClauses.push(`payments.status = 'captured'`);
        whereClauses.push(`payments.payment_type != 'membership fees'`);
        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const query = `
          SELECT 
            payments.*, 
            members.*,
            region.*,
            payments.createdAt as 'transactionDate',
            IF(payments.payment_type = 'visitor fees', 
              visitor.visitor_name, 
              CONCAT(members.first_name, ' ', members.last_name)
            ) AS memberName,
            IF(payments.payment_type = 'visitor fees', 
              visitor.gst, 
              members.gst_no
            ) AS memberGST,
            IF(payments.payment_type = 'visitor fees', 
              NULL,
              members.company_name
            ) AS companyName,
            chapters.chapter_name AS chapterName
          FROM payments
          LEFT JOIN members ON payments.member_id = members.id
          LEFT JOIN chapters ON payments.chapter_id = chapters.id
          LEFT JOIN region ON chapters.region_id = region.id
          LEFT JOIN visitor ON payments.member_id = visitor.id AND payments.payment_type = 'visitor fees'
          ${whereClause}
        `;

        const countQuery = `
          SELECT COUNT(*) AS count
          FROM payments
          LEFT JOIN members ON payments.member_id = members.id
          LEFT JOIN chapters ON payments.chapter_id = chapters.id
          LEFT JOIN region ON chapters.region_id = region.id
          LEFT JOIN visitor ON payments.member_id = visitor.id AND payments.payment_type = 'visitor fees'
          ${whereClause}
        `;

        // Execute count query
        const [countResult]: any = await conn.query(countQuery, queryParams);
        const totalItems = countResult[0].count;
      
        // Execute main query
        const [rows]: any = await conn.query(query, [...queryParams]);

        // conn.end();
        // Create data in the required format
        const data = {
          Voucher: rows.map((item: any) => {
            const alias = item.membership_id 
              ? `${item.memberName}-${item.chapterName}-${item.membership_id}`
              : '';
            
            return {
              Date: moment(item.transactionDate).format('DD-MM-YYYY'),
              VoucherNo: item.invoice_no,
              Amount: Number(item.total_amount).toFixed(2),
              LedgerEntries: [
                {
                  LedgerName: item.companyName || item.memberName,
                  LedgerAmount: Number(item.total_amount).toFixed(2) || 0,
                  Type: 'Dr',
                  InstNo: "",
                  InstDate: moment(item.transactionDate).format('DD-MM-YYYY'),
                  TrnsType: 'Online',
                  Bank: '',
                  BillName: item.invoice_no
                },
                {
                  LedgerName:'RAZORPAY SOFTWARE PRIVATE LI',
                  LedgerAmount: Number(item.total_amount).toFixed(2) || 0,
                  Type: 'Cr',
                  InstNo: "",
                  InstDate: moment(item.transactionDate).format('DD-MM-YYYY'),
                  TrnsType: 'Online',
                  Bank: '',
                  BillName: item.invoice_no
                }
              ]
            };
          })
        };


        res.status(200).json(data);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        handleError(res, 500, 'Server Error');
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
