import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FootballTheme } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { Product } from '../types/Product';

interface CustomerProductCardProps {
  product: Product;
  onPress: () => void;
  index?: number;
}

export const CustomerProductCard: React.FC<CustomerProductCardProps> = ({
  product,
  onPress,
  index = 0,
}) => {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Appearance Animation (Fade in + slide up)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // Press Scale
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: Math.min(index * 40, 300),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        delay: Math.min(index * 40, 300),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAddToCart = async (e: any) => {
    if (e?.stopPropagation) e.stopPropagation();
    if (product.stock <= 0) return;

    // Use default size or first available
    const defaultSize = product.size || '42';
    const success = await addToCart(product, defaultSize, 1);
    if (success) {
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 1400);
    }
  };

  const formattedPrice = Number(product.price).toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  });

  const hasImage = product.image_url && product.image_url.trim().length > 0 && !imageError;
  const inStock = Number(product.stock) > 0;

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY }, { scale: pressScale }],
        },
      ]}>
      <Pressable
        onPress={onPress}
        onHoverIn={Platform.OS === 'web' ? () => setIsHovered(true) : undefined}
        onHoverOut={Platform.OS === 'web' ? () => setIsHovered(false) : undefined}
        style={[
          styles.cardInner,
          isHovered && styles.cardHovered,
          Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
        ]}>
        {/* Top Image Showcase */}
        <View style={styles.imageWrapper}>
          {hasImage ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderBall}>⚽</Text>
              <Text style={styles.placeholderLabel}>BOOTZONE</Text>
              <Text style={styles.placeholderSub}>No Image Preview</Text>
            </View>
          )}

          {/* Category Stud Badge */}
          {product.category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {product.category.replace(' Football Boots', '').replace(' Shoes', '')}
              </Text>
            </View>
          ) : null}

          {/* Stock Indicator Badge */}
          <View style={[styles.stockBadge, inStock ? styles.stockIn : styles.stockOut]}>
            <View style={[styles.stockDot, { backgroundColor: inStock ? '#10B981' : '#EF4444' }]} />
            <Text style={[styles.stockText, { color: inStock ? '#065F46' : '#991B1B' }]}>
              {inStock ? `In Stock (${product.stock})` : 'Sold Out'}
            </Text>
          </View>
        </View>

        {/* Product Information Body */}
        <View style={styles.content}>
          {/* Brand & Model Row */}
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>{product.brand?.toUpperCase()}</Text>
            <Text style={styles.modelText} numberOfLines={1}>{product.model}</Text>
          </View>

          {/* Product Name */}
          <Text style={styles.nameText} numberOfLines={2}>
            {product.name}
          </Text>

          {/* Color & Size Specs */}
          <View style={styles.specChipsRow}>
            {product.color ? (
              <View style={styles.specChip}>
                <Ionicons name="color-palette-outline" size={11} color={FootballTheme.colors.primary} />
                <Text style={styles.specChipText} numberOfLines={1}>{product.color}</Text>
              </View>
            ) : null}
            <View style={styles.specChip}>
              <Ionicons name="resize-outline" size={11} color={FootballTheme.colors.primary} />
              <Text style={styles.specChipText}>
                Size: {product.size || '40-45'}
              </Text>
            </View>
          </View>

          {/* Price Row */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>PRICE</Text>
            <Text style={styles.priceText}>{formattedPrice}</Text>
          </View>

          {/* Action Buttons: View Details & Add to Cart */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={onPress}
              style={[styles.actionBtn, styles.detailsBtn]}
              activeOpacity={0.8}>
              <Text style={styles.detailsBtnText}>DETAILS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAddToCart}
              disabled={!inStock}
              style={[
                styles.actionBtn,
                styles.cartBtn,
                !inStock && styles.cartBtnDisabled,
                isAdded && styles.cartBtnSuccess,
              ]}
              activeOpacity={0.8}>
              <Ionicons
                name={isAdded ? 'checkmark-circle' : inStock ? 'cart' : 'close-circle'}
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.cartBtnText}>
                {isAdded ? 'ADDED ✓' : inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 6,
  },
  cardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.lg,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    overflow: 'hidden',
    ...FootballTheme.shadow.sm,
  },
  cardHovered: {
    borderColor: FootballTheme.colors.sky,
    ...FootballTheme.shadow.md,
    transform: [{ translateY: -3 }],
  },
  imageWrapper: {
    width: '100%',
    height: 190,
    backgroundColor: '#F0F9FF',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
  },
  placeholderBall: {
    fontSize: 44,
    marginBottom: 4,
  },
  placeholderLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
    letterSpacing: 1.5,
  },
  placeholderSub: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: FootballTheme.radius.full,
  },
  categoryBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: FootballTheme.radius.full,
    gap: 4,
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
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '900',
    color: FootballTheme.colors.primary,
    letterSpacing: 1,
  },
  modelText: {
    fontSize: 11,
    fontWeight: '600',
    color: FootballTheme.colors.textMuted,
    maxWidth: '55%',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
    lineHeight: 20,
    marginBottom: 8,
    minHeight: 40,
  },
  specChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FootballTheme.colors.background,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  specChipText: {
    fontSize: 11,
    color: FootballTheme.colors.textMuted,
    fontWeight: '600',
  },
  priceRow: {
    borderTopWidth: 1,
    borderTopColor: FootballTheme.colors.border,
    paddingTop: 8,
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: FootballTheme.colors.textLight,
    letterSpacing: 0.8,
  },
  priceText: {
    fontSize: 19,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: -0.2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    paddingVertical: 8,
    borderRadius: FootballTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  detailsBtn: {
    flex: 0.45,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
  },
  detailsBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: FootballTheme.colors.textMuted,
  },
  cartBtn: {
    flex: 0.55,
    backgroundColor: FootballTheme.colors.primary,
  },
  cartBtnSuccess: {
    backgroundColor: '#059669',
  },
  cartBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  cartBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
