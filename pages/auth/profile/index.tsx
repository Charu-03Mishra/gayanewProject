import Layout from "@/pages/Layout/Layout";
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
import localStorage from "@/utils/localStorage";
import CardHeaderCommon from "@/pages/components/CardHeaderCommon/CardHeaderCommon";
import Btn from "@/pages/components/button";
import { toast } from "react-toastify";
import axios from "axios";
import Loader from "@/pages/Layout/Loader/Loader";
import WhatsappPop from "@/pages/components/WhatsappPop/WhatsappPop";

const validationSchema = Yup.object().shape({
	gstNumber: Yup.string().required("GST No. is required"),
});

const MembersEdit = () => {
	const token = localStorage.getItem("signIn");
	const [userData, setUserData] = useState<any>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (
		values: any,
		actions: { resetForm: () => void }
	) => {
		try {
			setLoading(true);
			const data = {
				gst_no: values.gstNumber,
			};
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			const response = await axios.put(
				`/api/members/${userData?.id}`,
				data,
				config
			);

			if (response.status === 200) {
				await fetchUserData();
				actions.resetForm();
				setLoading(false);
				toast.success("Profile updated successfully");
			}
		} catch (error) {
			setLoading(false);
			console.error("Error:", error);
		}
	};
	const fetchUserData = async () => {
		try {
			const response = await axios.get("/api/profile", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("signIn")}`,
				},
			});
			setUserData(response.data?.user);
		} catch (error) {
			console.error("Error fetching user data:", error);
		}
	};
	useEffect(() => {
		fetchUserData();
	}, []);
	return (
		<Layout>
			{loading ? (
				<Loader />
			) : (
				<div className="page-body">
					{userData && (
						<Formik
							initialValues={{
								gstNumber: userData?.gst_no || "",
							}}
							validationSchema={validationSchema}
							onSubmit={handleSubmit}>
							{({ isSubmitting }: any) => (
								<Form className="theme-form">
									<Card>
										<CardHeaderCommon
											title="My Profile"
											tagClass={"card-title mb-0"}
										/>
										<CardBody>
											<Row>
												<Col sm="6" md="12">
													Name: {userData?.first_name} {userData?.last_name}
												</Col>

												<Col sm="6" md="12">
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
											</Row>
										</CardBody>
										<CardFooter className="text-end">
											<Btn
												color="primary"
												type="submit"
												disabled={isSubmitting}>
												{isSubmitting ? "Submitting..." : "Submit"}
											</Btn>
										</CardFooter>
									</Card>
								</Form>
							)}
						</Formik>
					)}
				</div>
			)}
			<WhatsappPop />
		</Layout>
	);
};

export default MembersEdit;

