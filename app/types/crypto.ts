// Cryptocurrency types

export interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: number;
  atl: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface PortfolioHolding {
  coinId: string;
  symbol: string;
  amount: number;
  averageBuyPrice: number;
  currentValue?: number;
  changePercentage?: number;
}

export interface Portfolio {
  userId: string;
  totalValue: number;
  totalChange: number;
  holdings: PortfolioHolding[];
  lastUpdated: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'send' | 'receive' | 'swap' | 'buy' | 'sell';
  fromCoin: string;
  toCoin: string;
  fromAmount: number;
  toAmount: number;
  recipientAddress?: string;
  fee: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

export interface MarketData {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  activeCryptos: number;
}

export interface PriceAlert {
  id: string;
  userId: string;
  coinSymbol: string;
  targetPrice: number;
  alertType: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
}
