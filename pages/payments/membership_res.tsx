import React from "react";
import Layout from "../Layout/Layout";
import { Card, CardBody } from "reactstrap";

const MembershipRes = () => {
  return (
    <Layout>
      <div className="page-body">
        <Card>
          <CardBody>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <h2>Congratulations!</h2>
              <p>
                Your account has been successfully created, and your payment has
                been processed.
              </p>
              <p>Thank you for becoming a member!</p>
              <p>
                If you have any questions or need assistance, feel free to
                contact our support team.
              </p>
              <p>We look forward to seeing you soon!</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
};

export default MembershipRes;
