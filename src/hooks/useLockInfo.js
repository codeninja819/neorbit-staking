/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { SSL_ADDR, SSL_LOCK } from "../abis/address";
import GroveTokenABI from "../abis/GroveToken.json";
import LockABI from "../abis/LockABI.json";
import { useAddress, useWeb3Context } from "../context/web3Context";
import { multicall } from "../utils/contracts";

const defaultVal = {
  lockinfo: [{}, {}, {}, {}],
  lockallow: false,
  accountlockinfo: [{}, {}, {}, {}],
  fetchLockData: () => {},
  fetchAccountLockData: () => {},
  fetchAllowance: () => {},
};

export const LockInfoContext = React.createContext(defaultVal);

export default function useLockInfo() {
  return React.useContext(LockInfoContext);
}
let timerid = null,
  lockid = null;
export function LockInfoProvider({ children }) {
  const account = useAddress();
  const [lockinfo, setLockInfo] = useState([{}, {}, {}, {}]);
  const [accountlockinfo, setAccountLockInfo] = useState([{}, {}, {}, {}]);
  const [lockallow, setLockAllow] = useState(false);

  const { chainID } = useWeb3Context();

  async function fetchLockData() {
    try {
      let calls = [
        {
          address: SSL_LOCK[chainID],
          name: "performanceFee",
          params: [],
        },
        {
          address: SSL_LOCK[chainID],
          name: "bonusEndBlock",
          params: [],
        },
      ];

      for (let i = 0; i < 4; i++)
        calls.push({
          address: SSL_LOCK[chainID],
          name: "lockups",
          params: [i],
        });

      const result = await multicall(LockABI, calls, chainID);
      console.log(result);
      let temp = [];
      for (let i = 0; i < 4; i++) {
        const rate =
          (result[i + 2].rate / result[i + 2].totalStaked) *
          (chainID === 56 ? 28800 : 6219) *
          36500 *
          (chainID === 56 ? 44.33 / 46.48 : 108.37 / 103.29);
        temp.push({
          depositFee: result[i + 2].depositFee / 100,
          withdrawFee: result[i + 2].withdrawFee / 100,
          duration: result[i + 2].duration / 1,
          rate,
          performanceFee: result[0][0],
          endsIn: result[1][0] - result[i + 2].lastRewardBlock,
          totalStaked: result[i + 2].totalStaked / Math.pow(10, 9),
        });
      }
      console.log(temp);
      setLockInfo(temp);
    } catch (error) {
      console.log(error);
    }
  }
  async function fetchAccountLockData() {
    try {
      let calls = [];
      for (let i = 0; i < 4; i++) {
        calls.push({
          address: SSL_LOCK[chainID],
          name: "pendingReward",
          params: [account, i],
        });
        calls.push({
          address: SSL_LOCK[chainID],
          name: "pendingDividends",
          params: [account, i],
        });
        calls.push({
          address: SSL_LOCK[chainID],
          name: "userInfo",
          params: [i, account],
        });
      }
      const result = await multicall(LockABI, calls, chainID);
      let temp = [];
      for (let i = 0; i < 4; i++)
        temp.push({
          pendingReward: result[i * 3][0] / Math.pow(10, 9),
          pendingDividends: result[i * 3 + 1][0] / Math.pow(10, 9),
          stakedAmount: result[i * 3 + 2][0],
          available: result[i * 3 + 2][1],
        });
      console.log(temp);
      setAccountLockInfo(temp);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchAllowance() {
    try {
      let calls = [
        {
          name: "allowance",
          address: SSL_ADDR[chainID],
          params: [account, SSL_LOCK[chainID]],
        },
      ];
      const result = await multicall(GroveTokenABI, calls, chainID);
      setLockAllow(result[0][0] > ethers.utils.parseUnits("10000", 4));
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (chainID !== 56 && chainID !== 97) return;
    fetchLockData();
    if (lockid) clearInterval(lockid);
    lockid = setInterval(() => {
      fetchLockData();
    }, 20000);
  }, [chainID]);

  useEffect(() => {
    if (chainID !== 56 && chainID !== 97) return;
    if (!account) return;
    fetchAccountLockData();
    fetchAllowance();
    if (timerid) clearInterval(timerid);
    timerid = setInterval(() => {
      fetchAccountLockData();
      fetchAllowance();
    }, 20000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainID]);

  return (
    <LockInfoContext.Provider
      value={{
        lockinfo: [lockinfo[0], lockinfo[1], lockinfo[2], lockinfo[3]],
        lockallow,
        accountlockinfo: [
          accountlockinfo[0],
          accountlockinfo[1],
          accountlockinfo[2],
          accountlockinfo[3],
        ],
        fetchLockData,
        fetchAccountLockData,
        fetchAllowance,
      }}
      children={children}
    />
  );
}
