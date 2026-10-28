import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { MainScreen } from '@/components/main-screen';

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = '#101477';
const TEAL = '#39BFB7';

// ─── Mock data – replace with real auth/user context ─────────────────────────
const USER = {
  name: 'Nama Anggota',
  email: 'anggota@email.com',
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
    <MainScreen activePath="/profil">
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Page title */}
        <Text style={styles.pageTitle}>Profil</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Feather name="user" size={36} color="#FFFFFF" />
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
          <Feather name="maximize" size={20} color={PRIMARY} />
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
          <Feather name="user-check" size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Perbarui wajah</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryActionButton]}
          onPress={handleUbahPassword}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Ubah password">
          <Feather name="lock" size={18} color={PRIMARY} />
          <Text style={[styles.actionButtonText, styles.secondaryActionText]}>Ubah password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerActionButton]}
          onPress={handleKeluar}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Keluar">
          <Feather name="log-out" size={18} color="#B42336" />
          <Text style={[styles.actionButtonText, styles.dangerActionText]}>Keluar</Text>
        </TouchableOpacity>
      </ScrollView>
    </MainScreen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Content
  content: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  contentContainer: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  secondaryActionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE5F0',
  },
  dangerActionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE5F0',
  },
  secondaryActionText: {
    color: PRIMARY,
  },
  dangerActionText: {
    color: '#B42336',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
