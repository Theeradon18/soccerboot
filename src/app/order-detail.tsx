import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomerHeader } from '../components/CustomerHeader';
import { FootballTheme } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';
import { api } from '../services/api';
import { Order } from '../types/Product';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDesktop, isTablet } = useResponsive();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  const loadOrder = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOrderDetail(orderId);
      setOrder(data);
    } catch (err: any) {
      console.error('Failed to fetch order detail:', err);
      setError(err.message || 'Could not load order details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (val: number) => {
    return Number(val).toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomerHeader />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={FootballTheme.colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomerHeader />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={54} color={FootballTheme.colors.danger} />
          <Text style={styles.errorText}>{error || 'Order not found'}</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Back to Orders</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const steps = [
    { title: 'Order Placed', active: true, icon: 'receipt' },
    {
      title: 'Payment Verified',
      active: order.paymentStatus === 'Paid' || order.orderStatus !== 'Pending',
      icon: 'shield-checkmark',
    },
    {
      title: 'Boots Shipped',
      active: order.orderStatus === 'Shipped' || order.orderStatus === 'Completed',
      icon: 'cube',
    },
    {
      title: 'Delivered',
      active: order.orderStatus === 'Completed',
      icon: 'checkmark-done',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <CustomerHeader />

      {/* Slip Modal View */}
      {order.paymentSlip ? (
        <Modal
          visible={showSlipModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSlipModal(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowSlipModal(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Image
              source={{ uri: order.paymentSlip }}
              style={styles.modalSlipImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.pageHeader}>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
            activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={16} color={FootballTheme.colors.primary} />
            <Text style={styles.backLinkText}>Back to Orders</Text>
          </TouchableOpacity>

          <View style={styles.headerInfoRow}>
            <View>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.orderDate}>
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.statusBadgesRow}>
              <View
                style={[
                  styles.statusBadge,
                  order.paymentStatus === 'Paid'
                    ? styles.statusPaid
                    : order.paymentStatus === 'Rejected'
                    ? styles.statusRejected
                    : styles.statusWaiting,
                ]}>
                <Text
                  style={[
                    styles.statusBadgeText,
                    order.paymentStatus === 'Paid'
                      ? { color: '#065F46' }
                      : order.paymentStatus === 'Rejected'
                      ? { color: '#991B1B' }
                      : { color: '#92400E' },
                  ]}>
                  Payment: {order.paymentStatus}
                </Text>
              </View>

              <View style={[styles.statusBadge, styles.statusWaiting]}>
                <Text style={[styles.statusBadgeText, { color: '#1E40AF' }]}>
                  Order: {order.orderStatus}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reject Banner if rejected */}
        {order.paymentStatus === 'Rejected' && (
          <View style={styles.rejectBanner}>
            <Ionicons name="alert-circle" size={24} color={FootballTheme.colors.danger} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rejectTitle}>Payment Slip Rejected by Store Admin</Text>
              <Text style={styles.rejectReasonText}>
                Reason: {order.rejectReason || 'Invalid slip or incorrect transfer amount.'}
              </Text>
            </View>
          </View>
        )}

        {/* Progress Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.cardHeaderTitle}>ORDER TIMELINE</Text>
          <View style={styles.stepsRow}>
            {steps.map((step, idx) => (
              <View key={step.title} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    step.active && styles.stepCircleActive,
                  ]}>
                  <Ionicons
                    name={step.icon as any}
                    size={16}
                    color={step.active ? '#FFFFFF' : '#94A3B8'}
                  />
                </View>
                <Text
                  style={[
                    styles.stepTitle,
                    step.active && styles.stepTitleActive,
                  ]}>
                  {step.title}
                </Text>
                {idx < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      step.active && steps[idx + 1].active && styles.stepConnectorActive,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 2-Column Desktop Grid / 1-Column Mobile */}
        <View
          style={[
            styles.contentGrid,
            (isDesktop || isTablet) && styles.contentGridDesktop,
          ]}>
          {/* LEFT: Items List & Payment Slip */}
          <View style={styles.leftCol}>
            {/* Ordered Cleats */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>
                ORDERED CLEATS ({order.items.length})
              </Text>

              <View style={styles.itemsList}>
                {order.items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemImageWrapper}>
                      {item.image_url ? (
                        <Image
                          source={{ uri: item.image_url }}
                          style={styles.itemImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.itemImgPlaceholder}>
                          <Text style={{ fontSize: 24 }}>⚽</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.itemInfoCol}>
                      <Text style={styles.itemBrand}>{item.brand?.toUpperCase()}</Text>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemSpecs}>
                        Size: EU {item.size} • Qty: {item.quantity}
                      </Text>
                    </View>

                    <View style={styles.itemPriceCol}>
                      <Text style={styles.itemTotalText}>
                        {formatPrice(item.price * item.quantity)}
                      </Text>
                      <Text style={styles.itemUnitPriceText}>
                        {formatPrice(item.price)} each
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Payment Slip Showcase */}
            {order.paymentSlip ? (
              <View style={styles.sectionCard}>
                <Text style={styles.cardHeaderTitle}>ATTACHED PAYMENT SLIP</Text>
                <TouchableOpacity
                  style={styles.slipCard}
                  onPress={() => setShowSlipModal(true)}
                  activeOpacity={0.85}>
                  <Image
                    source={{ uri: order.paymentSlip }}
                    style={styles.slipImagePreview}
                    resizeMode="contain"
                  />
                  <View style={styles.slipTapHint}>
                    <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.slipTapHintText}>Tap to enlarge slip</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {/* RIGHT: Delivery Address & Summary */}
          <View style={styles.rightCol}>
            {/* Shipping Address */}
            <View style={styles.sectionCard}>
              <View style={styles.cardTitleWithIcon}>
                <Ionicons name="location-outline" size={18} color={FootballTheme.colors.primary} />
                <Text style={styles.cardHeaderTitle}>SHIPPING ADDRESS</Text>
              </View>

              <View style={styles.addressBox}>
                <Text style={styles.recipientName}>{order.customerName}</Text>
                <Text style={styles.recipientPhone}>📞 {order.customerPhone}</Text>
                {order.customerEmail ? (
                  <Text style={styles.recipientEmail}>✉️ {order.customerEmail}</Text>
                ) : null}
                <View style={styles.addressDivider} />
                <Text style={styles.addressLine}>{order.shippingAddress.address}</Text>
                <Text style={styles.addressSubLine}>
                  {order.shippingAddress.district}, {order.shippingAddress.province}{' '}
                  {order.shippingAddress.postalCode}
                </Text>
              </View>
            </View>

            {/* Order Cost Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>PAYMENT SUMMARY</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Payment Method</Text>
                <Text style={styles.summaryVal}>{order.paymentMethod}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Subtotal</Text>
                <Text style={styles.summaryVal}>{formatPrice(order.subtotal)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Shipping Fee</Text>
                <Text style={styles.summaryVal}>{formatPrice(order.shipping)}</Text>
              </View>

              <View style={styles.addressDivider} />

              <View style={[styles.summaryRow, { marginTop: 4 }]}>
                <Text style={styles.totalKey}>TOTAL</Text>
                <Text style={styles.totalVal}>{formatPrice(order.total)}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: FootballTheme.colors.textMuted,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: FootballTheme.colors.danger,
    fontWeight: '700',
  },
  backBtn: {
    marginTop: 12,
    padding: 10,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  pageHeader: {
    marginBottom: 20,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  headerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  orderId: {
    fontSize: 24,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
  },
  orderDate: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    marginTop: 2,
  },
  statusBadgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  rejectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#F87171',
    borderRadius: FootballTheme.radius.lg,
    padding: 14,
    marginBottom: 20,
  },
  rejectTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: FootballTheme.colors.danger,
  },
  rejectReasonText: {
    fontSize: 13,
    color: '#7F1D1D',
    marginTop: 2,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    marginBottom: 20,
    ...FootballTheme.shadow.sm,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  cardTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    marginTop: 8,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    zIndex: 2,
  },
  stepCircleActive: {
    backgroundColor: FootballTheme.colors.primary,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: FootballTheme.colors.textMuted,
    textAlign: 'center',
  },
  stepTitleActive: {
    color: FootballTheme.colors.darkNavy,
    fontWeight: '800',
  },
  stepConnector: {
    position: 'absolute',
    top: 18,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  stepConnectorActive: {
    backgroundColor: FootballTheme.colors.primary,
  },
  contentGrid: {
    flexDirection: 'column',
    gap: 20,
  },
  contentGridDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftCol: {
    flex: 1.4,
    gap: 20,
  },
  rightCol: {
    flex: 1,
    gap: 20,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.sm,
  },
  itemsList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: FootballTheme.colors.border,
    paddingBottom: 12,
  },
  itemImageWrapper: {
    width: 64,
    height: 64,
    borderRadius: FootballTheme.radius.md,
    backgroundColor: '#F0F9FF',
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImgPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfoCol: {
    flex: 1,
  },
  itemBrand: {
    fontSize: 10,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
    letterSpacing: 0.5,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
    marginVertical: 1,
  },
  itemSpecs: {
    fontSize: 11,
    color: FootballTheme.colors.textMuted,
  },
  itemPriceCol: {
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 14,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
  },
  itemUnitPriceText: {
    fontSize: 10,
    color: FootballTheme.colors.textLight,
  },
  slipCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: FootballTheme.radius.lg,
    overflow: 'hidden',
    position: 'relative',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
  },
  slipImagePreview: {
    width: '100%',
    height: '100%',
  },
  slipTapHint: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: FootballTheme.radius.full,
  },
  slipTapHintText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addressBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: FootballTheme.radius.md,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
  },
  recipientName: {
    fontSize: 14,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
  },
  recipientPhone: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    marginTop: 3,
  },
  recipientEmail: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    marginTop: 2,
  },
  addressDivider: {
    height: 1,
    backgroundColor: FootballTheme.colors.border,
    marginVertical: 10,
  },
  addressLine: {
    fontSize: 13,
    color: FootballTheme.colors.darkNavy,
    lineHeight: 18,
  },
  addressSubLine: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryKey: {
    fontSize: 13,
    color: FootballTheme.colors.textMuted,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
  },
  totalKey: {
    fontSize: 15,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
  },
  totalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalSlipImage: {
    width: '90%',
    height: '80%',
  },
});
