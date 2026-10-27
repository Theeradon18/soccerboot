import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SportButton } from '../components/SportButton';
import { FootballTheme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const { isDesktop, isTablet } = useResponsive();

  // Animations
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      Animated.timing(errorAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      errorAnim.setValue(0);
    }
  }, [errorMessage]);

  const handleLogin = async () => {
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('กรุณากรอก Username หรือ Email');
      return;
    }
    if (!password) {
      setErrorMessage('กรุณากรอก Password');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedInUser = await login(username.trim(), password);
      if (loggedInUser.role === 'customer') {
        router.replace('/home' as any);
      } else {
        router.replace('/products' as any);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Username หรือ Password ไม่ถูกต้อง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillAdmin = () => {
    setUsername('admin');
    setPassword('1234');
    setErrorMessage('');
  };

  const autofillCustomer = () => {
    setUsername('customer1');
    setPassword('123456');
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Football Pitch Subtle Background Watermark */}
      <View style={styles.pitchPattern}>
        <View style={styles.pitchCircle} />
        <View style={styles.pitchGoalBox} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          (isDesktop || isTablet) && styles.scrollContentDesktop,
        ]}
        keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>⚽</Text>
          </View>
          <Text style={styles.title}>BOOTZONE</Text>
          <View style={styles.subtitlePill}>
            <Text style={styles.subtitle}>FOOTBALL BOOTS STORE</Text>
          </View>
          <Text style={styles.systemName}>Cleats & Inventory Management System</Text>
        </View>

        {/* Login Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardFadeAnim,
              transform: [{ translateY: cardTranslateY }],
            },
          ]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardDesc}>Sign in with your credentials to manage inventory</Text>
          </View>

          {/* Smooth Error Message Banner */}
          {errorMessage.length > 0 && (
            <Animated.View
              style={[
                styles.errorBox,
                {
                  opacity: errorAnim,
                  transform: [
                    {
                      translateY: errorAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-8, 0],
                      }),
                    },
                  ],
                },
              ]}>
              <Ionicons name="alert-circle" size={20} color={FootballTheme.colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </Animated.View>
          )}

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username / Email</Text>
            <View
              style={[
                styles.inputWrapper,
                isUsernameFocused && styles.inputWrapperFocused,
              ]}>
              <Ionicons
                name="person-outline"
                size={18}
                color={isUsernameFocused ? FootballTheme.colors.primary : FootballTheme.colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                ]}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setErrorMessage('');
                }}
                onFocus={() => setIsUsernameFocused(true)}
                onBlur={() => setIsUsernameFocused(false)}
                placeholder="Enter username (e.g. admin)"
                placeholderTextColor={FootballTheme.colors.textLight}
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Password Input with Show/Hide Toggle */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                isPasswordFocused && styles.inputWrapperFocused,
              ]}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={isPasswordFocused ? FootballTheme.colors.primary : FootballTheme.colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                ]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessage('');
                }}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                placeholder="Enter password (e.g. 1234)"
                placeholderTextColor={FootballTheme.colors.textLight}
                secureTextEntry={!showPassword}
                editable={!isSubmitting}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={FootballTheme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <View style={styles.buttonContainer}>
            <SportButton
              title="LOGIN"
              variant="primary"
              size="lg"
              onPress={handleLogin}
              loading={isSubmitting}
              loadingText="Signing In..."
              disabled={isSubmitting}
              fullWidth
              icon={<Ionicons name="log-in-outline" size={18} color="#FFFFFF" />}
            />
          </View>

          {/* Register Link */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push('/register' as any)}
            activeOpacity={0.75}>
            <Text style={styles.registerText}>
              Don't have an account?{' '}
              <Text style={styles.registerHighlight}>Create Account</Text>
            </Text>
          </TouchableOpacity>

          {/* Demo Credentials Quick Fill */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>⚡ Quick Demo Sign In</Text>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={styles.demoRoleBtn}
                onPress={autofillAdmin}
                activeOpacity={0.75}>
                <Ionicons name="shield-checkmark" size={14} color={FootballTheme.colors.primary} />
                <View>
                  <Text style={styles.demoRoleTitle}>Admin</Text>
                  <Text style={styles.demoRoleSubtitle}>admin / 1234</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoRoleBtn}
                onPress={autofillCustomer}
                activeOpacity={0.75}>
                <Ionicons name="cart" size={14} color="#059669" />
                <View>
                  <Text style={[styles.demoRoleTitle, { color: '#059669' }]}>Customer</Text>
                  <Text style={styles.demoRoleSubtitle}>customer1 / 123456</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  pitchPattern: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.08,
  },
  pitchCircle: {
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 2,
    borderColor: FootballTheme.colors.primary,
  },
  pitchGoalBox: {
    position: 'absolute',
    bottom: 0,
    width: 400,
    height: 140,
    borderWidth: 2,
    borderColor: FootballTheme.colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  scrollContentDesktop: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: FootballTheme.colors.lightBlue,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...FootballTheme.shadow.sm,
  },
  logoIcon: {
    fontSize: 34,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    color: FootballTheme.colors.darkNavy,
    textAlign: 'center',
  },
  subtitlePill: {
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: FootballTheme.radius.full,
    marginTop: 6,
  },
  subtitle: {
    color: FootballTheme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  systemName: {
    color: FootballTheme.colors.textMuted,
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    padding: 28,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.lg,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    color: FootballTheme.colors.darkNavy,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardDesc: {
    color: FootballTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FootballTheme.colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    borderRadius: FootballTheme.radius.md,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: FootballTheme.colors.danger,
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: FootballTheme.colors.darkNavy,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: FootballTheme.radius.md,
    borderWidth: 1.5,
    borderColor: FootballTheme.colors.border,
    paddingHorizontal: 14,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: FootballTheme.colors.primary,
    backgroundColor: '#FFFFFF',
    ...FootballTheme.shadow.sm,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: FootballTheme.colors.darkNavy,
    fontSize: 15,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 4,
  },
  buttonContainer: {
    marginTop: 8,
  },
  registerLink: {
    marginTop: 18,
    alignItems: 'center',
    paddingVertical: 6,
  },
  registerText: {
    color: FootballTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  registerHighlight: {
    color: FootballTheme.colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  demoSection: {
    marginTop: 20,
    backgroundColor: FootballTheme.colors.background,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: FootballTheme.radius.md,
    padding: 12,
  },
  demoTitle: {
    color: FootballTheme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoRoleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    borderRadius: FootballTheme.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    ...FootballTheme.shadow.sm,
  },
  demoRoleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: FootballTheme.colors.primary,
  },
  demoRoleSubtitle: {
    fontSize: 10,
    color: FootballTheme.colors.textMuted,
    fontWeight: '500',
  },
});
