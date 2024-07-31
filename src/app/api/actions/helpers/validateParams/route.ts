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
  const tgChatId = requestUrl.searchParams.get("paramTgChatId");
  const account = requestUrl.searchParams.get("paramAccount");
  const splAddress = requestUrl.searchParams.get("paramSPLAddress");

  try {
    // DB setup :
    const client = await clientPromise;
    const db = client.db();

    // `groups` is the collection name
    const groupsCollection = db.collection("groups");
    if (!tgChatId) {
      throw new Error("Telegram chat ID is not set in environment variables");
    }

    if (!groupsCollection.findOne({ tgChatId: tgChatId, collectionAddress: splAddress })) {
      return Response.json({
        message: {
          status: false,
        },
      });
    } else {
      console.log("User is found on the DB with correct values");
      return Response.json({
        message: {
          status: true,
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
