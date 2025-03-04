import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import localStorage from "@/utils/localStorage";
import { Card, CardBody, Col, Input, Label } from "reactstrap";
import DataTable from "react-data-table-component";
import moment from "moment";
import "jspdf-autotable";
import Layout from "../Layout/Layout";
import WhatsappPop from "../components/WhatsappPop/WhatsappPop";

const ManagePayment = () => {
	const token = localStorage.getItem("signIn");
	const [filterText, setFilterText] = useState("");
	const [data, setData] = useState([]);
	// const [userData, setUserData] = useState<any>(null);
	const [perPage, setPerPage] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalRows, setTotalRows] = useState<number>(0);
	const userData = JSON.parse(localStorage.getItem("members_detail"));

	console.log("data", data);
	type StatusType = "captured" | "approved" | "pending";

	interface PaymentData {
		id: number;
		name: string;
		status: StatusType;
	}

	const columns: any = [
		{
			name: "Amount",
			selector: (row: any) =>
				row.total_amount ? `\u20B9${row.total_amount}` : `\u20B9 ${0}`,
			sortable: true,
		},
		{
			name: "Txn ID",
			selector: (row: any) => row.order_id,
			sortable: true,
		},
		{
			name: "Payment type",
			selector: (row: any) => row.payment_type,
			sortable: true,
		},

		{
			name: "Date",
			selector: (row: any) => moment(row.start_payment_date).format("LL"),
			sortable: true,
			sortFunction: (a: any, b: any) =>
				new Date(b.start_payment_date).getTime() -
				new Date(a.start_payment_date).getTime(),
		},

		{
			name: "Mode",
			selector: (row: any) => row.mode,
			sortable: true,
		},
		{
			name: "Status",
			selector: (row: any) =>
				row.status === "captured" || row.status === "approved" ? (
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
		{
			name: "Transaction Date",
			selector: (row: any) => moment(row.createdAt).format("LL"),
			sortable: true,
		},
	];

	const filteredItems: any = data
		?.sort((a: any, b: any) => b.id - a.id)
		.filter((item: any) =>
			columns.some((column: any) => {
				let value =
					typeof column.selector === "function" ? column.selector(item) : "";

				return (
					typeof value === "string" &&
					value.toLowerCase().includes(filterText.toLowerCase())
				);
			})
		);

	const sortedFilteredItems = [...filteredItems].sort((a, b) => {
		const statusOrder: Record<StatusType, number> = {
			approved: 1,
			captured: 1,
			pending: 2,
		};
		return (
			statusOrder[(a as PaymentData).status] -
			statusOrder[(b as PaymentData).status]
		);
	});

	const subHeaderComponentMemo = useMemo(() => {
		return (
			<div
				id="basic-1_filter"
				className="dataTables_filter d-flex align-items-center justify-content-between">
				<Label className="me-2">Search:</Label>
				<Input
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setFilterText(e.target.value)
					}
					type="search"
					value={filterText}
				/>
			</div>
		);
	}, [filterText]);

	const fetchData = async (page: any, newRowsPerPage: any) => {
		if (typeof window !== "undefined" && window.localStorage) {
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			try {
				const response = await axios.get(
					`/api/rzp_payments?page=${page}&pageSize=${newRowsPerPage}&search=${filterText}`,
					config
				);

				const fetchedData = response.data.payments;
				setData(fetchedData);
				setCurrentPage(response.data.pagination?.currentPage);
				setTotalRows(response.data.pagination?.totalItems);
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
	}, [token, filterText]);

	return (
		<Layout>
			<div className="page-body">
				<Col sm="12">
					<Card>
						<CardBody>
							<div className="table-responsive">
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
									data={sortedFilteredItems}
								/>
							</div>
						</CardBody>
					</Card>
				</Col>
			</div>
			<WhatsappPop />
		</Layout>
	);
};

export default ManagePayment;

