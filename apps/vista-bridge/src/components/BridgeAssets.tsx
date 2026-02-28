import React, { useEffect, useMemo, useState } from 'react';
import Panel from './Panel';
import { useWalletContext } from '../contexts/WalletContext';
import { formatNumberClean } from '../utils/formatNumber';

type BridgeChain = 'bitcoin' | 'ethereum' | 'cardano';

interface BridgeAssetsProps {
  onFromChainChange: (chain: string) => void;
}

interface EvmAsset {
  symbol: string;
  balanceRaw: string;
  balanceDisplay: string;
  decimals: number;
  tokenAddress?: string;
}

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const CHAIN_LABELS: Record<BridgeChain, string> = {
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  cardano: 'Cardano',
};

const CHAIN_OPTIONS: BridgeChain[] = ['bitcoin', 'ethereum', 'cardano'];
const PERCENTAGE_BUTTONS = ['25%', '50%', '75%', 'MAX'];

const KNOWN_ERC20S = [
  { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
  { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
];

const ETH_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const CARDANO_ADDRESS_PATTERN = /^(addr1|addr_test1)[a-zA-Z0-9]+$/;
const BTC_ADDRESS_PATTERN = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;

const toHexBalanceData = (account: string) => {
  const sanitized = account.toLowerCase().replace(/^0x/, '');
  return `0x70a08231${sanitized.padStart(64, '0')}`;
};

const formatBigIntBalance = (raw: bigint, decimals: number, maxFractionDigits = 6): string => {
  if (raw <= 0n) return '0';
  if (decimals <= 0) return raw.toString();

  const divisor = 10n ** BigInt(decimals);
  const integerPart = raw / divisor;
  const fractionPart = (raw % divisor).toString().padStart(decimals, '0');
  const trimmedFraction = fractionPart.slice(0, maxFractionDigits).replace(/0+$/, '');

  return trimmedFraction ? `${integerPart.toString()}.${trimmedFraction}` : integerPart.toString();
};

const parseBigIntHex = (value: unknown): bigint => {
  if (typeof value !== 'string' || value.length === 0) return 0n;
  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
};

const validateAddressByChain = (address: string, chain: BridgeChain): boolean => {
  const trimmed = address.trim();
  if (!trimmed) return false;

  if (chain === 'ethereum') return ETH_ADDRESS_PATTERN.test(trimmed);
  if (chain === 'cardano') return CARDANO_ADDRESS_PATTERN.test(trimmed);
  return BTC_ADDRESS_PATTERN.test(trimmed);
};

const BridgeAssets: React.FC<BridgeAssetsProps> = ({ onFromChainChange }) => {
  const { assets: cardanoAssets, isConnected, walletAddress, selectedAsset, setSelectedAsset } = useWalletContext();

  const [sourceChain, setSourceChain] = useState<BridgeChain>('bitcoin');
  const [destinationChain, setDestinationChain] = useState<BridgeChain>('cardano');
  const [sourceAmount, setSourceAmount] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [btcSourceAddress, setBtcSourceAddress] = useState('');
  const [bridgeNotice, setBridgeNotice] = useState<string | null>(null);

  const [isConnectingEvm, setIsConnectingEvm] = useState(false);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [evmAssets, setEvmAssets] = useState<EvmAsset[]>([]);
  const [selectedEvmAssetSymbol, setSelectedEvmAssetSymbol] = useState('');
  const [evmError, setEvmError] = useState<string | null>(null);

  useEffect(() => {
    onFromChainChange(sourceChain);
  }, [sourceChain, onFromChainChange]);

  useEffect(() => {
    if (destinationChain === sourceChain) {
      const fallback = CHAIN_OPTIONS.find((chain) => chain !== sourceChain);
      if (fallback) setDestinationChain(fallback);
    }
  }, [sourceChain, destinationChain]);

  useEffect(() => {
    if (sourceChain === 'cardano' && isConnected && cardanoAssets && cardanoAssets.length > 0 && !selectedAsset) {
      setSelectedAsset(cardanoAssets[0]);
    }
  }, [sourceChain, isConnected, cardanoAssets, selectedAsset, setSelectedAsset]);

  useEffect(() => {
    if (sourceChain !== 'ethereum') return;
    if (!evmAddress || evmAssets.length === 0) return;
    if (!selectedEvmAssetSymbol) {
      setSelectedEvmAssetSymbol(evmAssets[0].symbol);
    }
  }, [sourceChain, evmAddress, evmAssets, selectedEvmAssetSymbol]);

  useEffect(() => {
    if (!window.ethereum?.on) return;

    const onAccountsChanged = (accounts: unknown) => {
      const next = Array.isArray(accounts) ? (accounts[0] as string | undefined) : undefined;
      if (!next) {
        setEvmAddress(null);
        setEvmAssets([]);
        setSelectedEvmAssetSymbol('');
        return;
      }
      setEvmAddress(next);
    };

    window.ethereum.on('accountsChanged', onAccountsChanged);
    return () => {
      window.ethereum?.removeListener?.('accountsChanged', onAccountsChanged);
    };
  }, []);

  const selectedEvmAsset = useMemo(
    () => evmAssets.find((asset) => asset.symbol === selectedEvmAssetSymbol) ?? null,
    [evmAssets, selectedEvmAssetSymbol]
  );

  const sourceBalance = useMemo(() => {
    if (sourceChain === 'bitcoin') return null;

    if (sourceChain === 'ethereum') {
      if (!selectedEvmAsset) return null;
      return Number(selectedEvmAsset.balanceDisplay) || 0;
    }

    if (!selectedAsset?.quantity) return null;
    const raw = Number(selectedAsset.quantity);
    if (!Number.isFinite(raw)) return null;

    if (selectedAsset.unit === 'lovelace') return raw / 1_000_000;
    return raw;
  }, [sourceChain, selectedEvmAsset, selectedAsset]);

  const sourceReady = useMemo(() => {
    if (sourceChain === 'cardano') return isConnected && !!selectedAsset && !!walletAddress;
    if (sourceChain === 'ethereum') return !!evmAddress && !!selectedEvmAsset;
    return validateAddressByChain(btcSourceAddress, 'bitcoin');
  }, [sourceChain, isConnected, selectedAsset, walletAddress, evmAddress, selectedEvmAsset, btcSourceAddress]);

  const destinationReady = validateAddressByChain(destinationAddress, destinationChain);
  const hasAmount = Number(sourceAmount) > 0;
  const canSubmit = sourceReady && destinationReady && hasAmount;

  const sourceAssetLabel = useMemo(() => {
    if (sourceChain === 'bitcoin') return 'BTC';
    if (sourceChain === 'ethereum') return selectedEvmAsset?.symbol ?? 'Token';
    return selectedAsset?.symbol ?? 'Token';
  }, [sourceChain, selectedAsset, selectedEvmAsset]);

  const actionLabel = useMemo(() => {
    if (sourceChain === 'ethereum' && destinationChain === 'cardano') return 'Wrap and Send to Cardano';
    if (sourceChain === 'bitcoin') return 'Pay BTC and Bridge';
    return `Bridge to ${CHAIN_LABELS[destinationChain]}`;
  }, [sourceChain, destinationChain]);

  const destinationPlaceholder = useMemo(() => {
    if (destinationChain === 'cardano') return 'addr1...';
    if (destinationChain === 'ethereum') return '0x...';
    return 'bc1...';
  }, [destinationChain]);

  const fetchEthereumAssets = async (account: string): Promise<EvmAsset[]> => {
    if (!window.ethereum) return [];

    const provider = window.ethereum;
    const nativeHex = await provider.request({
      method: 'eth_getBalance',
      params: [account, 'latest'],
    });

    const nativeRaw = parseBigIntHex(nativeHex);
    const assets: EvmAsset[] = [
      {
        symbol: 'ETH',
        decimals: 18,
        balanceRaw: nativeRaw.toString(),
        balanceDisplay: formatBigIntBalance(nativeRaw, 18, 6),
      },
    ];

    for (const token of KNOWN_ERC20S) {
      try {
        const hexBalance = await provider.request({
          method: 'eth_call',
          params: [{ to: token.address, data: toHexBalanceData(account) }, 'latest'],
        });
        const tokenRaw = parseBigIntHex(hexBalance);
        if (tokenRaw > 0n) {
          assets.push({
            symbol: token.symbol,
            decimals: token.decimals,
            tokenAddress: token.address,
            balanceRaw: tokenRaw.toString(),
            balanceDisplay: formatBigIntBalance(tokenRaw, token.decimals, 6),
          });
        }
      } catch {
        // Skip unsupported token contract reads on the current network.
      }
    }

    return assets;
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      setEvmError('MetaMask not detected. Install MetaMask to bridge ERC20 assets.');
      return;
    }

    setIsConnectingEvm(true);
    setEvmError(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = Array.isArray(accounts) ? (accounts[0] as string | undefined) : undefined;

      if (!account) {
        throw new Error('No EVM account returned by wallet provider.');
      }

      setEvmAddress(account);
      const assets = await fetchEthereumAssets(account);
      setEvmAssets(assets);
      setSelectedEvmAssetSymbol(assets[0]?.symbol ?? '');
    } catch (error) {
      setEvmError(error instanceof Error ? error.message : 'Failed to connect MetaMask.');
    } finally {
      setIsConnectingEvm(false);
    }
  };

  const disconnectMetaMask = () => {
    setEvmAddress(null);
    setEvmAssets([]);
    setSelectedEvmAssetSymbol('');
  };

  const handleSwapChains = () => {
    const previousSource = sourceChain;
    setSourceChain(destinationChain);
    setDestinationChain(previousSource);
  };

  const handleSourceAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSourceAmount(value);
    }
  };

  const applyAmountPercentage = (percentage: string) => {
    if (!sourceBalance || sourceBalance <= 0) return;

    if (percentage === 'MAX') {
      setSourceAmount(sourceBalance.toString());
      return;
    }

    const ratio = Number(percentage.replace('%', '')) / 100;
    const next = sourceBalance * ratio;
    setSourceAmount(next.toFixed(6).replace(/\.?0+$/, ''));
  };

  const submitBridgeRequest = () => {
    if (!canSubmit) return;

    setBridgeNotice(
      `Prepared bridge request: ${sourceAmount} ${sourceAssetLabel} from ${CHAIN_LABELS[sourceChain]} to ${CHAIN_LABELS[destinationChain]}.`
    );
  };

  return (
    <Panel title="Bridge Assets">
      <div className="min-h-[400px] flex flex-col gap-5">
        <div className="flex justify-between items-center gap-4">
          <div className="w-1/2 bg-[#1c1c1c] p-3 rounded-lg">
            <div className="text-[#a1a1a1] text-sm mb-1">From Chain</div>
            <select
              className="w-full rounded-lg font-bold text-white bg-transparent border-none focus:outline-none appearance-none cursor-pointer"
              value={sourceChain}
              onChange={(e) => setSourceChain(e.target.value as BridgeChain)}
            >
              {CHAIN_OPTIONS.map((chain) => (
                <option key={chain} value={chain}>
                  {CHAIN_LABELS[chain]}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwapChains}
            className="font-bold text-xl text-white hover:text-blue-400 transition-colors duration-200 p-2 rounded-lg hover:bg-[#2a2a2a]"
            title="Swap route"
          >
            &lt;&gt;
          </button>

          <div className="w-1/2 bg-[#1c1c1c] p-3 rounded-lg">
            <div className="text-[#a1a1a1] text-sm mb-1">To Chain</div>
            <select
              className="w-full rounded-lg font-bold text-white bg-transparent border-none focus:outline-none appearance-none cursor-pointer"
              value={destinationChain}
              onChange={(e) => setDestinationChain(e.target.value as BridgeChain)}
            >
              {CHAIN_OPTIONS.filter((chain) => chain !== sourceChain).map((chain) => (
                <option key={chain} value={chain}>
                  {CHAIN_LABELS[chain]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-[#1c1c1c] p-4 rounded-lg">
          <div className="text-[#a1a1a1] text-sm mb-2">Source Wallet</div>

          {sourceChain === 'cardano' && (
            <div className="text-sm text-white">
              {isConnected && walletAddress ? (
                <span>Connected Cardano wallet: {walletAddress.slice(0, 10)}...{walletAddress.slice(-6)}</span>
              ) : (
                <span>Connect your Cardano wallet from the top bar before bridging from Cardano.</span>
              )}
            </div>
          )}

          {sourceChain === 'ethereum' && (
            <div className="flex flex-col gap-3">
              {!evmAddress ? (
                <button
                  className="bg-[#F85858] text-white px-4 py-2 rounded-full font-bold text-sm w-fit"
                  onClick={connectMetaMask}
                  disabled={isConnectingEvm}
                >
                  {isConnectingEvm ? 'Connecting MetaMask...' : 'Connect MetaMask'}
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-white text-sm">
                    Connected MetaMask: {evmAddress.slice(0, 8)}...{evmAddress.slice(-6)}
                  </div>
                  <button
                    className="bg-[#666666] text-white px-3 py-1 rounded-full text-xs"
                    onClick={disconnectMetaMask}
                  >
                    Clear
                  </button>
                </div>
              )}
              {evmError && <div className="text-red-400 text-xs">{evmError}</div>}
            </div>
          )}

          {sourceChain === 'bitcoin' && (
            <input
              type="text"
              value={btcSourceAddress}
              onChange={(e) => setBtcSourceAddress(e.target.value)}
              className="w-full text-white bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Enter your BTC source address (bc1...)"
            />
          )}
        </div>

        <div className="bg-[#1c1c1c] p-4 rounded-lg">
          <div className="text-[#a1a1a1] text-sm mb-2">Asset</div>

          {sourceChain === 'bitcoin' && <div className="text-white font-bold">BTC</div>}

          {sourceChain === 'cardano' && (
            <select
              className="w-full text-white bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:outline-none"
              value={selectedAsset?.symbol || ''}
              onChange={(e) => {
                const next = cardanoAssets?.find((asset) => asset.symbol === e.target.value);
                if (next) setSelectedAsset(next);
              }}
              disabled={!isConnected || !cardanoAssets || cardanoAssets.length === 0}
            >
              {(cardanoAssets || []).map((asset) => (
                <option key={asset.symbol} value={asset.symbol} className="bg-[#1c1c1c] text-white">
                  {asset.symbol}
                </option>
              ))}
            </select>
          )}

          {sourceChain === 'ethereum' && (
            <select
              className="w-full text-white bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:outline-none"
              value={selectedEvmAssetSymbol}
              onChange={(e) => setSelectedEvmAssetSymbol(e.target.value)}
              disabled={!evmAddress || evmAssets.length === 0}
            >
              {evmAssets.map((asset) => (
                <option key={asset.symbol} value={asset.symbol} className="bg-[#1c1c1c] text-white">
                  {asset.symbol}
                </option>
              ))}
            </select>
          )}

          <div className="text-[#A1A1A1] text-xs mt-2">
            {sourceChain === 'cardano' && selectedAsset?.quantity
              ? `Balance: ${formatNumberClean(selectedAsset.quantity, 2, selectedAsset.unit === 'lovelace')}`
              : ''}
            {sourceChain === 'ethereum' && selectedEvmAsset
              ? `Balance: ${selectedEvmAsset.balanceDisplay} ${selectedEvmAsset.symbol}`
              : ''}
          </div>
        </div>

        <div className="bg-[#1c1c1c] p-4 rounded-lg">
          <div className="text-[#A1A1A1] text-sm mb-2">Amount</div>
          <input
            type="text"
            value={sourceAmount}
            onChange={(e) => handleSourceAmountChange(e.target.value)}
            className="text-white font-bold text-2xl bg-transparent border-none outline-none w-full"
            placeholder="0.0"
            inputMode="decimal"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {PERCENTAGE_BUTTONS.map((percentage) => (
              <button
                key={percentage}
                className="bg-[#141414] text-[#A1A1A1] px-4 py-1 rounded-full hover:bg-[#2a2a2a]"
                onClick={() => applyAmountPercentage(percentage)}
                disabled={!sourceBalance || sourceBalance <= 0}
              >
                {percentage}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#1c1c1c] p-4 rounded-lg">
          <div className="text-[#a1a1a1] text-sm mb-2">Destination Wallet ({CHAIN_LABELS[destinationChain]})</div>
          <input
            type="text"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            className="w-full text-white bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-2 focus:outline-none"
            placeholder={destinationPlaceholder}
          />
          {destinationAddress.length > 0 && (
            <div className={`text-xs mt-2 ${destinationReady ? 'text-green-400' : 'text-red-400'}`}>
              {destinationReady ? 'Destination address looks valid.' : `Invalid ${CHAIN_LABELS[destinationChain]} address.`}
            </div>
          )}
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] p-4 rounded-lg text-sm">
          <div className="text-[#a1a1a1] mb-1">Flow Preview</div>
          <div className="text-white">
            {CHAIN_LABELS[sourceChain]} ({sourceAssetLabel}) -&gt; {CHAIN_LABELS[destinationChain]}
          </div>
          {sourceChain === 'bitcoin' && (
            <div className="text-[#a1a1a1] text-xs mt-1">Step: choose BTC, enter destination wallet, then pay to bridge.</div>
          )}
          {sourceChain === 'ethereum' && destinationChain === 'cardano' && (
            <div className="text-[#a1a1a1] text-xs mt-1">Step: connect MetaMask, select ERC20/ETH, then send to Cardano wallet.</div>
          )}
          {sourceChain === 'cardano' && destinationChain === 'ethereum' && (
            <div className="text-[#a1a1a1] text-xs mt-1">Step: connect Cardano wallet, select token, then enter Ethereum wallet.</div>
          )}
        </div>

        <button
          onClick={submitBridgeRequest}
          disabled={!canSubmit}
          className={`py-3 rounded-lg font-bold ${
            canSubmit ? 'bg-[#F85858] text-white hover:opacity-90' : 'bg-[#2a2a2a] text-[#7a7a7a] cursor-not-allowed'
          }`}
        >
          {actionLabel}
        </button>

        {bridgeNotice && <div className="text-green-400 text-sm">{bridgeNotice}</div>}
      </div>
    </Panel>
  );
};

export default BridgeAssets;
