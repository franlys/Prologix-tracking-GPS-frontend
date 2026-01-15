import { StyleSheet, View, Text, Platform, Linking, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function MapScreen() {
  const [devices, setDevices] = useState<any[]>([]);

  const openNavigation = (lat: number, lng: number, name: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${encodeURIComponent(name)})`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });

    if (url) {
      Linking.openURL(url).catch(err => {
        // Fallback to Google Maps on web
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
      });
    }
  };

  const shareLocation = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    } else {
      Linking.openURL(`sms:?body=Te comparto la ubicación de ${name}: ${url}`);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await api.get('/devices');

      if (!response.data || !Array.isArray(response.data)) {
        console.warn("No devices data received");
        setDevices([]);
        return;
      }

      const mappedDevices = response.data
        .filter((d: any) => d && d.lastPosition && d.lastPosition.lat && d.lastPosition.lng)
        .map((d: any) => {
          const lat = parseFloat(d.lastPosition.lat);
          const lng = parseFloat(d.lastPosition.lng);

          // Skip devices with invalid coordinates
          if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
            return null;
          }

          return {
            id: d.id,
            name: d.name || 'Dispositivo sin nombre',
            lat,
            lng,
            status: d.online ? 'online' : 'offline'
          };
        })
        .filter((d: any) => d !== null);

      setDevices(mappedDevices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      // Don't crash - just keep existing devices or empty array
      if (devices.length === 0) {
        setDevices([]);
      }
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  // Web version
  if (Platform.OS === 'web') {
    // Lazy load WebMap component only on web
    const WebMapComponent = require('../../components/WebMap').default;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Rastreo GPS en Vivo</Text>
            <Text style={styles.subtitle}>{devices.length} dispositivos activos</Text>
          </View>
          <View style={styles.refreshButton}>
            <Text style={styles.refreshText}>🔄 Actualizado hace un momento</Text>
          </View>
        </View>

        {devices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyText}>No hay dispositivos registrados</Text>
            <Text style={styles.emptySubtext}>Los dispositivos aparecerán aquí cuando se conecten</Text>
          </View>
        ) : (
          <View style={styles.webContent}>
            <View style={styles.mapAndSidebar}>
              <View style={styles.mapContainer}>
                <WebMapComponent devices={devices} />
              </View>

              <View style={styles.sidebar}>
                <Text style={styles.sidebarTitle}>Dispositivos Activos</Text>
                {devices.map((device: any) => (
                  <View key={device.id} style={styles.compactDeviceCard}>
                    <View style={styles.compactCardHeader}>
                      <View style={styles.compactDeviceIcon}>
                        <Text style={styles.compactIconText}>🚗</Text>
                      </View>
                      <View style={styles.compactDeviceInfo}>
                        <Text style={styles.compactDeviceName}>{device.name}</Text>
                        <View style={styles.compactStatusContainer}>
                          <View style={[
                            styles.compactStatusDot,
                            { backgroundColor: device.status === 'online' ? '#10b981' : '#6b7280' }
                          ]} />
                          <Text style={[
                            styles.compactStatusText,
                            { color: device.status === 'online' ? '#10b981' : '#6b7280' }
                          ]}>
                            {device.status === 'online' ? 'En línea' : 'Fuera de línea'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.compactCoords}>
                      <Text style={styles.compactCoordsText}>
                        {device.lat.toFixed(4)}°, {device.lng.toFixed(4)}°
                      </Text>
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => openNavigation(device.lat, device.lng, device.name)}
                      >
                        <Text style={styles.actionButtonText}>🧭 Ir</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonSecondary]}
                        onPress={() => shareLocation(device.lat, device.lng, device.name)}
                      >
                        <Text style={styles.actionButtonTextSecondary}>📤 Compartir</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  // Native version
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 18.7357,
          longitude: -70.1627,
          latitudeDelta: 2.5,
          longitudeDelta: 2.5,
        }}
        showsUserLocation={true}
      >
        {devices.map((device: any) => (
            <Marker
                key={device.id}
                coordinate={{ latitude: device.lat, longitude: device.lng }}
                title={device.name}
                description={`Status: ${device.status}`}
                pinColor={device.status === 'online' ? 'green' : 'gray'}
            />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Platform.OS === 'web' ? 24 : 0,
        backgroundColor: Platform.OS === 'web' ? '#f8fafc' : 'transparent',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    webContent: {
        flex: 1,
    },
    mapAndSidebar: {
        flexDirection: 'row',
        flex: 1,
        gap: 16,
    },
    mapContainer: {
        flex: 1,
        minHeight: 600,
    },
    sidebar: {
        width: 320,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        maxHeight: 600,
        overflow: 'scroll',
    },
    sidebarTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    compactDeviceCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    compactCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    compactDeviceIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    compactIconText: {
        fontSize: 16,
    },
    compactDeviceInfo: {
        flex: 1,
    },
    compactDeviceName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    compactStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactStatusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    compactStatusText: {
        fontSize: 11,
        fontWeight: '500',
    },
    compactCoords: {
        paddingLeft: 40,
    },
    compactCoordsText: {
        fontSize: 11,
        color: '#64748b',
        fontFamily: 'monospace',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    actionButtonSecondary: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    actionButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: 'white',
    },
    actionButtonTextSecondary: {
        fontSize: 11,
        fontWeight: '600',
        color: '#3b82f6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    refreshButton: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    refreshText: {
        fontSize: 12,
        color: '#475569',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    deviceList: {
        gap: 16,
    },
    deviceCard: {
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
    cardTitleSection: {
        flex: 1,
    },
    deviceName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    deviceStatus: {
        fontSize: 13,
        fontWeight: '500',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
    },
    cardContent: {
        padding: 16,
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '600',
    },
});
