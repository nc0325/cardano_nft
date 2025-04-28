import { MeshTxBuilder, ForgeScript, resolveScriptHash, stringToHex } from '@meshsdk/core';
import { MeshWallet, BlockfrostProvider  } from '@meshsdk/core';

const provider = new BlockfrostProvider('preprodoI3EH7gKh9BQi78LoBLvRoLYUIYi0R4B');
const wallet = new MeshWallet({
    networkId: 0, // 0: testnet, 1: mainnet
    fetcher: provider,
    submitter: provider,
    key: {
      type: 'mnemonic',
      words: ["name","drama","hope","shift","custom","seminar","web","length","unlock","gather","train","rapid","deer","cup","energy","crucial","display","blind","waste","sword","slice","output","fat","twice"],
    },
  });
  
const utxos = await wallet.getUtxos();
const changeAddress = await wallet.getChangeAddress();
const forgingScript = ForgeScript.withOneSignature(changeAddress);

const demoAssetMetadata = {
  name: "Test NFT",
  image: "ipfs://QmYEZr2cU3ToaSere3RVVRvg4hfLQz5WbNsShc8ffwWvcG",
  mediaType: "image/jpg",
  description: "This NFT was minted by Mesh (https://meshjs.dev/).",
};
const policyId = resolveScriptHash(forgingScript);
const tokenName = "MeshToken";
const tokenNameHex = stringToHex(tokenName);
const metadata = { [policyId]: { [tokenName]: { ...demoAssetMetadata } } };

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // get a provider https://meshjs.dev/providers
  verbose: true,
});

const unsignedTx = await txBuilder
  .mint("1", policyId, tokenNameHex)
  .mintingScript(forgingScript)
  .metadataValue(721, metadata)
  .changeAddress(changeAddress)
  .selectUtxosFrom(utxos)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);

console.log("transactionhash", txHash);