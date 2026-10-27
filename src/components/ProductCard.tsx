import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FootballTheme } from '../constants/theme';
import { Product } from '../types/Product';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onEdit: () => void;
  onDelete: (product: Product) => void;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onEdit,
  onDelete,
  index = 0,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
        delay: Math.min(index * 50, 400),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        delay: Math.min(index * 50, 400),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 80,
    }).start();
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
          transform: [
            { translateY },
            { scale: pressScale },
          ],
        },
      ]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
              {inStock ? `Stock: ${product.stock}` : 'Out of Stock'}
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
            {product.size ? (
              <View style={styles.specChip}>
                <Ionicons name="resize-outline" size={11} color={FootballTheme.colors.primary} />
                <Text style={styles.specChipText} numberOfLines={1}>{product.size}</Text>
              </View>
            ) : null}
          </View>

          {/* Price Row */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>PRICE</Text>
              <Text style={styles.priceText}>{formattedPrice}</Text>
            </View>
          </View>

          {/* Action Buttons: Edit & Delete */}
          <View style={styles.actionsRow}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.editBtn,
                pressed && styles.actionBtnPressed,
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
              ]}>
              <Ionicons name="pencil-outline" size={14} color={FootballTheme.colors.primary} />
              <Text style={styles.editBtnText}>Edit</Text>
            </Pressable>

            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onDelete(product);
              }}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.deleteBtn,
                pressed && styles.actionBtnPressed,
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
              ]}>
              <Ionicons name="trash-outline" size={14} color={FootballTheme.colors.danger} />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </Pressable>
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
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: FootballTheme.radius.md,
    gap: 4,
    borderWidth: 1,
  },
  actionBtnPressed: {
    opacity: 0.8,
  },
  editBtn: {
    backgroundColor: FootballTheme.colors.lightBlue,
    borderColor: '#BAE6FD',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  deleteBtn: {
    backgroundColor: FootballTheme.colors.dangerLight,
    borderColor: '#FECACA',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.danger,
  },
});
