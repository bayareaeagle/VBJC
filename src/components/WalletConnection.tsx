import { CardanoWallet } from '@meshsdk/react';

interface WalletConnectionProps {
  onConnected?: () => void;
  isDark?: boolean;
}

export default function WalletConnection({ onConnected, isDark = false }: WalletConnectionProps) {
  const handleWalletConnected = () => {
    console.log('Wallet connected successfully!');
    if (onConnected) {
      onConnected();
    }
  };

  return (
    <div className="wallet-connection">
      <CardanoWallet
        label="Connect Wallet"
        persist={true}
        onConnected={handleWalletConnected}
        isDark={isDark}
      />
    </div>
  );
}
