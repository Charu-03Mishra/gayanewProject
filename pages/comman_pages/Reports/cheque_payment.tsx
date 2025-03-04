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
import Badges from "@/pages/components/Badge";
import UL from "@/pages/components/ListGroup/UnorderedList";
import LI from "@/pages/components/ListGroup/ListItem";
import { toast } from "react-toastify";
import { DateRangePicker } from "rsuite";
import { ValueType } from "rsuite/esm/DateRangePicker";

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

  return <Badges pill className={`badge-${color}`} color="">{status}</Badges>;
};

const TableAction = ({ row, fetchData, perPage, currentPage }: any) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const isPending = row?.row?.status === "pending";

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
                              ${
                                row.row?.payment_type === "membership fees"
                                  ? `
                                Business Support Service Llp
                                <br />
                                THE FINANCIAL SUPERMARKET TOWER,
                                <br />
                                4TH FLR,
                                <br />
                                B/H RISHABH PETROL PUMP, RING ROAD
                                <br />
                                SURAT - 395002
                                <br />
                                +91 99786 05090
                                <br />
                                Email: bnigsurat@gmail.com
                                <br />
                                GST Reg. No.: 24AAQFB4998Q1ZD
                              `
                                  : `
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
                              `
                              }
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
                                  ${row.row?.invoice_no}
                                </p>
                                <p class="no-margin">
                                  <strong>Invoice Date</strong>
                                  <br />
                                  ${moment(row.row?.start_payment_date).format(
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
                              ${row.row?.memberName}
                              <br />
                              ${row.row?.companyName}
                              <br />
                              ${row.row?.memberGST}
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
                      ${
                        row.row?.payment_type === "membership fees"
                          ? `
                        <td>Membership Fees</td>
                      `
                          : `
                        <td>Meeting Fees For ${moment(
                          row.row?.start_payment_date
                        ).format("MMM-YY")} To ${moment(
                              row.row?.end_payment_date
                            ).format("MMM-YY")}</td>
                      `
                      }
                      <td>998312</td>
                      <td class="text-right">Rs. ${row.row?.amount}</td>
                    </tr>
                    ${
                      Number(row.row?.discount)
                        ? `
                      <tr class="item">
                        <td>Discount</td>
                        <td>998312</td>
                        <td class="text-right">Rs. -${Number(
                          row.row?.discount
                        )?.toFixed(4)}</td>
                      </tr>
                    `
                        : ""
                    }
                    <tr class="item text-right">
                      <td colspan="3">&nbsp;</td>
                    </tr>
                     ${
                      row.row?.cgst ? `
                        <tr class="item">
                          <td colspan="2" class="text-end">CGST @ 9%</td>
                          <td>Rs. ${row.row?.cgst}</td>
                        </tr>
                      ` : ""
                    }
                     ${
                      row.row?.sgst ? `
                        <tr class="item">
                          <td colspan="2" class="text-end">SGST @ 9%</td>
                          <td>Rs. ${row.row?.sgst}</td>
                        </tr>
                      ` : ""
                    }
                    <tr class="total">
                      <td colspan="2" class="text-end"><strong>Sub Total</strong></td>
                      <td><strong>Rs. ${row.row?.amount}</strong></td>
                    </tr>
                   
                    <tr class="total">
                      <td colspan="2" class="text-end"><strong>Total Amount</strong></td>
                      <td><strong>Rs. ${row.row?.total_amount}</strong></td>
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
            ${
              row.row?.payment_type === "meeting fees"
                ? `
              <table class="table" style="width: 100%;" cellPadding="0" cellSpacing="0">
                <tr>
                  <td class="text-left font-size-xs"><strong>Notes:</strong></td>
                  <td class="text-left font-size-xs">All Meeting Fees are non-refundable and non-transferable.<br /></td>
                </tr>
              </table>`
                : ""
            }
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
          const footerTextLeft = `Copyright © ${new Date().getFullYear()} ${
            row.payment_type === "membership fees"
              ? "Business Support Service Llp"
              : "Gaya Business Service"
          }, All Rights Reserved`;
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

        doc.save(row.row?.invoice_no);
      },
      margin: [40, 20, 0, 20],
      autoPaging: "text",
      x: 0,
      y: 0,
      width: 550,
      windowWidth: 600,
    });
  };

  const handleStatusUpdate = async (status: string) => {
    setIsUpdating(true);
    try {
      const data = {
        status: status
      }
      const res = await axios.put(`/api/rzp_payments/${row.row?.id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("signIn")}`,
        },
      });
      if (res.status === 200) {
        toast.success(`Payment ${status === "approved" ? "approved" : "rejected"} successfully!`);
        fetchData(currentPage, perPage);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setIsUpdating(false);
    }
  };

  return (
    <>
    <UL className="action flex-row">
      {isPending && (
        <>
          <LI className="edit">
            {isUpdating ? (
              <i role="status">
                <span className="visually-hidden">Loading...</span>
              </i>
            ) : (
              <button
              style={{ backgroundColor: "unset" }}
                onClick={() => handleStatusUpdate("approved")}
                disabled={isUpdating}
              >
                <i className="icon-check" />
              </button>
            )}
          </LI>
          <LI className="delete">
            <button
            style={{ backgroundColor: "unset" }}
              onClick={() => handleStatusUpdate("rejected")}
              disabled={isUpdating}
            >
              <i className="icon-close" />
            </button>
          </LI>
        </>
      )}
    </UL>
    <UL>
      {row?.row?.status === "approved" ? (
        <LI className="edit">
          <button
          style={{ backgroundColor: "unset" }}
              onClick={generatePDF}
            >
              <i className="fa-regular fa-file-pdf fs-5" />
            </button>
        </LI>
      ) : (
        ""
      )}
      </UL>
      </>
  );
};

const ChequePayment = () => {
  const token = localStorage.getItem("signIn");
  const [filterText, setFilterText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilterApplied, setDateFilterApplied] = useState(false);
  const [dateRange, setDateRange] = useState<ValueType | any>([]);
  const [data, setData] = useState([]);
  const [perPage, setPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRows, setTotalRows] = useState<number>(0);

  const columns: any = [
    {
      name: "Amount",
      selector: (row: any) => `\u20B9${row.total_amount}`,
      sortable: true,
    },
    {
      name: "Payment Type",
      selector: (row: any) => row.payment_type,
      sortable: true,
      width: "150px",
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
      name: "Member Name",
      selector: (row: any) => row.member_name,
      sortable: true,
      width: "150px",
    },
    {
      name: "Email",
      selector: (row: any) => row.email,
      sortable: true,
      width: "170px",
    },
    {
      name: "Contact",
      selector: (row: any) => row.contact,
      sortable: true,
      width: "150px",
    },
    {
      name: "Verification Code",
      selector: (row: any) => row.verification_code,
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
      name: "Start Date",
      selector: (row: any) =>
        row.start_payment_date
          ? moment(row.start_payment_date).format("LL")
          : "",
      sortable: true,
      width: "170px",
    },
    {
      name: "End Date",
      selector: (row: any) =>
        row.end_payment_date
          ? moment(row.end_payment_date).format("LL")
          : "",
      sortable: true,
      width: "170px",
    },
    {
      name: "Status",
      selector: (row: { status: any }) => <CustomBadge status={row.status} />,
      sortable: true,
      sortFunction: (a: any, b: any) => {
        return a.chapter_name.localeCompare(b.chapter_name);
      }
    },
    
    {
      name: "Action",
      cell: (row: any) => <TableAction row={row} fetchData={fetchData} currentPage={currentPage} perPage={perPage} />,
      sortable: true,
  }
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
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (dateFilterApplied && dateRange?.length === 2) {
        params.startDate = moment(dateRange[0]).format("YYYY-MM-DD");
        params.endDate = moment(dateRange[1]).format("YYYY-MM-DD");
      }
      try {
        const response = await axios.get("/api/export-cheque-payment", {
          params,
          ...config,
        });
        const blob = new Blob([response.data], {
          type: "text/csv;charset=utf-8",
        });
        saveAs(blob, "Cheque Payment Report.csv");
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

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <>
        <div className="field mt-1">
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

  const fetchData = async (page: number, pageSize: any) => {
    if (typeof window !== "undefined" && window.localStorage) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const params: any = {
        page,
        pageSize,
      };

      if (searchTerm) params.search = searchTerm;
      if (dateFilterApplied && dateRange?.length === 2) {
        params.startDate = moment(dateRange[0]).format("YYYY-MM-DD");
        params.endDate = moment(dateRange[1]).format("YYYY-MM-DD");
      }

      try {
        const responseFilter = await axios.get(
          `/api/cheque-payments`,
          {
            params,
            ...config,
          }
        );

        setData(responseFilter?.data.payments);
        setCurrentPage(responseFilter.data.pagination?.currentPage);
        setTotalRows(responseFilter.data.pagination?.totalItems);
      } catch (error) {
        console.error("Error fetching payment data:", error);
      }
    }
  };

  const handlePageChange = (page: any) => {
    fetchData(page, perPage);
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = async (newRowsPerPage: any) => {
    if (!data.length) return;
    fetchData(currentPage, newRowsPerPage);
    setPerPage(newRowsPerPage);
  };

  useEffect(() => {
    fetchData(currentPage, perPage);
  }, [dateFilterApplied, searchTerm]);
  return (
    <Layout>
      <div className="page-body">
        <Col sm="12">
          <Card>
            <CardBody>
              <div className="table-responsive">
                <Btn
                  color="primary"
                  className="me-2"
                  onClick={handleDownloadCSV}
                >
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

export default ChequePayment;
