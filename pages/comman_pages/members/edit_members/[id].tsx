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
import Btn from "../../../components/button";
import Layout from "../../../Layout/Layout";
import CardHeaderCommon from "../../../components/CardHeaderCommon/CardHeaderCommon";
// import ProtectedRoute from "@/pages/components/ProtectedRoute";
import localStorage from "@/utils/localStorage";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import moment from "moment";

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  title: Yup.string().required("Title is required"),
  companyName: Yup.string().required("Company Name is required"),
  gstNumber: Yup.string().required("GST No. is required"),
  role: Yup.string().required("Role is required"),
  chapterName: Yup.string().required("Chapter Name is required"),
  phoneNumber: Yup.string().required("Phone No. is required"),
  profession: Yup.string().required("Profession is required"),
  speciality: Yup.string().required("Speciality is required"),
  // mfStartDate: Yup.date().required("MF Start Date is required"),
  // mfEndDate: Yup.date().required("MF End Date is required"),
  // manualInduction: Yup.date().required("Manual Induction is required"),
  // membershipStartDate: Yup.date().required(
  //   "Membership Start Date is required"
  // ),
  // membershipEndDate: Yup.date().required("Membership End Date is required"),
});

const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  const memberId = Number(id);
  const token = localStorage.getItem("signIn");
  const [chaptersData, setChaptersData] = useState([]);
  const [memberData, setMemberData] = useState<any>(null);

  const fetchMemberData = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.get(`/api/members/${memberId}`, config);
      setMemberData(response.data);
      // Create a new Date object
    } catch (error) {
      console.error("Error fetching members data:", error);
    }
  };
  const handleSubmit = async (
    values: any,
    actions: { resetForm: () => void }
  ) => {
    try {
      const data = {
        membership_id: Math.floor(Math.random() * 1000) + 1,
        title: values.title,
        first_name: values.firstName,
        last_name: values.lastName,
        company_name: values.companyName,
        gst_no: values.gstNumber,
        add_line_1: values.add_line_1,
        add_line_2: values.add_line_2,
        city: values.city,
        state: values.state,
        postcode: values.postcode,
        role: values.role,
        profession: values.profession,
        speciality: values.speciality,
        chapter_id: values.chapterName,
        primary_number: values.phoneNumber,
        email: values.email,
        mf_start_date: values.mfStartDate || null,
        mf_end_date: values.mfEndDate || null,
        membership_start_date: values.membershipStartDate || null,
        membership_end_date: values.membershipEndDate || null,
        manual_induction: values.manualInduction || null,
        outstanding_balance: values.outstandingBalance
      };
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(
        `/api/members/${memberId}`,
        data,
        config
      );

      if (response.status === 200) {
        toast.success("Member updated successfully");
        router.replace("/comman_pages/members/list_members");
      }

      actions.resetForm();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, [memberId, token]);
  useEffect(() => {
    const fetchData = async () => {
      if (typeof window !== "undefined" && window.localStorage) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        try {
          const response = await axios.get("/api/chapters", config);
          setChaptersData(response.data);
        } catch (error) {
          console.error("Error fetching chapters data:", error);
        }
      }
    };

    fetchData();
  }, [token]);
  return (
    <Layout>
      <div className="page-body">
        <Col xl="12">
          {memberData && (
            <Formik
              initialValues={{
                firstName: memberData.first_name,
                lastName: memberData?.last_name || "",
                email: memberData?.email || "",
                title: memberData?.title || "",
                companyName: memberData?.company_name || "",
                gstNumber: memberData?.gst_no || "",
                add_line_1: memberData?.add_line_1 || "",
                add_line_2: memberData?.add_line_2 || "",
                city: memberData?.city || "",
                state: memberData?.state || "",
                postcode: memberData?.postcode || "",
                role: memberData?.role || "",
                chapterName: memberData?.chapter_id || "",
                phoneNumber: memberData?.primary_number || "",
                profession: memberData?.profession || "",
                speciality: memberData?.speciality || "",
                outstandingBalance: memberData?.outstanding_balance || "",
                mfStartDate:
                  moment(memberData?.mf_start_date).format("YYYY-MM-DD") || "",
                mfEndDate:
                  moment(memberData?.mf_end_date).format("YYYY-MM-DD") || "",
                manualInduction:
                  moment(memberData?.manual_induction).format("YYYY-MM-DD") ||
                  "",
                membershipStartDate:
                  moment(memberData?.membership_start_date).format(
                    "YYYY-MM-DD"
                  ) || "",
                membershipEndDate:
                  moment(memberData?.membership_end_date).format(
                    "YYYY-MM-DD"
                  ) || "",
              }}
              // validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }: any) => (
                <Form className="theme-form">
                  <Card>
                    <CardHeaderCommon
                      title="Edit Members"
                      tagClass={"card-title mb-0"}
                    />
                    <CardBody>
                      <Row>
                        <Col md="4">
                          <FormGroup>
                            <Label>First Name</Label>
                            <Field
                              type="text"
                              name="firstName"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="firstName"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="4">
                          <FormGroup>
                            <Label>Last Name</Label>
                            <Field
                              type="text"
                              name="lastName"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="lastName"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="4">
                          <FormGroup>
                            <Label>Email</Label>
                            <Field
                              type="email"
                              name="email"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="email"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="4">
                          <FormGroup>
                            <Label>Title</Label>
                            <Field
                              type="text"
                              name="title"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="title"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="4">
                          <FormGroup>
                            <Label>Company Name</Label>
                            <Field
                              type="text"
                              name="companyName"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="companyName"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="4">
                          <FormGroup>
                            <Label>GST No.</Label>
                            <Field
                              type="text"
                              name="gstNumber"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="gstNumber"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="6">
                          <FormGroup>
                            <Label>Address</Label>
                            <Field
                              type="text"
                              name="add_line_1"
                              className="form-control"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="6">
                          <FormGroup>
                            <Label>Address 2</Label>
                            <Field
                              type="text"
                              name="add_line_2"
                              className="form-control"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="4">
                          <FormGroup>
                            <Label>City</Label>
                            <Field
                              type="text"
                              name="city"
                              className="form-control"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="4">
                          <FormGroup>
                            <Label>State</Label>
                            <Field
                              type="text"
                              name="state"
                              className="form-control"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="4">
                          <FormGroup>
                            <Label>Pincode</Label>
                            <Field
                              type="number"
                              name="postcode"
                              className="form-control"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="4">
                          <FormGroup>
                            <Label>Role</Label>
                            <Field
                              as="select"
                              name="role"
                              className="form-select"
                            >
                              <option>Select</option>
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                            </Field>
                            <ErrorMessage
                              name="role"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="4">
                          <FormGroup>
                            <Label>Chapter Name</Label>
                            <Field
                              as="select"
                              name="chapterName"
                              className="form-select"
                            >
                              <option>Select</option>
                              {chaptersData?.map((option: any, index) => (
                                <option key={index} value={option.id}>
                                  {option.chapter_name}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="chapterName"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="4">
                          <FormGroup>
                            <Label>Phone No</Label>
                            <Field
                              type="text"
                              name="phoneNumber"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="phoneNumber"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>

                        <Col sm="6" md="4">
                          <FormGroup>
                            <Label>Profession</Label>
                            <Field
                              type="text"
                              name="profession"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="profession"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Speciality</Label>
                            <Field
                              type="text"
                              name="speciality"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="speciality"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Outstanding Balance</Label>
                            <Field
                              type="text"
                              name="outstandingBalance"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="outstandingBalance"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Meeting Fees Start Date</Label>
                            <Field
                              type="date"
                              name="mfStartDate"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="mfStartDate"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Meeting Fees End Date</Label>
                            <Field
                              type="date"
                              name="mfEndDate"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="mfEndDate"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Manual Induction</Label>
                            <Field
                              type="date"
                              name="manualInduction"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="manualInduction"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Membership Start Date</Label>
                            <Field
                              type="date"
                              name="membershipStartDate"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="membershipStartDate"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Membership End Date</Label>
                            <Field
                              type="date"
                              name="membershipEndDate"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="membershipEndDate"
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
        </Col>
      </div>
    </Layout>
  );
};

export default Index;
