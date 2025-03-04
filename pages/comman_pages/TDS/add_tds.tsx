import Layout from "@/pages/Layout/Layout";
import CardHeaderCommon from "@/pages/components/CardHeaderCommon/CardHeaderCommon";
import WhatsappPop from "@/pages/components/WhatsappPop/WhatsappPop";
// import ProtectedRoute from "@/pages/components/ProtectedRoute";
import Btn from "@/pages/components/button";
import localStorage from "@/utils/localStorage";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
	Col,
	FormGroup,
	Label,
	Button,
	Alert,
	Card,
	CardBody,
	CardFooter,
	Row,
} from "reactstrap";
import * as Yup from "yup";

const AddTds = () => {
	const initialValues = {
		memberName: "",
		chapterName: "",
		tan: "",
		tdsAmount: "",
		incomeHead: "",
		accountName: "",
		bankName: "",
		bankAccountNumber: "",
		ifscCode: "",
		branch: "",
		attachment: null,
	};

	const validationSchema = Yup.object().shape({
		tan: Yup.string().required("TAN is required"),
		tdsAmount: Yup.number()
			.required("TDS Amount is required")
			.positive("TDS Amount must be a positive number"),
		incomeHead: Yup.string().required("Income Head is required"),
		accountName: Yup.string().required("Account Name is required"),
		bankName: Yup.string().required("Bank Name is required"),
		bankAccountNumber: Yup.string().required("Bank Account Number is required"),
		ifscCode: Yup.string().required("IFSC Code is required"),
		branch: Yup.string().required("Branch is required"),
	});
	const token = localStorage.getItem("signIn");
	const memberDetail = JSON.parse(localStorage.getItem("members_detail"));
	const [selectedFile, setSelectedFile] = useState<any>(null);
	const router = useRouter();

	const config = {
		headers: {
			"Content-Type": "multipart/form-data",
			Authorization: `Bearer ${token}`,
		},
	};

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
			formData.append("member_id", memberDetail?.id);
			formData.append("chapter_id", memberDetail?.chapter_id);
			formData.append("tan", values.tan);
			formData.append("tds_amount", values.tdsAmount);
			formData.append("income_head", values.incomeHead);
			formData.append("account_name", values.accountName);
			formData.append("bank_name", values.bankName);
			formData.append("bank_account_number", values.bankAccountNumber);
			formData.append("ifsc_code", values.ifscCode);
			formData.append("branch", values.branch);
			formData.append("attachment", selectedFile);
			formData.append("status", "pending");

			const response = await axios.post(`/api/tds-records`, formData, config);
			if (response.status === 201) {
				toast.success(response.data.message);
				router.push("/comman_pages/TDS/list_tds");
			}
			actions.resetForm();
		} catch (error) {
			console.error("Error:", error);
		}
	};

	return (
		<Layout>
			{/* <ProtectedRoute> */}
			<div className="page-body">
				<Col xl="12">
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={handleSubmit}>
						{({ isSubmitting }: any) => (
							<Form className="theme-form" encType="multipart/form-data">
								<Card>
									<CardHeaderCommon
										title="Add TDS"
										tagClass={"card-title mb-0"}
									/>
									<CardBody>
										<Row>
											<Col md="4">
												<FormGroup>
													<Label for="tan">TAN</Label>
													<Field
														type="text"
														name="tan"
														id="tan"
														className="form-control"
													/>
													<ErrorMessage
														name="tan"
														component="div"
														className="text-danger"
													/>
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label for="tdsAmount">TDS Amount</Label>
													<Field
														type="number"
														name="tdsAmount"
														id="tdsAmount"
														className="form-control"
													/>
													<ErrorMessage
														name="tdsAmount"
														component="div"
														className="text-danger"
													/>
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label for="incomeHead">Income Head</Label>
													<Field
														as="select"
														name="incomeHead"
														id="incomeHead"
														className="form-control">
														<option value="" disabled>
															-- Select Income Head --
														</option>
														<option value="Membership Fees">
															Membership Fees
														</option>
														<option value="Meeting Fees">Meeting Fees</option>
													</Field>
													<ErrorMessage
														name="incomeHead"
														component="div"
														className="text-danger"
													/>
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label for="accountName">Account Name</Label>
													<Field
														type="text"
														name="accountName"
														id="accountName"
														className="form-control"
													/>
													<ErrorMessage
														name="accountName"
														component="div"
														className="text-danger"
													/>
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label for="bankName">Bank Name</Label>
													<Field
														type="text"
														name="bankName"
														id="bankName"
														className="form-control"
													/>
													<ErrorMessage
														name="bankName"
														component="div"
														className="text-danger"
													/>
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label for="bankAccountNumber">
														Bank Account Number
													</Label>
													<Field
														type="text"
														name="bankAccountNumber"
														id="bankAccountNumber"
														className="form-control"
													/>
													<ErrorMessage
														name="bankAccountNumber"
														component="div"
														className="text-danger"
													/>
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label for="ifscCode">IFSC Code</Label>
													<Field
														type="text"
														name="ifscCode"
														id="ifscCode"
														className="form-control"
													/>
													<ErrorMessage
														name="ifscCode"
														component="div"
														className="text-danger"
													/>
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label for="branch">Branch</Label>
													<Field
														type="text"
														name="branch"
														id="branch"
														className="form-control"
													/>
													<ErrorMessage
														name="branch"
														component="div"
														className="text-danger"
													/>
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label for="attachment">
														Attachment* ((Please attach TDS Certificate issued
														by TRACES)
													</Label>
													<input
														type="file"
														id="attachment"
														name="attachment"
														className="form-control"
														onChange={handleFileChange}
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
			{/* </ProtectedRoute> */}
			<WhatsappPop />
		</Layout>
	);
};

export default AddTds;

