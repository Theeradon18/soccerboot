import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomerHeader } from '../components/CustomerHeader';
import { FootballTheme } from '../constants/theme';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderId, total, method } = useLocalSearchParams<{
    orderId: string;
    total: string;
    method: string;
  }>();

  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formattedTotal = Number(total || 0).toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  });

  return (
    <SafeAreaView style={styles.container}>
      <CustomerHeader />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          {/* Animated Success Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={80} color="#059669" />
          </View>

          <Text style={styles.title}>ORDER PLACED!</Text>
          <Text style={styles.subtitle}>
            Thank you for shopping at BOOTZONE. Your order has been registered in our system.
          </Text>

          {/* Order Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ORDER ID</Text>
              <Text style={styles.orderIdValue}>{orderId || '#BZ20260001'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>PAYMENT METHOD</Text>
              <Text style={styles.detailVal}>{method || 'Bank Transfer'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.totalValue}>{formattedTotal}</Text>
            </View>

            <View style={styles.statusBadgeRow}>
              <View style={styles.statusPill}>
                <Ionicons name="hourglass-outline" size={14} color="#D97706" />
                <Text style={styles.statusText}>
                  {method === 'Cash on Delivery'
                    ? 'Pending (Cash on Delivery)'
                    : 'Waiting for Admin Verification'}
                </Text>
              </View>
            </View>
          </View>

          {/* Notice Box */}
          <View style={styles.noticeBox}>
            <Ionicons name="information-circle-outline" size={18} color={FootballTheme.colors.primary} />
            <Text style={styles.noticeText}>
              Our administrators will verify your payment slip and dispatch your football boots promptly.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsCol}>
            {orderId && (
              <TouchableOpacity
                style={styles.viewOrderBtn}
                onPress={() =>
                  router.push({
                    pathname: '/order-detail' as any,
                    params: { id: orderId },
                  })
                }
                activeOpacity={0.85}>
                <Ionicons name="receipt-outline" size={18} color="#FFFFFF" />
                <Text style={styles.viewOrderText}>VIEW ORDER DETAILS</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.continueShopBtn}
              onPress={() => router.push('/home' as any)}
              activeOpacity={0.85}>
              <Ionicons name="storefront-outline" size={18} color={FootballTheme.colors.primary} />
              <Text style={styles.continueShopText}>CONTINUE SHOPPING</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    padding: 28,
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.lg,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: FootballTheme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: FootballTheme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: FootballTheme.colors.textLight,
    letterSpacing: 0.5,
  },
  orderIdValue: {
    fontSize: 15,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
  },
  statusBadgeRow: {
    borderTopWidth: 1,
    borderTopColor: FootballTheme.colors.border,
    paddingTop: 10,
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: FootballTheme.radius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: FootballTheme.colors.lightBlue,
    padding: 12,
    borderRadius: FootballTheme.radius.md,
    marginTop: 16,
    width: '100%',
  },
  noticeText: {
    fontSize: 11,
    color: FootballTheme.colors.primary,
    flex: 1,
    lineHeight: 16,
    fontWeight: '600',
  },
  actionsCol: {
    width: '100%',
    gap: 10,
    marginTop: 20,
  },
  viewOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FootballTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: FootballTheme.radius.lg,
    ...FootballTheme.shadow.sm,
  },
  viewOrderText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  continueShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    paddingVertical: 14,
    borderRadius: FootballTheme.radius.lg,
  },
  continueShopText: {
    color: FootballTheme.colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
