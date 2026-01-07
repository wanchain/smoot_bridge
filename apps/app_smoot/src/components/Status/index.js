import React, { useMemo } from "react";
import styled from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';
import Icon from '@ant-design/icons';
import { ReactComponent as failIcon } from 'images/icons/fail.svg';
import { ReactComponent as progressIcon } from 'images/icons/progress.svg';
import { ReactComponent as sucessIcon } from 'images/icons/sucess.svg';
import { ReactComponent as timeoutIcon } from 'images/icons/timeout.svg';
import { ReactComponent as cancelIcon } from 'images/icons/cancel.svg';
import { ReactComponent as errorIcon } from 'images/icons/error.svg';

const TdCon = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
`;

const StatusIcon = styled(Icon)`
  width: 18px;
  height: 18px;
  margin: ${(props) => props.reverse === 'reverse' ? '0 0 0 8px' : '0 8px 0 0'};

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ReverseCon = styled.span`
  display: flex;
  align-items: center;
  flex-direction: ${(props) => props.reverse === 'reverse' ? 'row-reverse' : 'row'};
`;

const FaileStatus = styled(ReverseCon)`
  color: ${(props) => props.isdark === 'dark' ? '#CA5151' : '#CA5151'};
`;

const FaileIcon = styled(StatusIcon)`
  color: ${(props) => props.isdark === 'dark' ? '#CA5151' : '#CA5151'};
`;

const ProgressStatus = styled(ReverseCon)`
  color: ${(props) => props.isdark === 'dark' ? '#0F68AA' : '#0F68AA'};
`;

const ProgressIcon = styled(StatusIcon)`
  color: ${(props) => props.isdark === 'dark' ? '#0F68AA' : '#0F68AA'};
`;

const SucessStatus = styled(ReverseCon)`
  color: ${(props) => props.isdark === 'dark' ? '#33BA59' : '#33BA59'};
`;

const SucessIcon = styled(StatusIcon)`
  color: ${(props) => props.isdark === 'dark' ? '#33BA59' : '#33BA59'};
`;

const TimeoutStatus = styled(ReverseCon)`
  color: ${(props) => props.isdark === 'dark' ? '#666' : '#666'};
`;

const TimeoutIcon = styled(StatusIcon)`
  color: ${(props) => props.isdark === 'dark' ? '#666' : '#666'};
`;

const CancelStatus = styled(ReverseCon)`
  color: ${(props) => props.isdark === 'dark' ? '#F4982F' : '#F4982F'};
`;

const CancelIcon = styled(StatusIcon)`
  color: ${(props) => props.isdark === 'dark' ? '#F4982F' : '#F4982F'};
`;

const ErrorStatus = styled(ReverseCon)`
  color: ${(props) => props.isdark === 'dark' ? '#AB43B4' : '#AB43B4'};
`;

const ErrorIcon = styled(StatusIcon)`
  color: ${(props) => props.isdark === 'dark' ? '#AB43B4' : '#AB43B4'};
`;

const Status = (props) => {
  const {
    status,
    reverse
  } = props;
  const { theme } = useLocalStorage();
  const statusText = useMemo(() => {
    switch(status) {
      case 'Failed':
        return 'Failed';
      case 'Performing':
        return 'In Progress 1/2';
      case 'Converting':
        return 'In Progress 2/2';
      case 'Succeeded':
        return 'Success';
      case 'Timeout':
        return 'Timeout';
      case 'Rejected':
        return 'Cancel';
      case 'Error':
        return 'Error';
      default:
        return 'Success';
    }
  }, [status])
  return (
    <TdCon>
      { status === 'Failed' && (
        <FaileStatus reverse={reverse} isdark={theme}>
          <FaileIcon isdark={theme} component={failIcon} reverse={reverse}></FaileIcon>{statusText}
        </FaileStatus>
      ) }
      { status === 'Performing' && (
         <ProgressStatus reverse={reverse} isdark={theme}>
          <ProgressIcon reverse={reverse} isdark={theme} component={progressIcon}></ProgressIcon>{statusText}
         </ProgressStatus>
      ) }
      { status === 'Converting' && (
        <ProgressStatus reverse={reverse} isdark={theme}>
          <ProgressIcon reverse={reverse} isdark={theme} component={progressIcon}></ProgressIcon>{statusText}
        </ProgressStatus>
      ) }
      { status === 'Succeeded' && (
        <SucessStatus reverse={reverse} isdark={theme}>
          <SucessIcon reverse={reverse} isdark={theme} component={sucessIcon}></SucessIcon>{statusText}
        </SucessStatus>
      ) }
      { status === 'Timeout' && (
        <TimeoutStatus reverse={reverse} isdark={theme}>
          <TimeoutIcon reverse={reverse} isdark={theme} component={timeoutIcon}></TimeoutIcon>{statusText}
        </TimeoutStatus>
      ) }
      { status === 'Rejected' && (
        <CancelStatus reverse={reverse} isdark={theme}>
          <CancelIcon reverse={reverse} isdark={theme} component={cancelIcon}></CancelIcon>{statusText}
        </CancelStatus>
      ) }
      { status === 'Error' && (
        <ErrorStatus reverse={reverse} isdark={theme}>
          <ErrorIcon reverse={reverse} isdark={theme} component={errorIcon}></ErrorIcon>{statusText}
        </ErrorStatus>
      ) }
    </TdCon>
  )
}

export default Status;