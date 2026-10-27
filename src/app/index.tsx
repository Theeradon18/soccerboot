import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { FootballSplash } from '../components/FootballSplash';
import { FootballTheme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function IndexScreen() {
  const { isAuthenticated, isLoading, isCustomer } = useAuth();
  const router = useRouter();
  const [introFinished, setIntroFinished] = useState(false);

  const handleSplashFinish = () => {
    setIntroFinished(true);
  };

  useEffect(() => {
    if (introFinished && !isLoading) {
      if (isAuthenticated) {
        if (isCustomer) {
          router.replace('/home' as any);
        } else {
          router.replace('/products' as any);
        }
      } else {
        router.replace('/login' as any);
      }
    }
  }, [introFinished, isLoading, isAuthenticated, isCustomer]);

  return (
    <View style={styles.container}>
      <FootballSplash onFinish={handleSplashFinish} />

      {/* Fallback spinner if waiting for auth after splash */}
      {introFinished && isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={FootballTheme.colors.primary} />
          <Text style={styles.loadingText}>Loading BootZone...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FAFF',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: FootballTheme.colors.textMuted,
    fontWeight: '600',
  },
});