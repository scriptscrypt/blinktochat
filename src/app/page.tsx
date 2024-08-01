import Image from "next/image";

// import { headers } from "next/headers";

export default function Home() {
  // const headersList = headers();
  // const fullUrl = headersList.get("referer") || "";
  const fullUrl = "https://blinktochat.fun/";
  // const fullUrl = "http://localhost:3000/";

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
        <Image
          // className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/new-banner-x.png"
          alt="App Logo"
          width={640}
          height={480}
          priority
        />
      </div>

      {/* <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-2 lg:text-left"> */}
      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-3 lg:text-left">
        <a
          href={`https://dial.to/devnet?action=solana-action:${fullUrl}api/actions/start/-1002232395603/3Coor2Baqhi8GUZqFF3uRvd4xiCKX6XU2KbgsSVqkcbW`}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 "
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Dial.to Action{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Open on Dial.to Action - Devnet (Beta)
          </p>
        </a>

        <a
          href="https://github.com/scriptscrypt/tg-blink/"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 "
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            BLink{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Get the source code here
          </p>
        </a>

        <a
          href="https://github.com/scriptscrypt/blinktochat-bot-py"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 "
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Telegram BOT {" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Get the source code here
          </p>
        </a>
      </div>
    </main>
  );
}
