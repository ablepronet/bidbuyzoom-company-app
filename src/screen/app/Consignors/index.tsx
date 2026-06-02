import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { AppText } from '../../../components/AppText';
import AppCheckbox from '../../../components/AppCheckbox';
import Loader from '../../../components/loader';
import AppToast from '../../../components/toaster';
import { colors } from '../../../constants';
import { routes } from '../../../navigation/route';
import { ms, scale, vs } from '../../../utils/responsive';
import { useDebounce } from '../../../utils/debounce';
import { useGetClients, useDeleteClient, useSendClientEmail, ClientItem } from '../../../services/queries/app/client';

interface ClientCardProps {
  item: ClientItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onSendEmail: (client: ClientItem) => void;
  onView: (client: ClientItem) => void;
  onEdit: (client: ClientItem) => void;
}

const ClientCard = memo(
  ({
    item,
    isSelected,
    onToggleSelect,
    onSendEmail,
    onView,
    onEdit,
  }: ClientCardProps) => {
    const formattedDate = item.date
      ? moment(item.date).format('DD MMMM YYYY')
      : '-';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <AppCheckbox
            value={isSelected}
            onChange={() => onToggleSelect(item._id)}
          />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.row}>
            <AppText title="DATE" style={styles.labelCol} fontySize="px12" color="textSecondary" />
            <AppText title={formattedDate} style={styles.valueCol} fontySize="px14" color="textPrimary" />
          </View>

          <View style={styles.row}>
            <AppText title="ID CODE" style={styles.labelCol} fontySize="px12" color="textSecondary" />
            <AppText title={item.idCode || '-'} style={styles.valueCol} fontySize="px14" color="textPrimary" />
          </View>

          <View style={styles.row}>
            <AppText title="TYPE" style={styles.labelCol} fontySize="px12" color="textSecondary" />
            <AppText title={item.type || '-'} style={styles.valueCol} fontySize="px14" color="textPrimary" />
          </View>

          <View style={styles.row}>
            <AppText title="FIRST NAME" style={styles.labelCol} fontySize="px12" color="textSecondary" />
            <AppText title={item.firstName || '-'} style={styles.valueCol} fontySize="px14" color="textPrimary" />
          </View>

          <View style={styles.row}>
            <AppText title="LAST NAME" style={styles.labelCol} fontySize="px12" color="textSecondary" />
            <AppText title={item.lastName || '-'} style={styles.valueCol} fontySize="px14" color="textPrimary" />
          </View>

          <View style={styles.row}>
            <AppText title="PHONE NUMBER" style={styles.labelCol} fontySize="px12" color="textSecondary" />
            <AppText title={item.phone || item.cellPhone || '-'} style={styles.valueCol} fontySize="px14" color="textPrimary" />
          </View>

          <View style={styles.row}>
            <AppText title="EMAIL" style={styles.labelCol} fontySize="px12" color="textSecondary" />
            <AppText title={item.email || '-'} style={styles.valueCol} fontySize="px14" color="textPrimary" />
          </View>

          <View style={styles.row}>
            <AppText title="STATUS" style={styles.labelCol} fontySize="px12" color="textSecondary" />
            <AppText
              title={item.status}
              style={StyleSheet.flatten([
                styles.valueCol,
                item.status === 'Active'
                  ? styles.statusActive
                  : styles.statusInactive,
              ])}
              fontySize="px14"
              fontFamily="bold"
            />
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onSendEmail(item)}>
            <Icon name="mail-outline" size={ms(20)} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onView(item)}>
            <Icon name="eye-outline" size={ms(20)} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onEdit(item)}>
            <Icon name="create-outline" size={ms(20)} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
  (prev, next) =>
    prev.item === next.item &&
    prev.isSelected === next.isSelected &&
    prev.onToggleSelect === next.onToggleSelect &&
    prev.onSendEmail === next.onSendEmail &&
    prev.onView === next.onView &&
    prev.onEdit === next.onEdit,
);

const Consignors = () => {
  const navigation = useNavigation<any>();
  const deleteClientMutation = useDeleteClient();
  const sendClientEmailMutation = useSendClientEmail();

  // Search, Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 500);

  // Send Mail Modal state
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSubjectError, setEmailSubjectError] = useState('');
  const [emailMessageError, setEmailMessageError] = useState('');
  const [targetClientIds, setTargetClientIds] = useState<string[]>([]);

  // Dropdown Picker state
  const [selectConfig, setSelectConfig] = useState<{
    key: 'type' | 'status' | 'perPage';
    title: string;
    options: string[];
  } | null>(null);

  // API query
  const queryParams = useMemo(() => ({
    page: currentPage,
    perPage,
    searchItem: debouncedSearchQuery,
    type: filterType === 'All' ? '' : filterType,
    status: filterStatus === 'All' ? '' : filterStatus,
  }), [currentPage, perPage, debouncedSearchQuery, filterType, filterStatus]);

  const { data, isLoading, refetch, isRefetching } = useGetClients(queryParams);
  const clients = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.pages || 1;
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Handlers
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
  }, []);

  const handleSelectType = useCallback((type: string) => {
    setFilterType(type);
    setCurrentPage(1);
  }, []);

  const handleSelectStatus = useCallback((status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  }, []);

  const handleSelectPerPage = useCallback((val: string) => {
    setPerPage(parseInt(val, 10));
    setCurrentPage(1);
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === clients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(clients.map(c => c._id));
    }
  }, [clients, selectedIds.length]);

  const toggleSelectItem = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      'Delete Client',
      'Are you sure you want to delete this client?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClientMutation.mutateAsync(id);
              refetch();
            } catch (e) {
              console.log('Delete client failed', e);
            }
          },
        },
      ]
    );
  }, [deleteClientMutation, refetch]);

  // Export CSV Handler
  const handleExportCSV = async () => {
    if (selectedIds.length === 0) {
      AppToast.error('Please select at least one client to export');
      return;
    }

    const dataToExport = clients.filter(c => selectedIds.includes(c._id));

    const csvHeaders = 'firstName,lastName,idCode,homeAddress,homeZipCode,homeState,homeCity,propertyAddress,propertyZipCode,propertyState,propertyCity,company,phone,email,alternateEmail,paymentNotes,cellPhone,other,status,pickupFees,commission\n';

    const csvRows = dataToExport.map(c => {
      const fields = [
        c.firstName || '',
        c.lastName || '',
        c.idCode || '',
        c.homeAddress || '',
        c.homeZipCode || '',
        c.homeState || '',
        c.homeCity || '',
        c.propertyAddress || '',
        c.propertyZipCode || '',
        c.propertyState || '',
        c.propertyCity || '',
        c.companyLink || '',
        c.phone || '',
        c.email || '',
        c.alternateEmail || '',
        c.paymentNotes || '',
        c.cellPhone || '',
        String(c.other === true || String(c.other) === 'true').toUpperCase(),
        c.status || '',
        c.pickupFessCheck ? (c.pickupFessValue || '') : '',
        c.commissionCheck ? (c.commissionCheckValue || '') : '',
      ];
      return fields.map(val => {
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',');
    }).join('\n');

    const csvContent = csvHeaders + csvRows;
    const filename = `consignors_export_${Date.now()}.csv`;

    try {
      const path = `${RNFS.CachesDirectoryPath}/${filename}`;
      await RNFS.writeFile(path, csvContent, 'utf8');

      const shareOptions = {
        title: 'Export Consignors CSV',
        url: `file://${path}`,
        type: 'text/csv',
        failOnCancel: true,
      };

      const shareRes = await Share.open(shareOptions) as any;
      if (shareRes?.success || shareRes?.completed) {
        AppToast.success('Export completed successfully');
      }
    } catch (error: any) {
      if (error && error.message !== 'User did not share') {
        console.log('CSV Export failed', error);
      }
    }
  };

  // Send Email Modal Trigger
  const handleOpenSendEmailBulk = useCallback(() => {
    if (selectedIds.length === 0) {
      AppToast.error('Please select at least one client to send email');
      return;
    }
    setTargetClientIds([...selectedIds]);
    setEmailSubject('');
    setEmailMessage('');
    setEmailSubjectError('');
    setEmailMessageError('');
    setEmailModalVisible(true);
  }, [selectedIds]);

  const handleOpenSendEmailSingle = useCallback((client: ClientItem) => {
    setTargetClientIds([client._id]);
    setEmailSubject('');
    setEmailMessage('');
    setEmailSubjectError('');
    setEmailMessageError('');
    setEmailModalVisible(true);
  }, []);

  const handleSendEmailSubmit = async () => {
    let valid = true;
    if (targetClientIds.length === 0) {
      AppToast.error('Please select at least one client to send email');
      return;
    }
    if (!emailSubject.trim()) {
      setEmailSubjectError('This field is required');
      valid = false;
    } else {
      setEmailSubjectError('');
    }
    if (!emailMessage.trim()) {
      setEmailMessageError('This field is required');
      valid = false;
    } else {
      setEmailMessageError('');
    }

    if (!valid) return;

    try {
      await sendClientEmailMutation.mutateAsync({
        ids: targetClientIds,
        subject: emailSubject.trim(),
        message: emailMessage.trim(),
      });
      setEmailModalVisible(false);
      setEmailSubject('');
      setEmailMessage('');
      setTargetClientIds([]);
    } catch (error) {
      console.log('Send client email failed', error);
    }
  };

  const handleViewClient = useCallback(
    (clientItem: ClientItem) => {
      navigation.navigate(routes.clientProfileScreen, { client: clientItem });
    },
    [navigation],
  );

  const handleEditClient = useCallback(
    (clientItem: ClientItem) => {
      navigation.navigate(routes.addEditClientScreen, {
        client: clientItem,
        mode: 'edit',
      });
    },
    [navigation],
  );

  const renderCard = useCallback(
    ({ item }: { item: ClientItem }) => (
      <ClientCard
        item={item}
        isSelected={selectedIdSet.has(item._id)}
        onToggleSelect={toggleSelectItem}
        onSendEmail={handleOpenSendEmailSingle}
        onView={handleViewClient}
        onEdit={handleEditClient}
      />
    ),
    [
      handleEditClient,
      handleOpenSendEmailSingle,
      handleViewClient,
      selectedIdSet,
      toggleSelectItem,
    ],
  );

  const keyExtractor = useCallback((item: ClientItem) => item._id, []);

  const ListEmptyComponent = useMemo(
    () =>
      !isLoading ? (
        <View style={styles.emptyContainer}>
          <Icon name="people-outline" size={ms(48)} color={colors.placeholder} />
          <AppText title="No Clients Found" fontySize="px16" fontFamily="bold" marginTop={10} color="textSecondary" />
        </View>
      ) : null,
    [isLoading],
  );

  return (
    <View style={styles.container}>
      <Loader isLoading={isLoading || deleteClientMutation.isPending} />

      {/* Top Header Buttons */}
      <View style={styles.headerButtonsRow}>
        <TouchableOpacity
          style={styles.addClientBtn}
          onPress={() => navigation.navigate(routes.addEditClientScreen, { mode: 'add' })}>
          <AppText title="Add New Client" color="white" fontFamily="bold" fontySize="px14" />
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secBtn} onPress={handleOpenSendEmailBulk}>
            <AppText title="Send Email" color="textPrimary" fontySize="px12" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.secBtn} onPress={() => AppToast.success('Import initiated')}>
            <AppText title="Import" color="textPrimary" fontySize="px12" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.secBtn} onPress={handleExportCSV}>
            <AppText title="Export" color="textPrimary" fontySize="px12" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchWrapper}>
          <Icon name="search-outline" size={ms(18)} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search name, email or phone"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.dropdownsRow}>
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setSelectConfig({
              key: 'type',
              title: 'Filter Type',
              options: ['All', 'Consignors', 'Clients'],
            })}>
            <AppText title={`Filter: ${filterType}`} fontySize="px12" color="textPrimary" />
            <Icon name="chevron-down-outline" size={ms(12)} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setSelectConfig({
              key: 'status',
              title: 'Filter Status',
              options: ['All', 'Active', 'Inactive', 'Paid', 'Complete'],
            })}>
            <AppText title={`Status: ${filterStatus}`} fontySize="px12" color="textPrimary" />
            <Icon name="chevron-down-outline" size={ms(12)} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Select All Checkbox */}
      <View style={styles.selectAllRow}>
        <AppCheckbox
          value={clients.length > 0 && selectedIds.length === clients.length}
          onChange={toggleSelectAll}
          label="Select All"
        />
        {selectedIds.length > 0 && (
          <AppText title={`${selectedIds.length} items selected`} color="primary" fontySize="px12" fontFamily="bold" />
        )}
      </View>

      {/* Clients FlatList */}
      <FlatList
        data={clients}
        keyExtractor={keyExtractor}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={ListEmptyComponent}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        removeClippedSubviews
      />

      {/* Pagination Footer */}
      <View style={styles.paginationContainer}>
        <View style={styles.pageInfoRow}>
          <AppText
            title={`${(currentPage - 1) * perPage + 1} - ${Math.min(currentPage * perPage, totalCount)} of ${totalCount}`}
            fontySize="px12"
            color="textSecondary"
          />

          <View style={styles.pageControls}>
            <TouchableOpacity
              disabled={currentPage <= 1}
              style={[styles.pageBtn, currentPage <= 1 && styles.disabledPageBtn]}
              onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
              <Icon name="chevron-back-outline" size={ms(16)} color={currentPage <= 1 ? colors.border : colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.currentPageIndicator}>
              <AppText title={`${currentPage}`} color="white" fontFamily="bold" fontySize="px12" />
            </View>

            <TouchableOpacity
              disabled={currentPage >= totalPages}
              style={[styles.pageBtn, currentPage >= totalPages && styles.disabledPageBtn]}
              onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>
              <Icon name="chevron-forward-outline" size={ms(16)} color={currentPage >= totalPages ? colors.border : colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.perPageDropdown}
            onPress={() => setSelectConfig({
              key: 'perPage',
              title: 'Items per page',
              options: ['5', '10', '20', '50'],
            })}>
            <AppText title={`Per Page: ${perPage}`} fontySize="px12" color="textPrimary" />
            <Icon name="chevron-down-outline" size={ms(10)} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Options Picker Modal */}
      <Modal
        visible={!!selectConfig}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectConfig(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectConfig(null)}>
          <Pressable style={styles.optionSheet}>
            <AppText
              title={selectConfig?.title}
              fontySize="px18"
              fontFamily="bold"
              marginBottom={vs(12)}
              color="primary"
            />
            <ScrollView keyboardShouldPersistTaps="handled">
              {selectConfig?.options.map((option, index) => {
                const isSelected =
                  selectConfig.key === 'type' ? filterType === option :
                    selectConfig.key === 'status' ? filterStatus === option :
                      perPage.toString() === option;

                return (
                  <TouchableOpacity
                    key={`${selectConfig.key}-${option}-${index}`}
                    activeOpacity={0.8}
                    style={styles.optionRow}
                    onPress={() => {
                      if (selectConfig.key === 'type') handleSelectType(option);
                      if (selectConfig.key === 'status') handleSelectStatus(option);
                      if (selectConfig.key === 'perPage') handleSelectPerPage(option);
                      setSelectConfig(null);
                    }}>
                    <AppText
                      title={option}
                      fontySize="px16"
                      color={isSelected ? 'primary' : 'textPrimary'}
                      fontFamily={isSelected ? 'bold' : 'regular'}
                    />
                    {isSelected && (
                      <Icon name="checkmark" size={ms(20)} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Send Mail Modal Popup */}
      <Modal
        visible={emailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEmailModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setEmailModalVisible(false)}>
            <Pressable style={styles.emailSheet} onPress={e => e.stopPropagation()}>
              <View style={styles.emailHeader}>
                <AppText title="Send Mail" color="white" fontFamily="bold" fontySize="px16" />
                <TouchableOpacity onPress={() => setEmailModalVisible(false)}>
                  <Icon name="close" size={ms(22)} color="white" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.emailForm}
                contentContainerStyle={styles.emailFormContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <View style={styles.fieldContainer}>
                  <AppText title="Subject" fontFamily="medium" fontySize="px14" marginBottom={6} color="textPrimary" />
                  <View style={[styles.modalInputWrapper, emailSubjectError ? styles.errorBorder : null]}>
                    <TextInput
                      value={emailSubject}
                      onChangeText={t => {
                        setEmailSubject(t);
                        if (t.trim()) setEmailSubjectError('');
                      }}
                      placeholder="Enter Subject"
                      placeholderTextColor={colors.textSecondary}
                      style={styles.modalInput}
                    />
                  </View>
                  {emailSubjectError ? (
                    <AppText title={emailSubjectError} color="error" fontySize="px12" marginTop={4} />
                  ) : null}
                </View>

                <View style={styles.fieldContainer}>
                  <AppText title="Message" fontFamily="medium" fontySize="px14" marginBottom={6} color="textPrimary" />
                  <TextInput
                    value={emailMessage}
                    onChangeText={t => {
                      setEmailMessage(t);
                      if (t.trim()) setEmailMessageError('');
                    }}
                    multiline
                    numberOfLines={4}
                    placeholder="Enter Message"
                    textAlignVertical="top"
                    placeholderTextColor={colors.textSecondary}
                    style={[
                      styles.modalInput,
                      styles.modalInputWrapper,
                      emailMessageError ? styles.errorBorder : null,
                      {
                        minHeight: vs(100),
                        textAlignVertical: 'top',
                        paddingTop: vs(10),
                        paddingBottom: vs(10),
                      }
                    ]}
                  />
                  {emailMessageError ? (
                    <AppText title={emailMessageError} color="error" fontySize="px12" marginTop={4} />
                  ) : null}
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.modalSubmitBtn}
                  disabled={sendClientEmailMutation.isPending}
                  onPress={handleSendEmailSubmit}>
                  {sendClientEmailMutation.isPending ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <AppText title="Submit" color="white" fontFamily="bold" fontySize="px16" />
                  )}
                </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

export default Consignors;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerButtonsRow: {
    padding: ms(16),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addClientBtn: {
    backgroundColor: colors.primary,
    paddingVertical: vs(12),
    borderRadius: scale(6),
    alignItems: 'center',
    marginBottom: vs(10),
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(8),
  },
  secBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(6),
    paddingVertical: vs(8),
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  filtersContainer: {
    paddingHorizontal: ms(16),
    paddingTop: vs(12),
    paddingBottom: vs(8),
    backgroundColor: colors.white,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(6),
    backgroundColor: colors.white,
    paddingHorizontal: scale(10),
    height: vs(40),
    marginBottom: vs(10),
  },
  searchIcon: {
    marginRight: scale(6),
  },
  searchInput: {
    flex: 1,
    color: colors.dark,
    fontSize: scale(14),
    padding: 0,
  },
  dropdownsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(10),
  },
  filterDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(6),
    paddingHorizontal: scale(10),
    height: vs(36),
    backgroundColor: colors.white,
  },
  selectAllRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ms(16),
    paddingVertical: vs(10),
    backgroundColor: '#F3F4F6',
  },
  listContent: {
    padding: ms(16),
    paddingBottom: vs(80),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: vs(16),
    padding: ms(16),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: vs(8),
  },
  cardContent: {
    gap: vs(8),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelCol: {
    flex: 1.2,
  },
  valueCol: {
    flex: 2,
    textAlign: 'right',
  },
  statusActive: {
    color: colors.green,
  },
  statusInactive: {
    color: colors.error,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: vs(12),
    paddingTop: vs(10),
  },
  actionBtn: {
    padding: scale(6),
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: ms(16),
    paddingVertical: vs(12),
  },
  pageInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  pageBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(4),
    width: scale(28),
    height: scale(28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledPageBtn: {
    opacity: 0.5,
  },
  currentPageIndicator: {
    backgroundColor: colors.primary,
    borderRadius: scale(4),
    width: scale(28),
    height: scale(28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  perPageDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(4),
    paddingHorizontal: scale(8),
    height: scale(28),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(50),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: scale(16),
    borderTopRightRadius: scale(16),
    maxHeight: vs(300),
    padding: ms(20),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emailSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: scale(16),
    borderTopRightRadius: scale(16),
    maxHeight: '82%',
    width: '100%',
    overflow: 'hidden',
  },
  emailHeader: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ms(20),
    paddingVertical: vs(16),
  },
  emailForm: {
    flexGrow: 0,
  },
  emailFormContent: {
    padding: ms(20),
    paddingBottom: vs(28),
  },
  fieldContainer: {
    marginBottom: vs(14),
  },
  modalInputWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(5),
    paddingHorizontal: scale(12),
    minHeight: vs(42),
    justifyContent: 'center',
  },
  modalInput: {
    color: colors.textPrimary,
    fontSize: scale(14),
    padding: 0,
  },
  modalSubmitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: vs(12),
    borderRadius: scale(6),
    alignItems: 'center',
    marginTop: vs(10),
  },
  errorBorder: {
    borderColor: colors.error,
  },
});
