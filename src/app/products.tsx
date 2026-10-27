import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  DimensionValue,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DashboardStats } from '../components/DashboardStats';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { SportButton } from '../components/SportButton';
import { FootballTheme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import { api } from '../services/api';
import { Product } from '../types/Product';

export default function ProductsScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const { isDesktop, isTablet, isMobile, columns, width } = useResponsive();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete Modal State
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Desktop active tab
  const [activeNavTab, setActiveNavTab] = useState<'products' | 'dashboard'>('products');

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

  useFocusEffect(
    useCallback(() => {
      fetchProducts(false);
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProducts(false);
  };

  // Open Delete Confirmation Modal
  const handleOpenDelete = (product: Product) => {
    setTargetProduct(product);
    setDeleteModalVisible(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!targetProduct) return;
    setIsDeleting(true);
    try {
      await api.deleteProduct(targetProduct.id);
      // Remove product immediately from local state
      setProducts((prev) => prev.filter((p) => p.id !== targetProduct.id));
      setDeleteModalVisible(false);
      setTargetProduct(null);

      const successMsg = 'ลบสินค้าสำเร็จเรียบร้อย';
      if (Platform.OS === 'web') {
        window.alert(successMsg);
      } else {
        Alert.alert('สำเร็จ', successMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || 'ลบสินค้าไม่สำเร็จ';
      if (Platform.OS === 'web') {
        window.alert(errMsg);
      } else {
        Alert.alert('เกิดข้อผิดพลาด', errMsg);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Compute Statistics for Dashboard
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
    const lowStock = products.filter((p) => Number(p.stock) <= 10).length;
    const uniqueCategories = new Set(products.map((p) => p.category).filter(Boolean));
    return {
      totalProducts,
      totalStock,
      lowStock,
      categoriesCount: uniqueCategories.size || 5,
    };
  }, [products]);

  // Filtered Products by Search & Category
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by Category
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(
        (p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
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
    }

    return result;
  }, [products, searchQuery, selectedCategory]);

  const handleLogout = () => {
    const performLogout = async () => {
      await logout();
      router.replace('/login' as any);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        performLogout();
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: performLogout },
      ]);
    }
  };

  // Calculate dynamic card width for responsive grid
  const contentWidth = isDesktop ? Math.min(width - 270, 1200) : width;
  const gridItemWidth = `${100 / columns}%` as DimensionValue;

  return (
    <SafeAreaView style={styles.container}>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        productName={targetProduct?.name || ''}
        brand={targetProduct?.brand}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) setDeleteModalVisible(false);
        }}
        isDeleting={isDeleting}
      />

      <View style={styles.layoutWrapper}>
        {/* ========================================================= */}
        {/* DESKTOP SIDEBAR NAVIGATION (Visible on Desktop)           */}
        {/* ========================================================= */}
        {isDesktop && (
          <View style={styles.desktopSidebar}>
            {/* Logo Branding */}
            <View style={styles.sidebarHeader}>
              <View style={styles.sidebarLogoBadge}>
                <Text style={styles.sidebarLogoIcon}>⚽</Text>
              </View>
              <View>
                <Text style={styles.sidebarBrandTitle}>BOOTZONE</Text>
                <Text style={styles.sidebarBrandSub}>FOOTBALL BOOTS STORE</Text>
              </View>
            </View>

            {/* Navigation Links */}
            <View style={styles.sidebarNav}>
              <TouchableOpacity
                style={[
                  styles.sidebarNavItem,
                  activeNavTab === 'products' && styles.sidebarNavItemActive,
                ]}
                onPress={() => setActiveNavTab('products')}
                activeOpacity={0.7}>
                <Ionicons
                  name="football-outline"
                  size={20}
                  color={activeNavTab === 'products' ? FootballTheme.colors.primary : FootballTheme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.sidebarNavText,
                    activeNavTab === 'products' && styles.sidebarNavTextActive,
                  ]}>
                  Products Catalog
                </Text>
                <View style={styles.sidebarCountBadge}>
                  <Text style={styles.sidebarCountBadgeText}>{products.length}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarNavItem}
                onPress={() => router.push('/admin/dashboard' as any)}
                activeOpacity={0.7}>
                <Ionicons
                  name="grid-outline"
                  size={20}
                  color={FootballTheme.colors.textMuted}
                />
                <Text style={styles.sidebarNavText}>Admin Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarNavItem}
                onPress={() => router.push('/admin/orders' as any)}
                activeOpacity={0.7}>
                <Ionicons
                  name="receipt-outline"
                  size={20}
                  color={FootballTheme.colors.textMuted}
                />
                <Text style={styles.sidebarNavText}>Orders Management</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarNavItem}
                onPress={() => router.push('/admin/payments' as any)}
                activeOpacity={0.7}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={FootballTheme.colors.textMuted}
                />
                <Text style={styles.sidebarNavText}>Verify Slips</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarNavItem}
                onPress={() => router.push('/admin/users' as any)}
                activeOpacity={0.7}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={FootballTheme.colors.textMuted}
                />
                <Text style={styles.sidebarNavText}>User Directory</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarNavItem}
                onPress={() => router.push('/add-product' as any)}
                activeOpacity={0.7}>
                <Ionicons name="add-circle-outline" size={20} color={FootballTheme.colors.primary} />
                <Text style={[styles.sidebarNavText, { color: FootballTheme.colors.primary, fontWeight: '700' }]}>
                  Add New Boot
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sidebarNavItem, { marginTop: 10, backgroundColor: FootballTheme.colors.lightBlue }]}
                onPress={() => router.push('/home' as any)}
                activeOpacity={0.7}>
                <Ionicons name="storefront-outline" size={20} color={FootballTheme.colors.primary} />
                <Text style={[styles.sidebarNavText, { color: FootballTheme.colors.primary, fontWeight: '700' }]}>
                  Customer Storefront
                </Text>
              </TouchableOpacity>
            </View>

            {/* User Profile & Logout */}
            <View style={styles.sidebarFooter}>
              <View style={styles.userCard}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {(user?.name || user?.username || 'A').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user?.name || user?.username || 'Admin'}
                  </Text>
                  <Text style={styles.userRole}>Store Manager</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.sidebarLogoutBtn}
                onPress={handleLogout}
                activeOpacity={0.7}>
                <Ionicons name="log-out-outline" size={18} color={FootballTheme.colors.danger} />
                <Text style={styles.sidebarLogoutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* MAIN STORE CONTENT AREA                                   */}
        {/* ========================================================= */}
        <View style={styles.mainContent}>
          {/* Top Navbar for Mobile & Tablet */}
          {!isDesktop && (
            <View style={styles.mobileHeader}>
              <View style={styles.mobileHeaderBrand}>
                <Text style={styles.mobileHeaderIcon}>⚽</Text>
                <View>
                  <Text style={styles.mobileHeaderTitle}>BOOTZONE</Text>
                  <Text style={styles.mobileHeaderSub}>FOOTBALL BOOTS STORE</Text>
                </View>
              </View>

              <View style={styles.mobileHeaderActions}>
                <SportButton
                  title="＋ Add"
                  size="sm"
                  variant="primary"
                  onPress={() => router.push('/add-product' as any)}
                />
                <TouchableOpacity
                  style={styles.mobileLogoutBtn}
                  onPress={handleLogout}
                  activeOpacity={0.7}>
                  <Ionicons name="log-out-outline" size={18} color={FootballTheme.colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Desktop Top Title Bar */}
          {isDesktop && (
            <View style={styles.desktopTopBar}>
              <View>
                <Text style={styles.desktopPageTitle}>Football Cleats Inventory</Text>
                <Text style={styles.desktopPageSub}>
                  Manage stock, pricing, and catalog for professional football boots
                </Text>
              </View>
              <View style={styles.desktopTopActions}>
                <SportButton
                  title="Refresh"
                  variant="outline"
                  size="md"
                  icon={<Ionicons name="refresh-outline" size={16} color={FootballTheme.colors.primary} />}
                  onPress={() => fetchProducts(true)}
                />
                <SportButton
                  title="＋ Add New Boots"
                  variant="primary"
                  size="md"
                  onPress={() => router.push('/add-product' as any)}
                />
              </View>
            </View>
          )}

          {/* Error Banner with Retry */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <View style={styles.errorBannerLeft}>
                <Ionicons name="alert-circle" size={20} color={FootballTheme.colors.danger} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
              <SportButton
                title="Retry"
                size="sm"
                variant="danger"
                onPress={() => fetchProducts(true)}
              />
            </View>
          )}

          {/* Product List / Dashboard Scroll Content */}
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={FootballTheme.colors.primary} />
              <Text style={styles.loadingText}>Loading Football Boots...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              key={columns} // Force fresh layout recalculation on column changes
              numColumns={columns}
              keyExtractor={(item) => String(item.id)}
              ListHeaderComponent={
                <View style={styles.headerComponentWrapper}>
                  {/* Football Statistics Cards */}
                  <DashboardStats
                    totalProducts={stats.totalProducts}
                    totalStock={stats.totalStock}
                    lowStock={stats.lowStock}
                    categoriesCount={stats.categoriesCount}
                  />

                  {/* Search and Category Filters */}
                  <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onClear={() => setSearchQuery('')}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />

                  {/* Summary Bar */}
                  <View style={styles.listSummaryBar}>
                    <Text style={styles.listSummaryText}>
                      Showing <Text style={styles.listSummaryHighlight}>{filteredProducts.length}</Text> of {products.length} boots
                      {selectedCategory !== 'All' ? ` • ${selectedCategory}` : ''}
                    </Text>

                    {(searchQuery.length > 0 || selectedCategory !== 'All') && (
                      <TouchableOpacity
                        style={styles.clearFilterBtn}
                        onPress={() => {
                          setSearchQuery('');
                          setSelectedCategory('All');
                        }}>
                        <Text style={styles.clearFilterText}>Reset Filters</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              }
              renderItem={({ item, index }) => (
                <View style={{ width: gridItemWidth }}>
                  <ProductCard
                    product={item}
                    index={index}
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
                    onDelete={handleOpenDelete}
                  />
                </View>
              )}
              contentContainerStyle={styles.flatListContent}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  tintColor={FootballTheme.colors.primary}
                  colors={[FootballTheme.colors.primary]}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyBall}>⚽</Text>
                  <Text style={styles.emptyTitle}>No football boots found</Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery || selectedCategory !== 'All'
                      ? 'No football boots match your current filters. Try resetting the search or category.'
                      : 'No products in inventory yet. Tap "+ Add New Boots" to create your first listing!'}
                  </Text>
                  {(searchQuery.length > 0 || selectedCategory !== 'All') && (
                    <SportButton
                      title="Clear All Filters"
                      variant="outline"
                      size="sm"
                      style={{ marginTop: 16 }}
                      onPress={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                    />
                  )}
                </View>
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  layoutWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  /* ========================================== */
  /* DESKTOP SIDEBAR STYLES                     */
  /* ========================================== */
  desktopSidebar: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: FootballTheme.colors.border,
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    ...FootballTheme.shadow.sm,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: FootballTheme.colors.border,
    marginBottom: 20,
  },
  sidebarLogoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FootballTheme.colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  sidebarLogoIcon: {
    fontSize: 22,
  },
  sidebarBrandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 1.5,
  },
  sidebarBrandSub: {
    fontSize: 10,
    fontWeight: '800',
    color: FootballTheme.colors.primary,
    letterSpacing: 1,
  },
  sidebarNav: {
    flex: 1,
    gap: 6,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: FootballTheme.radius.md,
    gap: 12,
  },
  sidebarNavItemActive: {
    backgroundColor: FootballTheme.colors.lightBlue,
  },
  sidebarNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: FootballTheme.colors.textMuted,
    flex: 1,
  },
  sidebarNavTextActive: {
    color: FootballTheme.colors.primary,
    fontWeight: '800',
  },
  sidebarCountBadge: {
    backgroundColor: FootballTheme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: FootballTheme.radius.full,
  },
  sidebarCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: FootballTheme.colors.border,
    paddingTop: 16,
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: FootballTheme.colors.darkNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
  },
  userRole: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
  },
  sidebarLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: FootballTheme.radius.md,
    backgroundColor: FootballTheme.colors.dangerLight,
    gap: 8,
  },
  sidebarLogoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: FootballTheme.colors.danger,
  },

  /* ========================================== */
  /* MAIN CONTENT STYLES                        */
  /* ========================================== */
  mainContent: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.sm,
  },
  mobileHeaderBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileHeaderIcon: {
    fontSize: 24,
  },
  mobileHeaderTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 1,
  },
  mobileHeaderSub: {
    fontSize: 9,
    fontWeight: '800',
    color: FootballTheme.colors.primary,
    letterSpacing: 0.8,
  },
  mobileHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileLogoutBtn: {
    backgroundColor: FootballTheme.colors.dangerLight,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: FootballTheme.colors.border,
  },
  desktopPageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 0.5,
  },
  desktopPageSub: {
    fontSize: 13,
    color: FootballTheme.colors.textMuted,
    marginTop: 2,
  },
  desktopTopActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerComponentWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listSummaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  listSummaryText: {
    fontSize: 13,
    color: FootballTheme.colors.textMuted,
    fontWeight: '500',
  },
  listSummaryHighlight: {
    color: FootballTheme.colors.primary,
    fontWeight: '800',
  },
  clearFilterBtn: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  clearFilterText: {
    fontSize: 12,
    color: FootballTheme.colors.primary,
    fontWeight: '700',
  },
  flatListContent: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: FootballTheme.colors.textMuted,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FootballTheme.colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: FootballTheme.radius.md,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
  },
  errorBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  errorBannerText: {
    color: FootballTheme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyBall: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: FootballTheme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 400,
  },
});
