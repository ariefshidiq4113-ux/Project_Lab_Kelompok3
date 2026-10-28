import { useState } from 'react';
import {
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

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

  const handleLogin = () => {
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

    // TODO: hubungkan ke auth API
    router.replace('/beranda' as any);
  };

  const emailBorderClass = emailError
    ? 'border-danger'
    : emailFocused
      ? 'border-navy shadow-sm shadow-navy/20'
      : 'border-line';

  const passwordBorderClass = passwordError
    ? 'border-danger'
    : passwordFocused
      ? 'border-navy shadow-sm shadow-navy/20'
      : 'border-line';

  return (
    <SafeAreaView className="flex-1 bg-white">
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
              style={{ width: 76, height: 76, marginBottom: 16 }}
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
          <View className="w-full max-w-[440px] self-center gap-4 rounded-[22px] border border-line bg-surface p-[22px]">

            {/* Email field */}
            <View className="gap-1.5">
              <Text className="text-sm font-bold text-navy">Email</Text>
              <View
                className={`flex-row items-center gap-2.5 rounded-xl border-[1.5px] bg-white px-3.5 ${emailBorderClass}`}>
                <Feather
                  name="mail"
                  size={18}
                  color={emailError ? ICON.danger : emailFocused ? ICON.navy : ICON.muted}
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
                className={`flex-row items-center gap-2.5 rounded-xl border-[1.5px] bg-white px-3.5 ${passwordBorderClass}`}>
                <Feather
                  name="lock"
                  size={18}
                  color={passwordError ? ICON.danger : passwordFocused ? ICON.navy : ICON.muted}
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
              className="mt-1 items-center rounded-xl bg-navy py-4 active:opacity-80"
              onPress={handleLogin}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Login">
              <Text className="text-base font-bold text-white">Login</Text>
            </TouchableOpacity>

            <Text className="text-center text-[13px] text-subtle">
              Lupa password? Hubungi admin.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
