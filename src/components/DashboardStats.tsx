import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FootballTheme } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';

interface DashboardStatsProps {
  totalProducts: number;
  totalStock: number;
  lowStock: number;
  categoriesCount: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalProducts,
  totalStock,
  lowStock,
  categoriesCount,
}) => {
  const { isMobile } = useResponsive();
  const animValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const animations = animValues.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 350,
        delay: index * 80,
        useNativeDriver: true,
      })
    );
    Animated.stagger(60, animations).start();
  }, [totalProducts, totalStock, lowStock, categoriesCount]);

  const stats = [
    {
      label: 'TOTAL BOOTS',
      value: totalProducts,
      icon: '⚽',
      color: FootballTheme.colors.primary,
      bg: FootballTheme.colors.lightBlue,
      sub: 'Active models',
    },
    {
      label: 'TOTAL STOCK',
      value: totalStock,
      icon: '📦',
      color: FootballTheme.colors.sky,
      bg: '#E0F7FA',
      sub: 'Units available',
    },
    {
      label: 'LOW STOCK',
      value: lowStock,
      icon: '⚠️',
      color: lowStock > 0 ? FootballTheme.colors.danger : FootballTheme.colors.success,
      bg: lowStock > 0 ? FootballTheme.colors.dangerLight : FootballTheme.colors.successLight,
      sub: 'Need restock (≤10)',
    },
    {
      label: 'CATEGORIES',
      value: categoriesCount,
      icon: '🏟️',
      color: '#8B5CF6',
      bg: '#F3E8FF',
      sub: 'Stud types (FG, TF...)',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        {stats.map((stat, idx) => {
          const translateY = animValues[idx].interpolate({
            inputRange: [0, 1],
            outputRange: [16, 0],
          });

          return (
            <Animated.View
              key={stat.label}
              style={[
                styles.card,
                isMobile && styles.cardMobile,
                {
                  opacity: animValues[idx],
                  transform: [{ translateY }],
                },
              ]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: stat.bg }]}>
                  <Text style={styles.iconText}>{stat.icon}</Text>
                </View>
                <View style={styles.badgeIndicator}>
                  <View style={[styles.liveDot, { backgroundColor: stat.color }]} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>

              <Text style={styles.statValue}>{stat.value.toLocaleString()}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statSub}>{stat.sub}</Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  gridMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.sm,
  },
  cardMobile: {
    minWidth: '47%',
    flex: 0,
    flexGrow: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  badgeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: FootballTheme.colors.textMuted,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: FootballTheme.colors.textMuted,
    letterSpacing: 0.8,
  },
  statSub: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
    marginTop: 4,
  },
});
