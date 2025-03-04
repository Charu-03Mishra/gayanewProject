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
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import localStorage from "@/utils/localStorage";
import { useRouter } from "next/router";

const AddChapters = () => {
  const router = useRouter();
  const token = localStorage.getItem("signIn");
  const [regionData, setRegionData] = useState([]);

  const initialValues = {
    chapterName: "",
    isLaunched: false,
    coffeeTable: false,
    meetingDay: "",
    meetingTime: "",
    launchedDate: "",
    region: "",
    state: "",
    country: "",
    weekly_meeting_fees:"",
    opening_balance: "",
    kitty_balance:""
  };

  const validationSchema = Yup.object().shape({
    chapterName: Yup.string().required("Chapter Name is required"),
    meetingDay: Yup.string().required("Meeting Day is required"),
    meetingTime: Yup.string().required("Meeting Time is required"),
    launchedDate: Yup.string().required("Launched Date is required"),
    region: Yup.string().required("Region is required"),
    state: Yup.string().required("State is required"),
    country: Yup.string().required("Country is required"),
    weekly_meeting_fees: Yup.string().required("Weekly Meeting Fees is required"),
    opening_balance: Yup.string().required("Opening Balance is required")
  });

  const handleSubmit = async (
    values: any,
    actions: { resetForm: () => void }
  ) => {
    try {
      const data = {
        chapter_id: Math.floor(Math.random() * 1000) + 1,
        chapter_name: values.chapterName,
        is_launched: values.isLaunched,
        coffee_table: values.coffeeTable,
        meeting_day: values.meetingDay,
        meeting_time: values.meetingTime,
        region_id: values.region,
        launched_date: values.launchedDate,
        state: values.state,
        country: values.country,
        weekly_meeting_fees: values.weekly_meeting_fees,
        opening_balance: values.opening_balance,
        kitty_balance: values.kitty_balance
      };
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`/api/chapters`, data, config);

      if (response.status === 201) {
        toast.success(response.data.message);
        router.push("/comman_pages/chapters/list_chapter")
      }

      actions.resetForm();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (typeof window !== "undefined" && window.localStorage) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        try {
          const response = await axios.get("/api/region", config);
          setRegionData(response.data);
        } catch (error) {
          console.error("Error fetching region data:", error);
        }
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <div className="page-body">
        <Col xl="12">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="theme-form">
                <Card>
                  <CardHeaderCommon
                    title="Add Chapters"
                    tagClass="card-title mb-0"
                  />
                  <CardBody>
                    <Row>
                      <Col md="5">
                        <FormGroup>
                          <Label>Chapter Name</Label>
                          <Field
                            type="text"
                            name="chapterName"
                            className="form-control"
                            placeholder="Chapter Name"
                          />
                          <ErrorMessage
                            name="chapterName"
                            component="div"
                            className="text-danger"
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="3">
                        <FormGroup check className="checkbox-checked">
                          <Label check>
                            <Field
                              type="checkbox"
                              name="isLaunched"
                              as={Input}
                            />
                            Is Launched
                          </Label>
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="4">
                        <FormGroup check className="checkbox-checked">
                          <Label check>
                            <Field
                              type="checkbox"
                              name="coffeeTable"
                              id="coffeeTable"
                              as={Input}
                            />
                            Coffee Table
                          </Label>
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="6">
                        <FormGroup>
                          <Label>Meeting Day</Label>
                          <Field
                            type="text"
                            name="meetingDay"
                            placeholder="e.g., Monday"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="meetingDay"
                            component="div"
                            className="text-danger"
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="6">
                        <FormGroup>
                          <Label>Meeting Time</Label>
                          <Field
                            type="time"
                            name="meetingTime"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="meetingTime"
                            component="div"
                            className="text-danger"
                          />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label>Launched Date</Label>
                          <Field
                            type="date"
                            name="launchedDate"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="launchedDate"
                            component="div"
                            className="text-danger"
                          />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label>Region</Label>
                          <Field
                            as="select"
                            name="region"
                            className="form-select"
                          >
                            <option>Select</option>
                            {regionData?.map((option: any, index) => (
                              <option key={index} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="region"
                            component="div"
                            className="text-danger"
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="6">
                        <FormGroup>
                          <Label>State</Label>
                          <Field
                            type="text"
                            name="state"
                            placeholder="State"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="state"
                            component="div"
                            className="text-danger"
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="6">
                        <FormGroup>
                          <Label>Country</Label>
                          <Field
                            type="text"
                            name="country"
                            placeholder="Country"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="country"
                            component="div"
                            className="text-danger"
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="6">
                        <FormGroup>
                          <Label>Weekly Meeting Fees</Label>
                          <Field
                            type="number"
                            name="weekly_meeting_fees"
                            placeholder="Enter weekly meeting fees"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="weekly_meeting_fees"
                            component="div"
                            className="text-danger"
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="6">
                        <FormGroup>
                          <Label>Opening Balance</Label>
                          <Field
                            type="number"
                            name="opening_balance"
                            placeholder="Enter opening balance"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="opening_balance"
                            component="div"
                            className="text-danger"
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="6">
                        <FormGroup>
                          <Label>Kitty Balance</Label>
                          <Field
                            type="number"
                            name="kitty_balance"
                            placeholder="Enter kitty balance"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="kitty_balance"
                            component="div"
                            className="text-danger"
                          />
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
    </Layout>
  );
};

export default AddChapters;
