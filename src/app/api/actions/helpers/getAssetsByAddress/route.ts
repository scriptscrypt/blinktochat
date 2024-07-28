import { envHeliusApiKey, envHeliusRpcUrl } from "@/lib/envConfig/envConfig";
import axios from "axios";

const url = envHeliusRpcUrl;
if (!url) {
  throw new Error("Helius RPC URL is not set in environment variables");
}

export const POST = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const ownerAddress = requestUrl.searchParams.get("paramOwnerAddress");

  const assetsByOwnerRes = await axios.post(
    url,
    {
      jsonrpc: "2.0",
      id: "text",
      method: "getAssetsByOwner",
      params: {
        ownerAddress: ownerAddress,
        page: 1,
        limit: 1000,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const assets = assetsByOwnerRes.data.result.items;
  console.log("Assets by Owner: ", assets);

  // Some error - TBD
  // if (assets.length == 0) {
  //   throw new Error(`No assets found for owner ${ownerAddress}`);
  // }
  return new Response(JSON.stringify(assets));
};
