import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  Card,
  CardBody,
  Col,
  FormGroup,
  Label,
  Row,
  Input,
} from "reactstrap";
import CardHeaderCommon from "@/pages/components/CardHeaderCommon/CardHeaderCommon";
import * as Yup from "yup";
import Btn from "@/pages/components/button";
import axios from "axios";
import localStorage from "@/utils/localStorage";
import { useRouter } from "next/router";
import moment from "moment";
import Link from "next/link";
import { generateInvoiceNumber } from "@/utils/utils";
import { toast } from "react-toastify";

const validationSchema = Yup.object().shape({
  fullName: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  gstNo: Yup.string().required("GST No is required"),
  chapterName: Yup.string().required("Chapter Name is required"),
  primaryNumber: Yup.string().required("Phone Number is required"),
});
const Index = () => {
  const router = useRouter();
  const [chaptersData, setChaptersData] = useState([]);
  const amount = 800;
  const [cgst, setCGST] = useState(0);
  const [sgst, setSGST] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const initialValues = {
    fullName: "",
    email: "",
    gstNo: "",
    chapterName: "",
    primaryNumber: "",
    internetHandlingFee: false,
    nonRefundable: false,
  };

  const handleOnlinePayment = async (values) => {
    try {
      const data = {
        visitor_name: values.fullName,
        phone_no: values.primaryNumber,
        email: values.email,
        gst: values.gstNo,
        chapter: values.chapterName
      };

      const responseVisitor = await axios.post(`/api/visitor`, data);
      if(responseVisitor.status === 201){
        localStorage.setItem("visitorId", responseVisitor.data.visitor?.id);
      }
    } catch (error) {
      console.error("Error:", error);
    }

    const res = await initializeRazorpay();

    if (!res) {
      alert("Razorpay SDK Failed to load");
      return;
    }

    try {
      const startDate = new Date();

    const startFormattedDate = moment(startDate).format("YYYY-MM-DD");

    const Amount = totalAmount * 100
      const resOrder = await axios.post("/api/create-order", {
        amount: Amount.toFixed(0),
        currency: "INR",
        chapter_id:values.chapterName,
        gstin: values.gstNo,
        member_email: values.email,
        member_name: values.fullName,
        member_phone: values.primaryNumber,
        remark: "BNI Chapter Visitor Fees",
        type: "visitor_fees",
        // start_at: startFormattedDate,
      });

      if(resOrder.status === 200){
        const VisitorId = localStorage.getItem("visitorId");
        const resPayment = await axios.post("/api/rzp_payments", {
          member_id: VisitorId,
          chapter_id: values.chapterName,
          payment_type: "visitor fees",
          amount: amount,
          discount: 0,
          sgst: sgst,
          cgst: cgst,
          total_amount: totalAmount,
          order_id: resOrder.data?.id,
          mode: "online",
          // invoice_no: await generateInvoiceNumber("GB"),
          email: values?.email,
          status: "pending",
          contact: values.primaryNumber,
          start_payment_date: startFormattedDate,
          end_payment_date: startFormattedDate
        });
      }
      const options = {
        key: process.env.RAZORPAY_KEY,
        currency: resOrder.data?.currency,
        amount: resOrder.data?.amount,
        order_id: resOrder.data?.id,
        description: "Visitor Fees Payment",
        prefill: {
          name: values.fullName,
          email: values?.email,
          contact: values.primaryNumber,
        },
        image: "/assets/images/logo/bni_surat_logo.png",
        handler: async function (response) {
          if (response.razorpay_payment_id) {
            localStorage.removeItem("visitorId")
                  router.replace('/');
                  toast.success("Visitor payment successfully!")
            // const responsePayment = await axios.get(
            //   `/api/payment/${response.razorpay_payment_id}`,
            //   {
            //     headers: {
            //       Authorization: `Bearer ${localStorage.getItem("signIn")}`,
            //     },
            //   }
            // );

            // if (responsePayment?.status === 200) {
            //   const VisitorId = localStorage.getItem("visitorId");
            //   try {
            //     const resPayment = await axios.post("/api/rzp_payments", {
            //       member_id: VisitorId,
            //       chapter_id: values.chapterName,
            //       payment_id: response.razorpay_payment_id,
            //       payment_type: "visitor fees",
            //       entity: responsePayment.data?.entity,
            //       amount: amount,
            //       sgst: sgst,
            //       cgst: cgst,
            //       total_amount: totalAmount,
            //       currency: responsePayment.data?.currency,
            //       status: responsePayment.data?.status,
            //       order_id: response.razorpay_order_id,
            //       invoice_no: generateInvoiceNumber(),
            //       email: values?.email,
            //       contact: values.primaryNumber,
            //       start_payment_date: startFormattedDate,
            //       end_payment_date: startFormattedDate
            //     });
            //     if(resPayment.status === 200){
            //       localStorage.removeItem("visitorId")
            //       router.replace('/');
            //     }
            //   } catch (err) {
            //     console.log("payment error", err);
            //   }
            // }
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/chapters");
        setChaptersData(response.data);
      } catch (error) {
        console.error("Error fetching chapters data:", error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const cgstAmount = amount * 0.09;
    const sgstAmount = amount * 0.09;
    const total = amount + cgstAmount + sgstAmount;

    setCGST(cgstAmount);
    setSGST(sgstAmount);
    setTotalAmount(total);
  }, [amount]);
  return (
    <div>
      <Row>
        <Col xl="12">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
              setSubmitting(false);
            }}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="theme-form">
                <Card>
                <div className="d-flex align-items-center">
                  <Link href="/">
                    <i className="fa fa-chevron-left ms-4 fs-4 text-black"></i>
                  </Link>
                  <CardHeaderCommon
                    title="Visitor Payment"
                    tagClass="card-title mb-0"
                  />
                  </div>
                  <CardBody>
                    <Row>
                      <Col md="4">
                        <FormGroup>
                          <Label>Your Name</Label>
                          <Field
                            type="text"
                            name="fullName"
                            className="form-control"
                            placeholder="Enter your full name"
                          />
                          <ErrorMessage
                            name="fullName"
                            component="div"
                            className="text-danger"
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label>Phone Number</Label>
                          <Field
                            type="text"
                            name="primaryNumber"
                            className="form-control"
                            placeholder="Phone Number"
                          />
                          <ErrorMessage
                            name="primaryNumber"
                            component="div"
                            className="text-danger"
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label>Email</Label>
                          <Field
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="Email"
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="text-danger"
                          />
                        </FormGroup>
                      </Col>
                      
                      <Col md="4">
                        <FormGroup>
                          <Label>GST No</Label>
                          <Field
                            type="text"
                            name="gstNo"
                            className="form-control"
                            placeholder="GST No"
                          />
                          <ErrorMessage
                            name="gstNo"
                            component="div"
                            className="text-danger"
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label>Chapter Name</Label>
                          <Field
                            as="select"
                            name="chapterName"
                            className="form-select"
                          >
                            <option>Select</option>
                            {chaptersData?.map((option, index) => (
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
                      
                    </Row>
                    <div className="table-responsive">
                      <table className="table table-lg">
                        <thead>
                          <tr>
                            <th>Description</th>
                            <th>Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <h6 className="mb-0">Chapter Meeting Visit Fees</h6>
                              <span className="text-muted d-none">
                                Chapter Meeting Visit Fees
                              </span>
                            </td>
                            <td className="font-weight-semibold">₹{amount}</td>
                          </tr>
                          
                        </tbody>
                      </table>
                    </div>
                    <CardBody>
                      <Row>
                        <Col md="8"></Col>
                        <Col md="4">
                      <div className="">
                        <div className="pt-2 mb-3">
                          <h6 className="mb-3">Total due</h6>
                          <div className="table-responsive">
                            <table className="table">
                              <tbody>
                                <tr>
                                  <th>Subtotal:</th>
                                  <td className="text-end">
                                    ₹{amount.toFixed(0)}
                                  </td>
                                </tr>
                                <tr>
                                  <th>CGST (9%):</th>
                                  <td className="text-end">
                                    ₹{cgst.toFixed(2)}
                                  </td>
                                </tr>
                                <tr>
                                  <th>SGST (9%):</th>
                                  <td className="text-end">
                                    ₹{sgst.toFixed(2)}
                                  </td>
                                </tr>
                                <tr className="border-0">
                                  <th>Total :</th>
                                  <td className="text-end">
                                    ₹{Math.floor(totalAmount)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                        </Col>
                      </Row>
                    </CardBody>
                    <CardBody>
                      <hr />
                      <FormGroup check className="checkbox-checked">
                        <Label check>
                          <Field
                            type="checkbox"
                            name="internetHandlingFee"
                            id="internetHandlingFee"
                            as={Input}
                          />
                          I understand and agree that Internet Handling Fee will
                          be added to this amount upon my selection of payment
                          mode.
                        </Label>
                      </FormGroup>
                      <FormGroup check className="checkbox-checked">
                        <Label check>
                          <Field
                            type="checkbox"
                            name="nonRefundable"
                            id="nonRefundable"
                            as={Input}
                          />
                          I understand and agree that upon my acceptance to BNI,
                          fees are non-refundable without exception. Terms &
                          Conditions
                        </Label>
                      </FormGroup>
                      <hr />
                    </CardBody>

                    <Col md="12" className="text-end">
                      {values.internetHandlingFee &&
                        values.nonRefundable &&
                          <Btn
                            type="button"
                            color="primary"
                            onClick={() => handleOnlinePayment(values)}
                          >
                            Pay Now {" "}<i className="fa fa-send"></i>
                          </Btn>
                        }
                    </Col>
                  </CardBody>
                </Card>
              </Form>
            )}
          </Formik>
        </Col>
      </Row>
    </div>
  );
};

export default Index;
