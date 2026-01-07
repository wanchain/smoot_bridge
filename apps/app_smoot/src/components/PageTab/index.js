import React from "react";
import styled from 'styled-components';
import { useLocalStorage } from "@/context/localstorage";
import Icon from '@ant-design/icons';
import { ReactComponent as rightIcon } from 'images/icons/right.svg';
import { ReactComponent as leftIcon } from 'images/icons/left.svg';

const TabCon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 46px;
`;

const Btn = styled(Icon)`
  width: 24px;
  height: 24px;
  cursor: pointer;

  svg {
    width: 24px;
    height: 24px;
    color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#999999'};
  }

  &:active svg {
    color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
  }
`;

const PageInfo = styled.div`
  margin: 0 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #818D96;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const CurPageCon = styled.span`
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#333'};
`;

const PageTab = (props) => {
  const {
    curPage,
    totalPage,
    addPage,
    minusPage
  } = props;
  const { theme } = useLocalStorage();
  return (
    <TabCon>
      <Btn component={leftIcon} isdark={theme} onClick={minusPage}></Btn>
      <PageInfo><CurPageCon isdark={theme}>{curPage}</CurPageCon>&nbsp;/&nbsp;{totalPage}</PageInfo>
      <Btn component={rightIcon} isdark={theme} onClick={addPage}></Btn>
    </TabCon>
  )
};

export default PageTab;