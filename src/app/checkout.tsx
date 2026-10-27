import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomerHeader } from '../components/CustomerHeader';
import { FootballTheme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useResponsive } from '../hooks/useResponsive';
import { api } from '../services/api';
import { PaymentMethod } from '../types/Product';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { isDesktop, isTablet } = useResponsive();

  // Shipping Form
  const [customerName, setCustomerName] = useState(user?.full_name || user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [paymentSlip, setPaymentSlip] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formatPrice = (val: number) => {
    return Number(val).toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    });
  };

  const handleCopyAccount = () => {
    const acc = '123-4-56789-0';
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(acc);
    }
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleChooseSlip = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        const msg = 'Please grant photo permissions to attach payment slip';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Permission Required', msg);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          setPaymentSlip(`data:image/jpeg;base64,${asset.base64}`);
        } else {
          setPaymentSlip(asset.uri);
        }
        setErrorMessage('');
      }
    } catch (err) {
      console.error('Pick slip error:', err);
    }
  };

  // Demo sample slip for instant testing
  const useSampleSlip = () => {
    setPaymentSlip(
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60'
    );
    setErrorMessage('');
  };

  const validateCheckout = (): string | null => {
    if (!items || items.length === 0) return 'Your cart is empty';
    if (!customerName.trim()) return 'Please enter recipient full name';
    if (!customerPhone.trim()) return 'Please enter a contact phone number';
    if (!address.trim()) return 'Please enter shipping street address';
    if (!district.trim()) return 'Please enter district / amphoe';
    if (!province.trim()) return 'Please enter province';
    if (!postalCode.trim()) return 'Please enter postal code';

    if (paymentMethod !== 'Cash on Delivery' && !paymentSlip) {
      return 'Please attach a payment slip for verification';
    }

    return null;
  };

  const handlePlaceOrder = async () => {
    setErrorMessage('');
    const validationError = validateCheckout();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        userId: user?.id || 'guest',
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        items,
        subtotal,
        shipping,
        total,
        shippingAddress: {
          address: address.trim(),
          district: district.trim(),
          province: province.trim(),
          postalCode: postalCode.trim(),
        },
        paymentMethod,
        paymentSlip: paymentMethod === 'Cash on Delivery' ? '' : paymentSlip,
      };

      const order = await api.createOrder(orderPayload);
      if (order && order.id) {
        clearCart();
        router.replace({
          pathname: '/order-success' as any,
          params: {
            orderId: order.id,
            total: String(order.total),
            method: paymentMethod,
          },
        });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while placing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomerHeader />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.pageHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={18} color={FootballTheme.colors.primary} />
              <Text style={styles.backBtnText}>Back to Cart</Text>
            </TouchableOpacity>

            <Text style={styles.pageTitle}>CHECKOUT & PAYMENT</Text>
            <Text style={styles.pageSubtitle}>
              Fill in your delivery address and choose your payment method
            </Text>
          </View>

          {/* Error Banner */}
          {errorMessage.length > 0 && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={FootballTheme.colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Grid Layout: Left (Form & Payment) vs Right (Order Summary) */}
          <View
            style={[
              styles.layoutRow,
              (isDesktop || isTablet) && styles.layoutRowDesktop,
            ]}>
            {/* Left Column */}
            <View style={styles.leftCol}>
              {/* SECTION 1: Delivery Address */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="location-outline" size={20} color={FootballTheme.colors.primary} />
                  <Text style={styles.cardTitle}>1. Delivery Address</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Recipient Full Name *</Text>
                  <TextInput
                    style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                    value={customerName}
                    onChangeText={setCustomerName}
                    placeholder="e.g. Theeradon Suksom"
                    placeholderTextColor={FootballTheme.colors.textLight}
                  />
                </View>

                <View style={styles.twoInputsRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Phone Number *</Text>
                    <TextInput
                      style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                      value={customerPhone}
                      onChangeText={setCustomerPhone}
                      placeholder="e.g. 0812345678"
                      placeholderTextColor={FootballTheme.colors.textLight}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                      style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                      value={customerEmail}
                      onChangeText={setCustomerEmail}
                      placeholder="e.g. user@bootzone.com"
                      placeholderTextColor={FootballTheme.colors.textLight}
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Street Address & House No. *</Text>
                  <TextInput
                    style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="House number, Soi, Village, Road..."
                    placeholderTextColor={FootballTheme.colors.textLight}
                  />
                </View>

                <View style={styles.threeInputsRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>District / Amphoe *</Text>
                    <TextInput
                      style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                      value={district}
                      onChangeText={setDistrict}
                      placeholder="e.g. Muang"
                      placeholderTextColor={FootballTheme.colors.textLight}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Province *</Text>
                    <TextInput
                      style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                      value={province}
                      onChangeText={setProvince}
                      placeholder="e.g. Bangkok"
                      placeholderTextColor={FootballTheme.colors.textLight}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Postal Code *</Text>
                    <TextInput
                      style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                      value={postalCode}
                      onChangeText={setPostalCode}
                      placeholder="e.g. 10110"
                      placeholderTextColor={FootballTheme.colors.textLight}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>

              {/* SECTION 2: Payment Method */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="card-outline" size={20} color={FootballTheme.colors.primary} />
                  <Text style={styles.cardTitle}>2. Payment Method</Text>
                </View>

                {/* Method Options */}
                <View style={styles.paymentMethodsRow}>
                  {/* Bank Transfer */}
                  <TouchableOpacity
                    style={[
                      styles.methodOption,
                      paymentMethod === 'Bank Transfer' && styles.methodOptionActive,
                    ]}
                    onPress={() => setPaymentMethod('Bank Transfer')}
                    activeOpacity={0.8}>
                    <Ionicons
                      name="business"
                      size={20}
                      color={
                        paymentMethod === 'Bank Transfer'
                          ? FootballTheme.colors.primary
                          : FootballTheme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.methodText,
                        paymentMethod === 'Bank Transfer' && styles.methodTextActive,
                      ]}>
                      Bank Transfer
                    </Text>
                  </TouchableOpacity>

                  {/* PromptPay */}
                  <TouchableOpacity
                    style={[
                      styles.methodOption,
                      paymentMethod === 'PromptPay' && styles.methodOptionActive,
                    ]}
                    onPress={() => setPaymentMethod('PromptPay')}
                    activeOpacity={0.8}>
                    <Ionicons
                      name="qr-code"
                      size={20}
                      color={
                        paymentMethod === 'PromptPay'
                          ? FootballTheme.colors.primary
                          : FootballTheme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.methodText,
                        paymentMethod === 'PromptPay' && styles.methodTextActive,
                      ]}>
                      PromptPay QR
                    </Text>
                  </TouchableOpacity>

                  {/* Cash on Delivery */}
                  <TouchableOpacity
                    style={[
                      styles.methodOption,
                      paymentMethod === 'Cash on Delivery' && styles.methodOptionActive,
                    ]}
                    onPress={() => setPaymentMethod('Cash on Delivery')}
                    activeOpacity={0.8}>
                    <Ionicons
                      name="cash"
                      size={20}
                      color={
                        paymentMethod === 'Cash on Delivery'
                          ? FootballTheme.colors.primary
                          : FootballTheme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.methodText,
                        paymentMethod === 'Cash on Delivery' && styles.methodTextActive,
                      ]}>
                      Cash on Delivery
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Details per Method */}
                {paymentMethod === 'Bank Transfer' && (
                  <View style={styles.paymentDetailsBox}>
                    <View style={styles.bankHeaderRow}>
                      <View style={styles.bankLogoCircle}>
                        <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                      </View>
                      <View>
                        <Text style={styles.bankName}>BOOTZONE BANK</Text>
                        <Text style={styles.bankAccName}>Account: BOOTZONE STORE CO., LTD.</Text>
                      </View>
                    </View>

                    <View style={styles.accountNumberRow}>
                      <View>
                        <Text style={styles.accNumLabel}>ACCOUNT NUMBER</Text>
                        <Text style={styles.accNumValue}>123-4-56789-0</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={handleCopyAccount}
                        activeOpacity={0.75}>
                        <Ionicons
                          name={copiedAccount ? 'checkmark-circle' : 'copy-outline'}
                          size={14}
                          color={copiedAccount ? '#059669' : FootballTheme.colors.primary}
                        />
                        <Text
                          style={[
                            styles.copyBtnText,
                            copiedAccount && { color: '#059669' },
                          ]}>
                          {copiedAccount ? 'COPIED!' : 'COPY'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {paymentMethod === 'PromptPay' && (
                  <View style={styles.paymentDetailsBox}>
                    <View style={styles.promptPayCard}>
                      <View style={styles.promptPayLogoRow}>
                        <Text style={styles.promptPayLogoText}>PromptPay ⚡</Text>
                        <Text style={styles.promptPayAmount}>{formatPrice(total)}</Text>
                      </View>

                      <View style={styles.qrPlaceholder}>
                        <Ionicons name="qr-code" size={130} color={FootballTheme.colors.darkNavy} />
                        <Text style={styles.qrScanInstruction}>
                          Scan to pay with any Thai Banking App
                        </Text>
                        <Text style={styles.promptPayId}>PromptPay ID: 081-234-5678</Text>
                      </View>
                    </View>
                  </View>
                )}

                {paymentMethod === 'Cash on Delivery' && (
                  <View style={styles.codNoticeBox}>
                    <Ionicons name="information-circle" size={24} color="#0B74DE" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.codTitle}>Pay Upon Delivery</Text>
                      <Text style={styles.codDesc}>
                        Please have {formatPrice(total)} ready in cash or Thai QR transfer when the courier arrives at your address. No payment slip required now.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Slip Upload & Preview (Only if Bank Transfer or PromptPay) */}
                {paymentMethod !== 'Cash on Delivery' && (
                  <View style={styles.slipUploadSection}>
                    <Text style={styles.slipSectionTitle}>ATTACH PAYMENT SLIP *</Text>
                    <Text style={styles.slipSectionSubtitle}>
                      Upload transfer confirmation slip for instant admin approval
                    </Text>

                    {paymentSlip ? (
                      <View style={styles.slipPreviewBox}>
                        <Image
                          source={{ uri: paymentSlip }}
                          style={styles.slipPreviewImage}
                          resizeMode="contain"
                        />
                        <View style={styles.slipActionsRow}>
                          <TouchableOpacity
                            style={styles.slipChangeBtn}
                            onPress={handleChooseSlip}>
                            <Ionicons name="refresh" size={14} color={FootballTheme.colors.primary} />
                            <Text style={styles.slipChangeText}>Change Slip</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.slipRemoveBtn}
                            onPress={() => setPaymentSlip('')}>
                            <Ionicons name="trash" size={14} color={FootballTheme.colors.danger} />
                            <Text style={styles.slipRemoveText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.uploadButtonsRow}>
                        <TouchableOpacity
                          style={styles.uploadBtn}
                          onPress={handleChooseSlip}
                          activeOpacity={0.8}>
                          <Ionicons
                            name="cloud-upload-outline"
                            size={22}
                            color={FootballTheme.colors.primary}
                          />
                          <Text style={styles.uploadBtnText}>Choose Slip from Device</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.sampleSlipBtn}
                          onPress={useSampleSlip}
                          activeOpacity={0.8}>
                          <Text style={styles.sampleSlipText}>⚡ Use Demo Slip</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Right Column: Order Summary & Place Order */}
            <View style={styles.rightCol}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>

                {/* Items List */}
                <View style={styles.summaryItemsList}>
                  {items.map((item) => (
                    <View key={item.id} style={styles.summaryItemRow}>
                      <View style={styles.summaryItemLeft}>
                        <Text style={styles.summaryItemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.summaryItemSub}>
                          Size: {item.size} • Qty: {item.quantity}
                        </Text>
                      </View>
                      <Text style={styles.summaryItemTotal}>
                        {formatPrice(item.price * item.quantity)}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.divider} />

                {/* Price Breakdown */}
                <View style={styles.summaryPriceRow}>
                  <Text style={styles.summaryPriceLabel}>Subtotal</Text>
                  <Text style={styles.summaryPriceValue}>{formatPrice(subtotal)}</Text>
                </View>

                <View style={styles.summaryPriceRow}>
                  <Text style={styles.summaryPriceLabel}>Shipping Fee</Text>
                  <Text style={styles.summaryPriceValue}>{formatPrice(shipping)}</Text>
                </View>

                <View style={styles.divider} />

                <View style={[styles.summaryPriceRow, styles.grandTotalRow]}>
                  <Text style={styles.grandTotalLabel}>TOTAL DUE</Text>
                  <Text style={styles.grandTotalValue}>{formatPrice(total)}</Text>
                </View>

                {/* Place Order CTA Button */}
                <TouchableOpacity
                  style={[styles.placeOrderBtn, isSubmitting && styles.placeOrderBtnDisabled]}
                  onPress={handlePlaceOrder}
                  disabled={isSubmitting}
                  activeOpacity={0.85}>
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
                      <Text style={styles.placeOrderText}>CONFIRM & PLACE ORDER</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.safeNoticeRow}>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#059669" />
                  <Text style={styles.safeNoticeText}>
                    SSL Encrypted & Protected by BOOTZONE Guarantee
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  pageHeader: {
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FootballTheme.colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    borderRadius: FootballTheme.radius.md,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: FootballTheme.colors.danger,
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  layoutRow: {
    flexDirection: 'column',
    gap: 20,
  },
  layoutRowDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftCol: {
    flex: 1.4,
    gap: 20,
  },
  rightCol: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    padding: 20,
    ...FootballTheme.shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: FootballTheme.colors.border,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: FootballTheme.colors.border,
    borderRadius: FootballTheme.radius.md,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: FootballTheme.colors.darkNavy,
    fontWeight: '500',
  },
  twoInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  threeInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  methodOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: FootballTheme.colors.border,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: FootballTheme.radius.md,
  },
  methodOptionActive: {
    backgroundColor: FootballTheme.colors.lightBlue,
    borderColor: FootballTheme.colors.primary,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '700',
    color: FootballTheme.colors.textMuted,
    textAlign: 'center',
  },
  methodTextActive: {
    color: FootballTheme.colors.primary,
    fontWeight: '800',
  },
  paymentDetailsBox: {
    backgroundColor: FootballTheme.colors.background,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: FootballTheme.radius.lg,
    padding: 16,
    marginBottom: 16,
  },
  bankHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  bankLogoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: FootballTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    fontSize: 14,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 1,
  },
  bankAccName: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    fontWeight: '600',
  },
  accountNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: FootballTheme.radius.md,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
  },
  accNumLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: FootballTheme.colors.textLight,
  },
  accNumValue: {
    fontSize: 18,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: FootballTheme.radius.sm,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: FootballTheme.colors.primary,
  },
  promptPayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.lg,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
  },
  promptPayLogoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: FootballTheme.colors.border,
    paddingBottom: 8,
  },
  promptPayLogoText: {
    fontSize: 15,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
  },
  promptPayAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
  },
  qrPlaceholder: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  qrScanInstruction: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    fontWeight: '600',
    marginTop: 8,
  },
  promptPayId: {
    fontSize: 13,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
    marginTop: 4,
  },
  codNoticeBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 14,
    borderRadius: FootballTheme.radius.lg,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  codTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
    marginBottom: 2,
  },
  codDesc: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    lineHeight: 18,
  },
  slipUploadSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: FootballTheme.colors.border,
    paddingTop: 16,
  },
  slipSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 0.5,
  },
  slipSectionSubtitle: {
    fontSize: 11,
    color: FootballTheme.colors.textMuted,
    marginBottom: 12,
    marginTop: 2,
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FootballTheme.colors.lightBlue,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderStyle: 'dashed',
    paddingVertical: 14,
    borderRadius: FootballTheme.radius.lg,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  sampleSlipBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: FootballTheme.radius.lg,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    paddingVertical: 14,
  },
  sampleSlipText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
  },
  slipPreviewBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    borderRadius: FootballTheme.radius.lg,
    padding: 12,
  },
  slipPreviewImage: {
    width: '100%',
    height: 180,
    borderRadius: FootballTheme.radius.md,
  },
  slipActionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  slipChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slipChangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  slipRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slipRemoveText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.danger,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    padding: 20,
    ...FootballTheme.shadow.md,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 1,
    marginBottom: 16,
  },
  summaryItemsList: {
    gap: 10,
    marginBottom: 14,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItemLeft: {
    flex: 1,
    paddingRight: 10,
  },
  summaryItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
  },
  summaryItemSub: {
    fontSize: 11,
    color: FootballTheme.colors.textMuted,
    marginTop: 1,
  },
  summaryItemTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
  },
  divider: {
    height: 1,
    backgroundColor: FootballTheme.colors.border,
    marginVertical: 12,
  },
  summaryPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryPriceLabel: {
    fontSize: 13,
    color: FootballTheme.colors.textMuted,
    fontWeight: '500',
  },
  summaryPriceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
  },
  grandTotalRow: {
    marginTop: 4,
    marginBottom: 20,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FootballTheme.colors.primary,
    paddingVertical: 15,
    borderRadius: FootballTheme.radius.lg,
    ...FootballTheme.shadow.sm,
  },
  placeOrderBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  safeNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  safeNoticeText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '600',
  },
});
