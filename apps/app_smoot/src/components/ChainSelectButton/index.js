import React, { useState, useMemo } from "react";
import styled, { css } from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';
import Icon from '@ant-design/icons';
import { ReactComponent as arrowDown } from 'images/icons/arrowDown.svg';
import ChainSelectModal from "../ChainSelectModal";
import useSDK from "@/models/useSDK";

const Body = styled.div`
  padding: 8px 8px 8px 12px;
  border-radius: 8px;
  border: 1px solid ${(props) => props.isdark === 'dark' ? '#1E3B4F' : '#EFEFEF'};
  background: ${(props) => props.isdark === 'dark' ? '#0B2C43' : '#FFF'};
  cursor: pointer;
  width: ${(props) => props.size ? props.size : '230px'};
  height: 24px;
  margin-bottom: ${(props) => props.mb ? props.mb : '20'}px;

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

const ChainSelectButton = (props) => {
  const { direction, data, modify, protocol, size, mb, refreshStatus } = props;
  const { theme } = useLocalStorage();
  const { getAssetLogo } = useSDK();
  const [showModal, setSetModal] = useState(false);

  const handleModal = () => setSetModal(!showModal);
  const banClick = useMemo(() => {
    if (protocol.includes('Erc20')) {
      return (direction === 'to') && !data.asset;
    } else {
      return (direction === 'to') && (!data.asset || !data.from);
    }
  }, [data.asset, data.from, direction, protocol])
  return (
    <Body
      size={size}
      isdark={theme}
      mb={mb}
      banClick={String(banClick)}
      onClick={(e) => {
        // e.stopPropagation();
        // e.preventDefault();
        if (banClick) return;
        handleModal();
      }}
    >
      <Con>
        <ChainData>
          <ImgCon isdark={theme}>
            {
              data[direction] ? <Img src={getAssetLogo(data[direction])}></Img> : null
            }
          </ImgCon>
          <ChainText isdark={theme}>{ data[direction] ? data[direction] : 'Select'}</ChainText>
        </ChainData>
        { !banClick && <IconCon className='arrow' banClick={String(banClick)} component={arrowDown}></IconCon>}
      </Con>
      <ChainSelectModal
        data={data}
        modify={modify}
        protocol={protocol}
        direction={direction}
        showModal={showModal}
        refreshStatus={refreshStatus}
        closeModal={() => setSetModal(false)}
        openModal={() => setSetModal(true)}
      ></ChainSelectModal>
    </Body>
  )
};

export default ChainSelectButton;