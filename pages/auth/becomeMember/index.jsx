import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  Card,
  CardBody,
  Col,
  FormGroup,
  Label,
  Row,
  Button,
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
import { toast } from "react-toastify";
import Loader from "@/pages/Layout/Loader/Loader";
import { generateInvoiceNumber } from "@/utils/utils";

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  companyName: Yup.string().required("Company Name is required"),
  gstNo: Yup.string().required("GST No is required"),
  chapterName: Yup.string().required("Chapter Name is required"),
  primaryNumber: Yup.string().required("Phone Number is required"),
  profession: Yup.string().required("Profession is required"),
  speciality: Yup.string().required("Speciality is required"),
  paymentTerm: Yup.string().required("Payment Term is required"),
  paymentMode: Yup.string().required("Payment Mode is required"),
});
const Index = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [chaptersData, setChaptersData] = useState([]);
  const [memberData, setMemberData] = useState();
  const [amount, setAmount] = useState(0);
  const [cgst, setCGST] = useState(0);
  const [sgst, setSGST] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [subTotalAmount, setSubTotalAmount] = useState(0);
  const [endDate, setEndDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const joiningFees = 5999;

  const initialValues = {
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    gstNo: "",
    chapterName: "",
    primaryNumber: "",
    profession: "",
    speciality: "",
    paymentTerm: "",
    paymentMode: "online",
    internetHandlingFee: false,
    nonRefundable: false,
  };

  const calculateEndDate = (paymentTerm) => {
    const currentDate = new Date();
    const endDate = new Date();

    // Add years to current date based on payment term
    endDate.setFullYear(currentDate.getFullYear() + parseInt(paymentTerm));

    setEndDate(moment(endDate).format("YYYY-MM-DD"));
    setStartDate(moment(currentDate).format("YYYY-MM-DD"));
  };
  const calculatePaymentAmount = (paymentTerm) => {
    switch (paymentTerm) {
      case "1":
        return 39807;
      case "2":
        return 65495;
      case "5":
        return 137075;
      default:
        return 0;
    }
  };

  const handleChequePayment = async (values) => {
    setLoading(true);
    try {
      const data = {
        membership_id: Math.floor(Math.random() * 1000) + 1,
        title: values.title,
        first_name: values.firstName,
        last_name: values.lastName,
        company_name: values.companyName,
        gst_no: values.gstNo,
        membership_status: "inactive",
        profession: values.profession,
        speciality: values.speciality,
        chapter_id: values.chapterName,
        primary_number: values.primaryNumber,
        email: values.email,
      };

      const responseMember = await axios.post(`/api/members`, data);

      if (responseMember.status === 201) {
        localStorage.setItem("memberId", responseMember.data.member?.id);
        setLoading(false);
        router.push({
          pathname: "/chequeDetails",
          query: {
            memberData: JSON.stringify(responseMember.data.member),
            amount: subTotalAmount,
            discount: 0,
            cgst: cgst,
            sgst: sgst,
            total_amount: totalAmount,
            startDate: startDate,
            endDate: endDate,
          },
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      toast.error(error.response?.data?.error);
    }
  };
  const handleOnlinePayment = async (values) => {
    try {
      const data = {
        membership_id: Math.floor(Math.random() * 1000) + 1,
        title: values.title,
        first_name: values.firstName,
        last_name: values.lastName,
        company_name: values.companyName,
        gst_no: values.gstNo,
        role: "member",
        membership_status: "Inactive",
        profession: values.profession,
        speciality: values.speciality,
        chapter_id: values.chapterName,
        primary_number: values.primaryNumber,
        email: values.email,
      };

      const responseMember = await axios.post(`/api/members`, data);
      setMemberData(responseMember?.data?.member);

      if (responseMember.status === 201) {
        localStorage.setItem("memberId", responseMember.data.member?.id);
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
      const Amount = totalAmount * 100;
      const resOrder = await axios.post("/api/create-membership-order", {
        amount: Amount.toFixed(0),
        currency: "INR",
        chapter_id:values.chapterName,
        gstin: values.gstNo,
        member_email: values?.email,
        member_name: `${values.firstName} ${values.lastName}`,
        member_phone: values.primaryNumber,
        remark: "BNI Membership Fees",
        type: "membership_fees",
        start_at: startDate,
        end_at: endDate,
      });

      if(resOrder.status === 200){
        const MemberId = localStorage.getItem("memberId");
        const resPayment = await axios.post("/api/rzp_payments", {
          member_id: MemberId,
          chapter_id: values.chapterName,
          payment_type: "membership fees",
          amount: subTotalAmount,
          discount: 0,
          cgst: cgst,
          sgst: sgst,
          total_amount: totalAmount.toFixed(2),
          mode: "online",
          order_id: resOrder.data?.id,
          status: "pending",
          // invoice_no: await generateInvoiceNumber("BSS"),
          email: values?.email,
          contact: values.primaryNumber,
          start_payment_date: startDate,
          end_payment_date: endDate,
        });
      }
      const options = {
        key: process.env.RAZORPAY_BSS_KEY,
        name: memberData?.company_name,
        currency: resOrder.data?.currency,
        amount: resOrder.data?.amount,
        order_id: resOrder.data?.id,
        description: "Membership Fees Payment",
        prefill: {
          name: `${values.firstName} ${values.lastName}`,
          email: values?.email,
          contact: values.primaryNumber,
        },
        image: "/assets/images/logo/bni_surat_logo.png",
        handler: async function (response) {
          if (response.razorpay_payment_id) {
            localStorage.removeItem("memberId");
            router.replace("/auth/payment/paymentRes");
            // const responsePayment = await axios.get(
            //   `/api/payment/${response.razorpay_payment_id}`,
            //   {
            //     headers: {
            //       Authorization: `Bearer ${localStorage.getItem("signIn")}`,
            //     },
            //   }
            // );

            // if (responsePayment?.status === 200) {
            //   try {
            //     const MemberId = localStorage.getItem("memberId");
            //     //update membership status
            //     await axios.put(`/api/members/${MemberId}`, {
            //       membership_id: Math.floor(Math.random() * 1000) + 1,
            //       title: values.title,
            //       first_name: values.firstName,
            //       last_name: values.lastName,
            //       company_name: values.companyName,
            //       gst_no: values.gstNo,
            //       membership_status: "active",
            //       profession: values.profession,
            //       speciality: values.speciality,
            //       chapter_id: values.chapterName,
            //       primary_number: values.primaryNumber,
            //       email: values.email,
            //       membership_start_date: startDate,
            //       membership_end_date: endDate,
            //     });
            //     const resPayment = await axios.post("/api/rzp_payments", {
            //       member_id: MemberId,
            //       chapter_id: values.chapterName,
            //       payment_id: response.razorpay_payment_id,
            //       payment_type: "membership fees",
            //       entity: responsePayment.data?.entity,
            //       amount: subTotalAmount,
            //       cgst: cgst,
            //       sgst: sgst,
            //       total_amount: totalAmount,
            //       mode: "online",
            //       currency: responsePayment.data?.currency,
            //       status: responsePayment.data?.status,
            //       order_id: response.razorpay_order_id,
            //       invoice_no: generateInvoiceNumber(),
            //       email: values?.email,
            //       contact: values.primaryNumber,
            //       start_payment_date: startDate,
            //       end_payment_date: endDate,
            //     });
            //     localStorage.removeItem("memberId");
            //   } catch (err) {
            //     console.log("payment error", err);
            //   }
            // }
            // router.replace("/auth/payment/paymentRes");
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
    const subTotal = joiningFees + amount;
    const cgstAmount = subTotal * 0.09;
    const sgstAmount = subTotal * 0.09;
    const total = subTotal + cgstAmount + sgstAmount;

    setSubTotalAmount(subTotal);
    setCGST(cgstAmount);
    setSGST(sgstAmount);
    setTotalAmount(total);
  }, [amount]);
  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
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
                        title="BNI Membership Fee (New)"
                        tagClass="card-title mb-0"
                      />
                    </div>
                    <CardBody>
                      <Row>
                        <Col md="4">
                          <FormGroup>
                            <Label>Title</Label>
                            <Field
                              as="select"
                              name="title"
                              className="form-select"
                            >
                              <option>Select</option>
                              <option value="mr">Mr</option>
                              <option value="mrs">Mrs</option>
                            </Field>
                            <ErrorMessage
                              name="title"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>

                        <Col md="4">
                          <FormGroup>
                            <Label>First Name</Label>
                            <Field
                              type="text"
                              name="firstName"
                              className="form-control"
                              placeholder="First Name"
                            />
                            <ErrorMessage
                              name="firstName"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Last Name</Label>
                            <Field
                              type="text"
                              name="lastName"
                              className="form-control"
                              placeholder="Last Name"
                            />
                            <ErrorMessage
                              name="lastName"
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
                            <Label>Company Name</Label>
                            <Field
                              type="text"
                              name="companyName"
                              className="form-control"
                              placeholder="Company Name"
                            />
                            <ErrorMessage
                              name="companyName"
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
                            <Label>Profession</Label>
                            <Field
                              type="text"
                              name="profession"
                              className="form-control"
                              placeholder="Profession"
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
                              placeholder="Speciality"
                            />
                            <ErrorMessage
                              name="speciality"
                              component="div"
                              className="text-danger"
                            />
                          </FormGroup>
                        </Col>
                        <Row>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="paymentTerm">Payment Term</Label>
                              <Field
                                as="select"
                                name="paymentTerm"
                                id="paymentTerm"
                                className="form-select"
                                onChange={(e) => {
                                  const calculatedAmount =
                                    calculatePaymentAmount(e.target.value);
                                  calculateEndDate(e.target.value);
                                  setAmount(calculatedAmount);
                                  setFieldValue("paymentTerm", e.target.value);
                                }}
                              >
                                <option>Select</option>
                                <option value="1">1 Year</option>
                                <option value="2">2 Year</option>
                                <option value="5">5 Year</option>
                              </Field>
                              {/* <ErrorMessage
                            name="paymentTerm"
                            component="div"
                            className="text-danger"
                          /> */}
                            </FormGroup>
                          </Col>

                          <Col md="4">
                            <FormGroup>
                              <Label>Payment Mode</Label>
                              <Field
                                as="select"
                                name="paymentMode"
                                className="form-select"
                              >
                                <option>Select</option>
                                <option value="online">Online</option>
                                <option value="cheque">Cheque</option>
                              </Field>
                              <ErrorMessage
                                name="paymentMode"
                                component="div"
                                className="text-danger"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
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
                                <h6 className="mb-0">Yearly Membership Fees</h6>
                                <span className="text-muted d-none">
                                  Yearly Membership Fees
                                </span>
                              </td>
                              <td className="font-weight-semibold">
                                ₹{amount}
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <h6 className="mb-0">One Time Joining Fees</h6>
                                <span className="text-muted d-none">
                                  One Time Joining Fees
                                </span>
                              </td>
                              <td className="font-weight-semibold">
                                ₹{joiningFees}
                              </td>
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
                                          ₹{subTotalAmount.toFixed(0)}
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
                            I understand and agree that Internet Handling Fee
                            will be added to this amount upon my selection of
                            payment mode.
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
                            I understand and agree that upon my acceptance to
                            BNI, fees are non-refundable without exception.
                            Terms & Conditions
                          </Label>
                        </FormGroup>
                        <hr />
                      </CardBody>

                      <Col md="12" className="text-end">
                        {values.internetHandlingFee &&
                          values.nonRefundable &&
                          (values.paymentMode === "online" ? (
                            <Btn
                              type="button"
                              color="primary"
                              onClick={() => handleOnlinePayment(values)}
                            >
                              Pay Now
                            </Btn>
                          ) : (
                            <Btn
                              type="submit"
                              color="primary"
                              disabled={isSubmitting}
                              onClick={() => handleChequePayment(values)}
                            >
                              Submit
                            </Btn>
                          ))}
                      </Col>
                    </CardBody>
                  </Card>
                </Form>
              )}
            </Formik>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Index;
