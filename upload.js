import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

async function uploadToIPFS(filePath) {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        // Optional: Add metadata
        const metadata = JSON.stringify({
            name: path.basename(filePath),
            keyvalues: {
                uploadDate: new Date().toISOString()
            }
        });
        formData.append('pinataMetadata', metadata);

        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'pinata_api_key': pinataApiKey,
                    'pinata_secret_api_key': pinataSecretApiKey
                }
            }
        );

        const ipfsHash = response.data.IpfsHash;
        console.log('File uploaded to IPFS via Pinata');
        console.log('IPFS Hash:', ipfsHash);
        console.log('IPFS URL:', `ipfs://${ipfsHash}`);
        
        return ipfsHash;
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw error;
    }
}

async function main() {
    // Read the current nft_data.json
    const nftData = JSON.parse(fs.readFileSync('./nft_data.json', 'utf8'));
    
    for (const nft_item of nftData) {
        console.log("Processing NFT:", nft_item);
        if (nft_item.minted) {
            console.log("Already minted, skipping");
            continue;
        }
        if (nft_item.ipfsHash) {
            console.log("Already uploaded to IPFS, skipping");
            continue;
        }
        
        try {
            const ipfsHash = await uploadToIPFS(nft_item.imagePath);
            nft_item.ipfsHash = ipfsHash;
            console.log(`Updated NFT with IPFS hash: ${ipfsHash}`);
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`Failed to upload ${nft_item.imagePath}:`, error);
            break;
        }
    }
    
    // Write the updated data back to the file
    fs.writeFileSync('./nft_data.json', JSON.stringify(nftData, null, 2));
    console.log('Updated nft_data.json with IPFS hashes');
}

main();