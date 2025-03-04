'use client'
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import Btn from "../../components/button";
import Layout from "../../Layout/Layout";
import CardHeaderCommon from "../../components/CardHeaderCommon/CardHeaderCommon";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import localStorage from "@/utils/localStorage";
import { useRouter } from "next/router";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  const token = localStorage.getItem("signIn");
  const [regionData, setRegionData] = useState<any>(null);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const validationSchema = Yup.object().shape({
    regionName: Yup.string().required("Region Name is required"),
    isLaunched: Yup.boolean(),
  });

  const handleSubmit = async (
    values: any,
    actions: { resetForm: () => void }
  ) => {
    try {
      const data = {
        name: values.regionName,
        is_launched: values.isLaunched,
      };

      const response = await axios.put(
        `/api/region/${Number(id)}`,
        data,
        config
      );

      if (response.status === 200) {
        toast.success(response.data.message);
        router.push("/comman_pages/region/list_region");
      }

      actions.resetForm();
    } catch (error: any) {
      toast.error(error.response.data?.error || error.response.data?.message);
    }
  };

  const fetchRegionData = async () => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const response = await axios.get(`/api/region/${Number(id)}`, config);
        setRegionData(response.data);
      } catch (error) {
        console.error("Error fetching region data:", error);
      }
    }
  };
  useEffect(() => {
      fetchRegionData();
  }, [id]);

  return (
    <Layout>
      <div className="page-body">
        <Col xl="8">
          {regionData && (
            <Formik
              initialValues={{
                regionName: regionData?.name || "",
                isLaunched: regionData?.is_launched || false,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, touched, errors, setFieldValue, values }: any) => (
                <Form>
                  <Card>
                    <CardHeaderCommon
                      title="Edit Region"
                      tagClass={"card-title mb-0"}
                    />
                    <CardBody>
                      <Row>
                        <Col md="12">
                          <FormGroup>
                            <Label>Region Name</Label>
                            <Field
                              name="regionName"
                              placeholder="Region Name"
                              type="text"
                              className={`form-control ${
                                touched.regionName &&
                                `${
                                  errors.regionName ? "is-invalid" : "is-valid"
                                }`
                              }`}
                            />
                            <ErrorMessage
                              name="regionName"
                              component="div"
                              className="invalid-feedback"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="3">
                          <FormGroup check className="checkbox-checked">
                            <Label check>
                              <Input
                                type="checkbox"
                                name="isLaunched"
                                checked={values.isLaunched}
                                onChange={() => {
                                  setFieldValue(
                                    "isLaunched",
                                    !values.isLaunched
                                  );
                                }}
                              />{" "}
                              Is Launched
                            </Label>
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
        </Col>
      </div>
    </Layout>
  );
};

export default Index;
