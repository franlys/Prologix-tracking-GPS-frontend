import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  category: 'emergency' | 'roadside' | 'health' | 'insurance' | 'utility';
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  // Emergencias Generales
  {
    id: '911',
    name: 'Sistema 911',
    phone: '911',
    description: 'Emergencias generales - Policía, Bomberos, Ambulancia',
    icon: 'shield-checkmark',
    color: '#dc2626',
    category: 'emergency',
  },
  {
    id: 'policia',
    name: 'Policía Nacional',
    phone: '809-682-2151',
    description: 'Central de la Policía Nacional',
    icon: 'shield',
    color: '#1e40af',
    category: 'emergency',
  },
  {
    id: 'bomberos',
    name: 'Cuerpo de Bomberos',
    phone: '809-682-2000',
    description: 'Emergencias de incendios y rescate',
    icon: 'flame',
    color: '#dc2626',
    category: 'emergency',
  },
  {
    id: 'amet',
    name: 'AMET',
    phone: '809-686-9658',
    description: 'Autoridad Metropolitana de Transporte - Accidentes de tránsito',
    icon: 'car-sport',
    color: '#f59e0b',
    category: 'emergency',
  },
  {
    id: 'digesett',
    name: 'DIGESETT',
    phone: '809-533-5150',
    description: 'Dirección General de Seguridad de Tránsito y Transporte',
    icon: 'warning',
    color: '#f59e0b',
    category: 'emergency',
  },

  // Asistencia Vial
  {
    id: 'aaa',
    name: 'AAA Dominicana',
    phone: '809-616-2470',
    description: 'Asistencia vial 24/7 - Grúa, mecánico, gasolina',
    icon: 'construct',
    color: '#0891b2',
    category: 'roadside',
  },
  {
    id: 'aga',
    name: 'AGA Asistencia',
    phone: '809-565-5555',
    description: 'Asistencia en carretera y grúas',
    icon: 'car',
    color: '#0891b2',
    category: 'roadside',
  },
  {
    id: 'motorclub',
    name: 'Motor Club',
    phone: '809-565-2582',
    description: 'Grúas y asistencia mecánica',
    icon: 'build',
    color: '#0891b2',
    category: 'roadside',
  },

  // Salud y Ambulancias
  {
    id: 'semma',
    name: 'SEMMA',
    phone: '809-472-8990',
    description: 'Sistema de Emergencias Médicas - Ambulancias',
    icon: 'medical',
    color: '#dc2626',
    category: 'health',
  },
  {
    id: 'cruz-roja',
    name: 'Cruz Roja Dominicana',
    phone: '809-682-4545',
    description: 'Ambulancias y primeros auxilios',
    icon: 'add-circle',
    color: '#dc2626',
    category: 'health',
  },
  {
    id: 'hospital-trauma',
    name: 'Hospital Traumatológico',
    phone: '809-689-7151',
    description: 'Emergencias traumatológicas y accidentes',
    icon: 'bandage',
    color: '#dc2626',
    category: 'health',
  },
  {
    id: 'hospital-daraby',
    name: 'Centro Médico Daraby',
    phone: '809-565-3232',
    description: 'Emergencias 24 horas',
    icon: 'fitness',
    color: '#dc2626',
    category: 'health',
  },

  // Seguros Populares
  {
    id: 'seguros-reservas',
    name: 'Seguros Reservas',
    phone: '809-535-7373',
    description: 'Reportar accidentes y asistencia',
    icon: 'umbrella',
    color: '#7c3aed',
    category: 'insurance',
  },
  {
    id: 'seguros-banreservas',
    name: 'Seguros Banreservas',
    phone: '809-960-3434',
    description: 'Asistencia y reclamos',
    icon: 'shield-half',
    color: '#7c3aed',
    category: 'insurance',
  },
  {
    id: 'seguros-universal',
    name: 'Seguros Universal',
    phone: '809-685-0505',
    description: 'Reportar siniestros',
    icon: 'document-text',
    color: '#7c3aed',
    category: 'insurance',
  },
  {
    id: 'mapfre',
    name: 'Mapfre BHD Seguros',
    phone: '809-535-5353',
    description: 'Asistencia vial y reclamos',
    icon: 'briefcase',
    color: '#7c3aed',
    category: 'insurance',
  },

  // Servicios Públicos
  {
    id: 'edenorte',
    name: 'Edenorte',
    phone: '809-567-7777',
    description: 'Emergencias eléctricas - Zona Norte',
    icon: 'flash-outline',
    color: '#059669',
    category: 'utility',
  },
  {
    id: 'edesur',
    name: 'Edesur',
    phone: '809-521-2000',
    description: 'Emergencias eléctricas - Zona Sur',
    icon: 'flash-outline',
    color: '#059669',
    category: 'utility',
  },
  {
    id: 'edeeste',
    name: 'Edeeste',
    phone: '809-598-2222',
    description: 'Emergencias eléctricas - Zona Este',
    icon: 'flash-outline',
    color: '#059669',
    category: 'utility',
  },
  {
    id: 'inapa',
    name: 'INAPA',
    phone: '809-598-1010',
    description: 'Instituto Nacional de Aguas Potables - Averías',
    icon: 'water-outline',
    color: '#0891b2',
    category: 'utility',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: 'apps' as const, color: '#6b7280' },
  { id: 'emergency', name: 'Emergencias', icon: 'alert-circle' as const, color: '#dc2626' },
  { id: 'roadside', name: 'Asist. Vial', icon: 'car' as const, color: '#0891b2' },
  { id: 'health', name: 'Salud', icon: 'medical' as const, color: '#dc2626' },
  { id: 'insurance', name: 'Seguros', icon: 'umbrella' as const, color: '#7c3aed' },
  { id: 'utility', name: 'Servicios', icon: 'flash-outline' as const, color: '#059669' },
];

export default function EmergencyScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const makePhoneCall = (contact: EmergencyContact) => {
    const phoneNumber = Platform.OS === 'ios' ? `tel://${contact.phone}` : `tel:${contact.phone}`;

    Alert.alert(
      contact.name,
      `¿Deseas llamar a ${contact.phone}?\n\n${contact.description}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Llamar',
          onPress: () => {
            Linking.canOpenURL(phoneNumber)
              .then((supported) => {
                if (!supported) {
                  showAlert('Error', 'No se puede realizar la llamada');
                } else {
                  return Linking.openURL(phoneNumber);
                }
              })
              .catch((err) => {
                console.error('Error making call:', err);
                showAlert('Error', 'No se pudo realizar la llamada');
              });
          },
        },
      ]
    );
  };

  const getFilteredContacts = () => {
    if (selectedCategory === 'all') {
      return EMERGENCY_CONTACTS;
    }
    return EMERGENCY_CONTACTS.filter((contact) => contact.category === selectedCategory);
  };

  const renderContact = (contact: EmergencyContact) => (
    <TouchableOpacity
      key={contact.id}
      style={styles.contactCard}
      onPress={() => makePhoneCall(contact)}
      activeOpacity={0.7}
    >
      <View style={[styles.contactIcon, { backgroundColor: `${contact.color}15` }]}>
        <Ionicons name={contact.icon} size={28} color={contact.color} />
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactDescription}>{contact.description}</Text>
        <View style={styles.phoneContainer}>
          <Ionicons name="call" size={14} color="#7c3aed" />
          <Text style={styles.contactPhone}>{contact.phone}</Text>
        </View>
      </View>

      <View style={[styles.callButton, { backgroundColor: contact.color }]}>
        <Ionicons name="call" size={20} color="#ffffff" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Asistencia de Emergencia</Text>
          <Text style={styles.headerSubtitle}>
            Números importantes en República Dominicana
          </Text>
        </View>
        <View style={styles.emergencyBadge}>
          <Ionicons name="alert-circle" size={20} color="#dc2626" />
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
              selectedCategory === category.id && { borderColor: category.color, backgroundColor: `${category.color}15` },
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons
              name={category.icon}
              size={18}
              color={selectedCategory === category.id ? category.color : '#6b7280'}
            />
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category.id && { color: category.color },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Emergency Contacts List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Emergency Banner */}
        {selectedCategory === 'all' && (
          <Card variant="elevated" style={[styles.emergencyCard, { backgroundColor: '#fef2f2' }]}>
            <View style={styles.emergencyHeader}>
              <Ionicons name="alert-circle" size={32} color="#dc2626" />
              <View style={styles.emergencyTextContainer}>
                <Text style={styles.emergencyTitle}>¿Emergencia?</Text>
                <Text style={styles.emergencySubtitle}>Marca 911 para ayuda inmediata</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.emergency911Button}
              onPress={() =>
                makePhoneCall({
                  id: '911-quick',
                  name: 'Sistema 911',
                  phone: '911',
                  description: 'Emergencias generales',
                  icon: 'shield-checkmark',
                  color: '#dc2626',
                  category: 'emergency',
                })
              }
            >
              <Ionicons name="call" size={24} color="#ffffff" />
              <Text style={styles.emergency911Text}>Llamar al 911</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Results Count */}
        <Text style={styles.resultsCount}>
          {getFilteredContacts().length} contacto{getFilteredContacts().length !== 1 ? 's' : ''} disponible
          {getFilteredContacts().length !== 1 ? 's' : ''}
        </Text>

        {/* Contacts List */}
        <View style={styles.contactsList}>
          {getFilteredContacts().map((contact) => renderContact(contact))}
        </View>

        {/* Important Note */}
        <Card variant="outlined" style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <Ionicons name="information-circle" size={20} color="#0891b2" />
            <Text style={styles.noteTitle}>Importante</Text>
          </View>
          <Text style={styles.noteText}>
            • Guarda estos números en tu teléfono{'\n'}
            • En caso de emergencia, mantén la calma{'\n'}
            • Proporciona tu ubicación exacta{'\n'}
            • Los servicios de asistencia vial pueden requerir membresía{'\n'}
            • Verifica la cobertura de tu seguro antes de un viaje
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'web' ? Spacing.lg : Spacing.xxxl,
    paddingBottom: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
    marginBottom: Spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
  },
  emergencyBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: '#f3f4f6',
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
    gap: Spacing.xs / 2,
    borderWidth: 2,
    borderColor: 'transparent',
    flexShrink: 0,
  },
  categoryChipActive: {
    backgroundColor: '#ffffff',
    borderColor: '#7c3aed',
  },
  categoryChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl + 20,
  },
  emergencyCard: {
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emergencyTextContainer: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  emergencyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: '#dc2626',
    marginBottom: Spacing.xs / 2,
  },
  emergencySubtitle: {
    fontSize: Typography.fontSize.sm,
    color: '#991b1b',
  },
  emergency911Button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  emergency911Text: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
  },
  resultsCount: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    marginBottom: Spacing.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  contactsList: {
    gap: Spacing.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#1f2937',
    marginBottom: Spacing.xs / 2,
  },
  contactDescription: {
    fontSize: Typography.fontSize.sm,
    color: '#6b7280',
    marginBottom: Spacing.xs,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  contactPhone: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#7c3aed',
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  noteCard: {
    padding: Spacing.base,
    marginTop: Spacing.lg,
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  noteTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#0891b2',
  },
  noteText: {
    fontSize: Typography.fontSize.sm,
    color: '#0c4a6e',
    lineHeight: 22,
  },
});
