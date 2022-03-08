import Loader from '../loader';
import { fromHex } from '../serialization';

//--------------------------------------------------------------------------------//
// Datums
//--------------------------------------------------------------------------------//
export const SellOffer_DATUM = (sellOfferDetails: SellOffer) => 
{
    // The code below creates this json format    
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
                    "int": 10 // adMarketplacePercent (this is 1%)
                },
                {
                    "bytes": "67614c1b06ddbb100cb6cbe919594cac31771c25530b6c7f28da242b" // adMarketplaceAddress
                },
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

    const { aSeller,aSellPrice, aCurrency, aToken } = sellOfferDetails;

    // Construct Cardano Json
    const sellOfferFields = Loader.Cardano.PlutusList.new();
    sellOfferFields.add(Loader.Cardano.PlutusData.new_bytes(fromHex(aSeller)))
    sellOfferFields.add(Loader.Cardano.PlutusData.new_integer(Loader.Cardano.BigInt.from_str(aSellPrice)))
    sellOfferFields.add(Loader.Cardano.PlutusData.new_bytes(fromHex(aCurrency)))
    sellOfferFields.add(Loader.Cardano.PlutusData.new_bytes(fromHex(aToken)))
    
    const sellOffer = Loader.Cardano.PlutusData.new_constr_plutus_data(
        Loader.Cardano.ConstrPlutusData.new(
            Loader.Cardano.Int.new_i32(0),
            sellOfferFields,
        )
    )

    const buyOfferFields = Loader.Cardano.PlutusList.new();
    const buyOffer = Loader.Cardano.PlutusData.new_constr_plutus_data(
        Loader.Cardano.ConstrPlutusData.new(
            Loader.Cardano.Int.new_i32(1),
            buyOfferFields,
        )
    )

    const datumFields = Loader.Cardano.PlutusList.new();
    datumFields.add(sellOffer);
    datumFields.add(buyOffer);

    const datum = Loader.Cardano.PlutusData.new_constr_plutus_data(
        Loader.Cardano.ConstrPlutusData.new(
            Loader.Cardano.Int.new_i32(0),
            datumFields,
        )
    )
    
    return datum;
}

export const BuyOffer_DATUM = (sellOfferDetails: SellOffer, buyOfferDetails: BuyOffer) => 
{
    // The code below creates this json format    
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
                        "int": 1 // adMarketplacePercent
                    },
                    {
                        "bytes": "67614c1b06ddbb100cb6cbe919594cac31771c25530b6c7f28da242b" // adMarketplaceAddress
                    },
                ]
            },
            {
                "constructor": 1,
                "fields": [
                    {
                        "bytes" : "5e96005ccd0c8ff27ef924bcbf7f3eae0c2e8597b5cc0c3b1cd5edaa" // bdBidder
                    },
                    {
                        "int" : 10000000 // bdBid
                    }
                ]
            }
        ]
    }
    */

    const { aSeller,aSellPrice ,aCurrency, aToken } = sellOfferDetails;

    // Construct Cardano Json
    const sellOfferFields = Loader.Cardano.PlutusList.new();
    sellOfferFields.add(Loader.Cardano.PlutusData.new_bytes(fromHex(aSeller)))
    sellOfferFields.add(Loader.Cardano.PlutusData.new_integer(Loader.Cardano.BigInt.from_str(aSellPrice)))
    sellOfferFields.add(Loader.Cardano.PlutusData.new_bytes(fromHex(aCurrency)))
    sellOfferFields.add(Loader.Cardano.PlutusData.new_bytes(fromHex(aToken)))
    const sellOffer = Loader.Cardano.PlutusData.new_constr_plutus_data(
        Loader.Cardano.ConstrPlutusData.new(
            Loader.Cardano.Int.new_i32(0),
            sellOfferFields,
        )
    )

    const { bBuyer, bBuyOffer } = buyOfferDetails;

    const buyOfferFields = Loader.Cardano.PlutusList.new();
    buyOfferFields.add(Loader.Cardano.PlutusData.new_bytes(fromHex(bBuyer)))
    buyOfferFields.add(Loader.Cardano.PlutusData.new_integer(Loader.Cardano.BigInt.from_str(bBuyOffer)))
    const buyOffer = Loader.Cardano.PlutusData.new_constr_plutus_data(
        Loader.Cardano.ConstrPlutusData.new(
            Loader.Cardano.Int.new_i32(0),
            buyOfferFields,
        )
    )

    // Need to wrap the bid details in another constructor due to the Haskell "Maybe"
    const maybeBuyOfferFields = Loader.Cardano.PlutusList.new();
    maybeBuyOfferFields.add(buyOffer);
    const maybeBuyOffer = Loader.Cardano.PlutusData.new_constr_plutus_data(
        Loader.Cardano.ConstrPlutusData.new(
            Loader.Cardano.Int.new_i32(0),
            maybeBuyOfferFields,
        )
    )

    const datumFields = Loader.Cardano.PlutusList.new();
    datumFields.add(sellOffer);
    datumFields.add(maybeBuyOffer);

    const datum = Loader.Cardano.PlutusData.new_constr_plutus_data(
        Loader.Cardano.ConstrPlutusData.new(
            Loader.Cardano.Int.new_i32(0),
            datumFields,
        )
    )
    
    return datum;
}
//--------------------------------------------------------------------------------//