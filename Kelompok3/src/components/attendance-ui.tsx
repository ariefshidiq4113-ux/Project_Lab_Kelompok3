import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  navy: '#101477',
  ink: '#20334F',
  muted: '#7183A2',
  border: '#DCE5F0',
  blue: '#3289D1',
  teal: '#39BFB7',
};

export function FilterChips<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filters}>
      {options.map((option) => {
        const active = option === selected;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(option)}
            style={[styles.filter, active && styles.filterActive]}>
            <Text style={[styles.filterText, active && styles.filterTextActive]}>{option}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export type Activity = {
  title: string;
  date: string;
  time: string;
  state: 'open' | 'not-open' | 'completed';
  venue?: string;
  agenda?: string;
};

const ACTIVITY_STATUS = {
  open: { label: 'Presensi Dibuka', color: '#008B88', dot: COLORS.teal },
  'not-open': { label: 'Belum Dibuka', color: COLORS.muted, dot: COLORS.muted },
  completed: { label: 'Selesai', color: COLORS.muted, dot: COLORS.muted },
};

export function ActivityCard({
  activity,
  onPress,
}: {
  activity: Activity;
  onPress: () => void;
}) {
  const status = ACTIVITY_STATUS[activity.state];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${activity.title}, ${activity.date}, ${status.label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.activityCard, pressed && styles.pressed]}>
      <View style={styles.activityHeader}>
        <View style={[styles.calendarTile, activity.state === 'open' && styles.calendarTileOpen]}>
          <Feather
            name="calendar"
            size={19}
            color={activity.state === 'open' ? COLORS.blue : COLORS.muted}
          />
        </View>
        <Text style={styles.activityTitle} numberOfLines={1}>
          {activity.title}
        </Text>
        <Feather name="chevron-right" size={16} color={COLORS.muted} />
      </View>

      <View style={styles.metadata}>
        <View style={styles.metadataItem}>
          <Feather name="calendar" size={14} color={COLORS.muted} />
          <Text style={styles.metadataText}>{activity.date}</Text>
        </View>
        <View style={styles.metadataItem}>
          <Feather name="clock" size={14} color={COLORS.muted} />
          <Text style={styles.metadataText}>{activity.time}</Text>
        </View>
      </View>

      <View style={styles.separator} />
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
      </View>
    </Pressable>
  );
}

export type AttendanceRecord = {
  title: string;
  date: string;
  present: boolean;
};

export function HistoryCard({ record }: { record: AttendanceRecord }) {
  return (
    <View style={styles.historyCard}>
      <View style={styles.historyCopy}>
        <Text style={styles.historyTitle} numberOfLines={1}>
          {record.title}
        </Text>
        <Text style={styles.historyDate}>{record.date}</Text>
      </View>
      <View
        style={[
          styles.badge,
          record.present ? styles.presentBadge : styles.absentBadge,
        ]}>
        <Feather
          name={record.present ? 'check' : 'minus'}
          size={12}
          color={record.present ? '#008B88' : COLORS.navy}
        />
        <Text
          style={[
            styles.badgeText,
            record.present ? styles.presentText : styles.absentText,
          ]}>
          {record.present ? 'Hadir' : 'Tidak hadir'}
        </Text>
      </View>
    </View>
  );
}

export function PageTitle({ children }: { children: string }) {
  return <Text style={styles.pageTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  pageTitle: {
    color: COLORS.navy,
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 20,
  },
  filters: {
    gap: 8,
    paddingBottom: 24,
  },
  filter: {
    height: 34,
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  filterActive: {
    borderColor: COLORS.navy,
    backgroundColor: COLORS.navy,
  },
  filterText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activityCard: {
    padding: 17,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 17,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calendarTile: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F7FC',
  },
  calendarTileOpen: {
    backgroundColor: '#EAF3FA',
  },
  activityTitle: {
    flex: 1,
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 17,
    marginBottom: 18,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 17,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
  historyCard: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
  },
  historyCopy: {
    flex: 1,
    gap: 6,
  },
  historyTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  historyDate: {
    color: COLORS.muted,
    fontSize: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  presentBadge: {
    backgroundColor: '#E3F6F4',
  },
  absentBadge: {
    backgroundColor: '#ECEEF9',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  presentText: {
    color: '#008B88',
  },
  absentText: {
    color: COLORS.navy,
  },
  pressed: {
    opacity: 0.82,
  },
});
