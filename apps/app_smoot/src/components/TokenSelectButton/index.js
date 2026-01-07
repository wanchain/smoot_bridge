import React, { useState, useMemo } from "react";
import styled, { css } from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';
import Icon from '@ant-design/icons';
import { ReactComponent as arrowDown } from 'images/icons/arrowDown.svg';
import TokenSelectModal from "../TokenSelectModal";
import useFormDataModel from "@/models/useFormData";
import useSDK from "@/models/useSDK";

const Body = styled.div`
  padding: 8px 8px 8px 12px;
  border-radius: 8px;
  border: 1px solid ${(props) => props.isdark === 'dark' ? '#1E3B4F' : '#EFEFEF'};
  background: ${(props) => props.isdark === 'dark' ? '#0B2C43' : '#FFF'};
  cursor: pointer;
  width: 230px;
  height: 24px;
  margin-bottom: 20px;

  ${
    (props) => props.banClick !== 'true' && css`
      &:hover {
        border-color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
      }

      &:hover .arrow {
        svg {
          color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
        }
      }
    `
  }
`;

const Con = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChainData = styled.div`
  display: flex;
  align-items: center;
`;

const ImgCon = styled.div`
  background: ${(props) => props.isdark === 'dark' ? '#1E3B4F' : '#EFEFEF'};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 8px;
`;

const Img = styled.img`
  width: 24px;
  height: 24px;
`;

const ChainText = styled.p`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  min-width: 148px;
`;

const IconCon = styled(Icon)`
  width: 20px;
  height: 20px;

  svg {
    width: 20px;
    height: 20px;
    color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#999999'};
  }
`;

const TokenSelectButton = (props) => {
  const { banClick, refreshStatus } = props;
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => {
    return theme;
  }, [theme]);
  const [showModal, setSetModal] = useState(false);
  const { data } = useFormDataModel();
  const { getAssetLogo } = useSDK();

  const handleModal = () => setSetModal(!showModal);
  return (
    <Body
      isdark={isdark}
      banClick={String(banClick)}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (banClick) return;
        handleModal();
      }}
    >
      <Con>
        <ChainData>
          <ImgCon isdark={isdark}>
            {
              data.asset ? <Img src={getAssetLogo(data.asset, data.protocol)} /> : null
            }
          </ImgCon>
          <ChainText isdark={isdark}>{data.asset ? data.asset : 'Select'}</ChainText>
        </ChainData>
        { !banClick && <IconCon className='arrow' component={arrowDown}></IconCon> }
      </Con>
      <TokenSelectModal
        showModal={showModal}
        refreshStatus={refreshStatus}
        closeModal={() => {
          setSetModal(false)
        }}
      ></TokenSelectModal>
    </Body>
  )
};

export default TokenSelectButton;