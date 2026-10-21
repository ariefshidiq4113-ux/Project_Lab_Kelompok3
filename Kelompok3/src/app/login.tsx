import { useState } from 'react';
import {
  StyleSheet,
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

const PRIMARY = '#101477';
const ERROR_COLOR = '#DC2626';
const FOCUS_COLOR = PRIMARY;
const BORDER_DEFAULT = '#DCE5F0';

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

  const emailBorderColor = emailError
    ? ERROR_COLOR
    : emailFocused
      ? FOCUS_COLOR
      : BORDER_DEFAULT;

  const passwordBorderColor = passwordError
    ? ERROR_COLOR
    : passwordFocused
      ? FOCUS_COLOR
      : BORDER_DEFAULT;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Logo & Branding */}
          <View style={styles.brandSection}>
            <Image
              source={require('@/assets/images/himafor-logo.png')}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel="Logo HIMAFOR"
            />
            <Text style={styles.appName}>HIMAFOR</Text>
            <Text style={styles.subtitle}>Attendance System</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>

            {/* Email field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View
                style={[
                  styles.inputWrap,
                  { borderColor: emailBorderColor },
                  emailFocused && styles.inputWrapFocused,
                ]}>
                <Feather
                  name="mail"
                  size={18}
                  color={emailError ? ERROR_COLOR : emailFocused ? PRIMARY : '#7183A2'}
                />
                <TextInput
                  style={styles.input}
                  placeholder="nama@email.com"
                  placeholderTextColor="#9CA3AF"
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
                <View style={styles.errorRow}>
                  <Feather name="alert-circle" size={13} color={ERROR_COLOR} />
                  <Text style={styles.errorText}>{emailError}</Text>
                </View>
              ) : null}
            </View>

            {/* Password field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputWrap,
                  { borderColor: passwordBorderColor },
                  passwordFocused && styles.inputWrapFocused,
                ]}>
                <Feather
                  name="lock"
                  size={18}
                  color={passwordError ? ERROR_COLOR : passwordFocused ? PRIMARY : '#7183A2'}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
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
                    color="#7183A2"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <View style={styles.errorRow}>
                  <Feather name="alert-circle" size={13} color={ERROR_COLOR} />
                  <Text style={styles.errorText}>{passwordError}</Text>
                </View>
              ) : null}
            </View>

            {/* Login button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Login">
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <Text style={styles.forgotPassword}>
              Lupa password? Hubungi admin.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 48,
  },

  // Branding
  brandSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 76,
    height: 76,
    marginBottom: 16,
  },
  appName: {
    color: PRIMARY,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '400',
  },

  // Form card
  formSection: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    padding: 22,
    borderRadius: 22,
    backgroundColor: '#F4F7FC',
    borderWidth: 1,
    borderColor: '#DCE5F0',
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: BORDER_DEFAULT,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  inputWrapFocused: {
    // shadow subtil saat fokus
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: 12,
  },

  // Button
  loginButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  forgotPassword: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 13,
  },
});
