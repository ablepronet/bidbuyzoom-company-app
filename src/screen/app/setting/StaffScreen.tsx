import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import Card from '../../../components/Card';
import Loader from '../../../components/loader';
import { colors } from '../../../constants';
import { routes } from '../../../navigation/route';
import { ms, scale, vs } from '../../../utils/responsive';
import { useDebounce } from '../../../utils/debounce';
import { useGetStaff, useUpdateStaff, StaffItem } from '../../../services/queries/app/staff';

interface StaffCardProps {
  item: StaffItem;
  onEdit: (item: StaffItem) => void;
  onToggleStatus: (item: StaffItem, value: boolean) => void;
}

const StaffCard = React.memo(({ item, onEdit, onToggleStatus }: StaffCardProps) => {
  const formattedDate = item.createdAt ? moment(item.createdAt).format('MMM D, YYYY') : '-';
  
  // Create avatar initials
  const initials = useMemo(() => {
    const first = item.firstName?.charAt(0) || '';
    const last = item.lastName?.charAt(0) || '';
    return (first + last).toLowerCase();
  }, [item.firstName, item.lastName]);

  // Count active permissions
  const activePermissionsCount = useMemo(() => {
    if (!item.permissions) return 0;
    return Object.values(item.permissions).filter(Boolean).length;
  }, [item.permissions]);

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <AppText title={initials} fontySize="px14" fontFamily="bold" color="primary" style={styles.avatarText} />
          </View>
          <View style={styles.headerInfo}>
            <AppText title={`${item.firstName} ${item.lastName}`} fontySize="px14" fontFamily="bold" color="textPrimary" />
            <AppText title={`Started ${formattedDate}`} fontySize="px12" color="textSecondary" marginTop={vs(2)} />
          </View>
        </View>
        <View style={[styles.statusBadge, item.isActive ? styles.statusActiveBg : styles.statusInactiveBg]}>
          <View style={[styles.statusDot, item.isActive ? styles.statusActiveDot : styles.statusInactiveDot]} />
          <AppText title={item.isActive ? 'Active' : 'Inactive'} fontySize="px12" fontFamily="medium" color={item.isActive ? 'successToastText' : 'textSecondary'} />
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <AppText title="Role / Position" fontySize="px12" color="textSecondary" style={styles.labelCol} />
          <AppText title={item.position || '-'} fontySize="px14" fontFamily="medium" color="textPrimary" style={styles.valueCol} />
        </View>

        <View style={styles.infoRow}>
          <AppText title="Contact" fontySize="px12" color="textSecondary" style={styles.labelCol} />
          <View style={styles.contactCol}>
            <View style={styles.contactItem}>
              <Icon name="mail-outline" size={ms(14)} color={colors.textSecondary} style={styles.contactIcon} />
              <AppText title={item.email} fontySize="px14" color="textPrimary" numberOfLines={1} style={styles.contactText} />
            </View>
            <View style={[styles.contactItem, { marginTop: vs(4) }]}>
              <Icon name="call-outline" size={ms(14)} color={colors.textSecondary} style={styles.contactIcon} />
              <AppText title={item.phone || '-'} fontySize="px14" color="textPrimary" style={styles.contactText} />
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <AppText title="Portal Access" fontySize="px12" color="textSecondary" style={styles.labelCol} />
          <View style={[styles.portalBadge, item.hasLogin ? styles.portalActiveBg : styles.portalInactiveBg]}>
            <View style={[styles.portalDot, item.hasLogin ? styles.portalActiveDot : styles.portalInactiveDot]} />
            <AppText title={item.hasLogin ? 'Enabled' : 'Disabled'} fontySize="px12" fontFamily="medium" color={item.hasLogin ? 'primary' : 'textSecondary'} />
          </View>
        </View>

        <View style={styles.infoRow}>
          <AppText title="Permissions" fontySize="px12" color="textSecondary" style={styles.labelCol} />
          <TouchableOpacity activeOpacity={0.7} onPress={() => onEdit(item)}>
            <AppText title={`${activePermissionsCount} permissions`} fontySize="px14" fontFamily="bold" color="primary" style={styles.underlineText} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardActions}>
        <View style={styles.actionLeft}>
          <AppText title="Active Status" fontySize="px12" color="textSecondary" style={{ marginRight: 8 }} />
          <Switch
            value={item.isActive}
            onValueChange={(val) => onToggleStatus(item, val)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
            style={styles.switchStyle}
          />
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
          <Icon name="pencil" size={ms(16)} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </Card>
  );
});

const StaffScreen = () => {
  const navigation = useNavigation<any>();
  const updateStaffMutation = useUpdateStaff();

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [perPageModalVisible, setPerPageModalVisible] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 500);

  // Params
  const queryParams = useMemo(() => {
    const statusParam = filterStatus === 'All' ? '' : filterStatus === 'Active';
    return {
      page: currentPage,
      perPage,
      searchItem: debouncedSearchQuery,
      status: statusParam,
    };
  }, [currentPage, perPage, debouncedSearchQuery, filterStatus]);

  const { data, isLoading, refetch, isRefetching } = useGetStaff(queryParams);

  const staffList = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.pages || 1;

  // Handlers
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
  }, []);

  const handleSelectStatus = useCallback((status: 'All' | 'Active' | 'Inactive') => {
    setFilterStatus(status);
    setCurrentPage(1);
    setStatusModalVisible(false);
  }, []);

  const handleSelectPerPage = useCallback((val: string) => {
    setPerPage(parseInt(val, 10));
    setCurrentPage(1);
    setPerPageModalVisible(false);
  }, []);

  const handleEdit = useCallback((item: StaffItem) => {
    navigation.navigate(routes.addEditStaffScreen, { staff: item, mode: 'edit' });
  }, [navigation]);

  const handleToggleStatus = useCallback(async (item: StaffItem, value: boolean) => {
    try {
      // Send the entire object with updated isActive field
      const updatedPayload = {
        ...item,
        id: item._id,
        isActive: value,
        date: item.date ? item.date.split('T')[0] : moment().format('YYYY-MM-DD'),
        birthDate: item.birthDate ? item.birthDate.split('T')[0] : moment().format('YYYY-MM-DD'),
      };
      await updateStaffMutation.mutateAsync(updatedPayload);
    } catch (e) {
      console.log('Failed to update staff status', e);
    }
  }, [updateStaffMutation]);

  const renderCard = useCallback(({ item }: { item: StaffItem }) => (
    <StaffCard
      item={item}
      onEdit={handleEdit}
      onToggleStatus={handleToggleStatus}
    />
  ), [handleEdit, handleToggleStatus]);

  const keyExtractor = useCallback((item: StaffItem) => item._id, []);

  const ListEmptyComponent = useMemo(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="people-outline" size={ms(48)} color={colors.placeholder} />
        <AppText title="No Staff Found" fontySize="px16" fontFamily="bold" marginTop={10} color="textSecondary" />
      </View>
    );
  }, [isLoading]);

  return (
    <View style={styles.container}>
      <Loader isLoading={isLoading || updateStaffMutation.isPending} />

      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
        title="Staff"
        showBorder={false}
      />

      <FlatList
        data={staffList}
        keyExtractor={keyExtractor}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Top Toolbar */}
            <View style={styles.searchRow}>
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
            </View>

            <View style={styles.filterActionRow}>
              <TouchableOpacity
                style={styles.filterDropdown}
                activeOpacity={0.8}
                onPress={() => setStatusModalVisible(true)}>
                <AppText title={`Status: ${filterStatus}`} fontySize="px14" color="textPrimary" />
                <Icon name="chevron-down-outline" size={ms(14)} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.addStaffBtn}
                onPress={() => navigation.navigate(routes.addEditStaffScreen, { mode: 'add' })}>
                <AppText title="+ Add New Staff" color="white" fontFamily="bold" fontySize="px14" />
              </TouchableOpacity>
            </View>

            {/* Showing items count */}
            <AppText
              title={`Showing ${Math.min((currentPage - 1) * perPage + 1, totalCount)} - ${Math.min(currentPage * perPage, totalCount)} of ${totalCount} staff members`}
              fontySize="px12"
              color="textSecondary"
              marginTop={vs(10)}
              marginBottom={vs(10)}
            />
          </View>
        }
        ListFooterComponent={
          staffList.length > 0 ? (
            <View style={styles.listFooter}>
              {/* Pagination controls */}
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  disabled={currentPage <= 1}
                  style={[styles.pageBtn, currentPage <= 1 && styles.disabledPageBtn]}
                  onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
                  <Icon name="chevron-back" size={ms(16)} color={currentPage <= 1 ? colors.border : colors.textPrimary} />
                </TouchableOpacity>

                <View style={styles.currentPageBadge}>
                  <AppText title={`${currentPage}`} color="white" fontFamily="bold" fontySize="px12" />
                </View>

                <TouchableOpacity
                  disabled={currentPage >= totalPages}
                  style={[styles.pageBtn, currentPage >= totalPages && styles.disabledPageBtn]}
                  onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>
                  <Icon name="chevron-forward" size={ms(16)} color={currentPage >= totalPages ? colors.border : colors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.perPageSelector}
                  activeOpacity={0.8}
                  onPress={() => setPerPageModalVisible(true)}>
                  <AppText title={`${perPage} Per Page`} fontySize="px12" color="textPrimary" />
                  <Icon name="chevron-down-outline" size={ms(10)} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>

              {/* Marketing/Branding feature cards */}
              <View style={styles.marketingContainer}>
                <Card style={styles.marketingCard}>
                  <View style={styles.marketingIconWrapper}>
                    <Icon name="people" size={ms(20)} color={colors.primary} />
                  </View>
                  <AppText title="Easy Management" fontySize="px14" fontFamily="bold" color="textPrimary" marginTop={8} />
                  <AppText title="Quickly add, edit or manage staff accounts." fontySize="px12" color="textSecondary" marginTop={4} textAlign="center" />
                </Card>

                <Card style={styles.marketingCard}>
                  <View style={styles.marketingIconWrapper}>
                    <Icon name="shield-checkmark" size={ms(20)} color={colors.primary} />
                  </View>
                  <AppText title="Secure Access" fontySize="px14" fontFamily="bold" color="textPrimary" marginTop={8} />
                  <AppText title="Control portal access and permission levels." fontySize="px12" color="textSecondary" marginTop={4} textAlign="center" />
                </Card>

                <Card style={styles.marketingCard}>
                  <View style={styles.marketingIconWrapper}>
                    <Icon name="analytics" size={ms(20)} color={colors.primary} />
                  </View>
                  <AppText title="Activity Visibility" fontySize="px14" fontFamily="bold" color="textPrimary" marginTop={8} />
                  <AppText title="Track staff status and access in real time." fontySize="px12" color="textSecondary" marginTop={4} textAlign="center" />
                </Card>
              </View>
            </View>
          ) : null
        }
      />

      {/* Filter Status Modal */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setStatusModalVisible(false)}>
          <Pressable style={styles.optionSheet}>
            <AppText title="Select Status" fontySize="px18" fontFamily="bold" color="primary" marginBottom={12} />
            <ScrollView keyboardShouldPersistTaps="handled">
              {(['All', 'Active', 'Inactive'] as const).map((status, index) => (
                <TouchableOpacity
                  key={`status-${status}-${index}`}
                  activeOpacity={0.8}
                  style={styles.optionRow}
                  onPress={() => handleSelectStatus(status)}>
                  <AppText
                    title={status}
                    fontySize="px16"
                    color={filterStatus === status ? 'primary' : 'textPrimary'}
                    fontFamily={filterStatus === status ? 'bold' : 'regular'}
                  />
                  {filterStatus === status && <Icon name="checkmark" size={ms(20)} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Per Page Modal */}
      <Modal
        visible={perPageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPerPageModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPerPageModalVisible(false)}>
          <Pressable style={styles.optionSheet}>
            <AppText title="Items per page" fontySize="px18" fontFamily="bold" color="primary" marginBottom={12} />
            <ScrollView keyboardShouldPersistTaps="handled">
              {['5', '10', '20', '50'].map((val, index) => (
                <TouchableOpacity
                  key={`perPage-${val}-${index}`}
                  activeOpacity={0.8}
                  style={styles.optionRow}
                  onPress={() => handleSelectPerPage(val)}>
                  <AppText
                    title={val}
                    fontySize="px16"
                    color={perPage.toString() === val ? 'primary' : 'textPrimary'}
                    fontFamily={perPage.toString() === val ? 'bold' : 'regular'}
                  />
                  {perPage.toString() === val && <Icon name="checkmark" size={ms(20)} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default StaffScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: ms(16),
    paddingBottom: vs(40),
  },
  listHeader: {
    marginBottom: vs(10),
  },
  searchRow: {
    marginBottom: vs(10),
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(6),
    backgroundColor: colors.white,
    paddingHorizontal: scale(10),
    height: vs(44),
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
  filterActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: scale(10),
  },
  filterDropdown: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(6),
    paddingHorizontal: scale(12),
    height: vs(40),
    backgroundColor: colors.white,
  },
  addStaffBtn: {
    flex: 1.5,
    backgroundColor: colors.primary,
    height: vs(40),
    borderRadius: scale(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: vs(16),
    padding: ms(16),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: ms(8),
  },
  avatar: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(10),
  },
  avatarText: {
    textTransform: 'uppercase',
  },
  headerInfo: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: vs(3),
    borderRadius: scale(4),
  },
  statusDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    marginRight: 6,
  },
  statusActiveBg: {
    backgroundColor: '#DEF7EC',
  },
  statusActiveDot: {
    backgroundColor: '#31C25D',
  },
  statusInactiveBg: {
    backgroundColor: '#F3F4F6',
  },
  statusInactiveDot: {
    backgroundColor: '#9CA3AF',
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: vs(12),
  },
  cardContent: {
    gap: vs(10),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  labelCol: {
    width: ms(110),
  },
  valueCol: {
    flex: 1,
  },
  contactCol: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    marginRight: 6,
  },
  contactText: {
    flex: 1,
  },
  portalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: vs(2),
    borderRadius: scale(4),
  },
  portalDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    marginRight: 6,
  },
  portalActiveBg: {
    backgroundColor: '#FEE2E2',
  },
  portalActiveDot: {
    backgroundColor: colors.primary,
  },
  portalInactiveBg: {
    backgroundColor: '#F3F4F6',
  },
  portalInactiveDot: {
    backgroundColor: '#9CA3AF',
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchStyle: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  editBtn: {
    width: ms(32),
    height: ms(32),
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  listFooter: {
    marginTop: vs(10),
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
    marginBottom: vs(20),
  },
  pageBtn: {
    width: ms(32),
    height: ms(32),
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  disabledPageBtn: {
    opacity: 0.5,
  },
  currentPageBadge: {
    width: ms(32),
    height: ms(32),
    borderRadius: scale(6),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perPageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(6),
    paddingHorizontal: scale(10),
    height: ms(32),
    backgroundColor: colors.white,
  },
  marketingContainer: {
    gap: vs(12),
    marginTop: vs(10),
  },
  marketingCard: {
    alignItems: 'center',
    padding: ms(16),
    borderRadius: scale(10),
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  marketingIconWrapper: {
    width: ms(40),
    height: ms(40),
    borderRadius: scale(8),
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(40),
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
});
