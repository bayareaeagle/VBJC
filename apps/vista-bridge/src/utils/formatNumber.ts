/**
 * Formats a number with appropriate suffixes (K, M, B, T)
 * @param num - The number to format
 * @param decimals - Number of decimal places to show (default: 2)
 * @param isLovelace - If true, divides by 1,000,000 before formatting (default: false)
 * @returns Formatted string (e.g., "140.67M", "1.23K", "5.45B")
 */
export const formatNumber = (num: number | string, decimals: number = 2, isLovelace: boolean = false): string => {
  let number = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(number)) return '0';
  
  // Convert lovelace to ADA if needed
  if (isLovelace) {
    number = number / 1_000_000;
  }
  
  const absNumber = Math.abs(number);
  
  if (absNumber >= 1e12) {
    return (number / 1e12).toFixed(decimals) + 'T';
  } else if (absNumber >= 1e9) {
    return (number / 1e9).toFixed(decimals) + 'B';
  } else if (absNumber >= 1e6) {
    return (number / 1e6).toFixed(decimals) + 'M';
  } else if (absNumber >= 1e3) {
    return (number / 1e3).toFixed(decimals) + 'K';
  } else {
    return number.toFixed(decimals);
  }
};

/**
 * Formats a number with appropriate suffixes, removing trailing zeros
 * @param num - The number to format
 * @param decimals - Number of decimal places to show (default: 2)
 * @param isLovelace - If true, divides by 1,000,000 before formatting (default: false)
 * @returns Formatted string without trailing zeros (e.g., "140.67M", "1K", "5B")
 */
export const formatNumberClean = (num: number | string, decimals: number = 2, isLovelace: boolean = false): string => {
  const formatted = formatNumber(num, decimals, isLovelace);
  
  // Remove trailing zeros and decimal point if not needed
  return formatted.replace(/\.?0+([KMBT])$/, '$1');
};

/**
 * Formats a cryptocurrency price with appropriate decimal places
 * @param price - The price to format
 * @returns Formatted price string (e.g., "$1,234.56", "$0.1234")
 */
export const formatPrice = (price: number): string => {
  if (price >= 1) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    return `$${price.toFixed(6)}`;
  }
};

/**
 * Formats a percentage change with appropriate color indicator
 * @param change - The percentage change (can be positive or negative)
 * @returns Formatted percentage string with sign (e.g., "+5.67%", "-2.34%")
 */
export const formatPercentageChange = (change: number): string => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
};

/**
 * Formats market cap with appropriate suffixes
 * @param marketCap - The market cap value
 * @returns Formatted market cap string (e.g., "$1.23T", "$456.78B")
 */
export const formatMarketCap = (marketCap: number): string => {
  return `$${formatNumberClean(marketCap, 2)}`;
};

/**
 * Formats 24h volume with appropriate suffixes
 * @param volume - The 24h volume value
 * @returns Formatted volume string (e.g., "$1.23B", "$456.78M")
 */
export const formatVolume = (volume: number): string => {
  return `$${formatNumberClean(volume, 2)}`;
};
