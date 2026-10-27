import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FootballTheme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useResponsive } from '../hooks/useResponsive';

export const CustomerHeader: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const { totalItems, badgeScale } = useCart();
  const { isDesktop, isTablet } = useResponsive();

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as any);
  };

  const navItems = [
    { label: 'Shop', path: '/home', icon: 'storefront-outline' },
    { label: 'My Orders', path: '/orders', icon: 'receipt-outline' },
    { label: 'Profile', path: '/profile', icon: 'person-outline' },
  ];

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerContainer}>
        {/* Logo Area */}
        <TouchableOpacity
          style={styles.logoGroup}
          onPress={() => router.push('/home' as any)}
          activeOpacity={0.8}>
          <View style={styles.logoIconBox}>
            <Text style={styles.logoEmoji}>⚽</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>BOOTZONE</Text>
            <Text style={styles.brandSubtitle}>FOOTBALL BOOTS STORE</Text>
          </View>
        </TouchableOpacity>

        {/* Desktop Navigation Links */}
        {(isDesktop || isTablet) && (
          <View style={styles.navLinksRow}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <TouchableOpacity
                  key={item.path}
                  style={[styles.navLink, isActive && styles.navLinkActive]}
                  onPress={() => router.push(item.path as any)}
                  activeOpacity={0.7}>
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={isActive ? FootballTheme.colors.primary : FootballTheme.colors.textMuted}
                  />
                  <Text style={[styles.navLinkText, isActive && styles.navLinkTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Admin shortcut if logged in as admin */}
            {isAdmin && (
              <TouchableOpacity
                style={styles.adminBadgeBtn}
                onPress={() => router.push('/products' as any)}
                activeOpacity={0.8}>
                <Ionicons name="shield-outline" size={14} color="#0B74DE" />
                <Text style={styles.adminBadgeText}>Admin Panel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Action Buttons: Cart & User/Logout */}
        <View style={styles.rightActions}>
          {/* Cart Icon with Animated Badge */}
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push('/cart' as any)}
            activeOpacity={0.8}>
            <Ionicons name="cart-outline" size={24} color={FootballTheme.colors.darkNavy} />
            {totalItems > 0 && (
              <Animated.View
                style={[
                  styles.badge,
                  {
                    transform: [{ scale: badgeScale }],
                  },
                ]}>
                <Text style={styles.badgeText}>
                  {totalItems > 99 ? '99+' : totalItems}
                </Text>
              </Animated.View>
            )}
          </TouchableOpacity>

          {/* User Profile / Name (Desktop) or Logout */}
          {user ? (
            <View style={styles.userSection}>
              <TouchableOpacity
                style={styles.userProfileBtn}
                onPress={() => router.push('/profile' as any)}
                activeOpacity={0.75}>
                <View style={styles.avatarMini}>
                  <Text style={styles.avatarChar}>
                    {(user.full_name || user.name || user.username || 'U')[0].toUpperCase()}
                  </Text>
                </View>
                {(isDesktop || isTablet) && (
                  <Text style={styles.userNameText} numberOfLines={1}>
                    {user.full_name || user.username}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="log-out-outline" size={20} color={FootballTheme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push('/login' as any)}>
              <Text style={styles.loginBtnText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mobile Secondary Navigation Bar */}
      {!isDesktop && !isTablet && (
        <View style={styles.mobileNavBar}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <TouchableOpacity
                key={item.path}
                style={[styles.mobileNavItem, isActive && styles.mobileNavItemActive]}
                onPress={() => router.push(item.path as any)}>
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={isActive ? FootballTheme.colors.primary : FootballTheme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.mobileNavText,
                    isActive && styles.mobileNavTextActive,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          {isAdmin && (
            <TouchableOpacity
              style={styles.mobileNavItem}
              onPress={() => router.push('/products' as any)}>
              <Ionicons name="shield-outline" size={18} color="#0B74DE" />
              <Text style={styles.mobileNavText}>Admin</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: FootballTheme.colors.border,
    zIndex: 100,
    ...FootballTheme.shadow.sm,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: FootballTheme.colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  logoEmoji: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: FootballTheme.colors.primary,
    letterSpacing: 1,
  },
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: FootballTheme.radius.full,
  },
  navLinkActive: {
    backgroundColor: FootballTheme.colors.lightBlue,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: FootballTheme.colors.textMuted,
  },
  navLinkTextActive: {
    color: FootballTheme.colors.primary,
    fontWeight: '700',
  },
  adminBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: FootballTheme.radius.full,
    marginLeft: 6,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B74DE',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: FootballTheme.colors.danger,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: FootballTheme.radius.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FootballTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChar: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  userNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
    maxWidth: 110,
  },
  logoutBtn: {
    padding: 6,
  },
  loginBtn: {
    backgroundColor: FootballTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: FootballTheme.radius.full,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  mobileNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: FootballTheme.colors.border,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: FootballTheme.radius.full,
  },
  mobileNavItemActive: {
    backgroundColor: FootballTheme.colors.lightBlue,
  },
  mobileNavText: {
    fontSize: 12,
    fontWeight: '600',
    color: FootballTheme.colors.textMuted,
  },
  mobileNavTextActive: {
    color: FootballTheme.colors.primary,
    fontWeight: '700',
  },
});
