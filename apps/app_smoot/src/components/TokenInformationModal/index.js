import React, { useMemo } from "react";
import Modal from "../Modal";
import styled, { css } from 'styled-components';
import useSDK, { network } from "@/models/useSDK";
import BigNumber from 'bignumber.js';
import { useLocalStorage } from '@/context/localstorage';
import {
  clipString,
  hideTail,
  formatParseFee,
  commafy3,
  commafy4
} from '@/utils/utils';
import CopyBtn from "../CopyBtn";
import Status from "../Status";
import Icon from '@ant-design/icons';
import { ReactComponent as closeIcon } from 'images/icons/close.svg';
import { ReactComponent as routeArrowIcon } from 'images/icons/routeArrow.svg';
import { isMobile } from "react-device-detect";

const Con = styled.div`
  padding: 24px;
`;

const Title = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const AssetInfo = styled.div`
  display: flex;
  align-items: center;
`;

const AssetName = styled.div`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const TokenLogo = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-right: 8px;
`;

const CloseBtn = styled(Icon)`
  width: 24px;
  height: 24px;
  cursor: pointer;

  svg {
    width: 24px;
    height: 24px;
    color: ${(props) => props.isdark === 'dark' ? '#8398A8' : '#999999'};
  }

  &:hover {
    svg {
      color: ${(props) => props.isdark === 'dark' ? '#fff' : '#333'};
    }
  }
`;

const Line = styled(Title)`
  margin-bottom: 12px;
  height: 48px;
  border-radius: 8px;
  padding: 0 16px;

  ${
    (props) => props.isdark === 'dark' ? css`
      &:nth-child(even) {
        background: #042033;
      }
      
      &:nth-child(odd) {
        background: #072539;
      }
    ` : css`
      &:nth-child(even) {
        background: #F9F9FA;
      }
      
      &:nth-child(odd) {
        background: #FFF;
      }
    `
  }
`

const Label = styled.p`
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#666666'};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const LabelInfo = styled.div`
  display: flex;
  align-items: center;
`;

const LabelInfoText = styled.p`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  text-align: right;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  display: flex;
  align-items: center;
`;

const ClickTxt = styled(LabelInfoText)`
  cursor: pointer;
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
  font-style: italic;
`;

const ArrowIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  margin: 0 4px;

  svg {
    width: 16px;
    height: 16px;
    color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  }
`;

const SymbolLogo = styled.img`
  width: 18px;
  height: 18px;
  border-radius: 50%;
`;

const BlueTxt = styled.span`
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
`;

const LabelIncoCon = styled.div`
  display: flex;
  flex-direction: column;
`;

const LabelOneIdCon = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  font-family: Inter;
  font-size: 16px;
  font-weight: normal;
  font-stretch: normal;
  font-style: italic;
  line-height: normal;
  letter-spacing: normal;
  color: ${(props) => props.isdark === 'dark' ? '#fff' : '#333'};
`;

const LabelAccountCon = styled.div`
  display: flex;
  align-items: center;
`;

const LabelAccountText = styled.div`
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: italic;
  line-height: normal;
  letter-spacing: normal;
  color: ${(props) => props.isdark === 'dark' ? '#818d96' : '#666'};
`;

const TokenInformationModal = (props) => {
  const {
    visible,
    cancel,
    info
  } = props;
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  const {
    getAssetLogo,
    bridge
  } = useSDK();

  const beforeFeeAmount = useMemo(() => {
    if (!info || !info.fee) {
      return '0';
    }
    let crossAmount = new BigNumber(info.amount);
    return crossAmount.toString();
  }, [info]);

  const afterFeeAmount = useMemo(() => {
    if (info && !['Succeeded', 'Error'].includes(info.status)) {
      return '';
    }
    if (info && info.receivedAmount !== undefined) {
      return info.receivedAmount;
    }
    if (!info || !info.fee) {
      return '0';
    }
    return info.amount;
  }, [info]);

  const displayFee = useMemo(() => {
    if (!info || !info.fee) return 0;
    const { totalFee, networkFee, operateFee } = formatParseFee(info.fee, info, false);
    return { totalFee, networkFee, operateFee }
  }, [info])

  return (
    <Modal
      visible={visible}
      cancel={cancel}
    >
      {
        info && (
          <Con>
            <Title>
              <AssetInfo>
                <TokenLogo src={getAssetLogo(info.asset, info.protocol)} />
                <AssetName isdark={isdark}>{hideTail(info.assetAlias || info.asset, 6)}</AssetName>
              </AssetInfo>
              <CloseBtn onClick={cancel} isdark={isdark} component={closeIcon}></CloseBtn>
            </Title>

            <Line isdark={isdark}>
              <Label isdark={isdark}>Asset</Label>
              <LabelInfoText isdark={isdark}>{info.asset}</LabelInfoText>
            </Line>

            <Line isdark={isdark}>
              <Label isdark={isdark}>Chain Pair</Label>
              <LabelInfo>
                <LabelInfoText isdark={isdark}>{`${info.fromChain}`}</LabelInfoText>
                <ArrowIcon isdark={isdark} component={routeArrowIcon}></ArrowIcon>
                <LabelInfoText isdark={isdark}>{`${info.toChain}`}</LabelInfoText>
              </LabelInfo>
            </Line>

            {info.fromAccount && (
              <Line isdark={isdark}>
                <Label isdark={isdark}>From</Label>
                <LabelInfo>
                  <LabelIncoCon>
                    <LabelOneIdCon isdark={isdark}>{info.fromAccountId}</LabelOneIdCon>
                    <LabelAccountCon>
                      {
                        info.fromAccountId ? (
                          <LabelAccountText isdark={isdark}>{clipString(info.fromAccount, isMobile ? 12 : 30)}</LabelAccountText>
                        ) : (
                          <LabelInfoText isdark={isdark}>{clipString(info.fromAccount, isMobile ? 12 : 30)}</LabelInfoText>
                        )
                      }
                      &nbsp;
                      <CopyBtn size={'18'} text={info.fromAccount}></CopyBtn>
                    </LabelAccountCon>
                  </LabelIncoCon>
                </LabelInfo>
              </Line>
            )}

            <Line isdark={isdark}>
              <Label isdark={isdark}>Recipient</Label>
              <LabelInfo>
                <LabelIncoCon>
                  <LabelOneIdCon isdark={isdark}>{info.toAccountId}</LabelOneIdCon>
                  <LabelAccountCon>
                    {
                      info.toAccountId ? (
                        <LabelAccountText isdark={isdark}>{clipString(info.toAccount, isMobile ? 12 : 30)}</LabelAccountText>
                      ) : (
                        <LabelInfoText isdark={isdark}>{clipString(info.toAccount, isMobile ? 12 : 30)}</LabelInfoText>
                      )
                    }
                    &nbsp;
                    <CopyBtn size={'18'} text={info.toAccount}></CopyBtn>
                  </LabelAccountCon>
                </LabelIncoCon>
              </LabelInfo>
            </Line>

            <Line isdark={isdark}>
              <Label isdark={isdark}>Amount</Label>
              <LabelInfo>
                <LabelInfoText isdark={isdark}>
                  <BlueTxt>
                    {commafy3(beforeFeeAmount, info.asset)}
                  </BlueTxt>&nbsp;{info.fromSymbol}&nbsp;
                  <SymbolLogo src={getAssetLogo(info.asset, info.protocol)}></SymbolLogo>
                </LabelInfoText>
              </LabelInfo>
            </Line>

            <Line isdark={isdark}>
              <Label isdark={isdark}>Fee</Label>
              <LabelInfo>
                {
                  Number(displayFee.totalFee) ? (
                    <>
                      {
                        info.fee.networkFee.unit === info.fee.operateFee.unit ? (
                          <>
                            <LabelInfoText isdark={isdark}>{commafy4(displayFee.totalFee, info.fee.networkFee.unit)}&nbsp;{info.fee.networkFee.unit}</LabelInfoText>
                          </>
                        ) : (
                          <>
                            {Number(displayFee.networkFee) ? (
                              <>
                                <LabelInfoText isdark={isdark}>{commafy4(displayFee.networkFee, info.fee.networkFee.unit)}&nbsp;{info.fee.networkFee.unit}</LabelInfoText>
                              </>
                            ) : null}
                            {Number(displayFee.networkFee) && Number(displayFee.operateFee) ? (
                              <LabelInfoText isdark={isdark}>&nbsp;+&nbsp;</LabelInfoText>
                            ) : null}
                            {Number(displayFee.operateFee) ? (
                              <>
                                <LabelInfoText isdark={isdark}>{commafy4(displayFee.operateFee, info.fee.operateFee.unit)}&nbsp;{info.fee.operateFee.unit}</LabelInfoText>
                              </>
                            ) : null}
                          </>
                        )
                      }
                    </>
                  ) : (
                    <>
                      <LabelInfoText isdark={isdark}>0</LabelInfoText>
                    </>
                  )
                }
              </LabelInfo>
            </Line>

            <Line isdark={isdark}>
              <Label isdark={isdark}>Receive</Label>
              <LabelInfo>
                <LabelInfoText isdark={isdark}>
                  <BlueTxt>
                    {!afterFeeAmount ? afterFeeAmount : commafy3(afterFeeAmount, info.asset)}
                  </BlueTxt>&nbsp;
                  {
                    ['Succeeded', 'Error'].includes(info.status) ? (
                        <>
                        {info.toSymbol}&nbsp;<SymbolLogo src={getAssetLogo(info.asset, info.protocol)}></SymbolLogo>
                        </>
                      )
                    : null
                  }
                </LabelInfoText>
              </LabelInfo>
            </Line>

            <Line isdark={isdark}>
              <Label isdark={isdark}>Status</Label>
              <LabelInfo>
                <Status status={info.status} reverse={'reverse'}></Status>
              </LabelInfo>
            </Line>

            {info.lockHash && (
              <Line isdark={isdark}>
                <Label isdark={isdark}>LockHash</Label>
                <LabelInfo>
                  <ClickTxt
                    isdark={isdark}
                    onClick={async () => {
                      if (!info.lockHash) return;
                      let path;
                      const chainInfo = await bridge.getChainInfo(info.fromChain);
                      const link = chainInfo.explorer;
                      path = `${link}/tx/${info.lockHash}`;
                      window.open(path)
                    }}
                  >
                    {clipString(info.lockHash, isMobile ? 12 : 32)}
                  </ClickTxt>&nbsp;
                  <CopyBtn size={'18'} text={info.lockHash}></CopyBtn>
                </LabelInfo>
              </Line>
            )}

            {info.redeemHash && (
              <Line isdark={isdark}>
                <Label isdark={isdark}>RedeemHash</Label>
                <LabelInfo>
                  <ClickTxt
                    isdark={isdark}
                    onClick={async () => {
                      if (!info.redeemHash) return;
                      let path;
                      const chainInfo = await bridge.getChainInfo(info.toChain);
                      const link = chainInfo.explorer;
                      path = `${link}/tx/${info.redeemHash}`;
                      window.open(path)
                    }}
                  >
                    {clipString(info.redeemHash, isMobile ? 12 : 32)}
                  </ClickTxt>&nbsp;
                  <CopyBtn size={'18'} text={info.redeemHash}></CopyBtn>
                </LabelInfo>
              </Line>
            )}
          </Con>
        )
      }
    </Modal>
  )
};

export default TokenInformationModal;