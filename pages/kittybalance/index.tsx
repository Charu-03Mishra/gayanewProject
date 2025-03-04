"use client";
import React, { useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import DataTable from "react-data-table-component";
import H4 from "../components/headings/H4Element";
import axios from "axios";
import localStorage from "@/utils/localStorage";

const Index = () => {
  const token = localStorage.getItem("signIn");
  const [chaptersData, setChaptersData] = useState<any>([]);
  const [kittyData, setKittyData] = useState<any>([]);
  const [memberData, setMemberData] = useState<any>([]);
  
  const pastMfEndDateCount = () => {
    const currentDate = new Date();
    const pastRecords = memberData.filter((member: any) => {
      const mfEndDate = new Date(member.mf_end_date);
      return mfEndDate < currentDate;
    });
    return pastRecords.length;
  };

  const pendingCount = pastMfEndDateCount();

  const currentMfStartDateCount = () => {
    const currentDate = new Date();
    const currentRecords = memberData.filter((member: any) => {
      const mfStartDate = new Date(member.mf_start_date);
      // Check if mf_start_date is equal to the current date
      return mfStartDate.toDateString() === currentDate.toDateString();
    });
    return currentRecords.length;
  };

  const CurrentPaymentCount = currentMfStartDateCount();

  const futureMfStartDateCount = () => {
    const currentDate = new Date();
    const twoMonthsLater = new Date();
    twoMonthsLater.setMonth(currentDate.getMonth() + 2);

    const futureRecords = memberData.filter((member: any) => {
      const mfStartDate = new Date(member.mf_start_date);
      // Check if mf_start_date is within the next 2 months
      return mfStartDate > currentDate && mfStartDate <= twoMonthsLater;
    });

    return futureRecords.length;
  };

  const advancePaymentcount = futureMfStartDateCount();

  const kittyColumns: any = [
    {
      name: "Chapter Name",
      selector: (row: any) => row.chapter_name,
      sortable: true,
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
      selector: (row: any) => (row.opening_balance + row.received_total) - row.chapter_fund_total,
      sortable: true,
    },
    {
      name: "Outstanding",
      selector: (row: any) => row.april,
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
        setChaptersData(response.data);
        console.log(response.data,"data");
        
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

  useEffect(() => {
    chapterFetchData();
    getKittyData();
  }, [token]);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (typeof window !== "undefined" && window.localStorage) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        try {
          const response = await axios.get("/api/members", config);
          setMemberData(response.data?.members);
        } catch (error) {
          console.error("Error fetching members data:", error);
        }
      }
    };

    fetchMemberData();
  }, [token]);

  return (
    <Layout>
        <div className="page-body">
          <Container fluid className="dashboard-3">
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
        </div>
    </Layout>
  );
};

export default Index;
