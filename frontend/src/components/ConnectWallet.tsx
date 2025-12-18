// ConnectWallet component using RainbowKit
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ConnectWallet() {
  return (
    <ConnectButton
      accountStatus={{
        smallScreen: "avatar",
        largeScreen: "full",
      }}
      showBalance={{
        smallScreen: false,
        largeScreen: true,
      }}
      chainStatus={{
        smallScreen: "icon",
        largeScreen: "full",
      }}
    />
  );
}
