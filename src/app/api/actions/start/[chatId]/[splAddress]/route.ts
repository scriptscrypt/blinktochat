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
  const requestUrl = new URL(req.url);
  console.log(`requestUrl is`, requestUrl);
  const tgUserIdIp = requestUrl.searchParams.get("paramTgUserId");
  const amountIp = requestUrl.searchParams.get("paramAmount");
  const parVarSplAddress = splAddress;
  const routeChatId = chatId;

  console.log(`tgUserIdIp is`, tgUserIdIp);
  console.log(`amountIp is`, amountIp);

  const baseHref = new URL(
    `/api/actions/helpers/`,
    requestUrl.origin
  ).toString();

  if (!tgUserIdIp || !amountIp) {
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
    return NextResponse?.json(
      {
        message: "Invalid Amount: Amount must be greater than 0.00000001",
      },
      {
        headers: ACTIONS_CORS_HEADERS,
        status: 400,
      }
    );
  }

  // Check if the Data in DB by the BOT : chatId, splAddress is correct or not :

  const validateUrl = `${baseHref}validateParams?paramTgChatId=${routeChatId}&paramSPLAddress=${parVarSplAddress}`;

  const response = await axios.post(validateUrl, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.data.message.status === false) {
    return NextResponse?.json(
      {
        message: "GroupId or Collection Address is not correct",
        error: response.data.error,
      },

      {
        headers: ACTIONS_CORS_HEADERS,
        status: 400,
      }
    );
  }

  // Transaction part for  SOL tx :
  const connection = new Connection(
    process.env.SOLANA_RPC! ||
      clusterApiUrl(envEnviroment === "production" ? "mainnet-beta" : "devnet")
  );

  // Get recent blockhash
  const transaction = new Transaction();
  // set the end user as the fee payer
  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);
  const tolyAddress = "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY"; //For testing NFTs
  let paramPage = 1;
  // Get NFTs for a user and validate:
  const getNftsUrl = `${baseHref}getAssetsByAddress?paramOwnerAddress=${account?.toBase58()}&paramPage=${paramPage}`;

  const getNftsResponse = await axios.post(getNftsUrl, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const nfts = getNftsResponse.data;
  if (nfts.length === 0) {
    return NextResponse.json(
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

  const desiredNftMintAddress = parVarSplAddress; // This might need to be a different value
  const userHasNft = nfts.some((nft: any) => {
    console.log(`Checking NFT:`, nft);
    return nft?.grouping?.[0]?.group_value === desiredNftMintAddress;
  });

  if (!userHasNft) {
    return NextResponse.json(
      {
        message: `You don't have the NFT from ${parVarSplAddress}`,
      },
      {
        headers: ACTIONS_CORS_HEADERS,
        status: 400,
      }
    );
  } else {
    console.log(`User has NFT:`, userHasNft);
  }

  const totalAmount = parseFloat(amountIp) * LAMPORTS_PER_SOL;
  const amountToParVar = Math.floor(totalAmount * 0.95); // 95% to parVarSplAddress
  const amountToEnvSPL = totalAmount - amountToParVar; // Remaining 5% to envSPLAddress

  const url = `${baseHref}saveToDB?paramAccount=${account}&paramTgUserId=${tgUserIdIp}&paramAmount=${amountIp}&paramUsername=${tgUserIdIp}&paramTgChatId=${routeChatId}&paramSPLAddress=${parVarSplAddress}`;

  const res = await axios.post(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const inviteLinkfromRes = res?.data?.message;

  // Should we have a Wallet to send the SOL to? 
  // or Should we have create a Wallet for every user and add the SOL to it?
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: new PublicKey(account?.toBase58()),
      lamports: amountToParVar,
    })
  );

  transaction.feePayer = account;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  if (!inviteLinkfromRes) {
    // throw new Error("Not a valid Group");
    return NextResponse.json(
      {
        message: "Failed to create an Invite Link",
      },
      {
        headers: ACTIONS_CORS_HEADERS,
        status: 400,
      }
    );
  }

  // Before creating the post response, save the data to the DB
  // Get Account from the request body
  const payload: ActionPostResponse = await createPostResponse({
    fields: {
      transaction,
      message: inviteLinkfromRes?.inviteLink,
    },
  });

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};
