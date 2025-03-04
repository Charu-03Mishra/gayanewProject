import React, { useEffect, useRef, useState } from "react";
import Layout from "../../Layout/Layout";
import axios from "axios";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import H4 from "@/pages/components/headings/H4Element";
import DataTable from "react-data-table-component";

function PrevCurrentPendingPayment() {
  const token = localStorage.getItem("signIn");
  const page = useRef(1);
  const rowPerPage = useRef(10);
  const [prevCurrentData, setPrevCurrentData] = useState<any>([]);
  const urlParams = new URLSearchParams(window.location.search);

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
      name: "Member Name",
      selector: (row: any) => row.chapterName.split("#@")[0]
      ,
      sortable: true,
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
      name: "Member Name",
      selector: (row: any) => row.chapterName.split("#@")[0],
      sortable: true,
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

  useEffect(() => {
    fetchPrevCurrentPendingPayments()
  }, [token]);

  const fetchPrevCurrentPendingPayments = async () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const params: any = {
        page: page.current || 1,
        pageSize: rowPerPage.current || 10,
        chapter_id: urlParams.get('chapter_id') || 'all'
      };

      try {
        const response = await axios.get(
          `/api/previous-current-pending-payments/${urlParams.get('chapter_id') || '1'}`,
          {
            params,
            ...config
          }
        );
        setPrevCurrentData(response.data.data);
      } catch (error) {
        console.error("Error fetching chapters data:", error);
      }
    }
  };

  const handleRowsPerPageChange = async (newRowsPerPage: any) => {
    rowPerPage.current=newRowsPerPage;
    // fetchPrevCurrentPendingPayments()
  };

  const handlePageChange = (pageNum: any) => {
    page.current=pageNum
    // fetchPrevCurrentPendingPayments()
  };
  return (
    <Layout>
        <div className="page-body">
        <Container fluid className="dashboard-3">
      <Row>
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
                      onChangeRowsPerPage={handleRowsPerPageChange}
                      onChangePage={handlePageChange}
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
          </Row>
          </Container>
          </div>
    </Layout>
  );
}

export default PrevCurrentPendingPayment;
