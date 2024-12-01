import { BrowserWallet } from "@meshsdk/core";
import { useWallet } from "@meshsdk/react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { DelegateTransactionActions } from "../cardano/stakeToSidan";

export const useValidateStaking = () => {
  const walletInfo = useWallet();

  const [wallet, setBrowserWallet] = useState<BrowserWallet | null>(null);
  const [rewardAddress, setRewardAddress] = useState<string | null>(null);

  const [stakingError, setErrorMessage] = useState<string | null>(null);

  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isStaked, setIsStaked] = useState<boolean>(false);
  const [isDRepDelegated, setIsDRepDelegated] = useState<boolean>(false);

  const checkAddressInfo = async (stakeAddress: string) => {
    if (!rewardAddress) {
      setErrorMessage("Connect your wallet firstp");
      return;
    }

    const response = await axios.post("/api/checkIfStaked", { rewardAddress });
    const { status, data } = response;

    if (status === 422 || status === 500) {
      setIsDRepDelegated(false);
      setIsStaked(false);
      setIsRegistered(false);
      return;
    }

    const { isRegistered, isStaked, isDRepDelegated } = data.data;
    setIsDRepDelegated(isDRepDelegated);
    setIsStaked(isStaked);
    setIsRegistered(isRegistered);
  };

  const delegateToSidan = useCallback(async () => {
    if (!rewardAddress) {
      setErrorMessage("Connect your wallet first before delegating to DRep");
      return;
    }
    if (!wallet) {
      setErrorMessage("Wallet not connected");
      return;
    }

    const utxos = await wallet.getUtxos();
    const changeAddress = await wallet.getChangeAddress();
    let actions: DelegateTransactionActions[] = [];
    if (!isRegistered) {
      actions.push("registerStakeAddress");
    }
    if (!isStaked) {
      actions.push("delegateStake");
    }
    if (!isDRepDelegated) {
      actions.push("voteDelegation");
    }

    try {
      const response = await axios.post("/api/stakeToSidan", {
        rewardAddress,
        utxos,
        changeAddress,
        actions,
      });
      const { unsignedTx } = response.data.data;

      if (unsignedTx) {
        const signedTx = await wallet.signTx(unsignedTx);
        const txHash = await wallet.submitTx(signedTx);
        console.log("Staked, txHash: ", txHash);
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  }, [rewardAddress, wallet]);

  useEffect(() => {
    if (walletInfo.name) {
      BrowserWallet.enable(walletInfo.name).then((wallet) => {
        setBrowserWallet(wallet);
        wallet.getRewardAddresses().then((addresses) => {
          if (addresses.length > 0 && addresses[0]) {
            setRewardAddress(addresses[0]);
            checkAddressInfo(addresses[0]);
          }
        });
      });
    }
  }, [walletInfo.name]);

  return {
    rewardAddress,
    delegateToSidan,
    stakingError,
    wallet,
    isStaked,
    isDRepDelegated,
    isRegistered,
  };
};
