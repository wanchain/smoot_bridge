import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import Modal from "../Modal";
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import { DatePicker } from "antd";
import { useLocalStorage } from '@/context/localstorage';
import Icon from '@ant-design/icons';
import { ReactComponent as closeIcon } from 'images/icons/close.svg';
import useSDK from "@/models/useSDK";
import BigNumber from "bignumber.js";
import { formatParseFee } from "../../utils/utils";
import { CSVLink } from "react-csv";
import './index.scss';

dayjs.extend(weekday);
dayjs.extend(localeData);

const { RangePicker } = DatePicker;

const ExportTableModal = (props) => {
  const {
    visible,
    cancel,
    totalNum,
    protocols
  } = props;
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  const { getHistory } = useSDK();
  const [exportData, setExportData] = useState([]);
  const [timeSelect, setTimeSelect] = useState(0);

  useEffect(() => {
    setTimeSelect(new Date());
    setExportData([])
  }, [visible]);

  const rangePresets = [
    {
      label: 'Last 7 Days',
      value: [dayjs().add(-7, 'd'), dayjs()],
    },
    {
      label: 'Last 14 Days',
      value: [dayjs().add(-14, 'd'), dayjs()],
    },
    {
      label: 'Last 30 Days',
      value: [dayjs().add(-30, 'd'), dayjs()],
    },
    {
      label: 'Last 90 Days',
      value: [dayjs().add(-90, 'd'), dayjs()],
    },
  ];

  const getHistoryList = () => {
    const list = getHistory({
      protocols: protocols,
      page: 0,
      number: totalNum
    });
    return list;
  };


  const onRangeChange = (dates, dateString) => {
    if (dates) {
      const fromTime = new Date(dateString[0] + ' 00:00:00').getTime();
      const toTime = new Date(dateString[1] + ' 23:59:59').getTime();
      handleExportList(fromTime, toTime);
    } else {
      console.log('get date error');
    }
  };

  const handleStatus = (status) => {
    switch(status) {
      case 'Failed':
        return 'Failed';
      case 'Performing':
        return 'In Progress 1/2';
      case 'Converting':
        return 'In Progress 2/2';
      case 'Succeeded':
        return 'Success';
      case 'Timeout':
        return 'Timeout';
      case 'Rejected':
        return 'Cancel';
      case 'Error':
        return 'Error';
      default:
        return 'Success';
    }
  };

  const handleFee = (value) => {
    const v = JSON.parse(JSON.stringify(value));
    if (!v || !v.fee) return '0';
    let feeNum = '';
    if (v.protocol === 'Erc721') {
      v.amount = v.amount.length;
    }
    if (v.protocol === 'Erc1155') {
      v.amount = v.amount.reduce(
        (a, b) => {
          return Number(a) + Number(b.amount);
        },
        0,
        v.amount,
      );
    }
    const { networkFee, operateFee } = formatParseFee(
      v.fee,
      v,
      false,
    );
    let tmp = new BigNumber(networkFee);
    if (networkFee && Number(networkFee) > 0) {
      feeNum = `${tmp.toNumber()} ${v.fee.networkFee.unit}`;
    }
    tmp = new BigNumber(operateFee);
    if (operateFee && Number(operateFee) > 0) {
      feeNum = `${feeNum ? feeNum + ' + ' : ''}${tmp.toNumber()} ${v.fee.operateFee.unit}`;
    }
    if (!feeNum) feeNum = '0';
    return feeNum;
  };

  const handleExportList = (fromDate, toDate) => {
    const allHistoryList = getHistoryList();
    const filterHistoryList = allHistoryList.filter(v => v.timestamp >= fromDate && v.timestamp <= toDate);
    const formatList = filterHistoryList.map(v => {
      return [
        v.asset,
        v.fromAccount,
        v.toAccount,
        new Date(v.timestamp).toLocaleString('chinese', {
          hour12: false,
        }),
        v.amount,
        handleFee(v),
        handleStatus(v.status),
        v.lockHash ? v.lockHash : ''
      ]
    })
    const csvArr = [
      ['Asset', 'From', 'To', 'Time', 'Amount', 'Fee', 'Status', 'TxHash'],
      ...formatList
    ]
    setExportData(csvArr);
  }

  return (
    <Modal visible={visible} cancel={cancel} size='sm'>
      <Body>
        <TitleLine>
          <ModalTitle isdark={theme}>Export</ModalTitle>
          <CloseBtn onClick={cancel} isdark={theme} component={closeIcon}></CloseBtn>
        </TitleLine>
        <RangePicker
          key={timeSelect}
          className='react-picker-con'
          presets={rangePresets}
          onChange={onRangeChange}
        />
        {
          exportData.length > 0 ? (
            <DownBtn isdark={isdark} data={exportData} filename={'myCrosschainTxRecords'}>Download</DownBtn>
          ) : (
            <DownBanBtn isdark={isdark}>Download</DownBanBtn>
          )
        }
        <DownLoadTxt isdark={isdark}>Export the earliest&nbsp;<BlueTxt isdark={isdark}>5000</BlueTxt>&nbsp;records</DownLoadTxt>
      </Body>
    </Modal>
  )
};

export default ExportTableModal;

const Body = styled.div`
  padding: 24px;
`;

const TitleLine = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 22px;
`;

const ModalTitle = styled.p`
  color: ${(props) => props.isdark === 'dark' ? '#FFF' : '#333333'};
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

const DownBtn = styled(CSVLink)`
  height: 60px;
  border-radius: 12px;
  background: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
  color: #FFF;
  text-align: center;
  font-family: PangMenZhengDao;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  cursor: pointer;
  text-decoration: none;
  transition: all ease 0.2s;

  &:hover {
    text-decoration: none;
    color: #FFF;
    transform: scale(1.01);
  }
`;

const DownBanBtn = styled.div`
  height: 60px;
  border-radius: 12px;
  background: ${(props) => props.isdark === 'dark' ? '#0C2C42' : '#EAEAEA'};
  color: ${(props) => props.isdark === 'dark' ? '#818D96' : '#999'};
  text-align: center;
  font-family: PangMenZhengDao;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  cursor: pointer;
`;

const DownLoadTxt = styled.p`
  color: ${(props) => props.isdark === 'dark' ? '#8398A8' : '#666'};
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BlueTxt = styled.span`
  color: ${(props) => props.isdark === 'dark' ? '#2FBDF4' : '#0F68AA'};
`;