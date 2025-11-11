# Critical Fixes Implementation Guide

## Quick Start

This guide shows you how to fix the critical issues in the HNGCoin app.

---

## Fix 1: Fix Routing Issues

### Problem
- Sign-in redirects to non-existent `/dashboard` route
- Duplicate home screens (`index.tsx` and `home.tsx`)

### Solution

**File: `app/(auth)/sign-in.tsx`** - Line ~37
```tsx
// ❌ BEFORE
if (createdSessionId) {
  await setActive({ session: createdSessionId });
  router.push('/dashboard'); // WRONG!
}

// ✅ AFTER
if (createdSessionId) {
  await setActive({ session: createdSessionId });
  router.push('/(home)/index'); // CORRECT!
}
```

**File: `app/(auth)/sign-up.tsx`** - Line ~7
```tsx
// ❌ BEFORE
<SignUp
  afterSignUpUrl="/dashboard" // WRONG!
  routing="path"
  path="/(auth)/sign-up"
/>

// ✅ AFTER
<SignUp
  afterSignUpUrl="/(home)/index" // CORRECT!
  routing="path"
  path="/(auth)/sign-up"
/>
```

**Delete:** `app/(home)/home.tsx` (keep only `index.tsx`)

---

## Fix 2: Remove Hardcoded Portfolio Data

### Problem
Portfolio amounts are hardcoded to specific values. Should be dynamic from API/database.

### Solution

**File: `app/(home)/index.tsx`** - Replace the entire `calculatePortfolioBalance` and `calculatePortfolioChange` functions:

```tsx
// ✅ AFTER - Use actual portfolio data structure
const calculatePortfolioBalance = () => {
  // Instead of hardcoded amounts, fetch from user portfolio
  if (!portfolioData.length) return '0.00';
  
  // This should come from a context/store with user's actual holdings
  // For now, fetch from an API endpoint:
  // GET /api/portfolio/holdings
  
  let total = 0;
  // Your real portfolio data logic here
  return total.toFixed(2);
};
```

### To Implement Properly:

1. Create a `PortfolioContext` (see context files below)
2. Fetch user portfolio from backend API
3. Store in context
4. Use throughout app

---

## Fix 3: Add Input Validation to Transfer Screen

### Problem
No validation on wallet addresses, amounts, or memo fields

### Solution

**File: `app/(home)/transfer.tsx`** - Import and use validation utilities:

```tsx
// ✅ ADD AT TOP
import {
  validateWalletAddress,
  validateAmount,
  validateTransferAmount,
  sanitizeInput,
  ValidationError,
} from '../utils/validation';

// ✅ UPDATE sendHandler
const handleSend = () => {
  // Validate recipient address
  const addressError = validateWalletAddress(recipientAddress);
  if (addressError) {
    Alert.alert('Invalid Address', addressError.message);
    return;
  }

  // Validate amount
  const amountError = validateAmount(amount, 0, selectedCoin?.current_price);
  if (amountError) {
    Alert.alert('Invalid Amount', amountError.message);
    return;
  }

  // Validate memo if provided
  if (memo) {
    const memoError = validateMemo(memo);
    if (memoError) {
      Alert.alert('Invalid Memo', memoError.message);
      return;
    }
  }

  // Sanitize inputs
  const cleanAddress = sanitizeInput(recipientAddress);
  const cleanMemo = sanitizeInput(memo);

  Alert.alert(
    'Confirm Transaction',
    `Send ${amount} ${selectedCoin?.symbol.toUpperCase()} to ${cleanAddress}?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          // Submit transaction
          Alert.alert('Success', 'Transaction sent!');
          setAmount('');
          setRecipientAddress('');
          setMemo('');
        },
      },
    ]
  );
};
```

---

## Fix 4: Add Error Boundaries

### Problem
App crashes aren't handled gracefully

### Solution

**File: `app/_layout.tsx`** - Wrap with ErrorBoundary:

```tsx
// ✅ ADD IMPORT
import ErrorBoundary from './components/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        tokenCache={tokenCache}
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </ClerkProvider>
    </ErrorBoundary>
  );
}
```

---

## Fix 5: Improve API Error Handling

### Problem
API failures are silent, user doesn't know what's wrong

### Solution

**File: `app/(home)/index.tsx`** - Update fetch functions:

```tsx
// ✅ BEFORE
const fetchCryptoData = async () => {
  try {
    const response = await fetch('...');
    const data = await response.json();
    setCryptoData(data);
  } catch (error) {
    console.error('Error fetching crypto data:', error); // Silent!
  } finally {
    setLoading(false);
  }
};

// ✅ AFTER
const [error, setError] = useState<string | null>(null);

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
    Alert.alert('Error', message);
  } finally {
    setLoading(false);
  }
};

// ✅ RENDER ERROR
{error && (
  <View style={styles.errorBanner}>
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity onPress={fetchCryptoData}>
      <Text style={styles.retryText}>Retry</Text>
    </TouchableOpacity>
  </View>
)}
```

---

## Fix 6: Stop Excessive API Polling

### Problem
Transfer screen fetches every 5 seconds - wasteful and bad UX

### Solution

**File: `app/(home)/transfer.tsx`** - Line ~55:

```tsx
// ❌ BEFORE
useEffect(() => {
  fetchCryptoData();
  const interval = setInterval(fetchCryptoData, 5000); // BAD!
  return () => clearInterval(interval);
}, []);

// ✅ AFTER - Fetch on mount only, add refresh button
useEffect(() => {
  fetchCryptoData();
  // NO interval!
}, []);

// ✅ ADD refresh button
<TouchableOpacity onPress={fetchCryptoData} style={styles.refreshButton}>
  <Text>🔄 Refresh</Text>
</TouchableOpacity>
```

---

## Fix 7: Add Password Validation

### Problem
Password validation only checks length, not strength

### Solution

**File: `app/(home)/settings.tsx`** - Import and use validation:

```tsx
import { validatePassword } from '../utils/validation';

const handleChangePassword = () => {
  // Validate current password (in real app, verify with backend)
  if (!currentPassword) {
    Alert.alert('Error', 'Current password is required');
    return;
  }

  // Validate new password strength
  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    Alert.alert('Error', passwordError.message);
    return;
  }

  if (newPassword !== confirmPassword) {
    Alert.alert('Error', 'Passwords do not match');
    return;
  }

  // Call backend API to change password
  Alert.alert('Success', 'Password changed successfully');
  setShowChangePassword(false);
  setCurrentPassword('');
  setNewPassword('');
  setConfirmPassword('');
};
```

---

## Fix 8: Implement Basic Context (Portfolio)

### Problem
Portfolio data is duplicated and hardcoded across screens

### Solution

**Create: `app/context/PortfolioContext.tsx`**

```tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Portfolio, PortfolioHolding } from '../types/crypto';
import cryptoApi from '../api/crypto';

interface PortfolioContextType {
  portfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
}

export const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's portfolio from API
      // GET /api/portfolio (your backend endpoint)
      // For now, fetch crypto prices and calculate manually
      const cryptos = await cryptoApi.getCryptosByIds(['bitcoin', 'ethereum', 'cardano']);

      // Mock portfolio structure
      const holdings: PortfolioHolding[] = [
        {
          coinId: 'bitcoin',
          symbol: 'BTC',
          amount: 0.15,
          averageBuyPrice: 30000,
          currentValue: (cryptos[0]?.current_price || 0) * 0.15,
        },
        {
          coinId: 'ethereum',
          symbol: 'ETH',
          amount: 0.5,
          averageBuyPrice: 1500,
          currentValue: (cryptos[1]?.current_price || 0) * 0.5,
        },
        {
          coinId: 'cardano',
          symbol: 'ADA',
          amount: 1000,
          averageBuyPrice: 0.5,
          currentValue: (cryptos[2]?.current_price || 0) * 1000,
        },
      ];

      const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
      const totalChange = holdings.reduce(
        (sum, h, i) => sum + (cryptos[i]?.price_change_percentage_24h || 0),
        0
      ) / holdings.length;

      setPortfolio({
        userId: 'current-user-id',
        totalValue,
        totalChange,
        holdings,
        lastUpdated: new Date(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load portfolio';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPortfolio();
  }, []);

  return (
    <PortfolioContext.Provider value={{ portfolio, loading, error, refreshPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = React.useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
};
```

**Then use in components:**

```tsx
// In app/(home)/index.tsx
import { usePortfolio } from '../context/PortfolioContext';

export default function Home() {
  const { portfolio, loading, error, refreshPortfolio } = usePortfolio();

  const portfolioBalance = portfolio?.totalValue.toFixed(2) || '0.00';
  const portfolioChange = portfolio?.totalChange.toFixed(2) || '0.00';

  // ... rest of component
}
```

---

## Fix 9: Enable Charts Screen

### Problem
Charts screen is commented out - missing dependency

### Solution

**Install dependency:**
```bash
npm install react-native-svg-charts
```

**File: `app/(home)/charts.tsx`** - Uncomment the code

Then fix the import:
```tsx
// The file already has the code - just uncomment it
```

---

## Fix 10: Fix Sign-Out Navigation

### Problem
Sign-out navigates to wrong route

### Solution

**File: `app/(auth)/signout.tsx`** - Line ~11:

```tsx
// ❌ BEFORE
const handleSignOut = async () => {
  await signOut();
  router.replace("/(auth)/signin"); // Wrong route name
};

// ✅ AFTER
const handleSignOut = async () => {
  await signOut();
  router.replace("/(auth)/sign-in"); // Correct route name
};
```

---

## Implementation Priority

1. **CRITICAL (Do first):**
   - [ ] Fix routing issues (Fix 1)
   - [ ] Add input validation (Fix 3)
   - [ ] Add error boundaries (Fix 4)

2. **IMPORTANT (Do next):**
   - [ ] Improve API error handling (Fix 5)
   - [ ] Stop excessive polling (Fix 6)
   - [ ] Remove hardcoded data (Fix 2)

3. **GOOD TO HAVE:**
   - [ ] Add password validation (Fix 7)
   - [ ] Implement contexts (Fix 8)
   - [ ] Enable charts (Fix 9)

---

## Testing After Fixes

### Manual Testing:
1. [ ] Test sign-in flow completes without errors
2. [ ] Test sign-up redirects correctly
3. [ ] Test transfer with invalid address → shows error
4. [ ] Test transfer with valid data → accepts
5. [ ] Test portfolio loads and displays correctly
6. [ ] Test settings page saves preferences

### Error Testing:
1. [ ] Turn off WiFi, try to fetch data → shows error
2. [ ] Enter invalid wallet address → shows validation error
3. [ ] Enter invalid amount → shows validation error
4. [ ] Test app doesn't crash on API error

---

## Next Steps

After implementing these fixes:

1. **Add Backend APIs** for:
   - User portfolio management
   - Transaction submission
   - User preferences persistence
   - Settings updates

2. **Implement Redux or Zustand** for complex state management

3. **Add Persistent Storage** with:
   - AsyncStorage for preferences
   - Encrypted storage for sensitive data

4. **Add Testing** with Jest and React Native Testing Library

5. **Deploy to production** after UAT

---

## Files Created (Reference)

The following utility files have been created to help with fixes:

- `app/utils/validation.ts` - Input validation functions
- `app/utils/errors.ts` - Error handling classes
- `app/components/ErrorBoundary.tsx` - Error boundary component
- `app/api/client.ts` - API client with caching
- `app/api/crypto.ts` - CoinGecko API functions
- `app/types/crypto.ts` - TypeScript types

Use these in your fixes!

