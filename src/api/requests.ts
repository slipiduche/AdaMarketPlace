import { adablobsAPI, blockfrostAPI } from '../api/api';
import { blockfrostAPIKey } from '../consts/consts';

// ADABlobs Functions
export const fetchAssets = async ({ pageParam = 1 } : any) => {
    const response = await fetch(`${adablobsAPI.baseURL}${adablobsAPI.endpoints.blobs(pageParam)}`)
    return response.json();
}

export const fetchAsset = async ({ queryKey } : any) => {
    const [_key, asset] = queryKey
    if (!asset) return {};

    const response = await fetch(`${adablobsAPI.baseURL}${adablobsAPI.endpoints.blob(asset)}`)
    return response.json();
}

// Blockfrost Functions
export const blockfrostAPIRequest = async (endpoint: string, headers? : any, body? : any) =>
{
    const url = `${blockfrostAPI.baseURL}${endpoint}`;
    console.log(url);
    const response = await fetch(url, {
        headers: {
        project_id: blockfrostAPIKey,
        ...headers,
        "User-Agent": "adablobs",
        },
        method: body ? "POST" : "GET",
        body,
    })
    return response.json();
}