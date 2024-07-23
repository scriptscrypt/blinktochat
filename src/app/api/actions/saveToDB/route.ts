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

// Testing with grammy:
if (!BOT_TOKEN || !GROUP_CHAT_ID) {
  throw new Error("Missing Telegram bot token or group chat ID");
}

const bot = new Bot(BOT_TOKEN);

export async function POST(req: Request) {
  const requestUrl = new URL(req.url);
  const amount = requestUrl.searchParams.get("paramAmount");
  const usernameIp = requestUrl.searchParams.get("paramUsername");
  const telegramIdIp = usernameIp;

  try {
    const client = await clientPromise;
    const db = client.db();

    // // `users` is the collection name
    const usersCollection = db.collection("users");

    // // save to DB :
    // console.log("Telegram Id saving to DB", telegramIdIp);
    await usersCollection.insertOne({
      telegramIdIp,
      usernameIp,
      amount,
      date: Date.now(),
    });

    // Attempt to add the user to the group
    // const addSuccess = await addUserToGroup(telegramIdIp as string);

    // const extractedUserId = await getUserIdFromUsername(
    //   `@${usernameIp}` as string
    // );
    // console.log("Extracted user ID:", extractedUserId);

    // Verify chat exists
    // const chatExists = verifyChatExists(envTelegramChatId as string);
    // if (!chatExists) {
    //   throw new Error(
    //     "Specified Telegram chat not found or bot doesn't have access"
    //   );
    // }

    if (!envTelegramChatId) {
      throw new Error("Telegram chat ID is not set in environment variables");
    }
    const addSuccess = await createUniqueInviteLink(
      envTelegramChatId as string,
      usernameIp as string
    );

    if (addSuccess) {
      return Response.json({
        // message: `User added successfully to database and Telegram group. ${addSuccess}`,
        message: `${addSuccess}`,
      }) as Response;
    } else {
      return Response.json(
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

// Telegram Bot API Functions from
// https://grammy.dev/ref/core/api

// Get user ID from username
async function getUserIdFromUsername(username: string): Promise<number> {
  try {
    const chat = await bot.api.getChat(username);
    if ("id" in chat) {
      console.log("Retrieved user ID:", chat.id);
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

async function approveChatJoinRequest(
  chatId: string,
  userId: number
): Promise<boolean> {
  try {
    console.log(
      `Attempting to approve join request for user ${userId} in chat ${chatId}`
    );
    await bot.api.approveChatJoinRequest(chatId, userId);
    console.log(`Successfully approved chat join request for user ${userId}`);
    return true;
  } catch (error) {
    console.error(
      `Failed to approve chat join request for user ${userId} in chat ${chatId}. Error:`,
      error
    );
    return false;
  }
}

// Add user to group
async function addUserToGroup(
  userIdentifier: string | number
): Promise<boolean> {
  try {
    let userId: number;
    if (typeof userIdentifier === "string") {
      userId = await getUserIdFromUsername(userIdentifier);
    } else {
      userId = userIdentifier;
    }
    // await bot.api.addChatMember(GROUP_CHAT_ID, userId);
    console.log(`Successfully added user ${userId} to the group.`);
    return true;
  } catch (error) {
    console.error(
      `Failed to add user ${userIdentifier} to the group. Error:`,
      error
    );
    return false;
  }
}

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

async function verifyChatExists(chatId: string): Promise<boolean> {
  try {
    const chat = await bot.api.getChat(chatId);
    console.log("Chat info:", chat);
    return true;
  } catch (error) {
    console.error("Error verifying chat:", error);
    return false;
  }
}

async function sendTelegramMessage(chatId: string, message: string) {
  try {
    console.log("Sending message to Telegram chat:", chatId);
    await bot.api.sendMessage(chatId, message);
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending message to Telegram chat:", error);
  }
}

async function getChatAdministrators(chatId: string) {
  try {
    const chatAdministrators = await bot.api.getChatAdministrators(chatId);
    console.log("Chat administrators:", chatAdministrators);
    return chatAdministrators;
  } catch (error) {
    console.error("Error getting chat administrators:", error);
    throw error;
  }
}

async function createUniqueInviteLink(
  chatId: string,
  username: string
): Promise<string> {
  try {
    const result = await bot.api.createChatInviteLink(chatId, {
      creates_join_request: false,
      // name: `Invite for user ${userId }`,
      name: `Invite for user ${username}`,
      expire_date: Math.floor(Date.now() / 1000) + 3600, // Link expires in 1 hour
      member_limit: 1, // Can only be used once
    });
    console.log(
      `Created unique invite link for user ${username}:`,
      result.invite_link
    );
    return result.invite_link;
  } catch (error) {
    console.error(`Error creating invite link for user ${username}:`, error);
    throw error;
  }
}
