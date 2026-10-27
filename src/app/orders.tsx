import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomerHeader } from '../components/CustomerHeader';
import { FootballTheme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order } from '../types/Product';

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [user?.id]);

  const loadOrders = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUserOrders(user.id);
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError('Could not retrieve orders. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const formatPrice = (val: number) => {
    return Number(val).toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    });
  };

  const renderPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <View style={[styles.statusBadge, styles.statusPaid]}>
            <Ionicons name="checkmark-circle" size={12} color="#059669" />
            <Text style={[styles.statusText, { color: '#065F46' }]}>Paid</Text>
          </View>
        );
      case 'Waiting for Verification':
        return (
          <View style={[styles.statusBadge, styles.statusWaiting]}>
            <Ionicons name="hourglass" size={12} color="#D97706" />
            <Text style={[styles.statusText, { color: '#92400E' }]}>Verifying Slip</Text>
          </View>
        );
      case 'Rejected':
        return (
          <View style={[styles.statusBadge, styles.statusRejected]}>
            <Ionicons name="close-circle" size={12} color="#DC2626" />
            <Text style={[styles.statusText, { color: '#991B1B' }]}>Slip Rejected</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, styles.statusPending]}>
            <Ionicons name="time" size={12} color="#475569" />
            <Text style={[styles.statusText, { color: '#334155' }]}>Pending</Text>
          </View>
        );
    }
  };

  const renderOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <View style={[styles.statusBadge, styles.statusPaid]}>
            <Text style={[styles.statusText, { color: '#065F46' }]}>Delivered</Text>
          </View>
        );
      case 'Shipped':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Text style={[styles.statusText, { color: '#1D4ED8' }]}>Shipped 🚚</Text>
          </View>
        );
      case 'Processing':
        return (
          <View style={[styles.statusBadge, styles.statusWaiting]}>
            <Text style={[styles.statusText, { color: '#92400E' }]}>Processing 📦</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, styles.statusPending]}>
            <Text style={[styles.statusText, { color: '#334155' }]}>{status || 'Pending'}</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomerHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[FootballTheme.colors.primary]}
          />
        }>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>MY ORDERS</Text>
          <Text style={styles.pageSubtitle}>Track and view your previous football boot purchases</Text>
        </View>

        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={FootballTheme.colors.primary} />
            <Text style={styles.loadingText}>Fetching order history...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={32} color={FootballTheme.colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadOrders}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && orders.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={60} color={FootballTheme.colors.textLight} />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
              You have not placed any orders with BOOTZONE yet.
            </Text>
            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={() => router.push('/home' as any)}>
              <Text style={styles.shopNowText}>START SHOPPING</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && orders.length > 0 && (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() =>
                  router.push({
                    pathname: '/order-detail' as any,
                    params: { id: order.id },
                  })
                }
                activeOpacity={0.8}>
                {/* Order Top Bar */}
                <View style={styles.orderTopBar}>
                  <View>
                    <Text style={styles.orderIdText}>{order.id}</Text>
                    <Text style={styles.orderDateText}>
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <View style={styles.badgesRow}>
                    {renderPaymentStatusBadge(order.paymentStatus)}
                    {renderOrderStatusBadge(order.orderStatus)}
                  </View>
                </View>

                {/* Items preview */}
                <View style={styles.orderItemsPreview}>
                  <Text style={styles.itemsSummaryText} numberOfLines={2}>
                    {order.items.map((it) => `${it.name} (EU ${it.size}) × ${it.quantity}`).join(', ')}
                  </Text>
                </View>

                {/* Order Bottom Bar */}
                <View style={styles.orderBottomBar}>
                  <View>
                    <Text style={styles.paymentMethodLabel}>Payment: {order.paymentMethod}</Text>
                    <Text style={styles.orderTotalValue}>{formatPrice(order.total)}</Text>
                  </View>

                  <View style={styles.detailsBtn}>
                    <Text style={styles.detailsBtnText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={14} color={FootballTheme.colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: FootballTheme.colors.textMuted,
    marginTop: 2,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: FootballTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  errorBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    color: FootballTheme.colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: FootballTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: FootballTheme.radius.md,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
  },
  emptySubtitle: {
    fontSize: 13,
    color: FootballTheme.colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  shopNowBtn: {
    marginTop: 14,
    backgroundColor: FootballTheme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: FootballTheme.radius.full,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ordersList: {
    gap: 14,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.lg,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    padding: 16,
    ...FootballTheme.shadow.sm,
  },
  orderTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
  },
  orderDateText: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: FootballTheme.radius.full,
    borderWidth: 1,
  },
  statusPaid: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusWaiting: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusPending: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  orderItemsPreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: FootballTheme.radius.md,
    padding: 10,
    marginBottom: 12,
  },
  itemsSummaryText: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    lineHeight: 18,
  },
  orderBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: FootballTheme.colors.border,
    paddingTop: 10,
  },
  paymentMethodLabel: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
    fontWeight: '600',
  },
  orderTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
    marginTop: 2,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
});
