import React, { useContext, useMemo, useState } from "react";
import styled, { css } from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';
import Icon from '@ant-design/icons';
import { ReactComponent as arrowRight } from 'images/icons/arrowRight.svg';
import { ReactComponent as questionMarkIcon } from 'images/icons/questionMark.svg';
import confirmLoadingDeep from 'images/confirmLoadingDeep.webp';
import confirmLoadingLight from 'images/confirmLoadingLight.webp';
import useFormDataModel from "@/models/useFormData";
import { clipString2, commafy3, commafy4 } from '@/utils/utils';
import AssetChainLogo from "@/components/AssetChainLogo";
import CopyBtn from "@/components/CopyBtn";
import useSDK from "@/models/useSDK";
import { WalletContext } from '@/utils/Wallet';
import { useNavigate, Navigate } from 'react-router-dom';
import { message } from 'antd';
import Tip from "@/components/Tip";
import { isMobile } from 'react-device-detect';
import TokenAddress from "@/components/TokenAddress";
import NetWrongModal from "@/components/NetWrongModal";

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
  margin-bottom: ${ isMobile ? '16px' : '20px'};

  ${
    isMobile && css`
      flex-direction: column;
    `
  }
`;

const AssetInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${(props) => isMobile ? props.direction === 'left' ? '20px 0 40px':  '40px 0 20px': '40px 0'};
  flex: 1;
`;

const AssetIconCon = styled.div`
  width: 116px;
  height: 116px;
  margin-bottom: 26px;
`;

const ChainInfo = styled.p`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  text-align: center;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 18px;
`;

const ChainFromInfo = styled.span`
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
  border-radius: 4px;
  background: ${(props) => props.isdark === 'dark' ? '#0C3350' : '#EBEEF1'};
  height: 24px;
  padding: 0 2px;
`;

const ChainToInfo = styled(ChainFromInfo)`
  color: ${(props) => props.isdark === 'dark' ? '#E84142' : '#E84142'};
  background: ${(props) => props.isdark === 'dark' ? '#3B0505' : '#FFEFEF'};
`;

const AccountInfo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.isdark === 'dark' ? '#B4BEC4' : '#666666'};
  text-align: center;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const Line = styled.div`
  width: 1px;
  background: ${(props) => props.isdark === 'dark' ? '#1E3B4F' : 'rgba(0, 0, 0, 0.1)'};
  position: relative;

  ${
    isMobile && css`
      width: 100%;
      height: 1px;
    `
  }
`;

const ArrowIconCon = styled(Icon)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2FBDF4;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 12px solid ${(props) => props.isdark === 'dark' ? '#05253B' : '#F7F7F8'};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  svg {
    color: #fff;
    width: 24px;
    height: 24px;

    ${
      isMobile && css`
        transform: rotate(90deg);
      `
    }
  }
`;

const AmountInfoCon = styled.div`
  padding: 20px 24px;
  flex: 1;
`;

const TextLine = styled.div`
  margin-bottom: ${(props) => props.mb ? '20px' : ''}; 
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const AmountInfo = styled.div`
  display: flex;
  align-items: center;
`;

const AmountBlue = styled.div`
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
  margin-right: 4px;
`;

const QuestionIcon = styled(Icon)`
  width: 18px;
  height: 18px;
  cursor: pointer;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const QuestionTime = styled.div`
  display: flex;
  align-items: center;
`;

const QuestionTipTxt = styled.div`
  padding: 10px;
  color: #FFF;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const AbortLinkCon = styled.a`
  font-size: 16px;
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#BBE2FF'};
  text-decoration: unset;
  cursor: pointer;

  &:hover {
    text-decoration: none;
    color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#BBE2FF'};
  }
`;

const BtnGroup = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Btn = styled.div`
  flex: 1;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  background: ${(props) => props.isdark === 'dark' ? '#05253B' : '#F7F7F8'};
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#999999'};
  font-family: PangMenZhengDao;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  cursor: pointer;

  &:hover {
    background: ${(props) => props.isdark === 'dark' ? '#0A3350' : '#E9E9E9'};
  }
`;

const ConfirmBtn = styled(Btn)`
  background: ${(props) => props.isdark === 'dark' ? '#0F68AA' : '#0F68AA'};
  color: #FFF;
  margin-left: 8px;

  &:hover {
    background: ${(props) => props.isdark === 'dark' ? '#0C558A' : '#0C558A'};
  }
`;

const ConfrimLoading = styled.img`

`;

const OneIdBlueTxt = styled.div`
  font-family: Inter;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: italic;
  line-height: normal;
  letter-spacing: normal;
  color: ${(props) => props.isdark === 'dark' ? '#2fbdf4' : '#333'};
  cursor: pointer;
`;

const OneIdWhiteTxt = styled.div`
  font-family: Inter;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: italic;
  line-height: normal;
  letter-spacing: normal;
  color: ${(props) => props.isdark === 'dark' ? '#fff' : '#333'};
  margin-bottom: 6px;
`;

// Bitcoin->Others, 60min
// Others->Bitcoin, 60min

// Polygon->Others, 30min (不包括to Bitcoin)
// Cardano->Others, 30min(不包括to Bitcoin)
// Blast->Others, 30min(不包括to Bitcoin)
// Others->Solana, 30min

// 剩余其他 15min


const timeConfig = {
  from: {
    Polygon: 30,
    Cardano: 30,
    Blast: 30,
    Bitcoin: 60,
    'Polygon zkEVM': 30
  },
  to: {
    Bitcoin: 60,
    Solana: 30
  }
}

const Confirmation = () => {
  const wallet = useContext(WalletContext);
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  const { data, reset, isValid } = useFormDataModel();
  const [showLoading, setShowLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('networkWrong');
  const navigate = useNavigate();
  
  const {
    bridge,
    subscribe,
    setCurrentTaskId,
    initStatusInfo
  } = useSDK();

  const time = useMemo(() => {
    let num = 0;
    const defaultNum = 15;
    const fromNum = timeConfig.from[data.from] ? timeConfig.from[data.from] : 0;
    let toNum = timeConfig.to[data.to] ? timeConfig.to[data.to] : 0;
    num = fromNum > toNum ? fromNum : toNum;
    return num ? num : defaultNum;
  }, [data.from, data.to]);

  if (isValid === false) {
    return <Navigate to='/AssetBridge' />;
  }

  const onConfirm = async () => {
    if (showLoading) return;
    try {
      setShowLoading(true);
      initStatusInfo();
      let task = await bridge.createTask(
        data.asset,
        data.from,
        data.to,
        data.amount,
        data.fromAddress,
        data.toAddress,
        {
          wallet: wallet.wallet
        },
      );
      // await task.init(); // Check wallet, and fetch fee from server
      console.log('set current task id SDK', task, data, wallet)
      setCurrentTaskId(task.id);
      subscribe(task.id, (type, ret) => {
        setShowLoading(false);
        // Tx sent successfully.
        console.log('confirmation', type, ret)
        if (type === 'lock' && ret) {
          navigate('/AssetBridge/BridgingStatus');
        } else if (type === 'error' && ret) {
          if (ret.reason === 'Network Instability Detected') {
            setModalType('networkWrong');
            setShowModal(true);
            return;
          }
          navigate('/History/Token');
          reset();
        } else {
          console.error('unknown error', type, ret);
        }
      });
      //use subscription to get the result,and call the callback function.
    } catch (e) {
      setShowLoading(false);
      if (e.message === 'Invalid wallet') {
        message.warning('Invalid wallet is connected.');
      } else {
        message.warning(e.message);
      }
      // setWaiting(false);
      // message.warning('send task error:', e);
    }
  }
  return (
    <Body isdark={isdark}>
      <NetWrongModal
        onClose={() => setShowModal(false)}
        onConfirm={() => setShowModal(false)}
        showModal={showModal}
        type={modalType}
      ></NetWrongModal>
      <Title isdark={isdark}>Confirm your selection</Title>
      <Con isdark={isdark}>
        <AssetInfo direction='left'>
          <AssetIconCon>
            <AssetChainLogo size={'m'} asset={data.asset} chain={data.from}></AssetChainLogo>
          </AssetIconCon>
          <ChainInfo isdark={isdark}>{data.paireInfo.from.symbol} on <ChainFromInfo isdark={isdark}>{data.from}</ChainFromInfo></ChainInfo>
          <AccountInfo isdark={isdark}>{clipString2(data.fromAddress, 14, 13)}
            <CopyBtn size={'18'} text={data.fromAddress}></CopyBtn>
          </AccountInfo>
        </AssetInfo>
        <Line isdark={isdark}>
          <ArrowIconCon isdark={isdark} component={arrowRight}></ArrowIconCon>
        </Line>
        <AssetInfo>
          <AssetIconCon>
            <AssetChainLogo size={'m'} asset={data.asset} chain={data.to}></AssetChainLogo>
          </AssetIconCon>
          <ChainInfo isdark={isdark}>{data.paireInfo.to.symbol} on <ChainToInfo isdark={isdark}>{data.to}</ChainToInfo></ChainInfo>
          <AccountInfo isdark={isdark}>{clipString2(data.toAddress, 14, 13)}&nbsp;
            <CopyBtn size={'18'} text={data.toAddress}></CopyBtn>
          </AccountInfo>
        </AssetInfo>
      </Con>
      <Con isdark={isdark}>
        <AmountInfoCon>
          <TextLine isdark={isdark}>
            You will receive
            <AmountInfo>
              <AmountBlue isdark={isdark}>{commafy3(data.receiveAmount, data.asset)}</AmountBlue>{data.paireInfo.to.symbol}
            </AmountInfo>
          </TextLine>
        </AmountInfoCon>
      </Con>
      <BtnGroup>
        <Btn isdark={isdark} onClick={() => {
          navigate('/AssetBridge');
        }}>Cancel</Btn>
        <ConfirmBtn isdark={isdark} onClick={onConfirm}>
          {
            showLoading ? (
              <ConfrimLoading src={isdark === 'dark' ? confirmLoadingDeep : confirmLoadingLight}></ConfrimLoading>
            ) : 'Confirm'
          }
        </ConfirmBtn>
      </BtnGroup>
    </Body>
  )
}

export default Confirmation;