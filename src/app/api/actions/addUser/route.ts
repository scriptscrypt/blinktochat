import {
  envTelegramBotToken,
  envTelegramChatId,
} from "@/lib/envConfig/envConfig";
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
import { Bot } from "grammy";

const BOT_TOKEN = envTelegramBotToken;
const GROUP_CHAT_ID = envTelegramChatId;

const bot = new Bot(BOT_TOKEN || "");

export const GET = async (req: Request) => {
  bot.on("message", async (ctx) => {
    const chatId = ctx.chat.id;
    console.log(`Received message from chat ID: ${chatId}`);

    // You can send this ID back to yourself or log it
    // await ctx.reply(`This group's ID is: ${chatId}`);
  });

  //
  console.log(`Starting the bot`);
  bot.start();

  const requestUrl = new URL(req.url);
  // const { validator } = validatedQueryParams(requestUrl);

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
          href: `${baseHref}/addUser?paramTgUserId={paramTgUserId}&paramAmount={paramAmount}`,
          parameters: [
            {
              name: "paramTgUserId",
              label: "Enter the TgUserId",
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
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET;

// Testing in the Same File - Working :
const tgBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;

export const POST = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const tgUserIdIp = requestUrl.searchParams.get("paramTgUserId");
  const amountIp = requestUrl.searchParams.get("paramAmount");

  console.log(`tgAPIKEY is`, tgBotToken);
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

  const baseHref = new URL(
    // `/api/actions/test1?validator=${validator.toBase58()}`,
    // requestUrl.origin,
    `/api/actions/saveToDB`,
    requestUrl.origin
  ).toString();

  const url = `${baseHref}?paramTgUserId=${tgUserIdIp}&paramAmount=${amountIp}&paramUsername=${tgUserIdIp}`;

  // const headers = {
  //   "Content-Type": "application/json",
  // };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = response.json || {};

    console.log(`data in addUser is`, JSON.stringify(data, null, 2));

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

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `The Account : ${
          body.account
        } with username ${tgUserIdIp} has been added to the Group for ${amountIp} SOL data : ${JSON.stringify(
          data,
          null,
          2
        )}`,
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