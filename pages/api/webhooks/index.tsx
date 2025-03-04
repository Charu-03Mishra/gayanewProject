import KittyBalanceAPI from "@/pages/kitty-balance/kittyBalace";
import { connect } from "@/utils/db";
import { generateInvoiceNumber } from "@/utils/utils";
import axios from "axios";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "POST":
      let conn;
      try {
        const url = process.env.NEXT_PUBLIC_PUBLIC_URL;
        const webhook_data = req.body;
        const event = webhook_data.event;
        const payload = webhook_data.payload;
        if(!payload.payment.entity.notes.type){
          return res.status(200).send("Invalid event type.");
        }
        const entityType = payload.payment.entity.notes.type;
        const order_id = payload.payment.entity.order_id;
        
        if (event === "payment.captured") {
          if (entityType === "membership_fees") {
            const conn = await connect();
            const [rows]: any = await conn.query(
              "SELECT * FROM payments WHERE order_id = ? AND status = ? AND payment_type = ? AND mode = ? ",
              [order_id, "pending", "membership fees", "online"]
            );
            if (rows.length > 0) {
              const paymentId = rows[0].id;
              
              const resUpdatePayment = await axios.put(
                `${url}/api/rzp_payments/${paymentId}`,
                {
                  payment_id: payload.payment.entity.id,
                  entity: payload.payment.entity.entity,
                  currency: payload.payment.entity.currency,
                  status: payload.payment.entity.status,
                  order_id: order_id,
                  // invoice_no: await generateInvoiceNumber("BSS"),
                }
              );

              if (resUpdatePayment.status === 200) {
                const userId = rows[0].member_id;

                // Update member
                const resUpdateMember = await axios.put(
                  `${url}/api/members/${userId}`,
                  {
                    membership_status: "Active",
                    membership_start_date: moment(
                      rows[0].start_payment_date
                    ).format("YYYY-MM-DD"),
                    membership_end_date: moment(
                      rows[0].end_payment_date
                    ).format("YYYY-MM-DD"),
                  }
                );

                if (resUpdateMember.status === 200) {
                  return res
                    .status(200)
                    .send("Payment and member updated successfully.");
                } else {
                  return res.status(200).send("Failed to update member.");
                }
              } else {
                return res.status(200).send("Failed to update payment.");
              }
            } else {
              return res
                .status(200)
                .send("Order ID not found or already processed.");
            }
          } else if (entityType === "till_renewal") {
            conn = await connect();
            const [rows]: any = await conn.query(
              "SELECT * FROM payments WHERE order_id = ? AND status = ? AND payment_type = ? AND mode = ? ",
              [order_id, "pending", "meeting fees", "online"]
            );

            if (rows.length > 0) {
              const paymentId = rows[0].id;
              const resUpdatePayment = await axios.put(
                `${url}/api/rzp_payments/${paymentId}`,
                {
                  payment_id: payload.payment.entity.id,
                  entity: payload.payment.entity.entity,
                  currency: payload.payment.entity.currency,
                  status: payload.payment.entity.status,
                  invoice_no: await generateInvoiceNumber("GB"),
                }
              );
              if (resUpdatePayment.status === 200) {
                const userId = rows[0].member_id;
                const [memberRows]: any = await conn.query(
                  "SELECT * FROM members WHERE id = ?",
                  [userId]
                );

                const [chapterRows]: any = await conn.query(
                  "SELECT * FROM chapters WHERE id = ?",
                  [memberRows[0]?.chapter_id]
                );

                const payment_type = "MEETING FEES";
                await KittyBalanceAPI(
                  rows[0].start_payment_date,
                  rows[0].end_payment_date,
                  memberRows[0]?.chapter_id,
                  memberRows[0]?.first_name,
                  memberRows[0]?.last_name,
                  payment_type,
                  Number(chapterRows[0]?.weekly_meeting_fees)
                );

                // Update member
                const resUpdateMember = await axios.put(
                  `${url}/api/members/${userId}`,
                  {
                    mf_end_date: rows[0].end_payment_date,
                  }
                );

                if (resUpdateMember.status === 200) {
                  return res
                    .status(200)
                    .send("Payment and member updated successfully.");
                } else {
                  return res.status(200).send("Failed to update member.");
                }
              } else {
                return res.status(200).send("Failed to update payment.");
              }
            } else {
              return res
                .status(200)
                .send("Order ID not found or already processed.");
            }
          } else if (entityType === "CDPS_fees") {
            const conn = await connect();
            const [rows]: any = await conn.query(
              "SELECT * FROM payments WHERE order_id = ? AND status = ? AND payment_type = ? AND mode = ? ",
              [order_id, "pending", "CDPS Payment", "online"]
            );
            if (rows.length > 0) {
              const paymentId = rows[0].id;
              const resUpdatePayment = await axios.put(
                `${url}/api/rzp_payments/${paymentId}`,
                {
                  payment_id: payload.payment.entity.id,
                  entity: payload.payment.entity.entity,
                  currency: payload.payment.entity.currency,
                  status: payload.payment.entity.status,
                  invoice_no: "",
                }
              );
              if (resUpdatePayment.status === 200) {
                const userId = rows[0].member_id;

                // Update member
                const resUpdateMember = await axios.put(
                  `${url}/api/members/${userId}`,
                  {
                    flag: true,
                  }
                );

                if (resUpdateMember.status === 200) {
                  return res
                    .status(200)
                    .send("Payment and member updated successfully.");
                } else {
                  return res.status(200).send("Failed to update member.");
                }
              } else {
                return res.status(200).send("Failed to update payment.");
              }
            } else {
              return res
                .status(200)
                .send("Order ID not found or already processed.");
            }
          } else if (entityType === "membership_renewal") {
            const conn = await connect();
            const [rows]: any = await conn.query(
              "SELECT * FROM payments WHERE order_id = ? AND status = ? AND payment_type = ? AND mode = ? ",
              [order_id, "pending", "membership fees", "online"]
            );
            if (rows.length > 0) {
              const paymentId = rows[0].id;
              const resUpdatePayment = await axios.put(
                `${url}/api/rzp_payments/${paymentId}`,
                {
                  payment_id: payload.payment.entity.id,
                  entity: payload.payment.entity.entity,
                  currency: payload.payment.entity.currency,
                  status: payload.payment.entity.status,
                  // invoice_no: await generateInvoiceNumber("BSS"),
                }
              );
              if (resUpdatePayment.status === 200) {
                const userId = rows[0].member_id;

                // Update member
                const resUpdateMember = await axios.put(
                  `${url}/api/members/${userId}`,
                  {
                    membership_end_date: moment(
                      rows[0].end_payment_date
                    ).format("YYYY-MM-DD"),
                  }
                );

                if (resUpdateMember.status === 200) {
                  return res
                    .status(200)
                    .send("Payment and member updated successfully.");
                } else {
                  return res.status(200).send("Failed to update member.");
                }
              } else {
                return res.status(200).send("Failed to update payment.");
              }
            } else {
              return res
                .status(200)
                .send("Order ID not found or already processed.");
            }
          } else if (entityType === "visitor_fees") {
            conn = await connect();
            const [rows]: any = await conn.query(
              "SELECT * FROM payments WHERE order_id = ? AND status = ? AND payment_type = ? AND mode = ? ",
              [order_id, "pending", "visitor fees", "online"]
            );

            if (rows.length > 0) {
              const paymentId = rows[0].id;
              const resUpdatePayment = await axios.put(
                `${url}/api/rzp_payments/${paymentId}`,
                {
                  payment_id: payload.payment.entity.id,
                  entity: payload.payment.entity.entity,
                  currency: payload.payment.entity.currency,
                  status: payload.payment.entity.status,
                  invoice_no: await generateInvoiceNumber("GB"),
                }
              );
              if (resUpdatePayment.status === 200) {
                return res.status(200).send("Payment updated successfully.");
              } else {
                return res.status(200).send("Failed to update payment.");
              }
            } else {
              return res
                .status(200)
                .send("Order ID not found or already processed.");
            }
          } else if (entityType === "meeting_fees") {
            conn = await connect();
            const [rows]: any = await conn.query(
              "SELECT * FROM payments WHERE order_id = ? AND status = ? AND payment_type = ? AND mode = ? ",
              [order_id, "pending", "meeting fees", "online"]
            );

            if (rows.length > 0) {
              const paymentId = rows[0].id;
              const resUpdatePayment = await axios.put(
                `${url}/api/rzp_payments/${paymentId}`,
                {
                  payment_id: payload.payment.entity.id,
                  entity: payload.payment.entity.entity,
                  currency: payload.payment.entity.currency,
                  status: payload.payment.entity.status,
                  invoice_no: await generateInvoiceNumber("GB"),
                }
              );
              if (resUpdatePayment.status === 200) {
                const userId = rows[0].member_id;
                const [memberRows]: any = await conn.query(
                  "SELECT * FROM members WHERE id = ?",
                  [userId]
                );

                const [chapterRows]: any = await conn.query(
                  "SELECT * FROM chapters WHERE id = ?",
                  [memberRows[0]?.chapter_id]
                );

                const payment_type = "MEETING FEES";
                await KittyBalanceAPI(
                  rows[0].start_payment_date,
                  rows[0].end_payment_date,
                  memberRows[0]?.chapter_id,
                  memberRows[0]?.first_name,
                  memberRows[0]?.last_name,
                  payment_type,
                  Number(chapterRows[0]?.weekly_meeting_fees)
                );

                // Update member
                const resUpdateMember = await axios.put(
                  `${url}/api/members/${userId}`,
                  {
                    mf_start_date: moment(
                      rows[0].start_payment_date
                    ).format("YYYY-MM-DD"),
                    mf_end_date: moment(
                      rows[0].end_payment_date
                    ).format("YYYY-MM-DD"),
                  }
                );

                if (resUpdateMember.status === 200) {
                  return res
                    .status(200)
                    .send("Payment and member updated successfully.");
                } else {
                  return res.status(200).send("Failed to update member.");
                }
              } else {
                return res.status(200).send("Failed to update payment.");
              }
            } else {
              return res
                .status(200)
                .send("Order ID not found or already processed.");
            }
          } else {
            return res.status(200).send("Invalid entity type.");
          }
        } else {
          return res.status(200).send("Invalid event.");
        }
      } catch (error) {
        console.error("----", error);
        return res.status(500).send("Internal server error.");
      } finally {
        if (conn) {}
      }
      break;
    default:
      res.setHeader("Allow", ["POST", "PUT", "GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
