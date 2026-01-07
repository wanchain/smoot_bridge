import React, { useState, useMemo, useEffect, useContext } from "react";
import styled, { css } from 'styled-components';
import Modal from "../Modal";
import { useLocalStorage } from '@/context/localstorage';
import useSDK from "@/models/useSDK";
import Icon from '@ant-design/icons';
import { ReactComponent as closeIcon } from 'images/icons/close.svg';
import { ReactComponent as pinnedIcon } from 'images/icons/pinned.svg';
import { ReactComponent as pinnedNormalIcon } from 'images/icons/pinnedNormal.svg';
import { WalletContext } from '@/utils/Wallet';
import ModalLoading from "../ModalLoading";
import { isMobile } from 'react-device-detect';

const Con = styled.div`
  padding: 0 24px;
  display: flex;
  flex-direction: column;
`;

const TitleLine = styled.div`
  padding: 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.div`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#232323'};
  font-family: PangMenZhengDao;
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
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
`;

const SearchTokenInp = styled.input`
  display: flex;
  width: ${ isMobile ? 'auto' : '400px'};
  border-radius: 12px;
  border: 1px solid ${(props) => props.isdark === 'dark' ? '#1E3B4F' : '#E7F0F7'};
  background: ${(props) => props.isdark === 'dark' ? '#05253B' : '#F7F7F8'};
  padding: 0 16px;
  height: 60px;
  align-items: center;
  margin-bottom: 16px;
  outline: none;
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  &::placeholder {
    color: ${(props) => props.isdark === 'dark' ? '#556874' : '#556874'};
    font-family: Inter;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
`;

const ListCon = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  min-height: 400px;
  height: 400px;
  margin-bottom: 20px;
`;

const TopLine = styled.div`
  height: 4px;
`;

const Item = styled.div`
  height: 48px;
  border-radius: 8px;
  background: ${(props) => props.isdark === 'dark' ? '#05253B' : '#F7F7F8'};
  padding: 0 8px;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;

  ${
    (props) => props.active === 'true' && css`
      background: ${(props) => props.isdark === 'dark' ? '#0F3755' : '#E7F2FA'};
    `
  }

  &:hover {
    background: ${(props) => props.isdark === 'dark' ? '#0F3755' : '#E7F2FA'};
  }
`;

const PinnedBtn = styled(Icon)`
  width: 16px;
  height: 16px;
  margin-right: 8px;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const CoinInfo = styled.div`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  margin-left: 10px;
`;

const TokenLogo = styled.img`
  border-radius: 50%;
  width: 28px;
  height: 28px;
`;

const NewTag = styled.div`
  height: 20px;
  padding: 0 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  margin-left: 12px;
  background-color: #0fc659;
  color: #fff;
  font-family: Inter;
  font-size: 12px;
  font-weight: 500;
`;

const ListItem = (props) => {
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  const {
    active,
    item,
    pinnedChainList,
    closeModal,
    openModal,
    direction,
    data,
    modify
  } = props;
  const { getAssetLogo } = useSDK();
  const wallet = useContext(WalletContext);
  const resetToWallet = wallet.resetToWallet;
  const resetCurAddress = wallet.resetCurAddress;

  const setPinnedList = (arr) => {
    let str = JSON.stringify(arr);
    window.localStorage.setItem('pinnedChainList', str);
    window.dispatchEvent(new Event('storage'));
  }
  return (
    <Item isdark={isdark} active={active} onClick={(e) => {
      e.preventDefault()
      if (data[direction] !== item.chainName) {
        if (direction === 'from') {
          modify({
            to: null,
            asset: null,
            from: item.chainName,
            toAddress: null,
            amount: null
          })
          resetCurAddress();
        }
        if (direction === 'to') {
          modify({
            to: item.chainName,
            toAddress: null
          });
          resetToWallet();
        }
      }
      closeModal();
    }}>
      <PinnedBtn
        component={active === 'true' ? pinnedIcon : pinnedNormalIcon}
        onClick={(e) => {
          e.stopPropagation();
          let arr = JSON.parse(JSON.stringify(pinnedChainList));
          const index = arr.findIndex(v => v === item.chainName);
          if (index > -1) {
            arr.splice(index, 1);
          } else {
            arr.push(item.chainName);
          }
          setPinnedList(arr);
          openModal();
        }}
      ></PinnedBtn>

      <TokenLogo src={getAssetLogo(item.chainName)}></TokenLogo>

      <CoinInfo isdark={isdark}>
        {item.chainName}
      </CoinInfo>

      {
        item.isNew ? (
          <NewTag>NEW</NewTag>
        ) : null
      }
    </Item>
  )
};

const ChainSelectModal = (props) => {
  const {
    showModal,
    closeModal,
    openModal,
    direction,
    data,
    modify,
    protocol,
    refreshStatus
  } = props;
  const { getFromChains, getToChains, bridge } = useSDK();
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => {
    return theme;
  }, [theme]);
  const [list, setList] = useState([]);
  const [pinnedChainList, setPinnedChainList] = useState(localStorage.getItem('pinnedChainList') ? JSON.parse(localStorage.getItem('pinnedChainList')) : []);
  const [filterTxt, setFilterTxt] = useState('');
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    function pinnedListListener() {
      const pinnedArr = localStorage.getItem('pinnedChainList');
      if (pinnedArr) {
        setPinnedChainList(JSON.parse(pinnedArr));
      }
    }
    window.addEventListener('storage', pinnedListListener);
    return () => window.removeEventListener('storage', pinnedListListener);
  }, []);

  const topList = useMemo(() => {
    let arr = [];
    if (!pinnedChainList || !pinnedChainList.length) return arr;
    Array.prototype.forEach.call(pinnedChainList, (i) => {
      const item = list.find(v => v === i);
      item && arr.push(item);
    })
    arr = arr.filter(v => v.toLocaleLowerCase().includes(filterTxt.toLocaleLowerCase()));
    return arr;
  }, [list, pinnedChainList, filterTxt]);

  const topSortList = useMemo(() => {
    if (!topList.length) return [];
    let newArr = [];
    let normalArr = [];
    for (let i = 0; i < topList.length; i ++) {
      const chain = topList[i];
      const info = bridge.getChainInfo(chain);
      const obj = Object.assign({}, { isNew: false }, info);
      if (info && info.highlightEndTime) {
        const time = new Date().getTime();
        if (time < info.highlightEndTime) {
          obj.isNew = true;
          newArr.push(obj);
        } else {
          normalArr.push(obj);
        }
      } else {
        normalArr.push(obj);
      }
    }
    const arr = [].concat(newArr, normalArr);
    return arr;
  }, [topList, bridge]);

  const normalList = useMemo(() => {
    if (!pinnedChainList) return list;
    let arr = list.filter(item => !pinnedChainList.find(v => v === item));
    arr = arr.filter(v => v.toLocaleLowerCase().includes(filterTxt.toLocaleLowerCase()));
    return arr;
  }, [filterTxt, list, pinnedChainList]);

  const normalSortList = useMemo(() => {
    if (!normalList.length) return [];
    let newArr = [];
    let normalArr = [];
    for (let i = 0; i < normalList.length; i ++) {
      const chain = normalList[i];
      const info = bridge.getChainInfo(chain);
      const obj = Object.assign({}, { isNew: false }, info);
      if (info && info.highlightEndTime) {
        const time = new Date().getTime();
        if (time < info.highlightEndTime) {
          obj.isNew = true;
          newArr.push(obj);
        } else {
          normalArr.push(obj);
        }
      } else {
        normalArr.push(obj);
      }
    }
    const arr = [].concat(newArr, normalArr);
    return arr;
  }, [normalList, bridge]);

  const handleInp = (e) => {
    setFilterTxt(e.target.value);
  }

  useEffect(() => {
    const getChainsFn = async () => {
      let arr;
      if (direction === 'from') {
        arr = await getFromChains({ protocols: protocol });
      } else {
        arr = await getToChains(data.asset, data.from, { protocols: protocol });
      }
      let chainArr = [];
      if (arr.includes('Wanchain')) chainArr.push('Wanchain');
      if (arr.includes('Bitcoin')) chainArr.push('Bitcoin');
      if (arr.includes('Ethereum')) chainArr.push('Ethereum');
      arr = arr.filter((v) => !['Wanchain', 'Bitcoin', 'Ethereum'].includes(v)).sort((a, b) => (a > b ? 1 : -1));
      arr = chainArr.concat(arr);
      setList(arr);
    }
    showModal && getChainsFn();
  }, [data.asset, data.from, direction, getFromChains, getToChains, protocol, showModal]);

  useEffect(() => {
    setFilterTxt('');
  }, [showModal]);

  useEffect(() => {
    if (!list || !list.length) {
      setPageLoading(true);
    } else {
      setPageLoading(false);
    }
  }, [list]);

  useEffect(() => {
    setList([]);
  }, [refreshStatus]);

  return (
    <Modal visible={showModal} cancel={closeModal} size="s">
      <Con>
        <TitleLine>
          <Title isdark={isdark}>Select<span style={{ fontSize: "12px" }}> </span>Chain</Title>
          <CloseBtn onClick={() => {
            closeModal()
          }} isdark={isdark} component={closeIcon}></CloseBtn>
        </TitleLine>
        <SearchTokenInp
          isdark={isdark}
          placeholder="Search Chain"
          value={filterTxt}
          onClick={e => e.stopPropagation()}
          onChange={e => handleInp(e)}
        ></SearchTokenInp>
        {
          (showModal && !pageLoading) ? (
            <ListCon>
              {
                topSortList.map((v, i) => (
                  <ListItem
                    key={i}
                    active={'true'}
                    item={v}
                    direction={direction}
                    data={data}
                    modify={modify}
                    pinnedChainList={pinnedChainList}
                    closeModal={closeModal}
                    openModal={openModal}
                  ></ListItem>
                ))
              }
              <TopLine></TopLine>
              {
                normalSortList.map((v, i) => (
                  <ListItem
                    key={i}
                    active={'false'}
                    item={v}
                    direction={direction}
                    data={data}
                    modify={modify}
                    pinnedChainList={pinnedChainList}
                    closeModal={closeModal}
                    openModal={openModal}
                  ></ListItem>
                ))
              }
            </ListCon>
          ) : (
            <ModalLoading></ModalLoading>
          )
        }
      </Con>
    </Modal>
  )
};

export default ChainSelectModal;
