import Layout from "@/pages/Layout/Layout";
// import ProtectedRoute from "@/pages/components/ProtectedRoute";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import React, { useEffect, useState } from "react";
import {
	Card,
	CardBody,
	CardFooter,
	Col,
	FormGroup,
	Label,
	Row,
} from "reactstrap";
import Btn from "../components/button";
import CardHeaderCommon from "@/pages/components/CardHeaderCommon/CardHeaderCommon";
import axios from "axios";
import { toast } from "react-toastify";
import localStorage from "@/utils/localStorage";
import KittyBalaceAPI from "@/pages/kitty-balance/kittyBalace";

const AddKitty = () => {
	const token = localStorage.getItem("signIn");
	const [chaptersData, setChaptersData] = useState([]);

	const validationSchema = Yup.object().shape({
		chapterName: Yup.string().required("Chapter Name is required"),
		amount: Yup.number().required("Amount is required"),
	});

	const handleSubmit = async (
		values: any,
		actions: { resetForm: () => void }
	) => {
		try {
			const payment_type = "MEETING FEES";
			await KittyBalaceAPI(
				values.fromdate,
				values.todate,
				values.chapterName,
				values.givenby,
				"",
				payment_type
			);

			actions.resetForm();
		} catch (error) {
			console.error("Error:", error);
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
					const response = await axios.get("/api/chapterlist", config);
					setChaptersData(response.data.chapters);
				} catch (error) {
					console.error("Error fetching chapters data:", error);
				}
			}
		};

		fetchData();
	}, [token]);

	return (
		<Layout>
			{/* <ProtectedRoute> */}
			<div className="page-body">
				<Col xl="12">
					<Formik
						initialValues={{
							chapterName: "",
							fromdate: "",
							todate: "",
							amount: "",
							givenby: "",
						}}
						validationSchema={validationSchema}
						onSubmit={handleSubmit}>
						{({ isSubmitting }: any) => (
							<Form className="theme-form" encType="multipart/form-data">
								<Card>
									<CardHeaderCommon
										title="Add Kitty"
										tagClass={"card-title mb-0"}
									/>
									<CardBody>
										<Row>
											<Col sm="4" md="4">
												<FormGroup>
													<Label>Chapter Name</Label>
													<Field
														as="select"
														name="chapterName"
														className="form-select">
														<option>Select</option>
														{Array.isArray(chaptersData) &&
															chaptersData?.map((option: any, index) => (
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
											<Col sm="8" md="8"></Col>
											<Col sm="4" md="4">
												<FormGroup>
													<Label>Head By</Label>
													<Field
														type="text"
														name="givenby"
														className="form-control"
													/>
													<ErrorMessage
														name="givenby"
														component="div"
														className="text-danger"
													/>
												</FormGroup>
											</Col>

											<Col sm="4" md="4">
												<FormGroup>
													<Label>Date</Label>
													<Field
														type="date"
														name="fromdate"
														className="form-control"
													/>
													<ErrorMessage
														name="fromdate"
														component="div"
														className="text-danger"
													/>
												</FormGroup>
											</Col>

											<Col md="4">
												<FormGroup>
													<Label>Total Amount</Label>
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
		</Layout>
	);
};

export default AddKitty;

