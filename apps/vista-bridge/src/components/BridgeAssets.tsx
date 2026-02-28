import React, { useState, useEffect } from 'react';
import Panel from './Panel';
import { useCryptoData, type CryptoAsset } from '../hooks/useCryptoData';
import { useWalletContext } from '../contexts/WalletContext';
import { formatNumberClean } from '../utils/formatNumber';



interface BridgeAssetsProps {
  onFromChainChange: (chain: string) => void;
}

const BridgeAssets: React.FC<BridgeAssetsProps> = ({ onFromChainChange }) => {
  const { cryptoAssets } = useCryptoData();
  const { assets: walletAssets, isConnected, selectedAsset, setSelectedAsset } = useWalletContext();
  const [selectedPercentage, setSelectedPercentage] = useState('25%');
  const [, setSendAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [receiveAmount] = useState('162030');
  const [fromCrypto, setFromCrypto] = useState<CryptoAsset | null>(null);
  const [toCrypto, setToCrypto] = useState<CryptoAsset | null>(null);
  const [selectedWalletAsset, setSelectedWalletAsset] = useState<any | null>(null);

  const percentageButtons = ['10%', '25%', '50%', '75%', 'MAX'];

  // Helper function to format number with commas
  const formatWithCommas = (value: string): string => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    
    // Split by decimal point
    const parts = numericValue.split('.');
    
    // Add commas to the integer part
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    // Join back with decimal point if there was one
    return parts.join('.');
  };

  // Helper function to remove commas for calculations
  const removeCommas = (value: string): string => {
    return value.replace(/,/g, '');
  };

  // Handle input change with comma formatting
  const handleAmountChange = (value: string) => {
    const numericValue = removeCommas(value);
    setSendAmount(numericValue);
    setDisplayAmount(formatWithCommas(value));
  };

  // Set initial crypto values when assets are loaded
  useEffect(() => {
    if (cryptoAssets.length >= 2 && !fromCrypto && !toCrypto) {
      setFromCrypto(cryptoAssets[0]);
      setToCrypto(cryptoAssets[1]);
    }
  }, [cryptoAssets, fromCrypto, toCrypto]);

  // Update fromChain when fromCrypto changes
  useEffect(() => {
    if (fromCrypto?.chain) {
      onFromChainChange(fromCrypto.chain);
    }
  }, [fromCrypto, onFromChainChange]);

  // Set initial wallet asset when wallet assets are loaded
  useEffect(() => {
    if (walletAssets && walletAssets.length > 0 && !selectedWalletAsset) {
      setSelectedWalletAsset(walletAssets[0]);
    }
  }, [walletAssets, selectedWalletAsset]);

  // Update selectedWalletAsset when selectedAsset from context changes
  useEffect(() => {
    if (selectedAsset) {
      setSelectedWalletAsset(selectedAsset);
    }
  }, [selectedAsset]);

  // Helper function to render crypto icon with fallback
  const renderCryptoIcon = (crypto: CryptoAsset | null, size: string = 'w-6 h-6') => {
    if (!crypto) return null;

    const iconUrl = crypto.image;

    if (iconUrl) {
      return (
        <>
          <img
            src={iconUrl}
            alt={crypto.symbol}
            className={`${size} rounded-full object-cover`}
            onError={(e) => {
              // Fallback to emoji icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <div
            className={`${size} items-center justify-center text-lg hidden`}
            style={{ display: 'none' }}
          >
            {crypto.icon}
          </div>
        </>
      );
    }

    return (
      <div className={`${size} flex items-center justify-center text-lg`}>
        {crypto.icon}
      </div>
    );
  };

  // Helper function to render wallet asset icon with fallback
  const renderWalletAssetIcon = (asset: any | null, size: string = 'w-6 h-6') => {
    if (!asset) return null;

    if (asset.image) {
      return (
        <>
          <img
            src={asset.image}
            alt={asset.symbol}
            className={`${size} rounded-full object-cover`}
            onError={(e) => {
              // Fallback to emoji icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <div
            className={`${size} items-center justify-center text-lg hidden`}
            style={{ display: 'none' }}
          >
            {asset.icon}
          </div>
        </>
      );
    }

    return (
      <div className={`${size} flex items-center justify-center text-lg`}>
        {asset.icon}
      </div>
    );
  };

  // Helper function to get available cryptos for selection
  const getAvailableCryptos = (excludeCrypto: CryptoAsset | null) => {
    if (!excludeCrypto) return cryptoAssets;
    return cryptoAssets.filter(crypto => crypto.symbol !== excludeCrypto.symbol);
  };

  // Handle from crypto selection
  const handleFromCryptoChange = (selectedCrypto: CryptoAsset) => {
    setFromCrypto(selectedCrypto);
    // If the selected crypto is the same as toCrypto, switch toCrypto to a different one
    if (selectedCrypto.symbol === toCrypto?.symbol) {
      const availableCryptos = getAvailableCryptos(selectedCrypto);
      if (availableCryptos.length > 0) {
        setToCrypto(availableCryptos[0]);
      }
    }
  };

  // Handle to crypto selection
  const handleToCryptoChange = (selectedCrypto: CryptoAsset) => {
    setToCrypto(selectedCrypto);
    // If the selected crypto is the same as fromCrypto, switch fromCrypto to a different one
    if (selectedCrypto.symbol === fromCrypto?.symbol) {
      const availableCryptos = getAvailableCryptos(selectedCrypto);
      if (availableCryptos.length > 0) {
        setFromCrypto(availableCryptos[0]);
      }
    }
  };

  // Handle swap between from and to cryptos
  const handleSwap = () => {
    if (fromCrypto && toCrypto) {
      setFromCrypto(toCrypto);
      setToCrypto(fromCrypto);
    }
  };


  return (
    <Panel title="Bridge Assets" className=''>

      <div className="bridge-form  min-h-[400px] flex flex-col justify-evenly items-center flex-1">
        {/* From/To Selectors */}
        <div className="flex justify-between items-center w-full  gap-4">
          <div className="w-1/2 flex justify-evenly  items-center gap-4  bg-[#1c1c1c] p-3 rounded-lg">
            <div className="pointer-events-none">
              {renderCryptoIcon(fromCrypto, 'w-[30px] h-[30px]')}
            </div>
            <div className="w-[80%]">
              <div className="text-[#a1a1a1] text-sm">From</div>
              <select
                className=" w-full rounded-lg font-bold text-white border border-none focus:outline-none appearance-none cursor-pointer"
                value={fromCrypto?.symbol || ''}
                onChange={(e) => {
                  const selectedCrypto = cryptoAssets.find(crypto => crypto.symbol === e.target.value);
                  if (selectedCrypto) handleFromCryptoChange(selectedCrypto);
                }}
              >
                {getAvailableCryptos(toCrypto).map((crypto) => (
                  <option key={crypto.symbol} value={crypto.symbol}>
                    {crypto.symbol} 
                  </option>
                ))}
              </select>

            </div>
          </div>
          <button
            onClick={handleSwap}
            className="flex justify-center items-center h-full font-bold text-2xl text-white hover:text-blue-400 transition-colors duration-200 p-2 rounded-lg hover:bg-[#2a2a2a] cursor-pointer"
            title="Swap positions"
          >
            ⇄
          </button>
          <div className="w-1/2 flex justify-evenly  items-center gap-4  bg-[#1c1c1c] p-3 rounded-lg">
            <div className="pointer-events-none">
              {renderCryptoIcon(toCrypto, 'w-[30px] h-[30px]')}
            </div>
            <div className="w-[80%]">
              <div className="text-[#a1a1a1] text-sm">To</div>
              <select
                className="w-full rounded-lg font-bold text-white border border-none focus:outline-none appearance-none cursor-pointer"
                value={toCrypto?.symbol || ''}
                onChange={(e) => {
                  const selectedCrypto = cryptoAssets.find(crypto => crypto.symbol === e.target.value);
                  if (selectedCrypto) handleToCryptoChange(selectedCrypto);
                }}
              >
                {getAvailableCryptos(fromCrypto).map((crypto) => (
                  <option key={crypto.symbol} value={crypto.symbol}>
                    {crypto.symbol} 
                  </option>
                ))}
              </select>

            </div>
          </div>
        </div>

      

        {/* Send Amount */}
        <div className="w-full mt-6 flex items-center justify-between gap-4  bg-[#1c1c1c] p-4 rounded-lg">
          <div>
            <div className="text-[#A1A1A1]">Send</div>
            <input
              type="text"
              value={displayAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="text-white font-bold text-3xl bg-transparent border-none outline-none w-full"
              placeholder="0"
              inputMode="numeric"
            />
            <div className="text-[#A1A1A1] text-sm">
              {selectedWalletAsset ? `Balance: ${selectedWalletAsset.quantity ? formatNumberClean(selectedWalletAsset.quantity, 2, selectedWalletAsset.unit === 'lovelace') : '0'}` : 'No asset selected'}

            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <div className="pointer-events-none">
              {renderWalletAssetIcon(selectedWalletAsset, 'w-[30px] h-[30px]')}
            </div>
            <div className="flex flex-col">
              <select
                className="text-white font-bold text-xl bg-transparent border-none outline-none cursor-pointer"
                value={selectedWalletAsset?.symbol || ''}
                onChange={(e) => {
                  const selectedAsset = walletAssets?.find(asset => asset.symbol === e.target.value);
                  if (selectedAsset) {
                    setSelectedWalletAsset(selectedAsset);
                    setSelectedAsset(selectedAsset);
                  }
                }}
                disabled={!isConnected || !walletAssets || walletAssets.length === 0}
              >
                {walletAssets?.map((asset) => (
                  <option key={asset.symbol} value={asset.symbol} className="bg-[#1c1c1c] text-white">
                    {asset.symbol}
                  </option>
                )) || []}
              </select>
              {!isConnected && (
                <div className="text-[#A1A1A1] text-xs">Connect wallet</div>
              )}
            </div>
          </div>
        </div>

        {/* Percentage Buttons */}
        <div className="mt-5 w-full  flex lg:justify-between  flex-wrap gap-2">
          {percentageButtons.map((percentage) => (
            <button
              key={percentage}
              className={` bg-[#1c1c1c] text-[#A1A1A1] px-7  py-2 rounded-full ${selectedPercentage === percentage ? ' bg-[#282727] ' : ''}`}
              onClick={() => {
                setSelectedPercentage(percentage);
                let amount: string;
                if (percentage === 'MAX') {
                  amount = String(selectedWalletAsset?.quantity || 0);
                } else {
                  const percentageValue = parseFloat(percentage.replace('%', '')) / 100;
                  amount = String((selectedWalletAsset?.quantity || 0) * percentageValue);
                }
                setSendAmount(amount);
                setDisplayAmount(formatWithCommas(amount));
              }}
            >
              {percentage}
            </button>
          ))}
        </div>

        {/* Receive Amount */}
        <div className="w-full flex items-center justify-between gap-4 px-3 my-[20px] border border-[#1c1c1c] p-3 rounded-full">

          <div className="font-bold text-[#A1A1A1] text-sm">Receive:</div>
          <div>

            <div className="receive-amount">{receiveAmount}</div>
            <div className=" text-[#A1A1A1] text-sm">$0.0015664</div>
          </div>

        </div>

      </div>

    </Panel>
  );
};

export default BridgeAssets;
