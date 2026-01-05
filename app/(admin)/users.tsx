import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [gpsTraceId, setGpsTraceId] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLinkGPS = async () => {
    if (!selectedUser || !gpsTraceId.trim()) {
      showAlert('Error', 'Ingresa el ID de GPS-Trace');
      return;
    }

    setLinking(true);
    try {
      await api.patch(`/admin/users/${selectedUser.id}/gps-trace`, {
        gpsTraceUserId: gpsTraceId.trim(),
      });

      showAlert('Éxito', `GPS vinculado correctamente a ${selectedUser.name}`);
      setSelectedUser(null);
      setGpsTraceId('');
      fetchUsers();
    } catch (error: any) {
      console.error('Error linking GPS:', error);
      showAlert(
        'Error',
        error.response?.data?.message || 'No se pudo vincular el GPS'
      );
    } finally {
      setLinking(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    // Only show users with role USER (exclude ADMIN and INSTALLER)
    user.role === 'USER' &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      {/* Professional Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Usuarios</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>Gestión de usuarios del sistema</Text>
      </View>

      <View style={styles.content}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o email..."
            placeholderTextColor={Colors.light.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Users List */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card variant="elevated" style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userIcon}>
                  <Ionicons name="person-outline" size={24} color="#3b82f6" />
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>

                  <View style={styles.userMeta}>
                    <Badge
                      label={item.subscriptionPlan || 'FREE'}
                      variant={item.subscriptionPlan === 'FREE' ? 'neutral' : 'premium'}
                      size="sm"
                    />
                    {item.gpsTraceUserId && (
                      <Badge label="GPS Vinculado" variant="success" size="sm" />
                    )}
                  </View>
                </View>
              </View>

              {item.gpsTraceUserId ? (
                <View style={styles.linkedInfo}>
                  <Text style={styles.linkedLabel}>ID GPS-Trace:</Text>
                  <Text style={styles.linkedValue}>{item.gpsTraceUserId}</Text>
                </View>
              ) : (
                <Button
                  title="Vincular GPS"
                  onPress={() => setSelectedUser(item)}
                  variant="primary"
                  size="sm"
                  fullWidth
                  style={styles.linkButton}
                />
              )}
            </Card>
          )}
          ListEmptyComponent={
            <Card variant="outlined" style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No hay usuarios registrados</Text>
            </Card>
          }
        />

        {/* Link GPS Modal */}
        {selectedUser && (
          <View style={styles.modal}>
            <View style={styles.modalOverlay}>
              <Card variant="elevated" style={styles.modalContent}>
                <Text style={styles.modalTitle}>Vincular GPS</Text>
                <Text style={styles.modalSubtitle}>
                  Usuario: {selectedUser.name}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ID de GPS-Trace</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 12345"
                    placeholderTextColor={Colors.light.textTertiary}
                    value={gpsTraceId}
                    onChangeText={setGpsTraceId}
                    autoCapitalize="none"
                    editable={!linking}
                  />
                </View>

                <View style={styles.modalActions}>
                  <Button
                    title="Cancelar"
                    onPress={() => {
                      setSelectedUser(null);
                      setGpsTraceId('');
                    }}
                    variant="outline"
                    size="md"
                    style={{ flex: 1 }}
                    disabled={linking}
                  />
                  <Button
                    title="Vincular"
                    onPress={handleLinkGPS}
                    variant="gradient"
                    gradient={['#3b82f6', '#8b5cf6']}
                    size="md"
                    loading={linking}
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'web' ? Spacing.base : Spacing.xxxl,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
  },
  backButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: '#f3f4f6',
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    paddingHorizontal: Spacing.base,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.base,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  listContent: {
    paddingBottom: Spacing.xxxl,
  },
  userCard: {
    marginBottom: Spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs / 2,
  },
  userEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  userMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  linkedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  linkedLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  linkedValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  linkButton: {
    marginTop: Spacing.sm,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.base,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
  },
  modal: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
