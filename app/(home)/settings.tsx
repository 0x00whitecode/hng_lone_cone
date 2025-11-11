// Settings.tsx
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { sanitizeInput, validateEmail, validateName, validatePassword } from '../utils/validation';

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const { colors, isDark, setIsDark } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('English');

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [editName, setEditName] = useState(user?.firstName || '');
  const [editEmail, setEditEmail] = useState(user?.emailAddresses[0]?.emailAddress || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];

  // Persisted settings keys
  const STORAGE_KEYS = {
    notifications: '@settings_notifications',
    priceAlerts: '@settings_price_alerts',
    biometric: '@settings_biometric',
    darkMode: '@settings_dark_mode',
    currency: '@settings_currency',
    language: '@settings_language',
    profileName: '@settings_profile_name',
    profileEmail: '@settings_profile_email',
  };

  // Load persisted settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [
          notificationsVal,
          priceAlertsVal,
          biometricVal,
          darkModeVal,
          currencyVal,
          languageVal,
          profileNameVal,
          profileEmailVal,
        ] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEYS.notifications),
          SecureStore.getItemAsync(STORAGE_KEYS.priceAlerts),
          SecureStore.getItemAsync(STORAGE_KEYS.biometric),
          SecureStore.getItemAsync(STORAGE_KEYS.darkMode),
          SecureStore.getItemAsync(STORAGE_KEYS.currency),
          SecureStore.getItemAsync(STORAGE_KEYS.language),
          SecureStore.getItemAsync(STORAGE_KEYS.profileName),
          SecureStore.getItemAsync(STORAGE_KEYS.profileEmail),
        ]);

        if (notificationsVal !== null) setNotificationsEnabled(notificationsVal === 'true');
        if (priceAlertsVal !== null) setPriceAlerts(priceAlertsVal === 'true');
        if (biometricVal !== null) setBiometricAuth(biometricVal === 'true');
        if (darkModeVal !== null) setDarkMode(darkModeVal === 'true');
        if (currencyVal) setCurrency(currencyVal);
        if (languageVal) setLanguage(languageVal);
        if (profileNameVal) setEditName(profileNameVal);
        if (profileEmailVal) setEditEmail(profileEmailVal);
      } catch (e) {
        // noop, keep defaults
      }
    };
    loadSettings();
  }, []);

  // Save helpers
  const saveBoolean = async (key: string, value: boolean) => {
    try {
      await SecureStore.setItemAsync(key, value ? 'true' : 'false');
    } catch {}
  };
  const saveString = async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  };

  const handleToggle = async (setter: (v: boolean) => void, key: string, value: boolean) => {
    setter(value);
    await saveBoolean(key, value);
  };

  const handleSelectCurrency = async (val: string) => {
    setCurrency(val);
    await saveString(STORAGE_KEYS.currency, val);
    setShowCurrencyModal(false);
    Alert.alert('Saved', `Currency set to ${val}`);
  };

  const handleSelectLanguage = async (val: string) => {
    setLanguage(val);
    await saveString(STORAGE_KEYS.language, val);
    setShowLanguageModal(false);
    Alert.alert('Saved', `Language set to ${val}`);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async () => {
            try {
              await signOut();
            } finally {
              router.replace('/(auth)/sign-in');
            }
          } 
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Success', 'Account deleted successfully') },
      ]
    );
  };

  const handleSaveProfile = async () => {
    const cleanName = sanitizeInput(editName);
    const cleanEmail = sanitizeInput(editEmail);

    const nameErr = validateName(cleanName);
    if (nameErr) {
      Alert.alert('Error', nameErr.message);
      return;
    }
    const emailErr = validateEmail(cleanEmail);
    if (emailErr) {
      Alert.alert('Error', emailErr.message);
      return;
    }

    await saveString(STORAGE_KEYS.profileName, cleanName);
    await saveString(STORAGE_KEYS.profileEmail, cleanEmail);

    Alert.alert('Success', 'Profile updated successfully');
    setShowEditProfile(false);
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Current password is required');
      return;
    }
    const passErr = validatePassword(newPassword);
    if (passErr) {
      Alert.alert('Error', passErr.message);
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    // TODO: call backend API to change password
    Alert.alert('Success', 'Password changed successfully');
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
          <Image
            source={{ uri: user?.imageUrl || 'https://via.placeholder.com/80' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{user?.firstName} {user?.lastName}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.emailAddresses[0]?.emailAddress}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => setShowEditProfile(true)}>
            <LinearGradient colors={['#00d4aa', '#00a18c']} style={styles.gradientButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>

          <SettingItem
            icon={<MaterialIcons name="person" size={22} color="#00d4aa" />}
            title="Personal Information"
            subtitle="Update your personal details"
            onPress={() => setShowEditProfile(true)}
            showArrow
          />

          <SettingItem
            icon={<Feather name="lock" size={22} color="#00d4aa" />}
            title="Change Password"
            subtitle="Update your password"
            onPress={() => setShowChangePassword(true)}
            showArrow
          />

          <SettingItem
            icon={<Ionicons name="shield-checkmark" size={22} color="#00d4aa" />}
            title="Two-Factor Authentication"
            subtitle="Add extra security to your account"
            onPress={() => Alert.alert('Info', 'Two-factor authentication setup')}
            showArrow
          />

          <SettingItem
            icon={<MaterialIcons name="devices" size={22} color="#00d4aa" />}
            title="Connected Devices"
            subtitle="Manage your connected devices"
            onPress={() => Alert.alert('Info', 'Connected devices: 2')}
            showArrow
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>

          <SettingItem
            icon={<MaterialIcons name="attach-money" size={22} color="#00d4aa" />}
            title="Currency"
            subtitle={currency}
            onPress={() => setShowCurrencyModal(true)}
            showArrow
          />

          <SettingItem
            icon={<MaterialIcons name="language" size={22} color="#00d4aa" />}
            title="Language"
            subtitle={language}
            onPress={() => setShowLanguageModal(true)}
            showArrow
          />

          <SettingItem
            icon={<Ionicons name="moon" size={22} color="#00d4aa" />}
            title="Dark Mode"
            subtitle="Toggle dark mode"
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={(v) => { setIsDark(v); handleToggle(setDarkMode, STORAGE_KEYS.darkMode, v); }}
                trackColor={{ false: '#767577', true: '#00d4aa' }}
                thumbColor={darkMode ? '#ffffff' : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifications</Text>

          <SettingItem
            icon={<Ionicons name="notifications" size={22} color="#00d4aa" />}
            title="Push Notifications"
            subtitle="Receive push notifications"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={(v) => handleToggle(setNotificationsEnabled, STORAGE_KEYS.notifications, v)}
                trackColor={{ false: '#767577', true: '#00d4aa' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
              />
            }
          />

          <SettingItem
            icon={<Ionicons name="stats-chart" size={22} color="#00d4aa" />}
            title="Price Alerts"
            subtitle="Get notified of price changes"
            rightComponent={
              <Switch
                value={priceAlerts}
                onValueChange={(v) => handleToggle(setPriceAlerts, STORAGE_KEYS.priceAlerts, v)}
                trackColor={{ false: '#767577', true: '#00d4aa' }}
                thumbColor={priceAlerts ? '#ffffff' : '#f4f3f4'}
              />
            }
          />

          <SettingItem
            icon={<Feather name="mail" size={22} color="#00d4aa" />}
            title="Email Notifications"
            subtitle="Receive updates via email"
            onPress={() => Alert.alert('Info', 'Email notification settings')}
            showArrow
          />
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Security</Text>

          <SettingItem
            icon={<MaterialIcons name="fingerprint" size={22} color="#00d4aa" />}
            title="Biometric Authentication"
            subtitle="Use fingerprint or face ID"
            rightComponent={
              <Switch
                value={biometricAuth}
                onValueChange={(v) => handleToggle(setBiometricAuth, STORAGE_KEYS.biometric, v)}
                trackColor={{ false: '#767577', true: '#00d4aa' }}
                thumbColor={biometricAuth ? '#ffffff' : '#f4f3f4'}
              />
            }
          />

          <SettingItem
            icon={<Ionicons name="key-outline" size={22} color="#00d4aa" />}
            title="PIN Code"
            subtitle="Set up PIN for quick access"
            onPress={() => Alert.alert('Info', 'PIN code setup')}
            showArrow
          />

          <SettingItem
            icon={<MaterialIcons name="history" size={22} color="#00d4aa" />}
            title="Activity Log"
            subtitle="View your account activity"
            onPress={() => Alert.alert('Info', 'Activity log')}
            showArrow
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <TouchableOpacity onPress={handleLogout}>
            <LinearGradient colors={['#160101ff', '#610404ff']} style={styles.gradientButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDeleteAccount} style={{ marginTop: 19 }}>
            <LinearGradient colors={['#140f0fff', '#2b0202ff']} style={styles.gradientButton}>
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {currencies.map((c) => (
                <TouchableOpacity key={c} style={styles.modalItem} onPress={() => handleSelectCurrency(c)}>
                  <Text style={[styles.modalItemText, { color: colors.textPrimary }]}>{c}</Text>
                  {currency === c && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {languages.map((l) => (
                <TouchableOpacity key={l} style={styles.modalItem} onPress={() => handleSelectLanguage(l)}>
                  <Text style={[styles.modalItemText, { color: colors.textPrimary }]}>{l}</Text>
                  {language === l && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfile} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.border, color: colors.textPrimary }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.border, color: colors.textPrimary }]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="you@example.com"
                placeholderTextColor="#888"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showChangePassword} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowChangePassword(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Current Password</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.border, color: colors.textPrimary }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                placeholderTextColor="#888"
                secureTextEntry
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>New Password</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.border, color: colors.textPrimary }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                placeholderTextColor="#888"
                secureTextEntry
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Confirm New Password</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.border, color: colors.textPrimary }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#888"
                secureTextEntry
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
              <Text style={styles.saveButtonText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// SettingItem Component
type SettingItemProps = {
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
};

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, subtitle, onPress, showArrow, rightComponent }) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.settingLeft}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.settingRight}>
      {rightComponent}
      {showArrow && <Ionicons name="chevron-forward" size={20} color="#9ca3af" />}
    </View>
  </TouchableOpacity>
);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    color: '#9ca3af',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#00d4aa',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrow: {
    color: '#9ca3af',
    fontSize: 24,
  },
  dangerSection: {
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  logoutButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  modalClose: {
    color: '#9ca3af',
    fontSize: 28,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalItemText: {
    color: '#ffffff',
    fontSize: 16,
  },
  checkmark: {
    color: '#00d4aa',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  inputLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#00d4aa',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});