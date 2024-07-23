// Telegram Bot API Functions from
// https://grammy.dev/ref/core/api

// Telegram Bot API :
import { Bot, Api } from "grammy";
import { envTelegramBotToken, envTelegramChatId } from "../envConfig/envConfig";
import { utilExtractInviteLink } from "../utils/utilExtractInviteLink";

// Testing with grammy:
if (!envTelegramBotToken || !envTelegramChatId) {
  throw new Error("Missing Telegram bot token or group chat ID");
}

const bot = new Bot(envTelegramBotToken);

// Get user ID from username
export async function fnGetUserIdFromUsername(
  username: string
): Promise<number> {
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

export async function fnApproveChatJoinRequest(
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
export async function fnAddUserToGroup(
  userIdentifier: string | number
): Promise<boolean> {
  try {
    let userId: number;
    if (typeof userIdentifier === "string") {
      userId = await fnGetUserIdFromUsername(userIdentifier);
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

export async function fnExportChatInviteLink(chatId: string): Promise<string> {
  try {
    const chatInviteLink = await bot.api.exportChatInviteLink(chatId);
    console.log(`Chat invite link: ${chatInviteLink}`);
    return chatInviteLink;
  } catch (error) {
    console.error("Failed to export chat invite link. Error:", error);
    throw error;
  }
}

export async function fnVerifyChatExists(chatId: string): Promise<boolean> {
  try {
    const chat = await bot.api.getChat(chatId);
    console.log("Chat info:", chat);
    return true;
  } catch (error) {
    console.error("Error verifying chat:", error);
    return false;
  }
}

export async function fnSendTelegramMessage(chatId: string, message: string) {
  try {
    console.log("Sending message to Telegram chat:", chatId);
    await bot.api.sendMessage(chatId, message);
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending message to Telegram chat:", error);
  }
}

export async function fnGetChatAdministrators(chatId: string) {
  try {
    const chatAdministrators = await bot.api.getChatAdministrators(chatId);
    console.log("Chat administrators:", chatAdministrators);
    return chatAdministrators;
  } catch (error) {
    console.error("Error getting chat administrators:", error);
    throw error;
  }
}

export async function fnCreateUniqueInviteLink(
  chatId: string,
  username: string
): Promise<string> {
  try {
    const result = await bot.api.createChatInviteLink(chatId, {
      creates_join_request: false,
      name: `Invite for user ${username}`,
      // expire_date: Math.floor(Date.now() / 1000) + 3600, // Link expires in 1 hour
      member_limit: 1, // Can only be used once
    });
    return result.invite_link;
  } catch (error) {
    console.error(`Error creating invite link for user ${username}:`, error);
    throw error;
  }
}

export async function fnUnbanUser(
  chatId: string,
  userId: number
): Promise<boolean> {
  try {
    await bot.api.unbanChatMember(chatId, userId, {
      only_if_banned: true, // This ensures the action is only taken if the user is actually banned
    });
    console.log(`Successfully unbanned user ${userId} from chat ${chatId}`);
    return true;
  } catch (error) {
    console.error(
      `Failed to unban user ${userId} from chat ${chatId}. Error:`,
      error
    );
    return false;
  }
}
