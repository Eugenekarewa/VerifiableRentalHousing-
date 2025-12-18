
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Verifiable Rental Protocol",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  chains: [sepolia, mainnet], // Prioritize Sepolia for testing
  transports: {
    [sepolia.id]: http("https://ethereum-sepolia.publicnode.com"),
    [mainnet.id]: http(),
  },
  ssr: true,
  // Add custom wallet connectors
  walletConnectParameters: {
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
    metadata: {
      name: "Verifiable Rental Protocol",
      description: "Trust-minimized rentals on blockchain",
      url: "https://verifiable-rental.vercel.app",
      icons: ["https://vercel.com/icon.png"]
    }
  }
});
