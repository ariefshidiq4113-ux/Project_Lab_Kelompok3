import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

import { HimaforHeader } from '@/components/himafor-header';
import { MainTabBar } from '@/components/main-tab-bar';

type TabPath = '/beranda' | '/kegiatan' | '/riwayat' | '/profil';

export function MainScreen({
  activePath,
  children,
}: {
  activePath: TabPath;
  children: ReactNode;
}) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.app}>
        <HimaforHeader />
        {children}
        <MainTabBar activePath={activePath} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#EEF2F8',
  },
  app: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#F4F7FC',
  },
});
