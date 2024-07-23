import {
  envMongoUri,
  envTelegramBotToken,
  envTelegramChatId,
} from "@/lib/envConfig/envConfig";
import axios from "axios";
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const clientPromise: Promise<MongoClient> = MongoClient.connect(
  envMongoUri || ""
);

export async function POST(req: Request) {
  const requestUrl = new URL(req.url);
  // const telegramIdIp = requestUrl.searchParams.get("paramTgUserId");

  const amount = requestUrl.searchParams.get("paramAmount");
  const usernameIp = requestUrl.searchParams.get("paramUsername");
  const telegramIdIp = usernameIp;

  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // save to DB :
    await usersCollection.insertOne({ telegramIdIp, usernameIp, amount });

    // Add user to the telegram group:

    console.log("Telegram Id saving to DB", telegramIdIp);
    await axios
      .post(
        "https://api.telegram.org/bot" + envTelegramBotToken + "/addChatMember",
        {
          chat_id: envTelegramChatId,
          user_id: telegramIdIp,
          user_type: "member",
        }
      )
      .then((response) => {
        console.log("successfully added in /saveToDB", telegramIdIp);
      })
      .catch((error) => {
        console.error("Error adding user in /saveToDB:", error);
      });

    return NextResponse.json({ message: "User added successfully." });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json(
      { message: "Error adding user." },
      { status: 500 }
    );
  }
}
