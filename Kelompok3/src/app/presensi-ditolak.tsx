import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HimaforHeader } from '@/components/himafor-header';

export default function PresensiDitolakScreen() {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.app}>
        <HimaforHeader />
        <View style={styles.content}>
          <View style={styles.result}>
            <View style={styles.iconOuter}>
              <View style={styles.iconInner}>
                <SymbolView
                  name={{ ios: 'xmark', android: 'close', web: 'close' }}
                  size={29}
                  tintColor="#101477"
                />
              </View>
            </View>
            <Text style={styles.title}>Presensi ditolak</Text>
            <Text style={styles.description}>
              Liveness tidak terdeteksi. Pastikan wajah terlihat jelas,
              {'\n'}tanpa foto atau layar.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/kegiatan')}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
              <SymbolView
                name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
                size={18}
                tintColor="#FFFFFF"
              />
              <Text style={styles.retryText}>Coba lagi</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/profil')}
              style={({ pressed }) => [styles.adminButton, pressed && styles.pressed]}>
              <SymbolView
                name={{
                  ios: 'bubble.left',
                  android: 'chat_bubble_outline',
                  web: 'chat_bubble_outline',
                }}
                size={18}
                tintColor="#101477"
              />
              <Text style={styles.adminText}>Hubungi admin</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  result: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconOuter: {
    width: 106,
    height: 106,
    borderRadius: 53,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FB',
    marginBottom: 24,
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#39BFB7',
    borderWidth: 1.5,
    borderColor: '#3289D1',
  },
  title: {
    color: '#101477',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
  },
  description: {
    color: '#7183A2',
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'center',
  },
  actions: {
    gap: 11,
  },
  retryButton: {
    height: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 12,
    backgroundColor: '#101477',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  adminButton: {
    height: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE5F0',
    backgroundColor: '#FFFFFF',
  },
  adminText: {
    color: '#101477',
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
});
