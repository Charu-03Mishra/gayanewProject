import { useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";
const CardHeaderDropDown = ({firstItem , secondItem ,thirdItem ,mainTitle,menuTitle}:any) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);
  return (
    <Dropdown className="icon-dropdown" isOpen={dropdownOpen} toggle={toggle} >
      <DropdownToggle caret color="">
        {mainTitle ? <i className="icon-more-alt" /> : menuTitle }
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end">
        <DropdownItem>
          {firstItem}
        </DropdownItem>
        <DropdownItem>
          {secondItem}
        </DropdownItem>
        <DropdownItem>
          {thirdItem}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default CardHeaderDropDown;
