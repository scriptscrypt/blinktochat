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
import { NextResponse } from "next/server";

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
    icon: new URL("/new-banner-x.png", new URL(req.url).origin).toString(),
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
  console.log("Starting POST function");

  const requestUrl = new URL(req.url);
  console.log(`requestUrl is`, requestUrl);

  const tgUserIdIp = requestUrl.searchParams.get("paramTgUserId");
  let amountIp = Number(requestUrl.searchParams.get("paramAmount"));
  if (!amountIp) amountIp = 0.001;
  const parVarSplAddress = splAddress;
  const routeChatId = chatId;

  console.log(`tgUserIdIp is`, tgUserIdIp);
  console.log(`amountIp is`, amountIp);
  console.log(`parVarSplAddress is`, parVarSplAddress);
  console.log(`routeChatId is`, routeChatId);

  const baseHref = new URL(
    `/api/actions/helpers/`,
    requestUrl.origin
  ).toString();
  console.log(`baseHref is`, baseHref);

  if (!tgUserIdIp || !amountIp) {
    console.log("Invalid parameters: paramTgUserId or paramAmount");
    return NextResponse?.json(
      {
        message: "Invalid parameters: paramTgUserId or paramAmount",
      },
      {
        headers: ACTIONS_CORS_HEADERS,
        status: 400,
      }
    );
  }

  if (Number(amountIp) < 0.00000001) {
    console.log("Invalid Amount: Amount must be greater than 0.001");
    return NextResponse?.json(
      {
        message: "Invalid Amount: Amount must be greater than 0.001",
      },
      {
        headers: ACTIONS_CORS_HEADERS,
        status: 400,
      }
    );
  }

  // Check if the Data in DB by the BOT : chatId, collectionAddress is correct or not :
  const validateUrl = `${baseHref}validateParams?paramTgChatId=${routeChatId}&paramSPLAddress=${parVarSplAddress}`;
  console.log(`validateUrl is`, validateUrl);

  const response = await axios.post(validateUrl, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(`validateParams response:`, response.data);

  if (response.data.message.status === false) {
    console.log("GroupId or Collection Address is not correct");
    return NextResponse?.json(
      {
        message: "GroupId or Collection Address is not correct",
      },
      {
        headers: ACTIONS_CORS_HEADERS,
        status: 400,
      }
    );
  }

  console.log("Validation passed, proceeding with transaction");

  // Transaction part for SOL tx :
  const connection = new Connection(
    process.env.SOLANA_RPC! ||
      clusterApiUrl(envEnviroment === "production" ? "mainnet-beta" : "devnet")
  );
  console.log("Connection established with Solana network");

  // Get recent blockhash
  const transaction = new Transaction();
  console.log("Transaction object created");

  // Set the end user as the fee payer
  const body: ActionPostRequest = await req.json();
  console.log("Request body:", body);

  const account = new PublicKey(body.account);
  console.log(`Account public key:`, account.toBase58());

  // Get NFTs for a user and validate:
  let paramPage = 1;
  const getNftsUrl = `${baseHref}getAssetsByAddress?paramOwnerAddress=${account?.toBase58()}&paramPage=${paramPage}`;
  console.log(`getNftsUrl is`, getNftsUrl);

  const getNftsResponse = await axios.post(getNftsUrl, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(`getAssetsByAddress response:`, getNftsResponse.data);

  const nfts = getNftsResponse.data;
  if (nfts.length === 0) {
    console.log("User does not have any NFT");
    return NextResponse?.json(
      {
        message: `You don't have any NFT`,
      },
      {
        headers: ACTIONS_CORS_HEADERS,
        status: 400,
      }
    );
  }
  console.log(`First NFT in response:`, nfts[0]);

  const desiredNftMintAddress = parVarSplAddress;
  console.log(`Desired NFT Mint Address:`, desiredNftMintAddress);

  const userHasNft = nfts.some((nft: any) => {
    console.log(`Checking NFT:`, nft);
    return nft?.grouping?.[0]?.group_value === desiredNftMintAddress;
  });

  if (!userHasNft) {
    console.log(`User does not have the NFT from ${parVarSplAddress}`);
    return NextResponse?.json(
      {
        message: `You don't have the NFT from ${parVarSplAddress}`,
      },
      {
        headers: ACTIONS_CORS_HEADERS,
        status: 400,
      }
    );
  } else {
    console.log(`User has NFT from ${parVarSplAddress}`);
  }

  const totalAmount = parseFloat(amountIp?.toString()) * LAMPORTS_PER_SOL;
  console.log(`Total amount in lamports:`, totalAmount);

  const amountBackToUser = Math.floor(totalAmount * 0.95);
  console.log(`Amount back to user:`, amountBackToUser);

  const amountToEnvSPL = totalAmount - amountBackToUser;
  console.log(`Amount to envSPLAddress:`, amountToEnvSPL);

  const validatorAddress = envSPLAddress;
  console.log(`Validator address:`, validatorAddress);

  const url = `${baseHref}saveToDB?paramAccount=${account}&paramTgUserId=${tgUserIdIp}&paramAmount=${amountIp}&paramUsername=${tgUserIdIp}&paramTgChatId=${routeChatId}&paramSPLAddress=${parVarSplAddress}`;
  console.log(`saveToDB URL:`, url);

  const res = await axios.post(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(`saveToDB response:`, res.data);

  const inviteLinkfromRes = res?.data?.message;
  console.log(`Invite link from response:`, inviteLinkfromRes);

  // Create transaction
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: account,
      lamports: amountBackToUser,
    })
  );
  console.log("Added transfer instruction for user: ");

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: new PublicKey(
        validatorAddress || "39G4S57hEMsbD1npzi22heiEvjAHnnTG3ixciDHozcNj"
      ),
      lamports: amountToEnvSPL,
    })
  );
  console.log("Added transfer instruction for envSPLAddress");

  transaction.feePayer = account;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;
  console.log("Set fee payer and recent blockhash");

  if (!inviteLinkfromRes) {
    console.log("Failed to create an Invite Link");
    return NextResponse?.json(
      {
        message: "Failed to create an Invite Link",
      },
      {
        headers: ACTIONS_CORS_HEADERS,
        status: 400,
      }
    );
  }

  console.log("Creating post response");

  // Before creating the post response, save the data to the DB
  // Get Account from the request body
  const payload: ActionPostResponse = await createPostResponse({
    fields: {
      transaction,
      message: inviteLinkfromRes?.inviteLink,
    },
  });
  console.log("Post response payload:", payload);

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};
