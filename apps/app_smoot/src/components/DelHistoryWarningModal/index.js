import React, { useMemo } from "react";
import styled from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';
import Modal from "../Modal";
import Icon from '@ant-design/icons';
import { ReactComponent as closeIcon } from 'images/icons/close.svg';
import { ReactComponent as infoIcon } from 'images/icons/info.svg';

const DelHistoryWarningModal = (props) => {
  const { onClose, showModal, onConfirm } = props;
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  return (
    <Modal visible={showModal} cancel={onClose} size="xs">
      <Con>
        <TopLine>
          <CloseBtn onClick={() => {
            onClose()
          }} isdark={isdark} component={closeIcon}></CloseBtn>
        </TopLine>
        <InfoLogo component={infoIcon}></InfoLogo>
        <TxtCon isdark={isdark}>Do you want to delete the selected historical cross-chain transactions?</TxtCon>
        <BtnGroup>
          <CancelBtn isdark={isdark} onClick={onClose}>Cancel</CancelBtn>
          <ConfirmBtn onClick={onConfirm}>Confirm</ConfirmBtn>
        </BtnGroup>
      </Con>
    </Modal>
  )
}

export default DelHistoryWarningModal;

const ConfirmBtn = styled.div`
  height: 60px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #FFF;
  text-align: center;
  font-family: PangMenZhengDao;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  border-radius: 12px;
  background: #0F68AA;
  flex: 1;
`;

const CancelBtn = styled(ConfirmBtn)`
  margin-right: 6px;
  background: #${(props) => props.isdark === 'dark' ? '05253B' : 'F7F7F8'};
  color: #${(props) => props.isdark === 'dark' ? '818D96' : '999999'};
`;

const PaddingCon = styled.div`
  padding: 0 24px;
`;

const BtnGroup = styled(PaddingCon)`
  display: flex;
  justify-content: space-between;
`;

const TxtCon = styled(PaddingCon)`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  text-align: center;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  margin-bottom: 24px;
`;

const InfoLogo = styled(Icon)`
  width: 140px;
  height: 140px;
  margin: 0 auto 20px;
  display: block;

  svg {
    width: 140px;
    height: 140px;
    color: #CA5151;
  }
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

const TopLine = styled(PaddingCon)`
  display: flex;
  flex-direction: row-reverse;
`;

const Con = styled.div`
  padding: 24px 0;
`;