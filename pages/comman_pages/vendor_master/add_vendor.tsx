import Layout from "@/pages/Layout/Layout";
import CardHeaderCommon from "@/pages/components/CardHeaderCommon/CardHeaderCommon";
import Btn from "@/pages/components/button";
import localStorage from "@/utils/localStorage";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { toast } from "react-toastify";
import {
  Col,
  FormGroup,
  Label,
  Card,
  CardBody,
  CardFooter,
  Row,
} from "reactstrap";
// import * as Yup from "yup";

const initialValues = {
  vendor_name: "",
  gst_no: "",
  gst_charges: "",
  tds: "",
  primary_number: "",
};

// const validationSchema = Yup.object().shape({
//   vendor_name: Yup.string().required("Vendor Name is required"),
//   gst_no: Yup.string().required("GST no. is required"),
//   gst_charges: Yup.string().required("GST Charges is required"),
//   primary_number: Yup.string().required("Phone no. is required"),
// });

const AddVendor = () => {
  const token = localStorage.getItem('signIn')
  const router = useRouter()
  const handleSubmit = async (values: any, actions: { resetForm: () => void; }) => {
    try {
        const data = {
          vendor_name: values.vendor_name,
          gst_no: values.gst_no,
          gst_charges: values.gst_charges,
          tds: values.tds,
          primary_number: values.primary_number,
        };
    
        const config = {
          headers: {
              Authorization: `Bearer ${token}`
          }
      };
  
      const response = await axios.post(`/api/vendor`, data, config);

        if (response.status === 201) {
            toast.success(response.data.message);
            router.push("/comman_pages/vendor_master/list_vendor")
        }
        
        actions.resetForm();
      } catch (error: any) {
        toast.error(error.response.data.error || error.response.data.message);
      }
  };

  return (
    <Layout>
        <div className="page-body">
          <Col xl="12">
            <Formik
              initialValues={initialValues}
              // validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }: any) => (
                <Form className="theme-form">
                  <Card>
                    <CardHeaderCommon
                      title="Add Vendor"
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
                            {/* <ErrorMessage
                              name="vendor_name"
                              component="div"
                              className="text-danger"
                            /> */}
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
                            {/* <ErrorMessage
                              name="gst_no"
                              component="div"
                              className="text-danger"
                            /> */}
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
                            {/* <ErrorMessage
                              name="gst_charges"
                              component="div"
                              className="text-danger"
                            /> */}
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
                            {/* <ErrorMessage
                              name="tds"
                              component="div"
                              className="text-danger"
                            /> */}
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
                            {/* <ErrorMessage
                              name="primary_number"
                              component="div"
                              className="text-danger"
                            /> */}
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
          </Col>
        </div>
    </Layout>
  );
};

export default AddVendor;
