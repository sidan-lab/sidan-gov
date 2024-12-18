import { BlockfrostProvider } from "@meshsdk/core";

const blockfrostApiKey = process.env.BLOCKFROST_KEY!;

const sidanPoolId = process.env.NEXT_PUBLIC_SIDAN_POOL_ID!;
const sidanDRepId = process.env.NEXT_PUBLIC_SIDAN_DREP_ID!;

const blockchainProvider = new BlockfrostProvider(blockfrostApiKey);

export const checkIfStaked = async (stakeAddress: string) => {
  const info = await blockchainProvider.get(`/accounts/${stakeAddress}`);
  const { active, pool_id, drep_id } = info;

  return {
    isRegistered: active,
    isStaked: pool_id === sidanPoolId,
    isDRepDelegated: drep_id === sidanDRepId,
  };
};
