import React, { useState, useEffect, useMemo } from "react";
import styled, { css } from 'styled-components';
import Icon from '@ant-design/icons';
import { ReactComponent as searchIcon } from 'images/icons/search.svg';
import { useLocalStorage } from '@/context/localstorage';
import { isMobile } from "react-device-detect";

const SearchInp = (props) => {
  const {
    isReset,
    type,
    search,
    placeholderTxt
  } = props;
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  const [inp, setInp] = useState('');
  const [resetNum, setResetNum] = useState(-1);

  useEffect(() => {
    if (isReset !== resetNum) {
      search('');
      setInp('');
      setResetNum(isReset)
    };
  }, [isReset, resetNum, search]);
  return (
    <Body type={type} isdark={isdark}>
      <Input value={inp} placeholder={placeholderTxt} onChange={(e) => {
        const value = e.target.value;
        setInp(value);
        search(value);
      }}></Input>
      <SearchIcon isdark={isdark} className='searchIcon' component={searchIcon}></SearchIcon>
    </Body>
  )
};

export default SearchInp;

const SearchIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#999'};

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Input = styled.input`
  flex: 1;
  padding-right: 8px;
  color: #818D96;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  background: none;
  outline: none;
  border: none;

  &::placeholder {
    color: #818D96;
  }
`;

const Body = styled.div`
  display: flex;
  justify-content: space-between;
  border-radius: 8px;
  align-items: center;
  border: 1px solid ${(props) => props.isdark === 'dark' ? '#1E3B4F' : '#EFEFEF'};
  background: ${(props) => props.isdark === 'dark' ? '#042033' : '#FFF'};
  padding: 0 8px 0 12px;

  &:hover {
    border-color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
  }
  
  &:hover .searchIcon {
    svg {
      color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
    }
  }
`;