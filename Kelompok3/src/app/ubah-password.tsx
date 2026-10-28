import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MainTabBar } from '@/components/main-tab-bar';

const COLORS = {
  navy: '#101477',
  muted: '#526487',
  border: '#DCE5F0',
  background: '#F4F7FC',
  iconBackground: '#EAF3FA',
};

function PasswordField({
  label,
  value,
  onChangeText,
  returnKeyType,
  onSubmitEditing,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  returnKeyType: 'next' | 'done';
  onSubmitEditing?: () => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          secureTextEntry={!visible}
          style={styles.input}
          value={value}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Sembunyikan password' : 'Tampilkan password'}
          accessibilityState={{ selected: visible }}
          hitSlop={8}
          onPress={() => setVisible((current) => !current)}
          style={({ pressed }) => [styles.visibilityButton, pressed && styles.pressed]}>
          <Feather name={visible ? 'eye' : 'eye-off'} size={19} color={COLORS.navy} />
        </Pressable>
      </View>
    </View>
  );
}

export default function UbahPasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Data belum lengkap', 'Isi semua kolom password terlebih dahulu.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Password terlalu pendek', 'Password baru harus minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password tidak cocok', 'Konfirmasi password baru belum sama.');
      return;
    }

    Alert.alert(
      'Belum terhubung',
      'Form sudah valid, tetapi perubahan password belum terhubung ke layanan akun.',
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.app}>
        <View style={styles.brandHeader}>
          <Image
            accessibilityLabel="Logo HIMAFOR"
            contentFit="contain"
            source={require('@/assets/images/himafor-logo.png')}
            style={styles.logo}
          />
          <Text style={styles.brand}>HIMAFOR</Text>
        </View>

        <View style={styles.titleBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke profil"
            hitSlop={8}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Feather name="arrow-left" size={21} color={COLORS.navy} />
          </Pressable>
          <Text style={styles.pageTitle}>Ubah Password</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scroll}>
          <View style={styles.passwordCard}>
            <View style={styles.cardHeading}>
              <View style={styles.lockIcon}>
                <Feather name="lock" size={17} color={COLORS.navy} />
              </View>
              <Text style={styles.cardTitle}>Keamanan akun</Text>
            </View>
            <Text style={styles.description}>
              Gunakan password yang kuat untuk menjaga akun presensi Anda.
            </Text>

            <View style={styles.fields}>
              <PasswordField
                label="Password saat ini"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                returnKeyType="next"
              />
              <PasswordField
                label="Password baru"
                value={newPassword}
                onChangeText={setNewPassword}
                returnKeyType="next"
              />
              <Text style={styles.hint}>Minimal 8 karakter, gunakan kombinasi huruf dan angka.</Text>
              <PasswordField
                label="Konfirmasi password baru"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleSave}
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
            <Text style={styles.saveButtonText}>Simpan Password</Text>
          </Pressable>

          <View style={styles.securityNote}>
            <Feather name="shield" size={16} color={COLORS.navy} />
            <Text style={styles.securityText}>
              Jangan bagikan password Anda kepada siapa pun.
            </Text>
          </View>
        </ScrollView>

        <MainTabBar activePath="/profil" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  app: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: COLORS.background,
  },
  brandHeader: {
    height: 63,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logo: {
    width: 30,
    height: 30,
  },
  brand: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  titleBar: {
    height: 57,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 23,
    height: 36,
    justifyContent: 'center',
  },
  pageTitle: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
  },
  passwordCard: {
    padding: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lockIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.iconBackground,
  },
  cardTitle: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
  },
  fields: {
    gap: 21,
    marginTop: 24,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '500',
  },
  inputWrap: {
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    color: COLORS.navy,
    fontSize: 15,
  },
  visibilityButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginTop: -13,
    marginBottom: -3,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  saveButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: COLORS.navy,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 17,
    paddingHorizontal: 4,
  },
  securityText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.75,
  },
});
