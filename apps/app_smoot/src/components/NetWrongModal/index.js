import React, { useMemo } from "react";
import styled, { css } from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';
import Modal from "../Modal";
import Icon from '@ant-design/icons';
import { ReactComponent as infoIcon } from 'images/icons/info.svg';

const NetWrongModal = (props) => {
  const { onClose, showModal, onConfirm, type } = props;
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);

  const TitleTxt = useMemo(() => {
    switch (type) {
      case 'networkWrong':
        return 'Network Instability Detected';
      case 'overspending':
        return 'UTXO Consolidation Required';
      default:
        return 'Network Instability Detected';
    }
  }, [type]);

  const descriptionTxt = useMemo(() => {
    switch (type) {
      case 'networkWrong':
        return "We've detected that the connection to the Cardano network is currently unstable. Please be patient and try your transaction again in a few moments.";
      case 'overspending':
        return 'Your Cardano wallet contains too many UTXOs, which may prevent the transaction from completing. Please consolidate your UTXOs before proceeding.';
      default:
        return "We've detected that the connection to the Cardano network is currently unstable. Please be patient and try your transaction again in a few moments.";
    }
  }, [type])

  const handleConfirm = () => {
    onConfirm();
  }
  return (
    <Modal visible={showModal} cancel={onClose} size="xs">
      <Con>
        <TopLine>
          <Title isdark={isdark}>{TitleTxt}</Title>
        </TopLine>
        <InfoLogo component={infoIcon}></InfoLogo>
        <TxtCon isdark={isdark}>{descriptionTxt}</TxtCon>
        <PaddingCon>
          <ConfirmBtn isdark={isdark} onClick={() => handleConfirm()}>Got it. Try again later.</ConfirmBtn>
        </PaddingCon>
      </Con>
    </Modal>
  )
}

export default NetWrongModal;

const ConfirmBtn = styled.div`
  height: 60px;
  cursor: ${(props) => props.disabled ? 'no-drop' : 'pointer'};
  display: flex;
  justify-content: center;
  align-items: center;
  color: #${(props) => props.disabled ? '999' : 'FFF'};
  text-align: center;
  font-family: PangMenZhengDao;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  border-radius: 12px;

  ${
    (props) => props.disabled ? css`
      background: #${(props) => props.isdark === 'dark' ? '1E3B4F' : 'F7F7F8'};
    ` : css`
      background: #${(props) => props.isdark === 'dark' ? '0F68AA' : '0F68AA'};
    `
  }
`;

const PaddingCon = styled.div`
  padding: 0 24px;
`;

const TxtCon = styled(PaddingCon)`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#666'};
  text-align: center;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  margin-bottom: 40px;
`;

const InfoLogo = styled(Icon)`
  width: 180px;
  height: 180px;
  margin: 0 auto 34px;
  display: block;

  svg {
    width: 180px;
    height: 180px;
    color: #CA5151;
  }
`;

const Title = styled.p`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#232323'};
  font-family: PangMenZhengDao;
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const TopLine = styled(PaddingCon)`
  display: flex;
  // justify-content: space-between;
  justify-content: center;
  margin-bottom: 12px;
`;

const Con = styled.div`
  padding: 24px 0;
`;