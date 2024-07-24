import {
  envEnviroment,
  envSPLAddress,
  envTelegramBotToken,
} from "@/lib/envConfig/envConfig";
import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  ActionIdentifierError,
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
import { Bot } from "grammy";

const bot = new Bot(envTelegramBotToken || "");
export const GET = async (
  req: Request,
  { params: { chatId, splAddress } }: { params: any }
) => {
  const routeChatId = chatId;

  const chatDetails = await bot.api.getChat(routeChatId);

  const chatTitle = chatDetails.title;
  console.log(`chatDetails is`, chatDetails);

  console.log(`Starting the bot`);

  const requestUrl = new URL(req.url);
  // const parVarSplAddress = requestUrl.searchParams.get("paramSPLAddress");
  const parVarSplAddress = splAddress;

  const baseHref = new URL(`/api/actions`, requestUrl.origin).toString();

  const payload: ActionGetResponse = {
    title: `Blinktochat.fun`, 
    icon: new URL("/btcLarge.gif", new URL(req.url).origin).toString(),
    description: `\nGet access to ${chatTitle?.toUpperCase()}\n \nShare your Telegram alias, Blink some SOL, join the fun!`,
    label: "Enter your Telegram userId",
    links: {
      actions: [
        {
          label: "Enter the Chat",
          href: `${baseHref}/start/${routeChatId}/${parVarSplAddress}?paramTgUserId={paramTgUserId}&paramAmount={paramAmount}&paramTgChatId=${routeChatId}`,
          parameters: [
            {
              name: "paramTgUserId",
              label: "Enter your Telegram username",
              required: true,
            },
            {
              name: "paramAmount",
              label: "Enter the Amount in SOL",
              required: true,
            },
          ],
        },
      ],
    },
    // error: {
    //   message: "Please check Group Id and Amount",
    // }
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET;

// Testing in the Same File - Working :
export const POST = async (
  req: Request,
  { params: { chatId, splAddress } }: { params: any }
) => {
  const requestUrl = new URL(req.url);
  console.log(`requestUrl is`, requestUrl);
  const tgUserIdIp = requestUrl.searchParams.get("paramTgUserId");
  const amountIp = requestUrl.searchParams.get("paramAmount");
  // const parVarSplAddress = requestUrl.searchParams.get("paramSPLAddress");
  const parVarSplAddress = splAddress;
  const routeChatId = chatId;

  // console.log(`tgAPIKEY is`, tgBotToken);
  console.log(`tgUserIdIp is`, tgUserIdIp);
  console.log(`amountIp is`, amountIp);

  if (!tgUserIdIp || !amountIp) {
    return new Response(
      JSON.stringify({
        error: "Invalid parameters: paramTgUserId or paramAmount",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const connection = new Connection(
    process.env.SOLANA_RPC! ||
      clusterApiUrl(envEnviroment === "production" ? "mainnet-beta" : "devnet")
  );

  // Get recent blockhash
  const transaction = new Transaction();
  // set the end user as the fee payer
  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: new PublicKey(parVarSplAddress || envSPLAddress || account),
      lamports: parseFloat(amountIp) * LAMPORTS_PER_SOL,
    })
  );

  transaction.feePayer = account;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  const baseHref = new URL(
    // `/api/actions/test1?validator=${validator.toBase58()}`,
    // requestUrl.origin,
    `/api/actions/helpers/saveToDB`,
    requestUrl.origin
  ).toString();

  const url = `${baseHref}?paramAccount=${account}&paramTgUserId=${tgUserIdIp}&paramAmount=${amountIp}&paramUsername=${tgUserIdIp}&paramTgChatId=${routeChatId}&paramSPLAddress=${parVarSplAddress}`;

  // const headers = {
  //   "Content-Type": "application/json",
  // };

  try {
    const response = await axios.post(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // console.log(`data in /start is ${response?.data}`);

    // console.log(response?.data?.message);

    const inviteLinkfromRes = response?.data?.message;

    if (!inviteLinkfromRes) {
      throw new Error("Not a valid Group");
    }
    // Before creating the post response, save the data to the DB
    // Get Account from the request body
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        // message: `The PubKey : ${body.account} with Telegram username ${tgUserIdIp} has been added to the Group for ${amountIp} SOL,  data : ${response}`,
        message: inviteLinkfromRes?.inviteLink,
      },
    });

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (error) {
    console.error("Error fetching TG data:", error); // Log the error message specifically
    return new Response(
      JSON.stringify({
        error: "Failed to fetch TG data xyz",
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
