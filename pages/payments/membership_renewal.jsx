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
import * as Yup from "yup";
import axios from "axios";
import localStorage from "@/utils/localStorage";
import { useRouter } from "next/router";
import moment from "moment";
import Link from "next/link";
import { toast } from "react-toastify";
import Loader from "@/pages/Layout/Loader/Loader";
import Layout from "../Layout/Layout";
import CardHeaderCommon from "../components/CardHeaderCommon/CardHeaderCommon";
import Btn from "../components/button";
import { generateInvoiceNumber } from "@/utils/utils";

const validationSchema = Yup.object().shape({
  paymentTerm: Yup.string().required("Payment term is required"),
});

const MembershipRenewal = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [cgst, setCGST] = useState(0);
  const [sgst, setSGST] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [subTotalAmount, setSubTotalAmount] = useState(0);
  const [endDate, setEndDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const memberDetail = JSON.parse(localStorage.getItem("members_detail"));
  const [lateFee, setLateFee] = useState(null);

  let penaltyAmount = 0;
  let penaltyCGST = 0;
  let penaltySGST = 0;
  let totalPenalty = 0;

  const initialValues = {
    paymentTerm: "",
    internetHandlingFee: false,
    nonRefundable: false,
  };

  const handleChequePayment = async () => {
    try {
      const resPayment = await axios.post("/api/rzp_payments", {
        member_id: memberDetail?.id,
        chapter_id: memberDetail?.chapter_id,
        amount: subTotalAmount,
        discount: 0,
        cgst: cgst,
        sgst: sgst,
        total_amount: totalAmount,
        status: "pending",
        verification_code: verificationCode,
        payment_type: "membership fees",
        mode: "cheque",
        email: memberDetail?.email,
        contact: memberDetail?.primary_number,
        // invoice_no: await generateInvoiceNumber("BSS"),
        start_payment_date: startDate,
        end_payment_date: endDate,
      });

      if (resPayment.status === 200) {
        router.push({
          pathname: "/chequeDetails",
          query: {
            verificationCode: verificationCode,
          },
        });
        setLoading(false);
      }
    } catch (err) {
      console.error("Error updating payments", err);
      setLoading(false);
    }
  };
  const handleOnlinePayment = async () => {
    const res = await initializeRazorpay();

    if (!res) {
      alert("Razorpay SDK Failed to load");
      return;
    }
    const Amount = totalAmount * 100;
    const FullName = `${memberDetail?.first_name} ${memberDetail?.last_name}`;
    try {
      const resOrder = await axios.post("/api/create-membership-order", {
        amount: Amount.toFixed(0),
        currency: "INR",
        chapter_id:memberDetail?.chapter_id,
        gstin: memberDetail?.gst_no,
        member_email: memberDetail?.email,
        member_name: FullName,
        member_phone: memberDetail?.primary_number,
        remark: "BNI Membership Renewal Fees",
        type: "membership_renewal",
        start_at: startDate,
        end_at: endDate,
      });

      if(resOrder.status === 200){
        const resPayment = await axios.post("/api/rzp_payments", {
          member_id: memberDetail?.id,
          chapter_id: memberDetail?.chapter_id,
          payment_type: "membership fees",
          amount: subTotalAmount,
          discount:0,
          cgst: cgst,
          sgst: sgst,
          total_amount: totalAmount.toFixed(2),
          mode: "online",
          status: "pending",
          order_id: resOrder.data?.id,
          email: memberDetail?.email,
          contact: memberDetail?.primary_number,
          // invoice_no: await generateInvoiceNumber("BSS"),
          start_payment_date: startDate,
          end_payment_date: endDate,
        });
      }
      const options = {
        key: process.env.RAZORPAY_BSS_KEY,
        name: memberDetail?.company_name,
        currency: resOrder.data?.currency,
        amount: resOrder.data?.amount,
        order_id: resOrder.data?.id,
        description: "Membership renewal fees",
        prefill: {
          name: `${memberDetail?.first_name} ${memberDetail?.last_name}`,
          email: memberDetail?.email,
          contact: memberDetail?.primary_number,
        },
        image: "/assets/images/logo/bni_surat_logo.png",
        handler: async function (response) {
          if (response.razorpay_payment_id) {
            router.push("/payments/manage_payment");
            setLoading(false);
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
            //     //update membership status
            //     await axios.put(
            //       `/api/members/${memberDetail?.id}`,
            //       {
            //         membership_end_date: moment(endDate).format("YYYY-MM-DD"),
            //       },
            //       {
            //         headers: {
            //           Authorization: `Bearer ${localStorage.getItem("signIn")}`,
            //         },
            //       }
            //     );
            //     const resPayment = await axios.post("/api/rzp_payments", {
            //       member_id: memberDetail?.id,
            //       chapter_id: memberDetail?.chapter_id,
            //       payment_id: response.razorpay_payment_id,
            //       payment_type: "membership fees",
            //       entity: responsePayment.data?.entity,
            //       amount: subTotalAmount,
            //       cgst: cgst,
            //       sgst: sgst,
            //       total_amount: totalAmount,
            //       currency: responsePayment.data?.currency,
            //       status: responsePayment.data?.status,
            //       mode: "online",
            //       order_id: response.razorpay_order_id,
            //       email: memberDetail?.email,
            //       contact: memberDetail?.primary_number,
            //       invoice_no: generateInvoiceNumber(),
            //       start_payment_date: startDate,
            //       end_payment_date: endDate,
            //     });
            //     if (resPayment.status === 200) {
            //       router.push("/payments/membership_res");
            //       setLoading(false);
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
  const calculateEndDate = (paymentTerm) => {
    const currentDate = new Date(memberDetail?.membership_end_date);
    const endDate = new Date(currentDate);

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

  useEffect(() => {
    // Generate verification code
    const generateVerificationCode = () => {
      const code = Math.floor(100000 + Math.random() * 900000);
      setVerificationCode(code.toString());
    };

    generateVerificationCode();
  }, []);

  useEffect(() => {
    const membershipEndDate = memberDetail?.membership_end_date;
    const paymentTerm = initialValues.paymentTerm;
    const currentDate = new Date();
    const endDate = new Date(membershipEndDate);
    const dateDifference = Math.floor(
      (endDate - currentDate) / (1000 * 60 * 60 * 24)
    );
    console.log(endDate+"---"+currentDate);
    console.log(dateDifference);
    if (dateDifference < 30) {
      penaltyAmount = 1000; // Set the penalty amount here
      penaltyCGST = (penaltyAmount * 9) / 100;
      penaltySGST = (penaltyAmount * 9) / 100;
      totalPenalty = penaltyAmount + penaltyCGST + penaltySGST;
      setLateFee({
        description: "Late Fee",
        amount: penaltyAmount,
      });
    }

    const cgstAmount = amount * 0.09;
    const sgstAmount = amount * 0.09;
    const total = amount + cgstAmount + sgstAmount;

    setSubTotalAmount(amount + penaltyAmount);
    setCGST(cgstAmount + penaltyCGST);
    setSGST(sgstAmount + penaltySGST);
    setTotalAmount(total + totalPenalty);
  }, [amount]);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
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
                <CardBody>
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
                            const calculatedAmount = calculatePaymentAmount(
                              e.target.value
                            );
                            calculateEndDate(e.target.value);
                            setAmount(calculatedAmount);
                            setFieldValue("paymentTerm", e.target.value);
                          }}
                        >
                          <option value="">Select</option>
                          <option value="1">1 Year</option>
                          <option value="2">2 Year</option>
                          <option value="5">5 Year</option>
                        </Field>
                        <ErrorMessage
                          name="paymentTerm"
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
                            <h6 className="mb-0">Yearly Membership Fees</h6>
                            <span className="text-muted d-none">
                              Yearly Membership Fees
                            </span>
                          </td>
                          <td className="font-weight-semibold">₹{amount}</td>
                        </tr>
                        {lateFee && (
                        <tr className='lateFee'>
                          <td>
                            <h6 className="mb-0">{lateFee.description}</h6>
                            <span className="text-muted d-none">
                              {lateFee.description}
                            </span>
                          </td>
                          <td className="font-weight-semibold">₹{lateFee.amount}</td>
                        </tr>
                      )}
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
                    {values.internetHandlingFee && values.nonRefundable && (
                      <>
                        <Btn
                          type="submit"
                          color="primary"
                          className="me-1"
                          disabled={isSubmitting}
                          onClick={() => handleOnlinePayment(values)}
                        >
                          Pay Online
                        </Btn>
                        <Btn
                          type="submit"
                          color="primary"
                          disabled={isSubmitting}
                          onClick={() => handleChequePayment(values)}
                        >
                          Pay Cheque
                        </Btn>
                      </>
                    )}
                  </Col>
                </CardBody>
              </Card>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default MembershipRenewal;
