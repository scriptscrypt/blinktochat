import {
  envTelegramBotToken,
  envTelegramChatId,
} from "@/lib/envConfig/envConfig";
import axios from "axios";
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const clientPromise: Promise<MongoClient> = MongoClient.connect(
  "mongodb://localhost:27017"
);

export async function POST(req: Request) {
  const requestUrl = new URL(req.url);
  const telegramIdIp = requestUrl.searchParams.get("paramTgUserId");
  const usernameIp = requestUrl.searchParams.get("paramUsername");
  const amount = requestUrl.searchParams.get("paramAmount");

  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // save to DB :
    await usersCollection.insertOne({ telegramIdIp, usernameIp, amount });

    // Add user to the telegram group:

    await axios.post(
      "https://api.telegram.org/bot" + envTelegramBotToken + "/addChatMember",
      {
        chat_id: envTelegramChatId,
        user_id: telegramIdIp,
        user_type: "member",
      }
    );

    return NextResponse.json({ message: "User added successfully." });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json(
      { message: "Error adding user." },
      { status: 500 }
    );
  }
}
