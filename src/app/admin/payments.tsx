import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { api } from '../../services/api';
import { PaymentVerification } from '../../types/Product';

export default function AdminPaymentsScreen() {
  const router = useRouter();

  const [payments, setPayments] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Waiting for Verification' | 'Paid' | 'Rejected'>('All');

  // Slip preview modal
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);

  // Reject modal
  const [rejectingPayment, setRejectingPayment] = useState<PaymentVerification | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminPayments();
      setPayments(data);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    setIsProcessing(true);
    try {
      await api.approvePayment(paymentId);
      if (Platform.OS === 'web') {
        window.alert('Payment approved successfully! Order marked as Processing.');
      }
      await loadPayments();
    } catch (err: any) {
      const msg = err.message || 'Failed to approve payment';
      if (Platform.OS === 'web') window.alert(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingPayment) return;
    if (!rejectReason.trim()) {
      if (Platform.OS === 'web') window.alert('Please enter a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      await api.rejectPayment(rejectingPayment.id, rejectReason.trim());
      setRejectingPayment(null);
      setRejectReason('');
      if (Platform.OS === 'web') {
        window.alert('Payment rejected with reason noted.');
      }
      await loadPayments();
    } catch (err: any) {
      const msg = err.message || 'Failed to reject payment';
      if (Platform.OS === 'web') window.alert(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (amount: number) => {
    return Number(amount).toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    });
  };

  const filtered = payments.filter((p) => {
    if (selectedStatus === 'All') return true;
    return p.status === selectedStatus;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Full Slip Preview Modal */}
      {previewSlipUrl && (
        <Modal
          visible={!!previewSlipUrl}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPreviewSlipUrl(null)}>
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setPreviewSlipUrl(null)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Image
              source={{ uri: previewSlipUrl }}
              style={styles.fullSlipImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectingPayment && (
        <Modal
          visible={!!rejectingPayment}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setRejectingPayment(null)}>
          <View style={styles.rejectModalOverlay}>
            <View style={styles.rejectModalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.rejectModalTitle}>Reject Payment Slip</Text>
                <TouchableOpacity onPress={() => setRejectingPayment(null)}>
                  <Ionicons name="close" size={20} color={FootballTheme.colors.darkNavy} />
                </TouchableOpacity>
              </View>

              <Text style={styles.rejectModalDesc}>
                Specify why this slip is being rejected so the customer can be notified:
              </Text>

              <TextInput
                style={[
                  styles.rejectInput,
                  Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                ]}
                placeholder="e.g. Transfer amount does not match order total, slip is unreadable, or wrong recipient account."
                placeholderTextColor={FootballTheme.colors.textLight}
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={3}
              />

              <View style={styles.rejectActionsRow}>
                <TouchableOpacity
                  style={styles.cancelRejectBtn}
                  onPress={() => setRejectingPayment(null)}
                  disabled={isProcessing}>
                  <Text style={styles.cancelRejectText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmRejectBtn, isProcessing && { opacity: 0.6 }]}
                  onPress={handleConfirmReject}
                  disabled={isProcessing}>
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmRejectText}>Confirm Rejection</Text>
                  )}
                </TouchableOpacity>
              </View>
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
          <Text style={styles.countBadge}>{filtered.length} Verifications</Text>
        </View>

        <Text style={styles.pageTitle}>PAYMENT SLIP VERIFICATION</Text>
        <Text style={styles.pageSubtitle}>
          Review customer transfer slips, approve valid orders, or reject with clear explanation
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadPayments();
            }}
            colors={[FootballTheme.colors.primary]}
          />
        }>
        {/* Status Filter Chips */}
        <View style={styles.chipsRow}>
          {(['All', 'Waiting for Verification', 'Paid', 'Rejected'] as const).map((st) => {
            const active = selectedStatus === st;
            return (
              <TouchableOpacity
                key={st}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedStatus(st)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {st === 'Waiting for Verification' ? '⏳ Pending' : st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={FootballTheme.colors.primary} />
            <Text style={styles.loadingText}>Fetching payment verifications...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={54} color={FootballTheme.colors.textLight} />
            <Text style={styles.emptyTitle}>No payment slips in this category</Text>
          </View>
        ) : (
          <View style={styles.paymentsList}>
            {filtered.map((item) => {
              const isWaiting = item.status === 'Waiting for Verification';
              return (
                <View key={item.id} style={styles.paymentCard}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.orderId}>{item.orderId}</Text>
                      <Text style={styles.customerName}>
                        👤 {item.customerName} ({item.paymentMethod})
                      </Text>
                    </View>

                    <View style={styles.statusCol}>
                      <View
                        style={[
                          styles.badge,
                          item.status === 'Paid'
                            ? styles.badgePaid
                            : item.status === 'Rejected'
                            ? styles.badgeRejected
                            : styles.badgeWaiting,
                        ]}>
                        <Text style={styles.badgeText}>{item.status}</Text>
                      </View>
                      <Text style={styles.amountText}>{formatPrice(item.amount)}</Text>
                    </View>
                  </View>

                  {/* Slip Preview & Enlarge */}
                  <View style={styles.slipWrapper}>
                    {item.paymentSlipUrl || item.paymentSlip ? (
                      <TouchableOpacity
                        style={styles.slipImageBox}
                        onPress={() => setPreviewSlipUrl(item.paymentSlipUrl || item.paymentSlip || null)}
                        activeOpacity={0.85}>
                        <Image
                          source={{ uri: item.paymentSlipUrl || item.paymentSlip }}
                          style={styles.slipThumb}
                          resizeMode="cover"
                        />
                        <View style={styles.enlargeOverlay}>
                          <Ionicons name="expand" size={16} color="#FFFFFF" />
                          <Text style={styles.enlargeText}>Enlarge Slip</Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.noSlipBox}>
                        <Text style={styles.noSlipText}>No Slip Attached (Cash on Delivery)</Text>
                      </View>
                    )}
                  </View>

                  {/* Rejection Note if Rejected */}
                  {item.status === 'Rejected' && item.rejectReason && (
                    <View style={styles.rejectionNotice}>
                      <Ionicons name="alert-circle" size={16} color={FootballTheme.colors.danger} />
                      <Text style={styles.rejectionText}>Reason: {item.rejectReason}</Text>
                    </View>
                  )}

                  {/* Action Buttons if Waiting */}
                  {isWaiting && (
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => handleApprove(item.id)}
                        disabled={isProcessing}
                        activeOpacity={0.85}>
                        <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                        <Text style={styles.approveBtnText}>APPROVE PAYMENT</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => {
                          setRejectingPayment(item);
                          setRejectReason('');
                        }}
                        disabled={isProcessing}
                        activeOpacity={0.85}>
                        <Ionicons name="close-circle" size={16} color="#FFFFFF" />
                        <Text style={styles.rejectBtnText}>REJECT</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
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
  countBadge: {
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
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: FootballTheme.radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
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
  paymentsList: {
    gap: 16,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.sm,
  },
  cardHeader: {
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
  customerName: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  statusCol: {
    alignItems: 'flex-end',
    gap: 4,
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
  amountText: {
    fontSize: 16,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
  },
  slipWrapper: {
    marginVertical: 10,
  },
  slipImageBox: {
    width: '100%',
    height: 140,
    borderRadius: FootballTheme.radius.md,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    position: 'relative',
  },
  slipThumb: {
    width: '100%',
    height: '100%',
  },
  enlargeOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  enlargeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noSlipBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: FootballTheme.radius.md,
    alignItems: 'center',
  },
  noSlipText: {
    fontSize: 12,
    color: FootballTheme.colors.textLight,
  },
  rejectionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: FootballTheme.radius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 10,
  },
  rejectionText: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: FootballTheme.radius.md,
  },
  approveBtn: {
    backgroundColor: '#059669',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  rejectBtn: {
    backgroundColor: FootballTheme.colors.danger,
    maxWidth: 130,
  },
  rejectBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
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
  fullSlipImage: {
    width: '95%',
    height: '85%',
  },
  rejectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rejectModalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    padding: 20,
    ...FootballTheme.shadow.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rejectModalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
  },
  rejectModalDesc: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  rejectInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: FootballTheme.colors.border,
    borderRadius: FootballTheme.radius.md,
    padding: 12,
    height: 80,
    fontSize: 13,
    color: FootballTheme.colors.darkNavy,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  rejectActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelRejectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cancelRejectText: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.textMuted,
  },
  confirmRejectBtn: {
    backgroundColor: FootballTheme.colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: FootballTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmRejectText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
