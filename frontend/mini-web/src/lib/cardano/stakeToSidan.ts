import {
  BlockfrostProvider,
  deserializePoolId,
  keepRelevant,
  MeshTxBuilder,
  Quantity,
  Unit,
  UTxO,
} from "@meshsdk/core";

const blockfrostApiKey = process.env.BLOCKFROST_KEY!;

const network =
  Number(process.env.NEXT_PUBLIC_NETWORK_ID) === 1 ? "mainnet" : "preprod";

const sidanPoolId = process.env.NEXT_PUBLIC_SIDAN_POOL_ID!;
const sidanDRepId = process.env.NEXT_PUBLIC_SIDAN_DREP_ID!;

const blockchainProvider = new BlockfrostProvider(blockfrostApiKey);

export type DelegateTransactionActions =
  | "registerStakeAddress"
  | "delegateStake"
  | "voteDelegation";

export interface StakeToSidanParams {
  rewardAddress: string;
  utxos: UTxO[];
  changeAddress: string;
  actions: DelegateTransactionActions[];
}

export const stakeToSidan = async ({
  rewardAddress,
  utxos,
  changeAddress,
  actions,
}: StakeToSidanParams) => {
  let unsignedTx = "";

  if (rewardAddress !== "") {
    const assetMap = new Map<Unit, Quantity>();
    assetMap.set("lovelace", "5000000");
    const selectedUtxos = keepRelevant(assetMap, utxos);

    const txBuilder = new MeshTxBuilder({
      fetcher: blockchainProvider,
      evaluator: blockchainProvider,
    });

    for (const action of actions) {
      if (action === "registerStakeAddress") {
        txBuilder.registerStakeCertificate(rewardAddress);
      }

      if (action === "delegateStake") {
        const poolIdHash = deserializePoolId(sidanPoolId);
        txBuilder.delegateStakeCertificate(rewardAddress, poolIdHash);
      }

      if (action === "voteDelegation") {
        txBuilder.voteDelegationCertificate(
          {
            dRepId: sidanDRepId,
          },
          rewardAddress
        );
      }
    }

    txBuilder.selectUtxosFrom(selectedUtxos);
    txBuilder.changeAddress(changeAddress);

    unsignedTx = await txBuilder.complete();
  }
  return { unsignedTx };
};
