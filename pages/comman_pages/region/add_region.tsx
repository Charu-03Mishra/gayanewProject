import React from "react";
import { Card, CardBody, CardFooter, Col, FormGroup, Input, Label, Row } from "reactstrap";
import Btn from "../../components/button";
import Layout from "../../Layout/Layout";
import CardHeaderCommon from "../../components/CardHeaderCommon/CardHeaderCommon";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
// import ProtectedRoute from "@/pages/components/ProtectedRoute";
import localStorage from "@/utils/localStorage";

const AddRegion = () => {
  const token = localStorage.getItem('signIn')
  const validationSchema = Yup.object().shape({
    regionName: Yup.string().required("Region Name is required"),
    isLaunched: Yup.boolean(),
  });

  const initialValues = {
    regionName: "",
    isLaunched: false,
  };

  const handleSubmit = async (values: any, actions: { resetForm: () => void; }) => {
    try {
        const data = {
            name: values.regionName,
            is_launched : values.isLaunched
        };
    
        const config = {
          headers: {
              Authorization: `Bearer ${token}`
          }
      };
  
      const response = await axios.post(`/api/region`, data, config);
    
        if (response.status === 201) {
            toast.success(response.data.message);
        }
        
        actions.resetForm();
      } catch (error: any) {
        toast.error(error.response.data?.error || error.response.data?.message);
      }
  };

  return (
    <Layout>
      {/* <ProtectedRoute> */}
      <div className="page-body">
        <Col xl="8">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, touched, errors }: any) => (
              <Form>
                <Card>
                  <CardHeaderCommon title="Add Region" tagClass={"card-title mb-0"} />
                  <CardBody>
                    <Row>
                      <Col md="12">
                        <FormGroup>
                          <Label>Region Name</Label>
                          <Field name="regionName" placeholder="Region Name" type="text" className={`form-control ${touched.regionName && `${errors.regionName ? "is-invalid" : "is-valid"}`}`} />
                          <ErrorMessage name="regionName" component="div" className="invalid-feedback" />
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="3">
                        <FormGroup check className="checkbox-checked">
                          <Label check>
                            <Field type="checkbox" name="isLaunched" as={Input} />
                            Is Launched
                          </Label>
                        </FormGroup>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter className="text-end">
                    <Btn color="primary" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Btn>
                  </CardFooter>
                </Card>
              </Form>
            )}
          </Formik>
        </Col>
      </div>
      {/* </ProtectedRoute> */}
    </Layout>
  );
};

export default AddRegion;
