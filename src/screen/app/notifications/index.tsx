import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import { colors } from '../../../constants';
import { ms, scale, vs } from '../../../utils/responsive';
import Loader from '../../../components/loader';
import {
  useGetNotifications,
  useReadNotification,
  useMarkAllRead,
  NotificationItem,
} from '../../../services/queries/app/notifications';

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { data, isLoading, refetch, isRefetching } = useGetNotifications();
  const readNotificationMutation = useReadNotification();
  const markAllReadMutation = useMarkAllRead();

  const notifications = data?.data || [];

  const handleNotificationPress = async (item: NotificationItem) => {
    if (!item.isRead) {
      await readNotificationMutation.mutateAsync(item._id);
    }
    // We can handle navigation to item.link here if needed later
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'payment_success':
        return <Icon name="card-outline" size={ms(20)} color={colors.primary} />;
      case 'bidder_registration':
        return <Icon name="person-add-outline" size={ms(20)} color={colors.primary} />;
      default:
        return <Icon name="notifications-outline" size={ms(20)} color={colors.primary} />;
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.itemContainer, !item.isRead && styles.unreadItemContainer]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.iconContainer}>{renderIcon(item.type)}</View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <AppText
              title={item.title}
              fontFamily={item.isRead ? 'medium' : 'bold'}
              fontySize="px14"
              color={item.isRead ? 'textPrimary' : 'dark'}
              style={{ flex: 1 }}
            />
            <AppText
              title={moment(item.createdAt).fromNow()}
              fontySize="px12"
              color="textSecondary"
            />
          </View>
          <AppText
            title={item.message}
            fontySize="px14"
            color="textSecondary"
            marginTop={vs(4)}
          />
        </View>
        {/* {!item.isRead && <View style={styles.unreadDot} />} */}
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Loader isLoading={true} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="notifications-off-outline" size={ms(60)} color={colors.textLight} />
        <AppText
          title="No Notifications"
          fontySize="px18"
          fontFamily="bold"
          color="textPrimary"
          marginTop={vs(10)}
        />
        <AppText
          title="You're all caught up! Check back later for updates."
          fontySize="px14"
          color="textSecondary"
          marginTop={vs(5)}
          textAlign="center"
        />
      </View>
    );
  };

  const unreadCount = data?.unreadCount || 0;
  const isMarkingRead = markAllReadMutation.isPending;

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Notifications"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        showNotification={false}
        rightContent={
          <TouchableOpacity
            onPress={handleMarkAllRead}
            disabled={unreadCount === 0 || isMarkingRead}
            style={{ padding: ms(5), opacity: unreadCount > 0 ? 1 : 0.4 }}
          >
            {isMarkingRead ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <AppText
                title="Mark all as read"
                color={unreadCount > 0 ? 'primary' : 'textSecondary'}
                fontySize="px14"
                fontFamily="bold"
              />
            )}
          </TouchableOpacity>
        }
      />
      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: vs(10),
  },
  itemContainer: {
    flexDirection: 'row',
    padding: ms(16),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadItemContainer: {
    backgroundColor: '#F5F8FF', // subtle tint for unread
  },
  iconContainer: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unreadDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: 'red',
    alignSelf: 'center',
    marginLeft: scale(8),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ms(20),
    // marginTop: vs(100),
  },
});

export default NotificationScreen;
