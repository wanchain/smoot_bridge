import React, { useMemo } from "react";
// import styled from 'styled-components';
import { useLocalStorage } from '@/context/localstorage';
import { Tooltip } from "antd";

const Tip = (props) => {
  const { child, title, style, open, key, color } = props;
  const { theme } = useLocalStorage();
  const isdark = useMemo(() => theme, [theme]);
  return (
    <>
      {
        open === void 0 ? (
          <Tooltip
            title={title}
            color={color ? color : isdark === 'dark' ? '#23455F' : '#6B8FAA'}
            overlayStyle={style}
          >{child}</Tooltip>
        ) : (
          <Tooltip
            title={title}
            color={color ? color : isdark === 'dark' ? '#23455F' : '#6B8FAA'}
            overlayStyle={style}
            open={open}
            key={key}
          >{child}</Tooltip>
        )
      }
    </>
  )
}

export default Tip;