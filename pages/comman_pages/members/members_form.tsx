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
import localStorage from "@/utils/localStorage";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const validationSchema = Yup.object().shape({
  chapterName: Yup.string().required("Chapter Name is required"),
  memberName: Yup.string().required("Member Name is required"),
  amount: Yup.number().required("Amount is required"),
  payment_made: Yup.string().required("Payment method is required"),
  mfEndDate: Yup.date().required("Meeting Fee End Date is required"),
});

const MembersForm = () => {
  const router = useRouter();
  const token = localStorage.getItem("signIn");
  const [chaptersData, setChaptersData] = useState([]);
  const [membersData, setMembersData] = useState([]);

  const handleChapterChange = async (chapterId: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`/api/members/members_form?chapterId=${chapterId}`, config);
      setMembersData(response.data);
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
        chapter_id: values.chapterName,
        member_id: values.memberName,
        amount: values.amount,
        payment_made: values.payment_made,
        mf_end_date: values.mfEndDate,
      };
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`/api/members/members_form`, data, config);
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
    const fetchChapters = async () => {
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

    fetchChapters();
  }, [token]);

  return (
    <Layout>
      <div className="page-body">
        <Col xl="12">
          <Formik
            initialValues={{
              chapterName: "",
              memberName: "",
              amount: "",
              payment_made: "",
              mfEndDate: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue }: any) => (
              <Form className="theme-form">
                <Card>
                  <CardHeaderCommon
                    title="Offline Meeting Fees"
                    tagClass={"card-title mb-0"}
                  />
                  <CardBody>
                    <Row>
                      <Col sm="6" md="4">
                        <FormGroup>
                          <Label>Chapter Name</Label>
                          <Field
                            as="select"
                            name="chapterName"
                            className="form-select"
                            onChange={(e: any) => {
                              setFieldValue("chapterName", e.target.value);
                              handleChapterChange(e.target.value);
                            }}
                          >
                            <option>Select</option>
                            {chaptersData?.map((chapter: any) => (
                              <option key={chapter.id} value={chapter.id}>
                                {chapter.chapter_name}
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
                          <Label>Member Name</Label>
                          <Field
                            as="select"
                            name="memberName"
                            className="form-select"
                          >
                            <option>Select</option>
                            {membersData?.map((member: any) => (
                              <option key={member.id} value={member.id}>
                                {`${member.first_name} ${member.last_name}`}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="memberName"
                            component="div"
                            className="text-danger"
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="4">
                        <FormGroup>
                          <Label>Amount</Label>
                          <Field
                            type="number"
                            name="amount"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="amount"
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
                      <Col sm="6" md="4">
                        <FormGroup>
                          <Label>Payment Made</Label>
                          <Field
                            as="select"
                            name="payment_made"
                            className="form-select"
                          >
                            <option>Select</option>
                            <option value="online">Online</option>
                            <option value="cheque">Cheque</option>
                          </Field>
                          <ErrorMessage
                            name="payment_made"
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

export default MembersForm;
