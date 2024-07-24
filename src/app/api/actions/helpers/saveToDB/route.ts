// app/api/actions/helpers/saveToDB/route.ts

import { envMongoUri } from "@/lib/envConfig/envConfig";
import { fnCreateUniqueInviteLink } from "@/lib/telegrambotFns/botFns";
import { utilExtractInviteLink } from "@/lib/utils/utilExtractInviteLink";
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const clientPromise: Promise<MongoClient> = MongoClient.connect(
  envMongoUri || ""
);

export async function POST(req: Request) {
  const requestUrl = new URL(req.url);
  const amount = requestUrl.searchParams.get("paramAmount");
  const usernameIp = requestUrl.searchParams.get("paramUsername");
  const tgChatId = requestUrl.searchParams.get("paramTgChatId");
  const telegramIdIp = usernameIp;

  try {
    // DB setup :
    const client = await clientPromise;
    const db = client.db();

    // // `users` is the collection name
    const usersCollection = db.collection("users");
    if (!tgChatId) {
      throw new Error("Telegram chat ID is not set in environment variables");
    }

    const inviteLinkRes = await fnCreateUniqueInviteLink(
      tgChatId as string,
      usernameIp as string
    );

    // save to DB :
    console.log("Telegram Id saving to DB", telegramIdIp);
    usersCollection.insertOne({
      telegramIdIp,
      usernameIp,
      amount,
      date: Date.now(),
      inviteLink: utilExtractInviteLink(inviteLinkRes),
      hasJoined: false,
    });

    if (utilExtractInviteLink(inviteLinkRes) === null) {
      return NextResponse.json(
        { message: "Error processing request." },
        { status: 500 }
      );
    } else {
      console.log("User added successfully to database and Telegram group.");
      return Response.json({
        // message: `User added successfully to database and Telegram group. ${inviteLinkRes}`,
        message: {
          inviteLink: `${inviteLinkRes}`,
        },
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Error processing request." },
      { status: 500 }
    );
  }
}
