import { ForgeScript, resolveScriptHash, stringToHex, MeshTxBuilder, resolveSlotNo } from "@meshsdk/core";
import { MeshWallet, BlockfrostProvider, deserializeAddress } from "@meshsdk/core";
import dotenv from "dotenv";
dotenv.config();

// You can set a specific target date
const targetDate = new Date('2025-05-30T00:00:00Z'); // Use ISO format: YYYY-MM-DD
const POLICY_SLOT = resolveSlotNo('mainnet', targetDate.getTime());

const provider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY);
const wallet = new MeshWallet({
    networkId: Number(process.env.NETWORK_ID), // 0: testnet, 1: mainnet
    fetcher: provider,
    submitter: provider,
    key: {
      type: "mnemonic",
      words: process.env.MNEMONIC.split(" "),
    },
  });

const utxos = await wallet.getUtxos();
const changeAddress = await wallet.getChangeAddress();

const { pubKeyHash: keyHash } = deserializeAddress(changeAddress);

const nativeScript = {
  type: "all",
  scripts: [
    {
      type: "before",
      slot: POLICY_SLOT,
    },
    {
      type: "sig",
      keyHash: keyHash,
    },
  ],
};

// const forgingScript = ForgeScript.withOneSignature(changeAddress);

const forgingScript = ForgeScript.fromNativeScript(nativeScript);

const policyId = resolveScriptHash(forgingScript);
const tokenNameHex = stringToHex("MeshToken1");

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // get a provider https://meshjs.dev/providers
  verbose: true,
});

const unsignedTx = await txBuilder
  .mint("-1", policyId, tokenNameHex)
  .mintingScript(forgingScript)
  .changeAddress(changeAddress)
  .selectUtxosFrom(utxos)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);

console.log("txHash", txHash);