import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomerHeader } from '../components/CustomerHeader';
import { FootballTheme } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useResponsive } from '../hooks/useResponsive';
import { CartItem } from '../types/Product';

export default function CartScreen() {
  const router = useRouter();
  const { items, totalItems, subtotal, shipping, total, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { isDesktop, isTablet } = useResponsive();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const formatPrice = (val: number) => {
    return Number(val).toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    });
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomerHeader />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="cart-outline" size={64} color={FootballTheme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven't added any football boots to your bag yet.
          </Text>
          <TouchableOpacity
            style={styles.continueShopBtn}
            onPress={() => router.push('/home' as any)}
            activeOpacity={0.85}>
            <Ionicons name="football" size={18} color="#FFFFFF" />
            <Text style={styles.continueShopText}>START SHOPPING</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomerHeader />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>SHOPPING BAG</Text>
            <Text style={styles.pageSubtitle}>
              Review your selected cleats and proceed to checkout
            </Text>
          </View>

          <TouchableOpacity
            style={styles.clearCartBtn}
            onPress={clearCart}
            activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={15} color={FootballTheme.colors.danger} />
            <Text style={styles.clearCartText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.mainLayout,
            (isDesktop || isTablet) && styles.mainLayoutDesktop,
          ]}>
          {/* Cart Items List */}
          <View style={styles.itemsSection}>
            {items.map((item) => {
              const hasImg = item.image_url && !imageErrors[item.id];
              const itemTotal = item.price * item.quantity;

              return (
                <View key={item.id} style={styles.itemCard}>
                  {/* Image */}
                  <View style={styles.itemImageWrapper}>
                    {hasImg ? (
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.itemImage}
                        resizeMode="cover"
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <View style={styles.placeholderImg}>
                        <Text style={styles.placeholderIcon}>⚽</Text>
                      </View>
                    )}
                  </View>

                  {/* Details */}
                  <View style={styles.itemInfo}>
                    <View style={styles.itemTopRow}>
                      <Text style={styles.itemBrand}>{item.brand?.toUpperCase()}</Text>
                      <TouchableOpacity
                        onPress={() => removeFromCart(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="close" size={18} color={FootballTheme.colors.textMuted} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>

                    <View style={styles.itemSizeBadge}>
                      <Text style={styles.itemSizeText}>Size: EU {item.size}</Text>
                    </View>

                    <View style={styles.priceAndQtyRow}>
                      <View style={styles.qtyControls}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(item.id, -1)}>
                          <Ionicons name="remove" size={14} color={FootballTheme.colors.darkNavy} />
                        </TouchableOpacity>

                        <Text style={styles.qtyText}>{item.quantity}</Text>

                        <TouchableOpacity
                          style={[
                            styles.qtyBtn,
                            item.quantity >= item.stock && styles.qtyBtnDisabled,
                          ]}
                          onPress={() => updateQuantity(item.id, 1)}
                          disabled={item.quantity >= item.stock}>
                          <Ionicons
                            name="add"
                            size={14}
                            color={
                              item.quantity >= item.stock
                                ? '#94A3B8'
                                : FootballTheme.colors.darkNavy
                            }
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.itemTotalCol}>
                        <Text style={styles.itemUnitPrice}>{formatPrice(item.price)} each</Text>
                        <Text style={styles.itemTotalPrice}>{formatPrice(itemTotal)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Order Summary Card */}
          <View style={styles.summarySection}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items Subtotal ({totalItems})</Text>
                <Text style={styles.summaryVal}>{formatPrice(subtotal)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.shippingLabelRow}>
                  <Text style={styles.summaryLabel}>Shipping Fee</Text>
                  <View style={styles.fixedFeeBadge}>
                    <Text style={styles.fixedFeeText}>Flat Rate</Text>
                  </View>
                </View>
                <Text style={styles.summaryVal}>{formatPrice(shipping)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalVal}>{formatPrice(total)}</Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => router.push('/checkout' as any)}
                activeOpacity={0.85}>
                <Text style={styles.checkoutBtnText}>PROCEED TO CHECKOUT</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.guaranteeNote}>
                <Ionicons name="lock-closed" size={14} color="#059669" />
                <Text style={styles.guaranteeNoteText}>
                  Secure payment with verification and order protection
                </Text>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: FootballTheme.colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
  },
  emptySubtitle: {
    fontSize: 14,
    color: FootballTheme.colors.textMuted,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 20,
  },
  continueShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: FootballTheme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: FootballTheme.radius.full,
    marginTop: 12,
    ...FootballTheme.shadow.sm,
  },
  continueShopText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  clearCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: FootballTheme.colors.dangerLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: FootballTheme.radius.sm,
  },
  clearCartText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.danger,
  },
  mainLayout: {
    flexDirection: 'column',
    gap: 20,
  },
  mainLayoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemsSection: {
    flex: 1.4,
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.lg,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    padding: 12,
    gap: 14,
    ...FootballTheme.shadow.sm,
  },
  itemImageWrapper: {
    width: 90,
    height: 90,
    borderRadius: FootballTheme.radius.md,
    backgroundColor: '#F0F9FF',
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemBrand: {
    fontSize: 11,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
    letterSpacing: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
    marginVertical: 2,
  },
  itemSizeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: FootballTheme.colors.background,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  itemSizeText: {
    fontSize: 11,
    fontWeight: '600',
    color: FootballTheme.colors.darkNavy,
  },
  priceAndQtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    borderRadius: FootballTheme.radius.md,
    backgroundColor: '#F8FAFC',
  },
  qtyBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: {
    opacity: 0.35,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
    paddingHorizontal: 8,
  },
  itemTotalCol: {
    alignItems: 'flex-end',
  },
  itemUnitPrice: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
  },
  itemTotalPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
  },
  summarySection: {
    flex: 1,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shippingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fixedFeeBadge: {
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fixedFeeText: {
    fontSize: 10,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  summaryLabel: {
    fontSize: 13,
    color: FootballTheme.colors.textMuted,
    fontWeight: '500',
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
  },
  divider: {
    height: 1,
    backgroundColor: FootballTheme.colors.border,
    marginVertical: 14,
  },
  totalRow: {
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
  },
  totalVal: {
    fontSize: 24,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
    letterSpacing: -0.5,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FootballTheme.colors.primary,
    paddingVertical: 15,
    borderRadius: FootballTheme.radius.lg,
    ...FootballTheme.shadow.sm,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  guaranteeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    justifyContent: 'center',
  },
  guaranteeNoteText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '500',
  },
});
