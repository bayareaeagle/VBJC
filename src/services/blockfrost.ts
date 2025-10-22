// Blockfrost API service for Cardano blockchain data
const BLOCKFROST_API_BASE = 'https://cardano-mainnet.blockfrost.io/api/v0';

// You'll need to get a project_id from https://blockfrost.io
const PROJECT_ID = import.meta.env.VITE_BLOCKFROST_PROJECT_ID || '';

export interface BlockfrostAsset {
  unit: string;
  quantity: string;
  fingerprint: string;
  policy_id: string;
  asset_name: string;
  name?: string;
  description?: string;
  ticker?: string;
  url?: string;
  logo?: string;
  decimals?: number;
}

export interface BlockfrostAssetMetadata {
  name?: string;
  description?: string;
  ticker?: string;
  url?: string;
  logo?: string;
  decimals?: number;
}

export interface BlockfrostAssetInfo {
  unit: string;
  fingerprint: string;
  policy_id: string;
  asset_name: string;
  quantity: string;
  initial_mint_tx_hash: string;
  mint_or_burn_count: number;
  onchain_metadata?: any;
  metadata?: BlockfrostAssetMetadata;
}

// Helper function to make authenticated requests to Blockfrost
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  if (!PROJECT_ID) {
    throw new Error('Blockfrost PROJECT_ID is required. Please set VITE_BLOCKFROST_PROJECT_ID in your environment variables.');
  }

  const response = await fetch(`${BLOCKFROST_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'project_id': PROJECT_ID,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Invalid Blockfrost project token. Please check your VITE_BLOCKFROST_PROJECT_ID.');
    }
    if (response.status === 402) {
      throw new Error('Blockfrost daily request limit exceeded.');
    }
    if (response.status === 429) {
      throw new Error('Blockfrost rate limit exceeded. Please try again later.');
    }
    throw new Error(`Blockfrost API error: ${response.status} ${response.statusText}`);
  }

  return response;
};

// Get asset information by unit (policy_id + asset_name)
export const getAssetInfo = async (unit: string): Promise<BlockfrostAssetInfo> => {
  try {
    const response = await fetchWithAuth(`/assets/${unit}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching asset info:', error);
    throw error;
  }
};

// Get asset metadata by unit
export const getAssetMetadata = async (unit: string): Promise<BlockfrostAssetMetadata> => {
  try {
    const response = await fetchWithAuth(`/assets/${unit}`);
    const assetInfo = await response.json();
    return assetInfo.metadata || {};
  } catch (error) {
    console.error('Error fetching asset metadata:', error);
    return {};
  }
};

// Get all assets (with pagination)
export const getAllAssets = async (): Promise<BlockfrostAsset[]> => {
  try {
    const response = await fetchWithAuth(`/assets`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching all assets:', error);
    throw error;
  }
};

// Get top 9 Cardano assets by quantity (most popular)
export const getTopAssets = async (count: number = 9): Promise<BlockfrostAsset[]> => {
  try {
    // Fetch more assets to ensure we get a good selection
    const response = await fetchWithAuth(`/assets?page=1&count=100`);
    const assets = await response.json();
    
    // Sort by quantity (descending) and take the top N
    const sortedAssets = assets
      .filter((a: any) => a.asset) // Filter out assets without asset property
      .map((a: any) => ({ ...a, unit: a.asset })) // Map asset to unit for compatibility
      .sort((a: BlockfrostAsset, b: BlockfrostAsset) => {
        const quantityA = BigInt(a.quantity || '0');
        const quantityB = BigInt(b.quantity || '0');
        return quantityA > quantityB ? -1 : quantityA < quantityB ? 1 : 0;
      })
      .slice(0, count);
    
    return sortedAssets;
  } catch (error) {
    console.error('Error fetching top assets:', error);
    throw error;
  }
};

// Get detailed asset information including name and logo
export const getAssetDetails = async (unit: string): Promise<BlockfrostAssetInfo> => {
  try {
    // Validate unit format - should be a valid hex string
    if (!unit || typeof unit !== 'string' || !/^[0-9a-fA-F]+$/.test(unit)) {
      throw new Error(`Invalid asset unit format: ${unit}`);
    }
    
    const response = await fetchWithAuth(`/assets/${unit}`);
    const data = await response.json();
    console.log('Asset details response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching asset details:', error);
    throw error;
  }
};

// Get top 9 assets with their detailed information (name and logo)
export const getTopAssetsWithDetails = async (count: number = 9): Promise<BlockfrostAssetInfo[]> => {
  try {
    // First get the top assets
    const topAssets = await getTopAssets(count);
    
    // Then get detailed information for each asset using individual requests
    const detailedAssets: BlockfrostAssetInfo[] = [];
    
    for (const asset of topAssets) {
      try {
        // Make individual request to /assets/{asset} endpoint for each asset
        const details = await getAssetDetails(asset.unit);
        detailedAssets.push(details);
      } catch (error) {
        console.warn(`Failed to fetch details for asset ${asset.unit}:`, error);
        // Skip this asset and continue with the next one
        continue;
      }
    }
    
    return detailedAssets;
  } catch (error) {
    console.error('Error fetching top assets with details:', error);
    throw error;
  }
};

// Search for assets by name or ticker
export const searchAssets = async (): Promise<BlockfrostAsset[]> => {
  try {
    // Blockfrost doesn't have a direct search endpoint, so we'll fetch all assets and filter
    const allAssets = await getAllAssets();
    return allAssets;
  } catch (error) {
    console.error('Error searching assets:', error);
    throw error;
  }
};

// Get specific assets by their units
export const getAssetsByUnits = async (units: string[]): Promise<BlockfrostAssetInfo[]> => {
  try {
    const promises = units.map(unit => getAssetInfo(unit));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error fetching assets by units:', error);
    throw error;
  }
};

// Get specific assets by their addresses (same as units but with better naming)
export const getAssetsByAddresses = async (addresses: string[]): Promise<BlockfrostAssetInfo[]> => {
  try {
    const promises = addresses.map(address => getAssetDetails(address));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error fetching assets by addresses:', error);
    throw error;
  }
};

// Helper function to convert Blockfrost asset to our CryptoAsset format
export const convertBlockfrostToCryptoAsset = (blockfrostAsset: BlockfrostAssetInfo, emojiIcon: string): {
  symbol: string;
  amount?: string;
  icon: string;
  image: string;
  } => {
  const symbol = blockfrostAsset.metadata?.ticker || blockfrostAsset.asset_name || blockfrostAsset.unit.slice(0, 8);
  // Handle base64 logo data - convert to data URL if it's base64
  let image = '';
  if (blockfrostAsset.metadata?.logo) {
    const logo = blockfrostAsset.metadata.logo;
    // Check if it's base64 data (starts with data: or is a long base64 string)
    if (logo.startsWith('data:')) {
      image = logo;
    } else if (logo.length > 100 && /^[A-Za-z0-9+/=]+$/.test(logo)) {
      // It's likely base64 data, create a data URL
      image = `data:image/png;base64,${logo}`;
    } else {
      // It's a regular URL
      image = logo;
    }
  }
  
  return {
    symbol,
    amount: blockfrostAsset.quantity,
    icon: emojiIcon,
    image: image,
  };
};
