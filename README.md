<h1 align="center">
  <a href="https://adablobs.io">
    <img alt="ADABlobs" src="./public/images/Logo.png" width="100" />
    <img alt="ADABlobs" src="./public/images/LogoText.png" width="480" />
  </a>
</h1>
  
Welcome to [ADABlobs](https://adablobs.io/)! The cutest and most adorable NFT collection on Cardano. There are 300 Blob NFTs to collect with 1 new Blob being available each week until all 300 are released. ADA Blobs is the first auction marketplace on the Cardano Blockchain by leveraging Cardano's Plutus Smart Contract capability. This repository contains the full front implementation of the ADA Blobs website. The repository for the full Plutus Smart Contracts can be found [here](https://github.com/NicholasMaselli/ADABlobsPlutus)

<div align="center">
  <img alt="ADABlobs" src="./public/images/blobs/001 - Bob.png" width="256" />
  <img alt="ADABlobs" src="./public/images/blobs/007 - Yolg - Reverse.png" width="256" />
</div>

### Validity

To make sure you have a real ADA Blob the Policy ID of your Blob must be:
**`4a4c17cc89b90f7239ce83f41e4f47005859870178f4e6815b1cd318`**

You can find the associated policy script in `./public/data/minting_policy.json`

The contract address for the official ADA Blobs auction market place is:
**`addr1w8qupuhmh3qwckr7dglaqkjr7qhruglem6anp49x9ey70wcrn3fa8`**

<div align="center">
  <img alt="ADABlobs" src="./public/images/blobs/008 - Glob.png" width="256" />
  <img alt="ADABlobs" src="./public/images/blobs/005 - Rooboo - Reverse.png" width="256" />
</div>

### Metadata

ADA Blobs follows [CIP-25](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0025/CIP-0025.md), the NFT metadata standard on Cardano. On-chain metadata for each blob is structured as the following:

```
{
  "721": {
    "4a4c17cc89b90f7239ce83f41e4f47005859870178f4e6815b1cd318": {
      "ADABlob1": {
        "color": "Blue",
        "hex": "2CBBE7",
        "id": 1,
        "image": "ipfs://QmXWRYfj5WPF942GWnJYbzPwX2LaAFBN1Wg2PkRGSCVoXV",
        "name": "Bob",
        "project": "ADA Blobs"
      }
    }
  }
}
```

Images are stored on IPFS and you find the image link to an ADA Blob inside the metadata.

<div align="center">
  <img alt="ADABlobs" src="./public/images/blobs/010 - Peep.png" width="256" />
  <img alt="ADABlobs" src="./public/images/blobs/009 - Blurp - Reverse.png" width="256" />
</div>

### Rarity

Unlike many NFT projects with a series of traits, an ADA Blob's rarity is based solely on their color. The "color" property of the on-chain metadata determines the rarity with the "hex" property indicating the exact shade of the Blob.

The rarity chart for the ADA Blob colors are as follows:

<ul>
  <li>White Blobs: 1.67% (5/300) </li>
  <li>Black Blobs: 3.34% (10/300) </li>
  <li>Brown Blobs: 5.00% (15/300) </li>
  <li>Red Blobs: 6.67% (20/300) </li>
  <li>Orange Blobs: 10.00% (30/300) </li>
  <li>Yellow Blobs: 13.34% (40/300) </li>
  <li>Green Blobs: 16.67% (50/300) </li>
  <li>Blue Blobs: 20.00% (60/300) </li>
  <li>Purple Blobs: 23.34% (70/300) </li>
</ul

You can find more rarity information on this [ADA Blobs page](https://adablobs.io/rarity).

<div align="center">
  <img alt="ADABlobs" src="./public/images/blobs/006 - Oobby.png" width="256" />
  <img alt="ADABlobs" src="./public/images/blobs/004 - Broogr - Reverse.png" width="256" />
</div>

### Marketplace

The ADA Blobs marketplace can be used by anyone who wants to auction off their ADA Blob. The marketplace takes a 1% on ADA Blob auctions.

<div align="center">
  <img alt="ADABlobs" src="./public/images/blobs/003 - Bluub.png" width="256" />
  <img alt="ADABlobs" src="./public/images/blobs/002 - Wumb - Reverse.png" width="256" />
</div>

### Open Source

If you would like to pull this code and run it to see how it works. Follow these steps:

1. Clone this repository to a local directory

2. Ensure you have npm installed. Preferably the latest LTS version of NPM or higher

3. Copy the template env file to an env file with the following command: 

```
cat config/template.env >> .env
```
Note: You may need to use "Windows Terminal" if you are on windows which you can get from the Windows Store.

4. Copy your [Blockfrost API](https://blockfrost.io/) credentials into .env file that you just created next to the "BLOCKFROST_API_KEY=" section:

5. Install npm packages with the following command:
```
npm ci
```

6. Run the code and check it out with the following command:
```
npm run dev
```

