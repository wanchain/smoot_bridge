import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import customHistroy from '@/utils/history';
import styled, { css } from 'styled-components';
import { Buffer } from 'buffer';
import SideBar from '@/components/SideBar/index';
import Header from '@/components/Header';
import CrossChain from '@/pages/CrossChain';
import Confirmation from '@/pages/CrossChain/Confirmation';
import BridgingStatus from '@/pages/CrossChain/BridgingStatus';
import History from '@/pages/History/index';
import { useLocalStorage } from '@/context/localstorage';
import bgDark from 'images/bgDark.svg';
import bgLight from 'images/bgLight.svg';
import Wallet, { WalletContext } from '@/utils/Wallet';
import { isMobile } from 'react-device-detect';

const Body = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background-image: url(${(props) => props.isdark === 'dark' ? bgDark : bgLight});
  background-size: cover;
  ${
    isMobile && css`
      background-image: url(${(props) => props.isdark === 'dark' ? bgDark : bgLight});
    `
  }
`;

const Layout = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;

  ${
    isMobile && css`
      width: 100%;
    `
  }
`;

const View = styled.div`
  flex: 1;
  overflow-y: auto;

  ${
    isMobile && css`
      width: 100%;
    `
  }
`;

function App() {
  window.Buffer = window.Buffer || Buffer;
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  const [wallet, setWallet] = useState({});
  const dom = document.getElementById('global-loading');
  if (dom) {
    dom.style.display = 'none';
  }
  return (
    <Body isdark={isdark}>
      <Wallet wallet={wallet} setWallet={setWallet} />
      <WalletContext.Provider value={wallet}>
        <Router history={customHistroy}>
          <SideBar></SideBar>
          <Layout>
            <Header></Header>
            <View isdark={isdark}>
              <Routes>
                <Route element={<CrossChain />} path="/AssetBridge"></Route>
                <Route element={<Confirmation />} path="/AssetBridge/Confirmation"></Route>
                <Route element={<BridgingStatus />} path="/AssetBridge/BridgingStatus"></Route>
                <Route element={<History />} path="/History"></Route>
                <Route path="*" element={<Navigate to={`/AssetBridge${window.location.search}`} />} />
              </Routes>
            </View>
          </Layout>
        </Router>
      </WalletContext.Provider>
    </Body>
  );
}

export default App;
