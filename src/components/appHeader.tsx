import React from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ms, vs } from '../utils/responsive';
import { colors } from '../constants';
import { ImageComponent } from './AppImage';
import { AppText } from './AppText';
import Icon from 'react-native-vector-icons/Ionicons';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  leftIcon?: any;
  onLeftPress?: () => void;
  rightContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  containerStyle?: ViewStyle;
  backgroundColor?: string;
  titleColor?: keyof typeof colors;
  showBorder?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  onLeftPress,
  rightContent,
  centerContent,
  containerStyle,
  backgroundColor = colors.white,
  titleColor = 'primary',
  showBorder = true,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + vs(10),
          backgroundColor: backgroundColor,
          borderBottomWidth: 1,
        },
        containerStyle,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.leftContainer}>
          {leftIcon ? (
            <TouchableOpacity onPress={onLeftPress} style={styles.menuButton}>
              <Icon name={leftIcon} size={ms(24)} color={colors.textPrimary} />
            </TouchableOpacity>
          ) : null}
          {!centerContent && (
            <View>
              {title && (
                <AppText
                  title={title}
                  color={titleColor}
                  fontySize="px18"
                  fontFamily="bold"
                />
              )}
              {subtitle && (
                <AppText
                  title={subtitle}
                  color="textSecondary"
                  fontySize="px12"
                />
              )}
            </View>
          )}
        </View>

        {centerContent && (
          <View style={styles.centerContainer}>{centerContent}</View>
        )}

        <View style={styles.rightContainer}>{rightContent}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: ms(15),
    paddingBottom: vs(10),
    borderBottomColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: vs(40),
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  centerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    marginRight: ms(10),
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
});

export default AppHeader;
