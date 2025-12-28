import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import api from '../../../services/api';

export default function DevicesScreen() {
    const [devices, setDevices] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

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

    const getStatusColor = (online: boolean) => {
        return online ? '#10b981' : '#6b7280';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Dispositivos</Text>
                <Text style={styles.headerSubtitle}>{devices.length} dispositivos registrados</Text>
            </View>

            <FlatList
                data={devices}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.deviceCard}
                        onPress={() => router.push(`/(tabs)/devices/${item.id}`)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.deviceIcon}>
                                <Text style={styles.iconText}>🚗</Text>
                            </View>

                            <View style={styles.deviceInfo}>
                                <Text style={styles.deviceName}>{item.name}</Text>
                                <View style={styles.statusRow}>
                                    <View style={[
                                        styles.statusDot,
                                        { backgroundColor: getStatusColor(item.online) }
                                    ]} />
                                    <Text style={[
                                        styles.statusText,
                                        { color: getStatusColor(item.online) }
                                    ]}>
                                        {item.online ? 'En línea' : 'Fuera de línea'}
                                    </Text>
                                </View>
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
                                                {parseFloat(item.lastPosition.lat).toFixed(4)}°, {parseFloat(item.lastPosition.lng).toFixed(4)}°
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailIcon}>⚡</Text>
                                        <View style={styles.detailContent}>
                                            <Text style={styles.detailLabel}>Velocidad</Text>
                                            <Text style={styles.detailValue}>{item.lastPosition.speed || 0} km/h</Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailIcon}>🕐</Text>
                                        <View style={styles.detailContent}>
                                            <Text style={styles.detailLabel}>Última actualización</Text>
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
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📍</Text>
                        <Text style={styles.emptyText}>No hay dispositivos</Text>
                        <Text style={styles.emptySubtext}>Agrega un dispositivo para comenzar</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        padding: 20,
        paddingTop: 24,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    listContent: {
        padding: 16,
    },
    deviceCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    deviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 24,
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '500',
    },
    arrowContainer: {
        marginLeft: 8,
    },
    arrow: {
        fontSize: 24,
        color: '#cbd5e1',
        fontWeight: '300',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#94a3b8',
    },
    cardDetails: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    detailIcon: {
        fontSize: 16,
        marginRight: 8,
        marginTop: 2,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '500',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 13,
        color: '#1e293b',
        fontWeight: '600',
    },
});
