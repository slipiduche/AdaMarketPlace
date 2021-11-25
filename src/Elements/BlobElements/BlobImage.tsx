import Link from 'next/link'
import { idToLongString } from '../../utils/idToLongString';

export const BlobImage = ({ blob } : { blob: Blob }) => 
{
    if (!blob) return <></>;

    return (
        <Link href={`/blobs/${blob.id.toString()}`}>
            <div type="button" className="blob-content d-flex justify-content-center rounded pb-3 mb-3" >
                <div className="blob-content-inner">
                    <div className="d-flex flex-column justify-content-center align-items-center">
                        <img src={blob.image} width={"100%"} height={"100%"} />
                        <div className="blob-name mb-2">{blob.name} {idToLongString(blob.id)}</div>
                        <button type="button" className="btn btn-primary btn-block">Buy</button>
                    </div>  
                </div>
                <style jsx>{`
                    .blob-content {                        
                        background-color: #f4f4f4;
                        color: #777777;
                    }

                    .blob-content:hover {
                        background-color: #ececec;
                    }

                    .blob-content-inner {
                        width: 80%;
                    }

                    .btn-block {
                        width: 100%;
                    }

                    .blob-name {
                        font-size: 1.2rem;
                        font-weight: 700;
                        //font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                    }

                    .blob-owner {
                        font-size: 1.2rem;
                        font-weight: 900 !important;
                        font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif
                    }
                `}</style> 
            </div>
        </Link>
    )
}


