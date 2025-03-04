import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../Layout/Layout";
import { Card, CardBody, Col, FormGroup, Input, Label, Row } from "reactstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DataTable from "react-data-table-component";
import localStorage from "@/utils/localStorage";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import UL from "@/pages/components/ListGroup/UnorderedList";
import LI from "@/pages/components/ListGroup/ListItem";
import Link from "next/link";
import Badges from "@/pages/components/Badge";
import { DateRangePicker } from "rsuite";
import Btn from "@/pages/components/button";
import { ValueType } from "rsuite/esm/DateRangePicker";
import { log } from "console";

const paidStatusOptions = [
	{ value: "", label: "Select options" },
	{ value: "Paid", label: "Paid" },
	{ value: "UnPaid", label: "Unpaid" },
];
const StatusOptions = [
	{ value: "Approved", label: "Approved" },
	{ value: "Pending", label: "Pending" },
];
const expenseHeadOptions = [
	{ value: "COFFEE MEETINGS", label: "COFFEE MEETINGS" },
	{ value: "DECORATION", label: "DECORATION" },
	{ value: "ELECTRCAL REPAIR", label: "ELECTRCAL REPAIR" },
	{ value: "GIFTING", label: "GIFTING" },
	{ value: "GRAPHIC DESIGN", label: "GRAPHIC DESIGN" },
	{ value: "HOTEL FOOD", label: "HOTEL FOOD" },
	{ value: "LED", label: "LED" },
	{ value: "LTMC MEETING", label: "LTMC MEETING" },
	{ value: "LTRT", label: "LTRT" },
	{ value: "OFFICE & MISC EXP", label: "OFFICE & MISC EXP" },
	{ value: "PHOTOGRAPHY", label: "PHOTOGRAPHY" },
	{ value: "PRINTING", label: "PRINTING" },
	{ value: "PT WORKSHOP", label: "PT WORKSHOP" },
	{ value: "SOCIAL", label: "SOCIAL" },
	{ value: "SOUND MIKE", label: "SOUND MIKE" },
	{ value: "TROPHIES", label: "TROPHIES" },
];
const TableAction = ({
	row,
	fetchData,
	perPage,
	currentPage,
	selectedStatus,
	selectedExpenseType,
}: any) => {
	const [isUpdating, setIsUpdating] = useState(false);
	const isPending = row?.row?.status === "pending";

	const handleStatusUpdate = async (status: string) => {
		setIsUpdating(true);
		try {
			const formData = new FormData();
			formData.append("status", status);
			const res = await axios.put(`/api/expense/${row.row?.id}`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: `Bearer ${localStorage.getItem("signIn")}`,
				},
			});

			if (res.status === 200) {
				toast.success(
					`Expense ${
						status === "approved" ? "approved" : "rejected"
					} successfully!`
				);
				fetchData(currentPage, perPage, selectedStatus, selectedExpenseType);
			}
		} catch (error) {
			console.error("Error updating status:", error);
			setIsUpdating(false);
		}
	};

	return (
		<UL className="action simple-list flex-row">
			<LI>
				<Link
					className="edit me-2"
					rel="/assets/images/favicon.png"
					href={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/${row.row?.document}`}
					target="_blank">
					<i className="icon-import" />
				</Link>
			</LI>
			{isPending && (
				<>
					<LI className="edit">
						{isUpdating ? (
							<i role="status">
								<span className="visually-hidden">Loading...</span>
							</i>
						) : (
							<button
								className="border-0"
								onClick={() => handleStatusUpdate("approved")}
								disabled={isUpdating}>
								<i className="icon-check" />
							</button>
						)}
					</LI>
					<LI className="delete">
						<button
							className="border-0"
							onClick={() => handleStatusUpdate("rejected")}
							disabled={isUpdating}>
							<i className="icon-close" />
						</button>
					</LI>
				</>
			)}
		</UL>
	);
};

const CustomBadge = ({ status }: any) => {
	const getStatusColor = (status: any) => {
		switch (status) {
			case "pending":
				return "primary";
			case "approved":
				return "success";
			case "rejected":
				return "info";
			default:
				return "light";
		}
	};

	// Get the color based on status
	const color = getStatusColor(status);

	return (
		<Badges pill className={`badge-${color}`} color="">
			{status}
		</Badges>
	);
};

const Index: React.FC = () => {
	const token = localStorage.getItem("signIn");
	const memberRole = localStorage.getItem("role");
	const [data, setData] = useState<any>([]);
	const [ltData, setLtData] = useState<any>({});
	const role = localStorage.getItem("role");
	const [filterText, setFilterText] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [dateRange, setDateRange] = useState<ValueType | any>([]);
	const [perPage, setPerPage] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [dateFilterApplied, setDateFilterApplied] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState("");
	const [selectedPaidStatus, setselectedPaidStatus] = useState<any>("");
	const [chaptersData, setselectChapter] = useState<any>([]);
	const [selectedExpenseType, setSelectedExpenseType] = useState("");
	const urlParams = new URLSearchParams(window.location.search);
	const [selectedchapters, setselectdChapter] = useState<any>("");
	const [selectExpance, setselectExpance] = useState<any>("");

	const config = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};

	const columns: any = [
		{
			name: "Chapter Name",
			selector: (row: any) => row.chapter_name,
			sortable: true,
			width: "150px",
		},
		{
			name: "Expense Type",
			selector: (row: any) => `${row.expense_type}`,
			sortable: true,
			width: "135px",
		},
		{
			name: "Meeting Date",
			selector: (row: any) => moment(row.date_of_meeting).format("LL"),
			sortable: true,
			width: "135px",
		},
		{
			name: "Upload Date",
			selector: (row: any) => moment(row.createdAt).format("LL"),
			sortable: true,
			width: "140px",
		},
		{
			name: "Invoice No",
			selector: (row: any) => row.invoice_no,
			sortable: true,
			width: "125px",
		},
		{
			name: "Expense Head",
			selector: (row: any) => row.expense_head,
			sortable: true,
			width: "140px",
		},
		{
			name: "Vendor Head",
			selector: (row: any) => row.vendor_name,
			sortable: true,
			width: "140px",
		},
		{
			name: "Amount",
			selector: (row: { amount: any }) => `₹${row.amount}`,
			sortable: true,
			grow: 1,
		},
		...(memberRole === "admin"
			? [
					{
						name: "Paid Status",
						selector: (row: any, index: number) => (
							<Input
								type="select"
								name={`paid_status_${index}`}
								onChange={(e: any) => handlePaidStatusChange(row, e)}
								value={row.paid_status || ""}
								style={{ fontSize: "12px" }}>
								{paidStatusOptions?.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</Input>
						),
						sortable: true,
						width: "160px",
					},
			  ]
			: []),
		{
			name: "Status",
			selector: (row: { status: any }) => <CustomBadge status={row.status} />,
			sortable: true,
		},
		...(memberRole === "admin"
			? [
					{
						name: "Action",
						cell: (row: any) => (
							<TableAction
								row={row}
								fetchData={fetchData}
								currentPage={currentPage}
								perPage={perPage}
								selectedStatus={selectedStatus}
								selectedExpenseType={selectedExpenseType}
							/>
						),
						sortable: true,
					},
			  ]
			: []),
	];

	const filterByDateRange = (item: any) => {
		const itemDate = moment(item.date_of_meeting);
		if (!dateRange || dateRange.length !== 2) return true; // Check if dateRange is null or undefined, or if it doesn't have both start and end dates
		return itemDate.isBetween(
			moment(dateRange[0]),
			moment(dateRange[1]),
			null,
			"[]"
		);
	};

	const handlePageChange = (page: any) => {
		fetchData(
			page,
			perPage,
			selectedStatus,
			selectedPaidStatus,
			selectedExpenseType,
			selectExpance,
			selectedchapters
		);
		setCurrentPage(page);
	};

	const handleRowsPerPageChange = async (newRowsPerPage: any) => {
		if (!data.length) return;
		fetchData(
			currentPage,
			newRowsPerPage,
			selectedStatus,
			selectedPaidStatus,
			selectedExpenseType,
			selectExpance,
			selectedchapters
		);
		setPerPage(newRowsPerPage);
	};

	const handleSearchClick = () => {
		setSearchTerm(filterText?.trim());
		setDateFilterApplied(true);
	};

	const handleOnChangeSearch = (e: any) => {
		const value = e.target.value;
		setFilterText(value);

		if (value.trim() === "") {
			setSearchTerm("");
		}
	};

	const fetchData2 = async () => {
		if (typeof window !== "undefined" && window.localStorage) {
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			try {
				const response = await axios.get(`/api/chapterlist`, config);
				let chapterFilterData: any;
				if (role === "admin" || role === "vendor") {
					chapterFilterData = response?.data?.chapters;
				} else {
					chapterFilterData = response.data?.filter(
						(value: any) => value?.id === ltData?.chapter_id
					);
				}
				setselectChapter(chapterFilterData);
				console.log("expance list", response.data);
			} catch (error) {
				console.error("Error fetching chapters data:", error);
			}
		}
	};
	useEffect(() => {
		fetchData2();
	}, [token, ltData]);

	const fetchData = async (
		page: number,
		pageSize: number,
		selectedStatus: string,
		selectedPaidStatus: string,
		selectedExpenseType: string,
		selectExpance: string,
		selectedchapters: string
	) => {
		setCurrentPage(page);
		setPerPage(pageSize);
		const params: any = {
			page,
			pageSize,
			role: memberRole,
			chapter_id: selectedchapters || urlParams.get("chapter_id") || "all",
		};
		if (searchTerm) params.search = searchTerm;
		if (dateFilterApplied && dateRange?.length === 2) {
			params.startDate = moment(dateRange[0]).format("YYYY-MM-DD");
			params.endDate = moment(dateRange[1]).format("YYYY-MM-DD");
		}

		const url = new URL(`/api/expense`, window.location.origin);

		if (selectedStatus !== "") {
			url.searchParams.append("status", selectedStatus);
		}

		if (selectedPaidStatus !== "") {
			url.searchParams.append("paid_status", selectedPaidStatus);
		}
		console.log(selectedPaidStatus);

		if (selectedExpenseType !== "") {
			url.searchParams.append("expense_type", selectedExpenseType);
		}
		if (selectExpance !== "") {
			url.searchParams.append("expense_head", selectExpance);
		}

		try {
			const response = await axios.get(url.toString(), {
				params,
				...config,
			});

			setData(response.data.expense?.filter(filterByDateRange));
			setCurrentPage(response.data.pagination?.currentPage);
			setTotalRows(response.data.pagination.totalItems);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const fetchKittyConfig = async (dateMeeting: any) => {
		try {
			const response = await axios.get("/api/kitty-config", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("signIn")}`,
				},
			});
			if (response.status === 200) {
				const dateOfMeeting = moment(dateMeeting);
				const matchingKittyType = response.data.find((item: any) => {
					const rangeFrom = moment(item.range_from);
					const rangeTo = moment(item.range_to);

					// Check if the date_of_meeting falls within the range_from and range_to of each kitty type
					return (
						dateOfMeeting.isSameOrAfter(rangeFrom, "day") &&
						dateOfMeeting.isSameOrBefore(rangeTo, "day")
					);
				});
				return matchingKittyType?.param;
			}
		} catch (error) {
			console.error("fetch error kitty config", error);
		}
	};
	const handlePaidStatusChange = async (row: any, event: any) => {
		const updatedRow = { ...row, paid_status: event.target.value };

		try {
			const formData = new FormData();
			formData.append("paid_status", updatedRow.paid_status);

			const res = await axios.put(
				`/api/expense/${updatedRow.id}`,
				formData,
				config
			);

			if (res?.status === 200) {
				toast.success("Status changed successfully");
				if (updatedRow?.paid_status === "Paid") {
					const startDate = moment(new Date()).format("YYYY-MM-DD");
					const matchingKittyType = await fetchKittyConfig(
						updatedRow?.date_of_meeting
					);

					await axios.post(
						"/api/kitty-balance",
						{
							chapter_id: updatedRow?.chapter_id,
							reason: "CHAPTER FUND",
							given_by: updatedRow?.expense_head,
							date: startDate,
							amount: updatedRow?.amount,
							total_amount: updatedRow?.amount,
							kitty_type: matchingKittyType,
						},
						{
							headers: {
								Authorization: `Bearer ${localStorage.getItem("signIn")}`,
							},
						}
					);
				}
				fetchData(
					currentPage,
					perPage,
					selectedStatus,
					selectedPaidStatus,
					selectedExpenseType,
					selectExpance,
					selectedchapters
				);
			}
		} catch (error) {
			console.error("Error updating paid status:", error);
		}
	};

	const handleDownloadExcel = () => {
		const filteredData = filteredItems.map((item: any) => ({
			"Chapter Name": item.chapter_name,
			"Expense Type": item.expense_type,
			"Meeting Date": moment(item.date_of_meeting).format("LL"),
			"Invoice No": item.invoice_no,
			"Expense Head": item.expense_head,
			"Vendor Name": item.vendor_name,
			Amount: `₹${item.amount}`,
			"Paid Status": item.paid_status,
			Status: item.status,
		}));

		const worksheet = XLSX.utils.json_to_sheet(filteredData);

		const workbook = XLSX.utils.book_new();

		XLSX.utils.book_append_sheet(workbook, worksheet, "Expense Report");

		const excelBuffer = XLSX.write(workbook, {
			bookType: "xlsx",
			type: "array",
		});

		const excelBlob = new Blob([excelBuffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		saveAs(excelBlob, "Expense Report.xlsx");
	};

	const handleDownloadCSV = () => {
		// Filter out columns that should not be included in the CSV
		const filteredColumns = columns.filter(
			(column: any) => column.name !== "Action"
		);

		// Concatenate filtered column names with comma
		const csvContent =
			filteredColumns.map((column: any) => column.name).join(",") +
			"\n" +
			// For each item in filteredItems, concatenate the values of filtered columns with comma

			filteredItems
				.map((item: any) =>
					filteredColumns
						.map((column: any) => {
							const value =
								typeof column.selector === "function"
									? column.selector(item)
									: "";
							return typeof value === "string" ? `"${value}"` : "";
						})
						.join(",")
				)
				.join("\n");

		// Create Blob and trigger download
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
		saveAs(blob, "Expense Report.csv");
	};

	const filteredItems = data
		?.sort((a: any, b: any) => a.id - b.id)
		// .filter(
		// 	(item: any) =>
		// 		selectExpance === "" || item?.expense_head === selectExpance
		// )
		.filter((item: any) =>
			columns.some((column: any) => {
				let value =
					typeof column.selector === "function" ? column.selector(item) : "";

				if (typeof value === "string") {
					return value.toLowerCase().includes(searchTerm.toLowerCase());
				} else if (typeof value === "number") {
					return value.toString().includes(searchTerm.toLowerCase());
				}

				// Return false for non-string and non-number values
				return false;
			})
		);

	const handleDateFilter = (value: any) => {
		setDateRange(value);
		if (value === null) {
			setDateFilterApplied(false);
		}
	};
	const handleStatusPaidChange = (e: any) => {
		setselectedPaidStatus(e.target.value);
	};
	const handleExpanceHeadChange = (e: any) => {
		setselectExpance(e.target.value);
	};

	const handleStatusChange = (e: any) => {
		setSelectedStatus(e.target.value);
	};

	const handleExpenseTypeChange = (e: any) => {
		setSelectedExpenseType(e.target.value);
	};
	const handleChapterChange = (e: any) => {
		setselectdChapter(e.target.value);
	};

	useEffect(() => {
		if (urlParams.get("chapter_id")) {
			setselectdChapter(urlParams.get("chapter_id"));
		}
	}, [urlParams.get("chapter_id")]);

	console.log(selectedchapters);

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
							onChange={handleOnChangeSearch}
							type="search"
							value={filterText}
						/>
						<i
							className="fa fa-search"
							aria-hidden="true"
							onClick={handleSearchClick}></i>
					</div>
					{/* <Btn color="primary"  className="ms-2">
							Search
						</Btn> */}
				</div>
				{/* Dropdown for Expense Type */}
				<div className="filter-data">
					<div className="filter-data-select">
						<div className="lable">
							<Label>Type:</Label>
						</div>
						<div>
							<Input type="select" onChange={handleExpenseTypeChange}>
								<option value="">All</option>
								<option value="Meeting">Meeting</option>
								<option value="Others">Others</option>
							</Input>
						</div>
					</div>
					<div className="filter-data-select">
						<div className="lable">
							<Label>Chapter:</Label>
						</div>
						<div>
							<Input
								type="select"
								value={selectedchapters}
								onChange={handleChapterChange}>
								<option value="">All</option>
								{Array.isArray(chaptersData) &&
									chaptersData.map((option: any, index: any) => (
										<option key={index} value={option.id}>
											{option?.chapter_name}
										</option>
									))}
							</Input>
						</div>
					</div>
					{/* Dropdown for Paid Status */}
					<div className="filter-data-select">
						<div className="lable">
							<Label>Paid Status:</Label>
						</div>
						<div>
							<Input type="select" onChange={handleStatusPaidChange}>
								<option value="">All</option>
								<option value="Paid">Paid</option>
								<option value="UnPaid">Unpaid</option>
							</Input>
						</div>
					</div>

					<div className="filter-data-select">
						<div className="lable">
							<Label>Expense Head:</Label>
						</div>
						<div>
							<Input type="select" onChange={handleExpanceHeadChange}>
								<option value="">All</option>
								{expenseHeadOptions.map((expance) => (
									<option value={expance.value}>{expance.label}</option>
								))}
							</Input>
						</div>
					</div>
					<div className="filter-data-select">
						<div className="lable">
							<Label>Status:</Label>
						</div>
						<div>
							<Input type="select" onChange={handleStatusChange}>
								<option value="">All</option>
								{StatusOptions.map((status) => (
									<option value={status.value}>{status.label}</option>
								))}
							</Input>
						</div>
					</div>
					<div className="filter-data-select">
						<div className="lable">
							<Label>Date Range:</Label>
						</div>
						<div>
							<DateRangePicker
								value={dateRange}
								onChange={handleDateFilter}
								format="yyyy-MM-dd"
							/>
						</div>
					</div>
				</div>
			</>
		);
	}, [filterText, dateRange, chaptersData, selectedchapters]);

	useEffect(() => {
		fetchData(
			currentPage,
			perPage,
			selectedStatus,
			selectedPaidStatus,
			selectedExpenseType,
			selectExpance,
			selectedchapters
		);
	}, [
		token,
		dateFilterApplied,
		searchTerm,
		selectedStatus,
		selectedPaidStatus,
		selectedExpenseType,
		selectExpance,
		selectedchapters,
	]);

	return (
		<Layout>
			<div className="page-body">
				<Row>
					<Col sm="12">
						<Card>
							<CardBody>
								<Btn
									color="primary"
									className="me-2"
									onClick={handleDownloadExcel}>
									<i className="fa fa-file-excel"></i> Excel
								</Btn>
								<Btn
									color="primary"
									className="me-2"
									onClick={handleDownloadCSV}>
									<i className="fa fa-file-text" aria-hidden="true"></i> CSV
								</Btn>

								<div
									className="table-responsive theme-scrollbar"
									id="row_create">
									<DataTable
										pagination
										paginationServer
										paginationPerPage={perPage}
										paginationDefaultPage={currentPage}
										paginationTotalRows={totalRows}
										onChangeRowsPerPage={handleRowsPerPageChange}
										onChangePage={handlePageChange}
										subHeader
										highlightOnHover
										striped
										persistTableHead
										subHeaderComponent={subHeaderComponentMemo}
										columns={columns.map((column: any) => ({
											...column,
											cell: (row: any) =>
												column.cell
													? column.cell({ row, fetchData })
													: column.selector(row),
										}))}
										data={filteredItems}
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

export default Index;

