import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const TABS = [
  { label: 'Beranda', path: '/beranda', iosSymbol: 'house', androidSymbol: 'home' },
  { label: 'Kegiatan', path: '/kegiatan', iosSymbol: 'calendar', androidSymbol: 'calendar_month' },
  {
    label: 'Riwayat',
    path: '/riwayat',
    iosSymbol: 'clock.arrow.circlepath',
    androidSymbol: 'history',
  },
  { label: 'Profil', path: '/profil', iosSymbol: 'person', androidSymbol: 'person' },
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
            onPress={() => router.replace(tab.path as any)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
            <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
              <SymbolView
                name={{
                  ios: tab.iosSymbol,
                  android: tab.androidSymbol,
                  web: tab.androidSymbol,
                }}
                size={21}
                tintColor={selected ? '#3289D1' : '#7183A2'}
              />
            </View>
            <Text style={[styles.label, selected && styles.labelSelected]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#DCE5F0',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: '100%',
  },
  iconWrap: {
    width: 54,
    height: 28,
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
  },
  labelSelected: {
    color: '#3289D1',
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});
