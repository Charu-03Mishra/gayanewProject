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

const TableAction = ({ row }: any) => {
	const generatePDF = async () => {
		const pdfElement = `
      <!DOCTYPE html>
      <html lang="en">
      <body>
        <div class="page">
          <div class="invoice-box">
            <table>
              <tr class="aligncenter">
                <td>
                  <table>
                    <tr class="center">
                      <td>
                        <h2 class="bg-bni-red pd-2">TAX INVOICE</h2>
                      </td>
                    </tr>
                  </table>
                  <table class="table">
                    <tr class="top">
                      <td colspan="2">
                        <table>
                          <tr>
                            <td class="font-size-10">
                                Gaya Business Service
                                <br />
                                THE FINANCIAL SUPERMARKET TOWER,
                                <br />
                                3RD FLR,
                                <br />
                                ABOVE BANK OF BARODA,
                                <br />
                                SALABATPURA, RING ROAD,
                                <br />
                                SURAT - 395007
                                <br />
                                +91 99786 05090
                                <br />
                                Email: bnigbs@gmail.com
                                <br />
                                GST Reg. No.: 24AATFG6531H1Z7
                            </td>
                            <td class="title">
                              <div class="no-margin no-padding">
                                <img
                                  class="no-margin no-padding"
                                  src="/assets/images/logo/bni_surat_logo.png"
                                  alt="gaya"
                                  title="gaya"
                                  width="100"
                                />
                              </div>
                              <div class="mt-1 no-padding alignright font-size-20">
                                <p class="no-margin pb-1">
                                  <strong>Invoice Number</strong>
                                  <br />
                                  ${row?.invoice_no}
                                </p>
                                <p class="no-margin">
                                  <strong>Invoice Date</strong>
                                  <br />
                                  ${moment(row?.start_payment_date).format(
																		"LL"
																	)}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr class="information">
                      <td colspan="2">
                        <table>
                          <tr>
                            <td class="font-size-10">
                              To,
                              <br />
                              ${row?.member_name}
                              <br />
                              ${row?.memberGST}
                              <br />
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  <table class="table table-bordered" style="width: 100%;" cellPadding="0" cellSpacing="0">
                    <tr class="heading">
                      <td class="br-white">Particulars</td>
                      <td class="br-white">SAC</td>
                      <td class="text-right">Amount (Rs)</td>
                    </tr>
                    <tr class="item">
                    <td>Visitor Meeting Fees For ${moment(
											row.start_payment_date
										).format("MMM-YY")}</td>
                      <td>998312</td>
                      <td class="text-right">Rs. ${row?.amount}</td>
                    </tr>
                    ${
											Number(row?.discount)
												? `
                      <tr class="item">
                        <td>Discount</td>
                        <td>998312</td>
                        <td class="text-right">Rs. -${Number(
													row?.discount
												)?.toFixed(4)}</td>
                      </tr>
                    `
												: ""
										}
                    <tr class="item text-right">
                      <td colspan="3">&nbsp;</td>
                    </tr>
                    <tr class="item">
                      <td colspan="2" class="text-end">CGST @ 9%</td>
                      <td>Rs. ${row?.cgst}</td>
                    </tr>
                    <tr class="item">
                      <td colspan="2" class="text-end">SGST @ 9%</td>
                      <td>Rs. ${row?.sgst}</td>
                    </tr>
                    <tr class="total">
                      <td colspan="2" class="text-end"><strong>Sub Total</strong></td>
                      <td><strong>Rs. ${row?.amount}</strong></td>
                    </tr>
                    <tr class="total">
                      <td colspan="2" class="text-end"><strong>Total Amount</strong></td>
                      <td><strong>Rs. ${row?.total_amount}</strong></td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table class="mb-1" style="width: 100%;" cellPadding="0" cellSpacing="0">
              <tr>
                <td class="text-right">Payment Received</td>
              </tr>
            </table>
            <table class="mb-2" style="width: 100%;" cellPadding="0" cellSpacing="0">
              <tr>
                <td class="text-center">Thank you for your business. We look forward to helping you grow yours!</td>
              </tr>
            </table>
            <table style="width: 100%;" cellPadding="0" cellSpacing="0">
              <tr>
                <td class="font-size-xs">PAN No : AATFG6531H</td>
              </tr>
              <tr>
                <td class="font-size-xs">PLACE OF SUPPLY: GUJARAT (24)</td>
              </tr>
            </table>
            <table class="table" style="width: 100%;" cellPadding="0" cellSpacing="0">
                <tr>
                  <td class="text-left font-size-xs"><strong>Notes:</strong></td>
                  <td class="text-left font-size-xs">All Meeting Fees are non-refundable and non-transferable.<br /></td>
                </tr>
              </table>
            <table class="mt-2 fix_row" style="width: 100%;" cellPadding="0" cellSpacing="0">
              <tr>
                <td class="text-center">This is a computer generated Invoice, hence no signature necessary</td>
              </tr>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

		const element = document.createElement("div");
		element.innerHTML = pdfElement;

		// document.body.appendChild(element);

		const pdf = new jsPDF({
			orientation: "p",
			unit: "pt",
			format: "a4",
		});

		pdf.html(element, {
			callback: (doc) => {
				const finalPageCount = doc.getNumberOfPages();
				for (let i = 1; i <= finalPageCount; i++) {
					doc.setPage(i);
					const footerTextLeft = `Copyright © ${new Date().getFullYear()} Gaya Business Service, All Rights Reserved`;
					const footerTextRight = `Page ${i}`;
					doc.setFontSize(10);
					doc.text(
						footerTextLeft,
						20, // Left margin for footer text
						doc.internal.pageSize.getHeight() - 10
					);
					doc.text(
						footerTextRight,
						doc.internal.pageSize.getWidth() -
							20 -
							doc.getTextWidth(footerTextRight), // Right align for footer text
						doc.internal.pageSize.getHeight() - 10
					);
				}

				doc.save(row.invoice_no);
			},
			margin: [40, 20, 0, 20],
			autoPaging: "text",
			x: 0,
			y: 0,
			width: 550,
			windowWidth: 600,
		});
	};

	return (
		<ul className="action simple-list flex-row">
			{row.status === "captured" ? (
				<li className="edit" onClick={generatePDF}>
					<a href="#">
						<i className="fa-regular fa-file-pdf fs-5"></i>
					</a>
				</li>
			) : (
				""
			)}
		</ul>
	);
};

const VisitorPayment = () => {
	const token = localStorage.getItem("signIn");
	const [filterText, setFilterText] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [dateFilterApplied, setDateFilterApplied] = useState(false);
	const [dateRange, setDateRange] = useState<ValueType | any>([]);
	const [data, setData] = useState([]);
	const [ltData, setLtData] = useState<any>({});
	const [chaptersData, setselectChapter] = useState<any>([]);
	const [selectchaptersData, setSelectchaptersData] = useState<any>("");
	const urlParams = new URLSearchParams(window.location.search);
	const role = localStorage.getItem("role");
	const [perPage, setPerPage] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [TotalVisitorsToday, setTotalVisitorsToday] = useState<number>(0);
	const [ThisMonth, setThisMonth] = useState<number>(0);

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
			name: "Invoice No",
			selector: (row: any) => row.invoice_no,
			sortable: true,
			width: "150px",
		},
		{
			name: "Chapter Name",
			selector: (row: any) => row.chapter_name,
			sortable: true,
			width: "150px",
		},
		{
			name: "Visitor Name",
			selector: (row: any) => row.member_name,
			sortable: true,
			width: "150px",
		},
		{
			name: "Transaction Date",
			selector: (row: any) => moment(row.createdAt).format("LL"),
			sortable: true,
			width: "150px",
		},
		{
			name: "Date",
			selector: (row: any) =>
				row.start_payment_date
					? moment(row.start_payment_date).format("LL")
					: "",
			sortable: true,
			width: "170px",
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
		{
			name: "Membership Status ",
			selector: (row: any) => row.membership_status,
			sortable: true,
			width: "150px",
		},
		{
			name: "Action",
			cell: (row: any) => <TableAction row={row} />,
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
			payment_type: "visitor fees",
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
			saveAs(blob, "Visitor Fees Payment Report.csv");
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
	const handleChapterChange = (e: any) => {
		console.log(e.target.value);

		setSelectchaptersData(e.target.value);
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
				<div className="filter-datas">
					<div className="date-data">
						{/* Date Range */}
						<FormGroup className="form-data">
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
				{/* <div className="field mt-1">
					<FormGroup className="me-3">
						<Label>Date Range:</Label>
						<DateRangePicker
							value={dateRange}
							onChange={handleDateFilter}
							format="yyyy-MM-dd"
						/>
					</FormGroup>
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
				{/* <div className="dataTables_filter d-flex align-items-center">
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
				</div> */}
				<div className="showActive">
					<div className="TotalActive">
						<span>Total Active Members: </span>
						<span style={{ color: "green" }}>{TotalVisitorsToday}</span>{" "}
					</div>

					<div className="TotalActive">
						<span>Total Drop Members:</span>{" "}
						<span style={{ color: "red" }}>{ThisMonth}</span>
					</div>
				</div>
				
			</>
		);
	}, [
		filterText,
		dateRange,
		chaptersData,
		selectchaptersData,
		TotalVisitorsToday,
		ThisMonth,
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
				const response = await axios.get("/api/visitor-payments", config);
				const totalVisitorsToday = response.data.totalVisitorsToday;
				const thisMonth = response.data.totalVisitorsThisMonth;

				setTotalVisitorsToday(totalVisitorsToday);
				setThisMonth(thisMonth);
			} catch (error) {
				console.error("Error fetching chapters data:", error);
			}
		}
	};
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
				payment_type: "visitor fees",
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
									onClick={handleDownloadCSV}
									className="me-2">
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
export default VisitorPayment;

