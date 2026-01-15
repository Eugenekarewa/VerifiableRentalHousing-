"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { ReactNode, useState, useCallback } from "react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";
import { Booking, BookingStatus, CreateBookingParams, TransactionResult } from "@/types/contract";
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme, ConnectButton } from '@rainbow-me/rainbowkit';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Get WalletConnect project ID from environment
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'demo-project-id';

// Create wallet connectors
const walletConnectConnector = projectId !== 'demo-project-id' 
  ? walletConnect({ projectId, showQrModal: false })
  : injected();

// Create wagmi config
const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    injected(),
    walletConnectConnector,
  ],
  transports: {
    [sepolia.id]: http("https://ethereum-sepolia.publicnode.com"),
    [mainnet.id]: http(),
  },
});

// Contract hooks
export function useRequestBooking() {
  const [isPending, setIsPending] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const [bookingId, setBookingId] = useState<bigint | undefined>();
  const [error, setError] = useState<string | undefined>();

  const { address, chain } = useAccount();
  const { writeContract, data: hash, isError: writeError, failureReason } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const requestBooking = useCallback(async (params: CreateBookingParams): Promise<TransactionResult> => {
    if (!address) {
      return { success: false, error: "Wallet not connected" };
    }

    setIsPending(true);
    setError(undefined);
    setTransactionHash(undefined);
    setBookingId(undefined);

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "requestBooking",
        args: [params.propertyId, params.encryptedUserData],
        account: address,
        chain,
      });

      return {
        success: true,
        transactionHash: hash,
        bookingId: undefined,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsPending(false);
    }
  }, [address, chain, writeContract, hash]);

  return {
    requestBooking,
    isPending: isPending || isConfirming,
    isConfirming,
    isConfirmed,
    transactionHash: hash,
    bookingId,
    error: error || (failureReason?.message) || (writeError ? "Write contract failed" : undefined),
  };
}

export function useGetBooking(bookingId: bigint | undefined) {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getBooking",
    args: bookingId ? [bookingId] : undefined,
    query: {
      enabled: !!bookingId,
    },
  });

  const booking: Booking | undefined = data
    ? {
        tenant: data[0],
        propertyId: data[1],
        depositAmount: data[2],
        checkInDate: data[3],
        checkOutDate: data[4],
        verificationHash: data[5],
        status: Number(data[6]) as BookingStatus,
      }
    : undefined;

  return { booking, isError, isLoading };
}

export function useCancelBooking() {
  const [isPending, setIsPending] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const { address, chain } = useAccount();
  const { writeContract, data: hash, isError: writeError, failureReason } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const cancelBooking = useCallback(
    async (bookingId: bigint): Promise<TransactionResult> => {
      if (!address) {
        return { success: false, error: "Wallet not connected" };
      }

      setIsPending(true);
      setError(undefined);
      setTransactionHash(undefined);

      try {
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "cancelBooking",
          args: [bookingId],
          account: address,
          chain,
        });

        return {
          success: true,
          transactionHash: hash,
          bookingId,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Transaction failed";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsPending(false);
      }
    },
    [address, chain, writeContract, hash]
  );

  return {
    cancelBooking,
    isPending: isPending || isConfirming,
    isConfirming,
    isConfirmed,
    transactionHash: hash,
    error: error || (failureReason?.message) || (writeError ? "Write contract failed" : undefined),
  };
}

export function useGetTenantBookings(tenantAddress: `0x${string}` | undefined) {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTenantBookings",
    args: tenantAddress ? [tenantAddress] : undefined,
    query: {
      enabled: !!tenantAddress,
    },
  });

  return { bookingIds: (data as bigint[] | undefined), isError, isLoading };
}

export function useWalletConnection() {
  const { address, isConnected, chainId, chain } = useAccount();

  return {
    address: address as `0x${string}` | undefined,
    isConnected,
    chainId,
    chainName: chain?.name,
    chain,
  };
}

export function useEncryptUserData() {
  const encryptUserData = useCallback((data: Record<string, unknown>): `0x${string}` => {
    const jsonString = JSON.stringify(data);
    let hexString = "0x";
    for (let i = 0; i < jsonString.length; i++) {
      hexString += jsonString.charCodeAt(i).toString(16).padStart(2, "0");
    }
    return hexString as `0x${string}`;
  }, []);

  return { encryptUserData };
}

// Custom RainbowKit theme
const vrTheme = darkTheme({
  accentColor: '#2563eb',
  accentColorForeground: 'white',
  borderRadius: 'large',
  overlayBlur: 'small',
});

// Provider component
export function Web3Provider({ children }: { children: ReactNode }): ReactNode {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={vrTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { QueryClient, QueryClientProvider, WagmiProvider, ConnectButton };

