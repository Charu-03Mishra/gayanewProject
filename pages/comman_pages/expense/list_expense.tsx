import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../Layout/Layout";
import {
  Card,
  CardBody,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DataTable from "react-data-table-component";
import localStorage from "@/utils/localStorage";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import UL from "@/pages/components/ListGroup/UnorderedList";
import LI from "@/pages/components/ListGroup/ListItem";
import Link from "next/link";
import Badges from "@/pages/components/Badge";
import { DateRangePicker } from "rsuite";
import Btn from "@/pages/components/button";
import { ValueType } from "rsuite/esm/DateRangePicker";

const paidStatusOptions = [
  { value: "", label: "Select options" },
  { value: "Paid", label: "Paid" },
  { value: "UnPaid", label: "Unpaid" },
];

const TableAction = ({ row, fetchData, perPage, currentPage, selectedStatus, selectedExpenseType }: any) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const isPending = row?.row?.status === "pending";

  const handleStatusUpdate = async (status: string) => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("status", status);
      const res = await axios.put(`/api/expense/${row.row?.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("signIn")}`,
        },
      });

      if (res.status === 200) {
        toast.success(
          `Expense ${
            status === "approved" ? "approved" : "rejected"
          } successfully!`
        );
        fetchData(currentPage, perPage, selectedStatus, selectedExpenseType);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setIsUpdating(false);
    }
  };

  return (
    <UL className="action simple-list flex-row">
      <LI>
        <Link className="edit me-2"
            rel="/assets/images/favicon.png"
            href={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/${row.row?.document}`}
            target="_blank">
          <i className="icon-import" />
        </Link>
      </LI>
      {isPending && (
        <>
          <LI className="edit">
            {isUpdating ? (
              <i role="status">
                <span className="visually-hidden">Loading...</span>
              </i>
            ) : (
              <button
                className="border-0"
                onClick={() => handleStatusUpdate("approved")}
                disabled={isUpdating}
              >
                <i className="icon-check" />
              </button>
            )}
          </LI>
          <LI className="delete">
            <button
              className="border-0"
              onClick={() => handleStatusUpdate("rejected")}
              disabled={isUpdating}
            >
              <i className="icon-close" />
            </button>
          </LI>
        </>
      )}
    </UL>
  );
};

const CustomBadge = ({ status }: any) => {
  const getStatusColor = (status: any) => {
    switch (status) {
      case "pending":
        return "primary";
      case "approved":
        return "success";
      case "rejected":
        return "info";
      default:
        return "light";
    }
  };

  // Get the color based on status
  const color = getStatusColor(status);

  return (
    <Badges pill className={`badge-${color}`} color="">
      {status}
    </Badges>
  );
};

const Index: React.FC = () => {
  const token = localStorage.getItem("signIn");
  const memberRole = localStorage.getItem("role");
  const [data, setData] = useState<any>([]);
  const [filterText, setFilterText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<ValueType | any>([]);
  const [perPage, setPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [dateFilterApplied, setDateFilterApplied] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedExpenseType, setSelectedExpenseType] = useState("");
  const urlParams = new URLSearchParams(window.location.search);
  
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const columns: any = [
    {
      name: "Chapter Name",
      selector: (row: any) => row.chapter_name,
      sortable: true,
      width: "150px",
    },
    {
      name: "Expense Type",
      selector: (row: any) => `${row.expense_type}`,
      sortable: true,
      width: "135px",
    },
    {
      name: "Meeting Date",
      selector: (row: any) => moment(row.date_of_meeting).format("LL"),
      sortable: true,
      width: "135px",
    },
    {
      name: "Upload Date",
      selector: (row: any) => moment(row.createdAt).format("LL"),
      sortable: true,
      width: "140px",
    },
    {
      name: "Invoice No",
      selector: (row: any) => row.invoice_no,
      sortable: true,
      width: "125px",
    },
    {
      name: "Expense Head",
      selector: (row: any) => row.expense_head,
      sortable: true,
      width: "140px",
    },
    {
      name: "Vendor Head",
      selector: (row: any) => row.vendor_name,
      sortable: true,
      width: "140px",
    },
    {
      name: "Amount",
      selector: (row: { amount: any }) => `₹${row.amount}`,
      sortable: true,
      grow: 1,
    },
    ...(memberRole === "admin"
      ? [
          {
            name: "Paid Status",
            selector: (row: any, index: number) => (
              <Input
                type="select"
                name={`paid_status_${index}`}
                onChange={(e: any) => handlePaidStatusChange(row, e)}
                value={row.paid_status || ""}
                style={{ fontSize: "12px" }}
              >
                {paidStatusOptions?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Input>
            ),
            sortable: true,
            width:"160px"
          },
        ]
      : []),
    {
      name: "Status",
      selector: (row: { status: any }) => <CustomBadge status={row.status} />,
      sortable: true,
    },
    ...(memberRole === "admin"
      ? [
          {
            name: "Action",
            cell: (row: any) => <TableAction row={row} fetchData={fetchData} currentPage={currentPage} perPage={perPage} selectedStatus={selectedStatus} selectedExpenseType={selectedExpenseType} />,
            sortable: true,
          },
        ]
      : []),
  ];

  const filterByDateRange = (item: any) => {
    const itemDate = moment(item.date_of_meeting);
    if (!dateRange || dateRange.length !== 2) return true; // Check if dateRange is null or undefined, or if it doesn't have both start and end dates
    return itemDate.isBetween(
      moment(dateRange[0]),
      moment(dateRange[1]),
      null,
      "[]"
    );
  };

  const handlePageChange = (page: any) => {
    fetchData(page, perPage, selectedStatus, selectedExpenseType);
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = async (newRowsPerPage: any) => {
    if (!data.length) return;
    fetchData(currentPage, newRowsPerPage, selectedStatus, selectedExpenseType);
    setPerPage(newRowsPerPage);
  };

  const handleSearchClick = () => {
    setSearchTerm(filterText?.trim());
    setDateFilterApplied(true);
  };

  const handleOnChangeSearch = (e: any) => {
    const value = e.target.value;
    setFilterText(value);

    if (value.trim() === "") {
      setSearchTerm("");
    }
  };

  const fetchData = async (page: number, pageSize: number, selectedStatus: string, selectedExpenseType: string) => {
    setCurrentPage(page);
    setPerPage(pageSize);
    const params: any = {
      page,
      pageSize,
      role: memberRole,
      chapter_id: urlParams.get('chapter_id') || 'all'
    };
    if (searchTerm) params.search = searchTerm;
    if (dateFilterApplied && dateRange?.length === 2) {
      params.startDate = moment(dateRange[0]).format("YYYY-MM-DD");
      params.endDate = moment(dateRange[1]).format("YYYY-MM-DD");
    }

    const url = new URL(`/api/expense`, window.location.origin);

    if (selectedStatus !== "") {
      url.searchParams.append('status', selectedStatus);
    }

    if (selectedExpenseType !== "") {
      url.searchParams.append('expense_type', selectedExpenseType);
    }
    
    try {
      const response = await axios.get(url.toString(), {
        params,
        ...config,
      });

      setData(response.data.expense?.filter(filterByDateRange));
      setCurrentPage(response.data.pagination?.currentPage);
      setTotalRows(response.data.pagination.totalItems);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchKittyConfig = async (dateMeeting: any) => {
    try {
      const response = await axios.get("/api/kitty-config", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("signIn")}`,
        },
      });
      if (response.status === 200) {
        const dateOfMeeting = moment(dateMeeting);
        const matchingKittyType = response.data.find((item: any) => {
          const rangeFrom = moment(item.range_from);
          const rangeTo = moment(item.range_to);

          // Check if the date_of_meeting falls within the range_from and range_to of each kitty type
          return (
            dateOfMeeting.isSameOrAfter(rangeFrom, "day") &&
            dateOfMeeting.isSameOrBefore(rangeTo, "day")
          );
        });
        return matchingKittyType?.param;
      }
    } catch (error) {
      console.error("fetch error kitty config", error);
    }
  };
  const handlePaidStatusChange = async (row: any, event: any) => {
    const updatedRow = { ...row, paid_status: event.target.value };

    try {
      
      const formData = new FormData();
      formData.append("paid_status", updatedRow.paid_status);

      const res = await axios.put(
        `/api/expense/${updatedRow.id}`,
        formData,
        config
      );

      if (res?.status === 200) {
        toast.success("Status changed successfully");
        if (updatedRow?.paid_status === "Paid") {
          const startDate = moment(new Date()).format("YYYY-MM-DD");
          const matchingKittyType = await fetchKittyConfig(
            updatedRow?.date_of_meeting
          );
  
          await axios.post(
            "/api/kitty-balance",
            {
              chapter_id: updatedRow?.chapter_id,
              reason: "CHAPTER FUND",
              given_by: updatedRow?.expense_head,
              date: startDate,
              amount: updatedRow?.amount,
              total_amount: updatedRow?.amount,
              kitty_type: matchingKittyType,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("signIn")}`,
              },
            }
          );
        }
        fetchData(currentPage, perPage, selectedStatus, selectedExpenseType);
      }
    } catch (error) {
      console.error("Error updating paid status:", error);
    }
  };

  const handleDownloadExcel = () => {
    const filteredData = filteredItems.map((item: any) => ({
      "Chapter Name": item.chapter_name,
      "Expense Type": item.expense_type,
      "Meeting Date": moment(item.date_of_meeting).format("LL"),
      "Invoice No": item.invoice_no,
      "Expense Head": item.expense_head,
      "Vendor Name": item.vendor_name,
      Amount: `₹${item.amount}`,
      "Paid Status": item.paid_status,
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Expense Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const excelBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(excelBlob, "Expense Report.xlsx");
  };

  const handleDownloadCSV = () => {
    // Filter out columns that should not be included in the CSV
    const filteredColumns = columns.filter(
      (column: any) =>
        column.name !== "Action"
    );
  
    // Concatenate filtered column names with comma
    const csvContent =
      filteredColumns.map((column: any) => column.name).join(",") +
      "\n" +
      // For each item in filteredItems, concatenate the values of filtered columns with comma
      filteredItems
        .map((item: any) =>
          filteredColumns
            .map((column: any) => {
              const value =
                typeof column.selector === "function"
                  ? column.selector(item)
                  : "";
              return typeof value === "string" ? `"${value}"` : "";
            })
            .join(",")
        )
        .join("\n");
  
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "Expense Report.csv");
  };
  
  const filteredItems = data?.sort((a: any, b:any) => a.id - b.id).filter((item: any) =>
    columns.some((column: any) => {
      let value =
        typeof column.selector === "function" ? column.selector(item) : "";

      if (typeof value === "string") {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (typeof value === "number") {
        return value.toString().includes(searchTerm.toLowerCase());
      }

      // Return false for non-string and non-number values
      return false;
    })
  );

  const handleDateFilter = (value: any) => {
    setDateRange(value);
    if(value === null){
      setDateFilterApplied(false)
    }
  }
  const handleStatusPaidChange = (e: any) => {
    setSelectedStatus(e.target.value);
  }
  const handleExpenseTypeChange = (e: any) => {
    setSelectedExpenseType(e.target.value);
  }
  const subHeaderComponentMemo = useMemo(() => {
    return (
      <>
       {/* Dropdown for Expense Type */}
       <div className="d-flex align-items-center">
          <Label>Type:</Label>
            <Input
              type="select"
              onChange={handleExpenseTypeChange}
            >
              <option value="">All</option>
              <option value="Meeting">Meeting</option>
              <option value="Others">Others</option>
            </Input>
          </div>
      {/* Dropdown for Paid Status */}
      <div className="d-flex align-items-center">
          <Label>Status:</Label>
            <Input
              type="select"
              onChange={handleStatusPaidChange}
            >
              <option value="">All</option>
              <option value="Paid">Paid</option>
              <option value="UnPaid">Unpaid</option>
            </Input>
          </div>
        <div className="field mx-1 mt-1">
          <FormGroup className="me-3">
            <Label>Date Range:</Label>
            <DateRangePicker
              value={dateRange}
              onChange={handleDateFilter}
              format="yyyy-MM-dd"
            />
          </FormGroup>
        </div>
        <div className="dataTables_filter d-flex align-items-center">
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
  }, [filterText, dateRange]);

  useEffect(() => {
    fetchData(currentPage, perPage, selectedStatus, selectedExpenseType);
  }, [token, dateFilterApplied, searchTerm, selectedStatus, selectedExpenseType]);

  return (
    <Layout>
      <div className="page-body">
        <Row>
          <Col sm="12">
            <Card>
              <CardBody>
                <Btn
                  color="primary"
                  className="me-2"
                  onClick={handleDownloadExcel}
                >
                  <i className="fa fa-file-excel"></i> Excel
                </Btn>
                <Btn
                  color="primary"
                  className="me-2"
                  onClick={handleDownloadCSV}
                >
                  <i className="fa fa-file-text" aria-hidden="true"></i> CSV
                </Btn>

                <div
                  className="table-responsive theme-scrollbar"
                  id="row_create"
                >
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
                    columns={columns.map((column: any) => ({
                      ...column,
                      cell: (row: any) =>
                        column.cell
                          ? column.cell({ row, fetchData })
                          : column.selector(row),
                    }))}
                    data={filteredItems}
                    className="theme-scrollbar display dataTable"
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default Index;
