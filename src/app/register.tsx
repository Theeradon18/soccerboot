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

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { register } = useAuth();
  const router = useRouter();
  const { isDesktop, isTablet } = useResponsive();

  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;

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

  const validateForm = (): string | null => {
    if (!fullName.trim()) return 'Please enter your full name';
    if (!username.trim() || username.trim().length < 3)
      return 'Username must be at least 3 characters';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim()))
      return 'Please enter a valid email address';
    if (!password || password.length < 6)
      return 'Password must be at least 6 characters';
    if (password !== confirmPassword)
      return 'Passwords do not match';
    return null;
  };

  const handleRegister = async () => {
    setErrorMessage('');
    const validationErr = validateForm();
    if (validationErr) {
      setErrorMessage(validationErr);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        full_name: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      // Navigate to Customer Home
      router.replace('/home' as any);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.pitchPattern}>
        <View style={styles.pitchCircle} />
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
          <Text style={styles.title}>JOIN BOOTZONE</Text>
          <View style={styles.subtitlePill}>
            <Text style={styles.subtitle}>CREATE CUSTOMER ACCOUNT</Text>
          </View>
        </View>

        {/* Register Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardFadeAnim,
              transform: [{ translateY: cardTranslateY }],
            },
          ]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>New Customer Sign Up</Text>
            <Text style={styles.cardDesc}>
              Join the club to browse exclusive cleats, track orders, and checkout seamlessly
            </Text>
          </View>

          {/* Error Banner */}
          {errorMessage.length > 0 && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={FootballTheme.colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'name' && styles.inputWrapperFocused,
              ]}>
              <Ionicons
                name="person-outline"
                size={18}
                color={focusedField === 'name' ? FootballTheme.colors.primary : FootballTheme.colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                value={fullName}
                onChangeText={(t) => {
                  setFullName(t);
                  setErrorMessage('');
                }}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. Somchai Srisuk"
                placeholderTextColor={FootballTheme.colors.textLight}
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username * (min 3 chars)</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'user' && styles.inputWrapperFocused,
              ]}>
              <Ionicons
                name="at-outline"
                size={18}
                color={focusedField === 'user' ? FootballTheme.colors.primary : FootballTheme.colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                value={username}
                onChangeText={(t) => {
                  setUsername(t);
                  setErrorMessage('');
                }}
                onFocus={() => setFocusedField('user')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. somchai99"
                placeholderTextColor={FootballTheme.colors.textLight}
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'email' && styles.inputWrapperFocused,
              ]}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={focusedField === 'email' ? FootballTheme.colors.primary : FootballTheme.colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrorMessage('');
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. somchai@example.com"
                placeholderTextColor={FootballTheme.colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number (Optional)</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'phone' && styles.inputWrapperFocused,
              ]}>
              <Ionicons
                name="call-outline"
                size={18}
                color={focusedField === 'phone' ? FootballTheme.colors.primary : FootballTheme.colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  setErrorMessage('');
                }}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. 0812345678"
                placeholderTextColor={FootballTheme.colors.textLight}
                keyboardType="phone-pad"
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password * (min 6 chars)</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'pass' && styles.inputWrapperFocused,
              ]}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={focusedField === 'pass' ? FootballTheme.colors.primary : FootballTheme.colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setErrorMessage('');
                }}
                onFocus={() => setFocusedField('pass')}
                onBlur={() => setFocusedField(null)}
                placeholder="Create password"
                placeholderTextColor={FootballTheme.colors.textLight}
                secureTextEntry={!showPassword}
                editable={!isSubmitting}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={FootballTheme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'confirm' && styles.inputWrapperFocused,
              ]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={focusedField === 'confirm' ? FootballTheme.colors.primary : FootballTheme.colors.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  setErrorMessage('');
                }}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
                placeholder="Confirm your password"
                placeholderTextColor={FootballTheme.colors.textLight}
                secureTextEntry={!showConfirmPassword}
                editable={!isSubmitting}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={FootballTheme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Role Pill Indicator */}
          <View style={styles.roleNotice}>
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text style={styles.roleNoticeText}>
              Account will be created as <Text style={styles.roleHighlight}>Customer Role</Text>
            </Text>
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <SportButton
              title="CREATE ACCOUNT"
              variant="primary"
              size="lg"
              onPress={handleRegister}
              loading={isSubmitting}
              loadingText="Creating Account..."
              disabled={isSubmitting}
              fullWidth
              icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
            />
          </View>

          {/* Back to Login Link */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.75}>
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.loginLinkHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 36,
  },
  scrollContentDesktop: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: FootballTheme.colors.lightBlue,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...FootballTheme.shadow.sm,
  },
  logoIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
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
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.lg,
  },
  cardHeader: {
    marginBottom: 18,
  },
  cardTitle: {
    color: FootballTheme.colors.darkNavy,
    fontSize: 20,
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
    marginBottom: 14,
  },
  label: {
    color: FootballTheme.colors.darkNavy,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: FootballTheme.radius.md,
    borderWidth: 1.5,
    borderColor: FootballTheme.colors.border,
    paddingHorizontal: 14,
    height: 46,
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
    fontSize: 14,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 4,
  },
  roleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 10,
    borderRadius: FootballTheme.radius.sm,
    gap: 8,
    marginVertical: 12,
  },
  roleNoticeText: {
    fontSize: 12,
    color: '#065F46',
  },
  roleHighlight: {
    fontWeight: '800',
    color: '#047857',
  },
  buttonContainer: {
    marginTop: 6,
  },
  loginLink: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 6,
  },
  loginLinkText: {
    color: FootballTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  loginLinkHighlight: {
    color: FootballTheme.colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
