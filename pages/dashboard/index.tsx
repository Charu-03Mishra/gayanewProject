"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Layout from "../Layout/Layout";
import {
	Card,
	CardBody,
	CardHeader,
	Col,
	Container,
	Row,
	Input,
} from "reactstrap";
import Image from "../components/media";
import CommonCardHeader from "../components/CommonCardHeader/CommonCardHeader";
import DataTable from "react-data-table-component";
import H4 from "../components/headings/H4Element";
import axios from "axios";
import dynamic from "next/dynamic";
import localStorage from "@/utils/localStorage";
import H5 from "../components/headings/H5Element";
import PerUserExpenseTable from "../components/PerUserExpenseTable";
import ExpensePieChart from "../components/ExpensePieChart";
import Link from "next/link";
import { useRouter } from "next/router";
import { log } from "node:console";
import PiChart from "../components/PiChartPopUp";

const areaChartOptions = {
	chart: {
		type: "area",
		height: 100,
		offsetY: -20,
		offsetX: 0,
		toolbar: {
			show: false,
		},
	},
	stroke: {
		width: 2,
		curve: "smooth",
	},
	grid: {
		show: false,
		borderColor: "var(--light)",
		padding: {
			top: 6,
			right: 0,
			bottom: -5,
			left: 0,
		},
	},
	fill: {
		type: "gradient",
		gradient: {
			shadeIntensity: 1,
			opacityFrom: 0,
			opacityTo: 0,
			stops: [0, 0, 0],
		},
	},
	dataLabels: {
		enabled: false,
	},
	colors: ["var(--theme-deafult)"],
	xaxis: {
		labels: {
			show: false,
		},
		tooltip: {
			enabled: false,
		},
		axisBorder: {
			show: false,
		},
		axisTicks: {
			show: false,
		},
	},
	yaxis: {
		opposite: false,
		min: 29,
		max: 35,
		logBase: 100,
		tickAmount: 4,
		forceNiceScale: false,
		floating: false,
		decimalsInFloat: undefined,
		labels: {
			show: false,
			offsetX: -12,
			offsetY: -15,
			rotate: 0,
		},
	},
	legend: {
		horizontalAlign: "left",
	},
};

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const Index = () => {
	const token = localStorage.getItem("signIn");
	const [chaptersData, setChaptersData] = useState<any>([]);
	const [prevCurrentData, setPrevCurrentData] = useState<any>([]);
	const [chaptersFilter, setChaptersFilter] = useState<any>("all");
	const [visitorsData, setVisitorsData] = useState<any>([]);
	const [kittyData, setKittyData] = useState<any>([]);
	const [topSellData, setTopSellData] = useState<any[]>([]);
	const [paymentData, setPaymentData] = useState([]);
	const [open, setOpen] = useState<boolean>(false);
	const [selectedChapter, setSelectedChapter] = useState<any>("");

	const [pieChartData, setPieChartData] = useState<any>({
		paidAdvance: 0,
		paidCurrent: 0,
		pendingCount: 0,
	});

	const currentDate = new Date();
	const lastFourMonths: any = [];

	const router = useRouter();
	const chaptersFilterRef = useRef(chaptersFilter);
	const pieChart: any = {
		chart: {
			width: 380,
			type: "pie",
			events: {
				dataPointSelection: (event: any, chartContext: any, config: any) => {
					const { dataPointIndex } = config;
					const dataValue = pieChart.labels[dataPointIndex];

					handlePieChartRedirect(dataValue);
				},
			},
		},
		labels: ["Paid advance", "Paid current", "Pending"],
		series: [44, 50, 13],
		responsive: [
			{
				breakpoint: 480,
				options: {
					chart: {
						width: 270,
					},
					legend: {
						show: false,
					},
				},
			},
		],
		colors: ["#7A70BA", "#48A3D7", "#51bb25"],
	};

	useEffect(() => {
		chaptersFilterRef.current = chaptersFilter;
	}, [chaptersFilter]);
	const handlePieChartRedirect = useCallback(
		(dataValue: string) => {
			const currentChaptersFilter = chaptersFilterRef.current;
			if (dataValue?.toLowerCase() == "pending")
				router.push(
					`/comman_pages/Reports/pending_payment?chapter_id=${currentChaptersFilter}`
				);
			else
				router.push(
					`/comman_pages/Reports/meeting_fees_payment?chapter_id=${currentChaptersFilter}&paid_for=${
						dataValue?.toLowerCase().includes("current") ? "current" : "advance"
					}`
				);
		},
		[chaptersFilter]
	);
	const handleCardClick = (title: any) => {
		// Get today's date in the format YYYY-MM-DD
		const today = new Date().toISOString().split("T")[0];
		if (title == "outstanding meeting fees") {
			router.push("/comman_pages/Reports/pending_payment");
		} else if (title === "Total user paid meeting fees today") {
			router.push(
				`/comman_pages/Reports/meeting_fees_payment?startDate=${today}&endDate=${today}`
			);
		} else {
			console.warn("No matching route for title:", title);
		}

		// else if (title == "Total user paid meeting fees today") {
		//   router.push("/comman_pages/Reports/meeting_fees_payment");
		// } else {

		// }
	};

	// Generate the names of the last four months
	for (let i = 0; i < 4; i++) {
		lastFourMonths.unshift(
			currentDate.toLocaleString("default", { month: "long" })
		);
		currentDate.setMonth(currentDate.getMonth() - 1);
	}
	const columns: any = [
		{
			name: "Chapter Name",
			selector: (row: any) => row.chapter_name,
			sortable: true,
		},
		...lastFourMonths.map((monthName: string) => ({
			name: monthName,
			selector: (row: any) => {
				if (Array.isArray(paymentData)) {
					const payment: any = paymentData.find(
						(payment: any) => payment.chapter_id === row.id
					);
					if (payment) {
						switch (monthName) {
							case lastFourMonths[0]:
								return payment.month1.toFixed(2);
							case lastFourMonths[1]:
								return payment.month2.toFixed(2);
							case lastFourMonths[2]:
								return payment.month3.toFixed(2);
							case lastFourMonths[3]:
								return payment.month4.toFixed(2);
							default:
								return "0.00";
						}
					}
				}
				return "0.00";
			},
			sortable: true,
		})),
	];

	const chapColumns: any = [
		{
			name: "Chapter Name",
			selector: (row: any) => (
				<Link
					href={`/comman_pages/Reports/visitor_payment?chapter_id=${row.id}`}
					style={{ color: "blue" }}>
					{row.chapter_name}
				</Link>
			),
			sortable: true,
			sortFunction: (a: any, b: any) =>
				a.chapter_name.localeCompare(b.chapter_name),
		},
		{
			name: "Total Visitor",
			selector: (row: any) => {
				if (Array.isArray(visitorsData)) {
					const visitor = visitorsData?.filter(
						(visitor: any) => visitor.chapter === row.id
					);
					if (visitor.length > 0) {
						return visitor.length;
					}
				}
				return "";
			},
			sortable: true,
		},
	];
	const prevChapters = Object.keys(prevCurrentData?.previous || {});
	const prevMonths = Object.keys(
		prevCurrentData?.previous?.[prevChapters[0]] || {}
	);

	const currentChapters = Object.keys(prevCurrentData?.current || {});
	const currentMonths = Object.keys(
		prevCurrentData?.current?.[currentChapters[0]] || {}
	);

	const prevPaymentsData = prevChapters.map((chapter) => ({
		chapterName: chapter,
		...prevCurrentData.previous[chapter],
	}));

	const currentPaymentsData = currentChapters.map((chapter) => ({
		chapterName: chapter,
		...prevCurrentData.current[chapter],
	}));

	// Add a "Total" column for row-wise totals
	const prevPaymentsWithRowTotals = prevPaymentsData.map((row) => ({
		...row,
		Total: prevMonths.reduce(
			(sum, month) => sum + parseInt(row[month] || "0"),
			0
		),
	}));

	// Calculate column totals
	const prevPaymentsWithColTotals = prevMonths.reduce(
		(totals, month) => ({
			...totals,
			[month]: prevPaymentsWithRowTotals.reduce(
				(sum, row) => sum + parseInt(row[month] || "0"),
				0
			),
		}),
		{
			chapterName: "Total",
			Total: prevPaymentsWithRowTotals.reduce((sum, row) => sum + row.Total, 0),
		}
	);

	// Add the "Total" row at the bottom
	const prevPaymentsfinalData = [
		...prevPaymentsWithRowTotals,
		prevPaymentsWithColTotals,
	];

	const prevPaymentsCol = [
		{
			name: "Chapter Name",
			selector: (row: any) => (
				<Link
					href={`/comman_pages/Reports/previous_current_pending_payment?chapter_id=${
						row.chapterName.split("#")[0]
					}`}
					style={{ color: "blue" }}>
					{row.chapterName.split("#")[1]}
				</Link>
			),
			sortable: true,
			sortFunction: (a: any, b: any) =>
				a.chapter_name.localeCompare(b.chapter_name),
			width: "150px",
		},
		...prevMonths.map((month) => ({
			name: month,
			selector: (row: any) => {
				return row[month];
			},
			sortable: true,
			width: "150px",
		})),
		{
			name: "Total", // Add the "Total" column
			selector: (row: any) => row.Total,
			sortable: true,
		},
	];

	// Add a "Total" column for row-wise totals
	const currentPaymentsWithRowTotals = currentPaymentsData.map((row) => ({
		...row,
		Total: currentMonths.reduce(
			(sum, month) => sum + parseInt(row[month] || "0"),
			0
		),
	}));

	// Calculate column totals
	const currentPaymentsWithColTotals = currentMonths.reduce(
		(totals, month) => ({
			...totals,
			[month]: currentPaymentsWithRowTotals.reduce(
				(sum, row) => sum + parseInt(row[month] || "0"),
				0
			),
		}),
		{
			chapterName: "Total",
			Total: currentPaymentsWithRowTotals.reduce(
				(sum, row) => sum + row.Total,
				0
			),
		}
	);

	// Add the "Total" row at the bottom
	const currentPaymentsfinalData = [
		...currentPaymentsWithRowTotals,
		currentPaymentsWithColTotals,
	];

	const currentPaymentsCol = [
		{
			name: "Chapter Name",
			selector: (row: any) => (
				<Link
					href={`/comman_pages/Reports/previous_current_pending_payment?chapter_id=${
						row.chapterName.split("#")[0]
					}`}
					style={{ color: "blue" }}>
					{row.chapterName.split("#")[1]}
				</Link>
			),
			sortable: true,
			sortFunction: (a: any, b: any) =>
				a.chapter_name.localeCompare(b.chapter_name),
			width: "150px",
		},
		...currentMonths.map((month) => ({
			name: month,
			selector: (row: any) => row[month],
			sortable: true,
			width: "150px",
		})),
		{
			name: "Total", // Add the "Total" column
			selector: (row: any) => row.Total,
			sortable: true,
		},
	];

	const kittyColumns: any = [
		{
			name: "Chapter Name",
			selector: (row: any) => (
				<Link
					href={`/kittybalance?chapter_id=${row.chapter_id}`}
					style={{ color: "blue" }}>
					{row.chapter_name}
				</Link>
			),
			sortable: true,
			sortFunction: (a: any, b: any) => {
				return a.chapter_name.localeCompare(b.chapter_name);
			},
		},

		{
			name: "Opening Balance",
			selector: (row: any) => row.opening_balance,
			sortable: true,
		},
		{
			name: "Received",
			selector: (row: any) => row.received_total,
			sortable: true,
		},
		{
			name: "Expense",
			selector: (row: any) => row.chapter_fund_total,
			sortable: true,
		},
		{
			name: "Kitty Balance",
			selector: (row: any) =>
				row.opening_balance + row.received_total - row.chapter_fund_total,
			sortable: true,
		},
		{
			name: "Outstanding",
			selector: (row: any) => row.april,
			sortable: true,
		},
		{
			name: "Management Fees",
			selector: (row: any) => row.management_charges_total,
			sortable: true,
		},
	];

	const chapterFetchData = async () => {
		if (typeof window !== "undefined" && window.localStorage) {
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			try {
				const response = await axios.get("/api/chapters", config);
				setChaptersData(response.data.chapters);
			} catch (error) {
				console.error("Error fetching chapters data:", error);
			}
		}
	};

	const fetchPrevCurrentPendingPayments = async () => {
		if (typeof window !== "undefined" && window.localStorage) {
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			try {
				const response = await axios.get(
					"/api/previous-current-pending-payments",
					config
				);
				setPrevCurrentData(response.data.data);
			} catch (error) {
				console.error("Error fetching chapters data:", error);
			}
		}
	};

	const getKittyData = async () => {
		if (typeof window !== "undefined" && window.localStorage) {
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			try {
				const response = await axios.get("/api/kitty-balance", config);
				setKittyData(response.data);
			} catch (error) {
				console.error("Error fetching kitty data:", error);
			}
		}
	};

	const visitorData: any = async () => {
		if (typeof window !== "undefined" && window.localStorage) {
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			try {
				const visitorsResponse = await axios.get("/api/visitor", config);
				setVisitorsData(visitorsResponse.data);
			} catch (error) {
				console.error("Error fetching visitor data:", error);
			}
		}
	};

	useEffect(() => {
		chapterFetchData();
		visitorData();
		getKittyData();
		fetchPrevCurrentPendingPayments();
	}, [token]);

	const fetchPieChartData = async () => {
		if (typeof window !== "undefined" && window.localStorage) {
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			try {
				const response = await axios.get(
					`/api/dashboard-pie-chart?chapter_id=${chaptersFilter}`,
					config
				);
				setPieChartData({
					paidAdvance: response?.data.paidAdvance,
					paidCurrent: response?.data.paidCurrent,
					pendingCount: response?.data.pendingCount,
				});
			} catch (error) {
				console.error("Error fetching dashboard-pie-chart data:", error);
			}
		}
	};
	useEffect(() => {
		fetchPieChartData();
	}, [chaptersFilter]);

	useEffect(() => {
		const fetchPaymentData = async () => {
			if (typeof window !== "undefined" && window.localStorage) {
				const config = {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				};

				try {
					const response = await axios.get("/api/payment-filter", config);
					setPaymentData(response.data);
				} catch (error) {
					console.error("Error fetching payment data:", error);
				}
			}
		};

		fetchPaymentData();
	}, [token, chaptersData]);

	useEffect(() => {
		const fetchData = async () => {
			if (typeof window !== "undefined" && window.localStorage) {
				const config = {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				};

				try {
					const response = await axios.get("/api/renewal-today", config);
					console.log(response.data, "renewal-today");
					const paidMeetingFeesResponse = await axios.get(
						"/api/paid-meeting-fees-today",
						config
					);
					const membershipRenewResponse = await axios.get(
						"/api/membership-renewal",
						config
					);
					const currentMonthCount =
						membershipRenewResponse.data.current_month || 0;
					const nextMonthCount = membershipRenewResponse.data.next_month || 0;
					const nextNextMonthCount =
						membershipRenewResponse.data.next_next_month || 0;

					const membershipRenewalCount =
						parseInt(currentMonthCount) +
						parseInt(nextMonthCount) +
						parseInt(nextNextMonthCount);
					const highestChapterResponse = await axios.get(
						"/api/highest-chapter",
						config
					);

					const lowestChapterResponse = await axios.get(
						"/api/lowest-chapter",
						config
					);

					const outstandingMeetingFees = await axios.get(
						"/api/outstanding-meeting-fees",
						config
					);
					const visitorFees = await axios.get("/api/visitor-payments", config);
					console.log(
						visitorFees?.data?.totalVisitorsThisMonth,
						"visitor patments"
					);

					setTopSellData([
						{
							class: "total-sells",
							title: "Total renewal this month",
							// image: "rupees.jpg",
							image: "shopping1.png",
							count: response.data?.totalRenewalThisMonth,
							icon: "fa-arrow-up",
							color: "success",
							percentage: "+ 20.08%",
							detail: "Compared to Jan 2024",
							chartId: "admissionRatio",
							chartData: {
								series: [
									{
										name: "Renewal Today",
										data: [30],
									},
								],
								options: areaChartOptions,
							},
						},
						{
							class: "total-sells-2",
							title: "Total user paid meeting fees today",
							image: "shopping1.png",
							count: paidMeetingFeesResponse.data?.totalUsers,
							icon: "fa-arrow-down",
							color: "danger",
							percentage: "-   10.02%",
							detail: "Compared to Aug 2024",
							chartId: "order-value",
							chartData: {
								series: [
									{
										name: "Renewal Today",
										data: [response.data.length],
									},
								],
								options: areaChartOptions,
							},
						},
						{
							class: "total-sells",
							title: "Chapter least no. of meeting fees pending",
							image: "coin1.png",
							count: lowestChapterResponse.data
								?.map((value: any) => value.chapter_name)
								.join(", "),
							icon: "fa-arrow-up",
							color: "success",
							percentage: "+ 20.08%",
							chartId: "admissionRatio",
							chartData: {
								series: [
									{
										name: "Renewal Today",
										data: [response.data.length],
									},
								],
								options: areaChartOptions,
							},
						},
						{
							class: "total-sells-2",
							title: "Chapter with highest no. of meeting fees pending",
							image: "shopping1.png",
							count: highestChapterResponse.data
								?.map((value: any) => value.chapter_name)
								.join(", "),
							icon: "fa-arrow-down",
							color: "danger",
							percentage: "-   10.02%",
							detail: "Compared to Aug 2024",
							chartId: "order-value",
							chartData: {
								series: [
									{
										name: "Renewal Today",
										data: [response.data.length],
									},
								],
								options: areaChartOptions,
							},
						},
						{
							class: "total-sells-2",
							title: "pending membership renewal",
							image: "shopping1.png",
							count: membershipRenewalCount,
							icon: "fa-arrow-down",
							color: "danger",
							percentage: "-10.02%",
							detail: "Compared to Aug 2024",
							chartId: "order-value",
							chartData: {
								series: [
									{
										name: "Renewal Today",
										data: [response.data.length],
									},
								],
								options: areaChartOptions,
							},
						},
						{
							class: "total-sells-2",
							title: "outstanding meeting fees",
							image: "shopping1.png",
							count: outstandingMeetingFees.data[0]?.total_due_amount,
							icon: "fa-arrow-down",
							color: "danger",
							percentage: "-10.02%",
							detail: "Compared to Aug 2024",
							chartId: "order-value",
							chartData: {
								series: [
									{
										name: "Renewal Today",
										data: [response.data.length],
									},
								],
								options: areaChartOptions,
							},
						},
						{
							class: "total-sells-2",
							title: "Total Visitors This Month",
							image: "shopping1.png",
							icon: "fa-arrow-down",
							count: visitorFees?.data?.totalVisitorsThisMonth,
							color: "danger",
							percentage: "-10.02%",
							detail: "Compared to Aug 2024",
							chartId: "order-value",
							chartData: {
								series: [
									{
										name: "Renewal Today",
										data: [response.data.length],
									},
								],
								options: areaChartOptions,
							},
						},
					]);
				} catch (error) {
					console.error("Error fetching renewal-today data:", error);
				}
			}
		};

		fetchData();
	}, [token, chaptersData]);

	return (
		<Layout>
			<div className="page-body">
				<Container fluid className="dashboard-3">
					<Row>
						{topSellData.map((data, i) => (
							<Col xl="3" sm="8" key={i}>
								<Card
									onClick={() => handleCardClick(data.title)}
									style={{ cursor: "pointer" }}>
									<CommonCardHeader
										headClass="card-no-border pb-0"
										mainTitle={true}
										subClass="daily-revenue-card"
										title={data.title}
									/>
									<CardBody className={`pb-0 ${data.class}`}>
										<div className="d-flex align-items-center gap-3">
											<div className="flex-shrink-0">
												<Image
													className="rounded-circle"
													src={`/assets/images/dashboard-3/icon/${data.image}`}
													alt="icon"
												/>
											</div>
											<div className="flex-grow-1">
												<div className="d-flex align-items-center gap-2">
													<H5>{data.count}</H5>
												</div>
											</div>
										</div>
										{/* <Chart
                      id={data.chartId}
                      options={data.chartData.options}
                      series={data.chartData.series}
                      type="area"
                      height={100}
                    /> */}
									</CardBody>
								</Card>
							</Col>
						))}
					</Row>
					{/* <Row>
          <Col xl="12" sm="12">
              <Card>
                <CardHeader className="pb-0 card-no-border">
                  <H4>Previous</H4>
                </CardHeader>
                <CardBody>
                  <div className="table-responsive">
                    <DataTable
                      pagination
                      subHeader
                      highlightOnHover
                      striped
                      persistTableHead
                      columns={prevPaymentsCol}
                      data={prevPaymentsfinalData}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl="12" sm="12">
              <Card>
                <CardHeader className="pb-0 card-no-border">
                  <H4>Current</H4>
                </CardHeader>
                <CardBody>
                <div className="table-responsive">
                    <DataTable
                      pagination
                      subHeader
                      highlightOnHover
                      striped
                      persistTableHead
                      columns={currentPaymentsCol}
                      data={currentPaymentsfinalData}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row> */}
					<Row>
						<Col xl="6" sm="12">
							<Card>
								<CardBody className="revenue-category">
									<Input
										type="select"
										name="chapters"
										style={{ fontSize: "12px" }}
										onChange={(e: any) => setChaptersFilter(e.target.value)}>
										<option value="all">All</option>
										{Array.isArray(chaptersData) &&
											chaptersData.map((option: any, index: number) => (
												<option key={index} value={option.id}>
													{option.chapter_name}
												</option>
											))}
									</Input>

									<Chart
										options={pieChart}
										series={[
											pieChartData.paidAdvance,
											pieChartData.paidCurrent,
											pieChartData.pendingCount,
										]}
										type="pie"
										height={300}
									/>
								</CardBody>
							</Card>
						</Col>
						<Col xl="6" sm="12">
							'
							<Card>
								<CardHeader className="pb-0 card-no-border">
									<H4>Expense head chapter wise (6 months)</H4>
								</CardHeader>
								<CardBody>
									<ExpensePieChart />
								</CardBody>
							</Card>
						</Col>
					</Row>
					<Row>
						<Col xl="6" sm="12">
							<Card>
								<CardHeader className="pb-0 card-no-border">
									<H4>Visitors report this month</H4>
								</CardHeader>
								<CardBody>
									<div className="table-responsive">
										<DataTable
											pagination
											subHeader
											highlightOnHover
											striped
											persistTableHead
											columns={chapColumns}
											data={chaptersData || []}
										/>
									</div>
								</CardBody>
							</Card>
						</Col>
						<Col xl="6" sm="12">
							<Card>
								<CardHeader className="pb-0 card-no-border">
									<H4>Per user expense chapter wise ( 6 months )</H4>
								</CardHeader>
								<CardBody>
									<div className="table-responsive">
										<PerUserExpenseTable
											open={open}
											setopen={setOpen}
											setSelectedChapter={setSelectedChapter}
										/>
									</div>
								</CardBody>
							</Card>
						</Col>
					</Row>
					<Row>
						<Col xl="12" sm="12">
							<Card>
								<CardHeader className="pb-0 card-no-border">
									<H4>Kitty Balance</H4>
								</CardHeader>
								<CardBody>
									<div className="table-responsive">
										<DataTable
											pagination
											subHeader
											highlightOnHover
											striped
											persistTableHead
											columns={kittyColumns}
											data={kittyData}
										/>
									</div>
								</CardBody>
							</Card>
						</Col>
					</Row>
				</Container>
				<PiChart open={open} setopen={setOpen} selectedChapter={selectedChapter} />
			</div>
			{/* </ProtectedRoute> */}
		</Layout>
	);
};

export default Index;

