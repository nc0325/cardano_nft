# Cardano NFT Minting Guide

Welcome! This guide will help you set up your environment and mint NFTs on the Cardano blockchain using this project. No prior blockchain experience is required—just follow the steps below!

---

## 1. Prerequisites

- **Node.js**: Install [Node.js](https://nodejs.org/) version 20 or higher.
- **Git**: (Optional) For cloning the repository.

---

## 2. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

---

## 3. Set Up Environment Variables

You'll need API keys and your wallet's recovery phrase.

### a. Get API Keys

- **Blockfrost API Key**:  
  Sign up at [Blockfrost](https://blockfrost.io/) and create a project to get your API key.
- **Pinata API Key & Secret**:  
  Sign up at [Pinata](https://pinata.cloud/) and create API keys.

### b. Get Your Wallet Mnemonic

- Open your Cardano wallet (e.g., Eternl, Nami, Yoroi).
- Find your 12/15/24-word recovery phrase (mnemonic).

### c. Create a `.env` File

In the project folder, create a file named `.env` and add:

```env
BLOCKFROST_API_KEY=your_blockfrost_api_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret
MNEMONIC="word1 word2 word3 ... word12"
```

Replace the values with your actual keys and mnemonic phrase.

---

## 4. Install Dependencies

Run this command in your project folder:

```bash
npm install
```

---

## 5. Prepair resources

`images`
`metajsons`
`nft_data.json`

- Place the image files to the /images/ folder project

- Copy the metajsons to /metajsons/ folder of the project

- To create an initial `nft_data.json` file (tracks upload/mint status):

```bash
npm run makenft
```

---

## 6. Upload Images to IPFS

This uploads your NFT images to IPFS via Pinata and updates `nft_data.json` with their IPFS hashes.

```bash
npm run upload
```

- You can resume uploads if interrupted; progress is saved in `nft_data.json`.

---

## 7. Mint Your NFTs

This step mints NFTs on Cardano using the uploaded images.

```bash
npm run mint
```

- If minting fails, you can rerun the command to continue from where it stopped. Progress is tracked in `nft_data.json`.

---

## Troubleshooting

- **API Errors**: Double-check your API keys in `.env`.
- **Wallet Issues**: Ensure your mnemonic is correct and your wallet has enough ADA for transaction fees.

---

## Resources

- [Blockfrost Documentation](https://blockfrost.dev/overview/getting-started)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [Cardano Wallets](https://cardano.org/wallet/)

---
