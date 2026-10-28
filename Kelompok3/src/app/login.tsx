import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

/** Hex untuk prop warna ikon (mirror tailwind.config.js). */
const ICON = {
  navy: '#101477',
  muted: '#7183A2',
  danger: '#DC2626',
  placeholder: '#9CA3AF',
} as const;

/* ------------------------------ Peran & tujuan ----------------------------- */

type Role = 'admin' | 'anggota';

const ADMIN_HOME = '/Presensifix'; // sesi presensi admin
const MEMBER_HOME = '/register-face'; // alur anggota (daftar wajah / dashboard)

async function loginRequest(email: string, _password: string): Promise<{ role: Role }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { role: email.toLowerCase().includes('admin') ? 'admin' : 'anggota' };
}

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function inputBorderClass(error: string, focused: boolean) {
  if (error) return 'border-danger';
  if (focused) return 'border-navy';
  return 'border-line';
}

function iconColor(error: string, focused: boolean) {
  if (error) return ICON.danger;
  if (focused) return ICON.navy;
  return ICON.muted;
}

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    let valid = true;

    if (!email.trim()) {
      setEmailError('Email tidak boleh kosong.');
      valid = false;
    } else if (!validateEmail(email.trim())) {
      setEmailError('Format email tidak valid.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password tidak boleh kosong.');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password minimal 6 karakter.');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) return;

    Keyboard.dismiss();
    setLoading(true);
    try {
      const { role } = await loginRequest(email.trim(), password);

      if (role === 'admin') {
        // Akun admin: tanyakan dulu mau masuk sebagai Admin atau Anggota
        setShowRolePicker(true);
      } else {
        router.replace(MEMBER_HOME as any);
      }
    } catch {
      setPasswordError('Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  /** Dipanggil dari popup pilihan peran. */
  const enterAs = (target: Role) => {
    setShowRolePicker(false);
    router.replace((target === 'admin' ? ADMIN_HOME : MEMBER_HOME) as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Logo & Branding */}
          <View className="mb-8 items-center">
            <Image
              source={require('@/assets/images/himafor-logo.png')}
              className="mb-4 h-[76px] w-[76px]"
              contentFit="contain"
              accessibilityLabel="Logo HIMAFOR"
            />
            <Text className="mb-1 text-[28px] font-extrabold tracking-wide text-navy">
              HIMAFOR
            </Text>
            <Text className="text-[15px] font-normal text-subtle">
              Attendance System
            </Text>
          </View>

          {/* Form */}
          <View className="w-full max-w-[440px] gap-4 self-center rounded-[22px] border border-line bg-surface p-[22px]">

            {/* Email field */}
            <View className="gap-1.5">
              <Text className="text-sm font-bold text-navy">Email</Text>
              <View
                className={`flex-row items-center gap-2.5 rounded-xl border-[1.5px] bg-white px-3.5 ${inputBorderClass(emailError, emailFocused)}`}>
                <Feather
                  name="mail"
                  size={18}
                  color={iconColor(emailError, emailFocused)}
                />
                <TextInput
                  className="flex-1 py-[13px] text-[15px] text-ink-dark"
                  placeholder="nama@email.com"
                  placeholderTextColor={ICON.placeholder}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => {
                    setEmailFocused(false);
                    if (email && !validateEmail(email.trim())) {
                      setEmailError('Format email tidak valid.');
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  accessibilityLabel="Email"
                />
              </View>
              {emailError ? (
                <View className="mt-0.5 flex-row items-center gap-1.5">
                  <Feather name="alert-circle" size={13} color={ICON.danger} />
                  <Text className="text-xs text-danger">{emailError}</Text>
                </View>
              ) : null}
            </View>

            {/* Password field */}
            <View className="gap-1.5">
              <Text className="text-sm font-bold text-navy">Password</Text>
              <View
                className={`flex-row items-center gap-2.5 rounded-xl border-[1.5px] bg-white px-3.5 ${inputBorderClass(passwordError, passwordFocused)}`}>
                <Feather
                  name="lock"
                  size={18}
                  color={iconColor(passwordError, passwordFocused)}
                />
                <TextInput
                  className="flex-1 py-[13px] text-[15px] text-ink-dark"
                  placeholder="Password"
                  placeholderTextColor={ICON.placeholder}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  accessibilityLabel="Password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={ICON.muted}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <View className="mt-0.5 flex-row items-center gap-1.5">
                  <Feather name="alert-circle" size={13} color={ICON.danger} />
                  <Text className="text-xs text-danger">{passwordError}</Text>
                </View>
              ) : null}
            </View>

            {/* Login button */}
            <TouchableOpacity
              className={`mt-1 items-center rounded-xl bg-navy py-4 active:opacity-85 ${loading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Login">
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-bold text-white">Login</Text>
              )}
            </TouchableOpacity>

            <Text className="text-center text-[13px] text-subtle">
              Lupa password? Hubungi admin.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Popup pilihan peran: hanya muncul bila role di database = admin */}
      <Modal
        visible={showRolePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRolePicker(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 p-6"
          onPress={() => setShowRolePicker(false)}>
          {/* Pressable kosong agar ketukan di dalam kartu tidak menutup popup */}
          <Pressable
            className="w-full max-w-[360px] rounded-2xl bg-white px-5 pb-6 pt-5"
            onPress={() => {}}>
            <Text className="text-center text-base font-bold text-navy">
              Login Sebagai Admin atau Anggota
            </Text>
            <View className="my-4 h-px bg-card-line" />

            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 items-center rounded-[10px] bg-navy py-3.5 active:opacity-85"
                onPress={() => enterAs('admin')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Login sebagai Admin">
                <Text className="text-sm font-bold text-white">Admin</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 items-center rounded-[10px] bg-navy py-3.5 active:opacity-85"
                onPress={() => enterAs('anggota')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Login sebagai Anggota">
                <Text className="text-sm font-bold text-white">Anggota</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
