import { NextApiRequest, NextApiResponse } from "next";
import { blockfrostAPI } from "../../../../../../src/api/api";
import { blockfrostAPIRequest } from "../../../../../../src/api/requests";

const handler = async (req : NextApiRequest, res : NextApiResponse) =>
{
    const { address, asset } = req.query
    
    const endpoint = blockfrostAPI.endpoints.addresses.utxos.asset(address, asset);
    console.log('aqui');
    console.log(endpoint)
    const data = await blockfrostAPIRequest(endpoint);
    res.status(200).json(data);
}

export default handler;