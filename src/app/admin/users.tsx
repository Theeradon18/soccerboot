import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FootballTheme } from '../../constants/theme';
import { api } from '../../services/api';
import { User } from '../../types/Product';

export default function AdminUsersScreen() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const customerCount = users.filter((u) => u.role === 'customer').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.push('/admin/dashboard' as any)}>
            <Ionicons name="arrow-back" size={16} color={FootballTheme.colors.primary} />
            <Text style={styles.backLinkText}>Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.countBadge}>{users.length} Registered Accounts</Text>
        </View>

        <Text style={styles.pageTitle}>USER DIRECTORY</Text>
        <Text style={styles.pageSubtitle}>
          List of registered store customers and administrative staff
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadUsers();
            }}
            colors={[FootballTheme.colors.primary]}
          />
        }>
        {/* Metric Cards */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>TOTAL ACCOUNTS</Text>
            <Text style={styles.metricValue}>{users.length}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>CUSTOMERS</Text>
            <Text style={[styles.metricValue, { color: '#059669' }]}>{customerCount}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>ADMINISTRATORS</Text>
            <Text style={[styles.metricValue, { color: FootballTheme.colors.primary }]}>
              {adminCount}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={FootballTheme.colors.primary} />
          <TextInput
            style={[styles.searchInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
            placeholder="Search users by name, username, or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={FootballTheme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Users List */}
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={FootballTheme.colors.primary} />
            <Text style={styles.loadingText}>Fetching registered accounts...</Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={54} color={FootballTheme.colors.textLight} />
            <Text style={styles.emptyTitle}>No matching users found</Text>
          </View>
        ) : (
          <View style={styles.usersList}>
            {filteredUsers.map((user) => {
              const isAdmin = user.role === 'admin';
              const initial = (user.full_name || user.username || 'U')[0].toUpperCase();

              return (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userCardLeft}>
                    <View
                      style={[
                        styles.avatarCircle,
                        isAdmin ? styles.avatarAdmin : styles.avatarCustomer,
                      ]}>
                      <Text style={styles.avatarLetter}>{initial}</Text>
                    </View>

                    <View style={styles.userInfo}>
                      <View style={styles.userNameRow}>
                        <Text style={styles.userFullName}>
                          {user.full_name || user.username}
                        </Text>
                        <View
                          style={[
                            styles.rolePill,
                            isAdmin ? styles.rolePillAdmin : styles.rolePillCustomer,
                          ]}>
                          <Text
                            style={[
                              styles.rolePillText,
                              isAdmin ? { color: '#0B74DE' } : { color: '#047857' },
                            ]}>
                            {user.role?.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.usernameText}>@{user.username}</Text>

                      <View style={styles.contactRow}>
                        {user.email ? (
                          <Text style={styles.contactItem}>✉️ {user.email}</Text>
                        ) : null}
                        {user.phone ? (
                          <Text style={styles.contactItem}>📞 {user.phone}</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  <View style={styles.userCardRight}>
                    <Text style={styles.registeredDate}>
                      Joined{' '}
                      {new Date(user.created_at || Date.now()).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: FootballTheme.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: FootballTheme.colors.primary,
  },
  countBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: FootballTheme.colors.primary,
    backgroundColor: FootballTheme.colors.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: FootballTheme.radius.full,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    fontSize: 12,
    color: FootballTheme.colors.textMuted,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.sm,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: FootballTheme.colors.textLight,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: FootballTheme.colors.darkNavy,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.md,
    borderWidth: 1.5,
    borderColor: FootballTheme.colors.border,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
    gap: 8,
    ...FootballTheme.shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: FootballTheme.colors.darkNavy,
    fontWeight: '500',
  },
  centerLoading: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: FootballTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FootballTheme.colors.textMuted,
  },
  usersList: {
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: FootballTheme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: FootballTheme.colors.border,
    ...FootballTheme.shadow.sm,
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAdmin: {
    backgroundColor: FootballTheme.colors.primary,
  },
  avatarCustomer: {
    backgroundColor: '#059669',
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userFullName: {
    fontSize: 15,
    fontWeight: '800',
    color: FootballTheme.colors.darkNavy,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: FootballTheme.radius.full,
    borderWidth: 1,
  },
  rolePillAdmin: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  rolePillCustomer: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  usernameText: {
    fontSize: 12,
    color: FootballTheme.colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  contactItem: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
  },
  userCardRight: {
    alignItems: 'flex-end',
  },
  registeredDate: {
    fontSize: 11,
    color: FootballTheme.colors.textLight,
  },
});
