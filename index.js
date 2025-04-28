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
  
const address = await wallet.getChangeAddress();
const balance = await wallet.getBalance();
const changeAddress = await wallet.getChangeAddress();

console.log('Address:', address);
console.log('balance:', balance);
console.log('changeAddress:', changeAddress);