import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../../constants/Theme';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';

export default function DevicesScreen() {
    const [devices, setDevices] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await api.get('/devices');
            setDevices(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDevices();
        setRefreshing(false);
    };

    const filteredDevices = devices.filter(device => {
        if (filter === 'all') return true;
        if (filter === 'online') return device.online;
        if (filter === 'offline') return !device.online;
        return true;
    });

    const stats = {
        total: devices.length,
        online: devices.filter(d => d.online).length,
        offline: devices.filter(d => !d.online).length,
    };

    return (
        <View style={styles.container}>
            {/* Header with gradient */}
            <LinearGradient
                colors={['#3b82f6', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Mis Dispositivos</Text>
                <Text style={styles.headerSubtitle}>Gestiona tus dispositivos GPS</Text>
            </LinearGradient>

            <View style={styles.content}>
                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <TouchableOpacity
                        style={[styles.statCard, filter === 'all' && styles.statCardActive]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={styles.statNumber}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.statCard, filter === 'online' && styles.statCardActive]}
                        onPress={() => setFilter('online')}
                    >
                        <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
                        <Text style={[styles.statNumber, { color: Colors.success }]}>{stats.online}</Text>
                        <Text style={styles.statLabel}>En línea</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.statCard, filter === 'offline' && styles.statCardActive]}
                        onPress={() => setFilter('offline')}
                    >
                        <View style={[styles.statusDot, { backgroundColor: Colors.light.textTertiary }]} />
                        <Text style={[styles.statNumber, { color: Colors.light.textSecondary }]}>
                            {stats.offline}
                        </Text>
                        <Text style={styles.statLabel}>Fuera de línea</Text>
                    </TouchableOpacity>
                </View>

                {/* Devices List */}
                <FlatList
                    data={filteredDevices}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => router.push(`/(tabs)/devices/${item.id}` as any)}
                            activeOpacity={0.7}
                        >
                            <Card variant="elevated" style={styles.deviceCard}>
                                {/* Gradient strip */}
                                <LinearGradient
                                    colors={
                                        item.online
                                            ? ['#10b981', '#06b6d4']
                                            : ['#9ca3af', '#6b7280']
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.cardStrip}
                                />

                                <View style={styles.cardHeader}>
                                    <View style={styles.deviceIcon}>
                                        <Text style={styles.iconText}>🚗</Text>
                                    </View>

                                    <View style={styles.deviceInfo}>
                                        <Text style={styles.deviceName}>{item.name}</Text>
                                        <Badge
                                            label={item.online ? 'En línea' : 'Fuera de línea'}
                                            variant={item.online ? 'success' : 'neutral'}
                                            size="sm"
                                        />
                                    </View>

                                    <View style={styles.arrowContainer}>
                                        <Text style={styles.arrow}>›</Text>
                                    </View>
                                </View>

                                {item.lastPosition && (
                                    <View style={styles.cardDetails}>
                                        <View style={styles.detailRow}>
                                            <View style={styles.detailItem}>
                                                <Text style={styles.detailIcon}>📍</Text>
                                                <View style={styles.detailContent}>
                                                    <Text style={styles.detailLabel}>Ubicación</Text>
                                                    <Text style={styles.detailValue}>
                                                        {item.lastPosition.address ||
                                                            `${parseFloat(item.lastPosition.lat).toFixed(4)}°, ${parseFloat(item.lastPosition.lng).toFixed(4)}°`}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.detailRow}>
                                            <View style={styles.detailItem}>
                                                <Text style={styles.detailIcon}>⚡</Text>
                                                <View style={styles.detailContent}>
                                                    <Text style={styles.detailLabel}>Velocidad</Text>
                                                    <Text style={styles.detailValue}>
                                                        {item.lastPosition.speed || 0} km/h
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.detailItem}>
                                                <Text style={styles.detailIcon}>🕐</Text>
                                                <View style={styles.detailContent}>
                                                    <Text style={styles.detailLabel}>Actualizado</Text>
                                                    <Text style={styles.detailValue}>
                                                        {new Date(item.lastPosition.timestamp).toLocaleTimeString('es-ES', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </Card>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <Card variant="gradient" gradient={['#3b82f6', '#8b5cf6']} style={styles.emptyCard}>
                            <Text style={styles.emptyIcon}>📍</Text>
                            <Text style={styles.emptyTitle}>No hay dispositivos</Text>
                            <Text style={styles.emptyText}>
                                Para comenzar a rastrear, contacta a tu instalador para vincular tus dispositivos GPS.
                            </Text>
                        </Card>
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        padding: Spacing.xl,
        paddingTop: Platform.OS === 'web' ? Spacing.xl : Spacing.xxxl,
        paddingBottom: Spacing.lg,
    },
    headerTitle: {
        fontSize: Typography.fontSize.xxxl,
        fontWeight: Typography.fontWeight.bold,
        color: '#ffffff',
        marginBottom: Spacing.xs,
    },
    headerSubtitle: {
        fontSize: Typography.fontSize.base,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    content: {
        flex: 1,
        marginTop: -Spacing.base,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.base,
        gap: Spacing.sm,
        marginBottom: Spacing.base,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        ...Shadows.sm,
    },
    statCardActive: {
        borderColor: Colors.primary[500],
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
    },
    statNumber: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.light.text,
        marginBottom: Spacing.xs / 2,
    },
    statLabel: {
        fontSize: Typography.fontSize.xs,
        color: Colors.light.textSecondary,
        fontWeight: Typography.fontWeight.medium,
    },
    listContent: {
        padding: Spacing.base,
        paddingBottom: Spacing.xxxl,
    },
    deviceCard: {
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },
    cardStrip: {
        height: 4,
        width: '100%',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.base,
    },
    deviceIcon: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    iconText: {
        fontSize: 24,
    },
    deviceInfo: {
        flex: 1,
        gap: Spacing.xs,
    },
    deviceName: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.semibold,
        color: Colors.light.text,
    },
    arrowContainer: {
        marginLeft: Spacing.sm,
    },
    arrow: {
        fontSize: 28,
        color: Colors.light.border,
        fontWeight: '300',
    },
    cardDetails: {
        paddingHorizontal: Spacing.base,
        paddingBottom: Spacing.base,
        paddingTop: Spacing.xs,
        gap: Spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    detailItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    detailIcon: {
        fontSize: 16,
        marginRight: Spacing.sm,
        marginTop: 2,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: Typography.fontSize.xs,
        color: Colors.light.textSecondary,
        fontWeight: Typography.fontWeight.medium,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: Typography.fontSize.sm,
        color: Colors.light.text,
        fontWeight: Typography.fontWeight.semibold,
    },
    emptyCard: {
        padding: Spacing.xl,
        alignItems: 'center',
        marginTop: Spacing.xxxl,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: Spacing.base,
    },
    emptyTitle: {
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.bold,
        color: '#ffffff',
        marginBottom: Spacing.sm,
    },
    emptyText: {
        fontSize: Typography.fontSize.base,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 22,
    },
});
