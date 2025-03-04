"use client";
import Layout from "@/pages/Layout/Layout";
import LI from "@/pages/components/ListGroup/ListItem";
import UL from "@/pages/components/ListGroup/UnorderedList";
import axios from "axios";

import { Field, Form, Formik } from "formik";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { Card, CardBody, Col, Input, Label, Row } from "reactstrap";
import { toast } from "react-toastify";
import Btn from "../../components/button";

const ChapterStatusOptions = [
	{ value: 1, label: "True" },
	{ value: 0, label: "False" },
];
const TableAction = ({ id }: any) => {
	const router = useRouter();
	if (!id) {
		return null;
	}
	const handleClick = (e: any) => {
		e.preventDefault();
		router.push({
			pathname: `/comman_pages/chapters/${id}`,
			query: { id: id },
		});
	};
	return (
		<UL className="action simple-list flex-row" id={id}>
			<LI className="edit">
				<Link
					href={{ pathname: `/comman_pages/chapters/${id}`, query: { id: id } }}
					onClick={handleClick}>
					<i className="icon-pencil-alt" />
				</Link>
			</LI>
		</UL>
	);
};

const ListChapter = () => {
	const router = useRouter();
	const token = localStorage.getItem("signIn");
	const [data, setData] = useState<any>([]);
	const [filterText, setFilterText] = useState("");
	const [regionData, setRegionData] = useState([]);
	const [chapterStatus, setchapterStatus] = useState<any>("");
	const [perPage, setPerPage] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [searchTerm, setSearchTerm] = useState("");
	const urlParams = new URLSearchParams(window.location.search);

	// const handleOpeningBalanceUpdate = async (
	//   values: any,
	//   actions: { resetForm: () => void }
	// ) => {
	//   try {
	//     const data = {
	//       opening_balance: values.opening_balance,
	//     };

	//     const response = await axios.put(
	//       `/api/chapters/${Number(id)}`,
	//       data,
	//       config
	//     );

	//     if (response.status === 200) {
	//       toast.success(response.data.message);
	//       router.push("/comman_pages/chapters/list_chapter")
	//     }

	//     actions.resetForm();
	//   } catch (error) {
	//     console.error("Error:", error);
	//   }
	// };

	const config = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};
	console.log(data);

	const columns: any = [
		{
			name: "ID",
			selector: (row: any) => `${row.id}`,
			sortable: true,
		},
		{
			name: "Chapter Name",
			selector: (row: any) => `${row.chapter_name}`,
			sortable: true,
			grow: 2,
		},
		{
			name: "Meeting Day",
			selector: (row: any) => `${row.meeting_day}`,
			sortable: true,
			grow: 2,
		},
		{
			name: "Meeting Time",
			selector: (row: any) => `${row.meeting_time}`,
			sortable: true,
			grow: 2,
		},
		{
			name: "Weekly Meeting Fees",
			selector: (row: any) => `${row.weekly_meeting_fees}`,
			sortable: true,
			grow: 2,
		},
		{
			name: "Chapter Status",
			selector: (row: any) => (row.is_launched === 1 ? "True" : "False"),
			sortable: true,
			grow: 2,
		},

		{
			name: "Region Name",
			selector: (row: any) => {
				const region: any = regionData?.find(
					(region: any) => region.id === row.region_id
				);
				return region ? region.name : "";
			},
			sortable: true,
			grow: 2,
		},
		{
			name: "State",
			selector: (row: any) => `${row.state}`,
			sortable: true,
			grow: 2,
		},
		{
			name: "Country",
			selector: (row: any) => `${row.country}`,
			sortable: true,
			grow: 2,
		},
		{
			name: "Kitty Balance",
			selector: (row: any) => `${row.kitty_balance}`,
			sortable: true,
			grow: 2,
		},
		{
			name: "Opening Balance",
			cell: (row: any) => (
				<Formik
					initialValues={{ opening_balance: row.opening_balance }}
					onSubmit={async (values, { setSubmitting }) => {
						try {
							const data = { opening_balance: values.opening_balance };

							const response = await axios.put(
								`/api/chapters/${Number(row.id)}`, // Use row.id to update specific chapter
								data,
								config
							);

							if (response.status === 200) {
								toast.success("Opening balance updated successfully");
								// Optionally, trigger a re-fetch of data after successful update
							}
						} catch (error) {
							console.error("Error updating opening balance:", error);
							toast.error("Failed to update opening balance");
						} finally {
							setSubmitting(false);
						}
					}}>
					{({ isSubmitting, values, handleChange, handleSubmit }) => (
						<Form onSubmit={handleSubmit}>
							<Row>
								<Col md="8">
									<Input
										type="number"
										name="opening_balance"
										placeholder="Enter opening balance"
										value={values.opening_balance}
										onChange={handleChange}
										className="form-control"
									/>
								</Col>
								<Col md="4" className="p-0">
									<Btn
										className="py-0 px-1"
										color="success"
										type="submit"
										disabled={isSubmitting}>
										{isSubmitting ? (
											"Submitting..."
										) : (
											<i className="icon-check" />
										)}
									</Btn>
								</Col>
							</Row>
						</Form>
					)}
				</Formik>
			),
			sortable: true,
			grow: 2,
		},
		{
			name: "Action",
			cell: (row: any) => <TableAction id={row.id} />,
			sortable: true,
		},
	];
	const filteredItems = data.filter((item: any) =>
		columns.some((column: any) => {
			let value =
				typeof column.selector === "function" ? column.selector(item) : "";

			if (typeof value === "string") {
				return value.toLowerCase().includes(searchTerm.toLowerCase());
			} else if (typeof value === "number") {
				return value.toString().includes(searchTerm.toLowerCase());
			}
			return false;
		})
	);

	console.log(data, "data");
	const handleChapterChange = (e: any) => {
		setchapterStatus(e.target.value);
	};
	const subHeaderComponentMemo = useMemo(() => {
		return (
			<>
				<div
					className=""
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",

						width: "100%",
					}}>
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							gap: "20px",
							alignItems: "center",
							width: "400px",
						}}>
						<Input
							style={{ width: "300px" }}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFilterText(e.target.value)
							}
							type="search"
							value={filterText}
						/>
					</div>
				</div>
				<div className="filter-data">
					<div className="filter-data-select">
						<div className="lable">
							<Label>Chapter Status:</Label>
						</div>
						<div>
							<Input type="select" onChange={handleChapterChange}>
								<option value="">All</option>
								{ChapterStatusOptions.map((status) => (
									<option value={status.value}>{status.label}</option>
								))}
							</Input>
						</div>
					</div>
				</div>
			</>
		);
	}, [filterText]);

	const fetchData = async (page: number, pageSize: number) => {
		setCurrentPage(page);
		setPerPage(pageSize);
		const params: any = {
			page,
			pageSize,
			chapter_id: urlParams.get("chapter_id") || "all",
		};
		if (searchTerm) params.search = searchTerm;

		const url = new URL(`/api/chapters`, window.location.origin);
		try {
			const response = await axios.get(url.toString(), config);
			setData(response.data.chapters);
			// const activeCount: any = response.data.members.filter(
			// 	(row: any) =>
			// 		row.membership_status === "Active" ||
			// 		row.membership_status === "Inactive"
			// ).length;
			// const dropCount: any = response.data.members.filter(
			// 	(row: any) => row.membership_status === "Drop"
			// ).length;
			// setactive(activeCount);
			// setdrop(dropCount);
			setTotalRows(response.data.pagination?.totalItems);
			setCurrentPage(response.data.pagination?.currentPage);
		} catch (error) {
			console.error("Error fetching chapters data:", error);
		}
	};
	// const fetchData = async () => {
	// 	if (typeof window !== "undefined" && window.localStorage) {
	// 		try {
	// 			const response = await axios.get("/api/chapters", config);
	// 			setData(response.data);
	// 		} catch (error) {
	// 			console.error("Error fetching region data:", error);
	// 		}
	// 	}
	// };
	useEffect(() => {
		const fetchRegionData = async () => {
			if (typeof window !== "undefined" && window.localStorage) {
				const config = {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				};

				try {
					const response = await axios.get("/api/region", config);
					setRegionData(response.data);
				} catch (error) {
					console.error("Error fetching region data:", error);
				}
			}
		};
		fetchRegionData();
	}, []);

	const handleRowsPerPageChange = async (newRowsPerPage: any) => {
		console.log("dfghjkl;");
		if (!data.length) return;
		fetchData(currentPage, newRowsPerPage);

		setPerPage(newRowsPerPage);
	};
	const handlePageChange = (page: any) => {
		console.log("first", page);
		fetchData(page, perPage);
		setCurrentPage(page);
	};

	console.log(currentPage);

	useEffect(() => {
		fetchData(currentPage, perPage);
	}, [token, searchTerm]);
	return (
		<Layout>
			<div className="page-body">
				<Row>
					<Col sm="12">
						<Card>
							<CardBody>
								<div
									className="table-responsive theme-scrollbar"
									id="row_create">
									<DataTable
										pagination
										subHeader
										highlightOnHover
										striped
										paginationRowsPerPageOptions={[10, 15, 20, 25]}
										paginationPerPage={perPage}
										paginationDefaultPage={currentPage}
										paginationTotalRows={totalRows}
										onChangeRowsPerPage={handleRowsPerPageChange}
										onChangePage={handlePageChange}
										persistTableHead
										subHeaderComponent={subHeaderComponentMemo}
										columns={columns}
										data={filteredItems || []}
										className="theme-scrollbar display dataTable"
									/>
								</div>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
		</Layout>
	);
};

export default ListChapter;

