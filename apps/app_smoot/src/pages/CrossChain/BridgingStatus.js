import React, { useEffect, useMemo, useState } from "react";
import styled, { css } from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';
import useSDK from "@/models/useSDK";
import useFormDataModel from "@/models/useFormData";
import { useNavigate } from 'react-router-dom';
import assetLoading from 'images/statusAssetsLoading.webp';
import lineLoading from 'images/statusLineLoading.webp';
import BigNumber from "bignumber.js";
import { parseFee, commafy3 } from "../../utils/utils";
import { isMobile } from 'react-device-detect';

const Body = styled.div`
  width: 746px;
  border-radius: 12px;
  padding: 24px;
  background: ${(props) => props.isdark === 'dark' ? '#042033' : '#FFFFFF'};
  margin: 0 auto;

  ${
    isMobile && css`
      width: calc(100vw - 40px - 32px);
      padding: 16px;
      margin-top: 16px;
      margin-bottom: 16px;
    `
  }
`;

const Title = styled.div`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  font-family: PangMenZhengDao;
  font-size: ${ isMobile ? '20px' : '24px'};
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-bottom: ${ isMobile ? '12px' : '24px'};
`;

const Con = styled.div`
  border-radius: 12px;
  background: ${(props) => props.isdark === 'dark' ? '#05253B' : '#F7F7F8'};
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;

  ${
    (props) => props.status === 'error' && css`
    background: ${(props) => props.isdark === 'dark' ? '#3A0909' : '#FBF0F0'};
    `
  }

  ${
    isMobile && css`
      flex-direction: column;
    `
  }
`;

const StatusInfo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${ isMobile ? '24px 16px 20px' : '40px 24px' };
  flex: 1;

  ${
    isMobile && css`
      width: calc(100% - 32px);
    `
  }
`;

const AssetCon = styled.div`
  width: 92px;
  height: 92px;
  position: relative;
`;

const AssetLoading = styled.img`
  width: 92px;
  height: 92px;
  position: absolute;
  top: 0;
  left: 0;
`;

const AssetIcon = styled.img`
  width: 70px;
  height: 70px;
  background: ${(props) => props.isdark === 'dark' ? '#0C324E' : '#EBEEF1'};
  padding: 10px;
  border: 1px dashed #2FBDF4;
  border-radius: 50%;

  ${
    (props) => props.status === 'loading' && css`
      border: none;
    `
  }

  ${
    (props) => props.status === 'redeem' && css`
      border: 1px solid ${(props) => props.isdark === 'dark' ? '#33BA59' : '#0F68AA'};
    `
  }

  ${
    (props) => props.status === 'error' && css`
      border: 1px solid ${(props) => props.isdark === 'dark' ? '#D93737' : '#D93737'};
    `
  }
`;

const BridgeStatusInfoCon = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const LineStatusCon = styled.div`
  width: 100%;
  height: 1px;
  position: relative;
  margin: 16px 0;
`;

const LineLoading = styled.img`
  width: 100%;
  position: absolute;
  top: 50%;
  left: 0;
  transoform: translateY(-50%);
`;

const Line = styled.div`
  width: 100%;
  height: 0px;
  border-bottom: 1px dashed #2FBDF4;

  ${
    (props) => props.status === 'loading' && css`
      border: none;
    `
  }

  ${
    (props) => props.status === 'redeem' && css`
      border-bottom: 1px solid ${(props) => props.isdark === 'dark' ? '#33BA59' : '#0F68AA'};
    `
  }

  ${
    (props) => props.status === 'error' && css`
      border-bottom: 1px solid ${(props) => props.isdark === 'dark' ? '#D93737' : '#D93737'};
    `
  }
`;

const Status = styled.p`
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  ${
    (props) => props.status === 'loading' && css`
      color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
    `
  }

  ${
    (props) => props.status === 'redeem' && css`
      color: ${(props) => props.isdark === 'dark' ? '#33BA59' : '#33BA59'};
    `
  }

  ${
    (props) => props.status === 'error' && css`
      color: ${(props) => props.isdark === 'dark' ? '#D93737' : '#D93737'};
    `
  }

  ${
    isMobile && css`
      text-align: center;
    `
  }
`;

const Amount = styled.p`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  ${
    isMobile && css`
      margin-bottom: 20px;
      text-align: center;
    `
  }
`;

const AmountNum = styled.span`
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
`;

const TextCon = styled.div`
  padding: ${ isMobile ? '16px' : '24px' };
`;

const TextLine = styled.div`
  margin-bottom: ${(props) => props.mb ? '16px' : ''}; 
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  font-family: Inter;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  ${
    (props) => props.status === 'error' && css`
      color: ${(props) => props.isdark === 'dark' ? '#D93737' : '#D93737'};
    `
  }
`;

const HistoryBtn = styled.div`
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#999999'};
  font-family: PangMenZhengDao;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  cursor: pointer;
  background: ${(props) => props.isdark === 'dark' ? '#0F68AA' : '#0F68AA'};
  color: #FFF;
  cursor: pointer;

  &:hover {
    background: ${(props) => props.isdark === 'dark' ? '#0C558A' : '#0C558A'};
  }
`;

const Confirmation = () => {
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  const { reset } = useFormDataModel();
  reset();
  const navigate = useNavigate();
  const {
    subscribe,
    currentTaskId,
    getAssetLogo,
    getHistory
  } = useSDK();

  const info = useMemo(() => {
    const list = getHistory({
      taskId: currentTaskId
    });
    return list[0];
  }, [currentTaskId, getHistory]);
  
  const receiveAmount = useMemo(() => {
    let num = new BigNumber(0);
    if (!info || !info.fee || !info.asset) return num;
    let {
      asset,
      fee
    } = info;
    if (!asset || !fee.networkFee || !fee.operateFee) return num;
    if (['BTC.a', 'wanBTC'].includes(asset)) asset = 'BTC';
    if (asset === fee.networkFee.unit)
      num = num.plus(parseFee(fee, info.amount, 'networkFee', false));
    if (asset === fee.operateFee.unit)
      num = num.plus(parseFee(fee, info.amount, 'operateFee', false));
    const value = new BigNumber(info.amount).minus(num);

    if (value.gt(0)) {
      return value;
    }
    return new BigNumber(0);
  }, [info]);

  const [status, setStatus] = useState('loading');
  
  useEffect(() => {
    if (!currentTaskId) return;
    subscribe(currentTaskId, (type, ret) => {
      // Tx sent successfully.
      if (type === 'lock' && ret) {
        setStatus('loading');
      } else if (type === 'locked' && ret) {
        setStatus('loading');
      } else if (type === 'redeem' && ret) {
        setStatus('redeem');
      } else if (type === 'error' && ret) {
        setStatus('error');
      } else {
        console.log('unknown error', type, ret);
        navigate('/History/Token');
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTaskId]);
  if (!currentTaskId) {
    navigate('/AssetBridge');
    return;
  }
  return (
    <Body isdark={isdark}>
      <Title isdark={isdark}>Bridging Status</Title>
      <Con isdark={isdark}>
        <StatusInfo>
          <AssetCon>
            <AssetIcon status={status} isdark={isdark} src={getAssetLogo(info?.fromChain)}></AssetIcon>
            { status === 'loading' ? <AssetLoading src={assetLoading}></AssetLoading> : null }
          </AssetCon>
          <BridgeStatusInfoCon>
            {
              !isMobile ? (
                <Status isdark={isdark} status={status}>
                  {status === 'loading' ? 'Bridging in progress' : null}
                  {status === 'redeem' ? 'Transaction Complete' : null}
                  {status === 'error' ? 'Transaction Failed' : null}
                </Status>
              ) : null
            }
            <LineStatusCon>
              <Line isdark={isdark} status={status}></Line>
              { status === 'loading' ? <LineLoading src={lineLoading}></LineLoading> : null }
            </LineStatusCon>
            {
              !isMobile ? (
                <Amount isdark={isdark}><AmountNum isdark={isdark}>{commafy3(receiveAmount.toString(), info?.asset)}</AmountNum>&nbsp;{info?.toSymbol}</Amount>
              ) : null
            }
          </BridgeStatusInfoCon>
          <AssetIcon status={status} isdark={isdark} src={getAssetLogo(info?.toChain)}></AssetIcon>
        </StatusInfo>
        {
          isMobile ? (
            <Status isdark={isdark} status={status}>
              {status === 'loading' ? 'Bridging in progress' : null}
              {status === 'redeem' ? 'Transaction Complete' : null}
              {status === 'error' ? 'Transaction Failed' : null}
            </Status>
          ) : null
        }
        {
          isMobile ? (
            <Amount isdark={isdark}><AmountNum isdark={isdark}>{commafy3(receiveAmount.toString(), info?.asset)}</AmountNum>&nbsp;{info?.toSymbol}</Amount>
          ) : null
        }
      </Con>
      <Con isdark={isdark} status={status}>
        <TextCon>
          {
            status === 'loading' ? (
              <>
                <TextLine isdark={isdark} mb={'mb'}>· Your cross-chain transaction is being processed, please be patient.</TextLine>
                <TextLine isdark={isdark}>· You can also track the latest status of this cross-chain transaction in the History tab.</TextLine>
              </>
            ) : null
          }
          {status === 'redeem' ? <TextLine isdark={isdark}>Your tokens have arrived at your destination address.</TextLine> : null}
          {status === 'error' ? <TextLine status={status} isdark={isdark}>Here is a text example showing</TextLine> : null}
        </TextCon>
      </Con>
      <HistoryBtn isdark={isdark} onClick={() => {
        navigate('/History/Token');
      }}>Go to History</HistoryBtn>
    </Body>
  )
}

export default Confirmation;