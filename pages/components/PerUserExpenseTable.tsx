import Link from "next/link";
import { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";

export default function PerUserExpenseTable() {
	interface Expense {
		id: number;
		chapter_name: string;
		expense_per_user: number;
	}
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [loading, setLoading] = useState(true);

	// Define the columns for DataTable
	const expenseColumns = [
		{
			name: "Chapter Name",
			selector: (row: Expense) => (
				<Link
					href={`/comman_pages/expense/list_expense?chapter_id=${row.id}`}
					style={{ color: "blue" }}>
					{row.chapter_name}
				</Link>
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
		<DataTable
			pagination
			subHeader
			highlightOnHover
			striped
			persistTableHead
			columns={expenseColumns}
			data={expenses || []}
		/>
	);
}

