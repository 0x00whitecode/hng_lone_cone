// Home.tsx
import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function index() {
  const { user } = useUser();
  const [cryptoData, setCryptoData] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [filterType, setFilterType] = useState('24hrs');
  const [timeframe, setTimeframe] = useState('Monthly');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCryptoData();
    fetchPortfolioData();
  }, [filterType]);

  const fetchCryptoData = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h,24h,7d'
      );
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.json();
      setCryptoData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch crypto data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,cardano&sparkline=true'
      );
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.json();
      setPortfolioData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch portfolio data';
      setError(message);
    }
  };

  const calculatePortfolioBalance = () => {
    if (portfolioData.length === 0) return '0.00';
    // TODO: Replace with real user holdings from context/backend
    return '0.00';
  };

  const calculatePortfolioChange = () => {
    if (portfolioData.length === 0) return 0;
    const avgChange = portfolioData.reduce((sum, coin) => 
      sum + (coin.price_change_percentage_24h || 0), 0) / portfolioData.length;
    return avgChange.toFixed(2);
  };

  const getFilteredData = () => {
    if (!cryptoData.length) return [];
    
    switch(filterType) {
      case 'Hot':
        return [...cryptoData].sort((a, b) => b.market_cap - a.market_cap).slice(0, 10);
      case 'Profit':
        return [...cryptoData].filter(coin => coin.price_change_percentage_24h > 0)
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
      case 'Loss':
        return [...cryptoData].filter(coin => coin.price_change_percentage_24h < 0)
          .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
      case 'Rising':
        return [...cryptoData].filter(coin => coin.price_change_percentage_24h > 5);
      case 'Top Gain':
        return [...cryptoData].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);
      default:
        return cryptoData;
    }
  };

  if (selectedCoin) {
    return <CoinDetailScreen coin={selectedCoin} onBack={() => setSelectedCoin(null)} />;
  }

  const portfolioBalance = calculatePortfolioBalance();
  const portfolioChange = calculatePortfolioChange();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {error && (
          <View style={{ backgroundColor: '#7f1d1d', padding: 12, margin: 16, borderRadius: 8 }}>
            <Text style={{ color: '#fff', marginBottom: 8 }}>{error}</Text>
            <TouchableOpacity onPress={() => { fetchCryptoData(); fetchPortfolioData(); }}>
              <Text style={{ color: '#000', backgroundColor: '#fff', paddingVertical: 8, textAlign: 'center', borderRadius: 6 }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={{ uri: user?.imageUrl || 'https://via.placeholder.com/50' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>Good Morning</Text>
              <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <View style={styles.bellIcon}>
              <Text style={styles.bellText}>🔔</Text>
              <View style={styles.notificationDot} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Portfolio Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Portfolio Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>${portfolioBalance}</Text>
            <View style={[styles.percentageBadge, portfolioChange < 0 && styles.percentageBadgeNegative]}>
              <Text style={[styles.percentageText, portfolioChange < 0 && styles.percentageTextNegative]}>
                {portfolioChange > 0 ? '▲' : '▼'} {Math.abs(portfolioChange)}%
              </Text>
            </View>
          </View>
        </View>

        {/* My Portfolio Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Portfolio</Text>
          <TouchableOpacity onPress={() => {
            const timeframes = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
            const currentIndex = timeframes.indexOf(timeframe);
            setTimeframe(timeframes[(currentIndex + 1) % timeframes.length]);
          }}>
            <Text style={styles.monthlyText}>{timeframe} ▼</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.portfolioScroll}
          contentContainerStyle={styles.portfolioContent}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#00d4aa" />
          ) : (
            portfolioData.map((coin, index) => {
              const amounts = [0.15, 0.5, 1000];
              const value = (coin.current_price * amounts[index]).toFixed(2);
              return (
                <PortfolioCard
                  key={coin.id}
                  name={coin.name}
                  symbol={coin.symbol.toUpperCase()}
                  value={value}
                  change={coin.price_change_percentage_24h?.toFixed(2)}
                  colors={index === 0 ? ['#6b21a8', '#4c1d95'] : index === 1 ? ['#1e40af', '#1e3a8a'] : ['#0e7490', '#155e75']}
                  sparkline={coin.sparkline_in_7d?.price}
                  onPress={() => setSelectedCoin(coin)}
                />
              );
            })
          )}
        </ScrollView>

        {/* Refer Rewards Banner */}
        <View style={styles.rewardsBanner}>
          <View style={styles.rewardsContent}>
            <Text style={styles.rewardsTitle}>Refer Rewards</Text>
            <Text style={styles.rewardsText}>
              Earn 5$ rewards on every{'\n'}successful referral
            </Text>
          </View>
          <View style={styles.handEmoji}>
            <Text style={styles.handText}>✌️</Text>
          </View>
          <TouchableOpacity style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Market Statistics */}
        <Text style={styles.marketTitle}>Market Statistics</Text>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {['24hrs', 'Hot', 'Profit', 'Rising', 'Loss', 'Top Gain'].map((filter) => (
            <FilterChip 
              key={filter}
              label={filter} 
              active={filterType === filter}
              onPress={() => setFilterType(filter)}
            />
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator size="large" color="#00d4aa" style={styles.loader} />
        ) : (
          <View style={styles.marketList}>
            {getFilteredData().map((coin) => (
              <MarketStatItem
                key={coin.id}
                name={coin.name}
                symbol={coin.symbol.toUpperCase()}
                price={coin.current_price.toFixed(2)}
                change={coin.price_change_percentage_24h?.toFixed(2)}
                icon={coin.image}
                sparkline={coin.sparkline_in_7d?.price}
                onPress={() => setSelectedCoin(coin)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Coin Detail Screen Component
const CoinDetailScreen = ({ coin, onBack }) => {
  const [chartData, setChartData] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [timeRange]);

  const fetchChartData = async () => {
    try {
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '1m' ? 30 : 365;
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=${days}`
      );
      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDetailPath = (data) => {
    if (!data || !data.prices || data.prices.length === 0) return '';
    const prices = data.prices.map(p => p[1]);
    const width = Dimensions.get('window').width - 40;
    const height = 200;
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const range = max - min || 1;
    
    return prices.map((price, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = height - ((price - min) / range) * height;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.detailHeaderCenter}>
            <Image source={{ uri: coin.image }} style={styles.detailCoinIcon} />
            <Text style={styles.detailCoinName}>{coin.name}</Text>
          </View>
          <TouchableOpacity style={styles.favoriteButton}>
            <Text style={styles.favoriteText}>⭐</Text>
          </TouchableOpacity>
        </View>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={styles.detailPrice}>${coin.current_price.toLocaleString()}</Text>
          <View style={[styles.detailChange, coin.price_change_percentage_24h > 0 ? styles.detailChangePositive : styles.detailChangeNegative]}>
            <Text style={[styles.detailChangeText, coin.price_change_percentage_24h > 0 ? styles.positive : styles.negative]}>
              {coin.price_change_percentage_24h > 0 ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartSection}>
          {loading ? (
            <ActivityIndicator size="large" color="#00d4aa" />
          ) : (
            <Svg width={width - 40} height={200}>
              <Path
                d={generateDetailPath(chartData)}
                stroke="#00d4aa"
                strokeWidth="3"
                fill="none"
              />
            </Svg>
          )}
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {['24h', '7d', '1m', '1y'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.timeRangeButton, timeRange === range && styles.timeRangeButtonActive]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[styles.timeRangeText, timeRange === range && styles.timeRangeTextActive]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatRow label="Market Cap" value={`$${(coin.market_cap / 1e9).toFixed(2)}B`} />
          <StatRow label="24h Volume" value={`$${(coin.total_volume / 1e9).toFixed(2)}B`} />
          <StatRow label="Circulating Supply" value={`${(coin.circulating_supply / 1e6).toFixed(2)}M ${coin.symbol.toUpperCase()}`} />
          <StatRow label="24h High" value={`$${coin.high_24h?.toLocaleString()}`} />
          <StatRow label="24h Low" value={`$${coin.low_24h?.toLocaleString()}`} />
          <StatRow label="All Time High" value={`$${coin.ath?.toLocaleString()}`} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sellButton}>
            <Text style={styles.sellButtonText}>Sell</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// StatRow Component
const StatRow = ({ label, value }) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

// PortfolioCard Component
const PortfolioCard = ({ name, symbol, value, change, colors, sparkline, onPress }) => {
  const generateSparklinePath = (data) => {
    if (!data || data.length === 0) return '';
    const points = data.slice(-50);
    const width = 240;
    const height = 60;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    
    return points.map((point, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((point - min) / range) * height;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };

  const isPositive = parseFloat(change) > 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={colors} style={styles.portfolioCard}>
        <View style={styles.cardHeader}>
          <View style={styles.coinIcon}>
            <Text style={styles.coinIconText}>{name[0]}</Text>
          </View>
          <View>
            <Text style={styles.coinName}>{name}</Text>
            <Text style={styles.coinSymbol}>{symbol}</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Svg width={240} height={60}>
            <Path
              d={generateSparklinePath(sparkline)}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
              fill="none"
            />
          </Svg>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardValue}>${value}</Text>
          <View style={styles.cardChange}>
            <Text style={[styles.cardChangeText, isPositive ? styles.positive : styles.negative]}>
              {isPositive ? '▲' : '▼'} {Math.abs(change)}%
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// MarketStatItem Component
const MarketStatItem = ({ name, symbol, price, change, icon, sparkline, onPress }) => {
  const isPositive = parseFloat(change) > 0;
  
  const generateMiniSparkline = (data) => {
    if (!data || data.length === 0) return '';
    const points = data.slice(-20);
    const width = 60;
    const height = 30;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    
    return points.map((point, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((point - min) / range) * height;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.marketItem}>
        <View style={styles.marketLeft}>
          <Image source={{ uri: icon }} style={styles.marketIcon} />
          <View>
            <Text style={styles.marketName}>{name}</Text>
            <Text style={styles.marketSymbol}>{symbol}</Text>
          </View>
        </View>

        <View style={styles.marketRight}>
          <Svg width={60} height={30}>
            <Path
              d={generateMiniSparkline(sparkline)}
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="2"
              fill="none"
            />
          </Svg>

          <View style={styles.marketPriceContainer}>
            <Text style={styles.marketPrice}>${price}</Text>
            <Text style={[styles.marketChange, isPositive ? styles.positive : styles.negative]}>
              {isPositive ? '▲' : '▼'} {Math.abs(change)}%
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// FilterChip Component
const FilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.filterChip, active && styles.filterChipActive]}
    onPress={onPress}
  >
    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// BottomNav Component

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    color: '#9ca3af',
    fontSize: 14,
  },
  userName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  bellIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellText: {
    fontSize: 24,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  balanceSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  balanceLabel: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  percentageBadge: {
    backgroundColor: '#065f46',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  percentageBadgeNegative: {
    backgroundColor: '#7f1d1d',
  },
  percentageText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  percentageTextNegative: {
    color: '#ef4444',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  monthlyText: {
    color: '#00d4aa',
    fontSize: 16,
  },
  portfolioScroll: {
    marginBottom: 24,
  },
  portfolioContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  portfolioCard: {
    width: 280,
    borderRadius: 24,
    padding: 20,
    marginRight: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  coinIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinIconText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  coinName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  coinSymbol: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  chartContainer: {
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  cardChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardChangeText: {
    fontSize: 14,
  },
  rewardsBanner: {
    backgroundColor: '#00d4aa',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardsContent: {
    flex: 1,
  },
  rewardsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000000',
  },
  rewardsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  handEmoji: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handText: {
    fontSize: 32,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  closeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  marketTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#374151',
  },
  filterChipText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  marketList: {
    paddingHorizontal: 20,
  },
  marketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  marketLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  marketIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  marketName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  marketSymbol: {
    color: '#9ca3af',
    fontSize: 14,
  },
  marketRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  marketPriceContainer: {
    alignItems: 'flex-end',
  },
  marketPrice: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  marketChange: {
    fontSize: 12,
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
  loader: {
    marginVertical: 20,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    padding: 8,
  },
  navIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  navIconActive: {
    fontSize: 24,
  },
  navItemCenter: {
    marginTop: -20,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00d4aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  // Coin Detail Styles
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#ffffff',
    fontSize: 24,
  },
  detailHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailCoinIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  detailCoinName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteText: {
    fontSize: 20,
  },
  priceSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  detailPrice: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailChange: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailChangePositive: {
    backgroundColor: '#065f46',
  },
  detailChangeNegative: {
    backgroundColor: '#7f1d1d',
  },
  detailChangeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    height: 200,
    justifyContent: 'center',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  timeRangeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1f2937',
  },
  timeRangeButtonActive: {
    backgroundColor: '#00d4aa',
  },
  timeRangeText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  timeRangeTextActive: {
    color: '#000000',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 16,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#00d4aa',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sellButton: {
    flex: 1,
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sellButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});