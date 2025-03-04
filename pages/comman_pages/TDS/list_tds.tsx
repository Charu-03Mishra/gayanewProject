import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Layout from "../../Layout/Layout";
import DataTable from "react-data-table-component";
import localStorage from "@/utils/localStorage";
import UL from "@/pages/components/ListGroup/UnorderedList";
import LI from "@/pages/components/ListGroup/ListItem";
import Link from "next/link";
import {
	Card,
	CardBody,
	CardHeader,
	Col,
	FormGroup,
	Input,
	Label,
	Row,
} from "reactstrap";
import axios from "axios";
import H4 from "@/pages/components/headings/H4Element";
import Badges from "@/pages/components/Badge";
import Btn from "@/pages/components/button";
import WhatsappPop from "@/pages/components/WhatsappPop/WhatsappPop";

const TableAction = ({ row, fetchData, currentPage, perPage }: any) => {
	const [isUpdating, setIsUpdating] = useState(false);
	const isPending = row?.row?.status === "pending";
	const handleStatusUpdate = async (status: string) => {
		setIsUpdating(true);
		try {
			const formData = new FormData();
			formData.append("member_id", row.row?.member_id);
			formData.append("chapter_id", row.row?.chapter_id);
			formData.append("tan", row.row?.tan);
			formData.append("tds_amount", row.row?.tds_amount);
			formData.append("income_head", row.row?.income_head);
			formData.append("account_name", row.row?.account_name);
			formData.append("bank_name", row.row?.bank_name);
			formData.append("bank_account_number", row.row?.bank_account_number);
			formData.append("ifsc_code", row.row?.ifsc_code);
			formData.append("branch", row.row?.branch);
			formData.append("attachment", row.row?.attachment);
			formData.append("status", status);
			const res = await axios.put(`/api/tds-records/${row.row?.id}`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: `Bearer ${localStorage.getItem("signIn")}`,
				},
			});
			if (res.status === 200) {
				toast.success(
					`TDS ${status === "approved" ? "approved" : "rejected"} successfully!`
				);
				fetchData(currentPage, perPage);
			}
		} catch (error) {
			console.error("Error updating status:", error);
			setIsUpdating(false);
		}
	};

	return (
		<UL className="action simple-list flex-row">
			{isPending && (
				<>
					<LI className="edit">
						{isUpdating ? (
							<i role="status">
								<span className="visually-hidden">Loading...</span>
							</i>
						) : (
							<button
								style={{ backgroundColor: "unset" }}
								onClick={() => handleStatusUpdate("approved")}
								disabled={isUpdating}>
								<i className="icon-check" />
							</button>
						)}
					</LI>
					<LI className="delete">
						<button
							style={{ backgroundColor: "unset" }}
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

const ListTds = () => {
	const token = localStorage.getItem("signIn");
	const [data, setData] = useState([]);
	const [filterText, setFilterText] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const memberRole = localStorage.getItem("role");
	const [perPage, setPerPage] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalRows, setTotalRows] = useState<number>(0);

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
			width: "140px",
			wrap: true,
		},
		{
			name: "Member Name",
			selector: (row: any) => row.member_name,
			sortable: true,
			width: "140px",
		},
		{
			name: "TAN",
			selector: (row: any) => row.tan,
			sortable: true,
			grow: 2,
		},
		{
			name: "TDS Amount",
			selector: (row: any) => `₹${row.tds_amount}`,
			sortable: true,
			width: "130px",
		},
		{
			name: "Income Head",
			selector: (row: any) => row.income_head,
			sortable: true,
			width: "130px",
		},
		{
			name: "Account Details",
			selector: (row: any) => (
				<div>
					<p style={{ fontSize: "12px" }}>Account Name: {row.account_name}</p>
					<p style={{ fontSize: "12px" }}>Bank Name: {row.bank_name}</p>
					<p style={{ fontSize: "12px" }}>
						Account Number: {row.bank_account_number}
					</p>
					<p style={{ fontSize: "12px" }}>IFSC: {row.ifsc_code}</p>
					<p style={{ fontSize: "12px" }}>Branch: {row.branch}</p>
				</div>
			),
			sortable: true,
			sortFunction: (a: any, b: any) => {
				return a.bank_account_number.localeCompare(b.bank_account_number);
			},
			width: "170px",
			wrap: true,
		},
		{
			name: "TDS Certificate",
			cell: (row: any) => (
				<div className="action">
					<Link
						className="edit"
						rel="/assets/images/favicon.png"
						href={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/${row.row?.attachment}`}
						target="_blank">
						<i className="icon-import"> </i>
					</Link>
				</div>
			),
			sortable: true,

			width: "140px",
		},
		{
			name: "Status",
			selector: (row: { status: any }) => <CustomBadge status={row.status} />,
			sortable: true,
			sortFunction: (a: any, b: any) => {
				return a.status.localeCompare(b.status);
			},
			grow: 2,
		},
		// {
		//   name: "Action",
		//   cell: (row: any) =><TableAction row={row} fetchData={fetchData} />,
		//   sortable: true,
		// },
		// Conditionally include the "Action" column based on memberRole
		...(memberRole !== "member"
			? [
					{
						name: "Action",
						cell: (row: any) => (
							<TableAction
								row={row}
								fetchData={fetchData}
								currentPage={currentPage}
								perPage={perPage}
							/>
						),
						sortable: true,
					},
			  ]
			: []),
	];

	const handleSearchClick = () => {
		setSearchTerm(filterText.trim());
	};

	const handleOnChangeSearch = (e: any) => {
		const value = e.target.value;
		setFilterText(value);

		if (value.trim() === "") {
			setSearchTerm("");
		}
	};
	const filteredItems = [...data].reverse()?.filter((item: any) =>
		columns.some((column: any) => {
			let value =
				typeof column.selector === "function" ? column.selector(item) : "";

			return (
				typeof value === "string" &&
				value.toLowerCase().includes(searchTerm.toLowerCase())
			);
		})
	);

	const subHeaderComponentMemo = useMemo(() => {
		return (
			<div
				id="basic-1_filter"
				className="dataTables_filter d-flex align-items-center">
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
		);
	}, [filterText]);

	const fetchData = async (page: number, newRowsPerPage: any) => {
		if (typeof window !== "undefined" && window.localStorage) {
			try {
				const response = await axios.get(
					`/api/tds-records?page=${page}&pageSize=${newRowsPerPage}&search=${filterText}`,
					config
				);
				setData(response.data?.tds);
				setTotalRows(response.data.pagination?.totalItems);
				// if (memberDetail?.role === "member") {
				//   const memberFilterData = response.data.tds?.filter(
				//     (value: any) => value?.member_id === memberDetail?.id
				//   );
				//   console.log('memberFilterData', memberFilterData)
				//   setData(memberFilterData);
				//   setTotalRows(response.data.pagination?.totalItems)
				// } else {
				//   setData(response.data?.tds);
				//   setTotalRows(response.data.pagination?.totalItems)
				// }
			} catch (error) {
				console.error("Error fetching tds_records data:", error);
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
	}, [token, searchTerm]);
	return (
		<Layout>
			<div className="page-body">
				<Row>
					<Col sm="12">
						<Card>
							<CardHeader className="pb-0 card-no-border">
								<H4>TDS List</H4>
							</CardHeader>
							<CardBody>
								<div
									className="table-responsive theme-scrollbar"
									id="row_create">
									<DataTable
										pagination
										paginationServer
										paginationRowsPerPageOptions={[10, 15, 20, 25]}
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
										className="display dataTable"
									/>
								</div>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
			<WhatsappPop />
		</Layout>
	);
};

export default ListTds;

