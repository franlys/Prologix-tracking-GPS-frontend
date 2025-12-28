import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Linking, ScrollView } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useState, useEffect, useRef } from 'react';
import api from '../../../services/api';

interface HistoryPoint {
    lat: number;
    lng: number;
    speed: number;
    timestamp: string;
}

interface DeviceStats {
    totalDistance: number;
    averageSpeed: number;
    maxSpeed: number;
    totalTime: number;
}

export default function DeviceMapScreen() {
    const { id } = useLocalSearchParams();
    const [device, setDevice] = useState<any>(null);
    const [history, setHistory] = useState<HistoryPoint[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [stats, setStats] = useState<DeviceStats>({ totalDistance: 0, averageSpeed: 0, maxSpeed: 0, totalTime: 0 });
    const mapRef = useRef<MapView>(null);

    const openNavigation = (lat: number, lng: number, name: string) => {
        const url = Platform.select({
            ios: `maps:0,0?q=${lat},${lng}`,
            android: `geo:0,0?q=${lat},${lng}(${encodeURIComponent(name)})`,
            web: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        });

        if (url) {
            Linking.openURL(url).catch(() => {
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
            });
        }
    };

    const callEmergency = () => {
        if (Platform.OS === 'web') {
            window.open('tel:911', '_self');
        } else {
            Linking.openURL('tel:911');
        }
    };

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const calculateStats = (historyData: HistoryPoint[]): DeviceStats => {
        if (historyData.length === 0) {
            return { totalDistance: 0, averageSpeed: 0, maxSpeed: 0, totalTime: 0 };
        }

        let totalDistance = 0;
        let totalSpeed = 0;
        let maxSpeed = 0;

        for (let i = 1; i < historyData.length; i++) {
            const prev = historyData[i - 1];
            const curr = historyData[i];

            const distance = calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
            totalDistance += distance;

            totalSpeed += curr.speed;
            maxSpeed = Math.max(maxSpeed, curr.speed);
        }

        const averageSpeed = historyData.length > 0 ? totalSpeed / historyData.length : 0;

        // Calculate total time in hours
        const firstTime = new Date(historyData[0].timestamp).getTime();
        const lastTime = new Date(historyData[historyData.length - 1].timestamp).getTime();
        const totalTime = (lastTime - firstTime) / (1000 * 60 * 60); // Convert to hours

        return {
            totalDistance,
            averageSpeed,
            maxSpeed,
            totalTime,
        };
    };

    const fetchDevice = async () => {
        try {
            const response = await api.get(`/devices/${id}/live`);
            setDevice(response.data);

            if (response.data && mapRef.current && Platform.OS !== 'web') {
                mapRef.current.animateToRegion({
                    latitude: parseFloat(response.data.lat),
                    longitude: parseFloat(response.data.lng),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 1000);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchHistory = async () => {
        try {
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

            const response = await api.get(`/devices/${id}/history`, {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                }
            });

            setHistory(response.data);
            setStats(calculateStats(response.data));
        } catch (error) {
            console.error('Error fetching history:', error);
            // If user doesn't have Plus plan, this will fail
            setHistory([]);
            setStats({ totalDistance: 0, averageSpeed: 0, maxSpeed: 0, totalTime: 0 });
        }
    };

    useEffect(() => {
        fetchDevice();
        fetchHistory();
        const interval = setInterval(fetchDevice, 10000);
        return () => clearInterval(interval);
    }, [id]);

    if (!device) {
        return <View style={styles.container}><Text>Cargando...</Text></View>;
    }

    // Web version
    if (Platform.OS === 'web') {
        return (
            <View style={styles.container}>
                <View style={styles.webContainer}>
                    <View style={styles.header}>
                        <View style={styles.deviceIconLarge}>
                            <Text style={styles.iconTextLarge}>🚗</Text>
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={styles.deviceTitle}>{device.name}</Text>
                            <View style={styles.statusContainer}>
                                <View style={[
                                    styles.statusDot,
                                    { backgroundColor: device.online ? '#10b981' : '#6b7280' }
                                ]} />
                                <Text style={[
                                    styles.statusText,
                                    { color: device.online ? '#10b981' : '#6b7280' }
                                ]}>
                                    {device.online ? 'En línea' : 'Fuera de línea'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.cardIcon}>
                            <Text style={styles.cardIconText}>📍</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.infoLabel}>Posición Actual</Text>
                            <Text style={styles.infoValue}>
                                {parseFloat(device.lat || 0).toFixed(6)}, {parseFloat(device.lng || 0).toFixed(6)}
                            </Text>
                            <Text style={styles.infoSubtext}>
                                Lat/Lng
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.cardIcon}>
                            <Text style={styles.cardIconText}>⚡</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.infoLabel}>Velocidad</Text>
                            <Text style={styles.infoValue}>{device.speed || 0} km/h</Text>
                            <Text style={styles.infoSubtext}>
                                Velocidad actual del vehículo
                            </Text>
                        </View>
                    </View>

                    {stats.totalDistance > 0 && (
                        <>
                            <View style={styles.statsRow}>
                                <View style={styles.statCard}>
                                    <View style={styles.statIcon}>
                                        <Text style={styles.statIconText}>📏</Text>
                                    </View>
                                    <Text style={styles.statLabel}>Distancia Total</Text>
                                    <Text style={styles.statValue}>{stats.totalDistance.toFixed(2)} km</Text>
                                </View>

                                <View style={styles.statCard}>
                                    <View style={styles.statIcon}>
                                        <Text style={styles.statIconText}>📊</Text>
                                    </View>
                                    <Text style={styles.statLabel}>Velocidad Promedio</Text>
                                    <Text style={styles.statValue}>{stats.averageSpeed.toFixed(1)} km/h</Text>
                                </View>
                            </View>

                            <View style={styles.statsRow}>
                                <View style={styles.statCard}>
                                    <View style={styles.statIcon}>
                                        <Text style={styles.statIconText}>🚀</Text>
                                    </View>
                                    <Text style={styles.statLabel}>Velocidad Máxima</Text>
                                    <Text style={styles.statValue}>{stats.maxSpeed.toFixed(0)} km/h</Text>
                                </View>

                                <View style={styles.statCard}>
                                    <View style={styles.statIcon}>
                                        <Text style={styles.statIconText}>⏱️</Text>
                                    </View>
                                    <Text style={styles.statLabel}>Tiempo en Movimiento</Text>
                                    <Text style={styles.statValue}>{stats.totalTime.toFixed(1)} hrs</Text>
                                </View>
                            </View>
                        </>
                    )}

                    <View style={styles.infoCard}>
                        <View style={styles.cardIcon}>
                            <Text style={styles.cardIconText}>🕐</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.infoLabel}>Última Actualización</Text>
                            <Text style={styles.infoValue}>Hace un momento</Text>
                            <Text style={styles.infoSubtext}>
                                Actualización automática cada 10 segundos
                            </Text>
                        </View>
                    </View>

                    {history.length > 0 && (
                        <View style={styles.historySection}>
                            <View style={styles.historySectionHeader}>
                                <Text style={styles.historySectionTitle}>📍 Historial de Ruta (Últimas 24h)</Text>
                                <TouchableOpacity
                                    style={styles.toggleHistoryButton}
                                    onPress={() => setShowHistory(!showHistory)}
                                >
                                    <Text style={styles.toggleHistoryButtonText}>
                                        {showHistory ? 'Ocultar ▲' : 'Ver Ruta ▼'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {showHistory && (
                                <ScrollView style={styles.historyList} nestedScrollEnabled>
                                    {history.map((point, index) => (
                                        <View key={index} style={styles.historyPoint}>
                                            <View style={styles.historyPointMarker}>
                                                <View style={styles.historyPointDot} />
                                                {index < history.length - 1 && (
                                                    <View style={styles.historyPointLine} />
                                                )}
                                            </View>
                                            <View style={styles.historyPointContent}>
                                                <Text style={styles.historyPointTime}>
                                                    {new Date(point.timestamp).toLocaleTimeString('es-ES', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </Text>
                                                <Text style={styles.historyPointCoords}>
                                                    {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                                                </Text>
                                                <Text style={styles.historyPointSpeed}>
                                                    {point.speed} km/h
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    )}

                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                            style={styles.primaryActionButton}
                            onPress={() => openNavigation(
                                parseFloat(device.lat || 0),
                                parseFloat(device.lng || 0),
                                device.name
                            )}
                        >
                            <Text style={styles.actionButtonIcon}>🧭</Text>
                            <Text style={styles.primaryActionButtonText}>Iniciar Navegación</Text>
                        </TouchableOpacity>

                        <View style={styles.secondaryActionsRow}>
                            <TouchableOpacity
                                style={styles.secondaryActionButton}
                                onPress={callEmergency}
                            >
                                <Text style={styles.actionButtonIcon}>🚨</Text>
                                <Text style={styles.secondaryActionButtonText}>Emergencia</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryActionButton}
                                onPress={() => {
                                    const url = `https://www.google.com/maps/search/?api=1&query=${device.lat},${device.lng}`;
                                    if (Platform.OS === 'web') {
                                        navigator.clipboard.writeText(url);
                                        alert('Enlace copiado al portapapeles');
                                    }
                                }}
                            >
                                <Text style={styles.actionButtonIcon}>📤</Text>
                                <Text style={styles.secondaryActionButtonText}>Compartir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    // Native version
    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: parseFloat(device.lat || 18.4861),
                    longitude: parseFloat(device.lng || -69.9312),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {history.length > 0 && (
                    <Polyline
                        coordinates={history.map(point => ({
                            latitude: point.lat,
                            longitude: point.lng,
                        }))}
                        strokeColor="#3b82f6"
                        strokeWidth={3}
                    />
                )}
                <Marker
                    coordinate={{ latitude: parseFloat(device.lat), longitude: parseFloat(device.lng) }}
                    title="Current Position"
                    description={`Speed: ${device.speed} km/h`}
                    pinColor="blue"
                />
                {history.length > 0 && history[0] && (
                    <Marker
                        coordinate={{ latitude: history[0].lat, longitude: history[0].lng }}
                        title="Starting Point"
                        pinColor="green"
                    />
                )}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Platform.OS === 'web' ? '#f8fafc' : 'transparent',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    webContainer: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    deviceIconLarge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconTextLarge: {
        fontSize: 32,
    },
    headerInfo: {
        flex: 1,
    },
    deviceTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 6,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: 'row',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardIconText: {
        fontSize: 24,
    },
    cardContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    infoSubtext: {
        fontSize: 13,
        color: '#94a3b8',
    },
    actionButtonsContainer: {
        marginTop: 8,
    },
    primaryActionButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryActionButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
        marginLeft: 8,
    },
    secondaryActionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryActionButton: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    secondaryActionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b82f6',
        marginLeft: 8,
    },
    actionButtonIcon: {
        fontSize: 20,
    },
    historySection: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    historySectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    historySectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    toggleHistoryButton: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    toggleHistoryButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3b82f6',
    },
    historyList: {
        maxHeight: 300,
        padding: 16,
    },
    historyPoint: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    historyPointMarker: {
        width: 24,
        alignItems: 'center',
        marginRight: 12,
    },
    historyPointDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3b82f6',
        borderWidth: 2,
        borderColor: '#eff6ff',
    },
    historyPointLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#e2e8f0',
        marginTop: 2,
    },
    historyPointContent: {
        flex: 1,
        paddingBottom: 12,
    },
    historyPointTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    historyPointCoords: {
        fontSize: 12,
        color: '#64748b',
        fontFamily: 'monospace',
        marginBottom: 2,
    },
    historyPointSpeed: {
        fontSize: 12,
        color: '#94a3b8',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statIconText: {
        fontSize: 24,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
});
