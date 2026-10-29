import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export function HimaforHeader({
  role,
  showNotifications = false,
}: {
  role?: string;
  showNotifications?: boolean;
}) {
  return (
    <View style={styles.header}>
      <Image
        source={require('@/assets/images/himafor-logo.png')}
        style={styles.logo}
        contentFit="contain"
        accessibilityLabel="Logo HIMAFOR"
      />
      <Text style={styles.brand}>HIMAFOR</Text>
      {role ? (
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{role}</Text>
        </View>
      ) : (
        <>
          <View style={styles.spacer} />
          {showNotifications && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Buka notifikasi"
              onPress={() => router.push('/notifikasi')}
              className="h-10 w-10 items-center justify-center rounded-full border border-line bg-white active:opacity-70">
              <Feather name="bell" size={19} color="#101477" />
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buka profil"
            onPress={() => router.push('/profil')}
            style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}>
            <Text style={styles.avatarText}>N</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DCE5F0',
  },
  logo: {
    height: 28,
    width: 28,
  },
  brand: {
    color: '#101477',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  roleBadge: {
    marginLeft: 'auto',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EAF3FA',
  },
  roleText: {
    color: '#3289D1',
    fontSize: 12,
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#3289D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#101477',
    fontSize: 18,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
