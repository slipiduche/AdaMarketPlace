import Loader from '../loader';
import WalletAPI from '../wallet/wallet';
import { lovelaceToAda } from '../consts';

import { assetsToValue, fromHex, toHex } from '../serialization';
import { createOutput, finalizeTransaction, initializeTransaction, splitAmount } from '../wallet/transact';

import { BuyOffer_DATUM, SellOffer_DATUM } from './datum';
import { Buy_REDEEMER, CLOSE_REDEEMER } from './redeemer';
import { getAssetUtxos, getAuctionDatum } from './utils';
import {
    Address,
    BaseAddress,
    MultiAsset,
    Assets,
    ScriptHash,
    Costmdls,
    Language,
    CostModel,
    AssetName,
    TransactionUnspentOutput,
    TransactionOutput,
    Value,
    TransactionBuilder,
    LinearFee,
    BigNum,
    BigInt,
    TransactionHash,
    TransactionInputs,
    TransactionInput,
    TransactionWitnessSet,
    Transaction,
    PlutusData,
    PlutusScripts,
    PlutusScript,
    PlutusList,
    Redeemers,
    Redeemer,
    RedeemerTag,
    Ed25519KeyHashes,
    ConstrPlutusData,
    ExUnits,
    Int,
    NetworkInfo,
    EnterpriseAddress,
    TransactionOutputs,
    hash_transaction,
    hash_script_data,
    hash_plutus_data,
    ScriptDataHash, Ed25519KeyHash, NativeScript, StakeCredential
} from "../custom_modules/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib"
let Buffer = require('buffer/').Buffer


export const CONTRACT = () => {
    const scripts = Loader.Cardano.PlutusScripts.new();
    scripts.add(Loader.Cardano.PlutusScript.new(fromHex(process.env.NEXT_PUBLIC_HEX_CONTRACT)));
    return scripts;
};

export const CONTRACT_ADDRESS = () => {
    return Loader.Cardano.Address.from_bech32(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
    );
}

export const MARKETPLACE_ADDRESS = () => {
    return Loader.Cardano.Address.from_bech32(
        process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS
    );
}

//--------------------------------------------------------------------------------//
// Endpoints
//--------------------------------------------------------------------------------//

/*
    Steps:
    1: Get wallet utxos
    2: Create an output sending an NFT asset to the script address
    3: Sign and submit transaction
*/
export const start = async (auctionDetails: SellOffer) => {
    
    console.log(auctionDetails)
    // Build the auction datum and initialize transaction data
    const datum = SellOffer_DATUM(auctionDetails);
    console.log(datum);
    const { txBuilder, datums, metadata, outputs } = await initializeTransaction();

    // Get the connected wallet address and utxos to ensure they have enough ADA and the proper NFT to auction
    const walletAddress = await WalletAPI.getBaseAddress();
    const utxos = await WalletAPI.getUtxos();

    // The contract receives a blob NFT as an output
    console.log(auctionDetails.aToken);
    outputs.add(
        createOutput(
            CONTRACT_ADDRESS(),
            assetsToValue([
                {
                    unit: auctionDetails.aCurrency +'.' +auctionDetails.aToken,
                    quantity: "1",
                }
            ]),
            {
                index: 0,
                datum: datum,
                metadata: metadata,
                sellerAddress: walletAddress,
            }
        )
    ) 
    
    console.log(outputs.get(0).amount().coin().to_str())
    const multiasset=outputs.get(0).amount().multiasset()
    if (multiasset) {
        const keys = multiasset.keys() // policy Ids of thee multiasset
        const N = keys.len();
        // console.log(`${N} Multiassets in the UTXO`)


        for (let i = 0; i < N; i++) {
            const policyId = keys.get(i);
            const policyIdHex = Buffer.from(policyId.to_bytes(), "utf8").toString("hex");
            // console.log(`policyId: ${policyIdHex}`)
            const assets = multiasset.get(policyId)
            
            const assetNames = assets.keys();
            const K = assetNames.len()
            // console.log(`${K} Assets in the Multiasset`)
            let multiAssetStr=''
            for (let j = 0; j < K; j++) {
                const assetName = assetNames.get(j);
                // console.log(assets.get(assetName));
                // console.log(assetName);
                const assetNameString = Buffer.from(assetName.name(), "utf8").toString();
                // console.log(assetNameString)
                // console.log(assets.get(assetName).to_str());
                const assetNameHex = Buffer.from(assetName.name(), "utf8").toString("hex")
                const multiassetAmt = assets.get(assetName)
                multiAssetStr += `+ ${multiassetAmt.to_str()} + ${policyIdHex}.${assetNameHex} (${assetNameString})`
                 
                // console.log(`Asset Name: ${assetNameHex}`)
            }
            console.log(multiAssetStr)
        }
    }


    datums.add(datum);

    // Set the required transaction signers
    const requiredSigners = Loader.Cardano.Ed25519KeyHashes.new();
    requiredSigners.add(walletAddress.payment_cred().to_keyhash());
    txBuilder.set_required_signers(requiredSigners);

    // Finish building and submitting the transaction!
    const txHash = await finalizeTransaction({
        txBuilder,
        changeAddress: walletAddress,
        utxos,
        outputs,
        datums,
        metadata,
        scriptUtxo: null,
        action: null,
    });
    return txHash;
}

/*
    Steps:
    1: Get asset utxos
    2: Get wallet utxos
    3: Ensure transaction will be valid by checking bid and auction time
    4: Create an output sending ADA the script address
    5: If there was already a previous bid, create an output to send ADA back to the previous bidder
    6: Sign and submit transaction
*/
export const bid = async (asset: string, buyOffer: BuyOffer) => {
    const assetUtxos = await getAssetUtxos(asset);
    if (assetUtxos?.length > 1) {
        throw new Error("There can only be 1 utxo for an NFT asset.");
    }

    const assetUtxo: any = assetUtxos[assetUtxos.length - 1];
    if (!assetUtxo) {
        throw new Error("No acceptable Utxo for this transaction.");
    }

    const currentValue = assetUtxo.utxo.output().amount();
    const currentBidAmountLovelace = parseInt(currentValue.coin().to_str());
    const auctionDatum: SellOfferDatum = getAuctionDatum(assetUtxo.datum) as SellOfferDatum;

    const { txBuilder, datums, metadata, outputs } = await initializeTransaction();
    const walletAddress = await WalletAPI.getBaseAddress();
    const utxos = await WalletAPI.getUtxos();

    datums.add(assetUtxo.datum);

    let newBid = parseInt(buyOffer.bBuyOffer);
    // if (newBid < currentBidAmountLovelace || newBid < parseInt(auctionDatum.adSellOfferDetails.adMinBid)) {
    //     throw new Error(`Bid is too low. Must bid at least ${(Math.ceil((currentBidAmountLovelace * lovelaceToAda) * 100) / 100).toFixed(2)}₳`);
    // }

    // Need to add the difference between the currentBidAmountLovelace and the old bid to the newBid
    let oldBid = 0;
    if (auctionDatum.adBuyOffer) {
        oldBid = parseInt(auctionDatum.adBuyOffer?.bBuyOffer)
    }
    newBid += (currentBidAmountLovelace - oldBid);

    // Decrement endDateTime by 15 minutes to account for transactions in the mempool that still are within ttl (time to live)
    // const fifteenMinutes = 1000 * 60 * 15;
    // const endDateTime = parseInt(auctionDatum.adAuctionDetails.adDeadline);
    // const now = Date.now();
    // if (now > (endDateTime - fifteenMinutes)) {
    //     throw new Error("The auction has ended.");
    // }

    // const startDatetime = parseInt(auctionDatum.adAuctionDetails.adStartTime);
    // if (now < startDatetime) {
    //     throw new Error("The auction has not started yet.");
    // }

    // Need time left to calculate TTL
    // const twoHours = 2 * 60 * 60;
    // let timeToLive = (endDateTime - now) - 1; // Subtract 1 second to ensure this time is before the deadline
    // if (timeToLive > twoHours) {
    //     timeToLive = twoHours;
    // }

    const bidDatum = BuyOffer_DATUM(auctionDatum.adSellOffer, buyOffer);
    datums.add(bidDatum);
    outputs.add(
        createOutput(
            CONTRACT_ADDRESS(),
            assetsToValue([
                { unit: "lovelace", quantity: newBid.toString() },
                { unit: assetUtxo.asset, quantity: "1" },
            ]),
            {
                index: 0,
                datum: bidDatum,
                metadata: metadata,
                sellerAddress: assetUtxo.sellerAddress,
                bidderAddress: walletAddress,
            }
        )
    );

    // Pay back prevoius bidder if they exist
    if (assetUtxo.bidderAddress) {
        outputs.add(
            createOutput(
                assetUtxo.bidderAddress.to_address(),
                Loader.Cardano.Value.new(Loader.Cardano.BigNum.from_str(auctionDatum.adBuyOffer?.bBuyOffer))
            )
        );
    }

    const requiredSigners = Loader.Cardano.Ed25519KeyHashes.new();
    requiredSigners.add(walletAddress.payment_cred().to_keyhash());
    txBuilder.set_required_signers(requiredSigners);

    const txHash = await finalizeTransaction({
        txBuilder,
        changeAddress: walletAddress,
        utxos,
        outputs,
        datums,
        metadata,
        scriptUtxo: assetUtxo.utxo,
        action: (redeemerIndex: any) => Buy_REDEEMER(redeemerIndex, buyOffer),
        //timeToLive
    });

    return txHash;
}

/*
    Steps:
    1: Get asset utxos
    2: Get wallet utxos
    3: Ensure transaction will be valid by checking if the auction has ended
    4: Create an output sending the NFT asset to the highest bidder
    5: Create an output sending ADA to the seller and marketplace
    6: Sign and submit transaction
*/
export const close = async (asset: string) => {
    const assetUtxos = await getAssetUtxos(asset);
    if (assetUtxos?.length > 1) {
        throw new Error("There can only be 1 utxo for an NFT asset.");
    }

    const assetUtxo: any = assetUtxos[assetUtxos.length - 1];
    if (!assetUtxo) {
        throw new Error("No acceptable Utxo for this transaction.");
    }

    const currentValue = assetUtxo?.utxo.output().amount();
    const auctionDatum: SellOfferDatum = getAuctionDatum(assetUtxo?.datum) as SellOfferDatum;

    const { txBuilder, datums, metadata, outputs } = await initializeTransaction();
    const walletAddress = await WalletAPI.getBaseAddress();
    const utxos = await WalletAPI.getUtxos();

    datums.add(assetUtxo.datum);

    // // Decrement endDateTime by 15 minutes to account for ttl (time to live)
    // const fifteenMinutes = 1000 * 60 * 15;
    // const endDateTime = parseInt(auctionDatum.adSellOffer.adDeadline);
    // const now = Date.now();
    // if (now < (endDateTime - fifteenMinutes)) {
    //     throw new Error("The auction has not ended yet.");
    // }

    // If there is a bidder, Send NFT to bidder, ADA to seller, and ADA to marketplace 
    if (auctionDatum.adBuyOffer && assetUtxo.sellerAddress && assetUtxo.bidderAddress) {
        splitAmount(currentValue.coin(), assetUtxo.sellerAddress.to_address(), outputs);
        outputs.add(
            createOutput(
                assetUtxo.bidderAddress.to_address(),
                assetsToValue([
                    {
                        unit: auctionDatum.adSellOffer.aCurrency + auctionDatum.adSellOffer.aToken,
                        quantity: "1",
                    }
                ]),
                {
                    index: 0,
                    datum: assetUtxo.datum,
                    metadata: metadata,
                }
            )
        );
    }
    else {
        outputs.add(
            createOutput(
                assetUtxo.sellerAddress.to_address(),
                assetsToValue([
                    {
                        unit: auctionDatum.adSellOffer.aCurrency + auctionDatum.adSellOffer.aToken,
                        quantity: "1",
                    }
                ]),
                {
                    index: 0,
                    datum: assetUtxo.datum,
                    metadata: metadata,
                }
            )
        );
    }

    const requiredSigners = Loader.Cardano.Ed25519KeyHashes.new();
    requiredSigners.add(walletAddress.payment_cred().to_keyhash());
    txBuilder.set_required_signers(requiredSigners);

    const txHash = await finalizeTransaction({
        txBuilder,
        changeAddress: walletAddress,
        utxos,
        outputs,
        datums,
        scriptUtxo: assetUtxo.utxo,
        action: (redeemerIndex: any) => CLOSE_REDEEMER(redeemerIndex),
    });
    return txHash;
}
//--------------------------------------------------------------------------------//
