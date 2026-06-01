import React from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ms, vs } from '../utils/responsive';
import { colors } from '../constants';
import { ImageComponent } from './AppImage';
import { AppText } from './AppText';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { routes } from '../navigation/route';
import { useGetNotifications } from '../services/queries/app/notifications';
import { useGetMessages } from '../services/queries/app/messages';

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
  showNotification?: boolean;
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
  showNotification = true,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { data } = useGetNotifications();
  const unreadCount = data?.unreadCount || 0;
  const { data: messagesData } = useGetMessages();
  const unreadMessagesCount = messagesData?.unreadCount || 0;

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

        <View style={styles.rightContainer}>
          {rightContent}
          {showNotification && (
            <>
              <TouchableOpacity
                style={styles.notificationBtn}
                onPress={() => navigation.navigate(routes.messageScreen)}
              >
                <Icon name="chatbubble-ellipses-outline" size={ms(24)} color={colors.textPrimary} />
                {unreadMessagesCount > 0 && <View style={styles.badge} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.notificationBtn}
                onPress={() => navigation.navigate(routes.notificationScreen)}
              >
                <Icon name="notifications-outline" size={ms(24)} color={colors.textPrimary} />
                {unreadCount > 0 && <View style={styles.badge} />}
              </TouchableOpacity>
            </>
          )}
        </View>
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
  notificationBtn: {
    marginLeft: ms(12),
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: 'red',
  },
});

export default AppHeader;
