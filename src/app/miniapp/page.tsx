"use client";
import { useEffect } from "react";
import Script from "next/script";

const MiniAppPage = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
  }, []);

  const handleMainButtonClick = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('You clicked the main button!');
    }
  };

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.MainButton.setText('Click Me!');
      window.Telegram.WebApp.MainButton.onClick(handleMainButtonClick);
      window.Telegram.WebApp.MainButton.show();
    }

    return () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.MainButton.offClick(handleMainButtonClick);
      }
    };
  }, []);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Welcome to the Mini App!</h1>
        <p>This is a simple mini app page that you can open within Telegram.</p>
        <p>Feel free to customize this content as needed.</p>
      </div>
    </>
  );
};

export default MiniAppPage;
