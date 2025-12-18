import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains"; // Add more chains later

export const config = getDefaultConfig({
  appName: "Verifiable Rental Protocol",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  chains: [mainnet, sepolia], // Start with testnet + main for dev
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http("https://eth-sepolia.g.alchemy.com/v2/your_alchemy_key"), 
  },
  ssr: true, 
});
