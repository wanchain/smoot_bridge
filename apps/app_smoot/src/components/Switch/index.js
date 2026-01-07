import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import { useLocalStorage } from '../../context/localstorage';
import Icon from '@ant-design/icons';
import { ReactComponent as moonIcon } from 'images/icons/moon.svg';
import { ReactComponent as sunIcon } from 'images/icons/sun.svg';
import { isMobile } from 'react-device-detect';

const Switch = () => {
  const { theme, setTheme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  const handleToggleTheme = (checked) => {
    const body_tag = document.body;
    if (isdark === 'dark') {
      setTheme('light');
      body_tag.setAttribute('id', 'light');
    } else {
      setTheme('dark');
      body_tag.setAttribute('id', 'dark');
    }
  };
  return (
    <Con>
      <SwitchBody isdark={isdark} onClick={handleToggleTheme}>
        <SwitchItem isdark={isdark} type='sun'>
          <IconCon isdark={isdark} type='sun' component={sunIcon} />
        </SwitchItem>
        <SwitchItem isdark={isdark} type={isdark === 'dark' ? 'moon' : 'sun'}>
          <IconCon isdark={isdark} type={isdark === 'dark' ? 'moon' : 'sun'} component={isdark === 'dark' ? moonIcon : sunIcon} />
        </SwitchItem>
        <SwitchItem isdark={isdark} type='moon'>
          <IconCon isdark={isdark} type='moon' component={moonIcon} />
        </SwitchItem>
      </SwitchBody>
    </Con>
  )
}

export default Switch;

const Con = styled.div`
  width: 72px;
  height: 36px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  margin-right: 16px;

  ${
    isMobile && css`
      margin-right: 0;
      width: calc(100vw - 48px);
    `
  }
`;

const SwitchBody = styled.div`
  width: 108px;
  height: 36px;
  border-radius: 8px;
  transition: 0.12s transform ease;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(${(props) => props.isdark === 'dark' ? '0' : '-36px'});
  cursor: pointer;
  background: ${(props) => props.isdark === 'dark' ? '#1B262D' : '#ffffff'};

  ${
    isMobile && css`
      width: calc(100vw / 2 * 3 - 48px / 2 * 3);
      transform: translateX(${(props) => props.isdark === 'dark' ? '0' : 'calc(24px - 50vw)'});
      background: ${(props) => props.isdark === 'dark' ? '#1B262D' : '#E7F0F7'};
    `
  }
`;

const SwitchItem = styled.div`
  width: 36px;
  height: 36px;
  background: ${(props) => props.isdark === 'dark' ? props.type === 'sun' ? '#1B262D' : '#0F68AA' : props.type === 'sun' ? '#0F68AA' : '#ffffff'};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.isdark === 'dark' ? props.type === 'sun' ? '' : '8px' : props.type === 'sun' ? '8px' : ''};

  ${
    isMobile && css`
      width: calc(50vw - 24px);
      background: ${(props) => props.isdark === 'dark' ? props.type === 'sun' ? '#1B262D' : '#0F68AA' : props.type === 'sun' ? '#0F68AA' : '#E7F0F7'};
    `
  }
`;

const IconCon = styled(Icon)`
  width: 20px;
  height: 20px;

  svg {
    width: 20px;
    height: 20px;
    color: ${(props) => props.isdark === 'dark' ? props.type === 'sun' ? '#495157' : '#ffffff' : props.type === 'sun' ? '#ffffff' : '#BFBFBF'};
  }
`;