// CustomTabBar.tsx
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import React from 'react'
import {
    Dimensions,
    Pressable,
    StyleSheet,
    View,
} from 'react-native'
import { useTheme } from '../context/ThemeContext'

// --- Constants ---
const { width } = Dimensions.get('window')
const ICON_SIZE = 20
const PROMINENT_ICON_SIZE = 40 // Central transfer button

// --- Icon Component ---
interface IconProps {
  routeName: string
  focused: boolean
}

const TabIcon: React.FC<IconProps> = ({ routeName, focused }) => {
  const activeColor = '#00e6a1'
  const inactiveColor = '#ffffff'
  const color = focused ? activeColor : inactiveColor

  switch (routeName) {
    case 'index':
      return <Ionicons name="home" size={ICON_SIZE} color={color} />
    case 'charts':
      return <MaterialCommunityIcons name="chart-pie" size={ICON_SIZE} color={color} />
    case 'stats':
      return <FontAwesome5 name="chart-pie" size={ICON_SIZE} color={color} />
    case 'settings':
      return <Ionicons name="settings" size={ICON_SIZE} color={color} />
    default:
      return null
  }
}

// --- Custom Tab Bar ---
const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { colors, isDark } = useTheme();
  return (
    <View style={styles.tabBarContainer}>
      <View
        style={[
          styles.tabBarContent,
          {
            backgroundColor: isDark ? 'rgba(0, 230, 161, 0.2)' : '#FFFFFF',
            shadowColor: isDark ? 'rgba(0, 230, 161, 0.8)' : '#CBD5E1',
            borderWidth: isDark ? 0 : 1,
            borderColor: isDark ? 'transparent' : '#E2E8F0',
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const isFocused = state.index === index
          const isTransferTab = route.name === 'transfer'

          const onPress = () => {
            if (!isFocused) {
              navigation.navigate(route.name as never)
            }
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabButton,
                isTransferTab && styles.transferButtonSpacing,
              ]}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
            >
              {isTransferTab ? (
                // Central Prominent Icon
                <View
                  style={[
                    styles.transferIconCircle,
                    { backgroundColor: colors.accent, borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0' },
                  ]}
                >
                  <Feather
                    name="repeat"
                    size={PROMINENT_ICON_SIZE * 0.5}
                    color={isDark ? 'white' : '#0F172A'}
                    style={{ transform: [{ scaleX: -1 }] }}
                  />
                </View>
              ) : (
                <View style={{ opacity: isFocused ? 1 : 0.6 }}>
                  <TabIcon routeName={route.name} focused={isFocused} />
                </View>
              )}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default CustomTabBar

// --- Styles ---
const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: 20, // spacing from bottom
    pointerEvents: 'box-none', // Allow touches to pass through container
  },
  tabBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 230, 161, 0.2)',
    marginHorizontal: width * 0.05,
    shadowColor: 'rgba(0, 230, 161, 0.8)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    zIndex: 20, // Ensure icons are above background
  },
  transferButtonSpacing: {
    flex: 1.5, // larger space for central button
  },
  transferIconCircle: {
    backgroundColor: '#00e6a1',
    width: PROMINENT_ICON_SIZE,
    height: PROMINENT_ICON_SIZE,
    borderRadius: PROMINENT_ICON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -20 }],
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 20, // Ensure transfer button is above everything
  },
})