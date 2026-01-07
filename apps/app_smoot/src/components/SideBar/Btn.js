import { useState, useMemo } from "react";
import { useLocalStorage } from '../../context/localstorage';
import MobileSideBar from "./Mobile";
import styled from 'styled-components';
import Icon from '@ant-design/icons';
import { ReactComponent as menuIcon } from 'images/icons/menu.svg';

const SideBarBtn = () => {
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  const [showBar, setShowBar] = useState(false);
  const handleShowBar = () => {
    setShowBar(!showBar);
  }
  return (
    <>
      <Btn isdark={isdark} component={menuIcon} onClick={handleShowBar}></Btn>
      {
        showBar && <MobileSideBar handleShowBar={handleShowBar}></MobileSideBar>
      }
    </>
  )
};

export default SideBarBtn;

const Btn = styled(Icon)`
  width: 28px;
  height: 28px;
  cursor: pointer;
  color: ${(props) => props.isdark === 'dark' ? '#FFFFFF' : '#333333'};

  svg {
    width: 28px;
    height: 28px;
  }
`;