import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import AppToast from '../../../components/toaster';
import Loader from '../../../components/loader';
import { colors } from '../../../constants';
import { ms, scale, vs } from '../../../utils/responsive';
import { lotLabel, PendingBid, useDecideBid, useGetPendingBids } from '../../../services/queries/app/pendingBids';

const money = (n?: number) =>
  `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/** Bids above the approval limit: approve or reject them (the bidder is notified either way). */
const PendingBidsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const saleId: string | undefined = route.params?.saleId;
  const saleTitle: string | undefined = route.params?.saleTitle;

  const { data: bids = [], isLoading, refetch, isRefetching } = useGetPendingBids(saleId);
  const decide = useDecideBid();
  const [busyId, setBusyId] = useState<string | null>(null);

  const runDecision = async (bid: PendingBid, action: 'approve' | 'reject') => {
    setBusyId(bid._id);
    try {
      const res = await decide.mutateAsync({ transactionId: bid._id, action });
      AppToast.success(res?.message || (action === 'approve' ? 'Bid approved' : 'Bid rejected'));
    } catch (error: any) {
      AppToast.error(error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Could not update the bid.');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDecision = (bid: PendingBid, action: 'approve' | 'reject') => {
    const who = `${bid.bidderId?.firstName || ''} ${bid.bidderId?.lastName || ''}`.trim() || 'this bidder';
    Alert.alert(
      action === 'approve' ? 'Approve bid?' : 'Reject bid?',
      `${money(bid.amount)} from ${who} on ${lotLabel(bid.catalogId)}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'approve' ? 'Approve' : 'Reject',
          style: action === 'approve' ? 'default' : 'destructive',
          onPress: () => runDecision(bid, action),
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: PendingBid }) => {
    const busy = busyId === item._id;
    const bidder = item.bidderId;
    const sale: any = item.saleId;
    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <AppText title={lotLabel(item.catalogId)} fontFamily="bold" fontySize="px14" color="textPrimary" style={{ flex: 1 }} />
          <AppText title={moment(item.createdAt).fromNow()} fontySize="px12" color="textSecondary" />
        </View>
        {!saleId && (sale?.title || sale?.name) ? (
          <AppText title={sale.title || sale.name} fontySize="px12" color="textSecondary" marginTop={vs(2)} />
        ) : null}

        <View style={[styles.rowBetween, { marginTop: vs(10) }]}>
          <View style={{ flex: 1 }}>
            <AppText title={`${bidder?.firstName || ''} ${bidder?.lastName || ''}`.trim() || 'Bidder'} fontFamily="medium" fontySize="px14" />
            {bidder?.email ? <AppText title={bidder.email} fontySize="px12" color="textSecondary" /> : null}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <AppText title={money(item.amount)} fontFamily="bold" fontySize="px18" color="primary" />
            <AppText title={item.isAutoBid ? 'Max bid' : 'Bid'} fontySize="px12" color="textSecondary" />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => confirmDecision(item, 'reject')}
            disabled={busy}
            activeOpacity={0.7}
          >
            <Icon name="close-circle-outline" size={ms(18)} color={colors.red} />
            <AppText title="Reject" fontFamily="bold" fontySize="px14" color="red" marginLeft={scale(6)} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => confirmDecision(item, 'approve')}
            disabled={busy}
            activeOpacity={0.7}
          >
            {busy ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon name="checkmark-circle-outline" size={ms(18)} color={colors.white} />
                <AppText title="Approve" fontFamily="bold" fontySize="px14" color="white" marginLeft={scale(6)} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () =>
    isLoading ? (
      <View style={styles.empty}>
        <Loader isLoading />
      </View>
    ) : (
      <View style={styles.empty}>
        <Icon name="checkmark-done-circle-outline" size={ms(60)} color={colors.placeholder} />
        <AppText title="No bids waiting" fontySize="px18" fontFamily="bold" color="textPrimary" marginTop={vs(10)} />
        <AppText
          title="Bids above your approval limit will appear here."
          fontySize="px14"
          color="textSecondary"
          marginTop={vs(5)}
          textAlign="center"
        />
      </View>
    );

  return (
    <View style={styles.container}>
      <AppHeader
        title={saleTitle ? `Pending Bids · ${saleTitle}` : 'Pending Bids'}
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        showNotification={false}
      />
      <FlatList
        data={bids}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  list: {
    flexGrow: 1,
    padding: ms(16),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: ms(12),
    padding: ms(14),
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: scale(10),
    marginTop: vs(14),
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(8),
    paddingVertical: vs(10),
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: colors.red,
    backgroundColor: colors.white,
  },
  approveBtn: {
    backgroundColor: colors.green,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ms(20),
  },
});

export default PendingBidsScreen;
