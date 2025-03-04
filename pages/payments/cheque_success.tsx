import React from "react";
import { useRouter } from "next/router";
import { Card, CardBody, Col, Row } from "reactstrap";
import Layout from "../Layout/Layout";

const ChequeSuccess = () => {
  const router = useRouter();
  const { query }: any = router;
  return (
    <Layout>
    <div className="page-body">
      <Row>
        <Col xl="12">
          <Card>
            <CardBody>
              {/* Success message */}
              <h4>Success!</h4>
              <p>
                You have successfully applied to meeting fees and chosen to
                pay by cheque.
              </p>
              <p>
                To assist the admin in processing the cheque payment, please
                follow the instructions below.
              </p>

              {/* Bank details and verification code */}
              <p>
                <strong>Bank Details:</strong>
                <br />
                Account Name: Gaya Business Service
                <br />
                Account Number: 085105502607
                <br />
                Bank Name: City Light
                <br />
                IFSC Code: ICIC0000851
              </p>
              <p>
                <strong>Verification Code:</strong> {query?.verificationCode}
                <br />
                Please write this code on the back of the cheques for
                verification.
              </p>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
    </Layout>
  );
};

export default ChequeSuccess;