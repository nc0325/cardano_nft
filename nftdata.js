import fs from 'fs';

function generateNFTData(count = 10000) {
    const nftData = [];
    
    for (let i = 1; i <= count; i++) {
        const item = {
            "imagePath": `./images/${i}.png`,
            "ipfsHash": "",
            "minted": false,
            "metaPath": `./metajsons/${i}.json`
        };
        nftData.push(item);
    }
    
    return nftData;
}

// Generate the data
const data = generateNFTData();

// Write to file with pretty formatting (2 spaces indentation)
fs.writeFileSync('nft_data.json', JSON.stringify(data, null, 2));

console.log('NFT data file has been generated successfully!');