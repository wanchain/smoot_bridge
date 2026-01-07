import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled, { css } from 'styled-components';
import useSDK, { network } from "@/models/useSDK";
import {
  clipString,
  hideTail
} from '@/utils/utils';
import { useLocalStorage } from '@/context/localstorage';
import TokenInformationModal from "../TokenInformationModal";
import ExportTableModal from "../ExportTableModal";
import Status from "../Status";
import CopyBtn from "../CopyBtn";
import Icon from '@ant-design/icons';
import { ReactComponent as delBtnIcon } from 'images/icons/delBtn.svg';
import { ReactComponent as exportIcon } from 'images/icons/export.svg';
import { ReactComponent as routeArrowIcon } from 'images/icons/routeArrow.svg';
import { ReactComponent as rightIcon } from 'images/icons/rightIcon.svg';
import { isMobile } from "react-device-detect";
import DelHistoryWarningModal from "../DelHistoryWarningModal";
import BigNumber from 'bignumber.js';
import { testnetWalletTypeList, mainnetWalletTypeList } from "@/utils/connectWalletConfig";

const Body = styled.div`
  border-bottom: 1px solid ${(props) => props.isdark === 'dark' ? '#062E4B' : '#EBEFF2'};
  min-height: 736px;
`;

const Con = styled.div`
  padding: ${ isMobile ? '0 16px' : '0 24px' };
  height: 40px;
`;

const ToolLine = styled(Con)`
  display: flex;
  justify-content: space-between;
  
  ${
    isMobile && css`
      align-items: center;
    `
  }
`

const Tool = styled.div`
  display: flex;
  align-items: center;
`;

const Box = styled.div`
  border-radius: 2px;
  border: 1px solid ${(props) => props.isdark === 'dark' ? '#556874' : '#E3E3E3'};
  width: 14px;
  height: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  ${
    (props) => props.active === 'select' && css`
      border-color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};

      span {
        color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
      }
    `
  }

  ${
    isMobile && css`
      margin-right: 8px;
    `
  }
`;

const ChooseIcon = styled(Icon)`
  width: 14px;
  height: 14px;

  svg {
    width: 14px;
    height: 14px;
    color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
  }
`;

const ToolBtn = styled(Icon)`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${(props) => props.isdark === 'dark' ? '#062E4B' : '#F9F9FA'};
  margin-right: 16px;
  cursor: pointer;

  svg {
    width: 24px;
    height: 24px;
    color:${(props) => props.isdark === 'dark' ? '#2F5169' : '#D1D1D1'};

    ${
      (props) => props.active === 'active' && css`
        color:${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
      `
    }
  }

  ${
    isMobile && css`
      margin-right: 0;
      margin-left: 16px;
    `
  }

  &:hover {
    background: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
    
    svg {
      color: #fff;
    }
  }
`;

const Total = styled.p`
  display: flex;
  align-items: center;
  color: ${(props) => props.isdark === 'dark' ? '#556874' : '#CDCDCD'};
  text-align: right;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const TableCon = styled.table`
  width: 100%;
`;

const TableConMobile = styled.div`
  width: 100%;
  border-top: 1px solid ${(props) => props.isdark === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#eee'};
`;

const TrListMobile = styled.div`
  display: flex;
  padding: 16px 16px 0;
  background: ${(props) => props.isdark === 'dark' ? '#042033' : '#fff'};

  &:nth-child(even) {
    background: ${(props) => props.isdark === 'dark' ? '#042033' : '#fff'};
  }

  &:nth-child(odd) {
    background: ${(props) => props.isdark === 'dark' ? '#072539' : '#F7F7F8'};
  }
`;

const TbodyMobiled = styled.div`
  flex: 1;
`;

const TbodyItemMobiled = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const TbodyItemNameMobiled = styled.p`
  color: ${(props) => props.isdark === 'dark' ? '#818D96' :  '#999'};
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const TbodyItemConMobiled = styled.div`
  display: flex;
  align-items: center;
`;

const Thead = styled.thead`
  width: 100%;
  background: ${(props) => props.isdark === 'dark' ? '#072539' : '#F9F9FA'};
  height: 58px;
  color: ${(props) => props.isdark === 'dark' ? '#556874' : '#999'};
`;

const Tbody = styled.tbody`
  min-height: 638px;
  overflow-y: auto;
`;

const Tr = styled.tr`
  padding: 0 24px;
`;

const TrList = styled(Tr)`
  cursor: pointer;

  &:nth-child(even) {
    background:  ${(props) => props.isdark === 'dark' ? '#072539' : '#F9F9FA'};
  }

  &:nth-child(odd) {
    background: ${(props) => props.isdark === 'dark' ? '#042033' : '#FFF'};
  }

  ${
    (props) => props.active === 'select' && css`
      background: ${(props) => props.isdark === 'dark' ? '#062E4B' : '#E7F0F7'} !important;
    `
  }

  &:hover {
    background:  ${(props) => props.isdark === 'dark' ? '#0F334C' : '#E0E7EC'};
  }

  &:hover .box {
    border-color:  ${(props) => props.isdark === 'dark' ? '#818D96' : '#818d96'};
  }
`;

const Th = styled.th`
  text-align: left;
  
  &:first-child {
    padding-left: 24px;
  }
`;

const Td = styled.td`
  text-align: left;
  height: 58px;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  &:first-child {
    padding-left: 24px;
  }

  &:last-child {
    padding-right: 24px;
  }
`;

const TdCon = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
`;

const AssetName = styled.span`
  color: ${(props) => props.isdark === 'dark' ? '#fff' : '#333'};
`;

const AmountNum = styled.span`
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#333'};
`;

const RouteName = styled.span`
  color: ${(props) => props.isdark === 'dark' ? '#556874' : '#666'};
`;

const TimeNum = styled.span`
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#666'};
`;

const ArrowIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  margin: 0 4px;

  svg {
    width: 16px;
    height: 16px;
    color: #556874;
  }
`;

const TokenLogo = styled.img`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  margin-right: 4px;
`;

const Table = (props) => {
  const {
    protocols,
    page,
    total,
    num,
    handleHistoryNum,
    loading
  } = props;
  const [historyList, setHistoryList] = useState([]);
  const [chooseList, setChooseList] = useState([]);
  const [allChoose, setAllChoose] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [curInfo, setCurInfo] = useState(null);
  const [showDelWarnModal, setShowDelWarnModal] = useState(false);
  const { theme } = useLocalStorage();
  const {
    getAssetLogo,
    getHistory,
    deleteHistory
  } = useSDK();

  const curPage = useMemo(() => page, [page]);
  const curNum = useMemo(() => num, [num]);
  const curLoading = useMemo(() => loading, [loading]);
  const isdark = useMemo(() => theme, [theme]);

  const getBeforeFeeAmount = (info) => {
    if (!info || !info.fee) {
      return '0';
    }
    return info.amount;
  };

  const getHistoryList = useCallback((isUpdatePage) => {
    const list = getHistory({
      protocols: protocols,
      page: curPage - 1,
      number: curNum
    });
    setHistoryList(list);
    isUpdatePage && setChooseList(list.map(() => false));
    handleHistoryNum();
  }, [curNum, curPage, getHistory, handleHistoryNum, protocols]);

  useEffect(() => {
    getHistoryList(true);
    const timer = setInterval(() => {
      getHistoryList();
    }, 60 * 1000);
    return () => {
      clearInterval(timer);
    };
  }, [getHistoryList]);

  useEffect(() => {
    getHistoryList(true);
  }, [getHistoryList, curLoading]);

  useEffect(() => {
    if (chooseList.filter(v => !!v).length === historyList.length && historyList.length > 0) {
      setAllChoose(true);
    } else {
      setAllChoose(false);
    }
  }, [chooseList, historyList])

  const delFn = () => {
    if (chooseList.filter(v => !!v).length === 0) return;
    setShowDelWarnModal(true)
  }

  const delHistoryFn = async () => {
    const list = [];
    chooseList.forEach((item, index) => {
      if (item) list.push(historyList[index].taskId)
    });
    await deleteHistory({taskIds: list});
    handleHistoryNum();
    getHistoryList(true);
    setShowDelWarnModal(false);
  }

  const handlePoint = (value) => {
    const pointValue = value.wanPoints ? new BigNumber(value.wanPoints).integerValue(BigNumber.ROUND_DOWN).toFixed() : '-';
    let walletTypeConfig;
    if (network === 'testnet') {
      walletTypeConfig = testnetWalletTypeList;
    } else {
      walletTypeConfig = mainnetWalletTypeList;
    }
    const type = walletTypeConfig.get(value.fromChain)?.walletTypes;
    if (!type) {
      return pointValue;
    } else if (type.includes('evm')) {
      return pointValue;
    } else {
      return '-';
    }
  };

  return (
    <Body isdark={isdark}>
      <ToolLine>
        {
          isMobile && (
            <Box active={allChoose ? 'select' : ''} onClick={() => {
              let list = JSON.parse(JSON.stringify(chooseList));
              list = list.map(v => !allChoose);
              setChooseList(list);
              setAllChoose(!allChoose);
            }} isdark={isdark}>
              { allChoose && <span>-</span> }
            </Box>
          )
        }
        <Tool>
          <ToolBtn
            active={chooseList.filter(v => !!v).length > 0 ? 'active' : ''}
            isdark={isdark}
            component={delBtnIcon}
            onClick={delFn}
          ></ToolBtn>
          {
            !isMobile ? (
              <ToolBtn
                isdark={isdark}
                component={exportIcon}
                onClick={() => {
                  setShowExportModal(!showExportModal);
                }}
              ></ToolBtn>
            ) : null
          }
        </Tool>
        { !isMobile && <Total isdark={isdark}>Total {total} historical records</Total> }
      </ToolLine>
      {
        isMobile ? (
          <TableConMobile isdark={isdark}>
            {
              historyList.map((item, index) => {
                return (
                  <TrListMobile
                    isdark={isdark}
                    onClick={() => {
                      setShowModal(!showModal);
                      setCurInfo(historyList[index]);
                    }}
                  >
                    <Box active={chooseList[index] ? 'select' : ''} isdark={isdark} onClick={(e) => {
                      e.stopPropagation();
                      const list = JSON.parse(JSON.stringify(chooseList));
                      list[index] = !list[index];
                      setChooseList(list);
                    }}>
                      { chooseList[index] && ( <ChooseIcon isdark={isdark} component={rightIcon}></ChooseIcon> )}  
                    </Box>
                    <TbodyMobiled>
                      <TbodyItemMobiled>
                        <TbodyItemNameMobiled isdark={isdark}>Asset</TbodyItemNameMobiled>
                        <TbodyItemConMobiled>
                          <TokenLogo src={getAssetLogo(item.asset, item.protocol)} />
                          <AssetName isdark={isdark}>{hideTail(item.assetAlias || item.asset, 6)}</AssetName>
                        </TbodyItemConMobiled>
                      </TbodyItemMobiled>
                      <TbodyItemMobiled>
                        <TbodyItemNameMobiled isdark={isdark}>Amount</TbodyItemNameMobiled>
                        <TbodyItemConMobiled>
                          <AmountNum isdark={isdark}>{hideTail(getBeforeFeeAmount(item), 10)}</AmountNum>
                        </TbodyItemConMobiled>
                      </TbodyItemMobiled>
                      <TbodyItemMobiled>
                        <TbodyItemNameMobiled isdark={isdark}>Route</TbodyItemNameMobiled>
                        <TbodyItemConMobiled>
                          <RouteName isdark={isdark}>{hideTail(item.fromChain, 16)}</RouteName>
                          <ArrowIcon isdark={isdark} component={routeArrowIcon}></ArrowIcon>
                          <RouteName isdark={isdark}>{hideTail(item.toChain, 16)}</RouteName>
                        </TbodyItemConMobiled>
                      </TbodyItemMobiled>
                      <TbodyItemMobiled>
                        <TbodyItemNameMobiled isdark={isdark}>To Address</TbodyItemNameMobiled>
                        <TbodyItemConMobiled>
                          <AssetName isdark={isdark}>{clipString(item.toAccount, 8)}</AssetName>&nbsp;
                          <CopyBtn size={'18'} text={item.toAccount} />
                        </TbodyItemConMobiled>
                      </TbodyItemMobiled>
                      <TbodyItemMobiled>
                        <TbodyItemNameMobiled isdark={isdark}>Time</TbodyItemNameMobiled>
                        <TbodyItemConMobiled>
                          <TimeNum isdark={isdark}>
                            {new Date(item.timestamp).toLocaleString('chinese', {
                              hour12: false,
                            })}
                          </TimeNum>
                        </TbodyItemConMobiled>
                      </TbodyItemMobiled>
                      <TbodyItemMobiled>
                        <TbodyItemNameMobiled isdark={isdark}>Status</TbodyItemNameMobiled>
                        <TbodyItemConMobiled><Status status={item.status}></Status></TbodyItemConMobiled>
                      </TbodyItemMobiled>
                      {/* <TbodyItemMobiled>
                        <TbodyItemNameMobiled isdark={isdark}>Points</TbodyItemNameMobiled>
                        <TbodyItemConMobiled>{handlePoint(item)}</TbodyItemConMobiled>
                      </TbodyItemMobiled> */}
                    </TbodyMobiled>
                  </TrListMobile>
                )
              })
            }
          </TableConMobile>
        ) : (
          <TableCon>
            <Thead isdark={isdark}>
              <Tr>
                <Th>
                  <Box active={allChoose ? 'select' : ''} onClick={() => {
                    let list = JSON.parse(JSON.stringify(chooseList));
                    list = list.map(v => !allChoose);
                    setChooseList(list);
                    setAllChoose(!allChoose);
                  }} isdark={isdark}>
                    { allChoose && <span>-</span> }
                  </Box>
                </Th>
                <Th>Asset</Th>
                <Th>Amount</Th>
                <Th>Route</Th>
                <Th>To Address</Th>
                <Th>Time</Th>
                <Th>Status</Th>
                {/* <Th>Points</Th> */}
              </Tr>
            </Thead>
            <Tbody>
              {
                historyList.map((item, index) => {
                  return (
                    <TrList
                      key={index}
                      active={chooseList[index] ? 'select' : ''}
                      isdark={isdark}
                      onClick={() => {
                        setShowModal(!showModal);
                        setCurInfo(historyList[index]);
                      }}
                    >
                      <Td><Box className="box" active={chooseList[index] ? 'select' : ''} isdark={isdark} onClick={(e) => {
                        e.stopPropagation();
                        const list = JSON.parse(JSON.stringify(chooseList));
                        list[index] = !list[index];
                        setChooseList(list);
                      }}>
                        { chooseList[index] && ( <ChooseIcon isdark={isdark} component={rightIcon}></ChooseIcon> )}  
                      </Box></Td>
                      <Td>
                        <TdCon>
                          <TokenLogo src={getAssetLogo(item.asset, item.protocol)} />
                          <AssetName isdark={isdark}>{hideTail(item.assetAlias || item.asset, 6)}</AssetName>
                        </TdCon>
                      </Td>
                      <Td>
                        <AmountNum isdark={isdark}>{hideTail(getBeforeFeeAmount(item), 10)}</AmountNum>
                      </Td>
                      <Td>
                        <TdCon>
                          <RouteName isdark={isdark}>{hideTail(item.fromChain, 16)}</RouteName>
                          <ArrowIcon isdark={isdark} component={routeArrowIcon}></ArrowIcon>
                          <RouteName isdark={isdark}>{hideTail(item.toChain, 16)}</RouteName>
                        </TdCon>
                      </Td>
                      <Td>
                        <TdCon>
                          <AssetName isdark={isdark}>{clipString(item.toAccount, 8)}</AssetName>&nbsp;
                          <CopyBtn size={'18'} text={item.toAccount} />
                        </TdCon>
                      </Td>
                      <Td>
                        <TimeNum isdark={isdark}>
                          {new Date(item.timestamp).toLocaleString('chinese', {
                            hour12: false,
                          })}
                        </TimeNum>
                      </Td>
                      <Td><Status status={item.status}></Status></Td>
                      {/* <Td><AssetName isdark={isdark}>{handlePoint(item)}</AssetName></Td> */}
                    </TrList>
                  )
                })
              }
            </Tbody>
          </TableCon>
        )
      }

      <TokenInformationModal
        visible={showModal}
        cancel={() => setShowModal(false)}
        info={curInfo}
      ></TokenInformationModal>

      <ExportTableModal
        visible={showExportModal}
        cancel={() => setShowExportModal(false)}
        totalNum={total}
        protocols={protocols}
      ></ExportTableModal>

      <DelHistoryWarningModal
        onClose={() => setShowDelWarnModal(false)}
        showModal={showDelWarnModal}
        onConfirm={() => delHistoryFn()}
      ></DelHistoryWarningModal>
    </Body>
  )
}

export default Table;