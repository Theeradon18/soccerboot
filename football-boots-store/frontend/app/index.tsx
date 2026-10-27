import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/products' as any);
      } else {
        router.replace('/login' as any);
      }
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Text style={styles.logoIcon}>⚽</Text>
      <Text style={styles.title}>FOOTBALL BOOTS STORE</Text>
      <Text style={styles.subtitle}>Premium Football Cleats Management</Text>
      <ActivityIndicator size="large" color="#10B981" style={styles.spinner} />
      <Text style={styles.loadingText}>Checking login status...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 32,
    textAlign: 'center',
  },
  spinner: {
    marginBottom: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 13,
  },
});