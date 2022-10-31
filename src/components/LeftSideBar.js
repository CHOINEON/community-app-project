import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components"
import SidebarItem from "./SidebarItem";

const Side = styled.div`
  display: flex;
  border-right: 1px solid #e0e0e0;
  flex-direction: column;
  align-items: center;
  //justify-content: center;
  width: 150px;
`

const Menu = styled.div`
  width: 150px;
  display: flex;
  flex-direction: column;

`

const MenuLink = styled(Link)`
    text-decoration:none;
    font-size:1.3rem;
    display:block;
    padding-bottom:5px;
    border-bottom:1px solid #a1a1a1;
    padding-left: 20px;
    &:hover{
      background-color: #e0e0e0;
  }
`
function LeftSideBar() {

  const menus = [
    { name: "home", path: "/" },
    { name: "debates", path: "/debates" },
    { name: "questions", path: "/questions" }
  ];

  return (
  <Side>
    <Menu>
      {menus.map((menu, index) => {
        return (
          <MenuLink to={menu.path} key={index}>
            <SidebarItem
              menu={menu}
            />
          </MenuLink>
        );
      })}
    </Menu>

  </Side>
  );
}

export default LeftSideBar;