import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = '#1A237E';
const TEAL = '#26A69A';

// ─── Mock data – replace with real auth/user context ─────────────────────────
const USER = {
  name: 'Nama Anggota',
  email: 'anggota@email.com',
  initial: 'H',
  faceRegistered: true,
};

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
type TabName = 'beranda' | 'kegiatan' | 'riwayat' | 'profil';

function BottomTabBar({ active }: { active: TabName }) {
  const router = useRouter();

  const tabs: { name: TabName; label: string; icon: string; route: string }[] = [
    { name: 'beranda', label: 'Beranda', icon: '⌂', route: '/' },
    { name: 'kegiatan', label: 'Kegiatan', icon: '▦', route: '/kegiatan' },
    { name: 'riwayat', label: 'Riwayat', icon: '↺', route: '/riwayat' },
    { name: 'profil', label: 'Profil', icon: '○', route: '/profil' },
  ];

  return (
    <View style={tabStyles.bar}>
      {tabs.map((tab) => {
        const isActive = tab.name === active;
        return (
          <TouchableOpacity
            key={tab.name}
            style={tabStyles.tab}
            onPress={() => router.push(tab.route as any)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}>
            <Text style={[tabStyles.icon, isActive && tabStyles.iconActive]}>
              {tab.icon}
            </Text>
            <Text style={[tabStyles.label, isActive && tabStyles.labelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={tabStyles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
  },
  icon: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  iconActive: {
    color: PRIMARY,
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  labelActive: {
    color: PRIMARY,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    height: 2,
    width: '60%',
    backgroundColor: PRIMARY,
    borderRadius: 2,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfilScreen() {
  const router = useRouter();
  const [user] = useState(USER);

  const handlePerbaruiWajah = () => {
    router.push('/register-face');
  };

  const handleUbahPassword = () => {
    // TODO: navigate to change-password screen
    Alert.alert('Ubah Password', 'Fitur ini akan segera tersedia.');
  };

  const handleKeluar = () => {
    Alert.alert('Keluar', 'Apakah kamu yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => router.replace('/login'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>⚓</Text>
        </View>
        <Text style={styles.headerTitle}>HIMAFOR</Text>
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        {/* Page title */}
        <Text style={styles.pageTitle}>Profil</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.initial}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Face data card */}
        <View style={styles.faceCard}>
          <View style={styles.faceCardText}>
            <Text style={styles.faceCardTitle}>Data wajah</Text>
            <Text style={styles.faceCardSub}>Untuk verifikasi presensi</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              user.faceRegistered ? styles.statusTerdaftar : styles.statusBelum,
            ]}>
            <Text style={styles.statusText}>
              {user.faceRegistered ? 'Terdaftar' : 'Belum'}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePerbaruiWajah}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Perbarui wajah">
          <Text style={styles.actionButtonText}>Perbarui wajah</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleUbahPassword}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Ubah password">
          <Text style={styles.actionButtonText}>Ubah password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleKeluar}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Keluar">
          <Text style={styles.actionButtonText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      {/* ── Bottom Tab Bar ── */}
      <BottomTabBar active="profil" />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 10,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    color: PRIMARY,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: 1,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 24,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY,
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Face data card
  faceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  faceCardText: {
    gap: 2,
  },
  faceCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
  faceCardSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statusTerdaftar: {
    backgroundColor: TEAL,
  },
  statusBelum: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Action buttons
  actionButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
