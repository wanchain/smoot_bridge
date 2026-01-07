import styled, { css } from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';
import { isMobile } from "react-device-detect";
import Token from './Token';

const Body = styled.div`
  width: 1216px;
  min-height: 880px;
  border-radius: 12px;
  padding-bottom: 0px;
  background: ${(props) => props.isdark === 'dark' ? '#042033' : '#FFFFFF'};
  margin: 0 auto;

  @media (max-width: 1540px) {
    width: ${ isMobile ? '100%' : '1028px'};
  }

  ${
    isMobile && css`
      width: 100%;
      margin-top: 16px;
    `
  }
`;

const Title = styled.div`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  font-family: PangMenZhengDao;
  padding: ${ isMobile ? '16px' : '24px' };
  font-size: ${ isMobile ? '16px' : '24px' };
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const Tab = styled.div`
  padding: ${ isMobile ? '0 16px' : '0 24px' };
`;

const TabCon = styled.div`
  width: 100%;
  display: flex;
  border: 1px solid ${(props) => props.isdark === 'dark' ? '#062E4B' : '#E7F0F7'};
  border-radius: 8px;
`;

const TabBtn = styled.div`
  cursor: pointer;
  height: 42px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-family: PangMenZhengDao;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
  background: ${(props) => props.isdark === 'dark' ? '#062E4B' : '#E7F0F7'};
`;

const HistoryCon = styled.div``;

const History = () => {
  const { theme } = useLocalStorage();

  return (
    <Body isdark={theme}>
      <Title isdark={theme}>History</Title>
      <Tab>
        <TabCon isdark={theme}>
          <TabBtn active="active" isdark={theme}>Token</TabBtn>
        </TabCon>
      </Tab>
      <HistoryCon>
        <Token />
      </HistoryCon>
    </Body>
  )
};

export default History;