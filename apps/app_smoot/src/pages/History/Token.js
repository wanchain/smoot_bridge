import React, { useMemo, useState } from "react";
import Table from "@/components/Table";
import PageTab from "@/components/PageTab";
import useSDK from "@/models/useSDK";

const protocols = ['Erc20'];

const NUM = 11;

const Token = () => {
  const {
    getHistoryNumber,
    loading
  } = useSDK();
  const [page, setPage] = useState(1);
  const [len, setLen] = useState(0);

  const handleHistoryNum = () => {
    const num = getHistoryNumber({
      protocols: protocols
    })
    setLen(num);
    return num;
  }

  const totalPage = useMemo(() => {
    const num = handleHistoryNum();
    if (!num) return 1;
    const pageNum = Math.ceil(num / NUM);
    // handle cur page
    if (page > pageNum) {
      setPage(pageNum);
    }
    return pageNum;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [len]);
  return (
    <>
      <Table
        protocols={protocols}
        page={page}
        total={len}
        num={NUM}
        handleHistoryNum={handleHistoryNum}
        loading={loading}
      ></Table>
      <PageTab
        totalPage={totalPage}
        curPage={page}
        addPage={() => {
          if (page + 1 > totalPage) {
            return;
          } else {
            setPage(page + 1)
          }
        }}
        minusPage={() => {
          if (page - 1 < 1) {
            return;
          } else {
            setPage(page - 1);
          }
        }}
      ></PageTab>
    </>
  )
}

export default Token;