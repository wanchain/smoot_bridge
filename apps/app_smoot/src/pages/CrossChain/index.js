import React, { useState, useContext, useEffect, useMemo, useCallback, useRef } from "react";
import styled, { css } from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';
import ChainSelectButton from "@/components/ChainSelectButton";
import TokenSelectButton from "@/components/TokenSelectButton";
import Icon from '@ant-design/icons';
import { ReactComponent as swapIcon } from 'images/icons/swap.svg';
import { ReactComponent as infoIcon } from 'images/icons/info.svg';
import { ReactComponent as editorIcon } from 'images/icons/editor.svg';
import { ReactComponent as walletIcon } from 'images/icons/walletIcon.svg';
import { ReactComponent as xflowShowTokenDeepIcon } from 'images/icons/xflowShowTokenDeep.svg';
import { ReactComponent as xflowShowTokenLightIcon } from 'images/icons/xflowShowTokenLight.svg';
import { ReactComponent as finishToAddrDeepIcon } from 'images/icons/finishToAddrDeep.svg';
import { ReactComponent as finishToAddrLightIcon } from 'images/icons/finishToAddrLight.svg';
import confirmLoadingDeep from 'images/confirmLoadingDeep.webp';
import confirmLoadingLight from 'images/confirmLoadingLight.webp';
import { useNavigate } from 'react-router-dom';
import { WalletContext } from '@/utils/Wallet';
import WalletModal from '@/components/WalletModal';
import useFormDataModel from "@/models/useFormData";
import useSDK, { network } from "@/models/useSDK";
import { parseFee, clipString2, commafy3 } from '@/utils/utils';
import BigNumber from "bignumber.js";
import { testnetWalletTypeList, mainnetWalletTypeList } from "../../utils/connectWalletConfig";
import Tip from "../../components/Tip";
import TokenAddress from "../../components/TokenAddress";
import RecipientWarningModal from "../../components/RecipientWarningModal";
import { message } from 'antd';
import { isMobile } from 'react-device-detect';

let timer2 = null;
let timer = null;

const CrossChain = () => {
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  const wallet = useContext(WalletContext);
  const switchNetwork = wallet.switchNetwork;
  const connected = wallet.connected;
  const toConnected = wallet.toConnected;
  const address = wallet.address;
  const navigate = useNavigate();
  const { data, modify } = useFormDataModel();
  const {
    bridge,
    validateAddress,
    estimateFee,
    accountTime,
    getToChains,
    tokenProtocol,
    loading,
  } = useSDK();
  const [showModal, setShowModal] = useState(false);
  const [balance, setBalance] = useState('N/A');
  const [fee, setFee] = useState({});
  const [paireInfo, setPairInfo] = useState(data.paireInfo);
  const [toAddressErr, setToAddressErr] = useState(false);
  const [amountErr, setAmountErr] = useState(false);
  const [allowInpToAddr, setAllowInpToAddr] = useState(false);
  const [inpToAddr, setInpToAddr] = useState('');
  const [curDirction, setCurDirction] = useState('from');
  const [showWarnModal, setShowWarnModal] = useState(false);
  const [showAddrServiceModal, setShowAddrServiceModal] = useState(false);
  const [showNextLoading, setShowNextLoading] = useState(false);
  const [curShowFromAddr, setCurShowFromAddr] = useState('');

  useEffect(() => {
    if (loading) return;
    const fn = async () => {
      if (window.location.href.includes('asset')) {
        const searchArr = window.location.href.split('?')[1].split('&');
        const assetStr = decodeURI(searchArr.filter((v) => v.includes('asset'))[0]);
        const fromStr = decodeURI(searchArr.filter((v) => v.includes('from'))?.[0]);
        if (!assetStr || !fromStr) return;
        // asset & from
        const token = assetStr.split('=')[1];
        const from = fromStr.split('=')[1];
        const arr = await getToChains(token, from, { protocols: 'Erc20' });
        modify({
          asset: token,
          protocol: 'Erc20',
          from: from,
          amount: 0,
          balance: 0,
          to: null,
        });
        checkWalletNetwork();
        // to
        const toStr = decodeURI(searchArr.filter((v) => v.includes('to'))?.[0]);
        if (toStr) {
          const to = toStr.split('=')[1];
          if (arr.includes(to)) {
            modify({
              to: to
            })
          }
        }
        // amount
        const amountStr = decodeURI(searchArr.filter((v) => v.includes('amount'))?.[0]);
        if (amountStr) {
          const amount = Number(amountStr.split('=')[1]);
          if (!isNaN(amount)) {
            modify({
              amount: amount
            })
          }
        }
      }
    };

    fn();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, switchNetwork, tokenProtocol]);

  const walletTypeConfig = useMemo(() => {
    if (network === 'testnet') {
      return testnetWalletTypeList;
    } else {
      return mainnetWalletTypeList;
    }
  }, []);

  const getWalletTypeFn = useCallback((name) => {
    const type = walletTypeConfig.get(name)?.walletTypes;
    return type ? type : ['evm'];
  }, [walletTypeConfig]);

  const checkToAddress = (address) => {
    if (address === '') {
      setToAddressErr(false);
    }
    if (!!data.to && !!address) {
      let isValid = validateAddress(data.to, address);
      setToAddressErr(!isValid);
    } else {
      setToAddressErr(true);
    }
  }

  useEffect(() => {
    if (!wallet.toConnected) return;
    data.toAddress && checkToAddress(data.toAddress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.toConnected, data.toAddress])

  const checkNetwork = useCallback(async () => {
    try {
      // if (wallet.name === 'walletconnect') return true;
      if (['Noble', 'Cosmos', 'Kava'].includes(data.from)) {
        const chainInfo = await bridge.getChainInfo(data.from);
        chainInfo && wallet.wallet.setChainId(chainInfo.chainId);
        chainInfo && await wallet.resetAccount('from');
        chainInfo && window.localStorage.setItem('fromConnectWalletChain', chainInfo.chainId);
      } else if (['Polkadot', 'Phala'].includes(data.from)) {
        wallet.wallet.setChain(data.from, network);
        window.localStorage.setItem('fromConnectWalletChain', data.from);
        await wallet.resetAccount('from');
      }
      const res = await bridge.checkWallet(data.from, wallet.wallet);
      if (!res) {
        switchNetwork(data.from, wallet.wallet);
        return false;
      } else {
        return true;
      }
    } catch (e) {
      console.error(e)
      message.warning('Wrong Network')
      return false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge, data.from, switchNetwork, wallet.wallet, network]);

  const checkWalletFn = useCallback(() => {
    const curWalletType = wallet.type;
    const sWalletType = getWalletTypeFn(data.from);
    if (!sWalletType.includes(curWalletType)) {
      setCurDirction('from');
      setShowModal(true);
      return false;
    }
    return true;
  }, [data.from, getWalletTypeFn, wallet.type])

  const checkWalletNetwork = useCallback(() => {
    const fn = async () => {
      if (!data.from) return;
      const checkFn = async () => {
        return await checkNetwork();
      }
     
      if (!checkWalletFn()) return false;
      return await checkFn();
    }
    return fn;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkWalletFn, data.from, wallet.isSelectOneTimeAddr])

  useEffect(() => {
    checkWalletNetwork()();
  }, [checkWalletNetwork, walletTypeConfig])

  const onSwap = async () => {
    if (!data.to) {
      return;
    }
    let to;
    const chainList = await getToChains(data.asset, data.to, { protocols: data.protocol })
    if (chainList.includes(data.from)) {
      to = data.from;
    } else {
      to = null;
    }
    modify({
      from: data.to,
      to: to,
      toAddress: null,
      amount: null
    });
  };

  const onConnect = () => {
    setShowModal(true);
  }

  const onNext = async () => {
    setShowNextLoading(true);

    if (allowInpToAddr) {
      setShowNextLoading(false);
      message.warning('The To address is still in edit mode, please confirm it before clicking Next.');
      return;
    }

    if (!connected) {
      message.warning('Wrong Wallet.');
      setShowModal(true);
      setShowNextLoading(false);
      return;
    }

    if (!await checkWalletNetwork()()) {
      message.warning('Wrong Network / Wallet.');
      setShowNextLoading(false);
      return;
    }

    if (!data.asset) {
      message.warning('Asset pair is not selected yet.');
      setShowNextLoading(false);
      return;
    }

    if (!data.from || !data.to) {
      message.warning('From / To is not selected yet.');
      setShowNextLoading(false);
      return;
    }

    if (!data.fromAddress || !data.toAddress) {
      message.warning('From / To Address is not Input yet.');
      setToAddressErr(true);
      setShowNextLoading(false);
      return;
    }

    if (!await bridge.validateRecipient(data.to, data.toAddress)) {
      message.warning('Invalid Address.');
      setToAddressErr(true);
      setShowNextLoading(false);
      return;
    }

    if (toAddressErr) {
      message.warning('Invalid Address.');
      setShowNextLoading(false);
      return;
    }

    if (amountErr || !Number(data.amount)) {
      message.warning('Invalid Amount.');
      setShowNextLoading(false);
      return;
    }

    if (!Object.keys(fee).length) {
      message.warning('fee not available');
      setShowNextLoading(false);
      return;
    }

    // const feeResObj = formatParseFee(fee, data, false);

    if (balance !== 'N/A' && Number(data.amount) > Number(balance)) {
      message.warning('Balance not enough.');
      setShowNextLoading(false);
      return;
    }

    if (!Number(receiveAmount)) {
      message.warning('Amount too small.');
      setShowNextLoading(false);
      return;
    }

    setShowWarnModal(true);
  };

  const handleConfirm = () => {
    setShowNextLoading(false);
    navigate('/AssetBridge/Confirmation');
  };

  const receiveAmount = useMemo(() => {
    let num = new BigNumber(0);
    let asset = data.asset;
    if (!asset || !fee.networkFee || !fee.operateFee) return num;
    if (['BTC.a', 'wanBTC'].includes(asset)) asset = 'BTC';
    if (asset === fee.networkFee.unit)
      num = num.plus(parseFee(fee, data.amount, 'networkFee', false));
    if (asset === fee.operateFee.unit)
      num = num.plus(parseFee(fee, data.amount, 'operateFee', false));
    const value = new BigNumber(data.amount).minus(num);

    if (value.gt(0)) {
      modify({receiveAmount: value.toString()});
      return value;
    }
    modify({receiveAmount: '0'});
    return new BigNumber(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.amount, data.asset, fee]);

  // get fromAddress
  useEffect(() => {
    if (!connected) return;
    if (!data.from) return;
    if (data.fromAddress && data.fromAddress === address) return;
    if (data.fromAddress && data.fromAddress === wallet.curAddress) return;
    modify({ fromAddress: wallet.curAddress || address });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, connected, data.from, data.fromAddress]);

  const t = () => {
    clearTimeout(timer2);
    clearInterval(timer);
  }

   // update balance
   useEffect(() => {
    setBalance(0);
    if (!!data.asset) {
      try {
        const address = wallet.curAddress || data.fromAddress;
        if (!address) return;
        const func = async () => {
          let opt = {
            wallet: wallet.wallet,
            protocol: data.protocol,
          };
          const checkAddress = validateAddress(data.from, address);
          if (!checkAddress) return;
          let balance = await bridge.getAccountBalance(
            data.asset,
            data.from,
            address,
            opt,
          );
          balance = balance ? balance : '0';
          setBalance(balance);
        };
        timer2 = setTimeout(async () => {
          func();
          timer = setInterval(func, 20000);
        }, 0);
      } catch (e) {
        console.log('get balance failed.');
      }
    } else {
      console.log('data not ready');
    }

    return () => t();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.asset, data.protocol, data.fromAddress, data.from, data.to, wallet.wallet, bridge, wallet.curAddress]);

  useEffect(() => {
    return () => t();
  }, []);

  // update fee
  useEffect(() => {
    async function getFee() {
      if (!!data.from && !!data.to) {
        let fee = await estimateFee(data.asset, data.from, data.to, {
          protocol: data.protocol,
          address: [data.fromAddress, data.toAddress],
        });
        setFee(fee);
      }
    }
    getFee();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data.asset,
    data.from,
    data.to,
    data.toAddress,
    data.protocol,
    estimateFee,
    accountTime,
  ]);

  // update pair info
  useEffect(() => {
    if (!data.asset || !data.to) return;
    let assetPairInfo = bridge.getAssetPairInfo(data.asset, data.from, data.to, {protocols: ["Erc20"]});
    setPairInfo(assetPairInfo);
    modify({
      paireInfo: assetPairInfo
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge, data.asset, data.from, data.to]);

  const isNativeCoin = (direction) => {
    if (!paireInfo) return false;
    if (!paireInfo[direction].address) return false;
    return paireInfo[direction].address === '0x0000000000000000000000000000000000000000';
  }

  const showToWalletIcon = useMemo(() => {
    if (!data.from || !data.to) return false;
    const fromType = getWalletTypeFn(data.from);
    const toType = getWalletTypeFn(data.to);
    if (fromType.includes('evm') && toType.includes('evm')) {
      return false;
    } else {
      return true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getWalletTypeFn, data.from, data.to, connected]);

  useEffect(() => {
    if (!data.from || !data.to) return;
    const fromType = getWalletTypeFn(data.from);
    const toType = getWalletTypeFn(data.to);
    if (data.toAddress === null && fromType.includes('evm') && toType.includes('evm')) {
    // if (fromType.includes('evm') && toType.includes('evm')) {
      const addr = data.fromAddress || address;
      checkToAddress(addr);
      modify({
        toAddress: addr
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.from, data.fromAddress, data.to, data.toAddress, getWalletTypeFn, toConnected]);

  useEffect(() => {
    if (!data.to) return;
    const fromType = getWalletTypeFn(data.from);
    const toType = getWalletTypeFn(data.to);
    if (fromType.includes('evm') && toType.includes('evm')) {
      // if (fromType.includes('evm') && toType.includes('evm')) {
        const addr = data.fromAddress || address;
        checkToAddress(addr);
        modify({
          toAddress: addr
        })
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.fromAddress])

  const walletType = useMemo(() => {
    if (!data.from || !walletTypeConfig) return null;
    if (curDirction === 'from') {
      return getWalletTypeFn(data.from);
    } else {
      if (!data.to) return null;
      return getWalletTypeFn(data.to);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curDirction, data.from, data.to, getWalletTypeFn]);

  useEffect(() => {
    setInpToAddr(data.toAddress ? data.toAddress : '');
    if (!data.toAddress) setToAddressErr(false);
  }, [data.toAddress]);

  useEffect(() => {
    const fn = async () => {
      let addr = wallet.curAddress || data.fromAddress || address;
      if (!addr) return;
      setCurShowFromAddr(addr);
    }

    fn();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.curAddress, data.fromAddress, address]);

  return (
    <Content>
      <Body isdark={isdark}>
        <TitleLine>
          <Title isdark={isdark}><span>Asset</span><span style={{ fontSize: "12px" }}> </span><TitleText isdark={isdark}>Bridge</TitleText></Title>
        </TitleLine>

        <RecipientWarningModal
          showModal={showWarnModal}
          onClose={() => {
            setShowNextLoading(false);
            setShowWarnModal(false);
          }}
          onConfirm={handleConfirm}
        ></RecipientWarningModal>

        <ConItem isdark={isdark}>
          <ConLeft isdark={isdark}>
            <ItemText>From Chain</ItemText>
            <ChainSelectButton
              direction={'from'}
              data={data}
              modify={modify}
              protocol={['Erc20']}
              refreshStatus={'normal'}
            ></ChainSelectButton>
            <InpCon isClick={null}>
              <InpDefault isdark={isdark}>
                {
                  connected ?
                    clipString2(curShowFromAddr, isMobile ? 12 : 16, isMobile ? 14 : 18) :
                      'This is the source chain address'
                }
              </InpDefault>
            </InpCon>
          </ConLeft>
          <ConRight>
            <ItemText>Asset</ItemText>
            <TokenSelectButton direction={'from'} refreshStatus={'normal'}></TokenSelectButton>
            <IssuedTxt isdark={isdark}>
              {
                data.to && !isNativeCoin('from') ? (
                  <Tip
                    child={<XflowShowTokenIcon isdark={isdark} component={isdark === 'dark' ? xflowShowTokenDeepIcon : xflowShowTokenLightIcon}></XflowShowTokenIcon>}
                    title={
                      <TokenAddress
                        tokenName={paireInfo.from.symbol}
                        tokenAddr={paireInfo.from.address}
                        chain={data.from}
                        asset={data.asset}
                      ></TokenAddress>}
                    style={{maxWidth: isMobile ? 'calc(100vw -20px)' : '440px'}}
                  ></Tip>
                ) : null
              }
            </IssuedTxt>
          </ConRight>
        </ConItem>

        <SwapCon>
          <SwapIcon component={swapIcon} onClick={onSwap}></SwapIcon>
        </SwapCon>

        <ConItem isdark={isdark}>
          <ConLeft isdark={isdark}>
            <ItemText>
              To Chain
              {
                toAddressErr ? (
                  <TextError>Invalid Address</TextError>
                ) : null
              }
            </ItemText>
            <ChainSelectButton
              direction={'to'}
              data={data}
              modify={modify}
              protocol={['Erc20']}
              mb={'8'}
            ></ChainSelectButton>
            <ToAddrCon editor={String(allowInpToAddr)} texterr={String(toAddressErr)}>
              {
                allowInpToAddr ? (
                  <Inp isdark={isdark} placeholder="Enter the destination chain address" value={inpToAddr ? inpToAddr : ''} texterr={toAddressErr.toString()} onChange={(e) => {
                    const value = e.target.value;
                    setInpToAddr(value);
                  }}></Inp>
                ) : (
                  <InpToDefault isdark={isdark} isoneid={String(Boolean(data.toOneId))} placeholder={String(Boolean(!data.toAddress))} texterr={toAddressErr.toString()}>
                    {
                      data.toAddress ?
                        clipString2(data.toAddress, isMobile ? 12 : 16, isMobile ? 14 : 18)
                      : 'Enter the destination chain address'
                    }
                  </InpToDefault>
                )
              }
              <BtnGroup>
                <EditorBtn
                  isdark={isdark}
                  component={allowInpToAddr ? isdark === 'dark' ? finishToAddrDeepIcon : finishToAddrLightIcon : editorIcon}
                  onClick={() => {
                    if (allowInpToAddr) {
                      checkToAddress(inpToAddr);
                      modify({
                        toAddress: inpToAddr,
                        toOneId: ''
                      });
                    } else {
                      setInpToAddr(data.toAddress);
                    }
                    setAllowInpToAddr(!allowInpToAddr)
                  }}
                ></EditorBtn>
                {
                  showToWalletIcon && <Tip title="Click to use current connected wallet address" child={
                    <WalletBtn isdark={isdark} component={walletIcon} onClick={() => {
                      setCurDirction('to');
                      setShowModal(true);
                    }}></WalletBtn>
                  } style={{maxWidth: '208px'}}></Tip>
                }
              </BtnGroup>
            </ToAddrCon>
          </ConLeft>
          <ConRight>
            <ItemText>Asset</ItemText>
            <TokenSelectButton direction={'to'} banClick={true}></TokenSelectButton>
            <IssuedTxt isdark={isdark}>
              {
                data.to && !paireInfo?.to?.issuer?.isNativeCoin ? (
                  <Tip
                    child={<XflowShowTokenIcon isdark={isdark} component={isdark === 'dark' ? xflowShowTokenDeepIcon : xflowShowTokenLightIcon}></XflowShowTokenIcon>}
                    title={
                      <TokenAddress
                        tokenName={paireInfo.to.symbol}
                        tokenAddr={paireInfo.to.address}
                        chain={data.to}
                        asset={data.asset}
                      ></TokenAddress>
                    }
                    style={{maxWidth: isMobile ? 'calc(100vw -20px)' : '440px'}}
                  ></Tip>
                ) : null
              }
            </IssuedTxt>
          </ConRight>
        </ConItem>

        <AmountLine isdark={isdark}>
          Amount
          {
            !isMobile ? (
              <BalanceData isdark={isdark}>
                Balance:&nbsp;<BalanceText isdark={isdark}>{balance === 'N/A' ? 'N/A' : commafy3(balance, data.asset)}&nbsp;{paireInfo.from.symbol ? paireInfo.from.symbol : data.asset}</BalanceText>
                {
                  Number(data.amount) ? (
                    <BalanceData isdark={isdark}>
                      { !isMobile && <>&nbsp;<Line></Line>&nbsp;</>}You will receive:&nbsp;
                      <BalanceText isdark={isdark}>
                        {commafy3(receiveAmount.toString(), data.asset)}&nbsp;{paireInfo.to.symbol ? paireInfo.to.symbol : data.asset}
                      </BalanceText>
                    </BalanceData>
                  ) : null
                }
              </BalanceData>
            ) : null
          }
        </AmountLine>

        <InpAmountLine isdark={isdark} texterr={amountErr.toString()}>
          <InputAmount isdark={isdark} value={data.amount ? data.amount : ''} onChange={(e) => {
            let value = e.target.value;
            if (!String(value).includes('.')) {
              value = isNaN(Number(value)) ? value : Number(value).toString();
            }
            let status = false;
            let _check1 = /^([1-9][\d]*|0)(\.[\d]+)?$/;

            if (!data.to) {
              status = true;
            }

            // not number
            if (!_check1.test(value)) {
              status = true;
            }

            const decimal = new BigNumber(paireInfo.from.decimals).gt(paireInfo.to.decimals) ? paireInfo.to.decimals : paireInfo.from.decimals;

            // number too small
            if (Number(value) < 1 / 10 ** decimal) {
              status = true;
            }

            // decimals too long
            let str = value.toString().split('.');
            if (
              str.length > 1 &&
              str[1].length > Number(decimal)
            ) {
              status = true;
            }
            setAmountErr(status)
            modify({
              amount: value
            })
          }} placeholder="0.0"></InputAmount>
        </InpAmountLine>

        <ReceiveLine>
          {
            isMobile ? (
              <BalanceData isdark={isdark}>
                Balance:&nbsp;<BalanceText isdark={isdark}>{balance === 'N/A' ? 'N/A' : commafy3(balance, data.asset)}&nbsp;{paireInfo.from.symbol ? paireInfo.from.symbol : data.asset}</BalanceText>
                {
                  Number(data.amount) ? (
                    <BalanceData isdark={isdark}>
                      { !isMobile && <>&nbsp;<Line></Line>&nbsp;</>}You will receive:&nbsp;
                      <BalanceText isdark={isdark}>
                        {commafy3(receiveAmount.toString(), data.asset)}&nbsp;{paireInfo.to.symbol ? paireInfo.to.symbol : data.asset}
                      </BalanceText>
                      &nbsp;<Tip title="The amount you will receive with fee deducted" child={<InfoIcon component={infoIcon}></InfoIcon>}></Tip>
                    </BalanceData>
                  ) : null
                }
              </BalanceData>
            ) : null
          }
        </ReceiveLine>

        {
          connected ? (
            <NextBtn onClick={() => onNext()}>
              {
                showNextLoading ? (
                  <ConfrimLoading src={isdark === 'dark' ? confirmLoadingDeep : confirmLoadingLight}></ConfrimLoading>
                ) : 'Next'
              }
            </NextBtn>
          ) : (
            <NextBtn onClick={() => onConnect()}>Connect Wallet</NextBtn>
          )
        }

        <WalletModal
          showModal={showModal}
          direction={curDirction}
          type={walletType}
          closeModal={() => setShowModal(false)}
        ></WalletModal>
      </Body>
    </Content>
  )
};

export default CrossChain;

const ConfrimLoading = styled.img``;

const XflowShowTokenIcon = styled(Icon)`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${(props) => props.isdark === 'dark' ? '#0B2C43' : '#FFFFFF'};
  cursor: pointer;

  svg {
    width: 22px;
    height: 22px;
  }
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 auto;
  ${
    isMobile && css`
      flex-direction: column;
      align-items: center;
    `
  }
`;

const Body = styled.div`
  width: 746px;
  border-radius: 12px;
  padding: 24px;
  background: ${(props) => props.isdark === 'dark' ? '#042033' : '#FFFFFF'};
  position: relative;

  ${
    isMobile && css`
      width: calc(100vw - 40px - 32px);
      padding: 16px;
      margin-top: 16px;
    `
  }
`;

const TitleLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${ isMobile ? '16px' : '24px'};
`;

const Title = styled.div`
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
  font-family: PangMenZhengDao;
  font-size: ${ isMobile ? '20px' : '24px'};
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const TitleText = styled.span`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333'};
`;

const ConItem = styled.div`
  border-radius: 12px;
  border: 1px solid ${(props) => props.isdark === 'dark' ? '#1E3B4F' : '#EFEFEF'};
  background: ${(props) => props.isdark === 'dark' ? '#05253B' : '#F7F7F8'};
  display: flex;
  flex-direction: ${ isMobile ? 'column' : 'row'};
`;

const ConLeft = styled.div`
  padding: 16px 16px 10px;
  flex: 1;

  ${
    isMobile && css`
      border-bottom: 1px solid ${(props) => props.isdark === 'dark' ? '#1E3B4F' : '#EFEFEF'};
    `
  }

  ${
    !isMobile && css`
      border-right: 1px solid ${(props) => props.isdark === 'dark' ? '#1E3B4F' : '#EFEFEF'};
    `
  }
`;

const ItemText = styled.div`
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#999'};
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
`;

const ConRight = styled.div`
  padding: 16px;
`;

const InpCon = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: ${(props) => props.isClick === 'true' ? 'pointer' : 'unset'};
`;

const InpDefault = styled.p`
  color: ${(props) => props.isoneid === 'true' ? props.isdark === 'dark' ? '#2fbdf4' : '#0f68aa' : props.isdark === 'dark' ? '#818D96' : '#999'};
  font-family: Inter;
  font-size: 14px;
  font-style: italic;
  font-weight: 400;
  line-height: normal;
`;

const IssuedTxt = styled.div`
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#999'};
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  display: flex;
`;

const ToAddrCon = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  border: 1px solid rgba(0, 0, 0, 0);
  padding: 12px 0;
  position: relative;
  align-items: center;

  ${(props) => props.editor === 'true' && css`
    border-color: ${(props) => props.isdark === 'dark' ? '#0F68AA' : '#0F68AA'};
    padding: 12px 10px 12px 12px;
    align-items: center;
    width: calc(100% - 24px);
    border-radius: 8px;
  `}

  ${(props) => props.texterr === 'true' && css`
    border-color: ${(props) => props.isdark === 'dark' ? '#D93737' : '#D93737'};
    padding: 12px 10px 12px 12px;
    align-items: center;
    width: calc(100% - 24px);
    border-radius: 8px;
  `}
`;

const BtnGroup = styled.div`
  display: flex;
`;

const EditorBtn = styled(Icon)`
  width: 20px;
  height: 20px;
  cursor: pointer;
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#D8D8D8'};

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    svg {
      color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
    }
  }
`;

const WalletBtn = styled(EditorBtn)`
  margin-left: 8px;
`;

const Inp = styled.input`
  flex: 1;
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#333'};
  font-family: Inter;
  font-size: 14px;
  font-style: italic;
  font-weight: 400;
  line-height: normal;
  background: none;
  border: none;
  outline: none;

  &:placeholder {
    color: ${(props) => props.isdark === 'dark' ? '#3C4F5C;' : '#C6C6C6'};
  }

  &:disabled {
    // color: ${(props) => props.isdark === 'dark' ? '#3C4F5C;' : '#C6C6C6'};
    color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#333'};
  }

  ${
    (props) => props.texterr === 'true' && css`
      color: #D93737 !important;
    `
  }
`;

const InpToDefault = styled.div`
  flex: 1;
  color: ${(props) => props.isdark === 'dark' ? props.isoneid === 'true' ? '#fff' : '#818D96' : '#333'};
  font-family: Inter;
  font-size: 14px;
  font-style: ${(props) => props.isoneid === 'true' ? 'normal' : 'italic'};
  font-weight: 400;
  line-height: normal;
  background: none;
  border: none;
  outline: none;

  ${
    (props) => props.placeholder === 'true' && css`
      color: ${(props) => props.isdark === 'dark' ? '#3C4F5C;' : '#C6C6C6'};
    `
  }

  ${
    (props) => props.texterr === 'true' && css`
      color: #D93737 !important;
    `
  }

  ${
    isMobile && css`
      display: flex;
      flex-direction: column;
    `
  }
`;

const SwapCon = styled.div`
  position: relative;
  height: 40px;
  padding: 16px 0;
`;

const SwapIcon = styled(Icon)`
  width: 40px;
  height: 40px;
  display: block;
  margin: 0 auto;
  cursor: pointer;
  color: #2FBDF4;

  svg {
    width: 40px;
    height: 40px;
  }

  &:hover {
    color: #2699C6;
  }
`;

const AmountLine = styled.div`
  padding: 38px 8px 8px;
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333333'};
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  display: flex;
  justify-content: space-between;

  ${
    isMobile && css`
      flex-wrap: wrap;
    `
  }
`;

const BalanceData = styled.div`
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#333'};
  display: flex;
  align-items: center;

  ${
    isMobile && css`
      flex-wrap: wrap;
    `
  }
`;

const BalanceText = styled.span`
  font-size: 16px;
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
`;

const InpAmountLine = styled.div`
  padding: 16px;
  border-radius: 12px;
  background: ${(props) => props.isdark === 'dark' ? '#05253B' : '#F7F7F8'};
  border: 1px solid ${(props) => props.isdark === 'dark' ? '#1E3B4F' : '#EFEFEF'};
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  align-items: center;

  ${
    (props) => props.texterr === 'true' && css`
      border-color: #D93737;
    `
  }
`;

const InputAmount = styled.input`
  flex: 1;
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
  font-family: Inter;
  font-size: 24px;
  font-style: normal;
  font-weight: bold;
  line-height: normal;
  border: none;
  background: none;
  outline: none;

  &::placeholder {
    color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#999'};
    font-family: Inter;
    font-size: 24px;
    font-style: normal;
    font-weight: bold;
    line-height: normal;
  }

  ${
    isMobile && css`
      width: 0;
      margin-right: 6px;
    `
  }
`;

const ReceiveLine = styled.div`
  color: #818D96;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-align: ${ isMobile ? 'left' : 'right' };
  padding-right: 8px;
`;

const Line = styled.span`
  display: inline-block;
  width: 1px;
  height: 14px;
  background: #818D96;
  margin: 0 8px;
`;

const NextBtn = styled.div`
  cursor: pointer;
  border-radius: 12px;
  background: #0F68AA;
  color: #FFF;
  font-family: PangMenZhengDao;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;

  &:hover {
    background: #0C558A;
  }
`;

const InfoIcon = styled(Icon)`
  width: 14px;
  height: 14px;

  svg {
    width: 14px;
    height: 14px;
    color: #818D96;
  }
`;

const TextError = styled.div`
  color: #D93737;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const BoldTxt = styled.span`
  font-weight: 700;
`;
