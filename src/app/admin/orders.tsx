import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FootballTheme } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types/Product';

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Processing',
  'Shipped',
  'Completed',
  'Cancelled',
];

export default function AdminOrdersScreen() {
  const router = useRouter();
  const { isDesktop, isTablet } = useResponsive();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Status Change Modal
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders for admin:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!activeOrder) return;
    setIsUpdating(true);
    try {
      await api.updateOrderStatus(activeOrder.id, newStatus);
      setActiveOrder(null);
      await loadOrders();
    } catch (err: any) {
      const msg = err.message || 'Failed to update order status';
      if (Platform.OS === 'web') window.alert(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatPrice = (amount: number) => {
    return Number(amount).toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    });
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      selectedStatus === 'All' || o.orderStatus === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.customerPhone && o.customerPhone.includes(q));

    return matchesStatus && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Change Status Modal */}
      {activeOrder && (
        <Modal
          visible={!!activeOrder}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setActiveOrder(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Order Status</Text>
                <TouchableOpacity onPress={() => setActiveOrder(null)}>
                  <Ionicons name="close" size={20} color={FootballTheme.colors.darkNavy} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Order: <Text style={{ fontWeight: '800' }}>{activeOrder.id}</Text> ({activeOrder.customerName})
              </Text>

              <View style={styles.statusOptionsList}>
                {ORDER_STATUSES.map((status) => {
                  const isCurrent = activeOrder.orderStatus === status;
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOptionBtn,
                        isCurrent && styles.statusOptionBtnCurrent,
                      ]}
                      onPress={() => handleUpdateStatus(status)}
                      disabled={isUpdating}>
                      <Text
                        style={[
                          styles.statusOptionText,
                          isCurrent && styles.statusOptionTextCurrent,
                        ]}>
                        {status} {isCurrent ? '✓ (Current)' : ''}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={isCurrent ? FootballTheme.colors.primary : FootballTheme.colors.textLight}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {isUpdating && (
                <View style={styles.modalLoadingRow}>
                  <ActivityIndicator size="small" color={FootballTheme.colors.primary} />
                  <Text style={styles.modalLoadingText}>Saving status update...</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.push('/admin/dashboard' as any)}>
            <Ionicons name="arrow-back" size={16} color={FootballTheme.colors.primary} />
            <Text style={styles.backLinkText}>Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.orderCountBadge}>{filteredOrders.length} Orders</Text>
        </View>

        <Text style={styles.pageTitle}>ORDER MANAGEMENT</Text>
        <Text style={styles.pageSubtitle}>
          Monitor delivery workflows and update package statuses
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadOrders();
            }}
            colors={[FootballTheme.colors.primary]}
          />
        }>
        {/* Search & Filters */}
        <View style={styles.filtersWrapper}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={FootballTheme.colors.primary} />
            <TextInput
              style={[styles.searchInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
              placeholder="Search by Order ID (#BZ...) or customer name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={FootballTheme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Status Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {['All', ...ORDER_STATUSES].map((st) => {
              const active = selectedStatus === st;
              return (
                <TouchableOpacity
                  key={st}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedStatus(st)}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Orders List */}
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={FootballTheme.colors.primary} />
            <Text style={styles.loadingText}>Fetching order registry...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={54} color={FootballTheme.colors.textLight} />
            <Text style={styles.emptyTitle}>No matching orders found</Text>
          </View>
        ) : (
          <View style={styles.ordersGrid}>
            {filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                {/* Order Top Bar */}
                <View style={styles.orderHeaderRow}>
                  <View>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <View style={styles.badgesCol}>
                    <View
                      style={[
                        styles.badge,
                        order.paymentStatus === 'Paid'
                          ? styles.badgePaid
                          : order.paymentStatus === 'Rejected'
                          ? styles.badgeRejected
                          : styles.badgeWaiting,
                      ]}>
                      <Text style={styles.badgeText}>Paid: {order.paymentStatus}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.statusChangerBtn}
                      onPress={() => setActiveOrder(order)}>
                      <Text style={styles.statusChangerText}>{order.orderStatus}</Text>
                      <Ionicons name="swap-vertical" size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Customer Details */}
                <View style={styles.customerBox}>
                  <View style={styles.customerRow}>
                    <Text style={styles.customerName}>{order.customerName}</Text>
                    <Text style={styles.customerPhone}>📞 {order.customerPhone}</Text>
                  </View>
                  <Text style={styles.customerAddress} numberOfLines={1}>
                    📍 {order.shippingAddress.address}, {order.shippingAddress.district},{' '}
                    {order.shippingAddress.province} {order.shippingAddress.postalCode}
                  </Text>
                </View>

                {/* Items preview */}
                <View style={styles.itemsSummary}>
                  {order.items.map((item, idx) => (
                    <View key={item.id || idx} style={styles.itemMiniRow}>
                      <Text style={styles.itemMiniName} numberOfLines={1}>
                        • {item.name} (EU {item.size})
                      </Text>
                      <Text style={styles.itemMiniQty}>
                        ×{item.quantity} ({formatPrice(item.price * item.quantity)})
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.methodText}>Via {order.paymentMethod}</Text>
                    <Text style={styles.totalPrice}>{formatPrice(order.total)}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.viewDetailBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/order-detail' as any,
                        params: { id: order.id },
                      })
                    }>
                    <Text style={styles.viewDetailText}>Full Detail</Text>
                    <Ionicons name="arrow-forward" size={14} color={FootballTheme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: FootballTheme.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  orderCountBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: FootballTheme.colors.primary,
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: FootballTheme.radius.full,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  filtersWrapper: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.md,
    borderWidth: 1.5,
    borderColor: FootballTheme.colors.border,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
    gap: 8,
    ...FootballTheme.shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: FootballTheme.colors.darkNavy,
    fontWeight: '500',
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: FootballTheme.radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: FootballTheme.colors.primary,
    borderColor: FootballTheme.colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.textMuted,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  centerLoading: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: FootballTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FootballTheme.colors.textMuted,
  },
  ordersGrid: {
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
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
  },
  orderDate: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
    marginTop: 2,
  },
  badgesCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: FootballTheme.radius.full,
    borderWidth: 1,
  },
  badgePaid: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  badgeWaiting: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  badgeRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusChangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: FootballTheme.colors.darkNavy,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: FootballTheme.radius.full,
  },
  statusChangerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  customerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: FootballTheme.radius.md,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
  },
  customerPhone: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
  },
  customerAddress: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
  },
  itemsSummary: {
    marginBottom: 12,
  },
  itemMiniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  itemMiniName: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    flex: 1,
  },
  itemMiniQty: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: FootballTheme.colors.border,
    paddingTop: 10,
  },
  methodText: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
    marginTop: 2,
  },
  viewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: FootballTheme.radius.sm,
  },
  viewDetailText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    padding: 20,
    ...FootballTheme.shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
  },
  modalSubtitle: {
    fontSize: 13,
    color: FootballTheme.colors.textMuted,
    marginBottom: 16,
  },
  statusOptionsList: {
    gap: 8,
  },
  statusOptionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: FootballTheme.radius.md,
  },
  statusOptionBtnCurrent: {
    backgroundColor: FootballTheme.colors.lightBlue,
    borderColor: FootballTheme.colors.primary,
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
  },
  statusOptionTextCurrent: {
    color: FootballTheme.colors.primary,
    fontWeight: '900',
  },
  modalLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    justifyContent: 'center',
  },
  modalLoadingText: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
  },
});
