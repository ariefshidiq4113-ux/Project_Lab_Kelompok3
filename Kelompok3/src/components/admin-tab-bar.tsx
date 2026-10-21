import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const TABS = [
  { label: 'Sesi presensi', icon: 'clipboard', route: '/presensifix' },
  { label: 'Kegiatan', icon: 'calendar', route: '/kegiatanfix' },
  { label: 'Anggota', icon: 'users', route: '/anggotafix' },
  { label: 'Rekap', icon: 'bar-chart-2', route: '/rekapfix' },
] as const;

export function AdminTabBar() {
  const router = useRouter();
  const pathname = usePathname().toLowerCase();

  return (
    <View style={styles.bar}>
      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const active = pathname === String(tab.route).toLowerCase();
          return (
            <Pressable
              key={tab.route}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: active }}
              onPress={() => {
                if (!active) router.replace(tab.route);
              }}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <Feather
                  name={tab.icon}
                  size={19}
                  color={active ? '#101477' : '#7183A2'}
                />
              </View>
              <Text
                numberOfLines={2}
                style={[styles.label, active && styles.labelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    borderTopColor: '#DCE5F0',
    backgroundColor: '#FFFFFF',
  },
  tabs: {
    width: '100%',
    maxWidth: 720,
    minHeight: 68,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 1,
  },
  iconWrap: {
    minWidth: 46,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  iconWrapActive: {
    backgroundColor: '#EAF3FA',
  },
  label: {
    maxWidth: '100%',
    color: '#7183A2',
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
  labelActive: {
    color: '#101477',
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});
