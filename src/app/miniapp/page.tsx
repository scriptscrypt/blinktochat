// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const MiniApp = () => {
//   const searchParams = useSearchParams();
//   const [appData, setAppData] = useState<any>();
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAppData = async (url: string) => {
//       try {
//         const res = await fetch(url);
//         if (!res.ok) {
//           throw new Error("Failed to fetch data");
//         }
//         const data = await res.json();
//         setAppData(data);
//       } catch (err) {
//         setError(err?.message || "Failed to fetch data");
//       }
//     };

//     const url = searchParams.get("url");
//     if (url) {
//       const initialParams = new URLSearchParams(searchParams.toString()) as any;
//       const isBlink = (url: string) => url.includes("blink");

//       if (isBlink(initialParams.get("url"))) {
//         fetchAppData(initialParams.get("url")).then((data) => {
//           if (data && data.baseUrl) {
//             fetchAppData(`${data.baseUrl}${initialParams.get("someParam")}`);
//           }
//         });
//       } else {
//         fetchAppData(initialParams.get("url"));
//       }
//     }
//   }, [searchParams]);

//   if (error) {
//     return <p>Error: {error}</p>;
//   }

//   if (!appData) {
//     return <p>Loading...</p>;
//   }

//   return (
//     <>
//       <div style={{ textAlign: "center", padding: "20px" }}>
//         <head>
//           <title>{appData.title}</title>
//           <script src="https://telegram.org/js/telegram-web-app.js"></script>
//         </head>
//         <div>
//           <h1>{appData.title}</h1>
//           <p>{appData.description}</p>
//           <img
//             src={appData.imageUrl}
//             alt="App Image"
//             style={{ maxWidth: "100%", height: "auto", marginBottom: "20px" }}
//           />
//           <div>
//             {appData.buttonNames.map((name, index) => (
//               <button
//                 key={index}
//                 onClick={() =>
//                   window.Telegram.WebApp.sendData(`Button ${index + 1}`)
//                 }
//                 style={{
//                   margin: "10px",
//                   padding: "10px 20px",
//                   fontSize: "16px",
//                   border: "none",
//                   borderRadius: "5px",
//                   backgroundColor: "#007bff",
//                   color: "white",
//                   cursor: "pointer",
//                 }}
//               >
//                 {name}
//               </button>
//             ))}
//           </div>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               margin: "20px 0",
//             }}
//           >
//             <input
//               type="text"
//               id="userInput"
//               placeholder="Enter text here"
//               style={{
//                 margin: "10px",
//                 padding: "10px",
//                 fontSize: "16px",
//                 border: "1px solid #ccc",
//                 borderRadius: "5px",
//                 width: "calc(100% - 42px)",
//               }}
//             />
//             <button
//               onClick={() =>
//                 window.Telegram.WebApp.sendData(
//                   document.getElementById("userInput").value
//                 )
//               }
//               style={{
//                 margin: "10px",
//                 padding: "10px 20px",
//                 fontSize: "16px",
//                 border: "none",
//                 borderRadius: "5px",
//                 backgroundColor: "#007bff",
//                 color: "white",
//                 cursor: "pointer",
//               }}
//             >
//               Send Input
//             </button>
//           </div>
//           <button
//             onClick={async () => {
//               try {
//                 const response = await fetch(
//                   "https://example.com/api/endpoint",
//                   {
//                     // Replace with your target URL
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ key1: "value1", key2: "value2" }),
//                   }
//                 );
//                 const responseData = await response.json();
//                 window.Telegram.WebApp.sendData(
//                   `POST request successful: ${JSON.stringify(responseData)}`
//                 );
//               } catch (error) {
//                 window.Telegram.WebApp.sendData(
//                   `POST request failed: ${error.message}`
//                 );
//               }
//             }}
//             style={{
//               margin: "10px",
//               padding: "10px 20px",
//               fontSize: "16px",
//               border: "none",
//               borderRadius: "5px",
//               backgroundColor: "#007bff",
//               color: "white",
//               cursor: "pointer",
//             }}
//           >
//             Post Data
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default MiniApp;

// src/app/page.tsx

import { FC } from "react";

const MiniAppPage: FC = () => {
  return (
    <>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Welcome to the Mini App!</h1>
        <p>This is a simple mini app page that you can open within Telegram.</p>
        <p>Feel free to customize this content as needed.</p>
      </div>
    </>
  );
};

export default MiniAppPage;
