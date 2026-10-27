import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomerHeader } from '../components/CustomerHeader';
import { CustomerProductCard } from '../components/CustomerProductCard';
import { FootballTheme } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';
import { api } from '../services/api';
import { Product } from '../types/Product';

const BRANDS = ['All', 'Nike', 'Adidas', 'Puma', 'Mizuno', 'New Balance'];
const STUD_TYPES = ['All', 'FG', 'AG', 'MG', 'TF', 'IC'];

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { isDesktop, isTablet, columns } = useResponsive();
  const scrollViewRef = useRef<ScrollView>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStud, setSelectedStud] = useState('All');

  // Hero animations
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(heroScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError('Could not load products. Please check connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const scrollToShop = () => {
    scrollViewRef.current?.scrollTo({ y: 360, animated: true });
  };

  // Filter products
  const filteredProducts = products.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.model && item.model.toLowerCase().includes(q)) ||
      (item.brand && item.brand.toLowerCase().includes(q)) ||
      (item.color && item.color.toLowerCase().includes(q));

    const matchesBrand =
      selectedBrand === 'All' ||
      (item.brand && item.brand.toLowerCase() === selectedBrand.toLowerCase());

    const matchesStud =
      selectedStud === 'All' ||
      (item.category && item.category.toUpperCase().includes(selectedStud.toUpperCase()));

    return matchesSearch && matchesBrand && matchesStud;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('All');
    setSelectedStud('All');
  };

  return (
    <View style={styles.screen}>
      <CustomerHeader />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[FootballTheme.colors.primary]}
          />
        }>
        {/* Hero Banner Section */}
        <Animated.View
          style={[
            styles.heroCard,
            {
              opacity: heroFade,
              transform: [{ scale: heroScale }],
            },
          ]}>
          <View style={styles.heroBackgroundLines}>
            <View style={styles.heroCircle} />
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>SEASON 2026 DROPS</Text>
            </View>

            <Text style={styles.heroTitle}>FIND YOUR PERFECT BOOTS</Text>

            <Text style={styles.heroSubtitle}>
              Choose the cleats made for your game — Engineered for Speed, Control & Power on any pitch.
            </Text>

            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                style={styles.heroCtaBtn}
                onPress={scrollToShop}
                activeOpacity={0.85}>
                <Ionicons name="flash" size={18} color="#FFFFFF" />
                <Text style={styles.heroCtaText}>SHOP NOW</Text>
              </TouchableOpacity>

              <View style={styles.heroHighlights}>
                <View style={styles.heroHighlightItem}>
                  <Text style={styles.heroHighlightValue}>100%</Text>
                  <Text style={styles.heroHighlightLabel}>Authentic</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroHighlightItem}>
                  <Text style={styles.heroHighlightValue}>฿50</Text>
                  <Text style={styles.heroHighlightLabel}>Fast Shipping</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Shop Container */}
        <View style={styles.shopContainer}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>EXPLORE CLEATS</Text>
              <Text style={styles.sectionSubtitle}>
                Browse top brands and stud configurations
              </Text>
            </View>
            <Text style={styles.itemCountBadge}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Boot' : 'Boots'}
            </Text>
          </View>

          {/* Search Input */}
          <View style={styles.searchWrapper}>
            <Ionicons
              name="search-outline"
              size={20}
              color={FootballTheme.colors.primary}
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
              ]}
              placeholder="Search by name, model, brand, or color..."
              placeholderTextColor={FootballTheme.colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={FootballTheme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Brand Filter Chips */}
          <View style={styles.filterSection}>
            <Text style={styles.filterGroupLabel}>Brand:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsRow}>
              {BRANDS.map((brand) => {
                const isSelected = selectedBrand === brand;
                return (
                  <TouchableOpacity
                    key={brand}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setSelectedBrand(brand)}
                    activeOpacity={0.75}>
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {brand}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Stud Type Filter Chips */}
          <View style={styles.filterSection}>
            <Text style={styles.filterGroupLabel}>Stud Type:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsRow}>
              {STUD_TYPES.map((stud) => {
                const isSelected = selectedStud === stud;
                return (
                  <TouchableOpacity
                    key={stud}
                    style={[styles.studChip, isSelected && styles.studChipActive]}
                    onPress={() => setSelectedStud(stud)}
                    activeOpacity={0.75}>
                    <Text style={[styles.studChipText, isSelected && styles.studChipTextActive]}>
                      {stud}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={FootballTheme.colors.primary} />
              <Text style={styles.loadingText}>Fetching latest boots...</Text>
            </View>
          )}

          {/* Error View */}
          {error && !loading && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={36} color={FootballTheme.colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchProducts}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProducts.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⚽</Text>
              <Text style={styles.emptyTitle}>No Boots Found</Text>
              <Text style={styles.emptySubtitle}>
                No products match your current search or filter criteria.
              </Text>
              <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                <Ionicons name="refresh-outline" size={16} color={FootballTheme.colors.primary} />
                <Text style={styles.resetBtnText}>Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Product Grid */}
          {!loading && !error && filteredProducts.length > 0 && (
            <View style={styles.grid}>
              {filteredProducts.map((product, index) => {
                const widthPercent =
                  columns === 4
                    ? '25%'
                    : columns === 3
                    ? '33.333%'
                    : columns === 2
                    ? '50%'
                    : '100%';

                return (
                  <View key={product.id} style={{ width: widthPercent as any }}>
                    <CustomerProductCard
                      product={product}
                      index={index}
                      onPress={() =>
                        router.push({
                          pathname: '/product-detail' as any,
                          params: { id: String(product.id) },
                        })
                      }
                    />
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  heroCard: {
    backgroundColor: FootballTheme.colors.darkNavy,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: FootballTheme.radius.xl,
    padding: 28,
    position: 'relative',
    overflow: 'hidden',
    maxWidth: 1360,
    alignSelf: 'center',
    width: Platform.OS === 'web' ? 'calc(100% - 32px)' : undefined,
    ...FootballTheme.shadow.md,
  },
  heroBackgroundLines: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'flex-end',
    opacity: 0.15,
  },
  heroCircle: {
    width: 380,
    height: 380,
    borderRadius: 190,
    borderWidth: 4,
    borderColor: '#38BDF8',
    marginRight: -100,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 680,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: FootballTheme.radius.full,
    marginBottom: 12,
  },
  heroBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    lineHeight: 38,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '500',
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 20,
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: FootballTheme.colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: FootballTheme.radius.full,
    ...FootballTheme.shadow.sm,
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroHighlights: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroHighlightItem: {
    alignItems: 'flex-start',
  },
  heroHighlightValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  heroHighlightLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  heroDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  shopContainer: {
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: FootballTheme.colors.textMuted,
    marginTop: 2,
  },
  itemCountBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: FootballTheme.radius.full,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.md,
    borderWidth: 1.5,
    borderColor: FootballTheme.colors.border,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    ...FootballTheme.shadow.sm,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: FootballTheme.colors.darkNavy,
    fontWeight: '500',
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterGroupLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
    marginRight: 10,
    minWidth: 70,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: FootballTheme.radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
  },
  chipActive: {
    backgroundColor: FootballTheme.colors.primary,
    borderColor: FootballTheme.colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.textMuted,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  studChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
  },
  studChipActive: {
    backgroundColor: FootballTheme.colors.darkNavy,
    borderColor: FootballTheme.colors.darkNavy,
  },
  studChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: FootballTheme.colors.textMuted,
  },
  studChipTextActive: {
    color: '#38BDF8',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: FootballTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    color: FootballTheme.colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: FootballTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: FootballTheme.radius.md,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
  },
  emptySubtitle: {
    fontSize: 13,
    color: FootballTheme.colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: FootballTheme.radius.full,
  },
  resetBtnText: {
    color: FootballTheme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginTop: 8,
  },
});
