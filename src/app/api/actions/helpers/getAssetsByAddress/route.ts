import { envHeliusApiKey, envHeliusRpcUrl } from "@/lib/envConfig/envConfig";
import axios from "axios";
import fs from "fs";

const url = envHeliusRpcUrl;
if (!url) {
  throw new Error("Helius RPC URL is not set in environment variables");
}

export const POST = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const ownerAddress = requestUrl.searchParams.get("paramOwnerAddress");
  const page = requestUrl.searchParams.get("paramPage");

  const assetsByOwnerRes = await axios.post(
    url,
    {
      jsonrpc: "2.0",
      id: "text",
      method: "getAssetsByOwner",
      params: {
        ownerAddress: ownerAddress,
        page: Number(page),
        limit: 1000,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const assets = assetsByOwnerRes?.data;

  console.log(`Assets by Owner ${ownerAddress}`, assets);
  // fs.writeFileSync("assetsByOwner.txt", JSON.stringify(assets?.data, null, 2));
  // console.log("Assets by Owner: ", assets);

  // fs.writeFileSync("assetsByOwner.txt", JSON.stringify(assets, null, 2));
  if (!assets?.result?.items) {
    return new Response(JSON.stringify([]));
  }
  return new Response(JSON.stringify(assets?.result?.items));
};
