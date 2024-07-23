// app/api/actions/saveToDB/route.ts

import {
  envMongoUri,
  envTelegramBotToken,
  envTelegramChatId,
} from "@/lib/envConfig/envConfig";
import axios from "axios";
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

// Telegram Bot API :
import { Bot, Api } from "grammy";

const clientPromise: Promise<MongoClient> = MongoClient.connect(
  envMongoUri || ""
);

const BOT_TOKEN = envTelegramBotToken;
const GROUP_CHAT_ID = envTelegramChatId;

export async function POST(req: Request) {
  const requestUrl = new URL(req.url);
  const amount = requestUrl.searchParams.get("paramAmount");
  const usernameIp = requestUrl.searchParams.get("paramUsername");
  const telegramIdIp = usernameIp;

  try {
    // const client = await clientPromise;
    // const db = client.db();

    // // users is the collection name
    // const usersCollection = db.collection("users");

    // // save to DB :
    // console.log("Telegram Id saving to DB", telegramIdIp);
    // await usersCollection.insertOne({ telegramIdIp, usernameIp, amount });

    // Attempt to add the user to the group
    // const addSuccess = await addUserToGroup(telegramIdIp as string);

    const addSuccess = await exportChatInviteLink(envTelegramChatId as string);

    if (addSuccess) {
      return NextResponse.json({
        message: `User added successfully to database and Telegram group. ${addSuccess}`,
      });
    } else {
      return NextResponse.json(
        {
          message:
            "User added to database but failed to add to Telegram group.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Error processing request." },
      { status: 500 }
    );
  }
}

// Testing with grammy:
if (!BOT_TOKEN || !GROUP_CHAT_ID) {
  throw new Error("Missing Telegram bot token or group chat ID");
}

const bot = new Bot(BOT_TOKEN);
// Get user ID from username
async function getUserIdFromUsername(username: string): Promise<number> {
  try {
    // const chat = await bot.api.getChat(`@${username}`);
    const chat = await bot.api.getChat(`${envTelegramChatId}`);
    if ("id" in chat) {
      console.log("chat in getUserIdFromUsername", chat);
      return chat.id;
    } else {
      throw new Error("Unable to get user ID from username");
    }
  } catch (error) {
    console.error(
      `Failed to get user ID for username ${username}. Error:`,
      error
    );
    throw error;
  }
}

// Add user to group
// async function addUserToGroup(
//   userIdentifier: string | number
// ): Promise<boolean> {
//   try {
//     let userId: number;
//     if (typeof userIdentifier === "string") {
//       userId = await getUserIdFromUsername(userIdentifier);
//     } else {
//       userId = userIdentifier;
//     }
//     await bot.api.addChatMember(GROUP_CHAT_ID, userId);
//     console.log(`Successfully added user ${userId} to the group.`);
//     return true;
//   } catch (error) {
//     console.error(
//       `Failed to add user ${userIdentifier} to the group. Error:`,
//       error
//     );
//     return false;
//   }
// }

async function exportChatInviteLink(chatId: string): Promise<string> {
  try {
    const chatInviteLink = await bot.api.exportChatInviteLink(chatId);
    console.log(`Chat invite link: ${chatInviteLink}`);
    return chatInviteLink;
  } catch (error) {
    console.error("Failed to export chat invite link. Error:", error);
    throw error;
  }
}
