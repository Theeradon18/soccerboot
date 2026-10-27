import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FootballTheme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { api } from '../../services/api';
import { Order, Product } from '../../types/Product';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const { isDesktop, isTablet } = useResponsive();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [prodsData, ordersData] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getAllOrders().catch(() => []),
      ]);
      setProducts(prodsData || []);
      setOrders(ordersData || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as any);
  };

  // Calculations
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const lowStockCount = products.filter((p) => Number(p.stock) < 5).length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);
  const pendingSlipCount = orders.filter(
    (o) => o.paymentStatus === 'Waiting for Verification'
  ).length;

  const formatCurrency = (amount: number) => {
    return Number(amount).toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    });
  };

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'grid' },
    { label: 'Products', path: '/products', icon: 'football' },
    { label: 'Add Boot', path: '/add-product', icon: 'add-circle' },
    { label: 'Orders', path: '/admin/orders', icon: 'receipt', badge: totalOrders },
    {
      label: 'Payments',
      path: '/admin/payments',
      icon: 'shield-checkmark',
      badge: pendingSlipCount > 0 ? pendingSlipCount : undefined,
    },
    { label: 'Users', path: '/admin/users', icon: 'people' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Admin Header */}
      <View style={styles.adminHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>⚽</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>BOOTZONE ADMIN</Text>
            <Text style={styles.brandSubtitle}>STORE MANAGEMENT CONSOLE</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.customerStoreBtn}
            onPress={() => router.push('/home' as any)}
            activeOpacity={0.8}>
            <Ionicons name="storefront-outline" size={16} color={FootballTheme.colors.primary} />
            <Text style={styles.customerStoreText}>Customer Shop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={FootballTheme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin Navigation Bar */}
      <View style={styles.navBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navBarScroll}>
          {adminNav.map((item) => {
            const isActive = pathname === item.path;
            return (
              <TouchableOpacity
                key={item.path}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => router.push(item.path as any)}
                activeOpacity={0.75}>
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={isActive ? FootballTheme.colors.primary : FootballTheme.colors.textMuted}
                />
                <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                  {item.label}
                </Text>
                {item.badge !== undefined && item.badge > 0 && (
                  <View
                    style={[
                      styles.navBadge,
                      item.path === '/admin/payments' && styles.navBadgeAlert,
                    ]}>
                    <Text style={styles.navBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[FootballTheme.colors.primary]}
          />
        }>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={FootballTheme.colors.primary} />
            <Text style={styles.loadingText}>Loading store intelligence...</Text>
          </View>
        ) : (
          <View style={styles.dashboardBody}>
            {/* Overview Title */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.overviewTitle}>STORE OVERVIEW</Text>
              <Text style={styles.lastUpdatedText}>Live synchronization active</Text>
            </View>

            {/* Statistics Cards Grid */}
            <View style={styles.statsGrid}>
              {/* Total Revenue */}
              <View style={[styles.statCard, { borderLeftColor: '#059669' }]}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>PAID REVENUE</Text>
                  <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="cash" size={18} color="#059669" />
                  </View>
                </View>
                <Text style={[styles.statValue, { color: '#059669' }]}>
                  {formatCurrency(totalRevenue)}
                </Text>
                <Text style={styles.statSub}>From confirmed orders</Text>
              </View>

              {/* Total Orders */}
              <View style={[styles.statCard, { borderLeftColor: FootballTheme.colors.primary }]}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>TOTAL ORDERS</Text>
                  <View style={[styles.statIconBox, { backgroundColor: FootballTheme.colors.lightBlue }]}>
                    <Ionicons name="receipt" size={18} color={FootballTheme.colors.primary} />
                  </View>
                </View>
                <Text style={styles.statValue}>{totalOrders}</Text>
                <Text style={styles.statSub}>
                  {pendingSlipCount > 0 ? `⚠️ ${pendingSlipCount} slips to verify` : 'All slips processed'}
                </Text>
              </View>

              {/* Total Boots Catalog */}
              <View style={[styles.statCard, { borderLeftColor: '#0284C7' }]}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>PRODUCTS IN STORE</Text>
                  <View style={[styles.statIconBox, { backgroundColor: '#F0F9FF' }]}>
                    <Ionicons name="football" size={18} color="#0284C7" />
                  </View>
                </View>
                <Text style={styles.statValue}>{totalProducts}</Text>
                <Text style={styles.statSub}>Active catalog models</Text>
              </View>

              {/* Total Stock Units */}
              <View style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>TOTAL INVENTORY</Text>
                  <View style={[styles.statIconBox, { backgroundColor: '#F5F3FF' }]}>
                    <Ionicons name="cube" size={18} color="#8B5CF6" />
                  </View>
                </View>
                <Text style={styles.statValue}>{totalStock} Pairs</Text>
                <Text style={styles.statSub}>Across all sizes</Text>
              </View>

              {/* Low Stock Alert */}
              <View style={[styles.statCard, { borderLeftColor: FootballTheme.colors.danger }]}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>LOW STOCK ALERTS</Text>
                  <View style={[styles.statIconBox, { backgroundColor: FootballTheme.colors.dangerLight }]}>
                    <Ionicons name="warning" size={18} color={FootballTheme.colors.danger} />
                  </View>
                </View>
                <Text style={[styles.statValue, { color: FootballTheme.colors.danger }]}>
                  {lowStockCount} Items
                </Text>
                <Text style={styles.statSub}>Units less than 5 pairs</Text>
              </View>
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.quickActionsSection}>
              <Text style={styles.subSectionTitle}>QUICK ACTIONS</Text>
              <View style={styles.quickActionButtons}>
                <TouchableOpacity
                  style={styles.quickBtn}
                  onPress={() => router.push('/add-product' as any)}>
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.quickBtnText}>Add New Boot</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickBtn, { backgroundColor: '#0284C7' }]}
                  onPress={() => router.push('/admin/payments' as any)}>
                  <Ionicons name="checkmark-done-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.quickBtnText}>Verify Slips ({pendingSlipCount})</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickBtn, { backgroundColor: '#0F172A' }]}
                  onPress={() => router.push('/admin/orders' as any)}>
                  <Ionicons name="list" size={18} color="#FFFFFF" />
                  <Text style={styles.quickBtnText}>Manage Orders</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent Orders Section */}
            <View style={styles.recentOrdersCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardSectionTitle}>RECENT ORDERS</Text>
                <TouchableOpacity
                  onPress={() => router.push('/admin/orders' as any)}>
                  <Text style={styles.viewAllLink}>View All ({totalOrders}) →</Text>
                </TouchableOpacity>
              </View>

              {orders.length === 0 ? (
                <View style={styles.emptyOrdersBox}>
                  <Text style={styles.emptyOrdersText}>No orders received yet.</Text>
                </View>
              ) : (
                <View style={styles.ordersTable}>
                  {orders.slice(0, 5).map((order) => (
                    <View key={order.id} style={styles.orderTableRow}>
                      <View style={{ flex: 1.2 }}>
                        <Text style={styles.orderTableId}>{order.id}</Text>
                        <Text style={styles.orderTableCustomer}>{order.customerName}</Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderTableAmount}>{formatCurrency(order.total)}</Text>
                        <Text style={styles.orderTableMethod}>{order.paymentMethod}</Text>
                      </View>

                      <View style={{ flex: 1.2, alignItems: 'flex-end' }}>
                        <View
                          style={[
                            styles.statusTag,
                            order.paymentStatus === 'Paid'
                              ? styles.statusTagPaid
                              : order.paymentStatus === 'Rejected'
                              ? styles.statusTagRejected
                              : styles.statusTagWaiting,
                          ]}>
                          <Text
                            style={[
                              styles.statusTagText,
                              order.paymentStatus === 'Paid'
                                ? { color: '#065F46' }
                                : order.paymentStatus === 'Rejected'
                                ? { color: '#991B1B' }
                                : { color: '#92400E' },
                            ]}>
                            {order.paymentStatus}
                          </Text>
                        </View>
                        <Text style={styles.orderStatusSub}>Status: {order.orderStatus}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: FootballTheme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
    ...FootballTheme.shadow.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
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
    fontSize: 16,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: FootballTheme.colors.primary,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customerStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: FootballTheme.radius.full,
  },
  customerStoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  logoutBtn: {
    padding: 6,
  },
  navBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: FootballTheme.colors.border,
  },
  navBarScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: FootballTheme.radius.full,
  },
  navItemActive: {
    backgroundColor: FootballTheme.colors.lightBlue,
  },
  navItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: FootballTheme.colors.textMuted,
  },
  navItemTextActive: {
    color: FootballTheme.colors.primary,
    fontWeight: '800',
  },
  navBadge: {
    backgroundColor: FootballTheme.colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  navBadgeAlert: {
    backgroundColor: FootballTheme.colors.danger,
  },
  navBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  loadingBox: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: FootballTheme.colors.textMuted,
    fontWeight: '600',
  },
  dashboardBody: {
    maxWidth: 1300,
    alignSelf: 'center',
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 0.5,
  },
  lastUpdatedText: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    borderLeftWidth: 4,
    ...FootballTheme.shadow.sm,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: FootballTheme.colors.textLight,
    letterSpacing: 0.8,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
  },
  statSub: {
    fontSize: 11,
    color: FootballTheme.colors.textMuted,
    marginTop: 4,
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  quickActionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: FootballTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: FootballTheme.radius.md,
    ...FootballTheme.shadow.sm,
  },
  quickBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  recentOrdersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 0.5,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  emptyOrdersBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyOrdersText: {
    fontSize: 13,
    color: FootballTheme.colors.textMuted,
  },
  ordersTable: {
    gap: 12,
  },
  orderTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: FootballTheme.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
  },
  orderTableId: {
    fontSize: 13,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
  },
  orderTableCustomer: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    marginTop: 2,
  },
  orderTableAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
  },
  orderTableMethod: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: FootballTheme.radius.full,
    borderWidth: 1,
  },
  statusTagPaid: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusTagWaiting: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusTagRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  orderStatusSub: {
    fontSize: 10,
    color: FootballTheme.colors.textLight,
    marginTop: 3,
  },
});
