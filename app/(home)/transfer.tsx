// Transfer.tsx
import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    sanitizeInput,
    validateAmount,
    validateWalletAddress,
} from '../utils/validation';

export default function Transfer() {
  const { user } = useUser();

  // Transfer Type State
  const [transferType, setTransferType] = useState<'send' | 'receive' | 'swap'>('send');

  // Crypto Data State
  const [cryptoData, setCryptoData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Send/Receive States
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  // Swap States
  const [fromCoin, setFromCoin] = useState<any>(null);
  const [toCoin, setToCoin] = useState<any>(null);
  const [swapAmount, setSwapAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('0');

  // Modal States
  const [showCoinPicker, setShowCoinPicker] = useState(false);
  const [showContactsList, setShowContactsList] = useState(false);
  const [pickerMode, setPickerMode] = useState<'select' | 'from' | 'to'>('select');

  // Recent Contacts (dummy)
  const [recentContacts] = useState([
    { id: 1, name: 'John Doe', address: '0x742d35...Ab8c', avatar: '👨' },
    { id: 2, name: 'Sarah Smith', address: '0x8f3a21...Cd4e', avatar: '👩' },
    { id: 3, name: 'Mike Johnson', address: '0xa19b45...Ef6g', avatar: '👨‍💼' },
    { id: 4, name: 'Emma Wilson', address: '0xc27d89...Gh8i', avatar: '👩‍💻' },
  ]);

  // Fetch crypto data from CoinGecko API
  const fetchCryptoData = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&sparkline=false'
      );
      const data = await response.json();
      setCryptoData(data);
      if (!selectedCoin && data.length > 0) setSelectedCoin(data[0]);
      if (!fromCoin && data.length > 0) setFromCoin(data[0]);
      if (!toCoin && data.length > 1) setToCoin(data[1]);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      Alert.alert('Error', 'Failed to fetch crypto data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCryptoData();
  }, []);

  // Calculate swap amount in real-time
  useEffect(() => {
    if (swapAmount && fromCoin && toCoin) {
      const calculated = ((parseFloat(swapAmount) * fromCoin.current_price) / toCoin.current_price).toFixed(6);
      setReceiveAmount(calculated);
    } else {
      setReceiveAmount('0');
    }
  }, [swapAmount, fromCoin, toCoin]);

  // Send handler
  const handleSend = () => {
    const addrErr = validateWalletAddress(recipientAddress);
    if (addrErr) {
      Alert.alert('Invalid Address', addrErr.message);
      return;
    }
    const amtErr = validateAmount(amount, 0, selectedCoin?.current_price);
    if (amtErr) {
      Alert.alert('Invalid Amount', amtErr.message);
      return;
    }
    const cleanAddress = sanitizeInput(recipientAddress);
    const cleanMemo = sanitizeInput(memo);
    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} ${selectedCoin?.symbol?.toUpperCase()} to ${cleanAddress}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => {
            Alert.alert('Success', 'Transaction sent!');
            setAmount('');
            setRecipientAddress('');
            setMemo('');
          } 
        },
      ]
    );
  };

  // Swap handler
  const handleSwap = () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      Alert.alert('Error', 'Please enter valid amount');
      return;
    }
    Alert.alert(
      'Swap Confirmation',
      `Swap ${swapAmount} ${fromCoin?.symbol.toUpperCase()} for ${receiveAmount} ${toCoin?.symbol.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => {
          Alert.alert('Success', 'Swap completed!');
          setSwapAmount('');
        } },
      ]
    );
  };

  // Open coin picker
  const openCoinPicker = (mode: 'select' | 'from' | 'to') => {
    setPickerMode(mode);
    setShowCoinPicker(true);
  };

  // Select coin
  const selectCoin = (coin: any) => {
    if (pickerMode === 'select') setSelectedCoin(coin);
    else if (pickerMode === 'from') setFromCoin(coin);
    else if (pickerMode === 'to') setToCoin(coin);
    setShowCoinPicker(false);
  };

  // Select contact
  const selectContact = (contact: any) => {
    setRecipientAddress(contact.address);
    setShowContactsList(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#00d4aa" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
          
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Transfer</Text>
          </View>

          {/* Transfer Type Selector */}
          <View style={styles.typeSelector}>
            {['send','receive','swap'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeButton, transferType===type && styles.typeButtonActive]}
                onPress={() => setTransferType(type as any)}
              >
                <Text style={[styles.typeButtonText, transferType===type && styles.typeButtonTextActive]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Send Section */}
          {transferType === 'send' && (
            <View style={styles.contentSection}>
              <Text style={styles.label}>Select Coin</Text>
              <TouchableOpacity style={styles.coinSelector} onPress={() => openCoinPicker('select')}>
                <View style={styles.coinSelectorLeft}>
                  <Image source={{ uri: selectedCoin?.image }} style={styles.coinImage} />
                  <View>
                    <Text style={styles.coinName}>{selectedCoin?.name}</Text>
                    <Text style={styles.coinSymbol}>{selectedCoin?.symbol.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <Text style={[styles.label,{marginTop:16}]}>Recipient Address</Text>
              <View style={styles.addressInputContainer}>
                <TextInput
                  style={styles.addressInput}
                  value={recipientAddress}
                  onChangeText={setRecipientAddress}
                  placeholder="Wallet address"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity style={styles.iconButton} onPress={() => setShowContactsList(true)}>
                  <Text>👤</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label,{marginTop:16}]}>Amount</Text>
              <View style={styles.amountContainer}>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#666"
                  keyboardType="decimal-pad"
                />
              </View>

              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <LinearGradient colors={['#00d4aa','#00a67e']} style={styles.sendButtonGradient}>
                  <Text style={styles.sendButtonText}>Send</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={fetchCryptoData} style={{ marginTop: 12 }}>
                <Text style={{ color: '#00d4aa', textAlign: 'center' }}>🔄 Refresh</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Receive Section */}
          {transferType === 'receive' && (
            <View style={styles.contentSection}>
              <Text style={styles.label}>Select Coin to Receive</Text>
              <TouchableOpacity style={styles.coinSelector} onPress={() => openCoinPicker('select')}>
                <View style={styles.coinSelectorLeft}>
                  <Image source={{ uri: selectedCoin?.image }} style={styles.coinImage} />
                  <View>
                    <Text style={styles.coinName}>{selectedCoin?.name}</Text>
                    <Text style={styles.coinSymbol}>{selectedCoin?.symbol.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <View style={{marginTop:24,backgroundColor:'#1a1a1a',padding:20,borderRadius:12}}>
                <Text style={{color:'#9ca3af',marginBottom:8}}>Wallet Address</Text>
                <Text style={{color:'#fff'}}>{user?.primaryEmailAddress?.emailAddress || '0x1234...abcd'}</Text>
              </View>
            </View>
          )}

          {/* Swap Section */}
          {transferType === 'swap' && (
            <View style={styles.contentSection}>
              <Text style={styles.label}>From</Text>
              <TouchableOpacity style={styles.coinSelector} onPress={() => openCoinPicker('from')}>
                <View style={styles.coinSelectorLeft}>
                  <Image source={{ uri: fromCoin?.image }} style={styles.coinImage} />
                  <View>
                    <Text style={styles.coinName}>{fromCoin?.name}</Text>
                    <Text style={styles.coinSymbol}>{fromCoin?.symbol.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <Text style={styles.label}>To</Text>
              <TouchableOpacity style={styles.coinSelector} onPress={() => openCoinPicker('to')}>
                <View style={styles.coinSelectorLeft}>
                  <Image source={{ uri: toCoin?.image }} style={styles.coinImage} />
                  <View>
                    <Text style={styles.coinName}>{toCoin?.name}</Text>
                    <Text style={styles.coinSymbol}>{toCoin?.symbol.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <Text style={[styles.label,{marginTop:16}]}>Amount</Text>
              <View style={styles.amountContainer}>
                <TextInput
                  style={styles.amountInput}
                  value={swapAmount}
                  onChangeText={setSwapAmount}
                  placeholder="0.00"
                  placeholderTextColor="#666"
                  keyboardType="decimal-pad"
                />
              </View>
              <Text style={{color:'#9ca3af',marginTop:4}}>You will receive: {receiveAmount} {toCoin?.symbol.toUpperCase()}</Text>

              <TouchableOpacity style={styles.sendButton} onPress={handleSwap}>
                <LinearGradient colors={['#00d4aa','#00a67e']} style={styles.sendButtonGradient}>
                  <Text style={styles.sendButtonText}>Swap</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Coin Picker Modal */}
        <Modal visible={showCoinPicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Coin</Text>
                <TouchableOpacity onPress={() => setShowCoinPicker(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                {cryptoData.map((coin) => (
                  <TouchableOpacity key={coin.id} style={styles.coinModalItem} onPress={() => selectCoin(coin)}>
                    <Image source={{ uri: coin.image }} style={styles.coinModalImage} />
                    <View style={styles.coinModalInfo}>
                      <Text style={styles.coinModalName}>{coin.name}</Text>
                      <Text style={styles.coinModalSymbol}>{coin.symbol.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.coinModalPrice}>${coin.current_price.toFixed(2)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Contacts List Modal */}
        <Modal visible={showContactsList} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Contact</Text>
                <TouchableOpacity onPress={() => setShowContactsList(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                {recentContacts.map((contact) => (
                  <TouchableOpacity key={contact.id} style={styles.contactModalItem} onPress={() => selectContact(contact)}>
                    <View style={styles.contactModalAvatar}>
                      <Text style={styles.contactModalAvatarText}>{contact.avatar}</Text>
                    </View>
                    <View style={styles.contactModalInfo}>
                      <Text style={styles.contactModalName}>{contact.name}</Text>
                      <Text style={styles.contactModalAddress}>{contact.address}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#000'},
  header:{paddingHorizontal:20,paddingVertical:20},
  headerTitle:{color:'#fff',fontSize:32,fontWeight:'bold'},
  typeSelector:{flexDirection:'row',paddingHorizontal:20,marginBottom:24,gap:12},
  typeButton:{flex:1,paddingVertical:12,borderRadius:12,backgroundColor:'#1a1a1a',alignItems:'center'},
  typeButtonActive:{backgroundColor:'#00d4aa'},
  typeButtonText:{color:'#9ca3af',fontSize:16,fontWeight:'600'},
  typeButtonTextActive:{color:'#000'},
  contentSection:{paddingHorizontal:20},
  label:{color:'#9ca3af',fontSize:14,marginBottom:8,fontWeight:'500'},
  coinSelector:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:'#1a1a1a',padding:16,borderRadius:12},
  coinSelectorLeft:{flexDirection:'row',alignItems:'center',gap:12},
  coinImage:{width:40,height:40,borderRadius:20},
  coinName:{color:'#fff',fontSize:16,fontWeight:'600'},
  coinSymbol:{color:'#9ca3af',fontSize:14},
  arrow:{color:'#9ca3af',fontSize:24},
  addressInputContainer:{flexDirection:'row',alignItems:'center',gap:8,marginTop:8},
  addressInput:{flex:1,backgroundColor:'#1a1a1a',borderRadius:12,paddingHorizontal:16,paddingVertical:14,color:'#fff',fontSize:14},
  iconButton:{backgroundColor:'#1a1a1a',width:48,height:48,borderRadius:12,justifyContent:'center',alignItems:'center'},
  amountContainer:{flexDirection:'row',alignItems:'center',backgroundColor:'#1a1a1a',borderRadius:12,paddingHorizontal:16,marginTop:8},
  amountInput:{flex:1,color:'#fff',fontSize:24,fontWeight:'bold',paddingVertical:14},
  sendButton:{marginTop:24},
  sendButtonGradient:{paddingVertical:16,borderRadius:12,alignItems:'center'},
  sendButtonText:{color:'#000',fontSize:18,fontWeight:'bold'},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.8)',justifyContent:'flex-end'},
  modalContent:{backgroundColor:'#1a1a1a',borderTopLeftRadius:24,borderTopRightRadius:24,paddingBottom:40,maxHeight:'80%'},
  modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:20,paddingVertical:20,borderBottomWidth:1,borderBottomColor:'#2a2a2a'},
  modalTitle:{color:'#fff',fontSize:20,fontWeight:'600'},
  modalClose:{color:'#9ca3af',fontSize:28},
  coinModalItem:{flexDirection:'row',alignItems:'center',paddingHorizontal:20,paddingVertical:16,borderBottomWidth:1,borderBottomColor:'#2a2a2a'},
  coinModalImage:{width:40,height:40,borderRadius:20,marginRight:12},
  coinModalInfo:{flex:1},
  coinModalName:{color:'#fff',fontSize:16,fontWeight:'600'},
  coinModalSymbol:{color:'#9ca3af',fontSize:14},
  coinModalPrice:{color:'#fff',fontSize:16,fontWeight:'600'},
  contactModalItem:{flexDirection:'row',alignItems:'center',paddingHorizontal:20,paddingVertical:16,borderBottomWidth:1,borderBottomColor:'#2a2a2a'},
  contactModalAvatar:{width:48,height:48,borderRadius:24,backgroundColor:'#00d4aa',justifyContent:'center',alignItems:'center',marginRight:12},
  contactModalAvatarText:{color:'#000',fontSize:18,fontWeight:'bold'},
  contactModalInfo:{flex:1},
  contactModalName:{color:'#fff',fontSize:16,fontWeight:'600'},
  contactModalAddress:{color:'#9ca3af',fontSize:14},
});
