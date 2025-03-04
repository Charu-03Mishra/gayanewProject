import moment from "moment";
import { useRouter } from "next/router";
import React from "react";

const PdfMeetingFees = ({row}: any) => {
  // const router = useRouter();
  // const row: any = router.query;
  return (
    <>
      <div className="page">
        {/* <div id="footer">
          <table cellSpacing="0" cellPadding="0">
            <tr>
              <td>
                <div className="copyright" style={{ fontSize: "smaller" }}>
                  Copyright &copy; 2024 Gaya Business Service, All Rights
                  Reserved
                </div>
              </td>
              <td>
                <div
                  className="page-number"
                  style={{ fontSize: "smaller" }}
                ></div>
              </td>
            </tr>
          </table>
        </div> */}
        <div className="invoice-box">
          <table>
            <tr className="aligncenter">
              <td>
                <table>
                  <tr className="center">
                    <td>
                      <h2 className="bg-bni-red pd-2">TAX INVOICE</h2>
                    </td>
                  </tr>
                </table>
                <table className="table">
                  <tr className="top">
                    <td colSpan={2}>
                      <table>
                        <tr>
                          {row.payment_type === "membership fees" ? (
                            <td className="font-size-10">
                              Business Support Service Llp
                              <br />
                              THE FINANCIAL SUPERMARKET TOWER,
                              <br />
                              4TH FLR,
                              <br />
                              B/H RISHABH PETROL PUMP, RING ROAD
                              <br />
                              SURAT - 395002
                              <br />
                              +91 99786 05090
                              <br />
                              Email: bnigsurat@gmail.com
                              <br />
                              GST Reg. No.: 24AAQFB4998Q1ZD
                            </td>
                          ) : (
                            <td className="font-size-10">
                              Gaya Business Service
                              <br />
                              THE FINANCIAL SUPERMARKET TOWER,
                              <br />
                              3RD FLR,
                              <br />
                              ABOVE BANK OF BARODA,
                              <br />
                              SALABATPURA, RING ROAD,
                              <br />
                              SURAT - 395007
                              <br />
                              +91 99786 05090
                              <br />
                              Email: bnigbs@gmail.com
                              <br />
                              GST Reg. No.: 24AATFG6531H1Z7
                              <br />
                            </td>
                          )}

                          <td className="title">
                            <div className="no-margin no-padding">
                              <img
                                className="no-margin no-padding"
                                src="/assets/images/logo/bni_surat_logo.png"
                                alt="gaya"
                                title="gaya"
                                width="100"
                              />
                            </div>
                            <div className="mt-1  no-padding alignright font-size-20">
                              <p className="no-margin pb-1">
                                <strong>Invoice Number</strong>
                                <br />
                                {row?.invoice_no}
                              </p>
                              <p className="no-margin">
                                <strong>Invoice Date</strong>
                                <br />
                                {moment(row?.start_payment_date).format("LL")}
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr className="information">
                    <td colSpan={2}>
                      <table>
                        <tr>
                          <td className="font-size-10">
                            To,
                            <br />
                            {row?.memberName}
                            <br />
                            {row?.companyName}
                            <br />
                            {row?.memberGST}
                            <br />
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table
                  className="table table-bordered"
                  style={{ width: "100%" }}
                  cellPadding="0"
                  cellSpacing="0"
                >
                  <tr className="heading">
                    <td className="br-white">Particulars</td>
                    <td className="br-white">SAC</td>
                    <td className="text-right">Amount (Rs)</td>
                  </tr>
                  <tr className="item">
                    {row.payment_type === "visitor fees" ? (
                      <td>Chapter Visit Fees</td>
                    ) : row.payment_type === "membership fees" ? (
                      <td>Membership Fees</td>
                    ) : (
                      <td>
                        Meeting Fees For{" "}
                        {moment(row.start_payment_date).format("MMM-YY")} To{" "}
                        {moment(row.end_payment_date).format("MMM-YY")}
                      </td>
                    )}
                    {/* <td>Meeting Fees For {moment(row.start_payment_date).format("MMM-YY")} To {moment(row.end_payment_date).format("MMM-YY")}</td> */}
                    <td>998312</td>
                    <td className="text-right">Rs. {row?.amount}</td>
                  </tr>

                  {Number(row?.discount) ? (
                    <tr className="item">
                      <td>Discount</td>
                      <td>998312</td>
                      <td className="text-right">
                        Rs. -{Number(row?.discount)?.toFixed(4)}
                      </td>
                    </tr>
                  ) : (
                    ""
                  )}
                  <tr className="item text-right">
                    <td colSpan={3}>&nbsp;</td>
                  </tr>
                  <tr className="item">
                    <td colSpan={2} className="text-end">
                      CGST @ 9%
                    </td>
                    <td>Rs. {row?.cgst}</td>
                  </tr>

                  <tr className="item">
                    <td colSpan={2} className="text-end">
                      SGST @ 9%
                    </td>
                    <td>Rs. {row?.sgst}</td>
                  </tr>
                  <tr className="total">
                    <td colSpan={2} className="text-end">
                      <strong>Sub Total</strong>
                    </td>
                    <td>
                      <strong>Rs. {row?.amount}</strong>
                    </td>
                  </tr>

                  <tr className="total">
                    <td colSpan={2} className="text-end">
                      <strong>Total Amount</strong>
                    </td>
                    <td>
                      <strong>Rs. {row?.total_amount}</strong>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table
            className="mb-1"
            style={{ width: "100%" }}
            cellPadding="0"
            cellSpacing="0"
          >
            <tr>
              <td className="text-right">Payment Received</td>
            </tr>
          </table>
          <table
            className="mb-2"
            style={{ width: "100%" }}
            cellPadding="0"
            cellSpacing="0"
          >
            <tr>
              <td className="text-center">
                Thank you for your business. We look forward to helping you grow
                yours!
              </td>
            </tr>
          </table>

          <table style={{ width: "100%" }} cellPadding="0" cellSpacing="0">
            <tr>
              <td className="font-size-xs">PAN No : AATFG6531H</td>
            </tr>
            <tr>
              <td className="font-size-xs">PLACE OF SUPPY: GUJARAT (24)</td>
            </tr>
          </table>

          {row.payment_type === "meeting fees" ? (
            <table
              className="table"
              style={{ width: "100%" }}
              cellPadding="0"
              cellSpacing="0"
            >
              <tr>
                <td className="text-left font-size-xs">
                  <strong>Notes:</strong>
                </td>
                <td className="text-left font-size-xs">
                  All Meeting Fees are non refundable and non transferrable.{" "}
                  <br />
                </td>
              </tr>
            </table>
          ) : (
            ""
          )}

          <table
            className="mt-2 fix_row"
            style={{ width: "100%" }}
            cellPadding="0"
            cellSpacing="0"
          >
            <tr>
              <td className="text-center">
                This is a computer generated Invoice, hence no signature
                necessary
              </td>
            </tr>
          </table>
        </div>
      </div>
    </>
  );
};

export default PdfMeetingFees;
