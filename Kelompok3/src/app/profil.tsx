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
import { HimaforHeader } from '@/components/himafor-header';
import { MainTabBar } from '@/components/main-tab-bar';

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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.app}>
        <HimaforHeader />

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
        <MainTabBar activePath="/profil" />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  app: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#FFFFFF',
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
