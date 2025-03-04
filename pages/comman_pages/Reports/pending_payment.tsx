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
	const urlParams = new URLSearchParams(window.location.search);
	const [chaptersData, setselectChapter] = useState<any>([]);
	const [selectchaptersData, setSelectchaptersData] = useState<any>("");
	const [ltData, setLtData] = useState<any>({});
	const role = localStorage.getItem("role");
	const columns: any = [
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
			name: "Meeting due date",
			selector: (row: any) => moment(row.meeting_due_date).format("MM/DD/YYYY"),
			sortable: true,
		},
		{
			name: "Pending amount",
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
	const handleChapterChange = (e: any) => {
		console.log(e.target.value);

		setSelectchaptersData(e.target.value);
	};
	const subHeaderComponentMemo = useMemo(() => {
		return (
			<>
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
				<div className="dataTables_filter d-flex align-items-center">
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
				</div>
			</>
		);
	}, [filterText, selectchaptersData, chaptersData]);

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
	useEffect(() => {
		fetchData2();
	}, [token, ltData]);

	useEffect(() => {
		if (urlParams.get("chapter_id")) {
			selectchaptersData(urlParams.get("chapter_id"));
		}
	}, [urlParams.get("chapter_id")]);
  
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
				chapter_id: selectchaptersData || urlParams.get("chapter_id") || "all",
			};
			if (searchTerm) params.search = searchTerm;
			try {
				const response = await axios.get(`/api/pending-payments`, {
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
		fetchData(page, perPage, selectchaptersData);
		setCurrentPage(page);
	};

	const handleRowsPerPageChange = async (newRowsPerPage: any) => {
		if (!data.length) return;
		fetchData(currentPage, newRowsPerPage, selectchaptersData);
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
			const response = await axios.get("/api/export-pending-payments", {
				params,
				...config,
			});
			const blob = new Blob([response.data], {
				type: "text/csv;charset=utf-8",
			});
			saveAs(blob, "Pending Payment Report.csv");
		} catch (error) {
			console.error("Error downloading CSV:", error);
		}
	};

	useEffect(() => {
		fetchData(currentPage, perPage, selectchaptersData);
	}, [token, searchTerm, selectchaptersData]);

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

