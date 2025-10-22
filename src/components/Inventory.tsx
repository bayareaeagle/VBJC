import React from 'react';
import Panel from './Panel';
import { useCryptoData } from '../hooks/useCryptoData';

const Inventory: React.FC = () => {
  const { cryptoAssets } = useCryptoData();

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) {
      return 'N/A';
    }
  
    const absPrice = Math.abs(price);
  
    if (absPrice < 0.01) return `$${price.toFixed(6)}`;
    if (absPrice < 1) return `$${price.toFixed(4)}`;
  
    // Use human-friendly suffixes
    if (absPrice >= 1_000_000_000_000) {
      return `${(price / 1_000_000_000_000).toFixed(2)}T`;
    }
    if (absPrice >= 1_000_000_000) {
      return `${(price / 1_000_000_000).toFixed(2)}B`;
    }
    if (absPrice >= 1_000_000) {
      return `${(price / 1_000_000).toFixed(2)}M`;
    }
  
    // Default with commas
    return `${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <Panel className="w-full" title="Inventory">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 justify-between">
        {cryptoAssets.map((asset, index) => (
          <div key={index} className="bg-[#141414] w-full  rounded-lg p-4">
            <div className="flex items-center justify-center mb-3">
              {asset.image ? (
                <img 
                  src={asset.image} 
                  alt={asset.symbol}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    // Fallback to emoji icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
              ) : null}
              <div 
                className={`text-2xl ${asset.image ? 'hidden' : 'block'}`}
                style={{ display: asset.image ? 'none' : 'block' }}
              >
                {asset.icon}
              </div>
            </div>
            <div className="crypto-symbol font-bold text-lg mb-1 text-center">{asset.symbol}</div>
            <div className="crypto-amount text-xs text-gray-300 mb-1 text-center">{formatPrice(asset.amount ? parseFloat(asset.amount) : null)}</div>
            </div>
        ))}
      </div>
    </Panel>
  );
};

export default Inventory;
