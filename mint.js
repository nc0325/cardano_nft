import {
  MeshTxBuilder,
  ForgeScript,
  resolveScriptHash,
  stringToHex,
  resolveSlotNo 
} from "@meshsdk/core";
import { MeshWallet, BlockfrostProvider, deserializeAddress } from "@meshsdk/core";
import dotenv from "dotenv";
import fs from 'fs';
dotenv.config();

// Loading Environment Variables
const BUNDLE_SIZE = Number(process.env.BUNDLE_SIZE);
const WAITING_TIME_BETWEEN_TX = Number(process.env.WAITING_TIME_BETWEEN_TX);

console.log("BUNDLE_SIZE",BUNDLE_SIZE);
console.log("WAITING_TIME_BETWEEN_TX",process.env.WAITING_TIME_BETWEEN_TX);

// You can set a specific target date
const targetDate = new Date('2025-06-01T00:00:00Z'); // Use ISO format: YYYY-MM-DD
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

console.log("Policy ID:", policyId);

async function mintBundleNFTs(nft_list) {
  const utxos = await wallet.getUtxos();
  // Check wallet balance
  const balance = await wallet.getBalance();

  // Check if we have enough ADA (at least 2 ADA recommended for minting)
  const minAda = 2000000; // 2 ADA in lovelace
  if (balance < minAda) {
    throw new Error(
      `Insufficient ADA balance. Need at least 2 ADA, but only have ${balance} lovelace`
    );
  }

  const txBuilder = new MeshTxBuilder({
    fetcher: provider, // get a provider https://meshjs.dev/providers
    verbose: true,
  });
  

  const metadata = {};
  metadata[policyId] = {};

  for (const nft of nft_list) {
    const metaPath = nft.metaPath;
    const nft_metadata = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    console.log("nft_metadata",nft_metadata);
    const tokenName = nft_metadata.name;
    const tokenNameHex = stringToHex(tokenName);
    metadata[policyId][tokenName] = {
      image: nft.ipfsHash,
      mediaType: "image/png",
      ...nft_metadata,
    };
    txBuilder.mint("1", policyId, tokenNameHex);
    txBuilder.mintingScript(forgingScript);
  }

  txBuilder
    .metadataValue(721, metadata)
    .changeAddress(changeAddress)  
    .invalidHereafter(Number(POLICY_SLOT))
    .selectUtxosFrom(utxos);

  const unsignedTx = await txBuilder.complete();
  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);

  console.log("\n\n------- NFT Bundle Minted: ", txHash, "  -------");
}

async function main() {
  const initial_balance = await wallet.getLovelace();
  console.log("Initial balance:", initial_balance);
  const nft_data = JSON.parse(fs.readFileSync("./nft_data.json", "utf8"));
  let updated_nft_data = [...nft_data];
  const filterd_data = nft_data.filter((nft) => !nft.minted);
  console.log("Unminted NFTs:", filterd_data.length);
  
  for (let i = 0; i < filterd_data.length; i += BUNDLE_SIZE) {
    const nft_list = filterd_data.slice(i, i + BUNDLE_SIZE);
    console.log(`Minting bundle ${Math.floor(i/BUNDLE_SIZE) + 1} of ${Math.ceil(filterd_data.length/BUNDLE_SIZE)}`);
    try {
      await mintBundleNFTs(nft_list);
      // Wait longer between transactions to ensure chain state is updated
      console.log(`Waiting ${WAITING_TIME_BETWEEN_TX} seconds before next bundle...`);
      // update te nft data json file
      updated_nft_data = updated_nft_data.map((nft) => {
        if (nft_list.some((nft_list_item) => nft_list_item.imagePath === nft.imagePath)) {
          nft.minted = true;
        }
        return nft;
      });  
      fs.writeFileSync("./nft_data.json", JSON.stringify(updated_nft_data, null, 2));
      await new Promise(resolve => setTimeout(resolve, WAITING_TIME_BETWEEN_TX * 1000));
    } catch (error) {
      console.error(`Error minting bundle: ${error}`);
      // Optional: add retry logic or break the loop depending on your needs
      break;
    }
  }
  const final_balance = await wallet.getLovelace();
  console.log("Final balance:", final_balance);
  console.log("Difference in ada:", (final_balance - initial_balance) / 1000000);
}

main();

