// CoinGecko API service for cryptocurrency price data
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export interface CoinGeckoPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: any;
  last_updated: string;
}

export interface CoinGeckoSimplePrice {
  [coinId: string]: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_market_cap: number;
  };
}

// Helper function to make requests to CoinGecko API
const fetchCoinGecko = async (endpoint: string): Promise<Response> => {
  const response = await fetch(`${COINGECKO_API_BASE}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }

  return response;
};

// Get detailed price data for specific coins
export const getCoinPrices = async (coinIds: string[]): Promise<CoinGeckoPrice[]> => {
  try {
    const ids = coinIds.join(',');
    const response = await fetchCoinGecko(
      `/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Get simple price data for specific coins
export const getSimplePrices = async (coinIds: string[]): Promise<CoinGeckoSimplePrice> => {
  try {
    const ids = coinIds.join(',');
    const response = await fetchCoinGecko(
      `/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Get ADA and BTC specific data
export const getADABTCData = async (): Promise<CoinGeckoPrice[]> => {
  try {
    return await getCoinPrices(['cardano', 'bitcoin']);
  } catch (error) {
    throw error;
  }
};

// Convert CoinGecko data to our CryptoAsset format
export const convertCoinGeckoToCryptoAsset = (coinGeckoData: CoinGeckoPrice): {
  symbol: string;
  amount?: string;
  icon: string;
  image: string;
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
  chain?: string;
} => {
  // Map CoinGecko symbols to display names
  const getDisplaySymbol = (coinGeckoSymbol: string): string => {
    switch (coinGeckoSymbol.toLowerCase()) {
      case 'ada':
        return 'Cardano';
      case 'btc':
        return 'Bitcoin';
      default:
        return coinGeckoSymbol.toUpperCase();
    }
  };

  const symbol = getDisplaySymbol(coinGeckoData.symbol);
  
  // Map symbols to appropriate icons
  const getIcon = (coinGeckoSymbol: string): string => {
    switch (coinGeckoSymbol.toLowerCase()) {
      case 'ada':
        return '₳';
      case 'btc':
        return '₿';
      default:
        return '🪙';
    }
  };

  // Determine chain based on the coin
  const getChain = (coinGeckoSymbol: string): string => {
    switch (coinGeckoSymbol.toLowerCase()) {
      case 'ada':
        return 'cardano';
      case 'btc':
        return 'bitcoin';
      default:
        return 'unknown';
    }
  };

  return {
    symbol,
    amount: undefined, // CoinGecko doesn't provide wallet amounts
    icon: getIcon(coinGeckoData.symbol), // Keep emoji as fallback
    image: coinGeckoData.image, // Use CoinGecko's actual image URL
    price: coinGeckoData.current_price,
    priceChange24h: coinGeckoData.price_change_percentage_24h,
    marketCap: coinGeckoData.market_cap,
    volume24h: coinGeckoData.total_volume,
    chain: getChain(coinGeckoData.symbol),
  };
};

// Get trending coins (optional feature)
export const getTrendingCoins = async (): Promise<any[]> => {
  try {
    const response = await fetchCoinGecko('/search/trending');
    const data = await response.json();
    return data.coins || [];
  } catch (error) {
    throw error;
  }
};

// Get global market data
export const getGlobalMarketData = async (): Promise<any> => {
  try {
    const response = await fetchCoinGecko('/global');
    return await response.json();
  } catch (error) {
    throw error;
  }
};
