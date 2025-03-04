import React, { useEffect, useMemo, useState } from "react";
// import ProtectedRoute from "@/pages/components/ProtectedRoute";
import { Card, CardBody, Col, Input, Label } from "reactstrap";
import DataTable from "react-data-table-component";
import localStorage from "@/utils/localStorage";
import axios from "axios";
import Link from "next/link";
import UL from "@/pages/components/ListGroup/UnorderedList";
import LI from "@/pages/components/ListGroup/ListItem";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Layout from "../Layout/Layout";
import Badges from "../components/Badge";

const TableAction = ({ id }: any) => {
  const router = useRouter();
  if (!id) {
    return null;
  }
  const handleClick = (e: any) => {
    e.preventDefault();
    router.replace(`/comman_pages/members/edit_members/${id}`);
  };

  return (
    <UL className="action simple-list flex-row" id={id}>
      <LI className="edit">
        <Link
          href={{
            pathname: `/comman_pages/members/edit_members/${id}`,
            query: { id: id },
          }}
          onClick={handleClick}
        >
          <i className="icon-pencil-alt" />
        </Link>
      </LI>
    </UL>
  );
};

const CustomBadge = ({ status }: any) => {
  const getStatusColor = (status: any) => {
    switch (status) {
      case "1":
        return "success";
      default:
        return "light";
    }
  };
  const color = getStatusColor(status);

  return (
    <Badges pill className={`badge-${color}`} color="">
      {status}
    </Badges>
  );
};

const Index: React.FC = () => {
  const columns: any = [
    {
      name: "Training",
      selector: (row: any) => row.training_name,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row: any) => row.start_time,
      sortable: true,
    },
    {
      name: "Venue",
      selector: (row: { email: any }) => (
        <Link
          className="text-blue"
          rel="/assets/images/favicon.png"
          href={`comman_pages/dashboard`}
          target="_blank"
        >
          Link
        </Link>
      ),
      sortable: true,
    },
    {
      name: "Price",
      selector: (row: any) => row.member_fee,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: any) => <CustomBadge status={row.status} />,
      sortable: true,
    },
    {
      name: "Action",
      cell: (row: any) => <TableAction id={row.id} />,
      sortable: true,
    },
  ];
  const token = localStorage.getItem("signIn");
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [chaptersData, setChaptersData] = useState([]);

  const filteredItems = data.filter((item: any) =>
    columns.some((column: any) => {
      let value =
        typeof column.selector === "function" ? column.selector(item) : "";

      return (
        typeof value === "string" &&
        value.toLowerCase().includes(filterText.toLowerCase())
      );
    })
  );

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <div
        id="basic-1_filter"
        className="dataTables_filter d-flex align-items-center"
      >
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
    const fetchData = async () => {
      if (typeof window !== "undefined" && window.localStorage) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        try {
          const response = await axios.get("/api/training", config);
          setData(response.data);
        } catch (error) {
          console.error("Error fetching training data:", error);
        }
      }
    };

    fetchData();
  }, [token]);
  return (
    <Layout>
      {/* <ProtectedRoute> */}
        <div className="page-body">
          <Col sm="12">
            <Card>
              <CardBody>
                <div className="list-training-header">
                  <div>
                    <Link
                      className="btn btn-primary"
                      href="/training/add_training"
                    >
                      <i className="fa fa-plus" />
                      Add New
                    </Link>
                  </div>
                </div>
                <div className="table-responsive">
                  <DataTable
                    pagination
                    subHeader
                    highlightOnHover
                    striped
                    persistTableHead
                    subHeaderComponent={subHeaderComponentMemo}
                    columns={columns}
                    data={filteredItems}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </div>
      {/* </ProtectedRoute> */}
    </Layout>
  );
};

export default Index;
