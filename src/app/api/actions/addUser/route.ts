import { utilExtractFigmaId } from "@/lib/utils/utilExtractFigmaId";
import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import axios from "axios";

export const GET = async (req: Request) => {
  const requestUrl = new URL(req.url);
  // const { validator } = validatedQueryParams(requestUrl);

  // https://www.figma.com/design/BwYcyPfNEVqZLcjyf3lM95/TEST-for-BLINKS%232
  const baseHref = new URL(
    // `/api/actions/test1?validator=${validator.toBase58()}`,
    // requestUrl.origin,
    `/api/actions`,
    requestUrl.origin
  ).toString();

  const payload: ActionGetResponse = {
    title: "TGBlink - Telegram Blink",
    icon: new URL("/image-Blink.png", new URL(req.url).origin).toString(),
    description: "Let the magic happen on Telegram",
    label: "Enter your Telegram userId",
    links: {
      actions: [
        {
          label: "Enter the Chat",
          href: `${baseHref}/addUser?paramTgUserId={paramTgUserId}`,
          parameters: [
            {
              name: "paramTgUserId",
              label: "Enter the TgUserId",
              required: true,
            },
          ],
        },
      ],
    },
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET;

// Testing in the Same File - Working :
const tgAPIKEY = process.env.NEXT_PUBLIC_TG_API_KEY;

export const POST = async (req: Request) => {
  const requestUrl = new URL(req.url);
  // const figmaUrl = requestUrl.searchParams.get("paramFigmaUrl");
  // const prompt = requestUrl.searchParams.get("paramPrompt");

  // const fileId = utilExtractFigmaId(figmaUrl as string);
  // console.log(`figmaUrl is`, figmaUrl);
  // console.log(`fileId is`, fileId);
  // console.log(`prompt is`, prompt);
  console.log(`tgAPIKEY is`, tgAPIKEY);

  // if (!fileId) {
  //   return new Response(JSON.stringify({ error: "Invalid Figma URL" }), {
  //     status: 400,
  //     headers: { "Content-Type": "application/json" },
  //   });
  // }

  // const url = `https://api.figma.com/v1/files/${fileId}`;

  const headers = {
    "X-Figma-Token": tgAPIKEY,
    "Content-Type": "application/json",
  };

  try {
    // const response = await axios.get(url, { headers });
    // const data = response.data || {};

    const connection = new Connection(
      process.env.SOLANA_RPC! || clusterApiUrl("devnet")
    );

    // Get recent blockhash
    const transaction = new Transaction();
    // set the end user as the fee payer
    const body: ActionPostRequest = await req.json();
    const account = new PublicKey(body.account);

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: account,
        lamports: 0.0 * LAMPORTS_PER_SOL,
      })
    );

    transaction.feePayer = account;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    // const payload: ActionPostResponse = {
    //   transaction: transaction.serialize().toString("base64"),
    //   message: `figmaFileUrl is ${figmaUrl} and data is ${data}`,

    // };
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        // message: `figmaFileUrl is ${figmaUrl} and data is ${data}`,
        message: `figmaFileUrl is ${body.account} and body is ${body}`,
      },
    });

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (error) {
    console.error("Error fetching Figma data:", error); // Log the error message specifically
    return new Response(
      JSON.stringify({
        error: "Failed to fetch Figma data xyz",
        originalError: error, // Include the specific error message in the response
      }),
      {
        status: 500,
        headers: {
          ...ACTIONS_CORS_HEADERS,
          "Access-Control-Allow-Origin": "*",
        }, // Ensure CORS headers are correctly set
      }
    );
  }
};
