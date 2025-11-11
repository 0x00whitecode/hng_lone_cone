// Statistics.tsx
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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

export default function Statistics() {
  const [cryptoData, setCryptoData] = useState([]);
  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d'); // '24h', '7d', '30d', '1y'
  const [selectedTab, setSelectedTab] = useState('overview'); // 'overview', 'portfolio', 'trending'

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch top coins
      const coinsResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&sparkline=true&price_change_percentage=1h,24h,7d,30d`
      );
      const coinsData = await coinsResponse.json();
      setCryptoData(coinsData);

      // Fetch global market data
      const globalResponse = await fetch(
        'https://api.coingecko.com/api/v3/global'
      );
      const globalResult = await globalResponse.json();
      setGlobalData(globalResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePortfolioStats = () => {
    // Mock portfolio holdings
    const holdings = [
      { coin: 'bitcoin', amount: 0.5 },
      { coin: 'ethereum', amount: 2 },
      { coin: 'cardano', amount: 1000 },
    ];

    let totalValue = 0;
    let totalChange = 0;

    holdings.forEach(holding => {
      const coin = cryptoData.find(c => c.id === holding.coin);
      if (coin) {
        totalValue += coin.current_price * holding.amount;
        totalChange += coin.price_change_percentage_24h || 0;
      }
    });

    return {
      totalValue: totalValue.toFixed(2),
      averageChange: (totalChange / holdings.length).toFixed(2),
      holdings: holdings.length,
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#00d4aa" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  const portfolioStats = calculatePortfolioStats();
  const marketCap = globalData?.total_market_cap?.usd || 0;
  const volume24h = globalData?.total_volume?.usd || 0;
  const btcDominance = globalData?.market_cap_percentage?.btc || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Statistics</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
            onPress={() => setSelectedTab('overview')}
          >
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'portfolio' && styles.tabActive]}
            onPress={() => setSelectedTab('portfolio')}
          >
            <Text style={[styles.tabText, selectedTab === 'portfolio' && styles.tabTextActive]}>
              Portfolio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'trending' && styles.tabActive]}
            onPress={() => setSelectedTab('trending')}
          >
            <Text style={[styles.tabText, selectedTab === 'trending' && styles.tabTextActive]}>
              Trending
            </Text>
          </TouchableOpacity>
        </View>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <>
            {/* Global Market Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Global Market</Text>
              
              <View style={styles.statsGrid}>
                <StatsCard
                  title="Market Cap"
                  value={`$${(marketCap / 1e12).toFixed(2)}T`}
                  change="+2.5%"
                  isPositive={true}
                  icon="cash-multiple"
                />
                <StatsCard
                  title="24h Volume"
                  value={`$${(volume24h / 1e9).toFixed(2)}B`}
                  change="+5.2%"
                  isPositive={true}
                  icon="chart-timeline-variant"
                />
                <StatsCard
                  title="BTC Dominance"
                  value={`${btcDominance.toFixed(1)}%`}
                  change="-0.3%"
                  isPositive={false}
                  icon="bitcoin"
                />
                <StatsCard
                  title="Active Cryptos"
                  value={`${globalData?.active_cryptocurrencies || 0}`}
                  change="+12"
                  isPositive={true}
                  icon="coin"
                />
              </View>
            </View>

            {/* Market Cap Chart */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Market Cap Distribution</Text>
              <View style={styles.chartContainer}>
                <DonutChart data={cryptoData.slice(0, 5)} />
              </View>
            </View>

            {/* Top Gainers & Losers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Gainers (24h)</Text>
              <View style={styles.moversContainer}>
                {cryptoData
                  .filter(coin => coin.price_change_percentage_24h > 0)
                  .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
                  .slice(0, 3)
                  .map((coin, index) => (
                    <MoverCard key={coin.id} coin={coin} rank={index + 1} type="gainer" />
                  ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Losers (24h)</Text>
              <View style={styles.moversContainer}>
                {cryptoData
                  .filter(coin => coin.price_change_percentage_24h < 0)
                  .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
                  .slice(0, 3)
                  .map((coin, index) => (
                    <MoverCard key={coin.id} coin={coin} rank={index + 1} type="loser" />
                  ))}
              </View>
            </View>

            {/* Volume Leaders */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Volume Leaders (24h)</Text>
              {cryptoData
                .sort((a, b) => b.total_volume - a.total_volume)
                .slice(0, 5)
                .map((coin, index) => (
                  <VolumeCard key={coin.id} coin={coin} rank={index + 1} />
                ))}
            </View>
          </>
        )}

        {/* Portfolio Tab */}
        {selectedTab === 'portfolio' && (
          <>
            {/* Portfolio Summary */}
            <LinearGradient
              colors={['#6b21a8', '#4c1d95']}
              style={styles.portfolioSummary}
            >
              <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
              <Text style={styles.portfolioValue}>${portfolioStats.totalValue}</Text>
              <View style={styles.portfolioChange}>
                <Text style={[styles.portfolioChangeText, parseFloat(portfolioStats.averageChange) > 0 ? styles.positive : styles.negative]}>
                  {parseFloat(portfolioStats.averageChange) > 0 ? '▲' : '▼'} {Math.abs(parseFloat(portfolioStats.averageChange)).toFixed(2)}%
                </Text>
                <Text style={styles.portfolioChangePeriod}>Last 24h</Text>
              </View>
            </LinearGradient>

            {/* Timeframe Selector */}
            <View style={styles.timeframeSelector}>
              {['24h', '7d', '30d', '1y'].map((tf) => (
                <TouchableOpacity
                  key={tf}
                  style={[styles.timeframeButton, timeframe === tf && styles.timeframeButtonActive]}
                  onPress={() => setTimeframe(tf)}
                >
                  <Text style={[styles.timeframeText, timeframe === tf && styles.timeframeTextActive]}>
                    {tf}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Portfolio Chart */}
            <View style={styles.section}>
              <View style={styles.portfolioChartContainer}>
                <PortfolioChart data={cryptoData.slice(0, 3)} />
              </View>
            </View>

            {/* Holdings Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Holdings Breakdown</Text>
              {[
                { coin: 'bitcoin', amount: 0.5 },
                { coin: 'ethereum', amount: 2 },
                { coin: 'cardano', amount: 1000 },
              ].map((holding) => {
                const coin = cryptoData.find(c => c.id === holding.coin);
                if (!coin) return null;
                const value = coin.current_price * holding.amount;
                const percentage = (value / parseFloat(portfolioStats.totalValue)) * 100;
                
                return (
                  <HoldingCard
                    key={holding.coin}
                    coin={coin}
                    amount={holding.amount}
                    value={value}
                    percentage={percentage}
                  />
                );
              })}
            </View>

            {/* Performance Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance Metrics</Text>
              <View style={styles.metricsGrid}>
                <MetricCard
                  label="Total Invested"
                  value="$10,250"
                  icon="💵"
                />
                <MetricCard
                  label="Total Returns"
                  value={`$${(parseFloat(portfolioStats.totalValue) - 10250).toFixed(2)}`}
                  icon="📈"
                />
                <MetricCard
                  label="ROI"
                  value={`${(((parseFloat(portfolioStats.totalValue) - 10250) / 10250) * 100).toFixed(2)}%`}
                  icon="💎"
                />
                <MetricCard
                  label="Best Performer"
                  value="BTC"
                  icon="🏆"
                />
              </View>
            </View>
          </>
        )}

        {/* Trending Tab */}
        {selectedTab === 'trending' && (
          <>
            {/* Trending Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Searches</Text>
              <View style={styles.trendingList}>
                {cryptoData.slice(0, 10).map((coin, index) => (
                  <TrendingCard key={coin.id} coin={coin} rank={index + 1} />
                ))}
              </View>
            </View>

            {/* Most Visited */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Most Visited</Text>
              <View style={styles.visitedGrid}>
                {cryptoData.slice(0, 6).map((coin) => (
                  <VisitedCard key={coin.id} coin={coin} />
                ))}
              </View>
            </View>

            {/* Recently Added */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recently Added</Text>
              {cryptoData.slice(10, 15).map((coin) => (
                <RecentlyAddedCard key={coin.id} coin={coin} />
              ))}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Stats Card Component
const StatsCard = ({ title, value, change, isPositive, icon }) => (
  <View style={styles.statsCard}>
    <LinearGradient colors={['#00d4aa', '#00a18c']} style={styles.statsIconCircle}>
      <MaterialCommunityIcons name={icon} size={22} color="#ffffff" />
    </LinearGradient>
    <Text style={styles.statsTitle}>{title}</Text>
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={[styles.statsChange, isPositive ? styles.positive : styles.negative]}>
      {isPositive ? '▲' : '▼'} {change}
    </Text>
  </View>
);

// Donut Chart Component
const DonutChart = ({ data }) => {
  const total = data.reduce((sum, coin) => sum + coin.market_cap, 0);
  const size = width - 80;
  const center = size / 2;
  const radius = size / 2 - 20;
  const innerRadius = radius - 40;

  let currentAngle = -90;
  const colors = ['#00d4aa', '#6b21a8', '#1e40af', '#ef4444', '#f59e0b'];

  return (
    <View style={styles.donutChartContainer}>
      <Svg width={size} height={size}>
        {data.map((coin, index) => {
          const percentage = (coin.market_cap / total) * 100;
          const angle = (percentage / 100) * 360;
          
          const startAngle = currentAngle * (Math.PI / 180);
          const endAngle = (currentAngle + angle) * (Math.PI / 180);
          
          const x1 = center + radius * Math.cos(startAngle);
          const y1 = center + radius * Math.sin(startAngle);
          const x2 = center + radius * Math.cos(endAngle);
          const y2 = center + radius * Math.sin(endAngle);
          
          const x3 = center + innerRadius * Math.cos(endAngle);
          const y3 = center + innerRadius * Math.sin(endAngle);
          const x4 = center + innerRadius * Math.cos(startAngle);
          const y4 = center + innerRadius * Math.sin(startAngle);
          
          const largeArc = angle > 180 ? 1 : 0;
          
          const pathData = `
            M ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
            Z
          `;
          
          currentAngle += angle;
          
          return (
            <Path
              key={coin.id}
              d={pathData}
              fill={colors[index % colors.length]}
            />
          );
        })}
      </Svg>
      
      <View style={styles.donutLegend}>
        {data.map((coin, index) => (
          <View key={coin.id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors[index % colors.length] }]} />
            <Text style={styles.legendText}>{coin.symbol.toUpperCase()}</Text>
            <Text style={styles.legendPercentage}>
              {((coin.market_cap / total) * 100).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Portfolio Chart Component
const PortfolioChart = ({ data }) => {
  const chartWidth = width - 40;
  const chartHeight = 200;
  
  const generatePath = () => {
    if (!data || data.length === 0) return '';
    
    const points = data[0].sparkline_in_7d?.price || [];
    if (points.length === 0) return '';
    
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    
    return points.map((point, i) => {
      const x = (i / (points.length - 1)) * chartWidth;
      const y = chartHeight - ((point - min) / range) * chartHeight;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };

  return (
    <Svg width={chartWidth} height={chartHeight}>
      <Path
        d={generatePath()}
        stroke="#00d4aa"
        strokeWidth="3"
        fill="none"
      />
    </Svg>
  );
};

// Mover Card Component
const MoverCard = ({ coin, rank, type }) => {
  const isGainer = type === 'gainer';
  const change = coin.price_change_percentage_24h || 0;
  
  return (
    <LinearGradient
      colors={isGainer ? ['#065f46', '#064e3b'] : ['#7f1d1d', '#701a1a']}
      style={styles.moverCard}
    >
      <View style={styles.moverRank}>
        <Text style={styles.moverRankText}>{rank}</Text>
      </View>
      <Image source={{ uri: coin.image }} style={styles.moverImage} />
      <View style={styles.moverInfo}>
        <Text style={styles.moverName}>{coin.name}</Text>
        <Text style={styles.moverSymbol}>{coin.symbol.toUpperCase()}</Text>
      </View>
      <View style={styles.moverStats}>
        <Text style={styles.moverPrice}>${coin.current_price.toFixed(2)}</Text>
        <Text style={[styles.moverChange, isGainer ? styles.positive : styles.negative]}>
          {isGainer ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </Text>
      </View>
    </LinearGradient>
  );
};

// Volume Card Component
const VolumeCard = ({ coin, rank }) => (
  <View style={styles.volumeCard}>
    <Text style={styles.volumeRank}>{rank}</Text>
    <Image source={{ uri: coin.image }} style={styles.volumeImage} />
    <View style={styles.volumeInfo}>
      <Text style={styles.volumeName}>{coin.name}</Text>
      <Text style={styles.volumeSymbol}>{coin.symbol.toUpperCase()}</Text>
    </View>
    <View style={styles.volumeStats}>
      <Text style={styles.volumeAmount}>${(coin.total_volume / 1e9).toFixed(2)}B</Text>
      <View style={styles.volumeBar}>
        <View style={[styles.volumeBarFill, { width: `${Math.min((coin.total_volume / 50e9) * 100, 100)}%` }]} />
      </View>
    </View>
  </View>
);

// Holding Card Component
const HoldingCard = ({ coin, amount, value, percentage }) => (
  <View style={styles.holdingCard}>
    <Image source={{ uri: coin.image }} style={styles.holdingImage} />
    <View style={styles.holdingInfo}>
      <Text style={styles.holdingName}>{coin.name}</Text>
      <Text style={styles.holdingAmount}>{amount} {coin.symbol.toUpperCase()}</Text>
    </View>
    <View style={styles.holdingStats}>
      <Text style={styles.holdingValue}>${value.toFixed(2)}</Text>
      <Text style={styles.holdingPercentage}>{percentage.toFixed(1)}%</Text>
    </View>
  </View>
);

// Metric Card Component
const MetricCard = ({ label, value, icon }) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricIcon}>{icon}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

// Trending Card Component
const TrendingCard = ({ coin, rank }) => {
  const change = coin.price_change_percentage_24h || 0;
  const isPositive = change > 0;
  
  return (
    <View style={styles.trendingCard}>
      <View style={styles.trendingLeft}>
        <Text style={styles.trendingRank}>{rank}</Text>
        <Image source={{ uri: coin.image }} style={styles.trendingImage} />
        <View>
          <Text style={styles.trendingName}>{coin.name}</Text>
          <Text style={styles.trendingSymbol}>{coin.symbol.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.trendingRight}>
        <Text style={styles.trendingPrice}>${coin.current_price.toFixed(2)}</Text>
        <Text style={[styles.trendingChange, isPositive ? styles.positive : styles.negative]}>
          {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </Text>
      </View>
    </View>
  );
};

// Visited Card Component
const VisitedCard = ({ coin }) => (
  <View style={styles.visitedCard}>
    <Image source={{ uri: coin.image }} style={styles.visitedImage} />
    <Text style={styles.visitedName}>{coin.name}</Text>
    <Text style={styles.visitedSymbol}>{coin.symbol.toUpperCase()}</Text>
    <Text style={styles.visitedPrice}>${coin.current_price.toFixed(2)}</Text>
  </View>
);

// Recently Added Card Component
const RecentlyAddedCard = ({ coin }) => (
  <View style={styles.recentCard}>
    <Image source={{ uri: coin.image }} style={styles.recentImage} />
    <View style={styles.recentInfo}>
      <Text style={styles.recentName}>{coin.name}</Text>
      <Text style={styles.recentSymbol}>{coin.symbol.toUpperCase()}</Text>
    </View>
    <View style={styles.recentBadge}>
      <Text style={styles.recentBadgeText}>NEW</Text>
    </View>
  </View>
);

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
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 20,
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#00d4aa',
  },
  tabText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#000000',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
  },
  statsIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statsTitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 8,
  },
  statsValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsChange: {
    fontSize: 12,
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
  chartContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
  },
  donutChartContainer: {
    alignItems: 'center',
  },
  donutLegend: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
  },
  legendPercentage: {
    color: '#9ca3af',
    fontSize: 14,
  },
  moversContainer: {
    gap: 12,
  },
  moverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  moverRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moverRankText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  moverImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  moverInfo: {
    flex: 1,
  },
  moverName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  moverSymbol: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  moverStats: {
    alignItems: 'flex-end',
  },
  moverPrice: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  moverChange: {
    fontSize: 14,
  },
  volumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  volumeRank: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: 'bold',
    width: 20,
  },
  volumeImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  volumeInfo: {
    flex: 1,
  },
  volumeName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  volumeSymbol: {
    color: '#9ca3af',
    fontSize: 12,
  },
  volumeStats: {
    width: 100,
  },
  volumeAmount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  volumeBar: {
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
  },
  volumeBarFill: {
    height: '100%',
    backgroundColor: '#00d4aa',
    borderRadius: 2,
  },
  portfolioSummary: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  portfolioLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  portfolioValue: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portfolioChangeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  portfolioChangePeriod: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  timeframeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  timeframeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  timeframeButtonActive: {
    backgroundColor: '#00d4aa',
  },
  timeframeText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  timeframeTextActive: {
    color: '#000000',
  },
  portfolioChartContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  holdingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  holdingImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  holdingAmount: {
    color: '#9ca3af',
    fontSize: 12,
  },
  holdingStats: {
    alignItems: 'flex-end',
  },
  holdingValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  holdingPercentage: {
    color: '#9ca3af',
    fontSize: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  trendingList: {
    gap: 12,
  },
  trendingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  trendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendingRank: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: 'bold',
    width: 20,
  },
  trendingImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  trendingName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  trendingSymbol: {
    color: '#9ca3af',
    fontSize: 12,
  },
  trendingRight: {
    alignItems: 'flex-end',
  },
  trendingPrice: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  trendingChange: {
    fontSize: 12,
  },
  visitedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  visitedCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  visitedImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  visitedName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  visitedSymbol: {
    color: '#9ca3af',
    fontSize: 10,
    marginBottom: 4,
  },
  visitedPrice: {
    color: '#00d4aa',
    fontSize: 12,
    fontWeight: '600',
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  recentImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  recentSymbol: {
    color: '#9ca3af',
    fontSize: 12,
  },
  recentBadge: {
    backgroundColor: '#ef4444',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  recentBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
});
