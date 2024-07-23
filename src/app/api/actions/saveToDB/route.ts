import { utilExtractFigmaId } from "@/lib/utils/utilExtractFigmaId";
import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  MEMO_PROGRAM_ID,
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

export const GET = async (req: Request) => {
  const requestUrl = new URL(req.url);
  // const { validator } = validatedQueryParams(requestUrl);

  // https://www.figma.com/design/BwYcyPfNEVqZLcjyf3lM95/TEST-for-BLINKS%232
  const baseHref = new URL(
    // `/api/actions/test1?validator=${validator.toBase58()}`,
    // requestUrl.origin,
    `/api/actions`,
    requestUrl.origin,
  ).toString();

  const payload: ActionGetResponse = {
    title: "FLinks - Figma Blinks",
    icon: new URL("/TestImg.png", new URL(req.url).origin).toString(),
    description: "Let the magic happen on Figma",
    label: "Send 1USDC",
    links: {
      actions: [
        {
          label: "Create",
          href: `${baseHref}/test1?paramFigmaUrl={paramFigmaUrl}&paramPrompt={paramPrompt}`,
          parameters: [
            {
              name: "paramFigmaUrl",
              label: "Enter the Figma link",
              required: true,
            },
            {
              name: "paramPrompt",
              label: "Enter the prompt",
              required: true,
            },
          ],
        },
        // {
        //   label: "Next", // button text
        //   // href: `${baseHref}/test1&testingName=${"1"}`, // this href will have a text input
        //   href: `${baseHref}/test1&paramfigmaFileUrl={figmaFileUrlIp}`, // this href will have a text input
        //   parameters: [
        //     {
        //       name: "figmaFileUrlIp", // parameter name in the `href` above
        //       label: "Enter the Figma Link", // placeholder of the text input
        //       required: true,
        //     },
        //   ],
        // },
        // {
        //   label: "Confirm", // button text
        //   // href: `${baseHref}/test1&testingName=${"1"}`, // this href will have a text input
        //   href: `${baseHref}/test1&paramPrompt={paramPrompt}`, // this href will have a text input
        //   parameters: [
        //     {
        //       name: "paramPrompt", // parameter name in the `href` above
        //       label: "Enter the Prompt", // placeholder of the text input
        //       required: true,
        //     },
        //   ],
        // },
      ],
    },
    // error: {
    //   message: "Sorry for the fatal error on the blink",
    // },
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET;

// export const POST = async (req: Request) => {

//   try {
//     const requestUrl = new URL(req.url);
//     console.log(`req is`, req);
//     console.log(`requestUrl Raw`, requestUrl);
//     console.log(`requestUrl is`, requestUrl?.href);
//     const { paramfigmaFileUrl: figmaFileUrl, paramPrompt: prompt } =
//       validatedQueryParams(requestUrl);

//     console.log(`figmaFileUrl is`, figmaFileUrl);
//     console.log(`prompt is`, prompt);

//     const body: ActionPostRequest = await req.json();

//     const payload: ActionPostResponse = {
//       transaction: "",
//       message: `figmaFileUrl is ${figmaFileUrl} and prompt is ${prompt}`,
//     };

//     return Response.json(
//       { payload },
//       {
//         headers: ACTIONS_CORS_HEADERS,
//       },
//     );
//   } catch (err) {
//     console.log(err);
//     let message = "An unknown error occurred";
//     if (typeof err == "string") message = err;
//     return new Response(message, {
//       status: 400,
//       headers: ACTIONS_CORS_HEADERS,
//     });
//   }
// };
// function validatedQueryParams(requestUrl: URL) {
//   console.log(`requestUrl in vaildate is`, requestUrl);
//   let paramfigmaFileUrl: string = "";
//   let paramPrompt: string = "";

//   try {
//     if (requestUrl.searchParams.get("paramPrompt")) {
//       paramPrompt = requestUrl.searchParams.get("paramPrompt")!;
//     }

//     if (requestUrl.searchParams.get("paramfigmaFileUrl")) {
//       paramfigmaFileUrl = requestUrl.searchParams.get("paramfigmaFileUrl")!;
//     }
//   } catch (err) {
//     throw "Invalid input query parameter: paramPrompt or paramfigmaFileUrl";
//   }

//   return {
//     paramfigmaFileUrl,

//     paramPrompt,
//   };
// }

// Testing in the Same File :

const figmaToken = process.env.NEXT_PUBLIC_FIGMA_API_TOKEN;

export const POST = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const figmaUrl = requestUrl.searchParams.get("paramFigmaUrl");
  const prompt = requestUrl.searchParams.get("paramPrompt");

  const fileId = utilExtractFigmaId(figmaUrl as string);
  console.log(`figmaUrl is`, figmaUrl);
  console.log(`fileId is`, fileId);
  console.log(`prompt is`, prompt);
  console.log(`figmaToken is`, figmaToken);

  if (!fileId) {
    return new Response(JSON.stringify({ error: "Invalid Figma URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = `https://api.figma.com/v1/files/${fileId}`;

  const headers = {
    "X-Figma-Token": figmaToken,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.get(url, { headers });
    const data = response.data || {};

    const connection = new Connection(
      process.env.SOLANA_RPC! || clusterApiUrl("devnet"),
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
      }),
    );

    transaction.feePayer = account;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;


    // const payload: ActionPostResponse = {
    //   transaction: transaction.serialize().toString("base64"),
    //   message: `figmaFileUrl is ${figmaUrl} and data is ${data}`,

    // };
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `figmaFileUrl is ${figmaUrl} and data is ${data}`,
      },
    });

    return Response.json(
       payload ,
      {
        headers: ACTIONS_CORS_HEADERS,
      },
    );
  } catch (error) {
    console.error("Error fetching Figma data:", error); // Log the error message specifically
    return new Response(
      JSON.stringify({
        error: "Failed to fetch Figma data xyz",
        originalError: error, // Include the specific error message in the response
      }),
      {
        status: 500,
        headers: {
          ...ACTIONS_CORS_HEADERS,
          "Access-Control-Allow-Origin": "*",
        }, // Ensure CORS headers are correctly set
      },
    );
  }
};
