import React, { useCallback, useMemo, useEffect, useState } from "react";
import styled, { keyframes, css } from 'styled-components';
import { notification } from 'antd';
import { useLocalStorage } from '@/context/localstorage';
import useSDK, { network } from "@/models/useSDK";
import './index.scss';
import Icon from '@ant-design/icons';
import { ReactComponent as closeIcon } from 'images/icons/close.svg';
import { isMobile } from 'react-device-detect';

const durationTime = 5;

const TransactionNotification = () => {
  const [subscribeList, setSubscribeList] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const {
    currentTaskId,
    subscribe2,
    getHistory,
    bridge
  } = useSDK();

  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);

  const openNotification = useCallback((status, txt, hash, chain) => {
    api.open({
      message: <Message isdark={isdark} status={status}>{status}</Message>,
      description: <div>
        <Description isdark={isdark}>{txt}</Description>
        { hash && <HashTxt isdark={isdark} onClick={async () => {

          let path;
          const chainInfo = await bridge.getChainInfo(chain);
          const link = chainInfo.explorer;
          path = `${link}/tx/${hash}`;
          window.open(path)
        }}>{hash}</HashTxt>}
      </div>,
      duration: durationTime,
      // style: {background: isdark === 'dark' ? '#042033' : '#fff', borderRadius: '12px'},
      style: isMobile ? {width: 'calc(100vw - 40px)', maxWidth: 'calc(100vw - 40px)'} : {},
      placement: isMobile ? 'top' : 'topRight',
      closeIcon: <CloseBtn isdark={isdark} component={closeIcon}></CloseBtn>,
      btn: <Countdown>
        <CountdownItem></CountdownItem>
      </Countdown>,
    });
  },[api, bridge, isdark]);

  useEffect(() => {
    if (subscribeList.includes(currentTaskId)) return;
    const arr = JSON.parse(JSON.stringify(subscribeList));
    arr.push(currentTaskId);
    setSubscribeList(arr);
    subscribe2(currentTaskId, (type, ret) => {
      const list = getHistory({
        taskId: ret.taskId
      });
      const item = list[0];
      // Tx sent successfully.
      if (type === 'lock' && ret) {
        openNotification('Process 1/2', 'You have initiated a cross-chain transaction.', item.lockHash, item.fromChain);
      } else if (type === 'locked' && ret) {
        openNotification('Process 2/2', 'Your cross-chain transaction has been recorded on the blockchain, please be patient.', item.lockHash, item.fromChain);
      } else if (type === 'redeem' && ret) {
        openNotification('Success', 'Your cross-chain transaction has succeeded.', item.lockHash, item.fromChain);
      } else if (type === 'error' && ret) {
        const reason = ret.reason;
        let type, message;
        if (reason === 'Rejected') {
          type = 'Cancel';
          message = 'Cancel';
        } else {
          type = 'Fail';
          message = 'Your cross-chain transaction has failed.';
        }
        openNotification(type, message, item.lockHash ? item.lockHash : null, item.fromChain);
      } else {
        console.error('unknown error', type, ret);
      }
    })
  }, [currentTaskId, getHistory, openNotification, subscribe2, subscribeList])

  return (
    <>
      {contextHolder}
      {/* <div onClick={() =>  openNotification('Process 1/2', 'You have initiated a cross-chain transaction.', '0x86983b4cad7a526b7e3a79a19e8ed7d10e0b8544562e0fa86a6351b29d391f69', 'Ethereum')}>dfdfdf</div> */}
    </>
  )
};

export default TransactionNotification;

const Countdown = styled.div`
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
`;

const Animation = keyframes`
  0% { left: 0; }
  100% { left: -100%; }
`;

const CountdownItem = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  bottom: 0;
  left: -100%;
  animation: ${durationTime}s ${Animation};
  background: #0F68AA;
`;

const Message = styled.div`
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;

  ${
    (props) => props.status === 'Process 1/2' && css`
      color: ${(props) => props.isdark === 'dark' ? '#0F68AA' : '#0F68AA'};
    `
  }

  ${
    (props) => props.status === 'Process 2/2' && css`
      color: ${(props) => props.isdark === 'dark' ? '#0F68AA' : '#0F68AA'};
    `
  }

  ${
    (props) => props.status === 'Success' && css`
      color: ${(props) => props.isdark === 'dark' ? '#33BA59' : '#33BA59'};
    `
  }

  ${
    (props) => props.status === 'Timeout' && css`
      color: ${(props) => props.isdark === 'dark' ? '#666' : '#666'};
    `
  }

  ${
    (props) => props.status === 'Cancel' && css`
      color: ${(props) => props.isdark === 'dark' ? '#F4982F' : '#F4982F'};
    `
  }

  ${
    (props) => props.status === 'Error' && css`
      color: ${(props) => props.isdark === 'dark' ? '#AB43B4' : '#AB43B4'};
    `
  }

  ${
    (props) => props.status === 'Fail' && css`
      color: ${(props) => props.isdark === 'dark' ? '#CA5151' : '#CA5151'};
    `
  }
`;

const Description = styled.div`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const HashTxt = styled(Description)`
  cursor: pointer;
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
  font-style: italic;
  text-decoration-line: underline;
`;

const CloseBtn = styled(Icon)`
  width: 20px;
  height: 20px;

  svg {
    width: 20px;
    height: 20px;
    color: ${(props) => props.isdark === 'dark' ? '#8398A8' : '#999999'};
  }

  &:hover {
    svg {
      color: ${(props) => props.isdark === 'dark' ? '#fff' : '#333'};
    }
  }
`;