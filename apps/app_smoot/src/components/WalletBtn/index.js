import { useMemo, useState, useContext, useEffect } from "react";
import styled, { css } from 'styled-components';
import { useLocalStorage } from '../../context/localstorage';
import { ReactComponent as walletIcon } from 'images/icons/wallet.svg';
import { ReactComponent as changeAccountIcon } from 'images/icons/changeAccount.svg';
import { ReactComponent as escIcon } from 'images/icons/esc.svg';
import Icon from '@ant-design/icons';
import WalletModal from '../WalletModal';
import { WalletContext } from '@/utils/Wallet';
import useFormDataModel from "@/models/useFormData";
import { clipString } from '@/utils/utils';
import CopyBtn from "../CopyBtn";
import useSDK from "@/models/useSDK";

const FlexBody = styled.div`
  display: flex;
`;

const Body = styled.div`
  display: flex;
  width: 148px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #FFF;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  background: ${(props) => props.isdark === 'dark' ? '#0F68AA' : '#0F68AA'};
  cursor: pointer;
  position: relative;
  z-index: 5;

  ${
    (props) => props.connected === 'true' && css`
      &:hover .WalletDisconnectCon {
        height: fit-content;
        overflow: unset;
        padding-top: 12px;
        transition: 0.3s all ease;
      }
    `
  }
`;

const WalletIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  margin-right: 8px;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const WalletImg = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 8px;
`;

const WalletDisconnectBody = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  padding-top: 0;
  transform: translateY(100%);
  height: 0;
  overflow: hidden;
  z-index: 1;
`;

const WalletDisconnectCon = styled.div`
  padding: 8px;
  border-radius: 8px;
  background: ${(props) => props.isdark === 'dark' ? '#042033' : '#fff' };

  ${
    (props) => props.isdark !== 'dark' &&  css`
      box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.10);
    `
  }
`;

const AccountInfo = styled.div`
  width: 182px;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  background: ${(props) => props.isdark === 'dark' ? '#05253B' : '#F7F7F8' };
  align-items: center;
  border-radius: 8px;
`;

const AccountInfoLeftCon = styled.div`
  flex: 1;
`;

const AccountInfoLeftConTitle = styled.p`
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#A6A6A6' };
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 4px;
`;

const AccountInfoLeftConTxt = styled.p`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333' };
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const ChangeAccountItem = styled.div`
  padding: 8px 12px;
  display: flex;
  background: ${(props) => props.isdark === 'dark' ? '#0B334F' : '#ECF1F5' };
  align-items: center;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
`;

const ChangeIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  margin-right: 4px;

  svg {
    color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA' };
    width: 20px;
    height: 20px;
  }
`;

const ChangeTxt = styled.p`
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA' };
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const DisconnectItem = styled(ChangeAccountItem)`
  background: ${(props) => props.isdark === 'dark' ? '#432222' : '#F5ECEC' };
  margin-bottom: 0;
`;

const EscIcon = styled(ChangeIcon)`
  svg {
    color: ${(props) => props.isdark === 'dark' ? '#E36A6A' : '#E36A6A' };
  }
`;

const EscTxt = styled(ChangeTxt)`
  color: ${(props) => props.isdark === 'dark' ? '#E36A6A' : '#E36A6A' };
`;

const Line = styled.div`
  height: 1px;
  width: 100%;
  background: ${(props) => props.isdark === 'dark' ? '#1d3647' : '#eee' };
  margin: 8px 0;
`;

const WalletBtn = () => {
  const { theme } = useLocalStorage();
  const { modify } = useFormDataModel();
  const wallet = useContext(WalletContext);
  const {
    connected,
    address,
    curAddress,
  } = wallet;
  const addr = useMemo(() => {
    return curAddress ? curAddress : address;
  }, [curAddress, address])
  const isdark = useMemo(() => {
    return theme;
  }, [theme]);
  const [showModal, setShowModal] = useState(false);
  const { loading, bridge } = useSDK();
  const handleModal = () => {
    setShowModal(!showModal);
  }

  const EscFn = (e) => {
    e.stopPropagation();
    wallet.resetApp();
  }

  useEffect(() => {
    const connectWallet = async () => {
      const lastConnectWalletName = window.localStorage.getItem('fromConnectWallet');
      let chain = window.localStorage.getItem('fromConnectWalletChain');;
      if (lastConnectWalletName) {
        await wallet.connect(lastConnectWalletName, 'from', chain, true);
      }
    }
    !loading && !connected && connectWallet();
  }, [bridge, connected, loading, wallet]);

  useEffect(() => {
    if (connected && address) {
      modify({
        fromAddress: address
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, address]);
  
  return (
    <>
      <FlexBody>
        <Body connected={String(Boolean(connected))} isdark={isdark} onClick={handleModal}>
          {
            connected ? (
              <WalletImg src={wallet.getLogo()}></WalletImg>
            ) : (
              <WalletIcon component={walletIcon}></WalletIcon>
            )
          }
          { connected ? clipString(addr, 8) : 'Connect Wallet' }
          <WalletDisconnectBody className="WalletDisconnectCon" onClick={(e) =>  e.stopPropagation()}>
            <WalletDisconnectCon isdark={isdark}>
              <AccountInfo isdark={isdark}>
                <AccountInfoLeftCon>
                  <AccountInfoLeftConTitle isdark={isdark}>Connected</AccountInfoLeftConTitle>
                  <AccountInfoLeftConTxt isdark={isdark}>{clipString(addr, 12)}</AccountInfoLeftConTxt>
                </AccountInfoLeftCon>
                <CopyBtn
                  radius={'6px'}
                  size={'34'}
                  text={addr}
                  bg={isdark === 'dark' ? '#0C324E' : '#EBEBEB'}
                  color={isdark === 'dark' ? '#fff' : '#333333'}
                ></CopyBtn>
              </AccountInfo>
              <Line isdark={isdark}></Line>
              <ChangeAccountItem isdark={isdark} onClick={handleModal}>
                <ChangeIcon isdark={isdark} component={changeAccountIcon}></ChangeIcon>
                <ChangeTxt isdark={isdark}>Change</ChangeTxt>
              </ChangeAccountItem>
              <DisconnectItem isdark={isdark} onClick={EscFn}>
                <EscIcon isdark={isdark} component={escIcon}></EscIcon>
                <EscTxt isdark={isdark}>Disconnect Wallet</EscTxt>
              </DisconnectItem>
            </WalletDisconnectCon>
          </WalletDisconnectBody>
        </Body>
      </FlexBody>
      <WalletModal
        direction={'from'}
        showModal={showModal}
        closeModal={() => setShowModal(false)}
      ></WalletModal>
    </>
  )
};

export default WalletBtn;