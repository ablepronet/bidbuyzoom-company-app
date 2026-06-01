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
import { useGetMessages, useReadMessage, MessageItem } from '../../../services/queries/app/messages';

const MessagesScreen = () => {
  const navigation = useNavigation();
  const { data, isLoading, refetch, isRefetching } = useGetMessages();
  const readMessageMutation = useReadMessage();

  const messages = data?.data || [];

  const renderInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderItem = ({ item }: { item: MessageItem }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.itemContainer, !item.isRead && styles.unreadItemContainer]}
        onPress={async () => {
          if (!item.isRead) {
            await readMessageMutation.mutateAsync(item._id);
          }
        }}
      >
        <View style={styles.avatarContainer}>
          <AppText
            title={renderInitials(item.senderName)}
            fontFamily="bold"
            fontySize="px14"
            color="primary"
          />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <AppText
              title={item.senderName}
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
            title={item.subject}
            fontFamily={item.isRead ? 'medium' : 'bold'}
            fontySize="px14"
            color={item.isRead ? 'textSecondary' : 'dark'}
            marginTop={vs(4)}
          />

          <AppText
            title={item.content}
            fontySize="px14"
            color="textSecondary"
            marginTop={vs(4)}
            numberOfLines={2}
          />
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
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
        <Icon name="mail-unread-outline" size={ms(60)} color={colors.placeholder || '#9E9E9E'} />
        <AppText
          title="No Recent Messages"
          fontySize="px18"
          fontFamily="bold"
          color="textPrimary"
          marginTop={vs(10)}
        />
        <AppText
          title="You're all caught up! Bidder inquiries or consignment emails will appear here."
          fontySize="px14"
          color="textSecondary"
          marginTop={vs(5)}
          textAlign="center"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Recent Messages"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        showNotification={false}
      />
      <FlatList
        data={messages}
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
    alignItems: 'center',
  },
  unreadItemContainer: {
    backgroundColor: '#F5F8FF', // subtle tint for unread
  },
  avatarContainer: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    backgroundColor: '#E6E6E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
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
  },
});

export default MessagesScreen;
