import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';
import { login, saveSession } from '@/services/auth.service';
import { API_BASE_URL } from '@/constants/api';

WebBrowser.maybeCompleteAuthSession();

// ─── Konstanta ────────────────────────────────────────────────────────────────

const ICON = {
  navy: '#101477',
  muted: '#7183A2',
  danger: '#DC2626',
  placeholder: '#9CA3AF',
} as const;

const PRIMARY = '#101477';
type Role = 'admin' | 'anggota';
const ADMIN_HOME = '/presensi_admin';
const MEMBER_HOME = '/beranda';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function borderColor(error: string, focused: boolean) {
  if (error) return '#DC2626';
  if (focused) return PRIMARY;
  return '#DCE5F0';
}

function iconColor(error: string, focused: boolean) {
  if (error) return ICON.danger;
  if (focused) return ICON.navy;
  return ICON.muted;
}

function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) return params;
  const queryString = url.slice(queryIndex + 1);
  const pairs = queryString.split('&');
  for (const pair of pairs) {
    const [rawKey, ...rawValParts] = pair.split('=');
    if (rawKey) {
      try {
        params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValParts.join('=') || '');
      } catch {
        params[rawKey] = rawValParts.join('=') || '';
      }
    }
  }
  return params;
}

function getAppRedirectUri(): string {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }

  // 1. Coba dari Constants.linkingUri (bawaan Expo Go: exp://...)
  if (
    Constants.linkingUri &&
    (Constants.linkingUri.startsWith('exp://') || Constants.linkingUri.startsWith('exps://'))
  ) {
    return Constants.linkingUri.replace(/\/--(\/.*)?$/, '').replace(/\/+$/, '');
  }

  // 2. Coba dari hostUri dev server (Expo Go: exp://IP:PORT)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return `exp://${hostUri.replace(/\/+$/, '')}`;
  }

  // 3. Coba Linking.createURL dengan scheme eksplisit 'exp'
  try {
    const expUrl = Linking.createURL('', { scheme: 'exp' });
    if (expUrl.startsWith('exp://') || expUrl.startsWith('exps://')) {
      return expUrl.replace(/\/+$/, '');
    }
  } catch {}

  // 4. Standalone APK build (kelompok3://)
  return makeRedirectUri({ scheme: 'kelompok3' });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const processOAuthUrl = async (url: string) => {
    try {
      const params = parseUrlParams(url);

      if (params.error) {
        setGlobalError(params.error);
        return;
      }

      if (params.token && params.member) {
        const memberData = JSON.parse(params.member);
        await saveSession(params.token, memberData);
        afterLogin(memberData);
      } else {
        setGlobalError('Data login dari Google tidak lengkap.');
      }
    } catch (err: any) {
      console.error('[Google Auth] Gagal memproses session:', err);
      setGlobalError('Gagal memproses data login.');
    }
  };

  useEffect(() => {
    const sub = Linking.addEventListener('url', (event) => {
      console.log('[Google Auth] Deep link listener menerima URL:', event.url);
      processOAuthUrl(event.url);
    });

    return () => sub.remove();
  }, []);

  const handleGoogleLogin = async () => {
    if (isAnyLoading) return;
    setGlobalError('');
    setGoogleLoading(true);

    try {
      const redirectUri = getAppRedirectUri();
      console.log('[Google Auth] app redirectUri:', redirectUri);

      const authUrl = `${API_BASE_URL}/auth/google/start?redirect_uri=${encodeURIComponent(redirectUri)}`;
      console.log('[Google Auth] authUrl:', authUrl);

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      console.log('[Google Auth] result:', result);

      if (result.type === 'success' && result.url) {
        await processOAuthUrl(result.url);
      }
    } catch (err: any) {
      console.error('[Google Auth] Error:', err);
      setGlobalError(err?.message ?? 'Login Google gagal. Coba lagi.');
    } finally {
      setGoogleLoading(false);
    }
  };

  function afterLogin(member: { isAdmin: boolean; mustChangePassword: boolean }) {
    if (member.isAdmin) {
      setShowRolePicker(true);
    } else if (member.mustChangePassword) {
      router.replace('/register-face' as any);
    } else {
      router.replace(MEMBER_HOME as any);
    }
  }

  const handleLogin = async () => {
    if (loading) return;
    setGlobalError('');

    let valid = true;
    if (!email.trim()) { setEmailError('Email tidak boleh kosong.'); valid = false; }
    else if (!validateEmail(email.trim())) { setEmailError('Format email tidak valid.'); valid = false; }
    else setEmailError('');

    if (!password) { setPasswordError('Password tidak boleh kosong.'); valid = false; }
    else if (password.length < 6) { setPasswordError('Password minimal 6 karakter.'); valid = false; }
    else setPasswordError('');

    if (!valid) return;

    Keyboard.dismiss();
    setLoading(true);
    try {
      const member = await login(email.trim(), password);
      afterLogin(member);
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (err?.status === 401 || msg.toLowerCase().includes('password')) {
        setPasswordError('Email atau password salah.');
      } else if (err?.status === undefined) {
        setGlobalError('Tidak dapat terhubung ke server. Periksa koneksi internet.');
      } else {
        setGlobalError(msg || 'Terjadi kesalahan. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const enterAs = (target: Role) => {
    setShowRolePicker(false);
    router.replace((target === 'admin' ? ADMIN_HOME : MEMBER_HOME) as any);
  };

  const isAnyLoading = loading || googleLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}>

          {/* Branding */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Image
              source={require('@/assets/images/himafor-logo.png')}
              style={{ width: 76, height: 76, marginBottom: 16 }}
              contentFit="contain"
              accessibilityLabel="Logo HIMAFOR"
            />
            <Text style={{ color: PRIMARY, fontSize: 28, fontWeight: '800', letterSpacing: 1, marginBottom: 4 }}>
              HIMAFOR
            </Text>
            <Text style={{ color: '#6B7280', fontSize: 15 }}>Attendance System</Text>
          </View>

          {/* Form card */}
          <View style={{ width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: '#F4F7FC', borderWidth: 1, borderColor: '#DCE5F0', borderRadius: 22, padding: 22, gap: 16 }}>

            {globalError ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12 }}>
                <Feather name="alert-circle" size={15} color="#DC2626" />
                <Text style={{ color: '#DC2626', fontSize: 13, flex: 1 }}>{globalError}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View style={{ gap: 6 }}>
              <Text style={{ color: PRIMARY, fontSize: 14, fontWeight: '700' }}>Email</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: borderColor(emailError, emailFocused), borderRadius: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF' }}>
                <Feather name="mail" size={18} color={iconColor(emailError, emailFocused)} />
                <TextInput
                  style={{ flex: 1, paddingVertical: 13, fontSize: 15, color: '#111827' }}
                  placeholder="nama@email.com"
                  placeholderTextColor={ICON.placeholder}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (!text.trim()) setEmailError('Email tidak boleh kosong.');
                    else if (!validateEmail(text.trim())) setEmailError('Format email tidak valid.');
                    else setEmailError('');
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  accessibilityLabel="Email"
                />
              </View>
              {emailError ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Feather name="alert-circle" size={13} color="#DC2626" />
                  <Text style={{ color: '#DC2626', fontSize: 12 }}>{emailError}</Text>
                </View>
              ) : null}
            </View>

            {/* Password */}
            <View style={{ gap: 6 }}>
              <Text style={{ color: PRIMARY, fontSize: 14, fontWeight: '700' }}>Password</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: borderColor(passwordError, passwordFocused), borderRadius: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF' }}>
                <Feather name="lock" size={18} color={iconColor(passwordError, passwordFocused)} />
                <TextInput
                  style={{ flex: 1, paddingVertical: 13, fontSize: 15, color: '#111827' }}
                  placeholder="Password"
                  placeholderTextColor={ICON.placeholder}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (!text) setPasswordError('Password tidak boleh kosong.');
                    else if (text.length < 6) setPasswordError('Password minimal 6 karakter.');
                    else setPasswordError('');
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
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={ICON.muted} />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Feather name="alert-circle" size={13} color="#DC2626" />
                  <Text style={{ color: '#DC2626', fontSize: 12 }}>{passwordError}</Text>
                </View>
              ) : null}
            </View>

            {/* Login button */}
            <TouchableOpacity
              style={{ backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4, opacity: isAnyLoading ? 0.7 : 1 }}
              onPress={handleLogin}
              disabled={isAnyLoading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Login">
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Login</Text>}
            </TouchableOpacity>

            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#DCE5F0' }} />
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>atau</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#DCE5F0' }} />
            </View>

            {/* Google button */}
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: '#DCE5F0', borderRadius: 12, paddingVertical: 14, backgroundColor: '#FFFFFF', opacity: isAnyLoading ? 0.7 : 1 }}
              onPress={handleGoogleLogin}
              disabled={isAnyLoading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Login dengan Google">
              {googleLoading ? (
                <ActivityIndicator color={PRIMARY} />
              ) : (
                <>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#4285F4', lineHeight: 20 }}>G</Text>
                  <Text style={{ color: PRIMARY, fontSize: 15, fontWeight: '600' }}>Login dengan Google</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={{ textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
              Lupa password? Hubungi admin.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Role picker modal */}
      <Modal visible={showRolePicker} transparent animationType="fade" onRequestClose={() => setShowRolePicker(false)}>
        <Pressable style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 }} onPress={() => setShowRolePicker(false)}>
          <Pressable style={{ width: '100%', maxWidth: 360, backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }} onPress={() => {}}>
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '700', color: PRIMARY }}>Masuk sebagai?</Text>
            <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 }} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={{ flex: 1, alignItems: 'center', backgroundColor: PRIMARY, borderRadius: 10, paddingVertical: 14 }} onPress={() => enterAs('admin')} activeOpacity={0.85}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, alignItems: 'center', backgroundColor: PRIMARY, borderRadius: 10, paddingVertical: 14 }} onPress={() => enterAs('anggota')} activeOpacity={0.85}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Anggota</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
