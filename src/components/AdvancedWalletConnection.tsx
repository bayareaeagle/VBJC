import { CardanoWallet } from '@meshsdk/react';
import { BlockfrostProvider } from '@meshsdk/core';

interface AdvancedWalletConnectionProps {
  onConnected?: () => void;
  isDark?: boolean;
  enableWeb3Services?: boolean;
  enableBurnerWallet?: boolean;
}

export default function AdvancedWalletConnection({ 
  onConnected, 
  isDark = false,
  enableWeb3Services = false,
  enableBurnerWallet = false 
}: AdvancedWalletConnectionProps) {
  const handleWalletConnected = () => {
    console.log('Wallet connected successfully!');
    if (onConnected) {
      onConnected();
    }
  };

  // Web3 Services configuration
  const web3Services = enableWeb3Services ? {
    networkId: 0, // Mainnet
    fetcher: new BlockfrostProvider(process.env.VITE_BLOCKFROST_API_KEY || ''),
    submitter: new BlockfrostProvider(process.env.VITE_BLOCKFROST_API_KEY || ''),
  } : undefined;

  // Burner wallet configuration
  const burnerWallet = enableBurnerWallet ? {
    networkId: 0, // Mainnet
    provider: new BlockfrostProvider(process.env.VITE_BLOCKFROST_API_KEY || ''),
  } : undefined;

  return (
    <div className="advanced-wallet-connection">
      <CardanoWallet
        label="Connect Wallet"
        persist={true}
        onConnected={handleWalletConnected}
        isDark={isDark}
        web3Services={web3Services}
        burnerWallet={burnerWallet}
        cardanoPeerConnect={{
          dAppInfo: {
            name: "Vista App",
            url: window.location.origin,
          },
          announce: [
            "wss://dev.btt.cf-identity-wallet.metadata.dev.cf-deployments.org",
          ],
        }}
      />
    </div>
  );
}
