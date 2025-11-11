// Input validation utilities

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEmail = (email: string): ValidationError | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Invalid email address' };
  }
  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { field: 'password', message: 'Password must contain uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { field: 'password', message: 'Password must contain lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { field: 'password', message: 'Password must contain number' };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { field: 'password', message: 'Password must contain special character (!@#$%^&*)' };
  }
  return null;
};

export const validateWalletAddress = (address: string): ValidationError | null => {
  // Ethereum address format (0x + 40 hex characters)
  const ethereumRegex = /^0x[a-fA-F0-9]{40}$/;
  
  // Bitcoin address formats
  const bitcoinP2PKH = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const bitcoinP2SH = /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const bitcoinBech32 = /^bc1[a-z0-9]{39,59}$/;
  
  if (!address) {
    return { field: 'address', message: 'Wallet address is required' };
  }

  if (!ethereumRegex.test(address) && 
      !bitcoinP2PKH.test(address) && 
      !bitcoinP2SH.test(address) && 
      !bitcoinBech32.test(address)) {
    return { field: 'address', message: 'Invalid wallet address format' };
  }

  return null;
};

export const validateAmount = (
  amount: string | number,
  min: number = 0,
  max: number = Infinity,
  decimals: number = 8
): ValidationError | null => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return { field: 'amount', message: 'Amount must be a valid number' };
  }

  if (num <= 0) {
    return { field: 'amount', message: 'Amount must be greater than 0' };
  }

  if (num < min) {
    return { field: 'amount', message: `Amount must be at least ${min}` };
  }

  if (num > max) {
    return { field: 'amount', message: `Amount cannot exceed ${max}` };
  }

  // Check decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > decimals) {
    return { field: 'amount', message: `Amount cannot have more than ${decimals} decimal places` };
  }

  return null;
};

export const validateTransferAmount = (
  amount: string,
  userBalance: number
): ValidationError | null => {
  const amountError = validateAmount(amount, 0, userBalance, 8);
  if (amountError) {
    if (parseFloat(amount) > userBalance) {
      return { field: 'amount', message: `Insufficient balance. Available: ${userBalance}` };
    }
    return amountError;
  }
  return null;
};

export const sanitizeInput = (input: string): string => {
  // Remove any HTML/script tags
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>\"']/g, '')
    .trim();
};

export const validateName = (name: string): ValidationError | null => {
  if (!name || name.trim().length === 0) {
    return { field: 'name', message: 'Name cannot be empty' };
  }

  if (name.length > 100) {
    return { field: 'name', message: 'Name cannot exceed 100 characters' };
  }

  if (!/^[a-zA-Z\s\-']*$/.test(name)) {
    return { field: 'name', message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return null;
};

export const validateMemo = (memo: string, maxLength: number = 500): ValidationError | null => {
  if (memo && memo.length > maxLength) {
    return { field: 'memo', message: `Memo cannot exceed ${maxLength} characters` };
  }
  return null;
};

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
};

export const formatCryptoAmount = (value: number, decimals: number = 8): string => {
  return value.toFixed(decimals).replace(/\.?0+$/, '');
};
