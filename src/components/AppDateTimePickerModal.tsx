import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppText} from './AppText';
import {colors} from '../constants';
import {ms, scale, vs} from '../utils/responsive';

type PickerMode = 'date' | 'time' | 'datetime';

interface AppDateTimePickerModalProps {
  isVisible: boolean;
  mode?: PickerMode;
  date?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  confirmTextIOS?: string;
  cancelTextIOS?: string;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const pad = (value: number) => String(value).padStart(2, '0');
const OPTION_HEIGHT = vs(42);
const COLUMN_HEIGHT = vs(220);

const getDaysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate();

const getSafeDate = (date?: Date) => {
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date;
  }
  return new Date();
};

interface PickerColumnProps {
  children: React.ReactNode;
  selectedIndex: number;
  isVisible: boolean;
  width?: number;
}

const PickerColumn: React.FC<PickerColumnProps> = ({
  children,
  selectedIndex,
  isVisible,
  width,
}) => {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      const y = Math.max(
        0,
        selectedIndex * OPTION_HEIGHT - COLUMN_HEIGHT / 2 + OPTION_HEIGHT / 2,
      );
      scrollRef.current?.scrollTo({y, animated: false});
    }, 80);

    return () => clearTimeout(timer);
  }, [isVisible, selectedIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.column, width ? {width} : null]}
      contentContainerStyle={styles.columnContent}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
};

const AppDateTimePickerModal: React.FC<AppDateTimePickerModalProps> = ({
  isVisible,
  mode = 'date',
  date,
  onConfirm,
  onCancel,
  confirmTextIOS = 'Confirm',
  cancelTextIOS = 'Cancel',
}) => {
  const initialDate = getSafeDate(date);
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({length: 141}, (_, index) => currentYear - 100 + index),
    [currentYear],
  );
  const minutes = useMemo(() => Array.from({length: 60}, (_, index) => index), []);

  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [day, setDay] = useState(initialDate.getDate());
  const [hour, setHour] = useState(() => {
    const value = initialDate.getHours() % 12;
    return value === 0 ? 12 : value;
  });
  const [minute, setMinute] = useState(initialDate.getMinutes());
  const [period, setPeriod] = useState<'AM' | 'PM'>(
    initialDate.getHours() >= 12 ? 'PM' : 'AM',
  );

  useEffect(() => {
    if (!isVisible) return;

    const nextDate = getSafeDate(date);
    setYear(nextDate.getFullYear());
    setMonth(nextDate.getMonth());
    setDay(nextDate.getDate());
    setHour(() => {
      const value = nextDate.getHours() % 12;
      return value === 0 ? 12 : value;
    });
    setMinute(nextDate.getMinutes());
    setPeriod(nextDate.getHours() >= 12 ? 'PM' : 'AM');
  }, [date, isVisible]);

  const days = useMemo(() => {
    const count = getDaysInMonth(year, month);
    return Array.from({length: count}, (_, index) => index + 1);
  }, [month, year]);

  useEffect(() => {
    const maxDay = getDaysInMonth(year, month);
    if (day > maxDay) {
      setDay(maxDay);
    }
  }, [day, month, year]);

  const handleConfirm = () => {
    let nextHour = hour % 12;
    if (period === 'PM') {
      nextHour += 12;
    }

    const nextDate = new Date(year, month, day, nextHour, minute, 0, 0);
    onConfirm(nextDate);
  };

  const renderOption = (
    label: string,
    isSelected: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      key={label}
      activeOpacity={0.75}
      style={[styles.option, isSelected && styles.selectedOption]}
      onPress={onPress}>
      <AppText
        title={label}
        fontySize="px16"
        fontFamily={isSelected ? 'bold' : 'regular'}
        color={isSelected ? 'primary' : 'textPrimary'}
        textAlign="center"
      />
    </TouchableOpacity>
  );

  const showDate = mode === 'date' || mode === 'datetime';
  const showTime = mode === 'time' || mode === 'datetime';
  const yearIndex = Math.max(0, years.findIndex(item => item === year));

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.sheet}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
              <AppText
                title={cancelTextIOS}
                fontySize="px14"
                color="textSecondary"
              />
            </TouchableOpacity>
            <AppText
              title={mode === 'time' ? 'Select Time' : 'Select Date'}
              fontySize="px16"
              fontFamily="bold"
              color="textPrimary"
            />
            <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
              <AppText
                title={confirmTextIOS}
                fontySize="px14"
                fontFamily="bold"
                color="primary"
                textAlign="right"
              />
            </TouchableOpacity>
          </View>

          {showDate ? (
            <View style={styles.pickerRow}>
              <PickerColumn selectedIndex={month} isVisible={isVisible}>
                {MONTHS.map((item, index) =>
                  renderOption(item, month === index, () => setMonth(index)),
                )}
              </PickerColumn>
              <PickerColumn selectedIndex={Math.max(0, day - 1)} isVisible={isVisible}>
                {days.map(item =>
                  renderOption(String(item), day === item, () => setDay(item)),
                )}
              </PickerColumn>
              <PickerColumn selectedIndex={yearIndex} isVisible={isVisible}>
                {years.map(item =>
                  renderOption(String(item), year === item, () => setYear(item)),
                )}
              </PickerColumn>
            </View>
          ) : null}

          {showTime ? (
            <View style={[styles.pickerRow, showDate && styles.timeRow]}>
              <PickerColumn selectedIndex={Math.max(0, hour - 1)} isVisible={isVisible}>
                {Array.from({length: 12}, (_, index) => index + 1).map(item =>
                  renderOption(pad(item), hour === item, () => setHour(item)),
                )}
              </PickerColumn>
              <PickerColumn selectedIndex={minute} isVisible={isVisible}>
                {minutes.map(item =>
                  renderOption(pad(item), minute === item, () => setMinute(item)),
                )}
              </PickerColumn>
              <PickerColumn selectedIndex={period === 'AM' ? 0 : 1} isVisible={isVisible}>
                {(['AM', 'PM'] as const).map(item =>
                  renderOption(item, period === item, () => setPeriod(item)),
                )}
              </PickerColumn>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AppDateTimePickerModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: scale(18),
    borderTopRightRadius: scale(18),
    paddingBottom: vs(18),
    maxHeight: '78%',
  },
  header: {
    minHeight: vs(52),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: ms(16),
  },
  headerButton: {
    minWidth: scale(82),
    paddingVertical: vs(12),
  },
  pickerRow: {
    flexDirection: 'row',
    paddingHorizontal: ms(12),
    paddingTop: vs(12),
    gap: scale(8),
  },
  timeRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: vs(12),
  },
  column: {
    flex: 1,
    maxHeight: COLUMN_HEIGHT,
  },
  columnContent: {
    paddingVertical: vs(4),
  },
  option: {
    minHeight: OPTION_HEIGHT - vs(4),
    justifyContent: 'center',
    borderRadius: scale(8),
    marginVertical: vs(2),
  },
  selectedOption: {
    backgroundColor: '#FDECEE',
  },
});
