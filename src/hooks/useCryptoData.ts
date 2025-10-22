import { useState, useEffect } from 'react';
import { getAssetsByAddresses, convertBlockfrostToCryptoAsset } from '../services/blockfrost';
import { assetsList } from '../utils/assets';

export interface CryptoAsset {
  symbol: string;
  amount?: string;
  icon: string;
  image: string;
}

interface UseCryptoDataReturn {
  cryptoAssets: CryptoAsset[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Default fallback icon for assets without logos
const DEFAULT_ICON = '🪙';

export const useCryptoData = (): UseCryptoDataReturn => {
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoinData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get asset addresses from assets.ts
      const assetAddresses = assetsList.map(asset => asset.address);
      
      // Fetch details for these specific assets
      const assetDetails = await getAssetsByAddresses(assetAddresses);
      
      // Convert Blockfrost assets to our CryptoAsset format
      const convertedAssets = assetDetails.map(asset => {
        const converted = convertBlockfrostToCryptoAsset(asset, DEFAULT_ICON);
        return converted;
      });
      
      setCryptoAssets(convertedAssets);
    } catch (err) {
      console.error('Error fetching Cardano assets:', err);
      setError('Failed to fetch Cardano assets. Please check your Blockfrost API key.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCoinData();
  }, []);

  const refetch = () => {
    fetchCoinData();
  };

  return {
    cryptoAssets,
    loading,
    error,
    refetch
  };
};