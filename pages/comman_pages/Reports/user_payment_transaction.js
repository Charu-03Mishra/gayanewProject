import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
import { renderToString } from "react-dom/server";
import html2canvas from "html2canvas";
import PdfMeetingFees from "@/pages/components/Pdf/pdfMeetingFees";
import { useRouter } from "next/router";
import { DateRangePicker } from "rsuite";

const TableAction = ({ row }) => {
  console.log("row", row);
  
  const generatePDF = async () => {
    const pdfElement = `
      <div id="pdf-content" style="width: 210mm; height: 297mm; padding: 20mm;">
        <style>
          .page {
            width: 100%;
            height: 100%;
          }
          .invoice-box {
            width: 100%;
            border-collapse: collapse;
          }
          .invoice-box table {
            width: 100%;
          }
          .invoice-box table td {
            padding: 5px;
          }
          .invoice-box table tr.top table td {
            padding-bottom: 20px;
          }
          .invoice-box table tr.information table td {
            padding-bottom: 40px;
          }
          .invoice-box table tr.heading td {
            border-bottom: 1px solid #ddd;
            font-weight: bold;
          }
          .invoice-box table tr.details td {
            padding-bottom: 20px;
          }
          .invoice-box table tr.item td {
            border-bottom: 1px solid #eee;
          }
          .invoice-box table tr.item.last td {
            border-bottom: none;
          }
          .invoice-box table tr.total td:nth-child(2) {
            border-top: 2px solid #eee;
            font-weight: bold;
          }
        </style>
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
                              row.payment_type === "membership fees"
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
                                  ${row?.invoice_no}
                                </p>
                                <p class="no-margin">
                                  <strong>Invoice Date</strong>
                                  <br />
                                  ${moment(row?.createdAt).format("LL")}
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
                              ${row?.memberName}
                              <br />
                              ${row?.companyName}
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
                    <tr class="heading bg-bni-red">
                      <td class="br-white">Particulars</td>
                      <td class="br-white">SAC</td>
                      <td class="text-right">Amount (Rs)</td>
                    </tr>
                    <tr class="item">
                      ${
                        row.payment_type === "visitor fees"
                          ? `<td>Chapter Visit Fees</td>`
                          : row.payment_type === "membership fees"
                          ? `<td>Membership Fees</td>`
                          : `<td>Meeting Fees For ${moment(
                              row.start_payment_date
                            ).format("LL")} To ${moment(
                                row.end_payment_date
                              ).format("LL")}</td>`
                      }
                      <td>998312</td>
                      <td class="text-right">Rs. ${row?.amount}</td>
                    </tr>
                    ${
                      Number(row?.discount)
                        ? `<tr class="item">
                            <td>Discount</td>
                            <td>998312</td>
                            <td class="text-right">Rs. -${Number(
                              row?.discount
                            ).toFixed(4)}</td>
                          </tr>`
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
            ${
              row.payment_type === "meeting fees"
                ? `<table class="table" style="width: 100%;" cellPadding="0" cellSpacing="0">
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
      </div>
    `;
  
    const element = document.createElement("div");
    element.innerHTML = pdfElement;
    document.body.appendChild(element);
  
    const pdf = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: "a4",
    });
  
    const pages = [];
    const pageElements = element.querySelectorAll(".page");
  
    for (const pageElement of pageElements) {
      const canvas = await html2canvas(pageElement, {
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
  
      if (!isEmptyPage(imgData)) {
        pages.push(imgData);
      }
    }
  
    pages.forEach((imgData, index) => {
      if (index > 0) {
        pdf.addPage();
      }
      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight()
      );
    });
  
    // Add footer
    for (let i = 1; i <= pdf.getNumberOfPages(); i++) {
      pdf.setPage(i);
      const footerTextLeft = `Copyright © ${new Date().getFullYear()} ${
        row.payment_type === "membership fees"
          ? "Business Support Service Llp"
          : "Gaya Business Service"
      }, All Rights Reserved`;
      const footerTextRight = `Page ${i}`;
  
      pdf.text(
        footerTextLeft,
        10,
        pdf.internal.pageSize.getHeight() - 10
      );
      pdf.text(
        footerTextRight,
        pdf.internal.pageSize.getWidth() - 60,
        pdf.internal.pageSize.getHeight() - 10
      );
    }
  
    pdf.save("invoice.pdf");
    document.body.removeChild(element);
  };
  
  function isEmptyPage(imgData) {
    // Implement a function to check if the imgData represents an empty page
    // This could involve checking for a predominant background color, etc.
    // For simplicity, let's assume no pages are empty in this example.
    return false;
  }
  
  

  return (
    <ul className="action simple-list flex-row">
      {row.razorpay_payment_id ? (
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

const AllTransaction = () => {
    const token = localStorage.getItem("signIn");
    const [filterText, setFilterText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilterApplied, setDateFilterApplied] = useState(false);
    const [data, setData] = useState([]);
    const [dateRange, setDateRange] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
  
    const columns = [
      { name: "First Name", selector: (row) => `${row.firstName}`, sortable: true },
      { name: "Last Name", selector: (row) => row.lastName, sortable: true, width: "210px" },
      { name: "Email", selector: (row) => row.email, sortable: true, width: "150px" },
      { name: "Phone", selector: (row) => row.phoneNumber, sortable: true, width: "150px" },
      { name: "Industry", selector: (row) => row.companyIndustry, sortable: true, width: "150px" },
      { name: "Position", selector: (row) => row.position, sortable: true, width: "150px" },
      { name: "Chapter Name", selector: (row) => row.chapterName || "No BNI Member", sortable: true, width: "150px" },
      { name: "Transaction Date", selector: (row) => row.payment_date ? moment(row.payment_date).format("LL") : "No transaction", sortable: true, width: "150px" },
      { name: "Payment Status", selector: (row) => row.razorpay_payment_id ? <span className="badge badge-flat border-success bg-success">Paid</span> : <span className="badge badge-flat border-primary bg-primary">Pending</span>, sortable: true },
      // { name: "Action",  cell: (row) => <TableAction row={row} />, sortable: true },
    ];
  
    const filteredItems = useMemo(() => {
      return data
        .sort((a, b) => b.id - a.id)
        .filter((item) => {
          return columns.some((column) => {
            let value = typeof column.selector === "function" ? column.selector(item) : "";
            if (typeof value === "string") {
              return value.toLowerCase().includes(searchTerm.toLowerCase());
            } else if (typeof value === "number") {
              return value.toString().includes(searchTerm.toLowerCase());
            }
            return false;
          });
        });
    }, [data, columns, searchTerm]);
  
    const handleDownloadCSV = async () => {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      };
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (dateFilterApplied && dateRange?.length === 2) {
        params.startDate = moment(dateRange[0]).format("YYYY-MM-DD");
        params.endDate = moment(dateRange[1]).format("YYYY-MM-DD");
      }
      try {
        const response = await axios.get('/api/export-csv/user_payment_csv', { params, ...config });
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, 'All_Transaction_Payment_Report.csv');
      } catch (error) {
        console.error('Error downloading CSV:', error);
      }
    };
  
    const handleSearchClick = () => {
      setSearchTerm(filterText?.trim());
      setDateFilterApplied(true);
    };
  
    const handleDateFilter = (value) => {
      setDateRange(value);
      if (!value) setDateFilterApplied(false);
    };
  
    const handleOnChangeSearch = (e) => {
      const value = e.target.value;
      setFilterText(value);
      if (value.trim() === "") setSearchTerm("");
    };
  
    const subHeaderComponentMemo = useMemo(() => {
      return (
        <>
          <div className="field mt-1">
            <FormGroup className="me-3">
              <Label>Date Range:</Label>
              <DateRangePicker value={dateRange} onChange={handleDateFilter} format="yyyy-MM-dd" />
            </FormGroup>
          </div>
          <div className="dataTables_filter d-flex align-items-center">
            <Label className="me-2">Search:</Label>
            <Input onChange={handleOnChangeSearch} type="search" value={filterText} />
            <Btn color="primary" onClick={handleSearchClick} className="ms-2">Search</Btn>
          </div>
        </>
      );
    }, [filterText, dateRange]);
  
    const fetchData = async (page, pageSize) => {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const params = { page, pageSize };
      if (searchTerm) params.search = searchTerm;
      if (dateFilterApplied && dateRange?.length === 2) {
        params.startDate = moment(dateRange[0]).format("YYYY-MM-DD");
        params.endDate = moment(dateRange[1]).format("YYYY-MM-DD");
      }
  
      try {
        const response = await axios.get("/api/register_payment/usersPayment", { params, ...config });
        setData(response.data.payments);
        setCurrentPage(response.data.pagination?.currentPage);
        setTotalRows(response.data.pagination?.totalItems);
      } catch (error) {
        console.error("Error fetching payment data:", error);
      }
    };
  
    const handlePageChange = (page) => {
        console.log("page", page);
      fetchData(page, perPage);
      setCurrentPage(page);
    };
  
    const handleRowsPerPageChange = async (newRowsPerPage) => {
      fetchData(currentPage, newRowsPerPage);
      setPerPage(newRowsPerPage);
    };
  
    useEffect(() => {
      fetchData(currentPage, perPage);
    }, [token, dateFilterApplied, searchTerm]);
  
    return (
      <Layout>
        <div className="page-body">
          <Col sm="12">
            <Card>
              <CardBody>
                <div className="table-responsive">
                  <Btn color="primary" className="me-2" onClick={handleDownloadCSV}>
                    <i className="fa fa-file-text" aria-hidden="true"></i> CSV
                  </Btn>
                  <DataTable
                    columns={columns}
                    data={filteredItems}
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    onChangeRowsPerPage={handleRowsPerPageChange}
                    onChangePage={handlePageChange}
                    subHeader
                    subHeaderComponent={subHeaderComponentMemo}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </div>
      </Layout>
    );
  };
  
  export default AllTransaction;