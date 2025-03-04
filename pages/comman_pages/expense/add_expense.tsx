import Layout from "@/pages/Layout/Layout";
// import ProtectedRoute from "@/pages/components/ProtectedRoute";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import React, { use, useEffect, useState } from "react";
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
import CardHeaderCommon from "@/pages/components/CardHeaderCommon/CardHeaderCommon";
import axios from "axios";
import { toast } from "react-toastify";
import localStorage from "@/utils/localStorage";
import { useRouter } from "next/router";

const expenseHeadOptions = [
  {value: "COFFEE MEETINGS", label: "COFFEE MEETINGS"},
  {value: "DECORATION", label: "DECORATION"},
  {value: "ELECTRCAL REPAIR", label: "ELECTRCAL REPAIR"},
  {value: "GIFTING", label: "GIFTING"},
  {value: "GRAPHIC DESIGN", label: "GRAPHIC DESIGN"},
  {value: "HOTEL FOOD", label: "HOTEL FOOD"},
  {value: "LED", label: "LED"},
  {value: "LTMC MEETING", label: "LTMC MEETING"},
  {value: "LTRT", label: "LTRT"},
  {value: "OFFICE & MISC EXP", label: "OFFICE & MISC EXP"},
  {value: "PHOTOGRAPHY", label: "PHOTOGRAPHY"},
  {value: "PRINTING", label: "PRINTING"},
  {value: "PT WORKSHOP", label: "PT WORKSHOP"},
  {value: "SOCIAL", label: "SOCIAL"},
  {value: "SOUND MIKE", label: "SOUND MIKE"},
  {value: "TROPHIES", label: "TROPHIES"}
];


const AddExpense = () => {
  const router = useRouter();
  const token = localStorage.getItem("signIn");
  const [vendorData, setVendorData] = useState([]);
  const [chaptersData, setChaptersData] = useState([]);
  const [ltData, setLtData] = useState<any>({})
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const memberDetail = JSON.parse(localStorage.getItem("members_detail"));
  const role = localStorage.getItem("role");
  const vendorDetails = JSON.parse(localStorage.getItem("vendor-details"));

  const validationSchema = Yup.object().shape({
    chapterName: Yup.string().required("Chapter Name is required"),
    dateOfMeeting: Yup.date().required("Date Of Meeting is required"),
    expense: Yup.string().required("Expense is required"),
    expenseType: Yup.string().required("Expense Type is required"),
    expenseHead: Yup.string().required("Expense Head is required"),
    vendorName: Yup.string().required("Vendor Name is required"),
    amount: Yup.number().required("Amount is required"),
    invoice_no: Yup.string().required("Invoice number is required")
  });

  const handleFileChange = (event: any) => {
    const file = event.currentTarget.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = async (
    values: any,
    actions: { resetForm: () => void }
  ) => {
    try {
      const formData = new FormData();
      formData.append("chapter_id", values.chapterName);
      formData.append("date_of_meeting", values.dateOfMeeting);
      formData.append("expense", values.expense);
      formData.append("expense_type", values.expenseType);
      formData.append("expense_head", values.expenseHead);
      formData.append("vendor_id", values.vendorName);
      formData.append("amount", values.amount);
      formData.append("invoice_no", values.invoice_no);
      formData.append("document", selectedFile);
      formData.append("status", "pending");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`/api/expense`, formData, config);
      console.log("response", response);
      
      if (response.status === 201) {
        router.push("/comman_pages/expense/list_expense");
        toast.success(response.data.message);
        fetch("/api/restart-pm2", {
          method: "POST",
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('data', data); // Log the response from the PM2 restart
          })
          .catch((error) => {
            console.error("Error restarting PM2:", error); // Handle any fetch errors
          });
        actions.resetForm();
      }else if(response.status === 200){
        toast.error(response.data.message);
      }

    } catch (error) {
      console.error("Error:", error);
    }
  };

  const vendorFetchData = async () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const response = await axios.get("/api/vendor", config);
        let filterVendor: any;
        if(role === "vendor"){
          filterVendor = response.data?.filter(
            (value: any) => value?.id === vendorDetails?.id
          );
        } else {
          filterVendor = response.data;
        }
        setVendorData(filterVendor);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }
    }
  };

  const fetchLTData = async () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const response = await axios.get("/api/leadership", config);
        const ltFilterData = response.data?.find(
          (value: any) => value?.id === memberDetail?.permission_LT
        );
        setLtData(ltFilterData);
      } catch (error) {
        console.error("Error fetching leadership data:", error);
      }
    }
  }

  const fetchData = async () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const response = await axios.get("/api/chapters", config);
        let chapterFilterData: any;
        if(role === "admin" || role === "vendor"){
          chapterFilterData = response.data
        } else {
          chapterFilterData = response.data?.filter(
            (value: any) => value?.id === ltData?.chapter_id
          );
        }
        setChaptersData(chapterFilterData);
      } catch (error) {
        console.error("Error fetching chapters data:", error);
      }
    }
  };
  useEffect(() => {
    fetchData();
  }, [token, ltData]);

  useEffect(() => {
    vendorFetchData();
  }, [token]);

  useEffect(() => {
    if(memberDetail && memberDetail?.permission_LT !== null){
      fetchLTData()
    }
  }, [token])

  return (
    <Layout>
        <div className="page-body">
          <Col xl="12">
            <Formik
              initialValues={{
                chapterName: "",
                dateOfMeeting: "",
                expense: "",
                expenseType: "",
                expenseHead: "",
                vendorName: "",
                amount: "",
                invoice_no: "",
                document: null,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }: any) => (
                <Form className="theme-form" encType="multipart/form-data">
                  <Card>
                    <CardHeaderCommon
                      title="Add Expense"
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
                            <Label>Date Of Meeting</Label>
                            <Field
                              type="date"
                              name="dateOfMeeting"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="dateOfMeeting"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="4">
                          <FormGroup>
                            <p>Expense</p>
                            <Label check className="checkbox-checked me-2">
                              <Field
                                type="radio"
                                name="expense"
                                value="actual"
                                className="form-check-input"
                              />{" "}
                              Actual
                            </Label>
                            <Label check className="checkbox-checked">
                              <Field
                                type="radio"
                                name="expense"
                                value="advance"
                                className="form-check-input"
                              />{" "}
                              Advance
                            </Label>
                            <ErrorMessage
                              name="expense"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm="6" md="4">
                          <FormGroup>
                            <p>Expense Type</p>
                            <Label check className="checkbox-checked me-2">
                              <Field
                                type="radio"
                                name="expenseType"
                                value="Meeting"
                                className="form-check-input"
                              />{" "}
                              Meeting
                            </Label>
                            <Label check className="checkbox-checked">
                              <Field
                                type="radio"
                                name="expenseType"
                                value="Others"
                                className="form-check-input"
                              />{" "}
                              Others
                            </Label>
                            <ErrorMessage
                              name="expenseType"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Expense Head</Label>
                            <Field
                              as="select"
                              name="expenseHead"
                              className="form-control"
                            >
                              <option value="">Select</option>
                              {expenseHeadOptions?.map((option: any, index) => (
                                <option key={index} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="expenseHead"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Vendor Name</Label>
                            <Field
                              as="select"
                              name="vendorName"
                              className="form-control"
                            >
                              <option value="">Select</option>
                              {vendorData?.map((option: any, index) => (
                                <option key={index} value={option.id}>
                                  {option.vendor_name}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="vendorName"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Amount</Label>
                            <Field
                              type="number"
                              name="amount"
                              className="form-control"
                              placeholder="Enter Amount"
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
                            <Label>Invoice Number</Label>
                            <Field
                              type="text"
                              name="invoice_no"
                              className="form-control"
                              placeholder="Enter Bill Invoice Number"
                            />
                            <ErrorMessage
                              name="invoice_no"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Document</Label>
                            <input
                              type="file"
                              id="document"
                              name="document"
                              className="form-control"
                              onChange={handleFileChange}
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
          </Col>
        </div>
    </Layout>
  );
};

export default AddExpense;
