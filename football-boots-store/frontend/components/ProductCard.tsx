import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Product } from '../types/Product';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onEdit,
  onDelete,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleDeletePress = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete "${product.name}"?`);
      if (confirmed) {
        onDelete(product.id);
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        `Are you sure you want to delete "${product.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete(product.id),
          },
        ]
      );
    }
  };

  const formattedPrice = Number(product.price).toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  });

  const hasImage = product.image_url && product.image_url.trim() && !imageError;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image
            source={{ uri: product.image_url }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>⚽</Text>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        {/* Category Stud Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{product.category}</Text>
        </View>

        {/* Stock Badge */}
        <View style={[styles.stockBadge, product.stock > 0 ? styles.stockIn : styles.stockOut]}>
          <Text style={styles.stockText}>
            {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
          </Text>
        </View>
      </View>

      {/* Card Info */}
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <Text style={styles.brandText}>{product.brand.toUpperCase()}</Text>
          <Text style={styles.modelText}>{product.model}</Text>
        </View>

        <Text style={styles.nameText} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.specRow}>
          <Text style={styles.specItem}>🎨 {product.color}</Text>
          <Text style={styles.specItem}>👟 {product.size}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{formattedPrice}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnEdit]}
            onPress={onEdit}
            activeOpacity={0.8}
          >
            <Text style={styles.btnEditText}>✏️ Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnDelete]}
            onPress={handleDeletePress}
            activeOpacity={0.8}
          >
            <Text style={styles.btnDeleteText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 190,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 6,
  },
  placeholderText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  categoryBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  stockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stockIn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  stockOut: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  stockText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  brandText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modelText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 8,
  },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  specItem: {
    color: '#CBD5E1',
    fontSize: 12,
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  priceText: {
    color: '#10B981',
    fontSize: 20,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEdit: {
    backgroundColor: '#334155',
  },
  btnEditText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  btnDelete: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  btnDeleteText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});
