import { useMemo } from 'react';
import styled, { css } from 'styled-components';
import { useLocalStorage } from '../../context/localstorage';
import WalletBtn from '../WalletBtn';
import { isMobile } from 'react-device-detect';
import SideBarBtn from '../SideBar/Btn';
import Switch from '../Switch';
import TransactionNotification from '../TransactionNotification';

const Line = styled.div`
  display: flex;
  flex-direction: row-reverse;
  padding: 36px 36px 50px;

  @media (max-height: 800px) {
    padding: 16px 16px 18px;
  }

  ${
    isMobile && css`
      padding: 0 20px;
      background: ${(props) => props.isdark === 'dark' ? '#042033' : '#fff'};
      height: 48px;
      align-items: center;
      justify-content: space-between;
      flex-direction: row;
    `
  }
`;

const Logo = styled.img`
  height: 22px;
`;

const RightCon = styled.div`
  display: flex;
  align-items: center;
`;

const Header = () => {
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);

  return (
    <Line isdark={isdark}>
      <TransactionNotification></TransactionNotification>
      {
        isMobile ? (
          <>
            <RightCon>
              <SideBarBtn></SideBarBtn>
            </RightCon>
          </>
        ) : (
          <>
            <WalletBtn></WalletBtn>
            <Switch></Switch>
          </>
        )
      }
    </Line>
  )
};

export default Header;