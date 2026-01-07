import React, { useMemo } from 'react';
import pageLoadingDeep from 'images/modalLoadingDeep.webp';
import pageLoadingLight from 'images/modalLoadingLight.webp';
import styled from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';

const ModalLoading = () => {
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => {
    return theme;
  }, [theme]);
  return (
    <Body>
      <Loading src={isdark === 'dark' ? pageLoadingDeep : pageLoadingLight}></Loading>
    </Body>
  )
}

export default ModalLoading;

const Body = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Loading = styled.img`
  width: auto;
`;