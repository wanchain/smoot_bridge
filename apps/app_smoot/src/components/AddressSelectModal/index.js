import React, { useState, useMemo, useEffect, useContext } from "react";
import styled, { css } from 'styled-components';
import Modal from "../Modal";
import { useLocalStorage } from '@/context/localstorage';
import Icon from '@ant-design/icons';
import { ReactComponent as closeIcon } from 'images/icons/close.svg';
import { WalletContext } from '@/utils/Wallet';
import { clipString2 } from '@/utils/utils';
import useFormDataModel from "@/models/useFormData";
import { isMobile } from 'react-device-detect';

const Con = styled.div`
  padding: 0 24px;
  display: flex;
  flex-direction: column;
`;

const TitleLine = styled.div`
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const SearchAddressInp = styled.input`
  display: flex;
  width: ${ isMobile ? 'auto' : '400px'};
  border-radius: 12px;
  border: 1px solid ${(props) => props.isdark === 'dark' ? '#1E3B4F' : '#E7F0F7'};
  background: ${(props) => props.isdark === 'dark' ? '#05253B' : '#F7F7F8'};
  padding: 0 16px;
  height: 60px;
  align-items: center;
  margin-bottom: 16px;
  outline: none;
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  &::placeholder {
    color: ${(props) => props.isdark === 'dark' ? '#556874' : '#556874'};
    font-family: Inter;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
`;

const ListCon = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 390px;
  min-height: 390px;
  height: 390px;
`;

const ListItem = styled.div`
  height: 48px;
  border-radius: 12px;
  background: #${(props) => props.isdark === 'dark' ? '05253B' : 'F7F7F8'};
  padding: 0 18px;
  display: flex;
  align-items: center;
  color: #${(props) => props.isdark === 'dark' ? 'FFF' : '333'};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0);

  &:nth-child(odd) {
    background: #${(props) => props.isdark === 'dark' ? '042033' : 'FFFFFF'};
  }

  &:hover {
    border-color: #${(props) => props.isdark === 'dark' ? '0F68AA' : '0F68AA'} !important;
    background: #${(props) => props.isdark === 'dark' ? '0F68AA' : 'E7F0F7'} !important;
  }

  ${(props) => props.active === 'true' && css`
    border-color: #${(props) => props.isdark === 'dark' ? '0F68AA' : '0F68AA'} !important;
    background: #${(props) => props.isdark === 'dark' ? '0F68AA' : 'E7F0F7'} !important;
  `}
`;

const ConfirmBtn = styled.div`
  cursor: pointer;
  border-radius: 12px;
  background: #0F68AA;
  border-radius: 12px;
  color: #FFF;
  text-align: center;
  font-family: PangMenZhengDao;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  padding: 18px 0;
  margin-bottom: 20px;
`;

const AddressSelectModal = (props) => {
  const {
    showModal,
    closeModal,
    confirm,
    type
  } = props;
  const { data, modify } = useFormDataModel();
  const wallet = useContext(WalletContext);
  const accounts = useMemo(() => wallet.accounts, [wallet.accounts]);
  const toAccounts = wallet.toAccounts;
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => {
    return theme;
  }, [theme]);
  const [filterTxt, setFilterTxt] = useState('');
  const [curAddress, setCurAddress] = useState(data[`${type}Address`]);

  const handleInp = (e) => {
    setFilterTxt(e.target.value);
  }

  useEffect(() => {
    setFilterTxt('');
  }, [showModal]);

  const filterAccounts = useMemo(() => {
    if (type === 'from') {
      if (!Array.isArray(accounts) || accounts.length === 0) return [];
      return accounts.filter(v => v.toLocaleLowerCase().includes(filterTxt.toLocaleLowerCase()));
    } else {
      if (!Array.isArray(toAccounts) || toAccounts.length === 0) return [];
      return toAccounts.filter(v => v.toLocaleLowerCase().includes(filterTxt.toLocaleLowerCase()))
    }
  }, [filterTxt, accounts, type, toAccounts]);

  const selectAddr = (v) => {
    setCurAddress(v);
  }

  useEffect(() => {
    if (showModal) {
      setCurAddress(data[`${type}Address`]);
      setFilterTxt('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal])
  
  return (
    <Modal visible={showModal} cancel={closeModal} size="s">
      <Con>
        <TitleLine>
          <Title isdark={isdark}>Select your Address</Title>
          <CloseBtn onClick={() => {
            closeModal()
          }} isdark={isdark} component={closeIcon}></CloseBtn>
        </TitleLine>
        <SearchAddressInp
          isdark={isdark}
          placeholder="Search address"
          value={filterTxt}
          onClick={e => e.stopPropagation()}
          onChange={e => handleInp(e)}
        ></SearchAddressInp>
        {
          showModal && (
            <ListCon>
              {
                filterAccounts.map((v, i) => (
                  <ListItem
                    isdark={isdark}
                    key={i}
                    active={String(curAddress === v)}
                    onClick={() => {
                      if (v === curAddress) {
                        selectAddr('');
                      } else {
                        selectAddr(v);
                      }
                      
                    }}
                  >{clipString2(v, isMobile ? 12 : 19, isMobile ? 14 : 20)}</ListItem>
                ))
              }
            </ListCon>
          )
        }
        <ConfirmBtn onClick={() => {
          if (curAddress) {
            modify({
              [`${type}Address`]: curAddress
            });
            confirm(curAddress)
          }
          closeModal();
        }}>Confirm</ConfirmBtn>
      </Con>
    </Modal>
  )
};

export default AddressSelectModal;