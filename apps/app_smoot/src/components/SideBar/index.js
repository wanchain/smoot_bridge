import { useEffect, useMemo, useState } from "react";
import styled, { keyframes, css } from 'styled-components';
import { NavLink, useLocation } from 'react-router-dom';
import Icon from '@ant-design/icons';
import { ReactComponent as tokenBridgeIcon } from 'images/icons/tokenBridge.svg';
import { ReactComponent as historyIcon } from 'images/icons/history.svg';
import { ReactComponent as arrowDownIcon } from 'images/icons/arrowDown.svg';
import { useLocalStorage } from "../../context/localstorage";
import { isMobile } from 'react-device-detect';
const durationTime = 0.05;

const BarLeftAnimation = keyframes`
  0% { width: 104px }
  100% { width: 300px }
`;

const BarRightAnimation = keyframes`
  0% { width: 300px }
  100% { width: 104px }
`;

const Bar = styled.div`
  width: ${(props) => props.direction === 'right' ? '104px' : '300px'};
  height: 100vh;
  background: ${(props) => props.isdark === 'dark' ? '#042033' : '#FFFFFF'};
  display: ${isMobile ? 'none' : 'flex'};
  justify-content: space-between;
  flex-direction: column;
  overflow-y: auto;

  @media (max-width: 1400px) {
    width: ${(props) => props.direction === 'right' ? '104px' : '240px'};
  }

  ${
    (props) => props.direction === 'right' ? css`
      animation: ${durationTime}s ${BarRightAnimation};
      width: 104px;
    `
    : css`
      animation: ${durationTime}s ${BarLeftAnimation};
      width: 300px;
    `
  }
`;

const Body = styled.div`
  flex: 1;
`;

const Con = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${(props) => props.isdark === 'dark' ? '#1D3647' : '#EEEEEE'};
  display: flex;
  flex-direction: column;
  position: relative;

  @media (max-width: 1400px) {
    padding: 8px 14px;
  }
`;

const Navigator = styled(NavLink)`
  padding: 16px;
  font-size: 16px;
  color: ${(props) => props.isdark === 'dark' ? '#FFFFFF' : '#333333'};
  text-decoration: unset;
  display: flex;
  align-items: center;

  svg {
    color: ${(props) => props.isdark === 'dark' ? '#FFFFFF' : '#333333'};
  }

  ${
    (props) => props.isactive && css`
      background: ${(props) => props.isdark === 'dark' ? '#062E4B' : '#E7F0F7'};
      color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
      border-radius: 8px;

      svg {
        color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
      }
    `
  }

  &:hover {
    text-decoration: none;
    background: ${(props) => props.isactive ? props.isdark === 'dark' ? '#062E4B' : '#E7F0F7' : props.isdark === 'dark' ? '#0B2C43' : 'rgba(144, 144, 144, 0.1)'};
    border-radius: 8px;
  }

  @media (max-width: 1400px) {
    padding: 12px;
    font-size: 14px;
    ${
      (props) => props.direction === 'right' && css`
        width: 20px;
        margin: 6px auto;
      `
    }
  }
`;

const IconCon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: ${(props) => props.direction === 'right' ? '0' : '8px'};

  svg {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 1400px) {
    width: 20px;
    height: 20px;
    margin-right: ${(props) => props.direction === 'right' ? '0' : '6px'};

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const ArrowCon = styled.div`
  width: 14px;
  height: 28px;
  border-radius: 100px 0 0 100px;
  border: 1px solid ${(props) => props.isdark === 'dark' ? '#1D3647' : '#EEE' };
  border-right: none;
  background: ${(props) => props.isdark === 'dark' ? '#042033' : '#FFF' };
  cursor: pointer;
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translate(0, 50%);
  z-index: 1;
  overflow: hidden;
`;

const LeftAnimation = keyframes`
  0% { transform: rotate(-90deg); }
  100% { transform: rotate(90deg); }
`;

const RightAnimation = keyframes`
  0% { transform: rotate(90deg); }
  100% { transform: rotate(-90deg); }
`;

const ArrowIcon = styled(Icon)`
  width: 14px;
  height: 14px;
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#C7C7C7' };
  position: absolute;
  top: 50%;
  right: -2px;
  margin-top: -50%;

  svg {
    width: 14px;
    height: 14px;
  }

  ${
    (props) => props.direction === 'left' && css`
      animation: ${durationTime}s ${LeftAnimation};
      transform: rotate(90deg);
    `
  }

  ${
    (props) => props.direction === 'right' && css`
      animation: ${durationTime}s ${RightAnimation};
      transform: rotate(-90deg);
    `
  }
`;

const SideBar = () => {
  const { theme, leftBarDirection} = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  const { pathname } = useLocation();
  const [barDirection, setBarDirection] = useState(leftBarDirection);
  const [isChoose, setIsChoose] = useState(false);

  useEffect(() => {
    if (!isChoose) {
      setBarDirection(leftBarDirection);
    }
  }, [leftBarDirection, isChoose]);

  return (
    <Bar isdark={isdark} direction={barDirection}>
      <Body>
        <Con isdark={isdark}>
          <ArrowCon isdark={isdark} onClick={() => {
            setIsChoose(true);
            setBarDirection(barDirection === 'left' ? 'right' : 'left');
          }}>
            <ArrowIcon isdark={isdark} component={arrowDownIcon} direction={barDirection}></ArrowIcon>
          </ArrowCon>
        </Con>
        <Con isdark={isdark}>
          <Navigator direction={barDirection} isdark={isdark} isactive={pathname.includes('AssetBridge') ? 'true' : undefined} to={`/AssetBridge`}>
            <IconCon direction={barDirection} component={tokenBridgeIcon}></IconCon>
            {barDirection === 'right' ? null : 'Asset Bridge'}
          </Navigator>
          <Navigator direction={barDirection} isdark={isdark} isactive={pathname.includes('History') ? 'true' : undefined} to={`/History`}>
            <IconCon direction={barDirection} component={historyIcon}></IconCon>
            {barDirection === 'right' ? null : 'History'}
          </Navigator>
        </Con>
      </Body>
    </Bar>
  )
};

export default SideBar;
