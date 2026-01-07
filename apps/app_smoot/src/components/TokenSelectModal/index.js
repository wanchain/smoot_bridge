import { useState, useMemo, useEffect, useContext } from "react";
import styled, { css } from 'styled-components';
import Modal from "../Modal";
import { useLocalStorage } from '@/context/localstorage';
import useSDK from "@/models/useSDK";
import AssetChainLogo from "../AssetChainLogo";
import { WalletContext } from '@/utils/Wallet';
import Icon from '@ant-design/icons';
import { ReactComponent as closeIcon } from 'images/icons/close.svg';
import { ReactComponent as pinnedIcon } from 'images/icons/pinned.svg';
import { ReactComponent as pinnedNormalIcon } from 'images/icons/pinnedNormal.svg';
import useFormDataModel from "@/models/useFormData";
import BigNumber from "bignumber.js";
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  ${
    (props) => props.active === 'true' && css`
      background: ${(props) => props.isdark === 'dark' ? '#0F3755' : '#E7F2FA'};
    `
  }

  &:hover {
    background: ${(props) => props.isdark === 'dark' ? '#0F3755' : '#E7F2FA'};
  }
`;

const ItemLeft = styled.div`
  display: flex;
  align-items: center;
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

const ChainName = styled.p`
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#999'};
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 14px;
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
  const {
    active,
    item,
    pinnedTokenList,
    closeModal,
    fromAddr
  } = props;
  const { modify, data } = useFormDataModel();
  const { tokenProtocol } = useSDK();

  const setPinnedList = (arr) => {
    let str = JSON.stringify(arr);
    window.localStorage.setItem('pinnedTokenList', str);
    window.dispatchEvent(new Event('storage'));
  }
  return (
    <Item isdark={theme} active={active} onClick={(e) => {
      e.preventDefault()
      const token = item.asset;
      const chain = item.chain;
      if (
        !(
          token === data.asset &&
          chain === data.assetChain
        )
      ) {
        modify({
          asset: token,
          assetChain: chain,
          from: chain,
          fromCoinAddress: item.address,
          to: null,
          fromAddress: data.fromAddress || fromAddr,
          amount: '0',
          fee: '0',
          protocol: tokenProtocol[token],
        });
      }
      closeModal();
    }}>
      <ItemLeft>
        <PinnedBtn
          component={active === 'true' ? pinnedIcon : pinnedNormalIcon}
          onClick={(e) => {
            e.stopPropagation();
            let arr = JSON.parse(JSON.stringify(pinnedTokenList));
            const index = arr.findIndex(v => v.address === item.address && v.chain === item.chain);
            if (index > -1) {
              arr.splice(index, 1);
            } else {
              arr.push(item);
            }
            setPinnedList(arr);
          }}
        ></PinnedBtn>

        <AssetChainLogo size={'s'} asset={item.asset} chain={item.chain}></AssetChainLogo>

        <CoinInfo isdark={theme}>
          {item.asset}
          <ChainName>{item.chain}</ChainName>
        </CoinInfo>

        {
          item.highlightEndTime > new Date().getTime() ? (
            <NewTag>NEW</NewTag>
          ) : null
        }

      </ItemLeft>
    </Item>
  )
};

const TokenSelectModal = (props) => {
  const {
    showModal,
    closeModal,
    refreshStatus
  } = props;
  const wallet = useContext(WalletContext);
  const address = wallet.address;
  const { getChainAssets, loading } = useSDK();
  const { data } = useFormDataModel();
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => {
    return theme;
  }, [theme])
  const [list, setList] = useState([]);
  const [allTokenList, setAllTokenList] = useState([]);
  const [pinnedTokenList, setPinnedTokenList] = useState(localStorage.getItem('pinnedTokenList') ? JSON.parse(localStorage.getItem('pinnedTokenList')) : []);
  const [filterTxt, setFilterTxt] = useState('');
  const [hotFilterTxt, setHotFilterTxt] = useState('');
  const [pageLoading, setPageLoading] = useState(false);
  const [curChain, setCurChain] = useState('');

  const topList = useMemo(() => {
    let arr = [];
    if (!pinnedTokenList || !pinnedTokenList.length) return arr;
    Array.prototype.forEach.call(pinnedTokenList, (item) => {
      const obj = list.find(v => v.address === item.address && v.chain === item.chain && v.asset === item.asset);
      obj && arr.push(obj);
    })
    arr = arr.filter(v => {
      const assetStr = String(v.asset).toLocaleLowerCase();
      const filterStr = String(filterTxt).toLocaleLowerCase();
      const filterHotStr = String(hotFilterTxt).toLocaleLowerCase();
      if (!filterHotStr && !filterStr) return true;
      let isfilter, isfilterHot;
      if (filterStr) isfilter = assetStr.includes(filterStr);
      if (filterHotStr) isfilterHot = assetStr.includes(filterHotStr)
      return isfilter || isfilterHot;
    });
    return arr;
  }, [pinnedTokenList, list, filterTxt, hotFilterTxt]);

  const normalList = useMemo(() => {
    let arr = [];
    if (!pinnedTokenList || !pinnedTokenList.length) {
      arr = list;
    } else {
      arr = list.filter(item => !pinnedTokenList.find(v => v.address === item.address && v.chain === item.chain && v.asset === item.asset));
    }
    arr = arr.filter(v => {
      const assetStr = String(v.asset).toLocaleLowerCase();
      const filterStr = String(filterTxt).toLocaleLowerCase();
      const filterHotStr = String(hotFilterTxt).toLocaleLowerCase();
      if (!filterHotStr && !filterStr) return true;
      let isfilter, isfilterHot;
      if (filterStr) isfilter = assetStr.includes(filterStr);
      if (filterHotStr) isfilterHot = assetStr.includes(filterHotStr)
      return isfilter || isfilterHot;
    })
    return arr;
  }, [filterTxt, list, pinnedTokenList, hotFilterTxt]);

  const handleInp = (e) => {
    setFilterTxt(e.target.value);
  }

  useEffect(() => {
    function pinnedListListener() {
      const pinnedArr = localStorage.getItem('pinnedTokenList');
      if (pinnedArr) {
        setPinnedTokenList(JSON.parse(pinnedArr));
      }
    }
    window.addEventListener('storage', pinnedListListener);
    return () => window.removeEventListener('storage', pinnedListListener);
  }, []);

  useEffect(() => {
    const getChainAssetsFn = async () => {
      const obj = await getChainAssets({
        protocols: ['Erc20'],
        account: data.fromAddress || wallet.address,
        chainNames: data.from ? [data.from] : null,
        wallet: wallet.wallet,
        price: true
      })
      const keys = Object.keys(obj);
      keys.forEach((item, index) => {
        obj[item] = obj[item].map(v => {
          v.chain = item;
          return v;
        })
      })
      const values = Object.values(obj);
      let arr = values.reduce((a, b) => b.concat(a), []);
      arr = arr.sort((a, b) => {
        const time = new Date().getTime();
        if ((a.highlightEndTime > time) || (b.highlightEndTime > time)) {
          return a.highlightEndTime < b.highlightEndTime ? 1 : -1;
        } else if (a.balance !== b.balance){
          return new BigNumber(Number(a.balance)).gt(Number(b.balance)) ? -1 : 1;
        } else if (a.chain !== b.chain) {
          return a.chain > b.chain ? 1 : -1;
        } else {
          return a.asset > b.asset ? 1 : -1;
        }
      })
      setList(arr);
    }
    showModal && getChainAssetsFn();
  }, [data.from, getChainAssets, showModal, data.fromAddress, wallet.wallet, wallet.address, loading]);

  useEffect(() => {
    if (showModal) setPageLoading(true);
    setFilterTxt('');
    setHotFilterTxt('');
  }, [showModal]);

  useEffect(() => {
    if (showModal) {
      if (!data.from || data.from !== curChain) setList([]);
      setPageLoading(true);
      if (allTokenList.length === 0 || !allTokenList) {
        const getAllChainAssetsFn = async () => {
          const obj = await getChainAssets({
            protocols: ['Erc20'],
            account: null,
            chainNames: null,
            wallet: null,
            price: true
          })
          const keys = Object.keys(obj);
          keys.forEach((item, index) => {
            obj[item] = obj[item].map(v => {
              v.chain = item;
              return v;
            })
          })
          const values = Object.values(obj);
          let arr = values.reduce((a, b) => b.concat(a), []);
          arr = arr.sort((a, b) => {
            const time = new Date().getTime();
            if ((a.highlightEndTime > time) || (b.highlightEndTime > time)) {
              return a.highlightEndTime < b.highlightEndTime ? 1 : -1;
            } else if (a.balance !== b.balance){
              return new BigNumber(a.balance).gt(b.balance) ? -1 : 1;
            } else if (a.chain !== b.chain) {
              return a.chain > b.chain ? 1 : -1;
            } else {
              return a.asset > b.asset ? 1 : -1;
            }
          })
          setAllTokenList(arr);
        }
        getAllChainAssetsFn();
      } else {
        const fromChain = data.from ? data.from : '';
        const arr = allTokenList.filter(v => v.chain.includes(fromChain));
        setList(arr);
      }
      data.from && setCurChain(data.from);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTokenList.length, data.from, getChainAssets, loading, showModal])

  useEffect(() => {
    if (!list || !list.length) {
      setPageLoading(true);
    } else {
      setPageLoading(false);
    }
  }, [list]);

  useEffect(() => {
    setPageLoading(true);
    setList([]);
    setAllTokenList([]);
  }, [refreshStatus]);

  return (
    <Modal visible={showModal} cancel={closeModal} size="s">
      {
        <Con>
          <TitleLine>
            <Title isdark={isdark}>Select<span style={{ fontSize: "12px" }}> </span>Asset</Title>
            <CloseBtn onClick={() => {
              closeModal()
            }} isdark={isdark} component={closeIcon}></CloseBtn>
          </TitleLine>
          <SearchTokenInp
            isdark={isdark}
            placeholder="Search Assets"
            value={filterTxt}
            onClick={e => e.stopPropagation()}
            onChange={e => handleInp(e)}
          ></SearchTokenInp>
          {
            (showModal && !pageLoading) ? (
              <ListCon>
                {
                  topList.map((v, i) => (
                    <ListItem
                      key={i}
                      fromAddr={address}
                      active={'true'}
                      item={v}
                      pinnedTokenList={pinnedTokenList}
                      closeModal={closeModal}
                    ></ListItem>
                  ))
                }
                <TopLine></TopLine>
                {
                  normalList.map((v, i) => (
                    <ListItem
                      key={i}
                      fromAddr={address}
                      active={'false'}
                      item={v}
                      pinnedTokenList={pinnedTokenList}
                      closeModal={closeModal}
                    ></ListItem>
                  ))
                }
              </ListCon>
            ) : (
              <ModalLoading></ModalLoading>
            )
          }
        </Con>
      }
    </Modal>
  )
};

export default TokenSelectModal;
