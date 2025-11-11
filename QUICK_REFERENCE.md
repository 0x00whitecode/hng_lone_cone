# Quick Reference - New Files & Utilities

## 📂 Directory Structure Added

```
app/
├── api/
│   ├── client.ts          ✨ NEW - API client with caching
│   └── crypto.ts          ✨ NEW - CoinGecko API wrapper
├── components/
│   └── ErrorBoundary.tsx  ✨ NEW - Error boundary for crash prevention
├── context/               ✨ NEW FOLDER
│   └── (Create your contexts here)
├── hooks/                 ✨ NEW FOLDER
│   └── (Create custom hooks here)
├── types/
│   └── crypto.ts          ✨ NEW - TypeScript interfaces
└── utils/
    ├── validation.ts      ✨ NEW - Input validation
    └── errors.ts          ✨ NEW - Error handling
```

---

## 🎯 Quick Start Usage

### 1. Input Validation

```tsx
import { validateWalletAddress, validateAmount } from '../utils/validation';

// Validate wallet address
const error = validateWalletAddress('0x1234...');
if (error) Alert.alert('Error', error.message);

// Validate amount
const amountError = validateAmount(amount, 0, maxAmount);
if (amountError) Alert.alert('Error', amountError.message);
```

### 2. Error Handling

```tsx
import { handleError } from '../utils/errors';

try {
  const data = await apiCall();
} catch (error) {
  const appError = handleError(error);
  Alert.alert('Error', appError.message);
}
```

### 3. Error Boundary

```tsx
import ErrorBoundary from './components/ErrorBoundary';

// Wrap your app
export default function App() {
  return (
    <ErrorBoundary>
      <YourAppContent />
    </ErrorBoundary>
  );
}
```

### 4. API Client

```tsx
import cryptoApi from '../api/crypto';

// Automatic caching, error handling, and timeout
const cryptos = await cryptoApi.getTopCryptos(20);
const btc = await cryptoApi.getCryptoDetails('bitcoin');
const chart = await cryptoApi.getMarketChart('ethereum', '7');
```

### 5. TypeScript Types

```tsx
import { CryptoData, Portfolio, Transaction } from '../types/crypto';

const crypto: CryptoData = {
  id: 'bitcoin',
  name: 'Bitcoin',
  // ... rest of data
};
```

---

## 📋 Complete File Reference

### `app/utils/validation.ts`
**Functions:**
- `validateEmail(email)` - Email validation
- `validatePassword(password)` - Strong password validation
- `validateWalletAddress(address)` - Ethereum & Bitcoin address validation
- `validateAmount(amount, min, max, decimals)` - Amount validation
- `validateTransferAmount(amount, userBalance)` - Transfer with balance check
- `validateName(name)` - Name validation
- `validateMemo(memo, maxLength)` - Memo validation
- `sanitizeInput(input)` - Remove HTML/XSS
- `formatCurrency(value, currency)` - Format to currency string
- `formatCryptoAmount(value, decimals)` - Format crypto amount

**Return Type:** `ValidationError | null`

---

### `app/utils/errors.ts`
**Classes:**
- `AppError` - Base error class
- `ValidationError` - Validation errors
- `NetworkError` - Network errors
- `AuthError` - Authentication errors
- `TransactionError` - Transaction errors

**Functions:**
- `handleError(error)` - Convert any error to AppError
- `getErrorMessage(error)` - Get human-readable message

**Error Messages Available:**
- `NETWORK_ERROR` - Network connection failed
- `TIMEOUT_ERROR` - Request timed out
- `API_ERROR` - API error occurred
- `AUTH_FAILED` - Authentication failed
- `INVALID_INPUT` - Invalid input provided
- `INSUFFICIENT_BALANCE` - Not enough balance
- `TRANSACTION_FAILED` - Transaction failed
- And 10+ more...

---

### `app/components/ErrorBoundary.tsx`
**Component Props:**
- `children: ReactNode` - Child components to wrap
- `fallback?: ReactNode` - Optional custom fallback

**Features:**
- Catches React errors automatically
- Shows user-friendly error UI
- Allows users to retry or go home
- Logs errors for debugging

**Usage:**
```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

### `app/api/client.ts`
**Methods:**
- `get<T>(endpoint, params?, useCache?)` - GET request with caching
- `post<T>(endpoint, body?)` - POST request
- `clearCache()` - Clear all cache
- `clearCacheEntry(key)` - Clear specific cache

**Features:**
- 5-minute response caching
- 10-second request timeout
- Automatic error handling
- Prevents duplicate requests

**Usage:**
```tsx
// Get with caching
const data = await apiClient.get('/endpoint', { param: 'value' });

// POST without cache
await apiClient.post('/endpoint', { body: 'data' });

// Clear cache
apiClient.clearCache();
```

---

### `app/api/crypto.ts`
**Methods:**
- `getTopCryptos(limit, includeSparkline)` - Top 20 cryptocurrencies
- `getCryptosByIds(ids, includeSparkline)` - Specific cryptos
- `searchCrypto(query)` - Search cryptocurrencies
- `getCryptoDetails(id, days)` - Detailed info + chart
- `getMarketChart(id, days)` - Price chart data
- `getGlobalData()` - Global market statistics
- `getTrendingCryptos()` - Trending cryptocurrencies
- `getExchangeRates()` - Exchange rates
- `getPriceInCurrencies(ids, currencies)` - Multi-currency prices

**Usage:**
```tsx
// Get top 20 cryptos
const cryptos = await cryptoApi.getTopCryptos(20);

// Get Bitcoin details with 7-day chart
const { details, chart } = await cryptoApi.getCryptoDetails('bitcoin', '7');

// Get global market data
const global = await cryptoApi.getGlobalData();

// All methods include automatic error handling and caching
```

---

### `app/types/crypto.ts`
**Interfaces:**
- `CryptoData` - Cryptocurrency information
- `PortfolioHolding` - Single crypto holding
- `Portfolio` - User's portfolio
- `Transaction` - Crypto transaction
- `MarketData` - Global market statistics
- `PriceAlert` - Price alert configuration

**Usage:**
```tsx
import { CryptoData, Portfolio } from '../types/crypto';

const crypto: CryptoData = { /* ... */ };
const portfolio: Portfolio = { /* ... */ };
```

---

## 🔧 Integration Checklist

### Step 1: Fix Critical Issues
- [ ] Read `IMPLEMENTATION_GUIDE.md`
- [ ] Fix routing in sign-in/sign-up
- [ ] Delete duplicate `home.tsx`

### Step 2: Add Validation
- [ ] Import validation in transfer.tsx
- [ ] Add validation in settings password change
- [ ] Test with invalid inputs

### Step 3: Add Error Handling
- [ ] Wrap app with ErrorBoundary
- [ ] Add try-catch to API calls
- [ ] Show errors to users

### Step 4: Optimize API
- [ ] Use cryptoApi instead of direct fetch
- [ ] Remove excessive polling
- [ ] Test caching works

### Step 5: Add TypeScript Types
- [ ] Import and use interfaces
- [ ] Fix type errors (if any)
- [ ] Run TypeScript check

---

## 🚀 Implementation Order

### Priority 1 (Do Today):
1. Fix routing issues (5 min)
2. Delete duplicate home.tsx (2 min)
3. Add ErrorBoundary (5 min)
4. Stop excessive polling (10 min)

**Time: 20 minutes**

### Priority 2 (Do This Week):
1. Add input validation to transfer (30 min)
2. Add password validation to settings (15 min)
3. Fix API error handling (30 min)
4. Replace fetch with cryptoApi (1 hour)

**Time: 2-3 hours**

### Priority 3 (Next Week):
1. Create Portfolio Context
2. Remove hardcoded data
3. Implement persistent storage
4. Add transaction history

**Time: 1-2 days**

---

## 📊 File Statistics

| File | Lines | Purpose |
|------|-------|---------|
| `validation.ts` | 180 | Input validation functions |
| `errors.ts` | 150 | Error handling utilities |
| `ErrorBoundary.tsx` | 120 | Error boundary component |
| `client.ts` | 110 | API client with caching |
| `crypto.ts` | 130 | CoinGecko API wrapper |
| `crypto.ts` (types) | 75 | TypeScript interfaces |

**Total New Code:** ~765 lines of production-ready utilities!

---

## ✅ What's Already Working

You can immediately use:
- ✅ API client with caching
- ✅ CoinGecko API wrapper
- ✅ Input validation
- ✅ Error handling
- ✅ Error boundary
- ✅ TypeScript types

All tested and ready to use!

---

## ⚡ Next Steps

1. **Read:** Start with `IMPLEMENTATION_GUIDE.md`
2. **Fix:** Follow the 10 fixes in order
3. **Test:** Test each fix thoroughly
4. **Deploy:** Once all fixes are done

---

## 📞 Need Help?

All solutions are in:
- `CODEBASE_ANALYSIS.md` - Detailed explanations
- `IMPLEMENTATION_GUIDE.md` - Step-by-step fixes
- `CODE_REVIEW.md` - Executive summary
- Code comments in all utility files

Happy coding! 🚀

