import React from 'react';
import { useRef, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';
import { Modal } from 'antd';
import './index.scss';
import { isMobile } from 'react-device-detect';

const Con = styled.div`
  background-color: ${(props) => props.isdark === 'dark' ? '#042033' : '#FFF'};
  border-radius: 12px;
  transform-origin: 0 0;
  max-height: 100vh;
  overflow-y: auto;

  ${
    (props) => props.size === 'xxl' && css`
      width: 1520px;
      max-width: 1520px;
    `
  }

  ${
    (props) => props.size === 'l' && css`
      width: 892px;
      max-width: 892px;
    `
  }

  ${
    (props) => props.size === 'm' && css`
      width: 686px;
      max-width: 686px;
    `
  }

  ${
    (props) => props.size === 'sm' && css`
      width: 550px;
      max-width: 550px;
    `
  }

  ${
    (props) => props.size === 'xsm' && css`
      width: 500px;
      max-width: 500px;
    `
  }

  ${
    (props) => props.size === 's' && css`
      width: 480px;
      max-width: 480px;
    `
  }

  ${
    (props) => props.size === 'xs' && css`
      width: 448px;
      max-width: 448px;
    `
  }
`;

const width = {
  xs: '448px',
  s: '480px',
  xsm: '500px',
  sm: '550px',
  m: '686px',
  l: '892px',
  xxl: '1520px'
}

const ModalBody = (props) => {
  const { size, children, cancel, visible } = props;
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  const conRef = useRef(null);

  return (
    <Modal
      open={visible}
      centered={isMobile ? false : true}
      onCancel={cancel}
      closeIcon={false}
      footer={null}
      width={isMobile ? '100%' : width[size]}
      wrapClassName={isMobile && 'react-modal-design'}
    >
      <Con
        ref={conRef}
        size={isMobile ? '100%' : size ? size : 'm'}
        isdark={isdark}
      >
        {children}
      </Con>
    </Modal>
  );
};

export default ModalBody;
