import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../Layout/Layout";
// import ProtectedRoute from "@/pages/components/ProtectedRoute";
import {
	Button,
	Card,
	CardBody,
	Col,
	FormGroup,
	Input,
	Label,
} from "reactstrap";
import DataTable from "react-data-table-component";
import localStorage from "@/utils/localStorage";
import axios from "axios";
import MemberTableAction from "./memberTableAction";
import Link from "next/link";
import UL from "@/pages/components/ListGroup/UnorderedList";
import LI from "@/pages/components/ListGroup/ListItem";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Badges from "@/pages/components/Badge";
import moment from "moment";
import Btn from "@/pages/components/button";
import { ValueType } from "rsuite/esm/Checkbox";
import { DatePicker, DateRangePicker } from "rsuite";

const membershipStatusOptions = [
	{ value: "", label: "Select options" },
	{ value: "Active", label: "Active" },
	{ value: "Drop", label: "Drop" },
];

const TableAction = ({ id }: any) => {
	const router = useRouter();
	if (!id) {
		return null;
	}
	const handleClick = (e: any) => {
		e.preventDefault();
		router.replace(`/comman_pages/members/edit_members/${id}`);
	};

	return (
		<UL className="action simple-list flex-row" id={id}>
			<LI className="edit">
				<Link
					href={{
						pathname: `/comman_pages/members/edit_members/${id}`,
						query: { id: id },
					}}
					onClick={handleClick}>
					<i className="icon-pencil-alt" />
				</Link>
			</LI>
		</UL>
	);
};

const CustomBadge = ({ role, permission_LT, permission_SGDC }: any) => {
	const getStatusColor = (type: any, value: any) => {
		if (type === "role") {
			switch (value) {
				case "admin":
					return "primary";
				case "member":
					return "success";
				default:
					return "";
			}
		} else if (type === "permission_LT") {
			return value ? "info" : "";
		} else if (type === "permission_SGDC") {
			return value ? "warning" : "";
		}
	};

	return (
		<div>
			{role && (
				<Badges pill color={getStatusColor("role", role)} className="mr-1">
					{role}
				</Badges>
			)}
			{permission_LT && (
				<Badges
					pill
					color={getStatusColor("permission_LT", permission_LT)}
					className="mr-1">
					{permission_LT}
				</Badges>
			)}
			{permission_SGDC && (
				<Badges pill color={getStatusColor("permission_SGDC", permission_SGDC)}>
					{permission_SGDC}
				</Badges>
			)}
		</div>
	);
};

const Index: React.FC = () => {
	const [chapters, setChapters] = useState([]); // Store all chapters
	const [filteredChapters, setFilteredChapters] = useState([]); // Store filtered chapters
	const [selectedChapter, setSelectedChapter] = useState(""); // Selected chapter for filtering
	const [dateRange, setDateRange] = useState<any>([]);

	// Fetch chapters from API on component mount
	useEffect(() => {
		const fetchChapters = async () => {
			try {
				const response = await axios.get(`/api/chapters`);
				setChapters(response.data);
				setFilteredChapters(response.data); // Initially display all chapters
			} catch (error) {
				console.error("Error fetching chapters:", error);
			}
		};

		fetchChapters();
	}, []);

	// Handle filtering based on selected chapter
	const handleChapterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const chapter = e.target.value;
		setSelectedChapter(chapter);
	};

	const handleDateFilterChange = (date: Date | null) => {
		if (date) {
			const formattedDate = date.toISOString().split("T")[0]; // Convert to 'yyyy-MM-dd' format
			console.log("Selected Date:", formattedDate);
			setDateRange(formattedDate);
		} else {
			console.log("No date selected");
			setDateRange(""); // Reset if no date is selected
		}
	};

	const token = localStorage.getItem("signIn");
	const [data, setData] = useState([]);
	const [filterText, setFilterText] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [perPage, setPerPage] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalRows, setTotalRows] = useState<number>(0);

	const handleStatusChange = async (rowIndex: any, value: any) => {
		const updatedData: any = [...data];
		updatedData[rowIndex].membership_status = value;
		setData(updatedData);
		try {
			const editMemberRes = await axios.put(
				`/api/members/${updatedData[rowIndex]?.id}`,
				{
					membership_status: value,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			if (editMemberRes.status === 200) {
				toast.success("Membership status updated successfully");
			}
		} catch (error) {
			console.error("error updating status", error);
		}
	};

	const handleDateChange = async (row: any, e: any, fieldName: string) => {
		const updatedData: any = [...data];
		const rowIndex = data.findIndex((item: any) => item.id === row.id);
		updatedData[rowIndex][fieldName] = e.target.value;
		setData(updatedData);

		try {
			const editMemberRes = await axios.put(
				`/api/members/${updatedData[rowIndex]?.id}`,
				{
					[fieldName]: e.target.value,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			if (editMemberRes.status === 200) {
				if (fieldName === "mf_end_date") {
					toast.success("Meeting fees end date updated successfully");
				} else if (fieldName === "membership_end_date") {
					toast.success("Membership end date updated successfully");
				}
			}
		} catch (error) {
			console.error("error updating status", error);
		}
	};

	const handleSearchClick = () => {
		setSearchTerm(filterText.trim());
	};

	const fetchData = async (
		page: number,
		newRowsPerPage: any,
		selectedChapter: string = "",
		dateRange: any
	) => {
		if (typeof window !== "undefined" && window.localStorage) {
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};
			const url = new URL(`/api/members`, window.location.origin);
			url.searchParams.append("page", page.toString());
			url.searchParams.append("pageSize", newRowsPerPage.toString());
			url.searchParams.append("search", searchTerm);

			if (selectedChapter !== "") {
				url.searchParams.append("chapters", selectedChapter);
			}

			if (dateRange) {
				url.searchParams.append("date", dateRange);
			}
			try {
				const response = await axios.get(url.toString(), config);
				setData(response.data.members);
				setTotalRows(response.data.pagination?.totalItems);
			} catch (error) {
				console.error("Error fetching chapters data:", error);
			}
		}
	};

	const handlePageChange = (page: any) => {
		fetchData(page, perPage, selectedChapter, dateRange);
		setCurrentPage(page);
	};

	const handleRowsPerPageChange = async (newRowsPerPage: any) => {
		if (!data.length) return;
		fetchData(currentPage, newRowsPerPage, selectedChapter, dateRange);
		setPerPage(newRowsPerPage);
	};
	const handleCDPSUpdate = async (row: any, value: any) => {
		const updatedRow = { ...row, flag: value };
		try {
			const editMemberRes = await axios.put(
				`/api/members/${updatedRow?.id}`,
				{
					flag: value,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			if (editMemberRes.status === 200) {
				toast.success("CDPS status updated successfully!");
				fetchData(currentPage, perPage, selectedChapter, dateRange);
			}
		} catch (error) {
			console.error("error updating status", error);
		}
	};
	const columns: any = [
		{
			name: "Name",
			selector: (row: any) => `${row.first_name} ${row.last_name}`,
			sortable: true,

			width: "170px",
		},
		{
			name: "Chapter",
			selector: (row: any) => row.chapter_name,
			sortable: true,

			width: "150px",
		},

		{
			name: "Mobile",
			selector: (row: any) => row.primary_number,
			sortable: true,
			width: "150px",
		},
		{
			name: "Company",
			selector: (row: any) => row.company_name,
			sortable: true,
			width: "150px",
		},
		{
			name: "Type",
			selector: (row: any) => {
				const roleAndPermission = {
					role: row.role,
					permission_LT: row.permission_LT !== null ? "LT" : "",
					permission_SGDC: row.permission_SGDC !== null ? "SGDC" : "",
				};
				return <CustomBadge {...roleAndPermission} />;
			},
			sortable: true,
			grow: 2,
		},
		{
			name: "Membership Status",
			selector: (row: any, index: any) =>
				row.membership_status === "Drop" ? (
					<button
						style={{ backgroundColor: "unset" }}
						onClick={() => handleStatusChange(index, "Active")}>
						{/* <i className="icon-check" /> */}
						<Badges pill color={"success"} className="mr-1">
							Active
						</Badges>
					</button>
				) : row.membership_status === "Active" ? (
					<button
						style={{ backgroundColor: "unset" }}
						onClick={() => handleStatusChange(index, "Drop")}>
						{/* <i className="fa fa-ban" /> */}
						<Badges pill color={"danger"} className="mr-1">
							Drop
						</Badges>
					</button>
				) : (
					<button
						style={{ backgroundColor: "unset" }}
						onClick={() => handleStatusChange(index, "Active")}>
						{/* <i className="icon-check" /> */}
						<Badges pill color={"success"} className="mr-1">
							Active
						</Badges>
					</button>
				),
			sortable: true,
			width: "170px",
		},
		{
			name: "CDPS",
			selector: (row: any, index: any) =>
				row.flag === 1 ? (
					<span
						className="cursor-pointer"
						aria-hidden="true"
						style={{ cursor: "pointer" }}
						onClick={() => handleCDPSUpdate(row, false)}>
						Recieved
					</span>
				) : (
					<span
						className="cursor-pointer"
						aria-hidden="true"
						style={{ cursor: "pointer" }}
						onClick={() => handleCDPSUpdate(row, true)}>
						Pending
					</span>
				),
			sortable: true,
			grow: 0,
		},
		{
			name: "MF End Date",
			selector: (row: any, index: any) => (
				<Input
					type="date"
					name={`mf_end_date`}
					onChange={(e: any) => handleDateChange(row, e, "mf_end_date")}
					value={
						row.mf_end_date ? moment(row.mf_end_date).format("YYYY-MM-DD") : ""
					}
					style={{ fontSize: "12px" }}
				/>
			),
			width: "175px",
			sortable: true,
		},
		{
			name: "Membership End Date",
			selector: (row: any, index: any) => (
				<Input
					type="date"
					name={`membership_end_date`}
					onChange={(e: any) => handleDateChange(row, e, "membership_end_date")}
					value={
						row.membership_end_date
							? moment(row.membership_end_date).format("YYYY-MM-DD")
							: ""
					}
					style={{ fontSize: "12px" }}
				/>
			),
			width: "180px",
			sortable: true,
		},
		{
			name: "Permissions",
			selector: (row: any) => {
				return (
					<MemberTableAction
						row={row}
						fetchData={fetchData}
						currentPage={currentPage}
						perPage={perPage}
					/>
				);
			},
			sortable: true,
			width: "150px",
		},
		{
			name: "Action",
			cell: (row: any) => <TableAction id={row.id} />,
			sortable: true,
		},
	];

	const filteredItems = data?.filter((item: any) =>
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
	const subHeaderComponentMemo = useMemo(() => {
		return (
			<>
				<div className="field mt-1 d-flex">
					{/* Date Range */}
					<FormGroup className="me-3">
						<Label>Date:</Label>
						<DatePicker onChange={handleDateFilterChange} format="yyyy-MM-dd" />
					</FormGroup>

					{/* Dropdown for Chapters */}
					<FormGroup className="me-3">
						<Input
							type="select"
							value={selectedChapter}
							onChange={handleChapterChange}>
							<option value="">All Chapters</option>
							{chapters.map((chapter: any) => (
								<option key={chapter.id} value={chapter.chapter_name}>
									{chapter.chapter_name}
								</option>
							))}
						</Input>
					</FormGroup>
				</div>

				{/* Search Input */}
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
			</>
		);
	}, [filterText, dateRange, selectedChapter, chapters]);

	useEffect(() => {
		fetchData(currentPage, perPage, selectedChapter, dateRange);
	}, [token, searchTerm, selectedChapter, dateRange]);
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

export default Index;

