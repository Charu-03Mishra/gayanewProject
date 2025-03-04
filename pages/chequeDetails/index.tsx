import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardBody, Col, Row } from "reactstrap";
import axios from "axios";
import Loader from "../Layout/Loader/Loader";
import { generateInvoiceNumber } from "@/utils/utils";

const Index = () => {
  const router = useRouter();
  const { query }: any = router;
  const [loading, setLoading] = useState(true);
  const memberData = query?.memberData ? JSON.parse(query?.memberData) : null;

  const [verificationCode, setVerificationCode] = useState("");

  // Function to handle the API call on page load
  const handleAPIRequest = async () => {
    try {
      const resPayment = await axios.post("/api/rzp_payments", {
        member_id: memberData?.id,
        chapter_id: memberData?.chapter_id,
        amount: query?.subTotalAmount,
        discount: 0,
        cgst: query?.cgst,
        sgst: query?.sgst,
        total_amount: query?.totalAmount,
        status: "pending",
        payment_type: "membership fees",
        mode: "cheque",
        verification_code: verificationCode,
        invoice_no: await generateInvoiceNumber("BSS"),
        start_payment_date: query?.startDate,
        end_payment_date: query?.endDate,
      });

      if (resPayment.status === 200) {
        setLoading(false);
      } else {
        console.error("API request failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error updating payments", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Generate verification code
    const generateVerificationCode = () => {
      const code = Math.floor(100000 + Math.random() * 900000);
      setVerificationCode(code.toString());
    };

    generateVerificationCode();
    // Call the API request function once on page load
    handleAPIRequest();
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div>
          <Row>
            <Col xl="12">
              <Card>
                <CardBody>
                  {/* Success message */}
                  <h4>Success!</h4>
                  <p>
                    You have successfully applied to become a member and chosen
                    to pay by cheque.
                  </p>
                  <p>
                    To assist the admin in processing the cheque payment, please
                    follow the instructions below.
                  </p>

                  {/* Bank details and verification code */}
                  <p>
                    <strong>Bank Details:</strong>
                    <br />
                    Account Name: Business Support Service LLP
                    <br />
                    Account Number: 085105502680
                    <br />
                    Bank Name: ICICI Bank, City Light, Surat
                    <br />
                    IFSC Code: ICIC0000851
                  </p>
                  <p>
                    <strong>Verification Code:</strong> {verificationCode}
                    <br />
                    Please write this code on the back of the cheques for
                    verification.
                  </p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default Index;
