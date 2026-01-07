import React, { useMemo } from "react";
import styled from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';
import Icon from '@ant-design/icons';
import { ReactComponent as copyIcon } from 'images/icons/copy.svg';
import { copy } from '@/utils/utils';

const CopyOutlined = styled(Icon)`
  width: ${(props) => props.size ? props.size : '18'}px;
  height: ${(props) => props.size ? props.size : '18'}px;
  background: ${(props) => props.bg ? props.bg : props.isdark === 'dark' ? '#093758' : '#EBEEF1'};
  border-radius: ${(props) => props.radius ? props.radius : '50%'};
  cursor: pointer;

  svg {
    width: ${(props) => props.size ? props.size : '18'}px;
    height: ${(props) => props.size ? props.size : '18'}px;
    color: ${(props) => props.color ? props.color : props.isdark === 'dark' ? '#2FBDF4' : '#666'};
  }

  &:hover {
    background: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
    
    svg {
      color: #fff;
    }
  }
`;

const CopyBtn = (props) => {
  const {
    size,
    radius,
    bg,
    color,
    text
  } = props;

  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  return (
    <CopyOutlined
      isdark={isdark}
      size={size}
      bg={bg}
      color={color}
      radius={radius}
      component={copyIcon}
      onClick={(e) => {
        e.stopPropagation();
        copy(text);
      }}
    ></CopyOutlined>
  )
};

export default CopyBtn;