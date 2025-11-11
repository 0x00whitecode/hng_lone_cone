// // Chart.tsx
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   ActivityIndicator,
//   Dimensions,
// } from 'react-native';
// import { LineChart, BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
// import { LinearGradient, Stop, Defs } from 'react-native-svg';
// import * as shape from 'd3-shape';

// const { width } = Dimensions.get('window');

// const Chart = () => {
//   const [loading, setLoading] = useState(true);
//   const [lineData, setLineData] = useState<number[]>([]);
//   const [barData, setBarData] = useState<number[]>([]);
//   const [labels, setLabels] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchCryptoData = async () => {
//       try {
//         const res = await fetch(
//           'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily'
//         );
//         const data = await res.json();

//         // Extract prices and volumes
//         const prices: number[] = data.prices.map((item: [number, number]) => item[1]);
//         const volumes: number[] = data.total_volumes.map((item: [number, number]) => item[1]);

//         // Format labels as day abbreviations
//         const dateLabels: string[] = data.prices.map((item: [number, number]) => {
//           const date = new Date(item[0]);
//           return date.toLocaleDateString('en-US', { weekday: 'short' });
//         });

//         setLineData(prices);
//         setBarData(volumes);
//         setLabels(dateLabels);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching CoinGecko data:', error);
//         setLoading(false);
//       }
//     };

//     fetchCryptoData();
//   }, []);

//   const Gradient = () => (
//     <Defs key={'gradient'}>
//       <LinearGradient id={'gradient'} x1={'0%'} y={'0%'} x2={'0%'} y2={'100%'}>
//         <Stop offset={'0%'} stopColor="#00d4aa" stopOpacity={0.8} />
//         <Stop offset={'100%'} stopColor="#00d4aa" stopOpacity={0.2} />
//       </LinearGradient>
//     </Defs>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#00d4aa" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <Text style={styles.header}>Bitcoin Stats (7 Days)</Text>

//         {/* Line Chart */}
//         <View style={styles.chartContainer}>
//           <Text style={styles.chartTitle}>Price Trend (USD)</Text>
//           <View style={{ flexDirection: 'row', height: 200 }}>
//             <YAxis
//               data={lineData}
//               contentInset={{ top: 20, bottom: 20 }}
//               svg={{ fill: '#9ca3af', fontSize: 12 }}
//               numberOfTicks={5}
//               formatLabel={(value) => `$${value.toFixed(0)}`}
//             />
//             <LineChart
//               style={{ flex: 1, marginLeft: 10 }}
//               data={lineData}
//               svg={{ strokeWidth: 2, stroke: 'url(#gradient)' }}
//               contentInset={{ top: 20, bottom: 20 }}
//               curve={shape.curveNatural}
//             >
//               <Grid />
//               <Gradient />
//             </LineChart>
//           </View>
//           <XAxis
//             style={{ marginHorizontal: -10, height: 30 }}
//             data={lineData}
//             formatLabel={(value, index) => labels[index]}
//             contentInset={{ left: 30, right: 30 }}
//             svg={{ fontSize: 12, fill: '#9ca3af' }}
//           />
//         </View>

//         {/* Bar Chart */}
//         <View style={styles.chartContainer}>
//           <Text style={styles.chartTitle}>Trading Volume (USD)</Text>
//           <View style={{ flexDirection: 'row', height: 200 }}>
//             <YAxis
//               data={barData}
//               contentInset={{ top: 20, bottom: 20 }}
//               svg={{ fill: '#9ca3af', fontSize: 12 }}
//               numberOfTicks={5}
//               formatLabel={(value) => `${(value / 1_000_000).toFixed(0)}M`}
//             />
//             <BarChart
//               style={{ flex: 1, marginLeft: 10 }}
//               data={barData}
//               svg={{ fill: '#00d4aa' }}
//               contentInset={{ top: 20, bottom: 20 }}
//             >
//               <Grid />
//             </BarChart>
//           </View>
//           <XAxis
//             style={{ marginHorizontal: -10, height: 30 }}
//             data={barData}
//             formatLabel={(value, index) => labels[index]}
//             contentInset={{ left: 30, right: 30 }}
//             svg={{ fontSize: 12, fill: '#9ca3af' }}
//           />
//         </View>

//         {/* Legend */}
//         <View style={styles.legend}>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendColor, { backgroundColor: '#00d4aa' }]} />
//             <Text style={styles.legendText}>Volume</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendColor, { backgroundColor: '#00d4aa80' }]} />
//             <Text style={styles.legendText}>Price</Text>
//           </View>
//         </View>

//         <View style={{ height: 100 }} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default Chart;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#000' },
//   header: { fontSize: 28, fontWeight: 'bold', color: '#fff', padding: 20 },
//   chartContainer: {
//     backgroundColor: '#1a1a1a',
//     marginHorizontal: 20,
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 24,
//   },
//   chartTitle: { color: '#9ca3af', fontSize: 16, fontWeight: '600', marginBottom: 10 },
//   legend: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
//   legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
//   legendColor: { width: 16, height: 16, borderRadius: 4, marginRight: 6 },
//   legendText: { color: '#fff', fontSize: 14 },
//   loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// });
