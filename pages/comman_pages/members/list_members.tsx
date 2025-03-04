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
import { log } from "console";

const membershipStatusOptions = [
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
	// useEffect(() => {
	// 	const fetchChapters = async () => {
	// 		const config = {
	// 			headers: {
	// 				Authorization: `Bearer ${token}`,
	// 			},
	// 		};
	// 		try {
	// 			const response = await axios.get(`/api/chapters`,config);
	// 			setChapters(response?.data?.chapters);
	// 			setFilteredChapters(response.data); // Initially display all chapters
	// 		} catch (error) {
	// 			console.error("Error fetching chapters:", error);
	// 		}
	// 	};

	// 	fetchChapters();
	// }, []);

	useEffect(() => {
		const fetchChapterlist = async () => {
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};
			try {
				const response = await axios.get(`/api/chapterlist`, config);
				setChapters(response?.data?.chapters);
				setFilteredChapters(response.data);
			} catch (error) {
				console.error("Error fetching chapters:", error);
			}
		};

		fetchChapterlist();
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
	const [active, setactive] = useState<any>("");
	const [drop, setdrop] = useState<any>("");
	const [selectedActive, setSelectedActive] = useState("");
	const [filterText, setFilterText] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [perPage, setPerPage] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalRows, setTotalRows] = useState<number>(0);

	const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const active = e.target.value;
		setSelectedActive(active);
	};

	console.log(selectedActive, "selected active");
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
		console.log(e.target.value);

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
		dateRange: any,
		selectedActive: any
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
			if (selectedActive !== "") {
				url.searchParams.append("membership_status", selectedActive);
			}

			if (dateRange) {
				url.searchParams.append("mf_end_date", dateRange);
			}

			// console.log("Fetching data with date filter:", dateRange);

			try {
				const response = await axios.get(url.toString(), config);
				setData(response.data.members);
				const activeCount: any = response.data.members.filter(
					(row: any) =>
						row.membership_status === "Active" ||
						row.membership_status === "Inactive"
				).length;
				const dropCount: any = response.data.members.filter(
					(row: any) => row.membership_status === "Drop"
				).length;
				setactive(activeCount);
				setdrop(dropCount);
				setTotalRows(response.data.pagination?.totalItems);
			} catch (error) {
				console.error("Error fetching chapters data:", error);
			}
		}
	};

	const handlePageChange = (page: any) => {
		fetchData(page, perPage, selectedChapter, dateRange, selectedActive);
		setCurrentPage(page);
	};

	const handleRowsPerPageChange = async (newRowsPerPage: any) => {
		if (!data.length) return;
		fetchData(
			currentPage,
			newRowsPerPage,
			selectedChapter,
			dateRange,
			selectedActive
		);
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
				fetchData(
					currentPage,
					perPage,
					selectedChapter,
					dateRange,
					selectedActive
				);
			}
		} catch (error) {
			console.error("error updating status", error);
		}
	};
	console.log(data);

	// const savedData = localStorage.getItem("membershipData");
	// return savedData ? JSON.parse(savedData) : [];

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
						<Badges pill color={"danger"} className="mr-1">
							Drop
						</Badges>
					</button>
				) : row.membership_status === "Active" ? (
					<button
						style={{ backgroundColor: "unset" }}
						onClick={() => handleStatusChange(index, "Drop")}>
						{/* <i className="fa fa-ban" /> */}
						<Badges pill color={"success"} className="mr-1">
							Active
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
					name="mf_end_date"
					onChange={(e: any) => handleDateChange(row, e, "mf_end_date")}
					value={
						row.mf_end_date && moment(row.mf_end_date).isValid()
							? moment(row.mf_end_date).format("YYYY-MM-DD")
							: moment().format("YYYY-MM-DD") // Default to today's date
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

	const formatDate = (date: any) => moment(date).format("YYYY-MM-DD");

	const filteredItems = data
		// .filter(
		// 	(item: any) =>
		// 		// Filter by membership_status if selectedActive is not empty
		// 		selectedActive === "" || item?.membership_status === selectedActive
		// )
		// .filter(
		// 	(item: any) =>
		// 		dateRange == "" ||
		// 		(item?.mf_end_date && formatDate(item?.mf_end_date) == dateRange)
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
				return false;
			})
		);
	console.log("Filtering for dateRange:", dateRange);
	console.log("chapter", chapters);

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
				<div
					className=""
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						marginTop: "5px",
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
							onChange={handleOnChangeSearch}
							type="search"
							value={filterText}
						/>
						<i
							className="fa fa-search"
							aria-hidden="true"
							onClick={handleSearchClick}></i>
					</div>
				</div>
				<div className="showActive">
					<div>
						<div
							style={{
								marginBottom: "10px",
								fontWeight: "bold",
							}}>
							Total Active Members:{" "}
							<span style={{ color: "green" }}>{active}</span>{" "}
						</div>
					</div>

					<div
						style={{
							marginBottom: "10px",
							fontWeight: "bold",
						}}>
						Total Drop Members: <span style={{ color: "red" }}>{drop}</span>
					</div>
				</div>
				<div className="filter-datas">
					<div>
						<div className="date-data">
							{/* Date Range */}
							<FormGroup className="form-data">
								<Label></Label>
								<DatePicker
									placeholder="Meeting Fees End Date"
									onChange={handleDateFilterChange}
									format="yyyy-MM-dd"
									className="datepicker"
								/>
							</FormGroup>

							{/* Dropdown for Chapters */}
							<FormGroup className="form-data">
								<Input
									className="datepicker"
									type="select"
									value={selectedChapter}
									onChange={handleChapterChange}>
									<option value="">Chapters</option>
									{Array.isArray(chapters) &&
										chapters.map((chapter: any) => (
											<option key={chapter.id} value={chapter.chapter_name}>
												{chapter.chapter_name}
											</option>
										))}
								</Input>
							</FormGroup>
							<FormGroup className="form-data">
								<Input
									className="datepicker"
									type="select"
									value={selectedActive}
									onChange={handleActiveChange}>
									<option value="">Members Ship Status</option>
									{membershipStatusOptions.map((status: any) => (
										<option value={status.value}>{status.label}</option>
									))}
								</Input>
							</FormGroup>
						</div>
					</div>
				</div>

				{/* Search Input */}
			</>
		);
	}, [
		filterText,
		dateRange,
		selectedChapter,
		chapters,
		active,
		drop,
		selectedActive,
	]);

	useEffect(() => {
		fetchData(currentPage, perPage, selectedChapter, dateRange, selectedActive);
	}, [token, searchTerm, selectedChapter, dateRange, selectedActive]);
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

