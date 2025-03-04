import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "reactstrap";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ExpensePieChart = () => {
  const [chaptersData, setChaptersData] = useState([]);
  const [selectedChapter, setChaptersFilter] = useState("all");
  const [chartData, setChartData] = useState({ series: [], options: {} });

  // Fetch chapters data for dropdown
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await axios.get("/api/chapters");
        setChaptersData(response.data);
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    };
    fetchChapters();
  }, []);

  // Fetch expenses data for the chart
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(`/api/per-chapter-expense?chapter_name=${selectedChapter}`);
        const expenses = response.data;

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

  return (
    <div>
      {/* Chapter Dropdown */}
      <Input
        type="select"
        name="chapters"
        style={{ fontSize: "12px", marginBottom: "20px" }}
        onChange={(e: any) => setChaptersFilter(e.target.value)}
      >
        <option value="all">All</option>
        {chaptersData?.map((option: any, index: any) => (
          <option key={index} value={option.chapter_name}>
            {option.chapter_name}
          </option>
        ))}
      </Input>

      {/* Pie Chart */}
      <Chart options={chartData.options} series={chartData.series} type="pie" width="100%" />
    </div>
  );
};

export default ExpensePieChart;
