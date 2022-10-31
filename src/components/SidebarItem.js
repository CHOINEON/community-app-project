import React from "react";
import styled from "styled-components"

const Item = styled.div`
    padding: 20px;
    font-size: 1.3rem;
    
`

function SidebarItem({ menu }) {
  return (
    <div className="sidebar-item">
      <p>{menu.name}</p>
    </div>
  );
}

export default SidebarItem;