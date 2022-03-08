interface SellOffer
{
    aSeller: string,
    aSellPrice: string,
    aCurrency: string,
    aToken: string,   
    
    
}

interface BuyOffer
{
    bBuyer: string,
    bBuyOffer: string,
}

interface SellOfferDatum 
{
    adSellOffer: SellOffer,
    adBuyOffer?: BuyOffer,
}

interface SellOfferRedeemer 
{
    arBuyOffer?: BuyOffer,
}
