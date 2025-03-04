"use client";
import Layout from "@/pages/Layout/Layout";
import LI from "@/pages/components/ListGroup/ListItem";
import UL from "@/pages/components/ListGroup/UnorderedList";
import Btn from "@/pages/components/button";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { Card, CardBody, Col, Input, Label, Row } from "reactstrap";

const TableAction = ({ id }: any) => {
  const router = useRouter();
  if (!id) {
    return null;
  }
  const handleClick = (e: any) => {
    e.preventDefault();
    router.push({
      pathname: `/comman_pages/region/${id}`,
      query: { id: id },
    });
  };
  return (
    <UL className="action simple-list flex-row" id={id}>
      <LI className="edit">
        <Link
          href={{ pathname: `/comman_pages/region/${id}`, query: { id: id } }}
          onClick={handleClick}
        >
          <i className="icon-pencil-alt" />
        </Link>
      </LI>
    </UL>
  );
};

const ListRegion = () => {
  const token = localStorage.getItem("signIn");
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const columns: any = [
    {
      name: "Region Name",
      selector: (row: any) => `${row.name}`,
      sortable: true,
      grow: 2,
    },
    {
      name: "Action",
      cell: (row: any) => <TableAction id={row.id} />,
      sortable: true,
    },
  ];
  const filteredItems = data?.filter((item: any) =>
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

  const fetchData = async () => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const response = await axios.get("/api/region", config);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching region data:", error);
      }
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <Layout>
      <div className="page-body">
        <Row>
          <Col sm="12">
            <Card>
              <CardBody>
                <div
                  className="table-responsive theme-scrollbar"
                  id="row_create"
                >
                  <DataTable
                    pagination
                    subHeader
                    highlightOnHover
                    striped
                    subHeaderComponent={subHeaderComponentMemo}
                    columns={columns}
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

export default ListRegion;
