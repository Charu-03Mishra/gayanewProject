import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";

const handleError = (
  res: NextApiResponse,
  statusCode: number,
  message: string
) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(
  req: any,
  res: NextApiResponse,
  next: Function
) {
  const { method } = req;

  if (method === "GET") {
    await checkUserAuth(req, res, next);
  }

  switch (method) {
    case "GET":
      const { page, pageSize, search }: any = req.query;
      const parsedPage = parseInt(page) || 1;
      const parsedPageSize = parseInt(pageSize) || 10;
      const offset = (parsedPage - 1) * parsedPageSize;
      const searchQuery = search ? `%${search}%` : "%";

      try {
        const conn = await connect();

        const fields = [
          "payments.payment_type",
          "payments.total_amount",
          "payments.order_id",
          "payments.mode",
        ];

        let whereClause = fields.map((field) => `${field} LIKE ?`).join(" OR ");
        let whereParams = fields.map(() => searchQuery);

        let additionalParams: any[] = [];
        let permissionFilter = "";

        // Add filtering based on role and permissions
        if (req.user[0][0].role === "member") {
          permissionFilter = `member_id = ?`;
          additionalParams.push(req.user[0][0].id);
        } else if (req.user[0][0].permission_SGDC) {
          permissionFilter = "chapter_id IN (?)";
          const querySGDC = `SELECT chapter_id FROM sgdc WHERE id = ?`;
          const [sgdcRows]: any = await conn.query(querySGDC, [
            req.user[0][0].permission_SGDC,
          ]);
          const chapterId = JSON.parse(sgdcRows[0].chapter_id);
          additionalParams.push(chapterId);
        } else if (req.user[0][0].permission_LT) {
          permissionFilter = "chapter_id = ?";
          const queryLT = `SELECT chapter_id FROM leadership WHERE id = ?`;
          const [ltRows]: any = await conn.query(queryLT, [
            req.user[0][0].permission_LT,
          ]);
          const chapterId = ltRows[0].chapter_id;
          additionalParams.push(chapterId);
        }

        if (permissionFilter) {
          whereClause = `(${whereClause}) AND ${permissionFilter}`;
        }

        const query = `
          SELECT * FROM payments 
          WHERE ${whereClause}
          LIMIT ? OFFSET ?
        `;
        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) AS count FROM payments WHERE ${whereClause}`;
        const [countResult]: any = await conn.query(countQuery, [
          ...whereParams,
          ...additionalParams,
        ]);
        const totalItems = countResult[0].count;
        const totalPages = Math.ceil(totalItems / parsedPageSize);

        const [rows]: any = await conn.query(query, [
          ...whereParams,
          ...additionalParams,
          parsedPageSize,
          offset,
        ]);

        // conn.end();

        res.status(200).json({
          payments: rows,
          pagination: {
            currentPage: parsedPage,
            totalPages: totalPages,
            totalItems: totalItems,
            pageSize: parsedPageSize,
          },
        });
      } catch (error) {
        console.error(error);
        handleError(res, 500, "Server Error");
      }
      break;

    case "POST":
      try {
        const {
          member_id,
          chapter_id,
          payment_id,
          payment_type,
          entity,
          amount,
          discount,
          cgst,
          sgst,
          total_amount,
          currency,
          status,
          mode,
          order_id,
          email,
          contact,
          verification_code,
          invoice_no,
          start_payment_date,
          end_payment_date,
          penalty_fees,
          outstanding_balance
        } = req.body;

        const conn = await connect();
        const result: any = await conn.query(
          "INSERT INTO payments (member_id, chapter_id, payment_id, payment_type, entity, amount, discount, cgst, sgst, total_amount, currency, status, mode, order_id, email, contact, verification_code, invoice_no, start_payment_date, end_payment_date, penalty_fees, outstanding_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            member_id,
            chapter_id,
            payment_id,
            payment_type,
            entity,
            amount,
            discount,
            cgst,
            sgst,
            total_amount,
            currency,
            status,
            mode,
            order_id,
            email,
            contact,
            verification_code,
            invoice_no,
            start_payment_date,
            end_payment_date,
            penalty_fees,
            outstanding_balance
          ]
        );
        await conn.query("UPDATE members SET outstanding_balance = ? WHERE id = ?", [0.00, member_id]);
        const createdRzpPaymentId = result[0].insertId;
        const createdRzpPayment = {
          id: createdRzpPaymentId,
          member_id,
          chapter_id,
          payment_id,
          payment_type,
          entity,
          amount,
          discount,
          cgst,
          sgst,
          total_amount,
          currency,
          status,
          mode,
          order_id,
          email,
          contact,
          verification_code,
          invoice_no,
          start_payment_date,
          end_payment_date,
          penalty_fees,
          outstanding_balance
        };
        // conn.end();

        res
          .status(200)
          .json({
            message: "Payment details saved successfully",
            rzpPayment: createdRzpPayment,
          });
      } catch (error) {
        console.log("error----", error);
        handleError(res, 500, "Server Error");
      }
      break;
    default:
      res.setHeader("Allow", ["POST", "GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
