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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: implement login logic
  };

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
            <View style={styles.logoContainer}>
              <Text style={styles.logoLetter}>H</Text>
            </View>
            <Text style={styles.appName}>HIMAFOR</Text>
            <Text style={styles.subtitle}>Attendance System</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="nama@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                accessibilityLabel="Email"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                accessibilityLabel="Password"
              />
            </View>

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

const PRIMARY = '#1A237E';

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
  brandSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '700',
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
  formSection: {
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
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
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
    marginTop: 4,
  },
});
