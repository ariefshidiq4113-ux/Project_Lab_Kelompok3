import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

export function HimaforHeader() {
  return (
    <View style={styles.header}>
      <Image
        source={require('@/assets/images/himafor-logo.png')}
        style={styles.logo}
        contentFit="contain"
        accessibilityLabel="Logo HIMAFOR"
      />
      <Text style={styles.brand}>HIMAFOR</Text>
      <View style={styles.onlineDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    height: 24,
    width: 24,
  },
  brand: {
    color: '#101477',
    fontSize: 14,
    fontWeight: '800',
  },
  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#39BFB7',
  },
});
