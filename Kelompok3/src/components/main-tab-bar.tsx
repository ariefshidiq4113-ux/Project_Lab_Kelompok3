import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

const TABS = [
  { label: 'Beranda', path: '/beranda', icon: 'home' },
  { label: 'Kegiatan', path: '/kegiatan', icon: 'calendar' },
  {
    label: 'Riwayat',
    path: '/riwayat',
    icon: 'clock',
  },
  { label: 'Profil', path: '/profil', icon: 'user' },
] as const;

type TabPath = (typeof TABS)[number]['path'];

export function MainTabBar({ activePath }: { activePath: TabPath }) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const selected = tab.path === activePath;
        return (
          <Pressable
            key={tab.path}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => {
              if (!selected) router.replace(tab.path);
            }}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
            <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
              <Feather
                name={tab.icon}
                size={20}
                color={selected ? '#101477' : '#7183A2'}
              />
            </View>
            <Text numberOfLines={1} style={[styles.label, selected && styles.labelSelected]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#DCE5F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 60,
    paddingHorizontal: 2,
  },
  iconWrap: {
    minWidth: 48,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  iconWrapSelected: {
    backgroundColor: '#EAF3FA',
  },
  label: {
    color: '#7183A2',
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  labelSelected: {
    color: '#3289D1',
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});
