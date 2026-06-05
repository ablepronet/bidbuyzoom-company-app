import React, { useCallback } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import Card from '../../../components/Card';
import AppButton from '../../../components/appButton';
import { colors } from '../../../constants';
import { ms, vs } from '../../../utils/responsive';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { routes } from '../../../navigation/route';
import { useGetPaymentCards, useDeleteCard } from '../../../services/queries/app/plans/plans';
import Loader from '../../../components/loader';

const ManageCardsScreen = () => {
  const navigation = useNavigation<any>();

  // Fetch payment cards list
  const { data: cardsData, isLoading: isListLoading } = useGetPaymentCards(1, 100);
  const deleteCardMutation = useDeleteCard();

  const handleAddCard = useCallback(() => {
    navigation.navigate(routes.addCardScreen);
  }, [navigation]);

  const handleDeleteCard = useCallback((cardId: string, last4: string) => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete the card ending in ${last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCardMutation.mutate(cardId);
          },
        },
      ]
    );
  }, [deleteCardMutation]);

  const isLoading = isListLoading || deleteCardMutation.isPending;

  return (
    <View style={styles.container}>
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
        title="Payment Card"
        showBorder={false}
        showNotification={false}
      />

      {isLoading && <Loader isLoading={isLoading} />}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Saved Cards Header */}
        <View style={styles.savedCardsHeaderRow}>
          <View style={styles.titleTextGroup}>
            <AppText title="Saved Cards" fontySize="px18" fontFamily="bold" color="textPrimary" />
            <AppText
              title="View and manage your primary payment methods."
              fontySize="px12"
              fontFamily="regular"
              color="textSecondary"
              marginTop={vs(4)}
            />
          </View>
          <TouchableOpacity style={styles.addCardBtn} onPress={handleAddCard}>
            <Icon name="add" size={ms(16)} color={colors.white} style={{ marginRight: 4 }} />
            <AppText title="Add New Card" fontySize="px12" fontFamily="bold" color="textLight" />
          </TouchableOpacity>
        </View>

        {/* Table Container Card */}
        <Card style={styles.tableCard}>
          {/* Table Headers */}
          <View style={styles.tableHeaderRow}>
            <View style={styles.colCardDetailsHeader}>
              <AppText title="CARD DETAILS" fontySize="px10" fontFamily="bold" color="textSecondary" />
            </View>
            <View style={styles.colCardholder}>
              <AppText title="CARDHOLDER" fontySize="px10" fontFamily="bold" color="textSecondary" />
            </View>
            <View style={styles.colStatus}>
              <AppText title="STATUS" fontySize="px10" fontFamily="bold" color="textSecondary" />
            </View>
            <View style={styles.colAction}>
              <AppText title="ACTION" fontySize="px10" fontFamily="bold" color="textSecondary" style={{ textAlign: 'right' }} />
            </View>
          </View>

          {/* Table Rows */}
          {!cardsData?.data || cardsData.data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <AppText title="No saved cards found" fontySize="px14" color="textSecondary" />
            </View>
          ) : (
            cardsData.data.map((card) => (
              <View key={card._id} style={styles.tableRow}>
                {/* Card Details Column */}
                <View style={styles.colCardDetails}>
                  <View style={styles.logoAndNumberRow}>
                    <View style={styles.visaLogoContainer}>
                      <AppText title={card.cardType?.toUpperCase() || 'CARD'} fontySize="px8" fontFamily="bold" color="textPrimary" style={styles.logoText} />
                    </View>
                    <View style={styles.cardInfoCol}>
                      <AppText title={`•••• ${card.lastFourDigit}`} fontySize="px12" fontFamily="bold" color="textPrimary" />
                      <AppText title={card.cardType ? card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1) : ''} fontySize="px10" color="textSecondary" marginTop={vs(2)} />
                    </View>
                  </View>
                </View>

                {/* Cardholder Column */}
                <View style={styles.colCardholder}>
                  <AppText title={card.cardHolderName || '-'} fontySize="px12" fontFamily="medium" color="textPrimary" numberOfLines={1} />
                </View>

                {/* Status Column */}
                <View style={styles.colStatus}>
                  {String(card.isDefault) === 'true' ? (
                    <View style={styles.defaultBadge}>
                      <AppText title="Default" fontySize="px10" fontFamily="bold" color="green" />
                    </View>
                  ) : (
                    <AppText title="-" fontySize="px12" color="textSecondary" style={{ marginLeft: ms(12) }} />
                  )}
                </View>

                {/* Action Column */}
                <View style={styles.colAction}>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteCard(card._id, card.lastFourDigit)}
                  >
                    <Icon name="trash-outline" size={ms(18)} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </View>
  );
};

export default ManageCardsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  scrollContent: {
    paddingHorizontal: ms(16),
    paddingBottom: vs(40),
  },
  savedCardsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: vs(15),
    marginBottom: vs(15),
    flexWrap: 'wrap',
    gap: vs(8),
  },
  titleTextGroup: {
    flex: 1,
    minWidth: '60%',
  },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: ms(12),
    paddingVertical: vs(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tableCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: vs(12),
    paddingHorizontal: ms(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(14),
    paddingHorizontal: ms(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  colCardDetailsHeader: {
    flex: 2,
  },
  colCardDetails: {
    flex: 2,
  },
  colCardholder: {
    flex: 1.5,
    paddingRight: ms(4),
  },
  colStatus: {
    flex: 1.2,
    alignItems: 'flex-start',
  },
  colAction: {
    flex: 0.8,
    alignItems: 'flex-end',
  },
  logoAndNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visaLogoContainer: {
    width: ms(32),
    height: vs(20),
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(8),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoText: {
    fontSize: ms(8),
  },
  cardInfoCol: {
    justifyContent: 'center',
  },
  defaultBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: ms(8),
    paddingVertical: vs(2),
    borderRadius: 4,
  },
  deleteBtn: {
    padding: ms(4),
  },
  emptyContainer: {
    paddingVertical: vs(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
