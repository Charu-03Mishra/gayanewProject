import Link from "next/link";
import { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import PiChart from "./PiChartPopUp";

type PerUserExpenseTableProps = {
	open: boolean;
	setopen: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectedChapter: React.Dispatch<React.SetStateAction<string>>;
};

export default function PerUserExpenseTable({
	open,
	setopen,
	setSelectedChapter,
}: PerUserExpenseTableProps) {
	interface Expense {
		id: number;
		chapter_name: string;
		expense_per_user: number;
	}
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [loading, setLoading] = useState(true);

	const handleClick = (chapterName: string) => {
		setSelectedChapter(chapterName);
		setopen(true);
	};

	// Define the columns for DataTable
	const expenseColumns = [
		{
			name: "Chapter Name",
			selector: (row: Expense) => (
				<span
					style={{ color: "blue", cursor: "pointer" }}
					onClick={() => handleClick(row.chapter_name)}>
					{row.chapter_name}
				</span>
			),
			sortable: true,
			sortFunction: (a: any, b: any) =>
				a.chapter_name.localeCompare(b.chapter_name),
		},
		{
			name: "Expense Per User",
			selector: (row: Expense) => `${row.expense_per_user.toFixed(0)}`,
			sortable: true,
		},
	] as TableColumn<any>[];

	useEffect(() => {
		async function fetchExpenses() {
			try {
				const response = await fetch("/api/per-user-expense");
				const data = await response.json();
				setExpenses(data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching expenses:", error);
				setLoading(false);
			}
		}

		fetchExpenses();
	}, []);

	if (loading) {
		return <p>Loading...</p>;
	}

	return (
		<>
			<DataTable
				pagination
				subHeader
				highlightOnHover
				striped
				persistTableHead
				columns={expenseColumns}
				data={expenses || []}
			/>
		</>
	);
}

