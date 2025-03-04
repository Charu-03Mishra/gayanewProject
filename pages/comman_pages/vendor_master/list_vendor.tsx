import Layout from "@/pages/Layout/Layout";
import localStorage from "@/utils/localStorage";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { Card, CardBody, Col, FormGroup, Input, Label } from "reactstrap";

const CustomToggle = ({ status, row, fetchData }: any) => {
	const [isUpdating, setIsUpdating] = useState(false);
	const [checked, setChecked] = useState(status === "yes");

	const handleToggle = async () => {
		setIsUpdating(true);
		const newStatus = checked ? "no" : "yes";
		try {
			const res = await axios.put(
				`/api/vendor/${row.id}`,
				{ login_access: newStatus },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("signIn")}`,
					},
				}
			);
			if (res.status === 200) {
				toast.success(`Login permission updated successfully!`);
				fetchData();
				setChecked(!checked);
				setIsUpdating(false);
			}
		} catch (error) {
			console.error("Error updating login access:", error);
			setIsUpdating(false);
		}
	};

	return (
		<div>
			<FormGroup switch>
				<Input
					type="switch"
					checked={checked}
					onChange={handleToggle}
					label={checked ? "Yes" : "No"}
					defaultChecked
				/>
				<Label check style={{ marginLeft: "0.5rem" }}>
					{checked ? "Yes" : "No"}
				</Label>
			</FormGroup>
		</div>
	);
};

const Index = () => {
	const fetchData = async () => {
		if (typeof window !== "undefined" && window.localStorage) {
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			try {
				const response = await axios.get("/api/vendor", config);
				setData(response.data);
			} catch (error) {
				console.error("Error fetching vendor data:", error);
			}
		}
	};
	const columns: any = [
		{
			name: "Vendor Name",
			selector: (row: any) => `${row.vendor_name}`,
			sortable: true,
		},
		{
			name: "GST No",
			selector: (row: any) => row.gst_no,
			sortable: true,
		},
		{
			name: "GST Charges",
			selector: (row: any) => row.gst_charges,
			sortable: true,
		},
		{
			name: "TDS",
			selector: (row: any) => row.tds,
			sortable: true,
		},
		{
			name: "Phone Number",
			selector: (row: any) => row.primary_number,
			sortable: true,
		},
		{
			name: "Login Access",
			selector: (row: any) => (
				<CustomToggle
					status={row.login_access}
					row={row}
					fetchData={fetchData}
				/>
			),
			sortable: true,
		},
	];
	const token = localStorage.getItem("signIn");
	const [data, setData] = useState([]);
	const [filterText, setFilterText] = useState("");

	const filteredItems = [...data].reverse()?.filter((item: any) =>
		// columns.some((column: any) => {
		//   let value =
		//     typeof column.selector === "function" ? column.selector(item) : "";

		//   return (
		//     typeof value === "string" &&
		//     value.toLowerCase().includes(filterText.toLowerCase())
		//   );
		// })
		{
			const rowValues = Object.values(item).join("").toLowerCase();
			return rowValues.includes(filterText.toLowerCase());
		}
	);

	const subHeaderComponentMemo = useMemo(() => {
		return (
			<div
				id="basic-1_filter"
				className="dataTables_filter d-flex align-items-center">
				<Label className="me-2">Search:</Label>
				<Input
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setFilterText(e.target.value)
					}
					type="search"
					value={filterText}
				/>
			</div>
		);
	}, [filterText]);

	useEffect(() => {
		fetchData();
	}, [token]);
	return (
		<Layout>
			<div className="page-body">
				<Col sm="12">
					<Card>
						<CardBody>
							<div className="table-responsive">
								<DataTable
									pagination
									subHeader
									highlightOnHover
									striped
									persistTableHead
									subHeaderComponent={subHeaderComponentMemo}
									columns={columns.map((column: any) => ({
										...column,
										cell: (row: any) =>
											column.cell
												? column.cell({ row, fetchData })
												: column.selector(row),
									}))}
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

