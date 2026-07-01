import React from "react";
import ReactDOM from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import { App } from "./App";
import { ToastProvider } from "./components/ui/Toast";
import { installRpcIdShim } from "./lib/rpcIdShim";
import { installSnapsShim } from "./lib/snapsShim";
import "./index.css";

// Bradbury RPC rejects string JSON-RPC ids; and Rabby rejects MetaMask Snaps
// probes. Install both interceptors before any wallet / privy code runs.
installRpcIdShim();
installSnapsShim();

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID ?? "";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#ff4d4d",
          logo: undefined,
        },
        loginMethods: ["wallet", "email"],
        embeddedWallets: { createOnLogin: "users-without-wallets" },
      }}
    >
      <ToastProvider>
        <App />
      </ToastProvider>
    </PrivyProvider>
  </React.StrictMode>,
);
