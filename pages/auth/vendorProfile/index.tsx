import Layout from "@/pages/Layout/Layout";
import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Card,
  CardBody,
  CardFooter,
  Col,
  FormGroup,
  Label,
  Row,
} from "reactstrap";
import localStorage from "@/utils/localStorage";
import CardHeaderCommon from "@/pages/components/CardHeaderCommon/CardHeaderCommon";
import Btn from "@/pages/components/button";
import { toast } from "react-toastify";
import axios from "axios";
import Loader from "@/pages/Layout/Loader/Loader";

const validationSchema = Yup.object().shape({
  vendor_name: Yup.string().required("Vendor Name is required"),
  gst_no: Yup.string().required("GST no. is required"),
  gst_charges: Yup.string().required("GST Charges is required"),
  primary_number: Yup.string().required("Phone no. is required"),
});

const MembersEdit = () => {
  const token = localStorage.getItem("signIn");
  const [vendorData, setVendorData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    values: any,
    actions: { resetForm: () => void }
  ) => {
    try {
      setLoading(true);
      const data = {
        vendor_name: values.vendor_name,
        gst_no: values.gst_no,
        gst_charges: values.gst_charges,
        tds: values.tds,
        primary_number: values.primary_number,
      };
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(
        `/api/vendor/${vendorData?.id}`,
        data,
        config
      );

      if (response.status === 200) {
        localStorage.setItem(
          "vendor-details",
          JSON.stringify({
            id: response.data.vendor?.id,
            name: response.data.vendor?.vendor_name,
          })
        );
        await fetchVendorData();
        actions.resetForm();
        setLoading(false);
        toast.success("Vendor profile updated successfully");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
    }
  };
  const fetchVendorData = async () => {
    try {
      const response = await axios.get("/api/vendorProfile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("signIn")}`,
        },
      });
      setVendorData(response.data?.vendorUser);
    } catch (error) {
      console.error("Error fetching vendor user data:", error);
    }
  };
  useEffect(() => {
    fetchVendorData();
  }, []);
  return (
    <Layout>
      {loading ? (
        <Loader />
      ) : (
        <div className="page-body">
          {vendorData && (
            <Formik
              initialValues={{
                vendor_name: vendorData.vendor_name || "",
                gst_no: vendorData.gst_no || "",
                gst_charges: vendorData.gst_charges || "",
                tds: vendorData.tds || "",
                primary_number: vendorData.primary_number || "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }: any) => (
                <Form className="theme-form">
                  <Card>
                    <CardHeaderCommon
                      title="My Profile"
                      tagClass={"card-title mb-0"}
                    />
                    <CardBody>
                      <Row>
                        <Col md="4">
                          <FormGroup>
                            <Label for="vendor_name">Vendor Name</Label>
                            <Field
                              type="text"
                              name="vendor_name"
                              id="vendor_name"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="vendor_name"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label for="gst_no">GST No</Label>
                            <Field
                              type="text"
                              name="gst_no"
                              id="gst_no"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="gst_no"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label for="gst_charges">GST Charge</Label>
                            <Field
                              type="number"
                              name="gst_charges"
                              id="gst_charges"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="gst_charges"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label for="tds">TDS</Label>
                            <Field
                              type="number"
                              name="tds"
                              id="tds"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="tds"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label for="primary_number">Phone number</Label>
                            <Field
                              type="number"
                              name="primary_number"
                              id="primary_number"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="primary_number"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </CardBody>
                    <CardFooter className="text-end">
                      <Btn
                        color="primary"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </Btn>
                    </CardFooter>
                  </Card>
                </Form>
              )}
            </Formik>
          )}
        </div>
      )}
    </Layout>
  );
};

export default MembersEdit;
