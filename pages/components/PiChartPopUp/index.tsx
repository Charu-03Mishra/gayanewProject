import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "reactstrap";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PiChart = ({
	open,
	setopen,
	selectedChapter,
}: {
	open: boolean;
	setopen: React.Dispatch<React.SetStateAction<boolean>>;
	selectedChapter: string;
}) => {
	const token = localStorage.getItem("signIn");

	const [chartData, setChartData] = useState({ series: [], options: {} });

	// Fetch chapters data for dropdown
	useEffect(() => {
		const fetchChapters = async () => {
			if (typeof window !== "undefined" && window.localStorage) {
				const config = {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				};
				
			}
		};
		fetchChapters();
	}, []);

	// Fetch expenses data for the chart
	useEffect(() => {
		const fetchExpenses = async () => {
			try {
				const response = await axios.get(
					`/api/per-chapter-expense?chapter_name=${selectedChapter}`
				);
				const expenses = response.data;
				console.log(response.data);

				setChartData({
					series: expenses.map((expense: any) => expense.total_expense),
					options: {
						chart: { width: 380, type: "pie" },
						labels: expenses.map((expense: any) => expense.expense_head),
						legend: { position: "bottom" },
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
					},
				});
			} catch (error) {
				console.error("Error fetching expenses:", error);
			}
		};

		fetchExpenses();
	}, [selectedChapter]);

	return open ? (
		<div
			style={{
				position: "absolute",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)",
				padding: "20px",
				background: "white",
				borderRadius: "8px",
				boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
				width: "450px",
				height: "450px",
			}}>
			<button
				onClick={() => setopen(false)}
				style={{ float: "right", cursor: "pointer" }}>
				✖
			</button>
			<h3>{selectedChapter}</h3>
			<Chart
				options={chartData.options}
				series={chartData.series}
				type="pie"
				width="100%"
			/>
		</div>
	) : null;
};

export default PiChart;
