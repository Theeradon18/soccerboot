import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { SportButton } from '../components/SportButton';
import { FootballTheme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useResponsive } from '../hooks/useResponsive';
import { api } from '../services/api';
import { Product } from '../types/Product';

const AVAILABLE_SIZES = ['40', '41', '42', '43', '44', '45'];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { isDesktop, isTablet } = useResponsive();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Customer Shopping States
  const [selectedSize, setSelectedSize] = useState('42');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Delete Confirmation Modal (Admin)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Entry Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (id) {
      loadDetail(id);
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      // If product has a specified size and it is in our list, use it as default
      if (product.size && AVAILABLE_SIZES.includes(product.size)) {
        setSelectedSize(product.size);
      }
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [product]);

  const loadDetail = async (productId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getProductById(productId);
      setProduct(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;
    const success = await addToCart(product, selectedSize, quantity);
    if (success) {
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 1600);
    }
  };

  const handleConfirmDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await api.deleteProduct(product.id);
      setDeleteModalVisible(false);

      const successMsg = 'Product deleted successfully';
      if (Platform.OS === 'web') {
        window.alert(successMsg);
      } else {
        Alert.alert('Success', successMsg);
      }
      router.back();
    } catch (err: any) {
      const errMsg = err.message || 'Failed to delete product';
      if (Platform.OS === 'web') {
        window.alert(errMsg);
      } else {
        Alert.alert('Error', errMsg);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={FootballTheme.colors.primary} />
          <Text style={styles.loadingText}>Loading football boot details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={54} color={FootballTheme.colors.danger} />
          <Text style={styles.errorText}>{errorMessage || 'Football boot not found'}</Text>
          <SportButton
            title="← Back to Shop"
            variant="outline"
            onPress={() => router.back()}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const formattedPrice = Number(product.price).toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  });

  const hasImage = product.image_url && product.image_url.trim().length > 0 && !imageError;
  const inStock = Number(product.stock) > 0;

  return (
    <SafeAreaView style={styles.container}>
      <CustomerHeader />

      {/* Delete Confirmation Modal for Admin */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        productName={product.name}
        brand={product.brand}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) setDeleteModalVisible(false);
        }}
        isDeleting={isDeleting}
      />

      {/* Top Breadcrumb Navigation Bar */}
      <View style={styles.breadcrumbBar}>
        <TouchableOpacity
          style={styles.navBack}
          onPress={() => router.back()}
          activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={18} color={FootballTheme.colors.primary} />
          <Text style={styles.navBackText}>Back to Shop</Text>
        </TouchableOpacity>

        <Text style={styles.navTitle} numberOfLines={1}>
          {product.brand} • {product.model}
        </Text>

        {isAdmin && (
          <TouchableOpacity
            style={styles.quickEditBtn}
            onPress={() =>
              router.push({
                pathname: '/edit-product' as any,
                params: { id: product.id },
              })
            }
            activeOpacity={0.7}>
            <Ionicons name="pencil" size={15} color={FootballTheme.colors.primary} />
            <Text style={styles.quickEditText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content Body */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.contentContainer,
            (isDesktop || isTablet) && styles.contentContainerDesktop,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          {/* LEFT: Large Image Showcase */}
          <View style={[styles.imageSection, (isDesktop || isTablet) && styles.imageSectionDesktop]}>
            <View style={styles.imageCard}>
              {hasImage ? (
                <Image
                  source={{ uri: product.image_url }}
                  style={styles.largeImage}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <View style={styles.placeholderBox}>
                  <Text style={styles.placeholderBall}>⚽</Text>
                  <Text style={styles.placeholderTitle}>BOOTZONE CLEATS</Text>
                  <Text style={styles.placeholderDesc}>No high-res image provided</Text>
                </View>
              )}

              {/* Category Stud Pill */}
              {product.category ? (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {product.category.replace(' Football Boots', '').replace(' Shoes', '')}
                  </Text>
                </View>
              ) : null}

              {/* Stock Pill */}
              <View style={[styles.stockBadge, inStock ? styles.stockIn : styles.stockOut]}>
                <View style={[styles.stockDot, { backgroundColor: inStock ? '#10B981' : '#EF4444' }]} />
                <Text style={[styles.stockText, { color: inStock ? '#065F46' : '#991B1B' }]}>
                  {inStock ? `${product.stock} Pairs in Stock` : 'Out of Stock'}
                </Text>
              </View>
            </View>
          </View>

          {/* RIGHT: Product Specs, Size Selector, Quantity, Pricing & Actions */}
          <View style={[styles.detailsSection, (isDesktop || isTablet) && styles.detailsSectionDesktop]}>
            {/* Brand & Model Badges */}
            <View style={styles.brandRow}>
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>{product.brand?.toUpperCase()}</Text>
              </View>
              <Text style={styles.modelName}>{product.model}</Text>
            </View>

            {/* Product Title */}
            <Text style={styles.productTitle}>{product.name}</Text>

            {/* Price Card */}
            <View style={styles.priceCard}>
              <View>
                <Text style={styles.priceLabel}>PRICE</Text>
                <Text style={styles.priceValue}>{formattedPrice}</Text>
              </View>
              <View style={styles.guaranteeBadge}>
                <Ionicons name="shield-checkmark" size={16} color={FootballTheme.colors.primary} />
                <Text style={styles.guaranteeText}>100% Authentic Guarantee</Text>
              </View>
            </View>

            {/* Size Selector */}
            <View style={styles.sizeSection}>
              <View style={styles.sizeHeaderRow}>
                <Text style={styles.sectionHeader}>SELECT SIZE (EU)</Text>
                <Text style={styles.selectedSizeLabel}>Selected: EU {selectedSize}</Text>
              </View>
              <View style={styles.sizesRow}>
                {AVAILABLE_SIZES.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[styles.sizeChip, isSelected && styles.sizeChipActive]}
                      onPress={() => setSelectedSize(size)}
                      activeOpacity={0.75}>
                      <Text style={[styles.sizeText, isSelected && styles.sizeTextActive]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Quantity Selector */}
            <View style={styles.quantitySection}>
              <Text style={styles.sectionHeader}>QUANTITY</Text>
              <View style={styles.quantityControlRow}>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}>
                  <Ionicons name="remove" size={18} color={quantity <= 1 ? '#94A3B8' : FootballTheme.colors.darkNavy} />
                </TouchableOpacity>

                <View style={styles.qtyDisplay}>
                  <Text style={styles.qtyDisplayText}>{quantity}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.qtyBtn, quantity >= product.stock && styles.qtyBtnDisabled]}
                  onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || !inStock}>
                  <Ionicons
                    name="add"
                    size={18}
                    color={quantity >= product.stock ? '#94A3B8' : FootballTheme.colors.darkNavy}
                  />
                </TouchableOpacity>

                <Text style={styles.stockUnitsNotice}>
                  {inStock ? `(${product.stock} available)` : '(0 available)'}
                </Text>
              </View>
            </View>

            {/* Customer Add To Cart Buttons */}
            <View style={styles.customerActionsRow}>
              <TouchableOpacity
                style={[
                  styles.addToCartBtn,
                  !inStock && styles.addToCartBtnDisabled,
                  isAdded && styles.addToCartBtnSuccess,
                ]}
                onPress={handleAddToCart}
                disabled={!inStock}
                activeOpacity={0.85}>
                <Ionicons
                  name={isAdded ? 'checkmark-circle' : inStock ? 'cart' : 'close-circle'}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.addToCartText}>
                  {isAdded ? 'ADDED TO CART ✓' : inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cartShortcutBtn}
                onPress={() => router.push('/cart' as any)}
                activeOpacity={0.8}>
                <Ionicons name="bag-check-outline" size={20} color={FootballTheme.colors.primary} />
                <Text style={styles.cartShortcutText}>View Cart</Text>
              </TouchableOpacity>
            </View>

            {/* Specifications Grid */}
            <Text style={[styles.sectionHeader, { marginTop: 24 }]}>SPECIFICATIONS</Text>
            <View style={styles.specsGrid}>
              <View style={styles.specCard}>
                <View style={styles.specIconCircle}>
                  <Ionicons name="color-palette" size={16} color={FootballTheme.colors.primary} />
                </View>
                <View style={styles.specTextCol}>
                  <Text style={styles.specKey}>Colorway</Text>
                  <Text style={styles.specVal}>{product.color || 'Standard'}</Text>
                </View>
              </View>

              <View style={styles.specCard}>
                <View style={styles.specIconCircle}>
                  <Ionicons name="football" size={16} color={FootballTheme.colors.primary} />
                </View>
                <View style={styles.specTextCol}>
                  <Text style={styles.specKey}>Stud Category</Text>
                  <Text style={styles.specVal}>{product.category || 'General'}</Text>
                </View>
              </View>
            </View>

            {/* Description Panel */}
            <View style={styles.descSection}>
              <Text style={styles.sectionHeader}>PRODUCT DESCRIPTION & TECH</Text>
              <View style={styles.descCard}>
                <Text style={styles.descText}>
                  {product.description && product.description.trim().length > 0
                    ? product.description
                    : 'High-performance football boots engineered for explosive acceleration, high traction, and precision touch.'}
                </Text>
              </View>
            </View>

            {/* Admin Controls Section if Admin */}
            {isAdmin && (
              <View style={styles.adminControlsSection}>
                <Text style={styles.adminSectionTitle}>🛡️ ADMIN CONTROLS</Text>
                <View style={styles.adminActionsRow}>
                  <View style={{ flex: 1 }}>
                    <SportButton
                      title="EDIT PRODUCT"
                      variant="outline"
                      size="md"
                      fullWidth
                      icon={<Ionicons name="pencil-outline" size={16} color={FootballTheme.colors.primary} />}
                      onPress={() =>
                        router.push({
                          pathname: '/edit-product' as any,
                          params: { id: product.id },
                        })
                      }
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <SportButton
                      title="DELETE PRODUCT"
                      variant="danger"
                      size="md"
                      fullWidth
                      icon={<Ionicons name="trash-outline" size={16} color="#FFFFFF" />}
                      onPress={() => setDeleteModalVisible(true)}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        </Animated.View>
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
    fontWeight: '600',
    color: FootballTheme.colors.textMuted,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: FootballTheme.colors.danger,
    textAlign: 'center',
    marginTop: 8,
  },
  breadcrumbBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: FootballTheme.colors.border,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navBackText: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
    maxWidth: 240,
  },
  quickEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: FootballTheme.radius.full,
  },
  quickEditText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  contentContainer: {
    flexDirection: 'column',
    gap: 20,
  },
  contentContainerDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  imageSection: {
    width: '100%',
  },
  imageSectionDesktop: {
    flex: 1.1,
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    height: 420,
    ...FootballTheme.shadow.md,
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 24,
  },
  placeholderBall: {
    fontSize: 68,
    marginBottom: 8,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
    letterSpacing: 2,
  },
  placeholderDesc: {
    fontSize: 12,
    color: FootballTheme.colors.textLight,
    marginTop: 4,
  },
  categoryBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: FootballTheme.radius.full,
  },
  categoryBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stockBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: FootballTheme.radius.full,
    gap: 6,
  },
  stockIn: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  stockOut: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '800',
  },
  detailsSection: {
    width: '100%',
  },
  detailsSectionDesktop: {
    flex: 1.2,
    paddingLeft: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  brandBadge: {
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: FootballTheme.radius.full,
  },
  brandBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
    letterSpacing: 1,
  },
  modelName: {
    fontSize: 14,
    fontWeight: '600',
    color: FootballTheme.colors.textMuted,
  },
  productTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    lineHeight: 32,
    marginBottom: 16,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    padding: 16,
    borderRadius: FootballTheme.radius.lg,
    marginBottom: 20,
    ...FootballTheme.shadow.sm,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: FootballTheme.colors.textLight,
    letterSpacing: 0.8,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
    letterSpacing: -0.5,
  },
  guaranteeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: FootballTheme.radius.full,
  },
  guaranteeText: {
    fontSize: 11,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: FootballTheme.colors.textMuted,
    letterSpacing: 1,
  },
  sizeSection: {
    marginBottom: 18,
  },
  sizeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedSizeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  sizesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeChip: {
    width: 50,
    height: 44,
    borderRadius: FootballTheme.radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: FootballTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeChipActive: {
    borderColor: FootballTheme.colors.primary,
    backgroundColor: FootballTheme.colors.primary,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
  },
  sizeTextActive: {
    color: '#FFFFFF',
  },
  quantitySection: {
    marginBottom: 22,
  },
  quantityControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  qtyBtn: {
    width: 38,
    height: 38,
    borderRadius: FootballTheme.radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  qtyDisplay: {
    minWidth: 44,
    alignItems: 'center',
  },
  qtyDisplayText: {
    fontSize: 18,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
  },
  stockUnitsNotice: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    fontWeight: '500',
  },
  customerActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  addToCartBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FootballTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: FootballTheme.radius.lg,
    ...FootballTheme.shadow.sm,
  },
  addToCartBtnSuccess: {
    backgroundColor: '#059669',
  },
  addToCartBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cartShortcutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: FootballTheme.colors.lightBlue,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: FootballTheme.radius.lg,
  },
  cartShortcutText: {
    fontSize: 13,
    fontWeight: '800',
    color: FootballTheme.colors.primary,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  specCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    padding: 12,
    borderRadius: FootballTheme.radius.md,
    gap: 10,
    ...FootballTheme.shadow.sm,
  },
  specIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FootballTheme.colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specTextCol: {
    flex: 1,
  },
  specKey: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
    fontWeight: '600',
  },
  specVal: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
    marginTop: 1,
  },
  descSection: {
    marginBottom: 24,
  },
  descCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    padding: 16,
    borderRadius: FootballTheme.radius.lg,
    marginTop: 8,
    ...FootballTheme.shadow.sm,
  },
  descText: {
    fontSize: 14,
    color: FootballTheme.colors.darkNavy,
    lineHeight: 22,
  },
  adminControlsSection: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: FootballTheme.radius.lg,
    padding: 16,
    marginTop: 10,
  },
  adminSectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B45309',
    marginBottom: 12,
    letterSpacing: 1,
  },
  adminActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
