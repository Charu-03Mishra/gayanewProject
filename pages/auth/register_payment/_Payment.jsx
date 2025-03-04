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
import SnackbarWithDecorators, { changeText } from './Utils';
import api from './api';

const AddChapters = () => {
    const [snackAlert, setSnackAlert] = useState(false); // popup success or error
    const [snackbarProperty, setSnackbarProperty] = useState({ // popup success or error text
        text: '',
        color: ''
    });
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState({
        firstName: '',
        lastName: '',
        companyIndustry: '',
        chapterName: '',
        position: '',
        phoneNumber: '',
        altPhoneNumber: '',
        faxNumber: '',
        cellNumber: '',
        email: '',
        website: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        gstNumber: '',
        member: 'Not a BNI member',
        association: '',
    });
    const [isBNIMember, setIsBNIMember] = useState(false);
    const [isAssociationMember, setIsAssociationMember] = useState(false);
    const [pay_success, setPay_success] = useState(false);
    const [pay_id, setPay_id] = useState("");

    const handleCheckboxChange = (e) => {
        const value = e.target.value;
        setDetails((prevDetails) => ({
            ...prevDetails,
            member: value
        }));
        setIsBNIMember(value === 'BNI member');
        setIsAssociationMember(value === 'Association member');
    };

    const validateDetails = (details) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneNumberRegex = /^\d{10}$/; // Assuming phone numbers are 10 digits long
        const websiteRegex = /^(https?:\/\/)?([a-z0-9.-]+\.[a-z]{2,}|localhost)(:\d+)?(\/[^\s]*)?$/i;
        const gstNumberRegex = /^[A-Z]{2}[0-9]{4}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9][A-Z0-9]$/;

        const {
            email,
            phoneNumber,
            altPhoneNumber,
            website,
            gstNumber,
            firstName,
            lastName,
            companyIndustry,
            chapterName,
            position,
            address,
            city,
            state,
            zip,
            speciality,
            company_hospitalname,
            member,
            association
        } = details;

        // Check if all required fields are filled
        if (!firstName || !lastName || !speciality ||
            !company_hospitalname || !phoneNumber || !email ||
            !city || !zip) {
            return { success: false, message: "* fields must be filled in" };
        }
        if (isBNIMember && !chapterName) {
            return { success: false, message: "Chapter name field must be filled in" };
        }
        if (isAssociationMember && !association) {
            return { success: false, message: "Association name field must be filled in" };
        }

        // Validate phone number format
        if (!phoneNumberRegex.test(phoneNumber)) {
            return { success: false, message: "Invalid phone number format" };
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            return { success: false, message: "Invalid email format" };
        }

        // Validate GST number format
        if (gstNumber && !gstNumberRegex.test(gstNumber)) {
            return { success: false, message: "Invalid GST number format" };
        }

        // If all validations pass
        return { success: true };
    };

    const handlePayment = () => {
        const validationResult = validateDetails(details);
        console.log("validationResult", validationResult);

        setLoading(true);
        if (validationResult.success) {
            // Proceed with payment
            api("register_payment", "post", details)
                .then((res) => {
                    console.log("res", res);
                    if (res?.response?.data.success === false) {
                        setSnackbarProperty(prevState => ({
                            ...prevState,
                            text: res.response.data.message,
                            color: "danger"
                        }));
                        setSnackAlert(true);
                        return;
                    } else {
                        handleRazorpayScreen(res);
                    }
                })
                .catch((err) => {
                    console.log("err", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            console.log(validationResult.message);
            setSnackbarProperty(prevState => ({
                ...prevState,
                text: validationResult.message,
                color: "danger"
            }));
            setSnackAlert(true);
            return;
        }
    };

    const handleRazorpayScreen = async (res) => {
        const res_integrate = await initializeRazorpay();
        if (!res_integrate) {
            alert("Razorpay SDK Failed to load");
            return;
        }

        console.log("res?.data?.order_id", res?.data?.order_id);
        const options = {
            key: process.env.RAZORPAY_KEY,
            amount: 1 * 100,
            currency: "INR",
            name: `${details.firstName} ${details.lastName}`,
            description: "Test",
            image: "/assets/images/logo/bni_surat_logo.png",
            order_id: res?.data?.order_id,
            callback_url: `${process.env.NEXT_PUBLIC_PUBLIC_URL}/api/register_payment/paymentVerification?user_id=${res?.data?.user_id}&member=${details.member}`,
            prefill: {
                name: `${details.firstName} ${details.lastName}`,
                email: `${details.email}`,
                contact: `${details.phoneNumber}`,
            },
            notes: {
                "name": `${details?.firstName} ${details.lastName}`,
                "phone": `${details?.phoneNumber}`,
                "chapter": `${details?.chapterName}`,
                "address": `${details?.address}`,
                "member": `${details.member}`
            },
            theme: {
                "color": "#121212"
            }
        };
        const razor = new window.Razorpay(options);
        razor.open();
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

    // Check URL parameters for razorpay_payment_id
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const razorpayPaymentId = urlParams.get('reference');
        console.log("razorpayPaymentId", razorpayPaymentId);
        if (razorpayPaymentId) {
            // Set state for payment success message
            setSnackbarProperty({
                text: "Payment was successful!",
                color: "success"
            });
            setSnackAlert(true);
            setPay_success(true);
            setPay_id(razorpayPaymentId);
        }
    }, []);

  

   

    useEffect(() => {
        console.log("details", details);
    }, [details]);

    return (
        <>
        {
        snackAlert?
        <SnackbarWithDecorators snackAlert={snackAlert} setSnackAlert={setSnackAlert} text={snackbarProperty.text} color={snackbarProperty.color} />
        :null
    }
            <Card>
                <CardHeaderCommon title="Registration" />
                <CardBody>
                    <Formik
                        initialValues={details}
                        onSubmit={handlePayment}
                    >
                        {({ values, handleChange }) => (
                            <Form>
                                <Row>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="firstName">First Name</Label>
                                            <Field
                                                name="firstName"
                                                as={Input}
                                                type="text"
                                                id="firstName"
                                                value={details.firstName}
                                                placeholder="Enter First Name"
                                                onChange={(e) => changeText(e, setDetails, details)}
                                            />
                                            <ErrorMessage name="firstName" component="div" className="text-danger" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="lastName">Last Name</Label>
                                            <Field
                                                name="lastName"
                                                as={Input}
                                                type="text"
                                                id="lastName"
                                                value={details.lastName}
                                                placeholder="Enter Last Name"
                                                onChange={(e) => changeText(e, setDetails, details)}
                                            />
                                            <ErrorMessage name="lastName" component="div" className="text-danger" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="speciality">Speciality</Label>
                                            <Field
                                                name="speciality"
                                                as={Input}
                                                type="text"
                                                id="speciality"
                                                value={details.speciality}
                                                placeholder="Enter Speciality"
                                                onChange={(e) => changeText(e, setDetails, details)}
                                            />
                                            <ErrorMessage name="speciality" component="div" className="text-danger" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="company_hospitalname">Hospital Name / Company Name / Clinic Name</Label>
                                            <Field
                                                name="company_hospitalname"
                                                as={Input}
                                                type="text"
                                                id="company_hospitalname"
                                                value={details.company_hospitalname}
                                                placeholder="Enter Hospital Name / Company Name / Clinic Name"
                                                onChange={(e) => changeText(e, setDetails, details)}
                                            />
                                            <ErrorMessage name="company_hospitalname" component="div" className="text-danger" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="phoneNumber">Phone Number</Label>
                                            <Field
                                                name="phoneNumber"
                                                as={Input}
                                                type="number"
                                                id="phoneNumber"
                                                value={details.phoneNumber}
                                                placeholder="Enter Phone Number"
                                                onChange={(e) => changeText(e, setDetails, details)}
                                            />
                                            <ErrorMessage name="phoneNumber" component="div" className="text-danger" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="email">Email</Label>
                                            <Field
                                                name="email"
                                                as={Input}
                                                type="email"
                                                id="email"
                                                value={details.email}
                                                placeholder="Enter Email"
                                                onChange={(e) => changeText(e, setDetails, details)}
                                            />
                                            <ErrorMessage name="email" component="div" className="text-danger" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        <FormGroup>
                                            <Label for="city">City</Label>
                                            <Field
                                                name="city"
                                                as={Input}
                                                type="text"
                                                id="city"
                                                value={details.city}
                                                placeholder="Enter City"
                                                onChange={(e) => changeText(e, setDetails, details)}
                                            />
                                            <ErrorMessage name="city" component="div" className="text-danger" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="zip">Zip Code</Label>
                                            <Field
                                                name="zip"
                                                as={Input}
                                                type="text"
                                                id="zip"
                                                value={details.zip}
                                                placeholder="Enter Zip Code"
                                                onChange={(e) => changeText(e, setDetails, details)}
                                            />
                                            <ErrorMessage name="zip" component="div" className="text-danger" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="gstNumber">GST Number</Label>
                                            <Field
                                                name="gstNumber"
                                                as={Input}
                                                type="text"
                                                id="gstNumber"
                                                value={details.gstNumber}
                                                placeholder="Enter GST Number (Optional)"
                                                onChange={(e) => changeText(e, setDetails, details)}
                                            />
                                            <ErrorMessage name="gstNumber" component="div" className="text-danger" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                {isBNIMember && (
                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <Label for="chapterName">Chapter Name</Label>
                                                <Field
                                                    name="chapterName"
                                                    as={Input}
                                                    type="text"
                                                    id="chapterName"
                                                    value={details.chapterName}
                                                    placeholder="Enter Chapter Name"
                                                    onChange={(e) => changeText(e, setDetails, details)}
                                                />
                                                <ErrorMessage name="chapterName" component="div" className="text-danger" />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                )}
                                {isAssociationMember && (
                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <Label for="association">Association Name</Label>
                                                <Field
                                                    name="association"
                                                    as={Input}
                                                    type="select"
                                                    id="association"
                                                    value={details.association}
                                                    placeholder="Enter Association Name"
                                                    onChange={(e) => changeText(e, setDetails, details)}
                                                >
                                                     <option value="">Choose association name</option>
                                                    <option value="IMA">IMA</option>
                                                    <option value="JDF">JDF</option>
                                                    <option value="SMCA">SMCA</option>
                                                    <option value="Civil Hospital">Civil Hospital</option>
                                                </Field>
                                                <ErrorMessage name="association" component="div" className="text-danger" />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                )}
                                <Row>
                                <Col md="12">
                                    <FormGroup>
                                        <Label>Membership Status</Label>
                                        <div>
                                            <Field
                                                type="radio"
                                                name="member"
                                                value="BNI member"
                                                checked={details.member === 'BNI member'}
                                                onChange={handleCheckboxChange}
                                            />
                                            {' '}
                                            <Label check>BNI Member</Label>
                                        </div>
                                        <div>
                                            <Field
                                                type="radio"
                                                name="member"
                                                value="Association member"
                                                checked={details.member === 'Association member'}
                                                onChange={handleCheckboxChange}
                                            />
                                            {' '}
                                            <Label check>Association Member</Label>
                                        </div>
                                        <div>
                                            <Field
                                                type="radio"
                                                name="member"
                                                value="Not a BNI member"
                                                checked={details.member === 'Not a BNI member'}
                                                onChange={handleCheckboxChange}
                                            />
                                            {' '}
                                            <Label check>Not a BNI Member</Label>
                                        </div>
                                    </FormGroup>
                                </Col>
                                </Row>
                                <CardFooter>
                                    <Btn
                                        className="btn btn-dark"
                                        type="submit"
                                        text="Submit"
                                        isLoading={loading}
                                    >Submit</Btn>
                                </CardFooter>
                            </Form>
                        )}
                    </Formik>
                </CardBody>
            </Card>
            <SnackbarWithDecorators
                open={snackAlert}
                handleClose={() => setSnackAlert(false)}
                message={snackbarProperty.text}
                severity={snackbarProperty.color}
            />
        </>
    );
};

export default AddChapters;
