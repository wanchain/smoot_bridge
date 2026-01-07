import { createGlobalStore } from 'hox';
import { useEffect, useState } from 'react';

const initial = {
  asset: null,
  assetChain: null,
  from: null,
  fromCoinAddress: null,
  to: null,
  fromAddress: undefined,
  toAddress: null,
  amount: undefined,
  receiveAmount: null,
  fee: '0',
  protocol: undefined,
  alreadyShownSubsidyModal: false,
  paireInfo: {
    from: {
      address: '',
      chain: '',
      isNative: true,
      issuer: {},
      symbol: ''
    },
    to: {
      address: '',
      chain: '',
      isNative: true,
      issuer: {},
      symbol: ''
    },
    bridge: undefined
  },
  fromOneId: '',
  toOneId: ''
};

const useFormData = () => {
  const [values, setValues] = useState(() => initial);
  const [isValid, setIsValid] = useState(false);

  const modify = (newData) => {
    setValues((newestState) => {
      return {
        ...newestState,
        ...newData,
      };
    });
  };

  useEffect(() => {
    setIsValid(typeof values.asset === 'string' && values.asset.length > 0);
  }, [values.asset]);

  const reset = () => {
    setValues(initial);
    setIsValid(false);
  };

  return {
    data: values,
    isValid,
    modify,
    reset,
  };
};

const [useFormDataModal] = createGlobalStore(useFormData);


export default useFormDataModal;
