import React, { useEffect, useMemo, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";
import localStorage from "@/utils/localStorage";
import Layout from "../../Layout/Layout";
import { Card, CardBody, Col, FormGroup, Input, Label } from "reactstrap";
import DataTable from "react-data-table-component";
import { saveAs } from "file-saver";
import Btn from "@/pages/components/button";
import moment from "moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DateRangePicker } from "rsuite";
import { ValueType } from "rsuite/esm/DateRangePicker";
import { log } from "node:console";

const MembershipRenew = () => {
	const token = localStorage.getItem("signIn");
	const [filterText, setFilterText] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [dateFilterApplied, setDateFilterApplied] = useState(false);
	const [dateRange, setDateRange] = useState<ValueType | any>([]);
	const [data, setData] = useState([]);
	const [ltData, setLtData] = useState<any>({});
	const role = localStorage.getItem("role");
	const [perPage, setPerPage] = useState<number>(10);
	const [chaptersData, setselectChapter] = useState<any>([]);
	const [selectchaptersData, setSelectchaptersData] = useState<any>("");
	const urlParams = new URLSearchParams(window.location.search);
	// const [selectedchapters, setselectdChapter] = useState<any>("");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [TotalRenewalsToday, setTotalRenewalsToday] = useState<number>(0);
	const [CurrentMonthsToday, setCurrentMonthsToday] = useState<number>(0);

	const columns: any = [
		{
			name: "Amount",
			selector: (row: any) => `\u20B9${row.total_amount}`,
			sortable: true,
		},
		{
			name: "Txn ID",
			selector: (row: any) => row.order_id,
			sortable: true,
			width: "200px",
		},
		{
			name: "Chapter Name",
			selector: (row: any) => row.chapter_name,
			sortable: true,
		},
		{
			name: "Member Name",
			selector: (row: any) => row.member_name,
			sortable: true,
		},
		{
			name: "Transaction Date",
			selector: (row: any) => moment(row.createdAt).format("LL"),
			sortable: true,
			width: "150px",
		},
		{
			name: "Date",
			selector: (row: any) => moment(row.start_payment_date).format("LL"),
			sortable: true,
			width: "150px",
		},
		{
			name: "Status",
			selector: (row: any) =>
				row.status === "captured" ? (
					<span className="badge badge-flat border-success bg-success">
						Paid
					</span>
				) : (
					<span className="badge badge-flat border-primary bg-primary">
						Pending
					</span>
				),
			sortable: true,
		},
	];

	const filteredItems: any = data
		.sort((a: any, b: any) => b.id - a.id)
		.filter((item: any) =>
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

	const handleDownloadCSV = async () => {
		const config = {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			responseType: "blob" as AxiosRequestConfig["responseType"],
		};
		const params: any = {
			payment_type: "membership fees",
		};
		if (searchTerm) params.search = searchTerm;
		if (dateFilterApplied && dateRange?.length === 2) {
			params.startDate = moment(dateRange[0]).format("YYYY-MM-DD");
			params.endDate = moment(dateRange[1]).format("YYYY-MM-DD");
		}
		try {
			const response = await axios.get("/api/export-payment-type", {
				params,
				...config,
			});
			const blob = new Blob([response.data], {
				type: "text/csv;charset=utf-8",
			});
			saveAs(blob, "Membership Fees Payment Report.csv");
		} catch (error) {
			console.error("Error downloading CSV:", error);
		}
	};
	const handleSearchClick = () => {
		setSearchTerm(filterText?.trim());
		setDateFilterApplied(true);
	};
	const handleChapterChange = (e: any) => {
		console.log(e.target.value);

		setSelectchaptersData(e.target.value);
	};
	console.log(selectchaptersData);

	const handleDateFilter = (value: any) => {
		setDateRange(value);
		if (value === null) {
			setDateFilterApplied(false);
		}
	};

	const handleOnChangeSearch = (e: any) => {
		const value = e.target.value;
		setFilterText(value);

		if (value.trim() === "") {
			setSearchTerm("");
		}
	};

	const subHeaderComponentMemo = useMemo(() => {
		return (
			<>
				<div className="Input-content">
					<div className="inputcontent">
						<Input
							onChange={handleOnChangeSearch}
							type="search"
							placeholder="Search By..."
							value={filterText}
						/>
						<i
							className="fa fa-search"
							aria-hidden="true"
							onClick={handleSearchClick}></i>
					</div>
				</div>
				{/* <div className="field mt-1">
					
				</div> */}
				{/* <div className="dataTables_filter d-flex align-items-center">
					<Label className="me-2">Search:</Label>
					<Input
						onChange={handleOnChangeSearch}
						type="search"
						value={filterText}
					/>
					<Btn color="primary" onClick={handleSearchClick} className="ms-2">
						Search
					</Btn>
				</div> */}
				<div className="filter-datas">
					<div className="date-data">
						<FormGroup className="me-3">
							<DateRangePicker
								value={dateRange}
								onChange={handleDateFilter}
								format="yyyy-MM-dd"
								placeholder="Date Range"
							/>
						</FormGroup>
						<FormGroup className="form-data">
							<Input
								type="select"
								value={selectchaptersData}
								onChange={handleChapterChange}>
								<option value="">Chapters</option>
								{Array?.isArray(chaptersData) &&
									chaptersData?.map((option: any, index: any) => (
										<option key={index} value={option.id}>
											{option?.chapter_name}
										</option>
									))}
							</Input>
						</FormGroup>
					</div>
				</div>
				<div className="showActive">
					<div className="TotalActive">
						<span>Total Renewals Today: </span>
						<span style={{ color: "green" }}>{TotalRenewalsToday}</span>{" "}
					</div>

					<div className="TotalActive">
						<span>Total Renewals This Month:</span>{" "}
						<span style={{ color: "red" }}>{CurrentMonthsToday}</span>
					</div>
				</div>

				
			</>
		);
	}, [
		filterText,
		dateRange,
		chaptersData,
		selectchaptersData,
		TotalRenewalsToday,
		CurrentMonthsToday,
	]);

	const fetchData2 = async () => {
		if (typeof window !== "undefined" && window.localStorage) {
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			try {
				const response = await axios.get("/api/chapterlist", config);
				let chapterFilterData: any;
				if (role === "admin" || role === "vendor") {
					chapterFilterData = response.data.chapters;
					console.log(data, "data chapter");
				} else {
					chapterFilterData = response.data?.filter(
						(value: any) => value?.id === ltData?.chapter_id
					);
				}
				setselectChapter(chapterFilterData);
			} catch (error) {
				console.error("Error fetching chapters data:", error);
			}
		}
	};
	const fetchData3 = async () => {
		if (typeof window !== "undefined" && window.localStorage) {
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			try {
				const response = await axios.get("/api/membership-renewal", config);
				const Total_Renewals_Today = response.data.today;
				const current_month = response.data.current_month;
				setTotalRenewalsToday(Total_Renewals_Today);
				setCurrentMonthsToday(current_month);
			} catch (error) {
				console.error("Error fetching chapters data:", error);
			}
		}
	};
	console.log(TotalRenewalsToday);
	console.log(CurrentMonthsToday);

	useEffect(() => {
		fetchData2();
		fetchData3();
	}, [token, ltData]);

	const fetchData = async (
		page: number,
		pageSize: any,
		selectchaptersData: any
	) => {
		if (typeof window !== "undefined" && window.localStorage) {
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};
			const params: any = {
				page,
				pageSize,
				payment_type: "membership fees",
				chapter_id: urlParams.get("chapter_id"),
			};

			if (searchTerm) params.search = searchTerm;
			if (dateFilterApplied && dateRange?.length === 2) {
				params.startDate = moment(dateRange[0]).format("YYYY-MM-DD");
				params.endDate = moment(dateRange[1]).format("YYYY-MM-DD");
			}
			const url = new URL(`/api/payment-type-filter`, window.location.origin);

			if (selectchaptersData !== "") {
				url.searchParams.append("chapter_id", selectchaptersData);
			}

			try {
				const responseFilter = await axios.get(url.toString(), {
					params,
					...config,
				});

				setData(responseFilter?.data.payments);
				setCurrentPage(responseFilter.data.pagination?.currentPage);
				setTotalRows(responseFilter.data.pagination?.totalItems);
			} catch (error) {
				console.error("Error fetching payment data:", error);
			}
		}
	};

	const handlePageChange = (page: any) => {
		fetchData(page, perPage, selectchaptersData);
		setCurrentPage(page);
	};

	const handleRowsPerPageChange = async (newRowsPerPage: any) => {
		if (!data.length) return;
		fetchData(currentPage, newRowsPerPage, selectchaptersData);
		setPerPage(newRowsPerPage);
	};

	useEffect(() => {
		fetchData(currentPage, perPage, selectchaptersData);
	}, [dateFilterApplied, searchTerm, selectchaptersData]);
	return (
		<Layout>
			<div className="page-body">
				<Col sm="12">
					<Card>
						<CardBody>
							<div className="table-responsive">
								<Btn
									color="primary"
									className="me-2"
									onClick={handleDownloadCSV}>
									<i className="fa fa-file-text" aria-hidden="true"></i> CSV
								</Btn>
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
									columns={columns}
									data={filteredItems}
								/>
							</div>
						</CardBody>
					</Card>
				</Col>
			</div>
		</Layout>
	);
};
export default MembershipRenew;

