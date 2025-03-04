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

const MembershipRenew = () => {
	const token = localStorage.getItem("signIn");
	const [filterText, setFilterText] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [dateFilterApplied, setDateFilterApplied] = useState(false);
	const [dateRange, setDateRange] = useState<ValueType | any>([]);
	const [data, setData] = useState([]);
	const [perPage, setPerPage] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalRows, setTotalRows] = useState<number>(0);

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
				<div className="field mt-1">
					<FormGroup className="me-3">
						<Label>Date Range:</Label>
						<DateRangePicker
							value={dateRange}
							onChange={handleDateFilter}
							format="yyyy-MM-dd"
						/>
					</FormGroup>
				</div>
				<div className="dataTables_filter d-flex align-items-center">
					<Label className="me-2">Search:</Label>
					<Input
						onChange={handleOnChangeSearch}
						type="search"
						value={filterText}
					/>
					<Btn color="primary" onClick={handleSearchClick} className="ms-2">
						Search
					</Btn>
				</div>
			</>
		);
	}, [filterText, dateRange]);

	const fetchData = async (page: number, pageSize: any) => {
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
			};

			if (searchTerm) params.search = searchTerm;
			if (dateFilterApplied && dateRange?.length === 2) {
				params.startDate = moment(dateRange[0]).format("YYYY-MM-DD");
				params.endDate = moment(dateRange[1]).format("YYYY-MM-DD");
			}

			try {
				const responseFilter = await axios.get(`/api/payment-type-filter`, {
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
		fetchData(page, perPage);
		setCurrentPage(page);
	};

	const handleRowsPerPageChange = async (newRowsPerPage: any) => {
		if (!data.length) return;
		fetchData(currentPage, newRowsPerPage);
		setPerPage(newRowsPerPage);
	};

	useEffect(() => {
		fetchData(currentPage, perPage);
	}, [dateFilterApplied, searchTerm]);
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

