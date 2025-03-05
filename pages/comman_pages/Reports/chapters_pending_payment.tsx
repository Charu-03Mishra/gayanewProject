import React, { useEffect, useMemo, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";
import localStorage from "@/utils/localStorage";
import Layout from "../../Layout/Layout";
import { Card, CardBody, Col, Input, Label } from "reactstrap";
import DataTable from "react-data-table-component";
import Btn from "@/pages/components/button";
import moment from "moment";
import { saveAs } from "file-saver";

const PendingPayment = () => {
	const token = localStorage.getItem("signIn");
	const [data, setData] = useState<any>([]);
	const [filterText, setFilterText] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [perPage, setPerPage] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalRows, setTotalRows] = useState<number>(0);

	const columns: any = [
		{
			name: "Chapter Name",

			sortable: true,
			cell: (row: any) => (
				<a
					href={"/comman_pages/Reports/pending_payment"}
					target="_blank"
					rel="noopener noreferrer">
					{row.chapter_name}
				</a>
			),
			ignoreRowClick: true,
			allowOverflow: true,
			button: true,
		},
		{
			name: "Total amount",
			selector: (row: any) => row.pending_amount,
			sortable: true,
		},
	];

	const filteredItems: any = data
		.sort((a: any, b: any) => a.id - b.id)
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

	const handleOnChangeSearch = (e: any) => {
		const value = e.target.value;
		setFilterText(value);

		if (value.trim() === "") {
			setSearchTerm("");
		}
	};
	const handleSearchClick = () => {
		setSearchTerm(filterText.trim());
	};
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
			};
			if (searchTerm) params.search = searchTerm;
			try {
				const response = await axios.get(`/api/chapters-pending-payments`, {
					params,
					...config,
				});
				setData(response.data?.data);
				setCurrentPage(response.data.pagination?.currentPage);
				setTotalRows(response.data.pagination?.totalItems);
			} catch (error) {
				console.error("Error fetching chapters data:", error);
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

	const handleDownloadCSV = async () => {
		const config = {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			responseType: "blob" as AxiosRequestConfig["responseType"],
		};
		const params: any = {};
		if (searchTerm) params.search = searchTerm;

		try {
			const response = await axios.get(
				"/api/export-chapters-pending-payments",
				{
					params,
					...config,
				}
			);
			const blob = new Blob([response.data], {
				type: "text/csv;charset=utf-8",
			});
			saveAs(blob, "Chapter Pending Payment Report.csv");
		} catch (error) {
			console.error("Error downloading CSV:", error);
		}
	};

	useEffect(() => {
		fetchData(currentPage, perPage);
	}, [token, searchTerm]);

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

export default PendingPayment;

