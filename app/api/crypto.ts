// Cryptocurrency API functions

import apiClient from './client';
import { CryptoData } from '../types/crypto';

export const cryptoApi = {
  /**
   * Get top cryptocurrencies by market cap
   */
  async getTopCryptos(limit = 20, includeSparkline = true) {
    return apiClient.get<CryptoData[]>('/coins/markets', {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: limit,
      page: 1,
      sparkline: includeSparkline,
      price_change_percentage: '1h,24h,7d',
    });
  },

  /**
   * Get specific cryptocurrencies by IDs
   */
  async getCryptosByIds(ids: string[], includeSparkline = true) {
    return apiClient.get<CryptoData[]>('/coins/markets', {
      vs_currency: 'usd',
      ids: ids.join(','),
      sparkline: includeSparkline,
      price_change_percentage: '1h,24h,7d',
    });
  },

  /**
   * Search for a specific cryptocurrency
   */
  async searchCrypto(query: string) {
    return apiClient.get('/search', {
      query,
    });
  },

  /**
   * Get cryptocurrency details including charts
   */
  async getCryptoDetails(id: string, days = '7') {
    const [details, chart] = await Promise.all([
      apiClient.get(`/coins/${id}`, {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
      }),
      apiClient.get(`/coins/${id}/market_chart`, {
        vs_currency: 'usd',
        days,
        interval: 'daily',
      }),
    ]);

    return { details, chart };
  },

  /**
   * Get market chart data for a cryptocurrency
   */
  async getMarketChart(id: string, days: string | number = '7') {
    return apiClient.get(`/coins/${id}/market_chart`, {
      vs_currency: 'usd',
      days,
      interval: days === '1' ? 'hourly' : 'daily',
    });
  },

  /**
   * Get global market data
   */
  async getGlobalData(): Promise<{ data: any }> {
    return apiClient.get('/global');
  },

  /**
   * Get trending cryptocurrencies
   */
  async getTrendingCryptos() {
    return apiClient.get('/search/trending');
  },

  /**
   * Get exchange rates
   */
  async getExchangeRates() {
    return apiClient.get('/exchange_rates');
  },

  /**
   * Search multiple cryptocurrencies by symbol
   */
  async searchBySymbol(symbol: string) {
    const data = await apiClient.get('/search', {
      query: symbol,
    });
    return data;
  },

  /**
   * Get cryptocurrency price in multiple currencies
   */
  async getPriceInCurrencies(ids: string | string[], currencies = ['usd', 'eur', 'gbp']) {
    const idString = Array.isArray(ids) ? ids.join(',') : ids;
    return apiClient.get('/simple/price', {
      ids: idString,
      vs_currencies: currencies.join(','),
      include_market_cap: true,
      include_24hr_vol: true,
      include_24hr_change: true,
    });
  },
};

export default cryptoApi;
