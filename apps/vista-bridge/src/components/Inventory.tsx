import React from 'react';
import Panel from './Panel';
import { useWalletContext } from '../contexts/WalletContext';
import { formatNumberClean, formatPercentageChange, formatPrice } from '../utils/formatNumber';

interface InventoryProps {
  fromChain: string;
}

interface InventoryAsset {
  symbol: string;
  quantity?: string;
  unit?: string;
  image?: string;
  icon?: string;
  price?: number;
  priceChange24h?: number;
  chain?: string;
}

const Inventory: React.FC<InventoryProps> = ({ fromChain }) => {
  const { isConnected, assets, selectedAsset, setSelectedAsset } = useWalletContext();

  const selectAsset = (asset: InventoryAsset) => {
    if (selectedAsset && selectedAsset.symbol === asset.symbol) {
      setSelectedAsset(null);
      return;
    }
    setSelectedAsset(asset);
  };

  if (fromChain === 'bitcoin') {
    return (
      <Panel className="w-full" title="Inventory">
        <div className="bg-[#141414] rounded-lg p-4">
          <div className="text-white font-semibold text-lg mb-1">BTC</div>
          <div className="text-gray-300 text-sm">
            Bitcoin bridges use your BTC source address from the Bridge Assets panel.
          </div>
        </div>
      </Panel>
    );
  }

  if (fromChain === 'ethereum') {
    return (
      <Panel className="w-full" title="Inventory">
        <div className="text-center py-8">
          <p className="text-lg font-medium text-white mb-2">EVM Inventory</p>
          <p className="text-gray-400">
            Connect MetaMask in Bridge Assets to load ETH/ERC20 balances and select the token there.
          </p>
        </div>
      </Panel>
    );
  }

  if (!fromChain || fromChain === 'cardano') {
    if (!isConnected) {
      return (
        <Panel className="w-full" title="Inventory">
          <div className="text-center py-8">
            <p className="text-lg font-medium text-white mb-2">Wallet Not Connected</p>
            <p className="text-gray-400">Connect your Cardano wallet to load token inventory.</p>
          </div>
        </Panel>
      );
    }

    const filteredAssets = (assets as InventoryAsset[] | null)?.filter((asset) => asset.chain?.toLowerCase() === 'cardano') ?? [];

    return (
      <Panel className="w-full" title="Inventory">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 justify-between">
          {filteredAssets.length > 0 ? (
            filteredAssets.map((asset, index) => {
              const isSelected = selectedAsset && selectedAsset.symbol === asset.symbol;
              return (
                <div
                  key={index}
                  className={`bg-[#141414] w-full rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-[#1a1a1a] ${
                    isSelected ? 'ring-2 ring-blue-500 bg-[#1a1a1a]' : ''
                  }`}
                  onClick={() => selectAsset(asset)}
                >
                  <div className="flex items-center justify-center mb-3">
                    {asset.image ? (
                      <img
                        src={asset.image}
                        alt={asset.symbol}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div className={`text-2xl ${asset.image ? 'hidden' : 'block'}`} style={{ display: asset.image ? 'none' : 'block' }}>
                      {asset.icon}
                    </div>
                  </div>
                  <div className="crypto-symbol font-bold text-lg mb-1 text-center">{asset.symbol}</div>
                  <div className="crypto-amount text-xs text-gray-300 mb-1 text-center">
                    {asset.quantity ? formatNumberClean(asset.quantity, 2, asset.unit === 'lovelace') : null}
                  </div>
                  {asset.price && (
                    <div className="text-xs text-center mb-1">
                      <div className="text-white font-semibold">{formatPrice(asset.price)}</div>
                      {asset.priceChange24h !== undefined && (
                        <div className={`${asset.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentageChange(asset.priceChange24h)}
                        </div>
                      )}
                    </div>
                  )}
                  {isSelected && (
                    <div className="flex justify-center mt-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 col-span-full">
              <p className="text-lg font-medium text-white mb-2">No Cardano assets found</p>
              <p className="text-gray-400">Try refreshing your wallet in the extension and reconnecting.</p>
            </div>
          )}
        </div>
      </Panel>
    );
  }

  return (
    <Panel className="w-full" title="Inventory">
      <div className="text-center py-8">
        <p className="text-lg font-medium text-white mb-2">Unsupported source chain</p>
      </div>
    </Panel>
  );
};

export default Inventory;
