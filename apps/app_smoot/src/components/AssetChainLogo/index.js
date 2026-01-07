import React, { useMemo } from "react";
import styled, { css } from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';
import useSDK from "@/models/useSDK";

const Body = styled.div`
  position: relative;

  ${
    (props) => props.size === 'ms' && css`
      width: 100px;
      height: 100px;
    `
  }

  ${
    (props) => props.size === 's' && css`
      width: 32px;
      height: 32px;
    `
  }

  ${
    (props) => props.size === 'xs' && css`
      width: 24px;
      height: 24px;
    `
  }
`;

const TokenLogo = styled.img`
  border-radius: 50%;
  
  ${
    (props) => props.size === 'm' && css`
      width: 116px;
      height: 116px;
    `
  }

  ${
    (props) => props.size === 'ms' && css`
      width: 100px;
      height: 100px;
    `
  }

  ${
    (props) => props.size === 'xm' && css`
      width: 40px;
      height: 40px;
    `
  }
  
  ${
    (props) => props.size === 's' && css`
      width: 32px;
      height: 32px;
    `
  }
`;

const ChainLogo = styled.img`
  position: absolute;
  border-radius: 50%;
  
  ${
    (props) => props.size === 'm' && css`
      width: 40px;
      height: 40px;
      border: 4px solid ${(props) => props.isdark === 'dark' ? '#05253B' : 'rgba(0, 0, 0, 0)'};
      right: -4px;
      bottom: -4px;
    `
  }
  
  ${
    (props) => props.size === 'ms' && css`
      width: 40px;
      height: 40px;
      border: 4px solid ${(props) => props.isdark === 'dark' ? '#05253B' : 'rgba(0, 0, 0, 0)'};
      right: -4px;
      bottom: -4px;
    `
  }

  ${
    (props) => props.size === 'xm' && css`
      width: 14px;
      height: 14px;
      border: 2px solid ${(props) => props.isdark === 'dark' ? '#05253B' : 'rgba(0, 0, 0, 0)'};
      right: -2px;
      bottom: -2px;
    `
  }
  
  ${
    (props) => props.size === 's' && css`
      width: 12px;
      height: 12px;
      border: 2px solid ${(props) => props.isdark === 'dark' ? '#05253B' : 'rgba(0, 0, 0, 0)'};
      right: -2px;
      bottom: -2px;
    `
  }

`;

const AssetChainLogo = (props) => {
  const {
    size,
    asset,
    chain
  } = props;
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  const { getAssetLogo } = useSDK();
  const protocol = 'Erc20';
  return (
    // <TokenLogo src={getAssetLogo(item.asset, item.protocol)} />
    <Body size={size ? size : 's'}>
      <TokenLogo size={size ? size : 's'} src={getAssetLogo(asset, protocol)}></TokenLogo>
      <ChainLogo isdark={isdark} size={size ? size : 's'} src={getAssetLogo(chain)}></ChainLogo>
    </Body>
  )
};

export default AssetChainLogo;