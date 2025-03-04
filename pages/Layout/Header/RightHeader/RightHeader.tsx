import { Col } from "reactstrap";
import UserProfile from "./UserProfile/UserProfile";
import UL from "@/pages/components/ListGroup/UnorderedList";

const RightHeader = () => {
  return (
    <Col xxl="8" xl="6" md="7" xs="8" className="nav-right pull-right right-header p-0 ms-auto">
      <UL className="nav-menus flex-row simple-list">
        <UserProfile />
      </UL>
    </Col>
  );
};

export default RightHeader;
