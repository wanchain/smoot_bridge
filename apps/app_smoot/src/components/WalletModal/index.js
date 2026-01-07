import React, { useMemo, useContext, useState } from "react";
import styled, { css } from 'styled-components';
import Modal from "../Modal";
import { useLocalStorage } from '@/context/localstorage';
import Icon from '@ant-design/icons';
import { ReactComponent as closeIcon } from 'images/icons/close.svg';
import { WalletContext } from '@/utils/Wallet';
import useFormDataModel from "@/models/useFormData";
import AddressSelectModal from "@/components/AddressSelectModal";
import useSDK, { network } from "@/models/useSDK";
import { isMobile } from 'react-device-detect';
import { onlineWalletMap, onlineWalletTypeMap } from "@/utils/walletModalConfig";

const Con = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  max-height: 700px;
`;

const TitleLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.div`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#232323'};
  font-family: PangMenZhengDao;
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const CloseBtn = styled(Icon)`
  width: 24px;
  height: 24px;
  cursor: pointer;

  svg {
    width: 24px;
    height: 24px;
    color: ${(props) => props.isdark === 'dark' ? '#8398A8' : '#999999'};
  }
`;

const WalletCon = styled.div`
  // display: flex;
  // justify-content: space-between;
  overflow-y: scroll;
`;

const ClassCon = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  width: ${ isMobile ? 'calc(100% - 32px - 2px)' : '458px'};
  max-width: ${ isMobile ? 'calc(100% - 32px - 2px)' : '458px'};
  border-radius: 12px;
  border: 1px solid ${(props) => props.isdark === 'dark' ? '#112B3D' : 'rgba(0, 0, 0, 0.05)'};
  margin-bottom: 16px;
`;

const WalletTitle = styled.div`
  color: ${(props) => props.isdark === 'dark' ? '#556874' : '#999999'};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 8px;
`;

const ScrollCon = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: auto;

  ${
    isMobile && css`
      justify-content: space-between;
    `
  }  
`;

const Item = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 12px;
  background: ${(props) => props.isdark === 'dark' ? '#05273F' : '#F7F7F8'};
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  text-align: center;
  cursor: pointer;
  margin-top: ${ isMobile ? '4px' : '12px'};
  margin-right: ${ isMobile ? '4px' : '12px'};
  display: ${(props) => props.hide === 'true' ? 'none' : 'block'};

  ${
    !isMobile && css`
      &:first-child {
        margin-top: 0;
      }
    
      &:nth-child(2) {
        margin-top: 0;
      }
    
      &:nth-child(3) {
        margin-top: 0;
      }
    
      &:nth-child(3n + 3) {
        margin-right: 0;
      }
    `
  }

  ${
    isMobile && css`
      width: calc(50% - 6px);
    `
  }


  &:hover {
    background: ${(props) => props.isdark === 'dark' ? '#0F68AA' : '#0F68AA'};
    color: #FFF;
  }
`;

const WalletNameLine = styled.div`
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  ${
    (props) => props.walletName === 'One-Time Address' && css`
      font-size: 12px;
      line-height: 16px;
    `
  }
`;

const IconLine = styled.div`
  padding-top: 24px;
  margin-bottom: 12px;
  diplay: flex;
  justify-content: center;
`;

const WalletIconImg = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
`;

const walletArr = onlineWalletMap;

const walletTypeArr = onlineWalletTypeMap;

const WalletModal = (props) => {
  const {
    direction,
    type,
    showModal,
    closeModal
  } = props;
  const { theme } = useLocalStorage();
  const wallet = useContext(WalletContext);
  const connected = wallet.connected;
  const isdark = useMemo(() => {
    return theme;
  }, [theme]);
  const { bridge } = useSDK();
  const tokenData = useFormDataModel();
  const [showAddressSelectModal, setShowAddressSelectModal] = useState(false);

  const connectWallet = async (info) => {
    const { walletName } = info;
    closeModal();
    const data = tokenData.data;
    let chain = data[direction];
    if (
      ['Noble', 'Cosmos', 'Kava'].includes(chain) ||
      (!chain && walletName === 'keplr')
    ) {
      const chainInfo = await bridge.getChainInfo(chain || 'Noble');
      chain = chainInfo.chainId;
      // chainInfo && wallet.wallet.setChainId(chainInfo.chainId);
    }
    if (!chain && walletName === 'polkadot') {
      chain = 'Polkadot';
    }
    if (!connected) {
      await wallet.connect(walletName, direction, chain); 
    } else {
      // if (direction === 'from') {
      //   await wallet.resetApp();
      // }
      await wallet.connect(walletName, direction, chain);
    }
    if (direction === 'to' && type !== 'evm') {
      setShowAddressSelectModal(true);
    }
  }

  const walletFilterArr = useMemo(() => {
    if (type) {
      const filterMap = new Map();
      type.forEach(typeName => {
        const filterStr = walletTypeArr.get(typeName);
        if (filterStr) filterMap.set(filterStr, walletArr.get(filterStr));
      });
      return filterMap;
    } else {
      return walletArr;
    }
  }, [type]);

  return (
    <>
      <Modal visible={showModal} cancel={closeModal} size="sm">
        <Con>
          <TitleLine>
            <Title isdark={isdark}>Connect Wallet</Title>
            <CloseBtn onClick={() => {
              closeModal()
            }} isdark={isdark} component={closeIcon}></CloseBtn>
          </TitleLine>
          <WalletCon>
            {
              Array.from(walletFilterArr).map((arr, i) => (
                <ClassCon isdark={isdark} key={i}>
                  <WalletTitle isdark={isdark}>{arr[0]}</WalletTitle>
                  <ScrollCon>
                    {
                      arr[1].map((item, index) => (
                        <Item hide={String(direction === 'to' && item.name === 'One-Time Address')} isdark={isdark} key={index} onClick={() => {
                          if (!type) {
                            tokenData.reset();
                            wallet.resetToWallet();
                          }
                          connectWallet(item);
                        }}>
                          <IconLine>
                            <WalletIconImg src={item.icon}></WalletIconImg>
                          </IconLine>
                          <WalletNameLine walletName={item.name}>{item.name}</WalletNameLine>
                        </Item>
                      ))
                    }
                  </ScrollCon>
                </ClassCon>
              ))
            }
          </WalletCon>
        </Con>
      </Modal>
      <AddressSelectModal
        type={'to'}
        showModal={showAddressSelectModal}
        closeModal={() => setShowAddressSelectModal(false)}
        confirm={(addr) => {
          tokenData.modify({
            toAddress: addr
          });
        }}
      ></AddressSelectModal>
    </>
  )
};

export default WalletModal;