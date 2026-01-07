import React, { useMemo } from "react";
import styled from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';
import Modal from "../Modal";
import Icon from '@ant-design/icons';
import { ReactComponent as closeIcon } from 'images/icons/close.svg';
import { ReactComponent as infoIcon } from 'images/icons/info.svg';

const RecipientWarningModal = (props) => {
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
        <TxtCon isdark={isdark}>I confirm that the recipient address is&nbsp;<ImportantText isdark={isdark}>NOT</ImportantText>&nbsp;an&nbsp;<ImportantText isdark={isdark}>exchange address</ImportantText>, and I understand that funds may be lost if I use an exchange address.</TxtCon>
        <PaddingCon>
          <ConfirmBtn onClick={onConfirm}>Confirm</ConfirmBtn>
        </PaddingCon>
      </Con>
    </Modal>
  )
}

export default RecipientWarningModal;

const ImportantText = styled.span`
  color: #${(props) => props.isdark === 'dark' ? '2FBDF4' : '0F68AA'};
`;

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
`;

const PaddingCon = styled.div`
  padding: 0 24px;
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