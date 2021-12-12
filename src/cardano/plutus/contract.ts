import Loader from '../loader';

import { fromHex } from '../serialization';
import { initializeTransaction } from '../wallet/transact';
import { getBaseAddress, getUtxos } from '../wallet/wallet';
import { contract } from "./plutus";

export const CONTRACT = () => 
{
    const scripts = Loader.Cardano.PlutusScripts.new();
    scripts.add(Loader.Cardano.PlutusScript.new(fromHex(contract)));
    return scripts;
};

export const CONTRACT_ADDRESS = () => 
{
  return Loader.Cardano.Address.from_bech32(
    "addr_test1wps56mehumyujyzs0jknzngkreuw5uf2eccpeczjn9e90zqnw5gn5"
  );
}

//--------------------------------------------------------------------------------//
// Datums
//--------------------------------------------------------------------------------//
export const START = (startAuctionDetails: AuctionDetails) => 
{
    // Code below creates this json format    
    /*
    {
    "constructor": 0,
    "fields": [
        {
        "constructor": 0, // AuctionDetails
        "fields": [
            {
            "bytes": "67614c1b06ddbb100cb6cbe919594cac31771c25530b6c7f28da242b" // adSeller
            },
            {
            "bytes": "d6cfdbedd242056674c0e51ead01785497e3a48afbbb146dc72ee1e2" // adCurrency
            },
            {
            "bytes": "123456" // adToken
            },
            {
            "int": 1639241530000 // adDealine
            },
            {
            "int": 1639241130000 // adStartTime
            },
            {
            "int": 8000000 // adMinBid
            },
            {
            "map": [ // adPayoutPercentages
                {
                    "v": {
                        "int": 990
                    },
                    "k": {
                        "bytes": "67614c1b06ddbb100cb6cbe919594cac31771c25530b6c7f28da242b" // adSeller PubKeyHash
                    }
                },
                {
                    "v": {
                        "int": 10
                    },
                    "k": {
                        "bytes": "1d0ab2689eed633f013b347ba5db41919367dfc86d0d74d0a809c3e0" // marketplace PubKeyHash (Mine)
                    }
                }
            ]
            }
        ]
        },
        {
        "constructor": 1,
        "fields": [
        ]
        }
    ]
    }
    */

    const { adSeller, adCurrency, adToken, adDeadline, adStartTime, adMinBid } = startAuctionDetails;

    // Data
    const marketplaceAddress = "67614c1b06ddbb100cb6cbe919594cac31771c25530b6c7f28da242b";
    const adPayoutPercentages = Loader.Cardano.PlutusMap.new();
    adPayoutPercentages.insert(Loader.Cardano.PlutusData.new_bytes(fromHex(adSeller)), Loader.Cardano.PlutusData.new_integer(Loader.Cardano.BigInt.from_str("990")));
    adPayoutPercentages.insert(Loader.Cardano.PlutusData.new_bytes(fromHex(marketplaceAddress)), Loader.Cardano.PlutusData.new_integer(Loader.Cardano.BigInt.from_str("10")));

    // Construct Cardano Jason
    const auctionDetailsFields = Loader.Cardano.PlutusList.new();
    auctionDetailsFields.add(Loader.Cardano.PlutusData.new_bytes(fromHex(adSeller)))
    auctionDetailsFields.add(Loader.Cardano.PlutusData.new_bytes(fromHex(adCurrency)))
    auctionDetailsFields.add(Loader.Cardano.PlutusData.new_bytes(fromHex(adToken)))
    auctionDetailsFields.add(Loader.Cardano.PlutusData.new_integer(Loader.Cardano.BigInt.from_str(adDeadline)))
    auctionDetailsFields.add(Loader.Cardano.PlutusData.new_integer(Loader.Cardano.BigInt.from_str(adStartTime)))
    auctionDetailsFields.add(Loader.Cardano.PlutusData.new_integer(Loader.Cardano.BigInt.from_str(adMinBid)))
    auctionDetailsFields.add(Loader.Cardano.PlutusData.new_map(adPayoutPercentages));

    const auctionDetails = Loader.Cardano.PlutusData.new_constr_plutus_data(
        Loader.Cardano.ConstrPlutusData.new(
            Loader.Cardano.Int.new_i32(0),
            auctionDetailsFields,
        )
    )

    const bidDetailsFields = Loader.Cardano.PlutusList.new();
    const bidDetails = Loader.Cardano.PlutusData.new_constr_plutus_data(
        Loader.Cardano.ConstrPlutusData.new(
            Loader.Cardano.Int.new_i32(1),
            bidDetailsFields,
        )
    )

    const datumFields = Loader.Cardano.PlutusList.new();
    datumFields.add(auctionDetails);
    datumFields.add(bidDetails);

    const datum = Loader.Cardano.PlutusData.new_constr_plutus_data(
        Loader.Cardano.ConstrPlutusData.new(
            Loader.Cardano.Int.new_i32(0),
            datumFields,
        )
    )
    
    return datum;
}
//--------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------//
// Redeemers
//--------------------------------------------------------------------------------//
const GRAB = () => 
{
    // The below code creates the following redeemer json
    /*
    {
        "constructor": 0,
        "fields":
        [
            {
                "int": 7
            }
        ]
    }
    */

    const fieldsInner = Loader.Cardano.PlutusList.new();
    fieldsInner.add(Loader.Cardano.PlutusData.new_integer(Loader.Cardano.BigInt.from_str("7")));
    const redeemer = Loader.Cardano.PlutusData.new_constr_plutus_data(
        Loader.Cardano.ConstrPlutusData.new(
            Loader.Cardano.Int.new_i32(0),
            fieldsInner
        )
    )
    return redeemer;
}
//--------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------//
// Endpoints
//--------------------------------------------------------------------------------//
export const start = async (startDatum: any) => {
    const { txBuilder, datums, metadata, outputs } = await initializeTransaction();
    const walletAddress = await getBaseAddress();
    const utxos = await getUtxos();
    
    outputs.add(
        
    )
}
//--------------------------------------------------------------------------------//