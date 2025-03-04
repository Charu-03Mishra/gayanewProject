import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  Input,
  FormGroup,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Form,
  ModalFooter,
} from "reactstrap";
import localStorage from "@/utils/localStorage";
import axios from "axios";
import UL from "@/pages/components/ListGroup/UnorderedList";
import LI from "@/pages/components/ListGroup/ListItem";
import Link from "next/link";
import Btn from "@/pages/components/button";

const MemberTableAction = ({ row, fetchData, currentPage, perPage }: any) => {
  const token = localStorage.getItem("signIn");

  const [ltModalOpenId, setLtModalOpenId] = useState(null);
  const [sgdcModalOpenId, setSgdcModalOpenId] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState<any>({});
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [selectedSgdcRoles, setSelectedSgdcRoles] = useState<any>([]);
  const [chaptersData, setChaptersData] = useState([]);

  const toggleModal = (id: any) => {
    setLtModalOpenId(id === ltModalOpenId ? null : id);
    setSelectedRoles({});
  };

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
      } catch (error) {
        console.error("Error fetching chapters data:", error);
      }
    }
  };

  const sgdcToggleModal = (id: any) => {
    if (id !== sgdcModalOpenId) {
      // Only fetch data when opening the modal
      chapterFetchData();
    }
    setSgdcModalOpenId(id === sgdcModalOpenId ? null : id);
    // chapterFetchData();
    setSelectedSgdcRoles({});
  };

  const handleRoleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    memberId: any
  ) => {
    const { value, checked } = e.target;
    setSelectedRoles({
      // ...selectedRoles,
      [value]: checked === true ? memberId : "",
    });
  };

  const handleSgdcRoleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    memberId: any
  ) => {
    const { value, checked } = e.target;
    setSelectedSgdcRoles({
      //   ...selectedSgdcRoles,
      [value]: checked === true ? memberId : "",
    });
  };

  const handleLtSave = async () => {
    try {
      const data = {
        chapter_id: row?.chapter_id,
        president: selectedRoles.President,
        vice_president: selectedRoles.VicePresident,
        secretary: selectedRoles.Secretary,
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`/api/leadership`, data, config);

      if (response.status === 201) {
        const editMemberRes = await axios.put(
          `/api/members/${row?.id}`,
          {
            permission_LT: response.data.LT?.id,
          },
          config
        );
        if (editMemberRes.status === 200) {
          toggleModal(row?.id);
          fetchData(currentPage, perPage);
        }
      }
    } catch (error: any) {
      console.error("error creating LT", error);
    }
  };

  const handleSgdcSave = async () => {
    try {
        const data = {
          chapter_id: selectedChapter.map((option: any) => option.value),
          sr_support_directors : selectedSgdcRoles.sr_support_directors,
          support_directors: selectedSgdcRoles.support_directors,
          support_ambassador: selectedSgdcRoles.support_ambassador,
        };
  
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const response = await axios.post(`/api/SGDC`, data, config);
  
        if (response.status === 201) {
          const editMemberRes = await axios.put(
            `/api/members/${row?.id}`,
            {
              permission_SGDC: response.data.SGDC?.id,
            },
            config
          );
          if (editMemberRes.status === 200) {
            sgdcToggleModal(row?.id);
            fetchData(currentPage, perPage);
          }
        }
      } catch (error: any) {
        console.error("error creating SGDC", error);
      }
  };

  //  useEffect(() => {
  //   chapterFetchData();
  // }, []);

  return (
    <>
      <UL className="action simple-list flex-row">
        <LI onClick={() => toggleModal(row?.id)}>
          <Link href="" className="me-2">
            <i className="fa fa-plus-square"></i> LT
          </Link>
        </LI>
        <LI onClick={() => sgdcToggleModal(row?.id)}>
          <Link href="" className="me-2">
            <i className="fa fa-plus-square"></i> SGDC
          </Link>
        </LI>
      </UL>
      <Modal
        isOpen={ltModalOpenId === row?.id}
        toggle={() => toggleModal(row?.id)}
      >
        <ModalHeader toggle={() => toggleModal(row?.id)}>
          Leadership Team
        </ModalHeader>
        <ModalBody>
          <Form className="form-bookmark">
            <FormGroup check className="checkbox-checked">
              <Label check>
                <Input
                  type="radio"
                  name="role"
                  value="President"
                  onChange={(e) => handleRoleChange(e, row?.id)}
                />{" "}
                President
              </Label>
            </FormGroup>
            <FormGroup check className="checkbox-checked">
              <Label check>
                <Input
                  type="radio"
                  name="role"
                  value="VicePresident"
                  onChange={(e) => handleRoleChange(e, row?.id)}
                />{" "}
                Vice President
              </Label>
            </FormGroup>
            <FormGroup check className="checkbox-checked">
              <Label check>
                <Input
                  type="radio"
                  name="role"
                  value="Secretary"
                  onChange={(e) => handleRoleChange(e, row?.id)}
                />{" "}
                Secretary / Treasurer
              </Label>
            </FormGroup>
            <ModalFooter>
              <Btn color="primary" onClick={handleLtSave}>
                Save
              </Btn>
            </ModalFooter>
          </Form>
        </ModalBody>
      </Modal>
      <Modal
        isOpen={sgdcModalOpenId === row?.id}
        toggle={() => sgdcToggleModal(row?.id)}
      >
        <ModalHeader toggle={() => sgdcToggleModal(row?.id)}>
          Leadership Team
        </ModalHeader>
        <ModalBody>
          <Form className="form-bookmark">
            <FormGroup check className="checkbox-checked">
              <Label check>
                <Input
                  type="radio"
                  name="sgdcRole"
                  value="sr_support_directors"
                  onChange={(e) => handleSgdcRoleChange(e, row?.id)}
                />{" "}
                Sr. Support Directors
              </Label>
            </FormGroup>
            <FormGroup check className="checkbox-checked">
              <Label check>
                <Input
                  type="radio"
                  name="sgdcRole"
                  value="support_directors"
                  onChange={(e) => handleSgdcRoleChange(e, row?.id)}
                />{" "}
                Support Directors
              </Label>
            </FormGroup>
            <FormGroup check className="checkbox-checked">
              <Label check>
                <Input
                  type="radio"
                  name="sgdcRole"
                  value="support_ambassador"
                  onChange={(e) => handleSgdcRoleChange(e, row?.id)}
                />{" "}
                Support Ambassador
              </Label>
            </FormGroup>
            {selectedSgdcRoles.sr_support_directors ||
            selectedSgdcRoles.support_directors ||
            selectedSgdcRoles.support_ambassador ? (
              <FormGroup>
                <Label>Chapter Name</Label>
                <Select
                  options={chaptersData?.map((option: any) => ({
                    value: option.id,
                    label: option.chapter_name,
                  }))}
                  isMulti
                  value={selectedChapter}
                  onChange={(selectedOptions: any) =>
                    setSelectedChapter(selectedOptions)
                  }
                />
              </FormGroup>
            ) : null}
            <ModalFooter>
              <Btn color="primary" onClick={handleSgdcSave}>
                Save
              </Btn>
            </ModalFooter>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
};

export default MemberTableAction;
