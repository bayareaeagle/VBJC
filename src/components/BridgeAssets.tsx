import React, { useState, useEffect } from 'react';
import Panel from './Panel';
import { useCryptoData, type CryptoAsset } from '../hooks/useCryptoData';



const BridgeAssets: React.FC = () => {
  const { cryptoAssets } = useCryptoData();
  const [selectedPercentage, setSelectedPercentage] = useState('25%');
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount] = useState('162030');
  const [fromCrypto, setFromCrypto] = useState<CryptoAsset | null>(null);
  const [toCrypto, setToCrypto] = useState<CryptoAsset | null>(null);

  const percentageButtons = ['10%', '25%', '50%', '75%', 'MAX'];

  // Set initial crypto values when assets are loaded
  useEffect(() => {
    if (cryptoAssets.length >= 2 && !fromCrypto && !toCrypto) {
      setFromCrypto(cryptoAssets[0]);
      setToCrypto(cryptoAssets[1]);
    }
  }, [cryptoAssets, fromCrypto, toCrypto]);

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


  return (
    <Panel title="Bridge Assets">
      <div className="bridge-form">
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
          <div className="flex justify-center items-center h-full  font-bold text-2xl">→</div>
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
              type="number"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              className="text-white font-bold text-3xl bg-transparent border-none outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
              min="0"
              step="any"
              inputMode="numeric"
            />
            <div className="text-[#A1A1A1] text-sm">{sendAmount}</div>
          </div>
          <div className="relative flex items-center gap-2">
            <div className="pointer-events-none ">
              {renderCryptoIcon(toCrypto, 'w-[30px] h-[30px]')}
            </div>
            <div className="text-white font-bold text-xl">
              {toCrypto?.symbol}
            </div>
            {/* <select
              className="rounded-lg font-bold text-white border border-none focus:outline-none appearance-none cursor-pointer"
              value={toCrypto?.symbol || ''}
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
            </select> */}

          </div>
        </div>

        {/* Percentage Buttons */}
        <div className="mt-5 w-full flex justify-evenly items-center">
          {percentageButtons.map((percentage) => (
            <button
              key={percentage}
              className={` bg-[#1c1c1c] text-[#A1A1A1] px-7  py-2 rounded-full ${selectedPercentage === percentage ? ' bg-[#282727] ' : ''}`}
              onClick={() => setSelectedPercentage(percentage)}
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
