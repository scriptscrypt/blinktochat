
# Teleblink

Personalized / Gated telegram group chat to only those who blinked you on X

![Demo Image](https://github.com/scriptscrypt/tg-blink/blob/main/screenshots/ex1.png)

## Tech Stack

| Tech | Link |
| ----------------- | ----------------- |
| Telegram BOT API | https://core.telegram.org/bots/api
| Grammy | https://www.npmjs.com/package/grammy
| MongoDB | https://mongodb.com
| Solana Web3js | https://www.npmjs.com/package/@solana/web3.js
| Solana Actions | https://www.npmjs.com/package/@solana/actions
| Dial.to - Dialect | https://dial.to
| Nextjs - TS | https://nextjs.org
| Tailwind CSS | https://tailwindcss.com


## Local Development 

Clone the [repository](https://github.com/scriptscrypt/tg-blink)

Install Nodejs Runtime (If not installed) - https://nodejs.org/en/download

Install all the dependencies 

Run the Development server

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

````
NEXT_PUBLIC_MONGODB_URI=Your Mongo DB URI

NEXT_PUBLIC_TELEGRAM_BOT_TOKEN= Your Telegram Bot Token

NEXT_PUBLIC_TELEGRAM_CHAT_ID=-100XXXXXX

NEXT_PUBLIC_ENVIROMENT=Your environment - development || production
```

All the configs for it will be available in `src/lib/envConfig/envConfig.ts`

