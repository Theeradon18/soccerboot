import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

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
      await login(username.trim(), password);
      // Navigate to products on success
      router.replace('/products' as any);
    } catch (err: any) {
      setErrorMessage(err.message || 'Username หรือ Password ไม่ถูกต้อง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillDemo = () => {
    setUsername('admin');
    setPassword('1234');
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.header}>
          <Text style={styles.logoBadge}>⚽</Text>
          <Text style={styles.title}>FOOTBALL BOOTS</Text>
          <Text style={styles.subtitle}>Store Management System</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardDesc}>เข้าสู่ระบบเพื่อจัดการคลังรองเท้าสตั๊ด</Text>

          {/* Error Message Banner */}
          {errorMessage.length > 0 && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username / Email</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setErrorMessage('');
                }}
                placeholder="Enter username (e.g. admin)"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessage('');
                }}
                placeholder="Enter password (e.g. 1234)"
                placeholderTextColor="#64748B"
                secureTextEntry
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
            activeOpacity={0.85}>
            {isSubmitting ? (
              <View style={styles.buttonInner}>
                <ActivityIndicator size="small" color="#0F172A" />
                <Text style={styles.loginButtonText}>Logging in...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Demo Credentials Quick Fill */}
          <TouchableOpacity
            style={styles.demoBox}
            onPress={autofillDemo}
            activeOpacity={0.7}>
            <Text style={styles.demoHeader}>💡 Test Account (แตะเพื่อเติมอัตโนมัติ):</Text>
            <Text style={styles.demoText}>Username: <Text style={styles.demoHighlight}>admin</Text></Text>
            <Text style={styles.demoText}>Password: <Text style={styles.demoHighlight}>1234</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Pitch Dark
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    fontSize: 54,
    marginBottom: 10,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    color: '#10B981', // Football Pitch Green
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardDesc: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  loginButton: {
    backgroundColor: '#10B981', // Football green
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoBox: {
    marginTop: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
  },
  demoHeader: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  demoText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  demoHighlight: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
