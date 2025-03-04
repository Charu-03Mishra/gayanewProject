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
import Btn from "../../components/button";
import Layout from "../../Layout/Layout";
import CardHeaderCommon from "../../components/CardHeaderCommon/CardHeaderCommon";
// import ProtectedRoute from "@/pages/components/ProtectedRoute";
import localStorage from "@/utils/localStorage";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  title: Yup.string().required("Title is required"),
  companyName: Yup.string().required("Company Name is required"),
  role: Yup.string().required("Role is required"),
  chapterName: Yup.string().required("Chapter Name is required"),
  phoneNumber: Yup.string().required("Phone No. is required"),
  profession: Yup.string().required("Profession is required"),
  manualInduction: Yup.date().required("Manual Induction is required"),
  membershipStartDate: Yup.date().required("Membership Start Date is required"),
  membershipEndDate: Yup.date().required("Membership End Date is required"),
});

const AddMembers = () => {
  const router = useRouter();
  const token = localStorage.getItem("signIn");
  const [chaptersData, setChaptersData] = useState([]);

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
        membership_status: values.membershipStatus,
        profession: values.profession,
        speciality: values.speciality,
        chapter_id: values.chapterName,
        primary_number: values.phoneNumber,
        email: values.email,
        mf_start_date: values.mfStartDate || null,
        mf_end_date: values.mfEndDate || null,
        membership_start_date: values.membershipStartDate,
        membership_end_date: values.membershipEndDate,
        manual_induction: values.manualInduction,
        outstanding_balance: values.outstandingBalance
      };
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`/api/members`, data, config);
      if (response.status === 201) {
        router.push("/comman_pages/members/list_members");
        toast.success(response.data.message);
      }

      actions.resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "");
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
          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              title: "",
              companyName: "",
              gstNumber: "",
              add_line_1: "",
              add_line_2: "",
              city: "",
              state: "",
              postcode: "",
              role: "",
              chapterName: "",
              phoneNumber: "",
              membershipStatus: "",
              profession: "",
              specialty: "",
              mfStartDate: "",
              mfEndDate: "",
              manualInduction: "",
              membershipStartDate: "",
              membershipEndDate: "",
              outstandingBalance: ""
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }: any) => (
              <Form className="theme-form">
                <Card>
                  <CardHeaderCommon
                    title="Add Members"
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
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label>Outstanding Balance</Label>
                          <Field
                            type="number"
                            name="outstandingBalance"
                            className="form-control"
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

export default AddMembers;
