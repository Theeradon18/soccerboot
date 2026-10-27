import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomerHeader } from '../components/CustomerHeader';
import { SportButton } from '../components/SportButton';
import { FootballTheme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuth();
  const { isDesktop, isTablet } = useResponsive();

  const [fullName, setFullName] = useState(user?.full_name || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (Platform.OS === 'web') {
        window.alert('Profile updated successfully!');
      } else {
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to update profile';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as any);
  };

  const initialLetter = (user?.full_name || user?.username || 'U')[0].toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <CustomerHeader />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View
            style={[
              styles.profileCard,
              (isDesktop || isTablet) && styles.profileCardDesktop,
            ]}>
            {/* Avatar & Basic Info */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initialLetter}</Text>
              </View>

              <Text style={styles.profileName}>
                {user?.full_name || user?.username || 'Customer User'}
              </Text>

              <View style={styles.roleBadge}>
                <Ionicons
                  name={user?.role === 'admin' ? 'shield-checkmark' : 'person'}
                  size={14}
                  color={FootballTheme.colors.primary}
                />
                <Text style={styles.roleBadgeText}>
                  {user?.role?.toUpperCase() || 'CUSTOMER'} ACCOUNT
                </Text>
              </View>

              <Text style={styles.memberSince}>
                Member since {new Date(user?.created_at || Date.now()).getFullYear()}
              </Text>
            </View>

            {/* Success Toast */}
            {saveSuccess && (
              <View style={styles.successToast}>
                <Ionicons name="checkmark-circle" size={18} color="#059669" />
                <Text style={styles.successToastText}>Profile updated successfully!</Text>
              </View>
            )}

            {/* Information Form */}
            <View style={styles.infoSection}>
              <View style={styles.infoHeaderRow}>
                <Text style={styles.sectionTitle}>ACCOUNT DETAILS</Text>
                {!isEditing ? (
                  <TouchableOpacity
                    style={styles.editToggleBtn}
                    onPress={() => setIsEditing(true)}>
                    <Ionicons name="pencil" size={14} color={FootballTheme.colors.primary} />
                    <Text style={styles.editToggleText}>Edit</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setIsEditing(false);
                      setFullName(user?.full_name || user?.name || '');
                      setEmail(user?.email || '');
                      setPhone(user?.phone || '');
                      setAddress(user?.address || '');
                    }}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Username (Read-only) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={[styles.inputBox, styles.inputDisabled]}>
                  <Ionicons name="at" size={16} color={FootballTheme.colors.textLight} />
                  <Text style={styles.readOnlyValue}>{user?.username}</Text>
                </View>
              </View>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Full name"
                  />
                ) : (
                  <View style={styles.inputBox}>
                    <Ionicons name="person-outline" size={16} color={FootballTheme.colors.textMuted} />
                    <Text style={styles.inputValue}>{fullName || 'Not provided'}</Text>
                  </View>
                )}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email address"
                    keyboardType="email-address"
                  />
                ) : (
                  <View style={styles.inputBox}>
                    <Ionicons name="mail-outline" size={16} color={FootballTheme.colors.textMuted} />
                    <Text style={styles.inputValue}>{email || 'Not provided'}</Text>
                  </View>
                )}
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Phone number"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <View style={styles.inputBox}>
                    <Ionicons name="call-outline" size={16} color={FootballTheme.colors.textMuted} />
                    <Text style={styles.inputValue}>{phone || 'Not provided'}</Text>
                  </View>
                )}
              </View>

              {/* Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Default Shipping Address</Text>
                {isEditing ? (
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                    ]}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter shipping address"
                    multiline
                    numberOfLines={3}
                  />
                ) : (
                  <View style={[styles.inputBox, { height: 'auto', minHeight: 46, paddingVertical: 10 }]}>
                    <Ionicons name="location-outline" size={16} color={FootballTheme.colors.textMuted} />
                    <Text style={styles.inputValue}>{address || 'Not provided'}</Text>
                  </View>
                )}
              </View>

              {/* Save Button when editing */}
              {isEditing && (
                <View style={styles.saveBtnWrapper}>
                  <SportButton
                    title="SAVE PROFILE CHANGES"
                    variant="primary"
                    size="md"
                    onPress={handleSave}
                    loading={isSaving}
                    fullWidth
                  />
                </View>
              )}
            </View>

            {/* Quick Links & Actions */}
            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => router.push('/orders' as any)}>
                <View style={styles.menuLeft}>
                  <Ionicons name="receipt-outline" size={20} color={FootballTheme.colors.primary} />
                  <Text style={styles.menuTitle}>My Order History</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={FootballTheme.colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => router.push('/cart' as any)}>
                <View style={styles.menuLeft}>
                  <Ionicons name="cart-outline" size={20} color={FootballTheme.colors.primary} />
                  <Text style={styles.menuTitle}>My Shopping Bag</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={FootballTheme.colors.textLight} />
              </TouchableOpacity>

              {user?.role === 'admin' && (
                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={() => router.push('/admin/dashboard' as any)}>
                  <View style={styles.menuLeft}>
                    <Ionicons name="shield-outline" size={20} color="#0B74DE" />
                    <Text style={[styles.menuTitle, { color: '#0B74DE' }]}>
                      Admin Management Panel
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#0B74DE" />
                </TouchableOpacity>
              )}

              {/* Sign Out Button */}
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}>
                <Ionicons name="log-out-outline" size={18} color={FootballTheme.colors.danger} />
                <Text style={styles.logoutBtnText}>SIGN OUT OF BOOTZONE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.md,
  },
  profileCardDesktop: {
    padding: 32,
  },
  avatarSection: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: FootballTheme.colors.border,
    paddingBottom: 20,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: FootballTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#BAE6FD',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: FootballTheme.radius.full,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: FootballTheme.colors.primary,
    letterSpacing: 1,
  },
  memberSince: {
    fontSize: 12,
    color: FootballTheme.colors.textLight,
    marginTop: 6,
  },
  successToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 10,
    borderRadius: FootballTheme.radius.md,
    marginBottom: 16,
  },
  successToastText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 0.8,
  },
  editToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: FootballTheme.radius.sm,
  },
  editToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.textMuted,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
    marginBottom: 5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: FootballTheme.radius.md,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    paddingHorizontal: 14,
    height: 44,
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
  },
  readOnlyValue: {
    fontSize: 14,
    color: FootballTheme.colors.textMuted,
    fontWeight: '600',
  },
  inputValue: {
    fontSize: 14,
    color: FootballTheme.colors.darkNavy,
    fontWeight: '500',
    flex: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.md,
    borderWidth: 1.5,
    borderColor: FootballTheme.colors.primary,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 14,
    color: FootballTheme.colors.darkNavy,
    fontWeight: '500',
  },
  textArea: {
    height: 70,
    paddingTop: 10,
  },
  saveBtnWrapper: {
    marginTop: 8,
  },
  actionsSection: {
    borderTopWidth: 1,
    borderTopColor: FootballTheme.colors.border,
    paddingTop: 16,
    gap: 10,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: FootballTheme.radius.md,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: FootballTheme.colors.darkNavy,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FootballTheme.colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 14,
    borderRadius: FootballTheme.radius.md,
    marginTop: 10,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: FootballTheme.colors.danger,
    letterSpacing: 0.5,
  },
});
