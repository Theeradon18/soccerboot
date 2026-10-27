import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Product } from '../types/Product';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';

export default function ProductsScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Protect route
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login' as any);
    }
  }, [isAuthenticated]);

  // Load products
  const fetchProducts = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการโหลดสินค้า');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Re-fetch when screen is focused (e.g. returning from Add or Edit)
  useFocusEffect(
    useCallback(() => {
      fetchProducts(false);
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProducts(false);
  };

  // Delete product handler
  const handleDeleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      // Remove locally immediately
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (Platform.OS === 'web') {
        window.alert('ลบสินค้าสำเร็จเรียบร้อย');
      } else {
        Alert.alert('สำเร็จ', 'ลบสินค้าสำเร็จเรียบร้อย');
      }
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(err.message || 'ลบสินค้าไม่สำเร็จ');
      } else {
        Alert.alert('เกิดข้อผิดพลาด', err.message || 'ลบสินค้าไม่สำเร็จ');
      }
    }
  };

  // Instant filter by Name, Brand, Model, Color, Category
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const model = (p.model || '').toLowerCase();
      const color = (p.color || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      return (
        name.includes(q) ||
        brand.includes(q) ||
        model.includes(q) ||
        color.includes(q) ||
        category.includes(q)
      );
    });
  }, [products, searchQuery]);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to log out?');
      if (confirmed) {
        logout();
        router.replace('/login' as any);
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login' as any);
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>⚽ FOOTBALL BOOTS</Text>
          <Text style={styles.headerSub}>Admin Store Management</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Logout 🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Action Bar: Search & Add Button */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />

      <View style={styles.actionToolbar}>
        <Text style={styles.countText}>
          Total items: <Text style={styles.countHighlight}>{filteredProducts.length}</Text>
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-product' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>＋ Add Product</Text>
        </TouchableOpacity>
      </View>

      {/* Error Retry Banner */}
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchProducts(true)}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() =>
                router.push({
                  pathname: '/product-detail' as any,
                  params: { id: item.id },
                })
              }
              onEdit={() =>
                router.push({
                  pathname: '/edit-product' as any,
                  params: { id: item.id },
                })
              }
              onDelete={handleDeleteProduct}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#10B981"
              colors={['#10B981']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `ไม่มีสินค้าที่ตรงกับคำค้นหา "${searchQuery}"`
                  : 'ยังไม่มีสินค้าในระบบ แตะปุ่ม "+ Add Product" เพื่อเพิ่มสินค้าใหม่'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Pitch Dark
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSub: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  actionToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  countText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  countHighlight: {
    color: '#10B981',
    fontWeight: '800',
  },
  addButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    flex: 1,
  },
  retryBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
