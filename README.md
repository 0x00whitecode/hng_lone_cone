# HNG Lone Cone – Cryptocurrency Wallet Mobile App

A modern, secure, and user-friendly cryptocurrency wallet application built with React Native and Expo. HNG Lone Cone provides real-time market data, portfolio tracking, and seamless crypto transactions all in one place.

---

## 📱 Overview

**HNG Lone Cone** is a full-featured mobile wallet that empowers users to:

-  **Track Cryptocurrencies** – Browse live market data for 100+ cryptocurrencies with real-time price updates and charts
-  **Manage Portfolio** – Monitor holdings, track portfolio balance, and visualize gains/losses
-  **Send & Receive** – Securely send, receive, and swap cryptocurrencies
-  **Analyze Markets** – View market statistics, trending coins, and personalized insights
-  **Secure Storage** – Industry-standard encryption with biometric authentication and PIN protection
-  **Dark Mode** – Native dark/light theme support with persistent user preferences


**Target Platforms:** Android, iOS, Web  
**Development Track:** HNG Internship – Mobile Development

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native 0.81.5 + Expo 54.0.23 |
| **Navigation** | Expo Router 6.0.14 (file-based routing) |
| **Language** | TypeScript 5.9.2 |
| **State Management** | React Context API + Hooks |
| **Authentication** | Clerk (commented out in dev; ready for production) |
| **Secure Storage** | expo-secure-store, AsyncStorage |
| **UI Components** | React Native built-ins, expo-linear-gradient |
| **Icons** | @expo/vector-icons (Material, Feather, Ionicons) |
| **Charts & Visualization** | react-native-svg |
| **API Integration** | CoinGecko REST API (free tier) |
| **Build Tool** | EAS (Expo Application Services) |

---

##  Project Structure

```
hng_lone_cone/
├── app/                              # Main app logic (Expo Router)
│   ├── _layout.tsx                   # Root layout with ErrorBoundary & Theme
│   ├── index.tsx                     # Splash screen / initial route
│   ├── (auth)/                       # Auth routes (sign-in, sign-up, sign-out)
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── signout.tsx
│   ├── (home)/                       # Main app tab screens
│   │   ├── _layout.tsx               # Tab navigation layout
│   │   ├── index.tsx                 # Home: Portfolio & Markets Dashboard
│   │   ├── charts.tsx                # Charts: Placeholder (Coming Soon)
│   │   ├── transfer.tsx              # Transfer: Send/Receive/Swap UI
│   │   ├── stats.tsx                 # Stats: Global Market & Portfolio Analytics
│   │   └── settings.tsx              # Settings: Preferences & Account Management
│   ├── api/
│   │   ├── client.ts                 # Centralized API client with retry/backoff logic
│   │   └── crypto.ts                 # Crypto-specific API methods
│   ├── components/
│   │   ├── CustomTabBar.tsx          # Bottom tab bar with custom styling
│   │   ├── ErrorBoundary.tsx         # Error boundary for graceful error handling
│   │   └── SignOutButton.tsx         # Reusable sign-out button
│   ├── context/
│   │   └── ThemeContext.tsx          # Global theme (dark/light) provider
│   ├── constants/
│   │   └── colors.ts                 # Color palettes (light & dark themes)
│   ├── types/
│   │   └── crypto.ts                 # TypeScript interfaces for crypto data
│   ├── utils/
│   │   ├── errors.ts                 # Error handling & custom error classes
│   │   ├── navigation.ts             # Navigation routes & helper class
│   │   └── validation.ts             # Input validation & sanitization utilities
│   └── hooks/                        # Custom React hooks (expandable)
├── assets/
│   └── images/                       # App icons, splash screen, logos
├── app.json                          # Expo configuration (metadata, plugins, builds)
├── eas.json                          # EAS build configuration
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── eslint.config.js                  # ESLint rules
├── expo-env.d.ts                     # Expo type definitions
└── README.md                         # This file
```

---

##  Getting Started

### Prerequisites

- **Node.js** ≥ 18.x (with npm or yarn)
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** / **Xcode** (for native toolchains)
- **EAS CLI** (optional, for cloud builds: `npm install -g eas-cli`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/0x00whitecode/hng_lone_cone.git
   cd hng_lone_cone
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Metro bundler (local development):**
   ```bash
   npm start
   ```

4. **Run on Android emulator/device:**
   ```bash
   npx expo run:android
   ```

5. **Run on iOS simulator (macOS only):**
   ```bash
   npx expo run:ios
   ```

6. **Run on web (browser):**
   ```bash
   npx expo run:web
   ```

---

##  Environment Variables

Create a `.env.local` file in the project root (not committed to git). Required variables:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
EXPO_PUBLIC_API_BASE_URL=https://api.coingecko.com/api/v3
```

**Note:** During local/dev testing, Clerk initialization is commented out. To re-enable:
- Uncomment the `ClerkProvider` import in `app/_layout.tsx`
- Provide valid Clerk keys in `.env.local`

---

##  Architecture & Key Systems

### 1. **Routing (Expo Router)**

File-based routing automatically creates native navigation from files in `app/`:

```
app/(auth)/sign-in.tsx      → /(auth)/sign-in
app/(home)/index.tsx        → /(home) or /(home)/index
app/(home)/charts.tsx       → /(home)/charts
```

Route groups (parentheses) organize screens without appearing in URLs.

### 2. **API Client & Error Handling**

**`app/api/client.ts`** provides centralized HTTP management:

- **Timeout:** 10 seconds per request
- **Caching:** 5-minute TTL for GET requests
- **Retry Strategy:** Up to 2 retries for transient errors (5xx, 429, network timeouts)
- **Exponential Backoff:** 200ms × 2^attempt between retries
- **Error Conversion:** All errors → `AppError` instances with user-friendly messages

```typescript
// Usage
const data = await apiClient.get('/coins/markets', {
  vs_currency: 'usd',
  per_page: 20,
});
```

### 3. **State Management**

- **Global:** React Context (`ThemeContext`) for dark/light mode
- **Local:** `useState` hooks within components for UI state
- **Persistent:** `expo-secure-store` for sensitive data (auth tokens, passwords)

### 4. **Theme System**

`ThemeContext` provides:

- Color palette (light/dark)
- Status bar styling
- Persistent dark-mode preference via SecureStore
- Real-time toggle without app reload

```typescript
const { colors, isDark, setIsDark } = useTheme();
```

### 5. **Validation & Sanitization**

Utility functions in `app/utils/validation.ts`:

- `validateEmail()` – RFC 5322 compliant email validation
- `validatePassword()` – Min 8 chars, mixed case, number, symbol
- `validateWalletAddress()` – Hex address format checking
- `validateAmount()` – Numeric range validation
- `sanitizeInput()` – XSS prevention via string trimming/escaping

---

## 📲 Core Screens

### **Home Screen** (`app/(home)/index.tsx`)

- Displays user greeting with avatar
- Portfolio balance card with 24h change %
- Scrollable portfolio holdings (BTC, ETH, ADA) with mini charts
- Refer rewards banner
- Market statistics filter (Hot, Profit, Loss, Rising, Top Gain)
- Real-time crypto market list with sparkline charts
- Coin detail modal with full price history chart

**Key Features:**
- Fetches from CoinGecko API with retry/backoff
- Handles loading and error states gracefully
- Tap coin to drill down into detailed price chart

### **Transfer Screen** (`app/(home)/transfer.tsx`)

- Tab selector: Send / Receive / Swap
- **Send Tab:** Select coin → Enter recipient address → Confirm transaction
- **Receive Tab:** Show user's wallet address QR code
- **Swap Tab:** Select from/to coins → Enter amount → Preview conversion rate
- Recent contacts quick-access
- Modal coin picker with live price display
- Validation & error alerts

### **Stats Screen** (`app/(home)/stats.tsx`)

- Global market cap, 24h volume, BTC dominance
- Market cap distribution donut chart
- Portfolio performance metrics
- Top gainers & losers
- Recently added coins

### **Settings Screen** (`app/(home)/settings.tsx`)

- Profile section: Edit name/email, view avatar
- Account: Personal info, change password, 2FA, connected devices
- Preferences: Currency, language, dark mode toggle
- Notifications: Push, price alerts, email updates
- Security: Biometric auth, PIN, activity log
- Danger zone: Logout, delete account

### **Charts Screen** (`app/(home)/charts.tsx`)

- Placeholder "Coming Soon" component
- Reserved for advanced charting functionality



##  API Integration

### CoinGecko API

The app uses the **free tier** of CoinGecko's REST API for:

- Market data (prices, 24h changes, market cap)
- Historical price charts (1d, 7d, 30d, 1y)
- Global market statistics
- Trending coins

**Base URL:** `https://api.coingecko.com/api/v3`

**Key Endpoints:**
- `GET /coins/markets` – List cryptocurrencies with market data
- `GET /coins/{id}/market_chart` – Historical price data
- `GET /global` – Global market data

### Error Handling

All API errors are caught and converted to `AppError` with friendly messages:

```
NetworkError → "Network connection lost. Please check your internet."
TimeoutError → "Request took too long. Please try again."
HTTP 5xx → "Server error. Please try again later."
HTTP 429 → "Too many requests. Retrying automatically..."
```

---

## 🧪 Testing

Currently no automated tests are configured. To add:

1. **Unit Tests (Jest):**
   ```bash
   npm install --save-dev jest @testing-library/react-native
   ```
   - Test validation functions
   - Test API client retry logic
   - Test state management

2. **E2E Tests (Detox):**
   ```bash
   npm install --save-dev detox detox-cli
   ```
   - Test navigation flows
   - Test form submissions
   - Test error recovery

---

## 🚢 Building & Deployment

### Local Build (Android)

```bash
npx expo prebuild --clean
npx react-native build-android
```

### EAS Cloud Build (Recommended)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login & configure:**
   ```bash
   eas login
   eas build:configure
   ```

3. **Build for Android:**
   ```bash
   eas build -p android --profile preview
   ```

4. **Build for iOS:**
   ```bash
   eas build -p ios --profile preview
   ```

5. **Submit to stores (coming soon):**
   ```bash
   eas submit -p android
   ```

### Configuration

See `eas.json` for build profiles:
- `preview` – Development/testing builds
- `production` – App Store/Play Store releases

---

## 📋 Implemented Features Checklist

- ✅ Splash screen with animated logo
- ✅ Multi-tab navigation (Home, Charts, Transfer, Stats, Settings)
- ✅ Real-time crypto market data fetching
- ✅ Portfolio balance tracking (static holdings for demo)
- ✅ Coin detail view with price charts
- ✅ Send/Receive/Swap transaction UI
- ✅ Global market statistics dashboard
- ✅ Dark/Light theme with persistent preference
- ✅ Settings with profile, security, notifications
- ✅ Input validation & sanitization
- ✅ Centralized error handling with retry/backoff
- ✅ Graceful error boundaries
- ✅ Comment-out Clerk for local dev testing

---



### Code Standards

- Use **TypeScript** for all new code (no `any` unless absolutely necessary)
- Follow **ESLint** rules: `npm run lint`
- Write **descriptive** commit messages
- Add **comments** for complex logic
- Test on both Android & iOS before submitting PR

---

## 📞 Support & Contact

- **Issues:** Open a GitHub issue for bugs or feature requests
- **Email:** x10tion007@gmail.com


---

##  License

This project is part of the **HNG Internship** program. All rights reserved.

---

##  Acknowledgments

- **Expo Team** – Exceptional React Native framework
- **CoinGecko** – Free cryptocurrency market data API
- **HNG Internship** – Amazing opportunity and mentorship
- **Community** – Open-source contributors and testers

---

##  Project Metadata

| Item | Value |
|------|-------|
| App Name | HNG Lone Cone |
| Version | 1.0.0 |
| Package | com.hngcoin.app |
| Repository | github.com/0x00whitecode/hng_lone_cone |
| EAS Project ID | 3d2d670c-a1d4-4088-98d1-95deaeea0a3e |
| Platforms | Android, iOS, Web |
| Min Node Version | 18.0.0 |
| React Native Version | 0.81.5 |
| Expo Version | 54.0.23 |

---

**Last Updated:** November 14, 2025  
**Maintainer:** @0x00whitecode
