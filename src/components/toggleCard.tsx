import React, {memo, useCallback} from 'react';
import {View, StyleSheet, Switch, ViewStyle} from 'react-native';
import AppPressable from './appPressable';
import {ImageComponent} from './AppImage';
import {AppText} from './AppText';
import Card from './Card';
import {vs} from '../utils/responsive';
import {colors} from '../constants';

export type ToggleCardProps = {
  icon: any;
  title: string;
  subTitle?: string;
  value: boolean;
  onToggle: (val: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
};

const TRACK_COLOR = {
  false: '#E5E7EB',
  true: colors.primary,
};

const ToggleCard = memo(
  ({
    icon,
    title,
    subTitle,
    value,
    onToggle,
    disabled = false,
    style,
  }: ToggleCardProps) => {
    const handleToggle = useCallback(() => {
      if (!disabled) onToggle(!value);
    }, [value, onToggle, disabled]);

    return (
      <Card style={style}>
        <AppPressable
          onPress={handleToggle}
          disabled={disabled}
          style={styles.itemRow}
          accessibilityRole="switch"
          accessibilityState={{checked: value, disabled}}>
          <View style={styles.itemLeft}>
            <View style={styles.iconWrapper}>
              <ImageComponent source={icon} style={styles.itemIcon} />
            </View>

            <View style={styles.textContainer}>
              <AppText
                title={title}
                fontySize="px18"
                fontFamily="medium"
                color="textPrimary"
              />

              {!!subTitle && (
                <AppText
                  title={subTitle}
                  fontySize="px16"
                  fontFamily="regular"
                  color="textSecondary"
                  marginTop={2}
                />
              )}
            </View>
          </View>

          <Switch
            value={value}
            onValueChange={onToggle}
            disabled={disabled}
            trackColor={TRACK_COLOR}
            thumbColor={colors.white}
          />
        </AppPressable>
      </Card>
    );
  },
);

export default ToggleCard;

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    flexShrink: 1,
  },
  iconWrapper: {
    backgroundColor: '#DBEAFE',
    padding: vs(15),
    borderRadius: vs(30),
    marginRight: vs(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIcon: {
    width: vs(25),
    height: vs(25),
  },
});
