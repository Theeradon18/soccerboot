import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../services/api';
import { Product } from '../types/Product';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (id) {
      loadDetail(id);
    }
  }, [id]);

  const loadDetail = async (productId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getProductById(productId);
      setProduct(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!product) return;

    const performDelete = async () => {
      try {
        await api.deleteProduct(product.id);
        if (Platform.OS === 'web') {
          window.alert('ลบสินค้าสำเร็จเรียบร้อย');
        } else {
          Alert.alert('สำเร็จ', 'ลบสินค้าสำเร็จเรียบร้อย');
        }
        router.back();
      } catch (err: any) {
        if (Platform.OS === 'web') {
          window.alert(err.message || 'ลบสินค้าไม่สำเร็จ');
        } else {
          Alert.alert('เกิดข้อผิดพลาด', err.message || 'ลบสินค้าไม่สำเร็จ');
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete "${product.name}"?`);
      if (confirmed) performDelete();
    } else {
      Alert.alert('Confirm Delete', `Are you sure you want to delete "${product.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete },
      ]);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{errorMessage || 'Product not found'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back to Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedPrice = Number(product.price).toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  });

  const hasImage = product.image_url && product.image_url.trim() && !imageError;

  return (
    <SafeAreaView style={styles.container}>
      {/* Detail Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBack} onPress={() => router.back()}>
          <Text style={styles.navBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {product.brand} {product.model}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Large Product Image */}
        <View style={styles.largeImageContainer}>
          {hasImage ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.largeImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderIcon}>⚽</Text>
              <Text style={styles.placeholderLabel}>No Image Available</Text>
            </View>
          )}

          {/* Category Tag */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{product.category}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.body}>
          {/* Brand & Model */}
          <View style={styles.brandRow}>
            <Text style={styles.brandName}>{product.brand.toUpperCase()}</Text>
            <Text style={styles.modelName}>{product.model}</Text>
          </View>

          {/* Product Name */}
          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>{formattedPrice}</Text>
          </View>

          {/* Key Specs Grid */}
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specKey}>🎨 Color</Text>
              <Text style={styles.specVal}>{product.color}</Text>
            </View>

            <View style={styles.specBox}>
              <Text style={styles.specKey}>👟 Size</Text>
              <Text style={styles.specVal}>{product.size}</Text>
            </View>

            <View style={styles.specBox}>
              <Text style={styles.specKey}>📦 Stock</Text>
              <Text
                style={[
                  styles.specVal,
                  { color: product.stock > 0 ? '#10B981' : '#EF4444' },
                ]}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </Text>
            </View>

            <View style={styles.specBox}>
              <Text style={styles.specKey}>🏟️ Stud Type</Text>
              <Text style={styles.specVal}>{product.category}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Description</Text>
            <Text style={styles.descriptionText}>
              {product.description && product.description.trim()
                ? product.description
                : 'ไม่มีคำอธิบายสำหรับสินค้ารายการนี้'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() =>
                router.push({
                  pathname: '/edit-product' as any,
                  params: { id: product.id },
                })
              }
              activeOpacity={0.8}>
              <Text style={styles.editBtnText}>✏️ Edit Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
              activeOpacity={0.8}>
              <Text style={styles.deleteBtnText}>🗑️ Delete Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 15,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#10B981',
    fontWeight: '700',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  navBack: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  navBackText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '700',
  },
  navTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    maxWidth: 200,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  largeImageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#020617',
    position: 'relative',
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  placeholderLabel: {
    color: '#64748B',
    fontSize: 14,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryBadgeText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    padding: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  brandName: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modelName: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  productTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  priceValue: {
    color: '#10B981',
    fontSize: 26,
    fontWeight: '900',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  specBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  specKey: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  specVal: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  descriptionText: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 24,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
