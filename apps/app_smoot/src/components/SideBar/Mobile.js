import { useMemo } from "react";
import styled, { css } from 'styled-components';
import { NavLink, useLocation } from 'react-router-dom';
import Icon from '@ant-design/icons';
import { ReactComponent as closeIcon } from 'images/icons/close.svg';
import { ReactComponent as tokenBridgeIcon } from 'images/icons/tokenBridge.svg';
import { ReactComponent as historyIcon } from 'images/icons/history.svg';
import { useLocalStorage } from "../../context/localstorage";

const MobileSideBar = (props) => {
  const { handleShowBar } = props;
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  const { pathname } = useLocation();

  return (
    <Bar isdark={isdark}>
      <CloseLine isdark={isdark}>
        <CloseBtn isdark={isdark} component={closeIcon} onClick={() => handleShowBar()}></CloseBtn>
      </CloseLine>
      <Body>
        <Con isdark={isdark}>
          <Navigator onClick={() => handleShowBar()} isdark={isdark} isactive={pathname.includes('AssetBridge') ? 'true' : undefined} to={`/AssetBridge`}><IconCon component={tokenBridgeIcon}></IconCon>Asset Bridge</Navigator>
        </Con>
        <Con isdark={isdark}>
          <Navigator onClick={() => handleShowBar()} isdark={isdark} isactive={pathname.includes('History') ? 'true' : undefined} to={`/History`}><IconCon component={historyIcon}></IconCon>History</Navigator>
        </Con>
      </Body>
    </Bar>
  )
};

export default MobileSideBar;

const Bar = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: ${(props) => props.isdark === 'dark' ? '#042033' : '#FFFFFF'};
  display: flex;
  flex-direction: column;
  z-index: 30;
`;

const CloseLine = styled.div`
  height: 48px;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid ${(props) => props.isdark === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#EEE'};
`;

const CloseBtn = styled(Icon)`
  width: 24px;
  height: 24px;
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#333333'};

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const Con = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${(props) => props.isdark === 'dark' ? '#1D3647' : '#EEEEEE'};
  display: flex;
  flex-direction: column;
`;

const Navigator = styled(NavLink)`
  padding: 16px;
  font-size: 16px;
  color: ${(props) => props.isdark === 'dark' ? '#FFFFFF' : '#333333'};
  text-decoration: unset;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  background: ${(props) => props.isdark === 'dark' ? '#0C2739' : '#F9F9F9'};
  border-radius: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  svg {
    color: ${(props) => props.isdark === 'dark' ? '#FFFFFF' : '#333333'};
  }

  ${
    (props) => props.isactive && css`
      background: ${(props) => props.isdark === 'dark' ? '#062E4B' : '#E7F0F7'};
      color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};

      svg {
        color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
      }
    `
  }

  &:hover {
    text-decoration: none;
  }
`;

const IconCon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 8px;

  svg {
    width: 24px;
    height: 24px;
  }
`;
