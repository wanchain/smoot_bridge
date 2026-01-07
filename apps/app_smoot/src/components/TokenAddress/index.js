import React, { useMemo } from "react";
import styled, { css } from 'styled-components';
import { clipString3 } from "../../utils/utils";
import CopyBtn from "../CopyBtn";
import { useLocalStorage } from '@/context/localstorage';
import { isMobile } from 'react-device-detect';

const TokenAddress = (props) => {
  const { tokenName, tokenAddr, chain, asset, onlyShowAddr } = props;
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);


  const isAda = useMemo(() => {
    if (chain !== 'Cardano') return false;
    let assetName = asset;
    if (['BTC.a', 'wanBTC'].includes(asset)) assetName = 'BTC';
    if (['USDC.e'].includes(assetName)) assetName = 'USDC';
    if (assetName === 'ADA') return false;
    return true;
  }, [asset, chain]);

  return (
    <Body>
      {
        isAda ? (
          <Left>
            { !onlyShowAddr && (<Txt>Policy ID:</Txt>) }
            <Txt>{clipString3(tokenAddr.split('.')[0], 44)}</Txt>
          </Left>
        ) : (
          <Left>
            { !onlyShowAddr && (<Txt>{tokenName}&nbsp;contract address:</Txt>) }
            <Txt>{clipString3(tokenAddr, 44)}</Txt>
          </Left>
        )
      }
      <CopyBtn
        size={'34'}
        radius={'6px'}
        text={isAda ? tokenAddr.split('.')[0] : tokenAddr}
        bg={isdark === 'dark' ? '#2D5370' : '#7A9AB2'}
        color={'#fff'}
      ></CopyBtn>
    </Body>
  )
}

export default TokenAddress;

// const CopyBtn = styled(Icon)`
//   width: 34px;
//   height: 34px;
//   border: 6px;
//   background: ${(props) => props.isdark === 'dark' ? '' : ''};

//   svg {
    
//   }
// `;

const Txt = styled.p`
  color: #FFF;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  
  ${
    isMobile && css`
      word-break: break-word;
    `
  }
`;

const Left = styled.div`
  width: ${ isMobile ? 'auto' : '360px' };
`;

const Body = styled.div`
  width: ${ isMobile ? '100%' : '406px' };
  display: flex;
  justify-content: space-between;
  align-items: center;
`;