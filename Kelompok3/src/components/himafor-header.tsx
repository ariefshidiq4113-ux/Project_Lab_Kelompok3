import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

export function HimaforHeader({ role }: { role?: string }) {
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
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DCE5F0',
  },
  logo: {
    height: 30,
    width: 30,
  },
  brand: {
    color: '#101477',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
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
});
