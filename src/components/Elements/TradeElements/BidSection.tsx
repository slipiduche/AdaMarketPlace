import { useEffect, useState } from 'react';
import Image from 'next/image';
import { adaToLovelace } from '../../../cardano/consts';
import { bid, close } from '../../../cardano/plutus/contract';
import { toHex } from '../../../cardano/serialization';
import { getBaseAddress } from '../../../cardano/wallet/wallet';
import { useAssetAuction } from '../../../hooks/assets.hooks';
import { getAuctionDatum } from '../../../cardano/plutus/utils';
import { months } from '../../../consts/consts';

export const BidSection = ({ blob } : { blob : BlobChainAsset}) => 
{
    const [showSuccess, setShowSuccess] = useState(false);
    const [txHash, setTxHash] = useState("");
    const [showError, setShowError] = useState(false);
    const [errorString, setErrorString] = useState("Ensure all fields are correct, your Cardano wallet is connected, and that the page has not been updated. If you require help please reach out in our Discord channel.");

    const assetAuctionQuery = useAssetAuction(getAsset(blob.asset));
    const auctionDatum: AuctionDatum = (assetAuctionQuery.data as AuctionDatum);
    const { adDeadline, adMinBid } : any = auctionDatum?.adAuctionDetails || { };
    const { bdBid } : any = auctionDatum?.adBidDetails || { };

    const [countdown, setCountdown] = useState(getCountdown(auctionDatum));
    const countdownText = getAllCountdownText(countdown);
    const auctionEnded = isAuctionEnded(countdown);

    useEffect(() => {
        let intervalId = setInterval(() => {
            if (!auctionDatum) {
                clearInterval(intervalId);
                return;
            }
            setCountdown(getCountdown(auctionDatum));
        }, 1000);
    }, [auctionDatum]);
    
    const closeAlert = () => {
        setShowSuccess(false);
        setShowError(false);
    }

    const validateFields = (target: any) => {
        if (!target?.amount?.value) {
            throw new Error("Bid Amount is required.");
        }

        const reserveAmount = parseInt(adMinBid);
        const newBid = target.amount.value * adaToLovelace;
        if (newBid < reserveAmount) {
            throw new Error("Bid Amount must be larger than the reserve amount.");
        }

        if (bdBid && target.amount.value < bdBid) {
            throw new Error("Bid Amount must be larger than the current bid.");
        }

        // Auction is over check
    }

    const submitBidTransaction = async (event : any) => {
        event.preventDefault();
        setShowSuccess(false);
        setShowError(false);

        const buttonIndex = 1;
        const bidButton = event.target[buttonIndex];        
        const bidText = bidButton.children[0];
        const bidSpinner = bidButton.children[1];

        try {
            bidButton.disabled = true;
            bidText.classList.add("visually-hidden");
            bidSpinner.classList.remove("visually-hidden");
    
            validateFields(event.target);
            
            const walletAddress = await getBaseAddress();

            let asset = getAsset(blob.asset);    
            const bdBidder = toHex(walletAddress.payment_cred().to_keyhash().to_bytes());
            const bidAmountLovelace = (event.target.amount.value * adaToLovelace).toString();
            const bidDetails : BidDetails = { bdBidder, bdBid: bidAmountLovelace }
            
            const txHash = await bid(asset, bidDetails);
    
            bidButton.disabled = false;
            bidText.classList.remove("visually-hidden");
            bidSpinner.classList.add("visually-hidden");
    
            setShowSuccess(true);
            setTxHash(txHash);
        }
        catch (error: any) {  
            setShowError(true);

            if (error?.info) setErrorString(error.info);
            else if (error?.message) setErrorString(error.message);
            else setErrorString("Ensure all fields are correct, your Cardano wallet is connected, and that the page has not been updated. If you require help please reach out in our Discord channel.");
            
            bidButton.disabled = false;
            bidText.classList.remove("visually-hidden");
            bidSpinner.classList.add("visually-hidden");
            console.error(error);
        }  
    }

    return (
        <div className="blob-bid container rounded mb-4">
            {showError && <div className="alert alert-danger alert-dismissible fade show mt-3">
                <strong>Error!</strong> {errorString}
                <button type="button" className="btn-close" onClick={closeAlert} data-bs-dismiss="alert"></button>
            </div> }
            {showSuccess && <div className="alert alert-success alert-dismissible fade show mt-3 truncate">
                <strong>Success!</strong> Transaction successfully submitted! 
                <br />
                <strong>Transaction hash:</strong> {txHash}
                <button type="button" className="btn-close" onClick={closeAlert} data-bs-dismiss="alert"></button>
            </div>}
            <div className="row pt-3">
                <div className="col-2">
                    <Image src="/images/CardanoLogo.png" width={40} height={40} quality={100} alt="Cardano Logo" />
                </div>
                <div className="col-8 ">
                    <span className="bid-title-text">{getTimeText(auctionDatum)}</span>
                    <div className="bid-timer rounded pt-2 pb-2 mt-2">
                        {!countdownText && <div className="spinner-border spinner-border-sm" role="status"></div> }
                        {countdownText && !auctionEnded && <div>
                            {countdownText.days} Days    
                        </div>}
                        {countdownText && !auctionEnded && <div>
                            {countdownText.hours} Hours    
                        </div>}
                        {countdownText && !auctionEnded && <div>
                            {countdownText.minutes} Minutes   
                        </div>}
                        {countdownText && !auctionEnded && <div>
                            {countdownText.seconds} Seconds   
                        </div>}
                        {auctionEnded && blob?.onchain_metadata?.name &&
                        <div>
                            The Auction For <strong>{`${blob.onchain_metadata.name}`}</strong> Has Ended
                        </div>
                        }
                    </div>                   
                    <hr className="divider" />
                    <span className="blob-purchase-title">{getTopBidText(auctionDatum)}  </span>
                    {!auctionDatum && <div className="spinner-border spinner-border-sm" role="status"></div> }
                    <span className="blob-purchase-title blob-purchase-text">{getTopBid(auctionDatum)}</span>
                    <form className="blob-form" onSubmit={submitBidTransaction}>
                        <div className="input-group mt-3 mb-3">
                            <span className="input-group-text input-bid">₳</span>
                            <input type="number" name="amount" className="form-control input-bid" placeholder="Bid Amount" aria-describedby="blobBidPrice" />
                        </div>
                        <button type="submit" className="btn btn-success btn-trade mb-4">
                            <span>Place Bid</span>
                            <div className="visually-hidden spinner-border spinner-border-sm" role="status"></div>
                        </button>
                    </form>                    
                </div>       
                <div className="col-2"></div>                                          
            </div>
            <style jsx>{`

                .blob-bid {
                    background-color: #e9f1fa;
                    color: #0a2e53;

                    border-width: 1px;
                    border-style: solid;
                    border-color: #bbc9ec; 
                    
                    width: 80vw;
                }
                
                .bid-title-text {
                    font-size: 1.9vw;
                    font-weight: 500;                    
                } 

                .bid-timer {
                    display: flex;
                    justify-content: space-around;

                    background-color: #cde1f8;

                    border-width: 1px;
                    border-style: solid;
                    border-color: #bbc9ec;

                    font-size: 2.0vw;
                    font-weight: 500;
                }

                .blob-purchase-title {
                    font-size: 1.0rem;
                }
                
                @media screen and (min-width: 576px) {
                    .bid-title-text {
                        font-size: 1.5vw;
                    }

                    .bid-timer {
                        font-size: 2.2vw;
                    }

                    .blob-purchase-title {
                        font-size: 1.4rem;
                    }
                }
                
                @media screen and (min-width: 1200px) {
                    .blob-bid {
                        width: 54vw;
                    }

                    .bid-title-text {
                        font-size: 0.9vw;
                    }

                    .bid-timer {
                        font-size: 1.4vw;
                    }
                }

                .blob-properties h2 {
                    font-weight: 700;
                    margin-bottom: 0;
                }

                .blob-purchase-text {
                    font-weight: 700;
                }

                .btn-trade {
                    width: 100%;

                    font-weight: 500;
                }

                .divider {
                    background-color: #bbc9ec;
                    height: 1px;
                    opacity: 1.0;
                }
                
                .input-bid {
                    color: #0a2e53;                    
                    font-weight: 500;
                }

                .input-group-text {
                    background-color: #cde1f8;
                }
            `}</style>
        </div>
    )
}

const getAsset = (blobAsset: string) => {
    let asset = blobAsset;
    if (process.env.NEXT_PUBLIC_ENVIRONMENT !== "production") {

        // This is the SundaeSwap Mint test token
        asset = "57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54";
    }
    return asset;
}

const getTimeText = (auctionDatum: AuctionDatum) => {
    if (!auctionDatum) return "";
    const { adDeadline } : any = auctionDatum?.adAuctionDetails || { };

    // Get Datetime data
    const datetime = new Date(parseInt(adDeadline));
    const month = months[datetime.getMonth()];
    const date = datetime.getDate()
    const year = datetime.getFullYear()
    const hours = datetime.getHours();
    const minutes = datetime.getMinutes();
    
    // Get string data
    const suffix = (hours >= 12) ? 'PM' : 'AM';
    let hour12 = (hours > 12) ? hours -12 : hours;
    hour12 = hour12 === 0 ? hour12 = 12 : hour12;
    const minuteText = (minutes > 10) ? minutes.toString() : `0${minutes.toString()}`;

    // Combine everything into the auction string
    const auctionString = `Auction ends ${month} ${date}, ${year} at ${hour12}:${minuteText} ${suffix}`;
    return auctionString
}

const getCountdown = (auctionDatum: AuctionDatum): Countdown => {
    if (!auctionDatum) return { } as Countdown;

    // Decrement endDateTime by 15 minutes to account for ttl (time to live)
    const fifteenMinutes = 1000 * 60 * 15;
    const endDatetime = parseInt(auctionDatum.adAuctionDetails.adDeadline);
    const now = Date.now();
    const difference = (endDatetime - fifteenMinutes) - now;

    const countdown: Countdown = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
    };
    return countdown;
}

const getCountdownText = (count: Number) => {
    if (!count) return "";

    if (count >= 0 && count <= 9) {
        return `0${count.toString()}`;
    }

    return count.toString()
}

const getAllCountdownText = (countdown: Countdown) => {
    if (!countdown || !countdown.days || !countdown.hours || !countdown.minutes || !countdown.seconds) return null;

    return { 
        days: getCountdownText(countdown.days), 
        hours: getCountdownText(countdown.hours), 
        minutes: getCountdownText(countdown.minutes), 
        seconds: getCountdownText(countdown.seconds), 
    };
}

const isAuctionEnded = (countdown: Countdown): boolean => {
    if (!countdown) return false;

    return (countdown.days < 0 || countdown.hours < 0 || countdown.minutes < 0 || countdown.seconds < 0);
}

const getTopBid = (auctionDatum: AuctionDatum) => {
    const { adMinBid } : any = auctionDatum?.adAuctionDetails || { };
    const { bdBid } : any = auctionDatum?.adBidDetails || { };

    if (!adMinBid && !bdBid) return "";

    if (!bdBid) {
        const reserveAmount = (parseInt(adMinBid) / adaToLovelace).toString();
        return `${reserveAmount} ₳`;
    }

    const bidAmount = (parseInt(bdBid) / adaToLovelace).toString();
    return `${bidAmount} ₳`;
}

const getTopBidText = (auctionDatum: AuctionDatum) => {
    if (!auctionDatum) return "Loading...";

    const { adMinBid } : any = auctionDatum?.adAuctionDetails || { };
    const { bdBid } : any = auctionDatum?.adBidDetails || { };

    if (!adMinBid && !bdBid) return "No Auction";
    if (!bdBid) return "Reserve Amount: ";
    return "Top Bid: ";
}